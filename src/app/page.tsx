import { redirect } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

import { NavigationSidebar } from "~/components/navigation/navigation-sidebar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { getCurrentUser } from "~/lib/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <HydrateClient>
      <div className="flex h-screen bg-zinc-900 text-zinc-100">
        <NavigationSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="flex h-full">
            {/* Servers sidebar - shows when server is selected */}
            <div className="hidden w-60 flex-col bg-zinc-800 md:flex">
              <div className="flex h-14 items-center px-4 shadow-md">
                <h2 className="font-semibold text-white">Home</h2>
              </div>
              
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="rounded-md bg-zinc-700/50 p-2">
                  <h3 className="mb-2 font-medium text-zinc-300">Direct Messages</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-400">No conversations yet</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="flex flex-1 flex-col">
              <div className="hidden h-14 items-center border-b border-zinc-800 px-6 shadow-md md:flex">
                <h2 className="font-semibold text-white">Welcome</h2>
              </div>
              
              <div className="flex flex-1 flex-col items-center justify-center p-4">
                <div className="flex w-full max-w-md flex-col items-center rounded-lg bg-zinc-800 p-8 shadow-lg">
                  <div className="mb-6 h-24 w-24 overflow-hidden rounded-full bg-emerald-600 p-1">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-900 text-2xl font-bold text-white">
                      {user.user_metadata?.username?.substring(0, 1) || user.email?.substring(0, 1) || "?"}
                    </div>
                  </div>
                  
                  <h1 className="mb-2 text-2xl font-bold text-white">
                    Welcome, {user.user_metadata?.username || user.email?.split("@")[0] || "User"}
                  </h1>
                  
                  <p className="mb-6 text-center text-zinc-400">
                    Your secure, encrypted communication platform
                  </p>
                  
                  <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      New Message
                    </Button>
                    
                    <Button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0" />
                        <path d="M12 8l0 8" />
                        <path d="M8 12l8 0" />
                      </svg>
                      Create Server
                    </Button>
                  </div>
                  
                  <Separator className="my-6 bg-zinc-700" />
                  
                  <div className="w-full space-y-4">
                    <div className="rounded-md bg-zinc-700/50 p-4">
                      <h3 className="mb-2 font-medium text-zinc-300">End-to-End Encryption</h3>
                      <p className="text-sm text-zinc-400">Your messages are secured with strong encryption. Only you and your recipients can read them.</p>
                    </div>
                    
                    <div className="rounded-md bg-zinc-700/50 p-4">
                      <h3 className="mb-2 font-medium text-zinc-300">Security Status</h3>
                      <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full bg-emerald-500"></div>
                        <p className="text-sm text-zinc-400">Your keys are secure and up to date</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
