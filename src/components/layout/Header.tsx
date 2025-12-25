"use client";

import Link from "next/link";
import { Search, Upload, Bell, Menu, User, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Image from "next/image";
import { ensureStringSrc } from "@/lib/utils";

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="h-14 bg-surface border-b border-border fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4">
            {/* Left: Logo & Menu */}
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-white/10 rounded-full md:hidden text-foreground">
                    <Menu className="w-5 h-5" />
                </button>
                <Link href="/" className="flex items-center gap-2">
                    {/* Logo Icon (Cloud-like or simple circle) */}
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
                        eclipse
                    </span>
                </Link>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-xl mx-4 hidden sm:block">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search for videos"
                        className="w-full bg-[#2a2a2a] border border-transparent focus:border-primary/50 text-sm text-foreground placeholder:text-muted py-2 pl-10 pr-4 rounded-[4px] outline-none transition-all"
                    />
                    <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-foreground transition-colors" />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                <button className="p-2 text-muted hover:text-foreground hover:bg-white/5 rounded-full transition-colors sm:hidden">
                    <Search className="w-5 h-5" />
                </button>

                {user ? (
                    <>
                        <Link
                            href="/upload"
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-border rounded-[3px] text-sm text-foreground hover:border-muted transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload</span>
                        </Link>

                        <button className="p-2 text-muted hover:text-foreground hover:bg-white/5 rounded-full transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-surface" />
                        </button>

                        <div className="flex items-center gap-2">
                            <button onClick={logout} className="text-xs text-muted hover:text-foreground">Logout</button>
                            <Link href={`/channel/${user.name}`} className="p-1 hover:bg-white/5 rounded-full ml-1">
                                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden border border-border relative">
                                    <Image src={ensureStringSrc(user.avatar, `https://picsum.photos/seed/${user.name}/200`)} alt={user.name} fill className="object-cover" />
                                </div>
                            </Link>
                        </div>
                    </>
                ) : (
                    <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-[3px] text-sm font-bold hover:bg-primary/20 transition-colors">
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                    </Link>
                )}
            </div>
        </header>
    );
}
