"use client";

import { Video, Sparkles } from "lucide-react";
import { useVideos } from "@/lib/videos";
import { VideoCard } from "@/components/ui/VideoCard";
import { useMemo } from "react";
import Link from "next/link";

export default function Home() {
  const { videos } = useVideos();

  // Randomize videos for "Recommendation" feel
  const randomizedVideos = useMemo(() => {
    return [...videos].sort(() => Math.random() - 0.5);
  }, [videos]);

  if (randomizedVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 border border-border">
          <Video className="w-10 h-10 text-muted" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No videos yet</h1>
        <p className="text-muted max-w-md mb-8">
          Be the first to upload a video to Eclipse.
          Start your channel today!
        </p>
        <Link href="/upload" className="px-6 py-2 bg-primary text-white font-bold rounded-[3px]">
          Upload Video
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Section: Recommended */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Recommended for you</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {randomizedVideos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              author={video.author}
              thumbnail={video.thumbnail}
              plays={`${video.views} views`}
              duration={video.duration}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
