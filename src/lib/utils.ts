import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const formatSeconds = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const ensureStringSrc = (src: any, fallback: string): string => {
    if (typeof src === 'string' && src.length > 0) return src;
    return fallback;
};

export const parseMarkdownLinks = (content: string) => {
    // Regex to find [text](url) patterns
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
        }

        // Add the link
        const label = match[1];
        const url = match[2];
        parts.push({ label, url, isLink: true });

        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }

    return parts;
};
