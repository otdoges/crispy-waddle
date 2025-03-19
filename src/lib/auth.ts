import { supabase } from './supabase';
import { generateKeyPair, storeKeyPair } from './encryption';

// Register a new user
export const registerUser = async (email: string, password: string, username: string) => {
    try {
        // Generate encryption keys for the user
        const keyPair = generateKeyPair();

        // Register the user with Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    public_key: keyPair.publicKey,
                },
            },
        });

        if (error) throw error;

        // Store the key pair locally
        storeKeyPair(keyPair);

        return { user: data.user, session: data.session };
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

// Login an existing user
export const loginUser = async (email: string, password: string) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        return { user: data.user, session: data.session };
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

// Logout the current user
export const logoutUser = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};

// Get the current user
export const getCurrentUser = async () => {
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data.user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

// Get the current session
export const getCurrentSession = async () => {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    } catch (error) {
        console.error('Error getting current session:', error);
        return null;
    }
};