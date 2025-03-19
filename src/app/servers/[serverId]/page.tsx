import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { NavigationSidebar } from "~/components/navigation/navigation-sidebar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { getCurrentUser } from "~/lib/auth";
import { supabase } from "~/lib/supabase";
import { HydrateClient } from "~/trpc/server";

interface ServerPageProps {
  params: {
    serverId: string;
  };
}

export default async function ServerPage({ params }: ServerPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch server details
  const { data: serverData, error: serverError } = await supabase
    .from("servers")
    .select("*")
    .eq("id", params.serverId)
    .single();

  if (serverError || !serverData) {
    return redirect("/");
  }

  // Fetch channels for this server
  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .eq("server_id", params.serverId)
    .order("position", { ascending: true });

  // Fetch members of this server
  const { data: members } = await supabase
    .from("server_members")
    .select("*, user_profiles(*)")
    .eq("server_id", params.serverId);

  // Fetch the first channel for initial display
  const initialChannel = channels && channels.length > 0 ? channels[0] : null;
  
  // Fetch messages for the initial channel
  let messages = [];
  if (initialChannel) {
    const { data: messageData } = await supabase
      .from("messages")
      .select("*, user_profiles(*)")
      .eq("channel_id", initialChannel.id)
      .order("created_at", { ascending: false })
      .limit(50);
      
    messages = messageData || [];
  }

  const isOwner = serverData.owner_id === user.id;

  return (
    <HydrateClient>
      <div className="flex h-screen bg-zinc-900 text-zinc-100">
        <NavigationSidebar />
        
        {/* Server sidebar */}
        <div className="hidden w-60 flex-col bg-zinc-800 md:flex">
          <div className="flex h-14 items-center px-4 shadow-md">
            <h2 className="font-semibold text-white">{serverData.name}</h2>
            {isOwner && (
              <button className="ml-auto rounded-full p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex flex-1 flex-col gap-2 p-3">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between px-1 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <span>Text Channels</span>
                {isOwner && (
                  <button className="rounded-full p-1 hover:bg-zinc-700 hover:text-zinc-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="space-y-0.5">
                {channels && channels.filter(c => c.type === 'TEXT').map((channel) => (
                  <Link 
                    key={channel.id} 
                    href={`/servers/${params.serverId}/channels/${channel.id}`}
                    className="flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {channel.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="space-y-0.5">
              <div className="flex items-center justify-between px-1 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <span>Voice Channels</span>
                {isOwner && (
                  <button className="rounded-full p-1 hover:bg-zinc-700 hover:text-zinc-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="space-y-0.5">
                {channels && channels.filter(c => c.type === 'VOICE').map((channel) => (
                  <Link 
                    key={channel.id} 
                    href={`/servers/${params.serverId}/channels/${channel.id}`}
                    className="flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                    {channel.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <Separator className="my-2 bg-zinc-700" />
            
            <div className="space-y-0.5">
              <div className="px-1 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <span>Members - {members?.length || 0}</span>
              </div>
              
              <div className="space-y-0.5">
                {members && members.map((member) => (
                  <div key={member.id} className="flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-zinc-400 hover:bg-zinc-700/50">
                    <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700">
                      <span className="text-xs text-zinc-300">
                        {member.user_profiles?.username?.substring(0, 1) || "?"}
                      </span>
                    </div>
                    <span className="truncate">{member.user_profiles?.username}</span>
                    {member.role !== "GUEST" && (
                      <span className={`ml-1.5 rounded px-1 py-0.5 text-xs ${
                        member.role === "ADMIN" ? "bg-red-900/50 text-red-300" : "bg-emerald-900/50 text-emerald-300"
                      }`}>
                        {member.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* User section */}
          <div className="mt-auto flex items-center gap-2 bg-zinc-900 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800">
              <span className="text-sm font-medium text-zinc-300">
                {user.user_metadata?.username?.substring(0, 1) || user.email?.substring(0, 1) || "?"}
              </span>
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-zinc-200">
                {user.user_metadata?.username || user.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-zinc-400">Online</p>
            </div>
            <button className="rounded-full p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15v3H6v3" />
                <path d="M6 15v3h12v3" />
                <path d="M18 8a5 5 0 0 0-10 0v7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1">
          {initialChannel ? (
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center border-b border-zinc-800 px-4 shadow-md">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-zinc-400">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <h2 className="font-semibold text-white">{initialChannel.name}</h2>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </button>
                  <button className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-700">
                          <span className="text-sm font-medium text-white">
                            {message.user_profiles?.username?.substring(0, 1) || "?"}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-200">
                              {message.user_profiles?.username}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-300">{message.content}</p>
                          {message.encrypted_content && (
                            <div className="mt-1 rounded bg-zinc-800/50 px-2 py-1 text-xs text-zinc-400">
                              <span className="mr-1">🔒</span>
                              Encrypted message
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-emerald-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">No messages yet</h3>
                    <p className="mt-1 text-center text-zinc-400">
                      Start the conversation by sending a message below
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3">
                  <input
                    type="text"
                    placeholder={`Message #${initialChannel.name}`}
                    className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button className="rounded-full p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </button>
                    <button className="rounded-full p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    </button>
                    <button className="ml-2 rounded-full bg-emerald-600 p-1 text-white hover:bg-emerald-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.88 18.68 16.6 13.4a2 2 0 0 0-2.83 0l-1.49 1.49a2 2 0 0 1-2.83 0L8.6 14a2 2 0 0 1 0-2.83l1.49-1.49a2 2 0 0 0 0-2.83L4.81 1.56a2 2 0 0 0-2.83 0l-.34.34a2 2 0 0 0 0 2.83L16.6 19.68a2 2 0 0 0 2.83 0l.34-.34a2 2 0 0 0 0-2.83Z" />
                  <path d="M17.5 13.5 21 17" />
                  <path d="m19 5 1.5 1.5" />
                  <path d="M11 13A5 5 0 0 0 6 8V7" />
                  <path d="M14 6h.01" />
                  <path d="M5 10v.01" />
                  <path d="M11 11v.01" />
                  <path d="M17 14v.01" />
                  <path d="M19.5 19.5 22 22" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">No Channels Found</h3>
              <p className="mt-1 text-center text-zinc-400">
                This server has no channels yet. {isOwner ? "Create one to get started." : "Check back later."}
              </p>
              {isOwner && (
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                  Create Channel
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </HydrateClient>
  );
} 