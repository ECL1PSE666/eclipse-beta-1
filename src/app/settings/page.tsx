"use client";

import { useState, useEffect } from "react";
import { Camera, Image as ImageIcon, Save, Check } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { fileToBase64, ensureStringSrc } from "@/lib/utils";

export default function SettingsPage() {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState("");
    const [handle, setHandle] = useState("");
    const [description, setDescription] = useState("");
    const [avatar, setAvatar] = useState("");
    const [banner, setBanner] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setHandle(user.handle);
            setDescription(user.description);
            setAvatar(user.avatar);
            setBanner(user.banner);
        }
    }, [user]);

    if (!user) {
        return <div className="p-12 text-center font-bold">Please log in to edit your channel.</div>;
    }

    const handleSave = () => {
        updateProfile({
            name,
            handle,
            description,
            avatar,
            banner
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleFileChange = async (type: 'avatar' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                if (type === 'avatar') setAvatar(base64);
                else setBanner(base64);
            } catch (e) {
                console.error(`Failed to convert ${type} to Base64`, e);
            }
        }
    };

    return (
        <div className="max-w-[1000px] mx-auto p-4 md:p-12 space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-bold">Channel customization</h1>
                    <p className="text-sm text-muted">Manage your channel's branding and description</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    <span>{saved ? "Saved" : "Publish"}</span>
                </button>
            </div>

            <div className="space-y-12">
                {/* Branding Section */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold">Branding</h2>

                    {/* Banner */}
                    <div className="space-y-2">
                        <span className="text-sm font-bold">Banner image</span>
                        <p className="text-xs text-muted mb-4">This image will appear across the top of your channel</p>
                        <div className="w-full aspect-[6/1] md:aspect-[8/1] bg-zinc-800 rounded-xl relative overflow-hidden group">
                            <Image src={ensureStringSrc(banner, `https://picsum.photos/seed/defaultbanner/1200/200`)} alt="Banner" fill className="object-cover opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="cursor-pointer flex flex-col items-center gap-2 text-white font-bold">
                                    <Camera className="w-8 h-8" />
                                    <span>Change banner</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange('banner', e)} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="space-y-2">
                            <span className="text-sm font-bold">Picture</span>
                            <p className="text-xs text-muted max-w-xs">Your profile picture will appear where your channel is presented on Eclipse.</p>
                            <div className="w-32 h-32 rounded-full bg-zinc-800 relative overflow-hidden group mt-4">
                                <Image src={ensureStringSrc(avatar, `https://picsum.photos/seed/defaultavatar/200`)} alt="Avatar" fill className="object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <label className="cursor-pointer">
                                        <Camera className="w-6 h-6 text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange('avatar', e)} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-surface border border-border p-3 rounded-lg outline-none focus:border-primary text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold">Handle</label>
                                <input
                                    type="text"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    className="w-full bg-surface border border-border p-3 rounded-lg outline-none focus:border-primary text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold">Description</label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-surface border border-border p-3 rounded-lg outline-none focus:border-primary text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
