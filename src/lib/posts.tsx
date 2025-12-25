"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface PostComment {
    id: string;
    author: string;
    authorAvatar: string;
    content: string;
    date: string;
    likes: number;
    replies: PostComment[];
}

export interface Post {
    id: string;
    author: string;
    authorAvatar: string;
    content: string;
    hasImage: boolean;
    imageUrl?: string;
    date: string;
    likes: number;
    reposts: number;
    comments: PostComment[];
}

interface PostsContextType {
    posts: Post[];
    addPost: (data: any, file?: File) => Promise<string | null>;
    togglePostLike: (postId: string) => Promise<void>;
    repostPost: (postId: string, user: { name: string, avatar: string }) => Promise<void>;
    addPostComment: (postId: string, author: string, avatar: string, content: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: React.ReactNode }) {
    const [posts, setPosts] = useState<Post[]>([]);

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('community_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
            return;
        }

        if (data) {
            const transformedPosts = data.map(p => ({
                id: p.id,
                author: p.author_name,
                authorAvatar: p.author_avatar || `https://picsum.photos/seed/${p.author_name}/100/100`,
                content: p.content,
                hasImage: !!p.image_url,
                imageUrl: p.image_url,
                date: p.created_at,
                likes: p.likes || 0,
                reposts: p.reposts || 0,
                comments: [] // Simple for now
            }));
            setPosts(transformedPosts);
        }
    };

    useEffect(() => {
        fetchPosts();

        const subscription = supabase
            .channel('public:community_posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => {
                fetchPosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const addPost = async (data: any, file?: File) => {
        let imageUrl = null;
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('posts_images')
                .upload(fileName, file);

            if (!uploadError) {
                const { data: urlData } = supabase.storage.from('posts_images').getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            }
        }

        const { data: result, error } = await supabase
            .from('community_posts')
            .insert({
                author_name: data.author,
                author_avatar: data.authorAvatar,
                content: data.content,
                image_url: imageUrl
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding post:', error);
            return null;
        }
        return result.id;
    };

    const togglePostLike = async (postId: string) => {
        const { data } = await supabase.from('community_posts').select('likes').eq('id', postId).single();
        if (data) {
            await supabase.from('community_posts').update({ likes: data.likes + 1 }).eq('id', postId);
        }
    };

    const repostPost = async (postId: string, user: { name: string, avatar: string }) => {
        const original = posts.find(p => p.id === postId);
        if (!original) return;

        await addPost({
            author: user.name,
            authorAvatar: user.avatar,
            content: `Reposted from @${original.author}: ${original.content}`
        });

        const { data } = await supabase.from('community_posts').select('reposts').eq('id', postId).single();
        if (data) {
            await supabase.from('community_posts').update({ reposts: data.reposts + 1 }).eq('id', postId);
        }
    };

    const addPostComment = async (postId: string, author: string, avatar: string, content: string) => {
        // Shared comments table or separate? For now let's just use the shared one with an identifier
        await supabase.from('comments').insert({
            video_id: postId, // Using postId as videoId for now or update schema
            author,
            author_avatar: avatar,
            content
        });
    };

    const deletePost = async (postId: string) => {
        await supabase.from('community_posts').delete().eq('id', postId);
    };

    return (
        <PostsContext.Provider value={{
            posts, addPost, togglePostLike, repostPost, addPostComment, deletePost
        }}>
            {children}
        </PostsContext.Provider>
    );
}

export function usePosts() {
    const context = useContext(PostsContext);
    if (!context) throw new Error("usePosts must be used within PostsProvider");
    return context;
}
