"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { getCurrentUser } from "~/lib/auth";
import { createClient } from '@supabase/supabase-js';
import { supabase } from "~/lib/supabase";

interface Server {
    id: string;
    name: string;
    imageUrl: string | null;
}

// Remove direct initialization and use the imported supabase client

export const NavigationSidebar = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [servers, setServers] = useState<Server[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);

            if (user) {
                // Fetch servers from Supabase
                const { data, error } = await supabase
                    .from('servers')
                    .select('id, name, image_url')
                    .eq('owner_id', user.id)
                    .order('created_at', { ascending: true });

                if (!error && data) {
                    setServers(data.map(server => ({
                        ...server,
                        imageUrl: server.image_url
                    })));
                }
            }
            setIsLoading(false);
        };

        fetchUser();
    }, []);

    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center">Loading...</div>;
    }

    if (!currentUser && !isLoading) {
        return redirect("/login");
    }

    return (
        <div className="flex h-full w-[72px] flex-col items-center space-y-4 bg-discord-sidebar py-3">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/">
                            <div className="group flex h-12 w-12 items-center justify-center rounded-[24px] bg-discord-dark transition-all hover:rounded-[16px] hover:bg-discord">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-semibold">
                        Home
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Separator className="mx-auto h-[2px] w-10 rounded-md bg-zinc-700" />

            <ScrollArea className="w-full flex-1">
                <div className="mt-2 flex flex-col items-center gap-4">
                    {servers.map((server) => (
                        <TooltipProvider key={server.id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href={`/servers/${server.id}`}>
                                        <div className="group relative flex h-12 w-12 items-center justify-center rounded-[24px] bg-discord-dark transition-all hover:rounded-[16px] hover:bg-discord">
                                            <span className="text-lg font-semibold text-white">
                                                {server.name.substring(0, 1)}
                                            </span>
                                        </div>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="text-xs font-semibold">
                                    {server.name}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </ScrollArea>

            <div className="mt-auto pb-3">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="group flex h-12 w-12 items-center justify-center rounded-[24px] bg-zinc-700 transition-all hover:rounded-[16px] hover:bg-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 group-hover:text-white">
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                </svg>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs font-semibold">
                            Add a Server
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};