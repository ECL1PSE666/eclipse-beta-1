"use client";

import { use, useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Play, Heart, MessageSquare, Share2, MoreHorizontal, Volume2, VolumeX, Maximize2, Settings, Pause, Check, Pin, X, Copy, Twitter, Send, ListPlus, Plus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useVideos, Video } from "@/lib/videos";
import { VideoCard } from "@/components/ui/VideoCard";
import { useAuth, Playlist } from "@/lib/auth";
import { cn, ensureStringSrc } from "@/lib/utils";

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const playlistId = searchParams.get("list");

    const { getVideo, videos, addComment, incrementLike, incrementView, getSubscriberCount, updateSubscriberCount, likeComment, addReply, pinComment } = useVideos();
    const { user, toggleSubscription, addToHistory, addToPlaylist, removeFromPlaylist, createPlaylist } = useAuth();

    const [commentText, setCommentText] = useState("");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [isCreatingInModal, setIsCreatingInModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [isQueueExpanded, setIsQueueExpanded] = useState(true);

    const [video, setVideo] = useState<Video | null>(null);
    const [isLoadingVideo, setIsLoadingVideo] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    useEffect(() => {
        const fetchVideoData = async () => {
            console.log('Fetching video data for ID:', resolvedParams.id);
            setIsLoadingVideo(true);
            try {
                const data = await getVideo(resolvedParams.id);
                console.log('Video data received:', data);
                if (data) {
                    setVideo(data);
                } else {
                    console.error('No video data returned');
                }
            } catch (error) {
                console.error('Error fetching video:', error);
            } finally {
                setIsLoadingVideo(false);
            }
        };
        fetchVideoData();
    }, [resolvedParams.id, getVideo]);

    useEffect(() => {
        if (video) {
            console.log('Adding video to history:', video.id);
            addToHistory(video.id).catch(err => {
                console.error('Failed to add to history:', err);
                // Don't block the page if history update fails
            });
        }
    }, [video?.id]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const handleTimeUpdate = () => setCurrentTime(v.currentTime);
        const handleDurationChange = () => setDuration(v.duration);

        v.addEventListener('timeupdate', handleTimeUpdate);
        v.addEventListener('durationchange', handleDurationChange);
        return () => {
            v.removeEventListener('timeupdate', handleTimeUpdate);
            v.removeEventListener('durationchange', handleDurationChange);
        };
    }, [video]);

    const currentPlaylist = useMemo(() => {
        if (!playlistId || !user) return null;
        return user.playlists.find(p => p.id === playlistId);
    }, [playlistId, user?.playlists]);

    const playlistVideos = useMemo(() => {
        if (!currentPlaylist) return [];
        return videos.filter(v => currentPlaylist.videoIds.includes(v.id));
    }, [currentPlaylist, videos]);

    const nextVideoId = useMemo(() => {
        if (!currentPlaylist) return null;
        const currentIndex = currentPlaylist.videoIds.indexOf(resolvedParams.id);
        if (currentIndex !== -1 && currentIndex < currentPlaylist.videoIds.length - 1) {
            return currentPlaylist.videoIds[currentIndex + 1];
        }
        return null;
    }, [currentPlaylist, resolvedParams.id]);

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) videoRef.current.volume = val;
        setIsMuted(val === 0);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            videoRef.current.volume = newMuted ? 0 : volume;
        }
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        if (videoRef.current) videoRef.current.playbackRate = speed;
        setShowSettings(false);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) videoRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const toggleFullscreen = () => {
        if (!playerRef.current) return;
        if (!document.fullscreenElement) {
            playerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !user || !video) return;
        await addComment(video.id, user.name, user.avatar, commentText);
        setCommentText("");
        const updatedVideo = await getVideo(video.id);
        setVideo(updatedVideo);
    };

    if (isLoadingVideo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted">Loading video...</p>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-2xl font-bold mb-2">Video not found</h1>
                <Link href="/" className="text-primary hover:underline">Back to Home</Link>
            </div>
        );
    }

    const recommendations = videos.filter(v => v.id !== video.id);
    const isSubscribed = user?.subscriptions?.includes(video.author);
    const subscriberCount = getSubscriberCount(video.author);

    const handleSubscribe = () => {
        if (!user) return alert("Please login to subscribe");
        if (user.name === video.author) return alert("You cannot subscribe to yourself");
        toggleSubscription(video.author);
        updateSubscriberCount(video.author, isSubscribed ? -1 : 1);
    };

    const CommentItem = ({ comment, depth = 0 }: { comment: any, depth?: number }) => {
        const [isReplying, setIsReplying] = useState(false);
        const [replyContent, setReplyContent] = useState("");

        const handleReplySubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!replyContent.trim() || !user || !video) return;
            await addReply(video.id, comment.id, user.name, user.avatar, replyContent);
            setReplyContent("");
            setIsReplying(false);
            const updatedVideo = await getVideo(video.id);
            setVideo(updatedVideo);
        };

        return (
            <div className={cn("flex flex-col gap-3", depth > 0 && "ml-12")}>
                {comment.isPinned && depth === 0 && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                        <Pin className="w-3 h-3 fill-muted rotate-45" />
                        Pinned by {video.author}
                    </div>
                )}
                <div className="flex gap-3">
                    <div className={cn("rounded-full bg-zinc-800 flex-shrink-0 relative overflow-hidden", depth > 0 ? "w-8 h-8" : "w-10 h-10")}>
                        <Image src={ensureStringSrc(comment.authorAvatar, `https://picsum.photos/seed/${comment.author}/200`)} alt={comment.author} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold truncate">@{comment.author}</span>
                            <span className="text-xs text-muted font-medium">{new Date(comment.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm mt-1 leading-relaxed">{comment.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <button onClick={async () => { await likeComment(video.id, comment.id); const updated = await getVideo(video.id); setVideo(updated); }} className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground">
                                <Heart className="w-3.5 h-3.5" /> {comment.likes}
                            </button>
                            <button onClick={() => setIsReplying(!isReplying)} className="text-xs font-bold text-muted hover:text-foreground">REPLY</button>
                        </div>

                        {isReplying && (
                            <form onSubmit={handleReplySubmit} className="mt-4 flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Add a reply..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="w-full bg-transparent border-b border-border py-1 text-sm outline-none focus:border-foreground"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setIsReplying(false)} className="text-xs font-medium">Cancel</button>
                                    <button type="submit" disabled={!replyContent.trim()} className="text-xs font-bold text-primary disabled:opacity-50">Reply</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-background pb-20">
            <div
                ref={playerRef}
                className={cn(
                    "bg-black w-full relative group flex items-center justify-center overflow-hidden",
                    isFullscreen ? "h-screen w-screen" : "aspect-video max-h-[82vh]"
                )}
            >
                <video
                    ref={videoRef}
                    src={video.videoUrl}
                    poster={video.thumbnail}
                    className="w-full h-full object-contain"
                    onClick={handlePlayPause}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={async () => {
                        await incrementView(video.id);
                        if (nextVideoId) router.push(`/watch/${nextVideoId}?list=${playlistId}`);
                    }}
                    autoPlay
                />

                <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity", isPlaying ? "opacity-0" : "opacity-100 bg-black/20")}>
                    <button className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center shadow-2xl pointer-events-auto" onClick={handlePlayPause}>
                        {isPlaying ? <Pause className="w-10 h-10 text-white fill-white" /> : <Play className="w-10 h-10 text-white fill-white ml-1" />}
                    </button>
                </div>

                <div className={cn("absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex flex-col gap-2 transition-opacity z-20", !isPlaying || isFullscreen ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                    <input type="range" min={0} max={duration || 0} step={0.1} value={currentTime} onChange={handleSeek} className="w-full h-1 bg-white/20 accent-primary rounded-full" />
                    <div className="flex items-center justify-between text-white mt-1">
                        <div className="flex items-center gap-4">
                            <button onClick={handlePlayPause}>{isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}</button>
                            <div className="flex items-center gap-2 group/volume">
                                <button onClick={toggleMute}>{isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
                                <input type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-20 h-1 bg-white/20 accent-white rounded-full appearance-none" />
                            </div>
                            <span className="text-xs font-medium tabular-nums">{formatTime(currentTime)} / {formatTime(duration || 0)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowSettings(!showSettings)}><Settings className="w-5 h-5" /></button>
                            <button onClick={toggleFullscreen}><Maximize2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                {showSettings && (
                    <div className="absolute bottom-16 right-4 bg-zinc-900 border border-border rounded-lg p-2 min-w-[200px] z-30 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-2 text-xs font-bold text-muted uppercase tracking-wider border-b border-border mb-1">Playback Speed</div>
                        {[0.5, 1, 1.5, 2].map(speed => (
                            <button key={speed} onClick={() => handleSpeedChange(speed)} className={cn("w-full text-left px-3 py-2 text-sm rounded hover:bg-white/5", playbackSpeed === speed && "text-primary font-bold")}>
                                {speed === 1 ? 'Normal' : `${speed}x`}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-6">
                <div className="lg:col-span-8 space-y-6">
                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold leading-tight">{video.title}</h1>
                        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-border pb-6">
                            <div className="flex items-center gap-4">
                                <Link href={`/channel/${video.author}`} className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 relative flex-shrink-0">
                                    <Image src={video.authorAvatar} alt={video.author} fill className="object-cover" />
                                </Link>
                                <div>
                                    <Link href={`/channel/${video.author}`} className="font-bold hover:underline block">@{video.author}</Link>
                                    <span className="text-xs text-muted font-medium">{subscriberCount} subscribers</span>
                                </div>
                                <button onClick={handleSubscribe} className={cn("ml-4 px-6 py-2 rounded-full text-sm font-bold transition-all", isSubscribed ? "bg-zinc-800 text-foreground hover:bg-zinc-700" : "bg-white text-black hover:bg-zinc-200")}>
                                    {isSubscribed ? "Subscribed" : "Subscribe"}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={async () => { await incrementLike(video.id); const v = await getVideo(video.id); setVideo(v); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm font-bold transition-colors">
                                    <Heart className="w-4 h-4" /> {video.likes}
                                </button>
                                <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm font-bold transition-colors">
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                                <button onClick={() => setIsPlaylistModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm font-bold transition-colors">
                                    <ListPlus className="w-4 h-4" /> Save
                                </button>
                                <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-border">
                        <div className="flex gap-3 text-sm font-bold mb-2">
                            <span>{video.views} views</span>
                            <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{video.description}</p>
                    </div>

                    <div className="space-y-6 pt-4">
                        <div className="flex items-center gap-6">
                            <h2 className="text-xl font-bold">{video.comments.length} Comments</h2>
                            <button className="flex items-center gap-2 text-sm font-bold hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors">Sort by</button>
                        </div>

                        {user ? (
                            <form onSubmit={handleCommentSubmit} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 relative flex-shrink-0">
                                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="w-full bg-transparent border-b border-border py-1 outline-none focus:border-foreground transition-colors"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setCommentText("")} className="px-4 py-2 text-sm font-bold hover:bg-white/5 rounded-full">Cancel</button>
                                        <button type="submit" disabled={!commentText.trim()} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-full disabled:opacity-50">Comment</button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="p-4 bg-zinc-900 border border-border rounded-xl text-center">
                                <p className="text-muted text-sm mb-4">Sign in to join the conversation</p>
                                <Link href="/login" className="px-6 py-2 bg-primary text-white font-bold rounded-full text-sm inline-block">Sign In</Link>
                            </div>
                        )}

                        <div className="space-y-8">
                            {video.comments.map(comment => (
                                <CommentItem key={comment.id} comment={comment} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    {currentPlaylist && (
                        <div className="bg-zinc-900 border border-border rounded-xl mb-4 overflow-hidden">
                            <div className="p-4 bg-zinc-800/50 flex items-center justify-between border-b border-border">
                                <div>
                                    <h3 className="font-bold">{currentPlaylist.title}</h3>
                                    <span className="text-xs text-muted">@{video.author} - {playlistVideos.length} videos</span>
                                </div>
                                <button onClick={() => setIsQueueExpanded(!isQueueExpanded)} className="p-1 hover:bg-white/5 rounded transition-colors">
                                    {isQueueExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                            </div>
                            {isQueueExpanded && (
                                <div className="max-h-[400px] overflow-y-auto">
                                    {playlistVideos.map((v, i) => (
                                        <Link
                                            key={v.id}
                                            href={`/watch/${v.id}?list=${playlistId}`}
                                            className={cn("flex gap-2 p-2 hover:bg-white/5 transition-colors group", v.id === video.id && "bg-white/10")}
                                        >
                                            <span className="text-[10px] text-muted w-4 flex-shrink-0 self-center">{i + 1}</span>
                                            <div className="aspect-video w-32 bg-zinc-800 rounded relative overflow-hidden flex-shrink-0">
                                                <Image src={v.thumbnail} alt={v.title} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">{v.title}</h4>
                                                <p className="text-[10px] text-muted mt-1">@{v.author}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <h3 className="font-bold mb-4">Recommended</h3>
                    {recommendations.map(v => (
                        <VideoCard
                            key={v.id}
                            id={v.id}
                            title={v.title}
                            author={v.author}
                            thumbnail={v.thumbnail}
                            plays={`${v.views} views`}
                            duration={v.duration}
                            horizontal
                        />
                    ))}
                </div>
            </div>

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsShareModalOpen(false)}>
                    <div className="bg-zinc-900 border border-border w-full max-w-sm rounded-2xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsShareModalOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
                        <h3 className="text-xl font-bold mb-6">Share</h3>
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            {[{ label: "Twitter", color: "#1DA1F2" }, { label: "Message", color: "#24A1DE" }, { label: "Reddit", color: "#FF4500" }, { label: "More", color: "#8B8B8B" }].map((platform, i) => (
                                <button key={i} className="flex flex-col items-center gap-2 group">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${platform.color}20` }}>
                                        <div style={{ color: platform.color }}><Share2 className="w-6 h-6" /></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted group-hover:text-foreground">{platform.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="relative group">
                            <input readOnly value={typeof window !== 'undefined' ? window.location.href : ""} className="w-full bg-black border border-border p-3 pr-16 rounded-xl text-xs outline-none focus:border-primary transition-colors font-mono" />
                            <button onClick={handleCopyLink} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-zinc-200 transition-colors">
                                {isCopied ? "COPIED" : "COPY"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Playlist Modal */}
            {isPlaylistModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsPlaylistModalOpen(false)}>
                    <div className="bg-zinc-900 border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold">Save to playlist</h3>
                            <button onClick={() => setIsPlaylistModalOpen(false)} className="text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-2">
                            {user?.playlists.map(p => {
                                const isAdded = p.videoIds.includes(video.id);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={async () => {
                                            if (isAdded) await removeFromPlaylist(p.id, video.id);
                                            else await addToPlaylist(p.id, video.id);
                                        }}
                                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-5 h-5 rounded border border-border flex items-center justify-center transition-colors shadow-inner", isAdded ? "bg-primary border-primary" : "bg-black group-hover:border-zinc-500")}>
                                                {isAdded && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <span className="text-sm font-medium">{p.title}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="p-4 bg-zinc-800/30 border-t border-border mt-2">
                            {!isCreatingInModal ? (
                                <button onClick={() => setIsCreatingInModal(true)} className="flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground transition-colors">
                                    <Plus className="w-5 h-5" /> Create new playlist
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Enter playlist title..."
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        className="w-full bg-black border border-border p-2 rounded-lg text-sm outline-none focus:border-primary"
                                        autoFocus
                                    />
                                    <div className="flex justify-between items-center gap-4">
                                        <button onClick={() => setIsCreatingInModal(false)} className="text-xs font-bold text-muted hover:underline uppercase tracking-wider">Cancel</button>
                                        <button
                                            disabled={!newPlaylistName.trim()}
                                            onClick={async () => {
                                                await createPlaylist(newPlaylistName, "");
                                                setNewPlaylistName("");
                                                setIsCreatingInModal(false);
                                            }}
                                            className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-zinc-200 disabled:opacity-50 transition-colors shadow-lg"
                                        >
                                            CREATE
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
