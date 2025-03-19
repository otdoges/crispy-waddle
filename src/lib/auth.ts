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
        
        if (data.user) {
            // Create user profile
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: data.user.id,
                    username,
                });
                
            if (profileError) throw profileError;
            
            // Store public key in the database
            const { error: keyError } = await supabase
                .from('public_keys')
                .insert({
                    user_id: data.user.id,
                    public_key: keyPair.publicKey,
                    key_type: 'PRIMARY',
                    is_active: true,
                });
                
            if (keyError) throw keyError;
        }

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

        // Update user status to ONLINE
        if (data.user) {
            await supabase
                .from('user_profiles')
                .update({ status: 'ONLINE', updated_at: new Date().toISOString() })
                .eq('user_id', data.user.id);
                
            // Register the user's device if not already registered
            const deviceId = generateDeviceId();
            const deviceName = getDeviceName();
            
            const { data: existingDevice } = await supabase
                .from('user_devices')
                .select('id')
                .eq('user_id', data.user.id)
                .eq('device_id', deviceId)
                .single();
                
            if (!existingDevice) {
                // Get user's encryption key
                const { data: keyData } = await supabase
                    .from('public_keys')
                    .select('public_key')
                    .eq('user_id', data.user.id)
                    .eq('is_active', true)
                    .single();
                    
                if (keyData) {
                    // In a real app, we would encrypt a device key with the user's public key
                    const encryptedDeviceKey = 'encrypted-device-key-placeholder';
                    
                    await supabase
                        .from('user_devices')
                        .insert({
                            user_id: data.user.id,
                            device_id: deviceId,
                            device_name: deviceName,
                            encrypted_device_key: encryptedDeviceKey,
                        });
                }
            } else {
                // Update last active timestamp
                await supabase
                    .from('user_devices')
                    .update({ last_active: new Date().toISOString() })
                    .eq('user_id', data.user.id)
                    .eq('device_id', deviceId);
            }
        }

        return { user: data.user, session: data.session };
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

// Generate a device ID
const generateDeviceId = () => {
    // Use existing device ID from localStorage if available
    const existingDeviceId = localStorage.getItem('device_id');
    if (existingDeviceId) return existingDeviceId;
    
    // Generate a new device ID
    const newDeviceId = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
    localStorage.setItem('device_id', newDeviceId);
    return newDeviceId;
};

// Get device name
const getDeviceName = () => {
    const userAgent = navigator.userAgent;
    let deviceName = 'Unknown Device';
    
    if (/Windows/.test(userAgent)) deviceName = 'Windows';
    else if (/Macintosh|Mac OS X/.test(userAgent)) deviceName = 'Mac';
    else if (/Android/.test(userAgent)) deviceName = 'Android';
    else if (/iPhone|iPad|iPod/.test(userAgent)) deviceName = 'iOS';
    else if (/Linux/.test(userAgent)) deviceName = 'Linux';
    
    return `${deviceName} - ${new Date().toLocaleDateString()}`;
};

// Logout the current user
export const logoutUser = async () => {
    try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData.user) {
            // Update user status to OFFLINE
            await supabase
                .from('user_profiles')
                .update({ status: 'OFFLINE', updated_at: new Date().toISOString() })
                .eq('user_id', userData.user.id);
        }
        
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