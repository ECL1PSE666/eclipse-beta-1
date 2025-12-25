"use client";

import Link from "next/link";
import { Play, MoreVertical } from "lucide-react";
import Image from "next/image";
import { ensureStringSrc } from "@/lib/utils";

interface VideoCardProps {
    id: string;
    title: string;
    author: string;
    thumbnail: string;
    plays: string;
    duration: string;
    authorAvatar?: string;
    uploadDate?: string;
    horizontal?: boolean;
}

export function VideoCard({
    id,
    title,
    author,
    thumbnail,
    plays,
    duration,
    authorAvatar,
    uploadDate = "just now",
    horizontal = false
}: VideoCardProps) {
    if (horizontal) {
        return (
            <Link href={`/watch/${id}`} className="group flex gap-3 cursor-pointer">
                <div className="relative aspect-video w-40 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                        src={ensureStringSrc(thumbnail, `https://picsum.photos/seed/${id}/320/180`)}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 text-[10px] font-bold text-white rounded">
                        {duration}
                    </div>
                </div>
                <div className="flex flex-col min-w-0 py-0.5">
                    <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-[12px] text-muted mt-1 hover:text-foreground transition-colors truncate">
                        {author}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-muted mt-1">
                        <span>{plays}</span>
                        <span>•</span>
                        <span>{uploadDate}</span>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <div className="group flex flex-col gap-3 cursor-pointer">
            <Link href={`/watch/${id}`} className="relative block aspect-video bg-zinc-800 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                <Image
                    src={ensureStringSrc(thumbnail, `https://picsum.photos/seed/${id}/640/360`)}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white rounded-[4px]">
                    {duration}
                </div>
            </Link>
            <div className="flex gap-3 px-1">
                {authorAvatar && (
                    <div className="w-9 h-9 rounded-full bg-zinc-800 flex-shrink-0 relative overflow-hidden mt-1">
                        <Image src={ensureStringSrc(authorAvatar, `https://picsum.photos/seed/${author}/200`)} alt={author} fill className="object-cover" />
                    </div>
                )}
                <div className="flex shadow-none flex-col flex-1 min-w-0">
                    <Link href={`/watch/${id}`} className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {title}
                    </Link>
                    <div className="mt-1 flex flex-col">
                        <Link href={`/channel/${author}`} className="text-[12px] text-muted hover:text-foreground transition-colors truncate">
                            {author}
                        </Link>
                        <div className="flex items-center gap-1 text-[12px] text-muted whitespace-nowrap">
                            <span>{plays}</span>
                            <span>•</span>
                            <span>{uploadDate}</span>
                        </div>
                    </div>
                </div>
                <button className="h-fit p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-800 rounded-full">
                    <MoreVertical className="w-4 h-4 text-muted" />
                </button>
            </div>
        </div>
    );
}
