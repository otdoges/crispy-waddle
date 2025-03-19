"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { loginUser } from "~/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await loginUser(formData.email, formData.password);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-center text-2xl font-bold text-white">Sign in to SecureChat</h1>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Your secure, end-to-end encrypted messaging platform
          </p>
        </div>

        <div className="rounded-lg bg-zinc-800 p-6 shadow-xl">
          {error && (
            <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-500 hover:text-emerald-400"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-emerald-500 hover:text-emerald-400">
              Create an account
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-xs text-zinc-500">End-to-end encrypted</span>
          </div>
          <div className="h-4 w-px bg-zinc-700"></div>
          <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" x2="6" y1="1" y2="4" />
              <line x1="10" x2="10" y1="1" y2="4" />
              <line x1="14" x2="14" y1="1" y2="4" />
            </svg>
            <span className="text-xs text-zinc-500">No data storage</span>
          </div>
        </div>
      </div>
    </div>
  );
} 