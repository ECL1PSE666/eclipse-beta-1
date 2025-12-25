-- SUPABASE SETUP SCRIPT FOR ECLIPSE (REPAIR & STABILIZE VERSION)

-- 1. Create Profiles table (as a baseline)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT UNIQUE,
    handle TEXT UNIQUE,
    avatar_url TEXT,
    banner_url TEXT,
    description TEXT,
    subscriptions TEXT[] DEFAULT '{}',
    playlists JSONB DEFAULT '[]',
    videos_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- REPAIR: Ensure the 'description' column exists if the table was created previously without it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='profiles' AND column_name='description') THEN
        ALTER TABLE public.profiles ADD COLUMN description TEXT;
    END IF;
END $$;

-- 2. Create Videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    duration TEXT DEFAULT '0:00',
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID REFERENCES public.videos ON DELETE CASCADE,
    author TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES public.comments ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Community Posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    likes INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- 6. Create Public Policies (Using DROP POLICY IF EXISTS to avoid conflicts)

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Videos
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON public.videos;
CREATE POLICY "Videos are viewable by everyone" ON public.videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can upload videos" ON public.videos;
CREATE POLICY "Auth users can upload videos" ON public.videos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own videos" ON public.videos;
CREATE POLICY "Users can update own videos" ON public.videos FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete own videos" ON public.videos;
CREATE POLICY "Users can delete own videos" ON public.videos FOR DELETE USING (auth.uid() IS NOT NULL);

-- Comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can post comments" ON public.comments;
CREATE POLICY "Auth users can post comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Community Posts
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.community_posts;
CREATE POLICY "Posts are viewable by everyone" ON public.community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can create posts" ON public.community_posts;
CREATE POLICY "Auth users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 7. AUTO-PROFILE CREATION TRIGGER (REFINED)
-- This function automatically creates a profile record when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  final_name TEXT;
  final_handle TEXT;
BEGIN
  final_name := COALESCE(new.raw_user_meta_data->>'display_name', 'User ' || substring(new.id::text from 1 for 8));
  final_handle := COALESCE(new.raw_user_meta_data->>'handle', '@user' || substring(new.id::text from 1 for 8));

  -- Insert profile, if it already exists (unlikely for new user but safe), do nothing
  INSERT INTO public.profiles (id, name, handle, avatar_url, banner_url, description)
  VALUES (
    new.id,
    final_name,
    final_handle,
    'https://picsum.photos/seed/' || new.id || '/200/200',
    'https://picsum.photos/seed/' || new.id || 'banner/1500/250',
    'No description yet.'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    handle = EXCLUDED.handle;
    
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error or just fall back gracefully to avoid blocking auth
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STORAGE BUCKETS
-- Please create the following PUBLIC buckets in your Supabase Dashboard:
-- 1. videos
-- 2. thumbnails
-- 3. avatars
-- 4. banners
-- 5. posts_images
