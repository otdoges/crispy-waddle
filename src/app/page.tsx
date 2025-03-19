import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { NavigationSidebar } from "~/components/navigation/navigation-sidebar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { getCurrentUser } from "~/lib/auth";
import { HydrateClient } from "~/trpc/server";
import { env } from "~/env";

export default async function Home() {
  const user = await getCurrentUser();
  const APP_NAME = env.NEXT_PUBLIC_APP_NAME || "SecureChat";

  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-900 to-black">
        <header className="container mx-auto flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">{APP_NAME}</span>
          </div>
          <nav className="hidden space-x-8 md:flex">
            <Link href="#features" className="text-sm text-zinc-300 hover:text-white">
              Features
            </Link>
            <Link href="#security" className="text-sm text-zinc-300 hover:text-white">
              Security
            </Link>
            <Link href="#faq" className="text-sm text-zinc-300 hover:text-white">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white">
              Sign In
            </Link>
            <Link href="/register">
              <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                Get Started
              </Button>
            </Link>
            <Link href="/chat" className="text-sm font-medium text-emerald-400 hover:text-white">
              Go to Chat
            </Link>
          </div>
        </header>

        <main className="flex-1">
          <section className="container mx-auto px-4 py-20 text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
              Secure Messaging for <span className="text-emerald-500">Everyone</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400">
              End-to-end encrypted messaging with zero knowledge architecture.
              Your messages are only readable by you and your intended recipients.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full bg-emerald-600 px-8 hover:bg-emerald-700 sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
              <Link href="#security">
                <Button variant="outline" size="lg" className="w-full border-zinc-700 px-8 text-zinc-300 hover:bg-zinc-800 hover:text-white sm:w-auto">
                  Learn About Our Security
                </Button>
              </Link>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="relative rounded-2xl bg-zinc-800/50 p-8 backdrop-blur-sm">
              <div className="absolute -top-10 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-600 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
                <div className="rounded-lg bg-zinc-900 p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">End-to-End Encryption</h3>
                  <p className="text-zinc-400">
                    All messages are encrypted on your device and can only be decrypted by the intended recipient.
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-900 p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m4.93 4.93 14.14 14.14" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">Zero Knowledge</h3>
                  <p className="text-zinc-400">
                    We cannot read your messages, see your content, or access your data. Your privacy is guaranteed.
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-900 p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                      <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" />
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <circle cx="12" cy="10" r="2" />
                      <line x1="8" y1="2" x2="8" y2="4" />
                      <line x1="16" y1="2" x2="16" y2="4" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">Multi-Device Support</h3>
                  <p className="text-zinc-400">
                    Access your messages securely across all your devices with our unique key synchronization.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold text-white">See SecureChat in Action</h2>
              <p className="mx-auto max-w-2xl text-zinc-400">
                Experience the modern, intuitive interface of our encrypted messaging platform
              </p>
            </div>
            
            <div className="mx-auto max-w-5xl rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl">
              <div className="h-8 bg-zinc-800 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="flex h-[500px] border-t border-zinc-800">
                {/* Sidebar */}
                <div className="w-64 border-r border-zinc-800 flex flex-col">
                  <div className="h-14 border-b border-zinc-800 flex items-center px-4">
                    <h3 className="font-medium text-white">Contacts</h3>
                  </div>
                  <div className="p-2 space-y-1 flex-1 overflow-hidden">
                    {["Alice Crypto", "Bob Secure", "Charlie Privacy", "Diana Protection"].map((name, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2 rounded ${i === 0 ? "bg-zinc-800" : ""}`}>
                        <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">{name.split(" ")[0]?.[0] || ""}{name.split(" ")[1]?.[0] || ""}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{name}</div>
                          <div className="text-xs text-zinc-400 truncate">Last message...</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Chat */}
                <div className="flex-1 flex flex-col">
                  <div className="h-14 border-b border-zinc-800 flex items-center px-4">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-white">AC</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">Alice Crypto</div>
                        <div className="text-xs text-zinc-400">Online</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-hidden">
                    <div className="space-y-4">
                      <div className="flex justify-start">
                        <div className="bg-zinc-800 rounded-lg p-3 max-w-[70%]">
                          <p className="text-sm text-white">Hey there! I just sent you the encrypted document.</p>
                          <div className="text-right text-xs text-zinc-500 mt-1">12:32 PM</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <div className="bg-emerald-600 rounded-lg p-3 max-w-[70%]">
                          <p className="text-sm text-white">Got it, thanks! I'll take a look at it.</p>
                          <div className="text-right text-xs text-emerald-200 mt-1">12:34 PM</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-start">
                        <div className="bg-zinc-800 rounded-lg p-3 max-w-[70%]">
                          <p className="text-sm text-white">I used the new key with 256-bit encryption. It's completely secure.</p>
                          <div className="text-right text-xs text-zinc-500 mt-1">12:36 PM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-zinc-800 p-4">
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        className="flex-1 rounded-lg bg-zinc-800 border-0 text-zinc-300 placeholder:text-zinc-500 focus:ring-emerald-600 text-sm" 
                      />
                      <button className="ml-2 bg-emerald-600 h-9 w-9 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="m22 2-7 20-4-9-9-4Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-zinc-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mr-1">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      End-to-end encrypted
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">Powerful Features</h2>
              <p className="mx-auto mb-16 max-w-2xl text-zinc-400">
                Everything you need for secure private messaging and collaboration
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Private Messaging"
                description="Send texts, images, and files with complete privacy. No one, not even us, can read your messages."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
              />
              <FeatureCard
                title="Secure Servers"
                description="Create encrypted servers for team collaboration with customizable roles and permissions."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                }
              />
              <FeatureCard
                title="Disappearing Messages"
                description="Set messages to automatically delete after a specific time for extra privacy."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              />
              <FeatureCard
                title="Voice & Video Calls"
                description="Make encrypted voice and video calls with crisp audio and HD video quality."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                }
              />
              <FeatureCard
                title="File Sharing"
                description="Share files of any type with automatic encryption and granular permissions."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                }
              />
              <FeatureCard
                title="Cross-Platform"
                description="Available on all your devices - desktop, mobile, and web with seamless synchronization."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                }
              />
            </div>
          </section>

          <section id="security" className="bg-zinc-900/60 py-20">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">Advanced Security Architecture</h2>
                <p className="mx-auto mb-16 max-w-2xl text-zinc-400">
                  Built from the ground up with security and privacy as the foundation
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-lg bg-zinc-800/50 p-8 backdrop-blur-sm">
                  <h3 className="mb-4 text-xl font-bold text-white">End-to-End Encryption</h3>
                  <p className="mb-4 text-zinc-400">
                    All messages and files are encrypted using XChaCha20-Poly1305 with 256-bit keys. Messages are encrypted on the sender's device and can only be decrypted by the intended recipient's device.
                  </p>
                  <ul className="space-y-2 text-zinc-400">
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 text-emerald-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>NaCl/libsodium cryptography libraries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 text-emerald-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Perfect forward secrecy with key rotation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 text-emerald-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Encrypted metadata and message headers</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-zinc-800/50 p-8 backdrop-blur-sm">
                  <h3 className="mb-4 text-xl font-bold text-white">Zero Knowledge Architecture</h3>
                  <p className="mb-4 text-zinc-400">
                    We never have access to your encryption keys or decrypted data. All cryptographic operations happen locally on your devices.
                  </p>
                  <ul className="space-y-2 text-zinc-400">
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 text-emerald-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>No server-side message decryption or logging</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 text-emerald-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Secure multi-device synchronization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 text-emerald-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Open source and independently audited code</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="faq" className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">Frequently Asked Questions</h2>
              <p className="mx-auto mb-12 max-w-2xl text-zinc-400">
                Have questions? We've got answers.
              </p>
            </div>

            <div className="mx-auto grid max-w-3xl gap-4">
              <FaqItem 
                question="Is SecureChat really free?"
                answer="Yes! SecureChat is completely free for personal use. We offer premium plans for businesses with additional features and support."
              />
              <FaqItem 
                question="Can you read my messages?"
                answer="No, we can't read your messages. All messages are encrypted on your device and can only be decrypted by the intended recipient. We never have access to the encryption keys."
              />
              <FaqItem 
                question="How do I know my messages are secure?"
                answer="Our code is open source and has been independently audited by security experts. We use industry-standard encryption algorithms and follow security best practices."
              />
              <FaqItem 
                question="What happens if I lose my device?"
                answer="You can sign in on a new device and recover your account using your backup key. You'll have access to all your messages once you've verified your identity."
              />
              <FaqItem 
                question="Is SecureChat available in my country?"
                answer="SecureChat is available worldwide without restrictions. We believe privacy is a fundamental human right and should be accessible to everyone."
              />
            </div>
          </section>

          <section className="bg-emerald-600 py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">Ready to take control of your privacy?</h2>
              <p className="mx-auto mb-8 max-w-2xl text-emerald-100">
                Join thousands of users who have already made the switch to secure messaging.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-white px-8 text-emerald-600 hover:bg-emerald-50">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </section>
        </main>

        <footer className="bg-zinc-900 py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-zinc-800 pb-8 md:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">{APP_NAME}</span>
              </div>
              <div className="flex gap-6">
                <Link href="#" className="text-zinc-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </Link>
                <Link href="#" className="text-zinc-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </Link>
                <Link href="#" className="text-zinc-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">Product</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Features</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Security</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Business</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Enterprise</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">Resources</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Documentation</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Guides</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Support</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">API</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Community</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">About</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Blog</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Careers</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Press</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Privacy</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Terms</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Security</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Cookies</Link></li>
                  <li><Link href="#" className="text-sm text-zinc-500 hover:text-white">Compliance</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 border-t border-zinc-800 pt-8 text-center">
              <p className="text-sm text-zinc-500">
                &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </HydrateClient>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-zinc-800/50 p-6 transition-transform hover:-translate-y-1 hover:bg-zinc-800">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/20">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-lg bg-zinc-800/50 p-6">
      <h3 className="mb-3 text-lg font-medium text-white">{question}</h3>
      <p className="text-zinc-400">{answer}</p>
    </div>
  );
}
