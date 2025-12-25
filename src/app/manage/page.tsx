"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useVideos } from "@/lib/videos";
import { deleteVideoFile } from "@/lib/idb";
import { Trash2, ExternalLink, Film, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ManagePage() {
    const { user } = useAuth();
    const { videos, deleteVideo } = useVideos();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const userVideos = useMemo(() => {
        if (!user) return [];
        return videos.filter(v => v.author === user.name);
    }, [videos, user]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <AlertCircle className="w-12 h-12 text-muted mb-4" />
                <h1 className="text-xl font-bold mb-2">Login Required</h1>
                <p className="text-muted mb-6">Please sign in to manage your content.</p>
                <Link href="/login" className="px-6 py-2 bg-primary text-white font-bold rounded-[3px]">Sign In</Link>
            </div>
        );
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) return;

        setDeletingId(id);
        try {
            // 1. Delete from IndexedDB
            await deleteVideoFile(id);
            // 2. Delete from Context (Local Storage)
            deleteVideo(id);
        } catch (error) {
            console.error("Failed to delete video:", error);
            alert("Failed to delete video. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Manage Videos</h1>
                    <p className="text-sm text-muted">{userVideos.length} videos uploaded</p>
                </div>
                <Link href="/upload" className="px-4 py-2 bg-foreground text-background font-bold rounded-full hover:opacity-90 transition-opacity">
                    Upload New
                </Link>
            </div>

            {userVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl">
                    <Film className="w-12 h-12 text-muted mb-4" />
                    <p className="text-muted mb-6">You haven't uploaded any videos yet.</p>
                    <Link href="/upload" className="text-primary font-bold hover:underline">Start Uploading</Link>
                </div>
            ) : (
                <div className="bg-zinc-900/50 rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-800/50 border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 font-bold">Video</th>
                                    <th className="px-4 py-3 font-bold">Date</th>
                                    <th className="px-4 py-3 font-bold text-center">Views</th>
                                    <th className="px-4 py-3 font-bold text-center">Likes</th>
                                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {userVideos.map((video) => (
                                    <tr key={video.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-4 py-4">
                                            <div className="flex gap-4">
                                                <div className="w-32 aspect-video bg-zinc-800 rounded relative overflow-hidden flex-shrink-0">
                                                    <Image src={video.thumbnail || `https://picsum.photos/seed/${video.id}/640/360`} alt={video.title} fill className="object-cover" unoptimized />
                                                    <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[10px] font-bold">{video.duration}</div>
                                                </div>
                                                <div className="flex flex-col justify-center max-w-[300px]">
                                                    <span className="font-bold truncate group-hover:text-primary transition-colors">{video.title}</span>
                                                    <span className="text-xs text-muted line-clamp-1 mt-1">{video.description}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-muted">
                                            {new Date(video.uploadDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 text-center font-medium">
                                            {video.views.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-center font-medium">
                                            {video.likes.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/watch/${video.id}`}
                                                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-muted hover:text-foreground"
                                                    title="View Video"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(video.id)}
                                                    disabled={deletingId === video.id}
                                                    className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-muted hover:text-red-500 disabled:opacity-50"
                                                    title="Delete Video"
                                                >
                                                    {deletingId === video.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
