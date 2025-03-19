import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { generateKeyPair, storeKeyPair } from "./encryption";
import { env } from "../env";
import { supabase as supabaseClient } from "./supabase";

// Create a Supabase client for the browser - with check for server-side
const createClient = () => {
  if (typeof window === 'undefined') {
    return supabaseClient; // Return the imported client on server
  }
  return createClientComponentClient(); // Create a client on browser
};

// Custom error class for auth errors
export class AuthError extends Error {
  code: string;
  
  constructor(message: string, code: string = 'auth/unknown-error') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export const registerUser = async ({
  email,
  password,
  username,
}: {
  email: string;
  password: string;
  username: string;
}) => {
  try {
    const supabase = createClient();
    
    // Check if the username already exists
    const { data: existingUsers, error: usernameCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username);

    if (usernameCheckError) {
      console.error("Error checking username:", usernameCheckError);
      throw new AuthError("Error checking username availability", "auth/database-error");
    }

    if (existingUsers && existingUsers.length > 0) {
      throw new AuthError("Username already taken", "auth/username-exists");
    }

    // Register the user with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      throw new AuthError(
        signUpError.message || "Failed to create account", 
        `auth/${signUpError.name.toLowerCase().replace(/\s+/g, '-')}`
      );
    }

    if (!authData.user) {
      throw new AuthError("User creation failed", "auth/user-creation-failed");
    }

    // Generate encryption keys
    const keyPair = generateKeyPair();
    
    // Store the keys securely (this is now safe with browser check)
    storeKeyPair(keyPair);

    // Save the public key to the database
    const { error: publicKeyError } = await supabase.from("public_keys").insert({
      user_id: authData.user.id,
      public_key: keyPair.publicKey,
      key_type: "primary",
    });

    if (publicKeyError) {
      console.error("Error saving public key:", publicKeyError);
      // Continue with the registration but log the error
      // In a real app, you might want to cleanup the user account if this fails
    }

    // Create a profile for the user
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username,
      email,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Attempt to delete the user account
      try {
        // In this case, we should try to clean up the created user account
        // This would require admin rights, so for now, we'll just throw an error
        throw new AuthError("Error creating user profile", "auth/profile-creation-failed");
      } catch (deleteError) {
        console.error("Cleanup error:", deleteError);
        throw new AuthError("Account created but profile setup failed. Please contact support.", "auth/incomplete-registration");
      }
    }

    return { user: authData.user, profile: { id: authData.user.id, username, email } };
  } catch (error) {
    // Re-throw AuthError instances
    if (error instanceof AuthError) {
      throw error;
    }
    
    // Handle any other errors
    console.error("Registration error:", error);
    throw new AuthError(
      error instanceof Error ? error.message : "An unexpected error occurred during registration",
      "auth/registration-failed"
    );
  }
};

export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthError(error.message, `auth/${error.name.toLowerCase().replace(/\s+/g, '-')}`);
    }

    return data;
  } catch (error) {
    // Re-throw AuthError instances
    if (error instanceof AuthError) {
      throw error;
    }
    
    console.error("Login error:", error);
    throw new AuthError(
      error instanceof Error ? error.message : "An unexpected error occurred during login",
      "auth/login-failed"
    );
  }
};

export const logoutUser = async () => {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new AuthError(error.message, `auth/${error.name.toLowerCase().replace(/\s+/g, '-')}`);
    }
    
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw new AuthError(
      error instanceof Error ? error.message : "An unexpected error occurred during logout",
      "auth/logout-failed"
    );
  }
};

export const getCurrentUser = async () => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new AuthError(error.message, `auth/${error.name.toLowerCase().replace(/\s+/g, '-')}`);
    }
    
    return data?.user || null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) {
      throw new AuthError("Error retrieving user profile", "auth/profile-fetch-failed");
    }
    
    return data;
  } catch (error) {
    console.error("Get user profile error:", error);
    throw new AuthError(
      error instanceof Error ? error.message : "An unexpected error occurred while getting user profile",
      "auth/profile-error"
    );
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
  }
) => {
  try {
    const supabase = createClient();
    
    // Check username uniqueness if it's being updated
    if (updates.username) {
      const { data: existingUsers, error: usernameCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", updates.username)
        .neq("id", userId);

      if (usernameCheckError) {
        throw new AuthError("Error checking username availability", "auth/database-error");
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new AuthError("Username already taken", "auth/username-exists");
      }
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select("*")
      .single();
    
    if (error) {
      throw new AuthError("Error updating user profile", "auth/profile-update-failed");
    }
    
    return data;
  } catch (error) {
    // Re-throw AuthError instances
    if (error instanceof AuthError) {
      throw error;
    }
    
    console.error("Update user profile error:", error);
    throw new AuthError(
      error instanceof Error ? error.message : "An unexpected error occurred while updating profile",
      "auth/profile-update-error"
    );
  }
};

export const resetPassword = async (email: string) => {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      throw new AuthError(error.message, `auth/${error.name.toLowerCase().replace(/\s+/g, '-')}`);
    }
    
    return true;
  } catch (error) {
    console.error("Reset password error:", error);
    throw new AuthError(
      error instanceof Error ? error.message : "An unexpected error occurred during password reset",
      "auth/reset-failed"
    );
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      throw new AuthError(error.message, `auth/${error.name.toLowerCase().replace(/\s+/g, '-')}`);
    }
    
    return true;
  } catch (error) {
    console.error("Update password error:", error);
    throw new AuthError(
      error instanceof Error ? error.message : "An unexpected error occurred during password update",
      "auth/update-failed"
    );
  }
};