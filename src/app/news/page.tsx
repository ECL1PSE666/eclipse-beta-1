"use client";

import { Newspaper, Zap, MessageSquare, ArrowRight, ShieldCheck, PlayCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const UPDATES = [
    {
        date: "Dec 23, 2025",
        title: "Platform Evolution: The Local-First Era",
        type: "Major Update",
        icon: Zap,
        description: "We've completely overhauled Eclipse to be a blazing-fast, local-first video platform. All YouTube integrations have been removed in favor of direct local file support with persistent IndexedDB storage.",
        changes: [
            "Complete removal of YouTube APIs and metadata fetching",
            "IndexedDB integration for persistent video file storage",
            "Auto-cleaning of legacy data for a fresh start",
            "Simplified upload interface"
        ],
        color: "bg-primary"
    },
    {
        date: "Dec 22, 2025",
        title: "Social Spark: Advanced Interactions",
        type: "Feature",
        icon: MessageSquare,
        description: "Community matters. We've introduced advanced conversation tools to help you engage with content and creators.",
        changes: [
            "Recursive comment replies (nested threads)",
            "Comment liking system with visual feedback",
            "Pinned comments: Authors can highlight top contributions",
            "Animated heart interactions"
        ],
        color: "bg-blue-500"
    },
    {
        date: "Dec 21, 2025",
        title: "The Ultimate Player Experience",
        type: "Improvement",
        icon: PlayCircle,
        description: "Viewing videos on Eclipse is now smoother than ever with our custom-built HTML5 player.",
        changes: [
            "Quick Play: Start videos directly from home page hover",
            "Thumbnail previews during upload",
            "Advanced player controls: Speed, Quality, and Volume persist",
            "Enhanced fullscreen HUD with custom UI"
        ],
        color: "bg-green-500"
    },
    {
        date: "Dec 20, 2025",
        title: "Account & Asset Stability",
        type: "Fix",
        icon: ShieldCheck,
        description: "Major fixes to the authentication and asset retrieval systems ensure your profile and videos are always there when you return.",
        changes: [
            "Profile persistence fix: Avatars and banners now save correctly",
            "Subscriber system implementation and persistence",
            "Watch history tracking (up to 50 videos)",
            "Multi-method login (Handle/Email + Password)"
        ],
        color: "bg-zinc-600"
    }
];

export default function NewsPage() {
    return (
        <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-500">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Newspaper className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold">What's New</h1>
                </div>
                <p className="text-muted text-lg">Stay up to date with the latest features and improvements on Eclipse.</p>
            </header>

            <div className="relative space-y-12 before:absolute before:left-[17px] before:top-2 before:bottom-0 before:w-0.5 before:bg-border md:before:left-1/2 md:before:-translate-x-px">
                {UPDATES.map((update, idx) => (
                    <div key={idx} className={cn(
                        "relative flex flex-col md:flex-row gap-8 items-start md:items-center",
                        idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    )}>
                        {/* Timeline dot */}
                        <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-9 h-9 rounded-full border-4 border-background bg-zinc-800 flex items-center justify-center z-10">
                            <update.icon className="w-4 h-4 text-white" />
                        </div>

                        {/* Card */}
                        <div className={cn(
                            "flex-1 bg-surface border border-border p-6 rounded-2xl shadow-xl hover:border-primary/50 transition-all group w-full",
                            idx % 2 === 0 ? "md:text-right" : "md:text-left"
                        )}>
                            <div className={cn(
                                "flex items-center gap-3 mb-4",
                                idx % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                            )}>
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase", update.color)}>
                                    {update.type}
                                </span>
                                <span className="text-xs text-muted font-bold">{update.date}</span>
                            </div>

                            <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{update.title}</h2>
                            <p className="text-sm text-muted leading-relaxed mb-6">{update.description}</p>

                            <ul className={cn(
                                "grid grid-cols-1 gap-2 border-t border-border pt-4",
                                idx % 2 === 0 ? "md:items-end" : "md:items-start"
                            )}>
                                {update.changes.map((change, cIdx) => (
                                    <li key={cIdx} className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {change}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Empty space for md layout */}
                        <div className="hidden md:block flex-1" />
                    </div>
                ))}
            </div>

            <footer className="mt-20 p-12 bg-zinc-900/50 rounded-3xl border border-border text-center">
                <h3 className="text-xl font-bold mb-3">More updates coming soon!</h3>
                <p className="text-muted text-sm max-w-md mx-auto mb-8">
                    We're working hard to make Eclipse the best platform for creators. Follow our evolution as we add more tools for you.
                </p>
                <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors">
                    Back to Feed <ArrowRight className="w-4 h-4" />
                </Link>
            </footer>
        </div>
    );
}
