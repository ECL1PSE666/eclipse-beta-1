"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useVideos } from "@/lib/videos";
import { fileToBase64, formatSeconds, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
    const { user } = useAuth();
    const { addVideo } = useVideos();
    const [step, setStep] = useState<"select" | "details" | "success">("select");
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [duration, setDuration] = useState("0:00");
    const [isPublishing, setIsPublishing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h1 className="text-xl font-bold">Sign in to upload</h1>
                <Link href="/login" className="px-6 py-2 bg-primary text-white rounded-[3px] font-bold">Sign In</Link>
            </div>
        );
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Check file size (limit to 100MB for better performance)
            const maxSize = 100 * 1024 * 1024; // 100MB in bytes
            if (selectedFile.size > maxSize) {
                alert(`File is too large (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Please select a video smaller than 100MB.`);
                return;
            }

            console.log(`Selected file: ${selectedFile.name}, size: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);

            setFile(selectedFile);
            setTitle(selectedFile.name.split('.')[0]);

            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                setDuration(formatSeconds(video.duration));
            };
            video.src = URL.createObjectURL(selectedFile);
            setStep("details");
        }
    };

    const handlePublish = async () => {
        if (!user || !file) return;
        setIsPublishing(true);

        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        setUploadProgress(`Starting upload... (${fileSizeMB}MB)`);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const videoPath = `${user.id}/${fileName}`;

            // 1. Upload Video with timeout
            console.log(`Step 1: Uploading video to storage... (${fileSizeMB}MB)`);
            setUploadProgress(`Uploading video... (${fileSizeMB}MB - this may take a few minutes)`);

            // Create a timeout promise
            const uploadPromise = supabase.storage
                .from('videos')
                .upload(videoPath, file);

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Upload timeout - file may be too large or connection is slow')), 5 * 60 * 1000) // 5 minutes
            );

            const { error: videoError } = await Promise.race([uploadPromise, timeoutPromise]) as any;

            if (videoError) {
                console.error('Video upload error:', videoError);
                throw videoError;
            }
            console.log('Video uploaded successfully');

            const { data: videoUrlData } = supabase.storage.from('videos').getPublicUrl(videoPath);
            const videoUrl = videoUrlData.publicUrl;
            console.log('Video URL:', videoUrl);

            // 2. Upload Thumbnail
            let thumbUrl = `https://picsum.photos/seed/${Math.random()}/640/360`;
            if (thumbnail) {
                console.log('Step 2: Uploading thumbnail...');
                setUploadProgress("Uploading thumbnail...");
                const thumbExt = thumbnail.name.split('.').pop();
                const thumbPath = `${user.id}/${Math.random().toString(36).substring(2)}.${thumbExt}`;
                const { error: thumbError } = await supabase.storage
                    .from('thumbnails')
                    .upload(thumbPath, thumbnail);

                if (!thumbError) {
                    const { data: tUrlData } = supabase.storage.from('thumbnails').getPublicUrl(thumbPath);
                    thumbUrl = tUrlData.publicUrl;
                    console.log('Thumbnail uploaded:', thumbUrl);
                } else {
                    console.warn('Thumbnail upload failed, using placeholder:', thumbError);
                }
            }

            // 3. Save to Database
            console.log('Step 3: Saving to database...');
            setUploadProgress("Finishing...");
            await addVideo({
                title,
                description,
                author: user.name,
                authorAvatar: user.avatar,
                authorBanner: user.banner,
                thumbnail: thumbUrl,
                videoUrl: videoUrl,
                duration: duration
            });

            console.log('Upload complete! Showing success screen...');
            setStep("success");
        } catch (e: any) {
            console.error('Upload failed with error:', e);
            alert(`Upload failed: ${e.message || "Unknown error"}`);
        } finally {
            setIsPublishing(false);
            setUploadProgress("");
        }
    };

    if (step === "success") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                    <Check className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Video Uploaded!</h1>
                <p className="text-muted mb-8">Your video is now live and persistent.</p>
                <div className="flex gap-4">
                    <Link href={`/channel/${user.name}`} className="px-6 py-2 border border-border hover:bg-white/5 rounded-[3px]">View Channel</Link>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-white font-bold rounded-[3px]">Upload Another</button>
                </div>
            </div>
        );
    }

    if (step === "details") {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                    <h1 className="text-xl font-bold">Upload Details</h1>
                    <button onClick={() => setStep("select")} className="text-muted hover:text-foreground"><X className="w-6 h-6" /></button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-background border border-border p-3 rounded-sm outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-background border border-border p-3 rounded-sm outline-none focus:border-primary resize-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Thumbnail</label>
                            <div className="w-40 h-24 bg-zinc-800 border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary relative overflow-hidden group rounded-sm">
                                {thumbnail ? (
                                    <Image
                                        src={URL.createObjectURL(thumbnail)}
                                        alt="Thumbnail preview"
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-muted group-hover:text-foreground">
                                        <ImageIcon className="w-6 h-6" />
                                        <span className="text-xs">Upload file</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && setThumbnail(e.target.files[0])} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface border border-border p-4 rounded-md h-fit">
                        <div className="aspect-video bg-black mb-3 text-zinc-600 flex items-center justify-center text-xs relative overflow-hidden">
                            <span className="z-10">Video Preview</span>
                            <div className="absolute bottom-2 right-2 bg-black/80 px-1 py-0.5 rounded text-[10px] text-white font-bold">{duration}</div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={handlePublish} disabled={isPublishing} className="px-8 py-3 bg-primary text-white font-bold rounded-[3px] hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50">
                        {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isPublishing ? uploadProgress : "Publish Video"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-3xl font-bold mb-2">Upload to Eclipse</h1>
                <p className="text-muted mb-8">Share your videos with the community.</p>
                <div className="w-full max-w-lg space-y-6">
                    <div className="flex flex-col items-center p-12 border-2 border-dashed border-border rounded-2xl group hover:border-primary transition-all cursor-pointer relative bg-zinc-900/30">
                        <Upload className="w-12 h-12 text-muted group-hover:text-primary mb-4 transition-colors" />
                        <p className="font-bold">Drag and drop video files to upload</p>
                        <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileSelect} />
                        <button className="mt-6 px-6 py-2 bg-white text-black font-bold rounded-full text-sm">Select File</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
