"use client";

import Link from "next/link";
import { Home, Users, History, Settings, Newspaper, Rss } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Users, label: "Subscriptions", href: "/subscriptions" },
    { icon: History, label: "History", href: "/history" },
];

const BOTTOM_ITEMS = [
    { icon: Newspaper, label: "News", href: "/news" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-16 md:w-64 h-full bg-surface border-r border-border flex flex-col fixed top-14 left-0 z-30 transition-all">
            <div className="flex-1 overflow-y-auto py-2">
                <nav className="flex flex-col gap-1 px-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-current")} />
                                <span className="hidden md:block">{item.label}</span>
                            </Link>
                        );
                    })}

                    <div className="my-2 border-t border-border mx-3" />

                    {BOTTOM_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-current")} />
                                <span className="hidden md:block">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-border hidden md:block">
                <div className="text-xs text-muted">
                    <p>© 2024 Eclipse</p>
                    <p>Privacy • Terms</p>
                </div>
            </div>
        </aside>
    );
}
