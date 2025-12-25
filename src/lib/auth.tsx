"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface Playlist {
    id: string;
    title: string;
    description: string;
    videoIds: string[];
    dateCreated: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    banner: string;
    handle: string;
    description: string;
    subscriptions: string[];
    history: string[];
    playlists: Playlist[];
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password?: string) => Promise<{ success: boolean, error?: string }>;
    register: (email: string, name: string, handle: string, password?: string) => Promise<{ success: boolean, error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    toggleSubscription: (channelName: string) => Promise<void>;
    addToHistory: (videoId: string) => Promise<void>;
    clearHistory: () => Promise<void>;
    createPlaylist: (title: string, description: string) => Promise<void>;
    deletePlaylist: (playlistId: string) => Promise<void>;
    addToPlaylist: (playlistId: string, videoId: string) => Promise<void>;
    removeFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;
    isAuthenticated: boolean;
    isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Fetch profile data for a user ID
    const fetchProfile = async (id: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            // PGRST116 means no row found
            if (error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }
            return null;
        }

        if (data) {
            return {
                id: data.id,
                name: data.name,
                email: '', // Email from auth session mostly
                avatar: data.avatar_url || `https://picsum.photos/seed/${data.id}/200/200`,
                banner: data.banner_url || `https://picsum.photos/seed/${data.id}banner/1200/400`,
                handle: data.handle || `@${data.id.substring(0, 8)}`,
                description: data.description || "No description yet.",
                subscriptions: data.subscriptions || [],
                history: data.history || [],
                playlists: data.playlists || [],
            } as User;
        }
        return null;
    };

    const createProfileRecord = async (user: any) => {
        const name = user.user_metadata?.display_name || 'User ' + user.id.substring(0, 8);
        const handle = user.user_metadata?.handle || '@user' + user.id.substring(0, 8);

        const { error } = await supabase.from('profiles').insert({
            id: user.id,
            name,
            handle,
            avatar_url: `https://picsum.photos/seed/${user.id}/200/200`,
            banner_url: `https://picsum.photos/seed/${user.id}banner/1500/250`,
            description: "No description yet.",
        });

        if (error) {
            console.error('Error creating profile record:', error);
            return null;
        }

        return fetchProfile(user.id);
    };

    useEffect(() => {
        // Handle session recovery
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                let profile = await fetchProfile(session.user.id);
                if (!profile) {
                    profile = await createProfileRecord(session.user);
                }
                if (profile) {
                    setUser({ ...profile, email: session.user.email || '' });
                }
            }
            setIsLoaded(true);
        };

        initSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                let profile = await fetchProfile(session.user.id);
                // If profile missing (e.g. older user or trigger delay), try creating it
                if (!profile) {
                    // Brief delay to allow trigger
                    await new Promise(r => setTimeout(r, 1000));
                    profile = await fetchProfile(session.user.id);

                    if (!profile) {
                        profile = await createProfileRecord(session.user);
                    }
                }

                if (profile) {
                    setUser({ ...profile, email: session.user.email || '' });
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password?: string): Promise<{ success: boolean, error?: string }> => {
        if (!password) return { success: false, error: "Password required." };

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return { success: false, error: error.message };
        return { success: true };
    };

    const register = async (email: string, name: string, handle: string, password?: string): Promise<{ success: boolean, error?: string }> => {
        if (!password) return { success: false, error: "Password required." };

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: name,
                    handle: handle.startsWith('@') ? handle : `@${handle}`,
                }
            }
        });

        if (authError) return { success: false, error: authError.message };

        // Profile is handled by DB trigger
        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;

        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.handle) updateData.handle = data.handle;
        if (data.avatar) updateData.avatar_url = data.avatar;
        if (data.banner) updateData.banner_url = data.banner;
        if (data.description) updateData.description = data.description;
        if (data.subscriptions) updateData.subscriptions = data.subscriptions;
        if (data.history) updateData.history = data.history;
        if (data.playlists) updateData.playlists = data.playlists;

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);

        if (error) {
            console.error('Error updating profile:', error);
        } else {
            setUser(prev => prev ? { ...prev, ...data } : null);
        }
    };

    const toggleSubscription = async (channelName: string) => {
        if (!user) return;
        const subs = user.subscriptions || [];
        const isSubscribed = subs.includes(channelName);
        const newSubscriptions = isSubscribed
            ? subs.filter(s => s !== channelName)
            : [...subs, channelName];

        await updateProfile({ subscriptions: newSubscriptions });
    };

    const addToHistory = async (videoId: string) => {
        if (!user) return;
        const currentHistory = user.history || [];
        const filtered = currentHistory.filter(id => id !== videoId);
        const newHistory = [videoId, ...filtered].slice(0, 50);

        await updateProfile({ history: newHistory });
    };

    const clearHistory = async () => {
        if (!user) return;
        await updateProfile({ history: [] });
    };

    const createPlaylist = async (title: string, description: string) => {
        if (!user) return;
        const newPlaylist: Playlist = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            description,
            videoIds: [],
            dateCreated: new Date().toISOString()
        };
        await updateProfile({ playlists: [...(user.playlists || []), newPlaylist] });
    };

    const deletePlaylist = async (playlistId: string) => {
        if (!user) return;
        await updateProfile({ playlists: user.playlists.filter(p => p.id !== playlistId) });
    };

    const addToPlaylist = async (playlistId: string, videoId: string) => {
        if (!user) return;
        const updatedPlaylists = user.playlists.map(p => {
            if (p.id === playlistId && !p.videoIds.includes(videoId)) {
                return { ...p, videoIds: [...p.videoIds, videoId] };
            }
            return p;
        });
        await updateProfile({ playlists: updatedPlaylists });
    };

    const removeFromPlaylist = async (playlistId: string, videoId: string) => {
        if (!user) return;
        const updatedPlaylists = user.playlists.map(p => {
            if (p.id === playlistId) {
                return { ...p, videoIds: p.videoIds.filter(id => id !== videoId) };
            }
            return p;
        });
        await updateProfile({ playlists: updatedPlaylists });
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            updateProfile,
            toggleSubscription,
            addToHistory,
            clearHistory,
            createPlaylist,
            deletePlaylist,
            addToPlaylist,
            removeFromPlaylist,
            isAuthenticated: !!user,
            isLoaded
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
