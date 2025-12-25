"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useVideos } from "@/lib/videos";
import { Trash2, History, AlertCircle, Clock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
    const { user, clearHistory } = useAuth();
    const { videos } = useVideos();

    const historyVideos = useMemo(() => {
        if (!user || !user.history) return [];
        // Map history IDs back to video objects in order
        return user.history
            .map(id => videos.find(v => v.id === id))
            .filter((v): v is any => v !== undefined);
    }, [user?.history, videos]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <AlertCircle className="w-12 h-12 text-muted mb-4" />
                <h1 className="text-xl font-bold mb-2">Login Required</h1>
                <p className="text-muted mb-6">Sign in to track your watch history.</p>
                <Link href="/login" className="px-6 py-2 bg-primary text-white font-bold rounded-[3px]">Sign In</Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1000px] mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                    <History className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Watch History</h1>
                        <p className="text-sm text-muted">Videos you've recently watched</p>
                    </div>
                </div>
                {historyVideos.length > 0 && (
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to clear your entire watch history?")) clearHistory();
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear History
                    </button>
                )}
            </div>

            {historyVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-zinc-900/30">
                    <Clock className="w-12 h-12 text-muted mb-4" />
                    <p className="text-muted mb-6">Your watch history is empty.</p>
                    <Link href="/" className="text-primary font-bold hover:underline">Start watching videos</Link>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {historyVideos.map((video, index) => (
                        <Link
                            key={`${video.id}-${index}`}
                            href={`/watch/${video.id}`}
                            className="flex flex-col md:flex-row gap-4 group hover:bg-zinc-900/50 p-2 rounded-xl transition-colors"
                        >
                            <div className="w-full md:w-64 aspect-video bg-zinc-800 rounded-lg relative overflow-hidden flex-shrink-0">
                                <Image src={video.thumbnail || `https://picsum.photos/seed/${video.id}/640/360`} alt={video.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                                <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-xs font-bold">{video.duration}</div>
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                        <Play className="w-6 h-6 text-white fill-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2 py-1">
                                <h3 className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <span>{video.author}</span>
                                    <span>•</span>
                                    <span>{video.views.toLocaleString()} views</span>
                                </div>
                                <p className="text-sm text-muted line-clamp-2 leading-relaxed">
                                    {video.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
