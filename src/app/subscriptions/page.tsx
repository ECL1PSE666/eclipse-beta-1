"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useVideos } from "@/lib/videos";
import { VideoCard } from "@/components/ui/VideoCard";
import { UserPlus, Bell, AlertCircle } from "lucide-react";

export default function SubscriptionsPage() {
    const { user } = useAuth();
    const { videos, getSubscriberCount, getChannelAssets } = useVideos();

    const subscribedChannels = useMemo(() => {
        if (!user || !user.subscriptions) return [];
        return user.subscriptions;
    }, [user]);

    const subscriptionVideos = useMemo(() => {
        return videos.filter(v => subscribedChannels.includes(v.author));
    }, [videos, subscribedChannels]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <AlertCircle className="w-12 h-12 text-muted mb-4" />
                <h1 className="text-xl font-bold mb-2">Login Required</h1>
                <p className="text-muted mb-6">Sign in to see updates from your favorite creators.</p>
                <Link href="/login" className="px-6 py-2 bg-primary text-white font-bold rounded-[3px]">Sign In</Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1280px] mx-auto p-4 md:p-8">
            <div className="mb-10">
                <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>

                {subscribedChannels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-zinc-900/30">
                        <UserPlus className="w-12 h-12 text-muted mb-4" />
                        <p className="text-muted mb-6">You haven't subscribed to anyone yet.</p>
                        <Link href="/" className="text-primary font-bold hover:underline">Explore suggested videos</Link>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Channels List */}
                        <div className="flex items-center gap-6 overflow-x-auto pb-4 no-scrollbar border-b border-border">
                            {subscribedChannels.map((channelName) => (
                                <Link
                                    key={channelName}
                                    href={`/channel/${encodeURIComponent(channelName)}`}
                                    className="flex flex-col items-center gap-2 min-w-[100px] group"
                                >
                                    <div className="w-16 h-16 rounded-full overflow-hidden relative border-2 border-transparent group-hover:border-primary transition-all">
                                        <Image
                                            src={getChannelAssets(channelName).avatar}
                                            alt={channelName}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <span className="text-xs font-bold truncate w-full text-center group-hover:text-primary transition-colors">{channelName}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Videos Feed */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Latest Videos</h2>
                                <button className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Manage
                                </button>
                            </div>

                            {subscriptionVideos.length === 0 ? (
                                <p className="text-muted italic">No videos uploaded by your subscriptions yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {subscriptionVideos.map((video) => (
                                        <VideoCard
                                            key={video.id}
                                            id={video.id}
                                            title={video.title}
                                            author={video.author}
                                            thumbnail={video.thumbnail}
                                            plays={`${video.views} views`}
                                            duration={video.duration}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
