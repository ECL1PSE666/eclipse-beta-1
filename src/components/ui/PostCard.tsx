"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
    Heart,
    MessageSquare,
    Repeat2,
    MoreHorizontal,
    X,
    Send,
    Trash2,
    Share,
    Twitter,
    Pin
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { usePosts, Post, PostComment } from "@/lib/posts";
import { getPostFile } from "@/lib/idb";
import { cn, ensureStringSrc, parseMarkdownLinks } from "@/lib/utils";

export function PostCard({ post }: { post: Post }) {
    const { togglePostLike, repostPost, addPostComment, deletePost } = usePosts();
    const { user } = useAuth();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (post.hasImage) {
            getPostFile(post.id).then((file) => {
                if (file) setImageUrl(URL.createObjectURL(file));
            });
        }
    }, [post.id, post.hasImage]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCopyLink = async () => {
        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/posts#${post.id}`;
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !user) return;
        addPostComment(post.id, {
            author: user.name,
            authorAvatar: user.avatar,
            content: commentText
        });
        setCommentText("");
    };

    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {imageUrl && (
                <div className="relative w-full aspect-auto min-h-[200px] bg-black/20">
                    <img src={imageUrl} alt="Post content" className="w-full h-auto max-h-[600px] object-contain" />
                </div>
            )}

            <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 relative overflow-hidden">
                        <Image src={ensureStringSrc(post.authorAvatar, `https://picsum.photos/seed/${post.author}/200`)} alt={post.author} fill className="object-cover" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">@{post.author}</p>
                        <p className="text-[10px] text-muted font-medium">{new Date(post.date).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 text-muted hover:text-foreground transition-colors"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-10 w-48 bg-zinc-900 border border-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => { setIsShareModalOpen(true); setShowMenu(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                                >
                                    <Share className="w-4 h-4" />
                                    Share Post
                                </button>

                                {user?.name === post.author && (
                                    <button
                                        onClick={() => { if (confirm("Delete this post?")) deletePost(post.id); }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Post
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                    {parseMarkdownLinks(post.content).map((part, i) => {
                        if (typeof part === 'string') return part;
                        return (
                            <a
                                key={i}
                                href={part.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                            >
                                {part.label}
                            </a>
                        );
                    })}
                </div>

                <div className="flex items-center gap-8 pt-4 border-t border-border">
                    <button
                        onClick={() => togglePostLike(post.id)}
                        className={cn(
                            "flex items-center gap-2 text-xs font-bold transition-all active:scale-90",
                            post.userLiked ? "text-primary" : "text-muted hover:text-foreground"
                        )}
                    >
                        <Heart className={cn("w-4 h-4", post.userLiked && "fill-primary")} />
                        {post.likes}
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={cn(
                            "flex items-center gap-2 text-xs font-bold transition-colors",
                            showComments ? "text-primary" : "text-muted hover:text-foreground"
                        )}
                    >
                        <MessageSquare className="w-4 h-4" />
                        {post.comments.length}
                    </button>

                    <button
                        onClick={() => user && repostPost(post.id, user)}
                        className={cn(
                            "flex items-center gap-2 text-xs font-bold transition-all active:scale-95",
                            post.userReposted ? "text-green-500" : "text-muted hover:text-green-500"
                        )}
                        disabled={post.userReposted}
                    >
                        <Repeat2 className="w-4 h-4" />
                        {post.reposts}
                    </button>
                </div>

                {showComments && (
                    <div className="mt-6 pt-6 border-t border-border space-y-4 animate-in slide-in-from-top-2 duration-300">
                        {user && (
                            <form onSubmit={handleComment} className="flex gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 relative overflow-hidden flex-shrink-0">
                                    <Image src={ensureStringSrc(user.avatar, `https://picsum.photos/seed/${user.name}/200`)} alt={user.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="flex-1 bg-background/50 border border-border px-3 py-1.5 rounded-full text-xs outline-none focus:border-primary"
                                    />
                                    <button type="submit" className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {[...post.comments]
                                .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                                .map(comment => (
                                    <PostCommentItem
                                        key={comment.id}
                                        comment={comment}
                                        postId={post.id}
                                        postAuthor={post.author}
                                        isTopLevel={true}
                                    />
                                ))}
                            {post.comments.length === 0 && <p className="text-center text-xs text-muted py-4 italic">No comments yet. Be the first!</p>}
                        </div>
                    </div>
                )}
            </div>

            {isShareModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsShareModalOpen(false)}
                    />
                    <div className="relative w-full max-w-sm bg-zinc-900 border border-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Share Post</h3>
                            <button
                                onClick={() => setIsShareModalOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-8">
                            <a
                                href={`https://t.me/share/url?url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/posts#${post.id}`)}&text=${encodeURIComponent(`Check out this post by @${post.author}`)}`}
                                target="_blank"
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-12 h-12 bg-[#229ED9]/10 rounded-full flex items-center justify-center group-hover:bg-[#229ED9] transition-colors">
                                    <Send className="w-6 h-6 text-[#229ED9] group-hover:text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-muted">Telegram</span>
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/posts#${post.id}`)}&text=${encodeURIComponent(`Check out this post by @${post.author}`)}`}
                                target="_blank"
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                    <Twitter className="w-5 h-5 fill-white" />
                                </div>
                                <span className="text-[10px] font-bold text-muted">X</span>
                            </a>
                            <a
                                href={`https://vk.com/share.php?url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/posts#${post.id}`)}`}
                                target="_blank"
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-12 h-12 bg-[#0077FF]/10 rounded-full flex items-center justify-center group-hover:bg-[#0077FF] transition-colors">
                                    <div className="font-bold text-lg text-[#0077FF] group-hover:text-white">VK</div>
                                </div>
                                <span className="text-[10px] font-bold text-muted">VK</span>
                            </a>
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(`Check out this post by @${post.author}: ${typeof window !== 'undefined' ? window.location.origin : ''}/posts#${post.id}`)}`}
                                target="_blank"
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center group-hover:bg-[#25D366] transition-colors">
                                    <MessageSquare className="w-5 h-5 text-[#25D366] group-hover:text-white fill-[#25D366]" />
                                </div>
                                <span className="text-[10px] font-bold text-muted">WhatsApp</span>
                            </a>
                        </div>

                        <div className="relative group">
                            <input
                                type="text"
                                readOnly
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/posts#${post.id}`}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-16 text-xs text-muted font-medium outline-none"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={cn(
                                    "absolute right-2 top-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95",
                                    isCopied ? "bg-green-500 text-white" : "bg-white text-black hover:bg-zinc-200"
                                )}
                            >
                                {isCopied ? "COPIED" : "COPY"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PostCommentItem({
    comment,
    postId,
    postAuthor,
    isTopLevel = false
}: {
    comment: PostComment,
    postId: string,
    postAuthor: string,
    isTopLevel?: boolean
}) {
    const { user } = useAuth();
    const { likePostComment, addPostCommentReply, pinPostComment } = usePosts();
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !user) return;
        addPostCommentReply(postId, comment.id, {
            author: user.name,
            authorAvatar: user.avatar,
            content: replyText
        });
        setReplyText("");
        setIsReplying(false);
    };

    return (
        <div className={cn("group", !isTopLevel && "ml-8 mt-4 border-l-2 border-border pl-4")}>
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 relative overflow-hidden flex-shrink-0 mt-1">
                    <Image src={ensureStringSrc(comment.authorAvatar, `https://picsum.photos/seed/${comment.author}/200`)} alt={comment.author} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold">@{comment.author}</span>
                        <span className="text-[10px] text-muted">{new Date(comment.date).toLocaleDateString()}</span>
                        {comment.isPinned && (
                            <span className="flex items-center gap-1 text-[10px] text-primary font-bold">
                                <Pin className="w-3 h-3 fill-primary" />
                                Pinned by author
                            </span>
                        )}
                    </div>

                    <p className="text-xs mt-1 leading-relaxed break-words">{comment.content}</p>

                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => likePostComment(postId, comment.id)}
                            className={cn(
                                "flex items-center gap-1.5 text-[10px] font-bold transition-all active:scale-90",
                                (comment.userLikes || 0) > 0 ? "text-primary" : "text-muted hover:text-foreground"
                            )}
                        >
                            <Heart className={cn("w-3.5 h-3.5", (comment.userLikes || 0) > 0 && "fill-primary")} />
                            {comment.likes}
                        </button>

                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-[10px] font-bold text-muted hover:text-foreground transition-colors"
                        >
                            Reply
                        </button>

                        {isTopLevel && user?.name === postAuthor && (
                            <button
                                onClick={() => pinPostComment(postId, comment.id)}
                                className={cn(
                                    "flex items-center gap-1 text-[10px] font-bold transition-colors",
                                    comment.isPinned ? "text-primary" : "text-muted hover:text-primary opacity-0 group-hover:opacity-100"
                                )}
                            >
                                <Pin className="w-3 h-3" />
                                {comment.isPinned ? "Unpin" : "Pin"}
                            </button>
                        )}
                    </div>

                    {isReplying && (
                        <form onSubmit={handleReply} className="mt-3 flex gap-2">
                            <input
                                type="text"
                                autoFocus
                                placeholder={`Reply to @${comment.author}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="flex-1 bg-background/50 border border-border px-3 py-1.5 rounded-full text-[10px] outline-none focus:border-primary"
                            />
                            <button type="submit" className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors">
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </form>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-4">
                            {comment.replies.map((reply: PostComment) => (
                                <PostCommentItem
                                    key={reply.id}
                                    comment={reply}
                                    postId={postId}
                                    postAuthor={postAuthor}
                                    isTopLevel={false}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
