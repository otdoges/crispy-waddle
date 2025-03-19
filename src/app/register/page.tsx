"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useToast } from "../../components/ui/toast";
import { Label } from "../../components/ui/label";
import { registerUser, AuthError } from "../../lib/auth";
import { isValidEmail } from "../../lib/utils";
import { env } from "../../env";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  // Get app name and password requirements from environment variables
  const APP_NAME = env.NEXT_PUBLIC_APP_NAME || "SecureChat";
  const MIN_PASSWORD_LENGTH = env.PASSWORD_MIN_LENGTH || 8;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Check required fields
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      newErrors.email = "All fields are required";
      newErrors.username = "All fields are required";
      newErrors.password = "All fields are required";
      newErrors.confirmPassword = "All fields are required";
      setError("All fields are required");
      return false;
    }

    // Validate email
    if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      setError("Please enter a valid email address");
    }

    // Validate username
    if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
      setError("Username must be at least 3 characters long");
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      setError("Passwords do not match");
    }

    // Validate password strength
    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }

    // Password complexity
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);

    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      newErrors.password = "Password must contain uppercase, lowercase, and numbers";
      setError("Password must contain uppercase, lowercase, and numbers");
    }

    setError(Object.values(newErrors).join("\n"));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      await registerUser({
        email: formData.email,
        password: formData.password,
        username: formData.username
      });

      toast({
        title: "Registration successful!",
        description: `Welcome to ${APP_NAME}! You can now login.`,
      });

      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);
      
      const error = err as Error | AuthError;
      
      if (error instanceof AuthError) {
        // Handle specific error codes
        switch (error.code) {
          case 'auth/username-exists':
            setError("This username is already taken");
            break;
          case 'auth/email-already-in-use':
            setError("This email is already registered");
            break;
          case 'auth/profile-creation-failed':
            toast({
              title: "Registration error",
              description: "Error creating your profile. Please try again.",
              variant: "destructive",
            });
            break;
          default:
            toast({
              title: "Registration failed",
              description: error.message || "Please try again later",
              variant: "destructive",
            });
        }
      } else {
        toast({
          title: "Registration failed",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
          <h2 className="text-xl font-semibold text-white">Create Your Account</h2>
          <p className="mt-2 text-zinc-400">Sign up to start secure messaging</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-8">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={error ? "border-red-500" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={error ? "border-red-500" : ""}
                />
                <p className="text-xs text-zinc-500">
                  Your username will be visible to other users
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={error ? "border-red-500" : ""}
                />
                <div className="space-y-1 text-xs text-zinc-500">
                  <p>Password requirements:</p>
                  <ul className="list-inside list-disc pl-2">
                    <li>Minimum {MIN_PASSWORD_LENGTH} characters</li>
                    <li>At least one uppercase letter</li>
                    <li>At least one lowercase letter</li>
                    <li>At least one number</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={error ? "border-red-500" : ""}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 py-2 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {isLoading ? "Creating Account..." : "Register"}
              </Button>
            </form>

            <div className="text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-400 hover:text-emerald-300"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 