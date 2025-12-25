"use client";

import { use, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useVideos } from "@/lib/videos";
import { VideoCard } from "@/components/ui/VideoCard";
import { Search, Play } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { usePosts } from "@/lib/posts";
import { cn, ensureStringSrc } from "@/lib/utils";
import { PostCard } from "@/components/ui/PostCard";
import { Playlist } from "@/lib/auth";
import { Plus, ListMusic, MoreVertical, X } from "lucide-react";

export default function ChannelPage({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = use(params);
    const username = decodeURIComponent(resolvedParams.username);
    const { videos, getSubscriberCount, updateSubscriberCount, getChannelAssets } = useVideos();
    const { posts } = usePosts();
    const { user, toggleSubscription, createPlaylist } = useAuth();
    const [activeTab, setActiveTab] = useState("Home");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
    const [newPlaylistDesc, setNewPlaylistDesc] = useState("");

    const channelVideos = useMemo(() => {
        return videos.filter(v => v.author === username);
    }, [videos, username]);

    const channelPosts = useMemo(() => {
        return posts.filter(p => p.author === username);
    }, [posts, username]);

    const isOwner = user?.name === username;
    const isSubscribed = user?.subscriptions?.includes(username);
    const subscriberCount = getSubscriberCount(username);

    const handleSubscribe = () => {
        if (!user) return alert("Please login to subscribe");
        if (isOwner) return alert("You cannot subscribe to yourself");
        toggleSubscription(username);
        updateSubscriberCount(username, isSubscribed ? -1 : 1);
    };

    const renderSubCount = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const channelData = useMemo(() => {
        if (isOwner && user) {
            return {
                ...user,
                videosCount: channelVideos.length,
            };
        }

        const assets = getChannelAssets(username);

        return {
            name: username,
            handle: `@${username.toLowerCase().replace(/\s+/g, '')}`,
            videosCount: channelVideos.length,
            banner: assets.banner,
            avatar: assets.avatar,
            description: "Welcome to my official channel!"
        };
    }, [isOwner, user, username, channelVideos, getChannelAssets]);

    const tabs = ["Home", "Videos", "Playlists", "About"];

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Banner Section */}
            <div className="w-full aspect-[6/1] md:aspect-[8/1] relative bg-zinc-800 overflow-hidden">
                {channelData.banner ? (
                    <Image
                        src={ensureStringSrc(channelData.banner, `https://picsum.photos/seed/${channelData.name}banner/1200/400`)}
                        alt="Banner"
                        fill
                        className="object-cover"
                        unoptimized
                        priority
                    />
                ) : (
                    <div className="h-full w-full bg-zinc-800" />
                )}
            </div>

            <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden relative border-4 border-background bg-zinc-800 flex-shrink-0">
                        {channelData.avatar ? (
                            <Image src={ensureStringSrc(channelData.avatar, `https://picsum.photos/seed/${channelData.name}/200`)} alt={channelData.name} fill className="object-cover" unoptimized />
                        ) : (
                            <div className="h-full w-full bg-zinc-700" />
                        )}
                    </div>

                    <div className="flex-1 space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold">{channelData.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <span className="font-medium text-foreground">{channelData.handle}</span>
                            <span>•</span>
                            <span>{renderSubCount(subscriberCount)} subscribers</span>
                            <span>•</span>
                            <span>{channelData.videosCount} videos</span>
                        </div>
                        <p className="text-sm text-muted line-clamp-2 max-w-2xl">
                            {channelData.description}
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            {isOwner ? (
                                <>
                                    <Link href="/settings" className="bg-zinc-800 text-foreground font-bold px-6 py-2 rounded-full hover:bg-zinc-700">
                                        Customize channel
                                    </Link>
                                    <Link href="/manage" className="bg-zinc-800 text-foreground font-bold px-6 py-2 rounded-full hover:bg-zinc-700">
                                        Manage videos
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSubscribe}
                                        className={cn(
                                            "font-bold px-6 py-2 rounded-full transition-all",
                                            isSubscribed
                                                ? "bg-zinc-800 text-foreground hover:bg-zinc-700"
                                                : "bg-foreground text-background hover:opacity-90"
                                        )}
                                    >
                                        {isSubscribed ? "Subscribed" : "Subscribe"}
                                    </button>
                                    <button className="bg-zinc-800 text-foreground font-bold px-6 py-2 rounded-full hover:bg-zinc-700">
                                        Join
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 mt-8 border-b border-border overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-foreground" : "text-muted hover:text-foreground"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                            )}
                        </button>
                    ))}
                    <button className="ml-auto p-2 hover:bg-zinc-800 rounded-full">
                        <Search className="w-5 h-5 text-muted" />
                    </button>
                </div>

                <div className="py-8">
                    {activeTab === "Home" && (
                        <div className="space-y-12">
                            {channelVideos.length > 0 ? (
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="lg:w-1/3 aspect-video relative rounded-xl overflow-hidden group cursor-pointer">
                                        <Image src={channelVideos[0].thumbnail} alt="Featured" fill className="object-cover" unoptimized />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <Play className="w-12 h-12 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-lg font-bold">{channelVideos[0].title}</h3>
                                        <div className="text-xs text-muted">
                                            {channelVideos[0].views} views • {new Date(channelVideos[0].uploadDate).toLocaleDateString()}
                                        </div>
                                        <p className="text-sm text-muted line-clamp-3">
                                            {channelVideos[0].description}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 border border-dashed border-border rounded-xl">
                                    <p className="text-muted">No content available.</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">Videos</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {channelVideos.map((video) => (
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
                            </div>
                        </div>
                    )}

                    {activeTab === "Videos" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {channelVideos.map((video) => (
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

                    {activeTab === "Playlists" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Playlists</h2>
                                {isOwner && (
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Playlist
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {isOwner && user?.playlists?.map((playlist: Playlist) => {
                                    // Get first video thumbnail as playlist cover
                                    const firstVideoId = playlist.videoIds[0];
                                    const firstVideo = videos.find(v => v.id === firstVideoId);
                                    const thumbnail = firstVideo?.thumbnail || `https://picsum.photos/seed/${playlist.id}/400/225`;

                                    if (!firstVideoId) return null;

                                    return (
                                        <Link
                                            key={playlist.id}
                                            href={`/watch/${firstVideoId}?list=${playlist.id}`}
                                            className="group cursor-pointer block"
                                        >
                                            <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                                                <Image src={thumbnail} alt={playlist.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                                <div className="absolute bottom-0 right-0 left-0 bg-black/60 backdrop-blur-md p-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <ListMusic className="w-4 h-4 text-white" />
                                                        <span className="text-xs font-bold text-white uppercase tracking-wider">{playlist.videoIds.length} videos</span>
                                                    </div>
                                                    <Play className="w-4 h-4 text-white fill-white" />
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{playlist.title}</h3>
                                            <p className="text-xs text-muted line-clamp-2">{playlist.description}</p>
                                        </Link>
                                    );
                                })}

                                {(!isOwner || !user?.playlists?.length) && (
                                    <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl">
                                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ListMusic className="w-8 h-8 text-muted" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-1">No playlists yet</h3>
                                        <p className="text-sm text-muted max-w-xs mx-auto">
                                            {isOwner ? "Create your first playlist to organize your favorite videos." : "This channel hasn't created any playlists yet."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Playlist Creation Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsCreateModalOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-zinc-900 border border-border rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold">New Playlist</h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter playlist title"
                                    value={newPlaylistTitle}
                                    onChange={(e) => setNewPlaylistTitle(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Description</label>
                                <textarea
                                    placeholder="Tell viewers about your playlist"
                                    value={newPlaylistDesc}
                                    onChange={(e) => setNewPlaylistDesc(e.target.value)}
                                    rows={4}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-4 bg-zinc-800 text-foreground font-bold rounded-2xl hover:bg-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (newPlaylistTitle.trim()) {
                                            createPlaylist(newPlaylistTitle, newPlaylistDesc);
                                            setNewPlaylistTitle("");
                                            setNewPlaylistDesc("");
                                            setIsCreateModalOpen(false);
                                        }
                                    }}
                                    disabled={!newPlaylistTitle.trim()}
                                    className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
