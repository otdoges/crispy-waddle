"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";

import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { getCurrentUser } from "~/lib/auth";
import { supabase } from "~/lib/supabase";

interface Server {
    id: string;
    name: string;
}

export const NavigationSidebar = () => {
    const [user, setUser] = useState<any>(null);
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = await getCurrentUser();
                
                if (currentUser) {
                    setUser(currentUser);
                    
                    const { data } = await supabase
                        .from("servers")
                        .select("*")
                        .eq("user_id", currentUser.id);
                        
                    if (data) {
                        setServers(data as Server[]);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return <div className="flex h-full w-[72px] flex-col items-center justify-center bg-zinc-950 py-3">Loading...</div>;
    }

    // Just render a minimal sidebar if no user is found
    if (!user && !loading) {
        return (
            <div className="flex h-full w-[72px] flex-col items-center space-y-4 bg-zinc-950 py-3">
                <Link href="/" className="flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-emerald-600 transition hover:rounded-[16px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </Link>
                <Separator className="mx-auto h-[2px] w-10 rounded-md bg-zinc-800" />
                <div className="mt-auto flex flex-col items-center gap-4 pb-3">
                    <ThemeButton />
                    <Link href="/login" className="h-[48px] w-[48px] overflow-hidden rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-white hover:bg-zinc-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-[72px] flex-col items-center space-y-4 bg-zinc-950 py-3">
            <Link href="/" className="flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-emerald-600 transition hover:rounded-[16px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            </Link>
            
            <Separator className="mx-auto h-[2px] w-10 rounded-md bg-zinc-800" />
            
            <ScrollArea className="w-full flex-1">
                <div className="flex flex-col items-center space-y-4 py-2">
                    <NavigationItem href="/chat" icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    } />
                    
                    {servers?.map((server: Server) => (
                        <NavigationItem key={server.id} href={`/servers/${server.id}`} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="10" r="3" />
                                <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
                            </svg>
                        } />
                    ))}
                </div>
            </ScrollArea>
            
            <div className="mt-auto flex flex-col items-center gap-4 pb-3">
                <ThemeButton />
                <Link href="/profile" className="h-[48px] w-[48px] overflow-hidden rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-white hover:bg-zinc-700">
                    {user?.email?.substring(0, 1).toUpperCase() || "U"}
                </Link>
            </div>
        </div>
    );
};

function NavigationItem({
    href,
    icon,
}: {
    href: string;
    icon: React.ReactNode;
}) {
    return (
        <Link href={href} className="group flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-zinc-800 transition hover:rounded-[16px] hover:bg-emerald-600">
            <div className="text-zinc-400 transition group-hover:text-white">
                {icon}
            </div>
        </Link>
    );
}

function ThemeButton() {
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
        >
            {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            )}
        </button>
    );
}