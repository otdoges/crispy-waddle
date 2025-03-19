"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { registerUser } from "~/lib/auth";
import { isValidEmail } from "~/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Get app name and password requirements from environment variables
  const APP_NAME = env.NEXT_PUBLIC_APP_NAME || "SecureChat";
  const MIN_PASSWORD_LENGTH = 8;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return false;
    }

    // Validate email
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate username
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Validate password strength
    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return false;
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      setError("Password must contain uppercase, lowercase, and numbers");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await registerUser(formData.email, formData.password, formData.username);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Registration error:", err);
      setError("Error creating account. This email may already be registered.");
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
          <h1 className="text-center text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Join {APP_NAME} and start messaging securely
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
              <label htmlFor="username" className="block text-sm font-medium text-zinc-300">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Choose a username"
              />
              <p className="text-xs text-zinc-500">
                Must be at least 3 characters
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Create a password"
              />
              <div className="space-y-1 text-xs text-zinc-500">
                <p>Password must:</p>
                <ul className="list-inside list-disc space-y-0.5 pl-2">
                  <li>Be at least {MIN_PASSWORD_LENGTH} characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include at least one number</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Confirm your password"
              />
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-xs text-zinc-500">
                By creating an account, you agree to our Terms of Service and Privacy Policy. Your messages are end-to-end encrypted and cannot be read by our servers.
              </p>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-500 hover:text-emerald-400">
              Sign in
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-xs text-zinc-500">Private and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
} 