import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { HydrateClient } from "~/trpc/server";
import { getCurrentUser } from "~/lib/auth";

export default async function ChatPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return redirect("/login");
  }

  return (
    <HydrateClient>
      <div className="flex h-screen bg-zinc-900 text-zinc-100">
        {/* Left sidebar - Contacts */}
        <div className="hidden w-64 flex-col border-r border-zinc-800 md:flex">
          <div className="flex h-14 items-center justify-between px-4 shadow-md">
            <h2 className="font-semibold text-white">Contacts</h2>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="sr-only">Add contact</span>
            </Button>
          </div>

          <div className="p-3">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <Input 
                placeholder="Search contacts..." 
                className="w-full border-zinc-700 bg-zinc-800 pl-9 text-sm text-zinc-300 placeholder:text-zinc-500 focus:border-emerald-600 focus:ring-emerald-600" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {/* Sample contacts */}
              <ContactItem 
                name="Alice Crypto" 
                message="The keys have been rotated successfully" 
                time="12:42 PM"
                online={true}
              />
              <ContactItem 
                name="Bob Secure" 
                message="Can you check the encryption settings?" 
                time="10:30 AM"
                unread={2}
              />
              <ContactItem 
                name="Charlie Privacy" 
                message="Just sent you an encrypted file" 
                time="Yesterday"
              />
              <ContactItem 
                name="Diana Protection" 
                message="Let's talk over the secure channel" 
                time="Tuesday"
              />
              <ContactItem 
                name="Edward Safety" 
                message="I've updated my public key" 
                time="Monday"
              />
            </div>
          </div>
        </div>
        
        {/* Main chat area */}
        <div className="flex flex-1 flex-col">
          {/* Chat header */}
          <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4 shadow-md">
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="h-9 w-9 overflow-hidden rounded-full bg-emerald-600">
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-white">
                    AC
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900 bg-emerald-500"></div>
              </div>
              <div>
                <h2 className="font-semibold text-white">Alice Crypto</h2>
                <p className="text-xs text-zinc-400">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 18h.01" />
                  <path d="M12 12h.01" />
                  <path d="M12 6h.01" />
                </svg>
                <span className="sr-only">More options</span>
              </Button>
            </div>
          </div>
          
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="text-center">
                <span className="inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                  Today, 12:30 PM
                </span>
              </div>
              
              <Message 
                sender="Alice Crypto"
                message="Hey there! I just sent you the encrypted document about our new secure messaging protocol."
                time="12:32 PM"
                isSelf={false}
              />
              
              <Message 
                message="Got it, thanks! I'll take a look at it. Did you use our standard encryption key or the new one we generated last week?"
                time="12:34 PM"
                isSelf={true}
              />
              
              <Message 
                sender="Alice Crypto"
                message="I used the new key. It should have the signature we agreed on. Let me know if you have any trouble decrypting it."
                time="12:36 PM"
                isSelf={false}
              />
              
              <Message 
                message="Perfect. Just to confirm, we're using XChaCha20-Poly1305 with 256-bit keys for this exchange, right?"
                time="12:38 PM"
                isSelf={true}
              />

              <Message 
                sender="Alice Crypto"
                message="That's correct. With perfect forward secrecy enabled. I've also added the new authentication method we discussed."
                time="12:40 PM"
                isSelf={false}
              />

              <Message 
                message="Excellent. I'll verify the integrity and get back to you with my feedback on the protocol changes."
                time="12:41 PM"
                isSelf={true}
              />

              <Message 
                sender="Alice Crypto"
                message="The keys have been rotated successfully. All future communications will use the new key pair."
                time="12:42 PM"
                isSelf={false}
              />

              <div className="text-center">
                <span className="inline-block rounded-full bg-emerald-600/20 px-3 py-1 text-xs text-emerald-400">
                  End-to-end encrypted
                </span>
              </div>
            </div>
          </div>
          
          {/* Message input area */}
          <div className="border-t border-zinc-800 p-4">
            <div className="flex items-end space-x-2">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="m3 9 9 9" />
                  <path d="m21 9-9 9" />
                </svg>
                <span className="sr-only">Attach file</span>
              </Button>
              <div className="relative flex-1">
                <Input 
                  placeholder="Type a message..." 
                  className="w-full border-zinc-700 bg-zinc-800 pl-4 pr-10 py-3 text-sm text-zinc-300 placeholder:text-zinc-500 focus:border-emerald-600 focus:ring-emerald-600" 
                />
                <Button size="sm" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15c-1.95 0-2.5 1-2.5 1M12 9a1 1 0 0 1 0-2a1 1 0 0 1 0 2Z" />
                    <path d="M16 18a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h1" />
                  </svg>
                  <span className="sr-only">Encrypt with key</span>
                </Button>
              </div>
              <Button className="h-10 bg-emerald-600 hover:bg-emerald-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
                <span className="sr-only">Send message</span>
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>End-to-end encrypted</span>
              </div>
              <div className="text-xs text-zinc-500">
                <span>Messages expire in 7 days</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right sidebar - Details */}
        <div className="hidden w-72 flex-col border-l border-zinc-800 bg-zinc-900 md:flex">
          <div className="flex h-14 items-center px-4 shadow-md">
            <h2 className="font-semibold text-white">Details</h2>
          </div>
          
          <div className="flex flex-col items-center p-6">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-emerald-600">
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white">
                AC
              </div>
            </div>
            <h3 className="mt-4 text-lg font-medium text-white">Alice Crypto</h3>
            <p className="text-sm text-zinc-400">alice@securemail.com</p>
            
            <div className="mt-6 flex w-full gap-2">
              <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                View Profile
              </Button>
              <Button variant="outline" className="h-10 w-10 p-0 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </div>
          </div>
          
          <Separator className="my-4 bg-zinc-800" />
          
          <div className="px-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-400">Security Info</h4>
            <div className="space-y-3">
              <div className="rounded-md bg-zinc-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">Identity Key</span>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </Button>
                </div>
                <p className="mt-1 truncate rounded bg-zinc-900 px-2 py-1 text-xs font-mono text-zinc-400">
                  BD7ECF8A241C3A5F7...
                </p>
              </div>
              
              <div className="rounded-md bg-zinc-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">Safety Number</span>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </Button>
                </div>
                <div className="mt-1 grid grid-cols-4 gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex h-8 w-8 items-center justify-center rounded bg-zinc-900 p-1 text-xs font-mono text-zinc-400">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-4 bg-zinc-800" />
          
          <div className="px-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-400">Encryption</h4>
            <div className="rounded-md bg-zinc-800 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">Protocol</span>
                <span className="text-xs text-emerald-400">XChaCha20-Poly1305</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">Key Exchange</span>
                <span className="text-xs text-emerald-400">X25519</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">Key Length</span>
                <span className="text-xs text-emerald-400">256-bit</span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto p-4">
            <Button variant="destructive" className="w-full">Block Contact</Button>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}

function ContactItem({ 
  name, 
  message, 
  time, 
  online, 
  unread 
}: { 
  name: string; 
  message: string; 
  time: string; 
  online?: boolean; 
  unread?: number;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-md p-2 cursor-pointer ${unread ? 'bg-zinc-800' : 'hover:bg-zinc-800/60'}`}>
      <div className="relative flex-shrink-0">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-indigo-600">
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-white">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
        {online && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900 bg-emerald-500"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white truncate">{name}</h3>
          <span className="text-xs text-zinc-500">{time}</span>
        </div>
        <p className="truncate text-sm text-zinc-400">{message}</p>
      </div>
      {unread && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-medium text-white">
          {unread}
        </div>
      )}
    </div>
  );
}

function Message({ 
  sender, 
  message, 
  time, 
  isSelf 
}: { 
  sender?: string;
  message: string; 
  time: string; 
  isSelf: boolean;
}) {
  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isSelf ? 'bg-emerald-600' : 'bg-zinc-800'} rounded-lg px-4 py-2`}>
        {!isSelf && sender && (
          <div className="mb-1 text-xs font-medium text-emerald-300">
            {sender}
          </div>
        )}
        <p className="text-sm text-white">{message}</p>
        <div className={`mt-1 text-right text-xs ${isSelf ? 'text-emerald-200' : 'text-zinc-400'}`}>
          {time}
        </div>
      </div>
    </div>
  );
} 