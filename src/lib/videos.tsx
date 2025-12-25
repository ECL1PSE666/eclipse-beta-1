"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface Comment {
    id: string;
    author: string;
    authorAvatar: string;
    content: string;
    date: string;
    likes: number;
    userLiked?: boolean;
    isPinned?: boolean;
    replies?: Comment[];
}

export interface Video {
    id: string;
    title: string;
    description: string;
    author: string;
    authorAvatar: string;
    authorBanner?: string;
    thumbnail: string;
    videoUrl: string;
    likes: number;
    views: number;
    uploadDate: string;
    duration: string;
    comments: Comment[];
}

interface VideoContextType {
    videos: Video[];
    subscriberCounts: Record<string, number>;
    addVideo: (data: any) => Promise<string | null>;
    getVideo: (id: string) => Promise<Video | null>;
    addComment: (videoId: string, author: string, authorAvatar: string, content: string) => Promise<void>;
    incrementLike: (videoId: string) => Promise<void>;
    incrementView: (videoId: string) => Promise<void>;
    updateSubscriberCount: (channelName: string, delta: number) => void;
    getSubscriberCount: (channelName: string) => number;
    getChannelAssets: (channelName: string) => { avatar: string; banner: string };
    deleteVideo: (id: string) => Promise<void>;
    likeComment: (videoId: string, commentId: string) => Promise<void>;
    pinComment: (videoId: string, commentId: string) => Promise<void>;
    addReply: (videoId: string, parentCommentId: string, author: string, authorAvatar: string, content: string) => Promise<void>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: React.ReactNode }) {
    const [videos, setVideos] = useState<Video[]>([]);
    const [subscriberCounts, setSubscriberCounts] = useState<Record<string, number>>({});

    const fetchVideos = async () => {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('upload_date', { ascending: false });

        if (error) {
            console.error('Error fetching videos:', error);
            return;
        }

        if (data) {
            const transformedVideos = data.map(v => ({
                id: v.id,
                title: v.title,
                description: v.description,
                author: v.author_name,
                authorAvatar: v.author_avatar || `https://picsum.photos/seed/${v.author_name}/200/200`,
                thumbnail: v.thumbnail_url,
                videoUrl: v.video_url,
                likes: v.likes,
                views: v.views,
                uploadDate: v.upload_date,
                duration: v.duration || "0:00",
                comments: []
            }));
            setVideos(transformedVideos);
        }
    };

    useEffect(() => {
        fetchVideos();

        // Local storage for subscriber counts (for now)
        const storedCounts = localStorage.getItem("eclipse_subscriber_counts");
        if (storedCounts) {
            try { setSubscriberCounts(JSON.parse(storedCounts)); } catch (e) { console.error(e); }
        }

        const subscription = supabase
            .channel('public:videos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
                fetchVideos();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("eclipse_subscriber_counts", JSON.stringify(subscriberCounts));
    }, [subscriberCounts]);

    const addVideo = async (data: any) => {
        console.log('Adding video with data:', data);
        const { data: result, error } = await supabase
            .from('videos')
            .insert({
                title: data.title,
                description: data.description,
                thumbnail_url: data.thumbnail,
                video_url: data.videoUrl,
                author_name: data.author,
                author_avatar: data.authorAvatar,
                duration: data.duration
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding video:', error);
            throw error; // Throw instead of returning null for better error handling
        }
        console.log('Video added successfully:', result);
        return result.id;
    };

    const getVideo = async (id: string): Promise<Video | null> => {
        console.log('getVideo called with ID:', id);
        const { data: v, error } = await supabase
            .from('videos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching video from database:', error);
            return null;
        }

        if (!v) {
            console.error('No video found with ID:', id);
            return null;
        }

        console.log('Video found in database:', v);

        const { data: cData, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('video_id', id)
            .order('date', { ascending: false });

        if (commentsError) {
            console.warn('Error fetching comments (non-fatal):', commentsError);
        }

        const comments = (cData || []).map(c => ({
            id: c.id,
            author: c.author,
            authorAvatar: c.author_avatar || `https://picsum.photos/seed/${c.author}/100/100`,
            content: c.content,
            date: c.date,
            likes: c.likes,
            isPinned: c.is_pinned
        }));

        const videoData = {
            id: v.id,
            title: v.title,
            description: v.description,
            author: v.author_name,
            authorAvatar: v.author_avatar || `https://picsum.photos/seed/${v.author_name}/200/200`,
            thumbnail: v.thumbnail_url,
            videoUrl: v.video_url,
            likes: v.likes,
            views: v.views,
            uploadDate: v.upload_date,
            duration: v.duration || "0:00",
            comments: comments
        };

        console.log('Returning video data:', videoData);
        return videoData;
    };

    const addComment = async (videoId: string, author: string, authorAvatar: string, content: string) => {
        const { error } = await supabase
            .from('comments')
            .insert({
                video_id: videoId,
                author,
                author_avatar: authorAvatar,
                content
            });

        if (error) console.error('Error adding comment:', error);
    };

    const incrementLike = async (videoId: string) => {
        const { data } = await supabase.from('videos').select('likes').eq('id', videoId).single();
        if (data) {
            await supabase.from('videos').update({ likes: data.likes + 1 }).eq('id', videoId);
        }
    };

    const incrementView = async (videoId: string) => {
        const { data } = await supabase.from('videos').select('views').eq('id', videoId).single();
        if (data) {
            await supabase.from('videos').update({ views: data.views + 1 }).eq('id', videoId);
        }
    };

    const updateSubscriberCount = (channelName: string, delta: number) => {
        setSubscriberCounts(prev => ({
            ...prev,
            [channelName]: Math.max(0, (prev[channelName] || 0) + delta)
        }));
    };

    const getSubscriberCount = (channelName: string) => {
        return subscriberCounts[channelName] || 0;
    };

    const getChannelAssets = (channelName: string) => {
        return {
            avatar: `https://picsum.photos/seed/${channelName}/200/200`,
            banner: `https://picsum.photos/seed/${channelName}banner/1500/250`
        };
    };

    const deleteVideo = async (id: string) => {
        const { error } = await supabase.from('videos').delete().eq('id', id);
        if (error) {
            console.error('Error deleting video:', error);
        } else {
            setVideos(prev => prev.filter(v => v.id !== id));
        }
    };

    const likeComment = async (videoId: string, commentId: string) => {
        const { data } = await supabase.from('comments').select('likes').eq('id', commentId).single();
        if (data) {
            await supabase.from('comments').update({ likes: data.likes + 1 }).eq('id', commentId);
        }
    };

    const pinComment = async (videoId: string, commentId: string) => {
        await supabase.from('comments').update({ is_pinned: false }).eq('video_id', videoId);
        await supabase.from('comments').update({ is_pinned: true }).eq('id', commentId);
    };

    const addReply = async (videoId: string, parentCommentId: string, author: string, authorAvatar: string, content: string) => {
        const { error } = await supabase
            .from('comments')
            .insert({
                video_id: videoId,
                parent_id: parentCommentId,
                author,
                author_avatar: authorAvatar,
                content
            });

        if (error) console.error('Error adding reply:', error);
    };

    return (
        <VideoContext.Provider value={{ videos, subscriberCounts, addVideo, getVideo, addComment, incrementLike, incrementView, updateSubscriberCount, getSubscriberCount, getChannelAssets, deleteVideo, likeComment, pinComment, addReply }}>
            {children}
        </VideoContext.Provider>
    );
}

export function useVideos() {
    const context = useContext(VideoContext);
    if (context === undefined) {
        throw new Error("useVideos must be used within a VideoProvider");
    }
    return context;
}
