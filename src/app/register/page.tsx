"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const res = await register(email, name, handle, password);
        if (res.success) {
            router.push("/");
        } else {
            setError(res.error || "Registration failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl border border-border shadow-2xl">
                <h1 className="text-3xl font-bold mb-2 text-center">Join Eclipse</h1>
                <p className="text-muted text-center mb-8 text-sm">Create an account to start sharing and subscribing.</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider">Display Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black border border-border p-3 rounded-lg outline-none focus:border-primary transition-colors text-sm"
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider">Handle</label>
                            <input
                                type="text"
                                required
                                value={handle}
                                onChange={(e) => setHandle(e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}`)}
                                className="w-full bg-black border border-border p-3 rounded-lg outline-none focus:border-primary transition-colors text-sm"
                                placeholder="@handle"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-border p-3 rounded-lg outline-none focus:border-primary transition-colors text-sm"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-border p-3 rounded-lg outline-none focus:border-primary transition-colors text-sm"
                            placeholder="Min 6 characters"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-foreground text-background font-bold py-3 rounded-lg hover:opacity-90 transition-all text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border text-center">
                    <p className="text-sm text-muted">
                        Already have an account?{" "}
                        <Link href="/login" className="text-foreground font-bold hover:underline transition-all">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
