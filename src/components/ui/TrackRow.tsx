"use client";

import { Play, Heart, Share2, MoreHorizontal } from "lucide-react";
import Image from "next/image";

interface TrackRowProps {
    id: string;
    title: string;
    artist: string;
    plays: string;
    likes: string;
    duration: string;
    image: string;
}

export function TrackRow({ id, title, artist, plays, likes, duration, image }: TrackRowProps) {
    return (
        <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-sm group transition-colors cursor-pointer border-b border-border/50 last:border-0">
            <div className="w-12 h-12 relative flex-shrink-0 bg-zinc-800">
                <Image src={image} alt={title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-sm text-foreground font-medium truncate group-hover:text-primary transition-colors">{title}</span>
                <span className="text-xs text-muted truncate">{artist}</span>
            </div>

            <div className="hidden sm:flex items-center gap-6 text-xs text-muted">
                <div className="flex items-center gap-1 w-16">
                    <Play className="w-3 h-3" />
                    <span>{plays}</span>
                </div>
                <div className="flex items-center gap-1 w-12">
                    <Heart className="w-3 h-3" />
                    <span>{likes}</span>
                </div>
                <span className="w-10 text-right font-mono">{duration}</span>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-white/10 rounded-full text-foreground"><Heart className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white/10 rounded-full text-foreground"><Share2 className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white/10 rounded-full text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
        </div>
    );
}
