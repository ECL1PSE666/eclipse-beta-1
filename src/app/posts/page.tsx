"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ImageIcon,
    X,
    Send,
    Loader2,
    Link2
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { usePosts } from "@/lib/posts";
import { cn, ensureStringSrc } from "@/lib/utils";
import { PostCard } from "@/components/ui/PostCard";

export default function PostsPage() {
    const { user } = useAuth();
    const { posts, addPost } = usePosts();
    const [content, setContent] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const clearSelection = () => {
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
    };

    const handleCreatePost = async () => {
        if ((!content.trim() && !file) || !user) return;
        setIsPosting(true);
        try {
            await addPost({
                author: user.name,
                authorAvatar: user.avatar,
                content: content,
                hasImage: !!file
            }, file || undefined);

            setContent("");
            clearSelection();
        } catch (e) {
            console.error(e);
            alert("Failed to create post");
        } finally {
            setIsPosting(false);
        }
    };

    const insertLink = () => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const selection = content.substring(start, end);
        const linkText = selection || "Text";
        const newText = content.substring(0, start) + `[${linkText}](https://...)` + content.substring(end);
        setContent(newText);

        // Return focus
        setTimeout(() => {
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(start + 1, start + 1 + linkText.length);
        }, 0);
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-8">Community Feed</h1>

            {/* Post Creation area */}
            {user ? (
                <div className="bg-surface border border-border rounded-2xl p-4 mb-8">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 relative overflow-hidden flex-shrink-0">
                            <Image src={ensureStringSrc(user.avatar, `https://picsum.photos/seed/${user.name}/200`)} alt={user.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's happening?"
                                className="w-full bg-transparent border-none outline-none text-lg resize-none min-h-[100px]"
                            />

                            {preview && (
                                <div className="relative rounded-xl overflow-hidden border border-border">
                                    <Image src={preview} alt="Preview" width={800} height={450} className="w-full object-contain max-h-[400px] bg-black/20" />
                                    <button
                                        onClick={clearSelection}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-sm transition-colors"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-1">
                                    <label className="p-2 text-primary hover:bg-primary/10 rounded-full cursor-pointer transition-colors">
                                        <ImageIcon className="w-5 h-5" />
                                        <input type="file" accept="image/*,image/gif" className="hidden" onChange={handleFileSelect} />
                                    </label>
                                    <button
                                        onClick={insertLink}
                                        className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                        title="Add link"
                                    >
                                        <Link2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleCreatePost}
                                    disabled={isPosting || (!content.trim() && !file)}
                                    className="px-6 py-2 bg-primary text-white font-bold rounded-full disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-zinc-800/30 rounded-xl text-center mb-8 border border-border border-dashed">
                    <p className="text-muted text-sm italic">Please <Link href="/login" className="text-primary font-bold">login</Link> to share posts with the community.</p>
                </div>
            )}

            {/* Posts List */}
            <div className="space-y-6">
                {!mounted ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-muted" />
                    </div>
                ) : (
                    <>
                        {posts.length === 0 && <p className="text-center text-muted py-20 italic">No posts yet. Be the first to share something!</p>}
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
