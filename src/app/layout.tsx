import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/lib/auth";
import { VideoProvider } from "@/lib/videos";
import { PostsProvider } from "@/lib/posts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eclipse",
  description: "A SoundCloud-styled video platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <PostsProvider>
            <VideoProvider>
              <Header />
              <Sidebar />

              {/* Main Content Area */}
              {/* ml-16 (mobile) ml-64 (desktop) to offset sidebar */}
              {/* pt-14 (header) - No bottom padding needed as player is gone */}
              <main className="ml-16 md:ml-64 pt-14 min-h-screen">
                {children}
              </main>
            </VideoProvider>
          </PostsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
