import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PostgrestError } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type SupabaseErrorResponse = {
  message: string;
  code?: string;
  details?: string;
};

/**
 * Handle Supabase error and return a formatted error message
 */
export function handleSupabaseError(error: Error | PostgrestError | null): SupabaseErrorResponse {
  if (!error) {
    return { message: "Unknown error occurred" };
  }

  // PostgrestError handling
  if ('code' in error && 'details' in error && 'message' in error) {
    const pgError = error as PostgrestError;
    
    // Check for common PostgreSQL error codes
    switch (pgError.code) {
      case '23505': // unique_violation
        return { 
          message: "A record with this information already exists.", 
          code: pgError.code,
          details: pgError.details
        };
      case '23503': // foreign_key_violation
        return { 
          message: "This operation references a record that doesn't exist.", 
          code: pgError.code,
          details: pgError.details
        };
      case '23514': // check_violation
        return { 
          message: "The data doesn't meet the requirements.", 
          code: pgError.code,
          details: pgError.details
        };
      case '42P01': // undefined_table
        return { 
          message: "The database table doesn't exist.", 
          code: pgError.code,
          details: pgError.details
        };
      default:
        return { 
          message: pgError.message || "Database error occurred", 
          code: pgError.code,
          details: pgError.details
        };
    }
  }

  // Standard error handling
  return { 
    message: error.message || "An unexpected error occurred" 
  };
}

/**
 * Format date to a human-readable format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Format time as HH:MM (24-hour format)
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  // Check if it's today
  const isToday = 
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return timeString;
  }
  
  // Check if it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = 
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  
  if (isYesterday) {
    return `Yesterday at ${timeString}`;
  }
  
  // Format date for older messages
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
  const year = d.getFullYear();
  
  return `${day}/${month}/${year} ${timeString}`;
}

/**
 * Generate a random string (useful for IDs, invite codes, etc.)
 */
export function generateRandomString(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Truncate text with ellipsis if it exceeds maxLength
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Get initials from a name (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === '') return '?';
  
  const validParts = name.trim().split(/\s+/).filter(Boolean);
  
  if (validParts.length === 0) return '?';
  
  const firstChar = validParts[0]?.charAt(0) || '';
  
  if (validParts.length === 1) {
    return firstChar.toUpperCase();
  }
  
  const lastChar = validParts[validParts.length - 1]?.charAt(0) || '';
  return (firstChar + lastChar).toUpperCase();
}

/**
 * Check if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}