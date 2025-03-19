"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { getCurrentUser } from "~/lib/auth";

interface Channel {
    id: string;
    name: string;
    type: "TEXT" | "VOICE" | "VIDEO";
}

interface ServerSidebarProps {
    serverId: string;
}

// Add this interface near the top with other interfaces
interface User {
    user_metadata?: {
        username?: string;
    };
}

export const ServerSidebar = ({ serverId }: ServerSidebarProps) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [serverName, setServerName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);

            // In a real implementation, we would fetch the server details and channels
            // For now, we'll use dummy data
            setServerName(serverId === "1" ? "General" : serverId === "2" ? "Gaming" : "Development");

            setChannels([
                { id: "1", name: "general", type: "TEXT" },
                { id: "2", name: "voice-chat", type: "VOICE" },
                { id: "3", name: "announcements", type: "TEXT" },
                { id: "4", name: "video-room", type: "VIDEO" },
            ]);

            setIsLoading(false);
        };

        fetchData();
    }, [serverId]);

    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center">Loading...</div>;
    }

    if (!currentUser && !isLoading) {
        return redirect("/login");
    }

    return (
        <div className="flex h-full w-60 flex-col bg-discord-channelbar">
            <div className="flex h-12 items-center px-4 shadow-sm">
                <h2 className="font-semibold text-white">{serverName}</h2>
            </div>

            <ScrollArea className="flex-1 px-3">
                <div className="mt-2">
                    <div className="mb-2">
                        <div className="flex items-center justify-between px-1 py-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Text Channels</h3>
                            <button className="text-zinc-400 hover:text-zinc-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                </svg>
                            </button>
                        </div>

                        {channels
                            .filter((channel) => channel.type === "TEXT")
                            .map((channel) => (
                                <Link
                                    key={channel.id}
                                    href={`/servers/${serverId}/channels/${channel.id}`}
                                    className="group mb-1 flex items-center rounded px-2 py-1 hover:bg-zinc-700/50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-zinc-400">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">
                                        {channel.name}
                                    </span>
                                </Link>
                            ))}
                    </div>

                    <div className="mb-2">
                        <div className="flex items-center justify-between px-1 py-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Voice Channels</h3>
                            <button className="text-zinc-400 hover:text-zinc-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                </svg>
                            </button>
                        </div>

                        {channels
                            .filter((channel) => channel.type === "VOICE")
                            .map((channel) => (
                                <Link
                                    key={channel.id}
                                    href={`/servers/${serverId}/channels/${channel.id}`}
                                    className="group mb-1 flex items-center rounded px-2 py-1 hover:bg-zinc-700/50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-zinc-400">
                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                        <line x1="12" y1="19" x2="12" y2="23" />
                                        <line x1="8" y1="23" x2="16" y2="23" />
                                    </svg>
                                    <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">
                                        {channel.name}
                                    </span>
                                </Link>
                            ))}
                    </div>

                    <div className="mb-2">
                        <div className="flex items-center justify-between px-1 py-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Video Channels</h3>
                            <button className="text-zinc-400 hover:text-zinc-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                </svg>
                            </button>
                        </div>

                        {channels
                            .filter((channel) => channel.type === "VIDEO")
                            .map((channel) => (
                                <Link
                                    key={channel.id}
                                    href={`/servers/${serverId}/channels/${channel.id}`}
                                    className="group mb-1 flex items-center rounded px-2 py-1 hover:bg-zinc-700/50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-zinc-400">
                                        <polygon points="23 7 16 12 23 17 23 7" />
                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                    </svg>
                                    <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">
                                        {channel.name}
                                    </span>
                                </Link>
                            ))}
                    </div>
                </div>
            </ScrollArea>

            <div className="mt-auto border-t border-zinc-700 p-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-discord-dark flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
{(currentUser as { user_metadata?: { username?: string } })?.user_metadata?.username?.substring(0, 2) ?? "U"}
                        </span>
                    </div>
                    <div className="flex-1 truncate">
                        <p className="text-sm font-medium text-white truncate">
                            
                            {currentUser?.user_metadata?.username ?? "User"}
                        </p>
                        <p className="text-xs text-zinc-400">Online</p>
                    </div>
                </div>
            </div>
        </div>
    );
};