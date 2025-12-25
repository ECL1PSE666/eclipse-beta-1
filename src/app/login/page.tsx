"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AlertCircle, User as UserIcon, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const [method, setMethod] = useState<"email" | "handle">("email");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (method === "handle") {
            setError("Handle-based login is temporarily disabled. Please use your email.");
            setIsLoading(false);
            return;
        }

        const res = await login(identifier, password);
        console.log('Login result:', res);
        if (res.success) {
            console.log('Login successful, redirecting...');
            router.push("/");
        } else {
            console.error('Login failed:', res.error);
            setError(res.error || "Login failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl border border-border shadow-2xl">
                <h1 className="text-3xl font-bold mb-2 text-center">Login to Eclipse</h1>
                <p className="text-muted text-center mb-8 text-sm">Welcome back! Choose your preferred login method.</p>

                {/* Method Toggle */}
                <div className="flex p-1 bg-black rounded-lg border border-border mb-8">
                    <button
                        onClick={() => { setMethod("email"); setIdentifier(""); }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all",
                            method === "email" ? "bg-zinc-800 text-foreground" : "text-muted hover:text-foreground"
                        )}
                    >
                        <Mail className="w-4 h-4" />
                        Email
                    </button>
                    <button
                        onClick={() => { setMethod("handle"); setIdentifier(""); }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all",
                            method === "handle" ? "bg-zinc-800 text-foreground" : "text-muted hover:text-foreground"
                        )}
                    >
                        <UserIcon className="w-4 h-4" />
                        @Login
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider">
                            {method === "email" ? "Email Address" : "Account Handle"}
                        </label>
                        <div className="relative group">
                            <input
                                type={method === "email" ? "email" : "text"}
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-black border border-border p-3 pl-10 rounded-lg outline-none focus:border-primary transition-all text-sm group-hover:border-zinc-700"
                                placeholder={method === "email" ? "you@example.com" : "@handle"}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                                {method === "email" ? <Mail className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider">Password</label>
                            <Link href="#" className="text-[10px] text-primary hover:underline font-bold uppercase">Forgot?</Link>
                        </div>
                        <div className="relative group">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-border p-3 pl-10 rounded-lg outline-none focus:border-primary transition-all text-sm group-hover:border-zinc-700"
                                placeholder="••••••••"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                                <Lock className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-foreground text-background font-bold py-3 rounded-lg hover:opacity-90 transition-all text-sm mt-4 shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border text-center">
                    <p className="text-sm text-muted">
                        New to Eclipse?{" "}
                        <Link href="/register" className="text-foreground font-bold hover:underline transition-all">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
