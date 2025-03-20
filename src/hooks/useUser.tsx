import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  status: 'online' | 'offline' | 'away';
  customStatus?: string;
  preferences: {
    theme: string;
    notifications: boolean;
    sound: boolean;
    desktop_notifications: boolean;
    email_notifications: boolean;
  };
  last_seen: Date;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  updateUser: (data: Partial<User>) => Promise<void>;
  updateStatus: (status: User['status'], customStatus?: string) => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  updateUser: async () => {},
  updateStatus: async () => {},
  updatePreferences: async () => {},
  signOut: async () => {}
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadUser();
    const channel = setupPresenceChannel();
    return () => {
      cleanupPresenceChannel(channel);
    };
  }, []);

  const loadUser = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (authUser) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) throw profileError;

        setUser({
          id: authUser.id,
          email: authUser.email!,
          name: profile.name,
          avatar_url: profile.avatar_url,
          status: profile.status || 'offline',
          customStatus: profile.customStatus || '',
          preferences: profile.preferences || {
            theme: 'default',
            notifications: true,
            sound: true,
            desktop_notifications: false,
            email_notifications: false
          },
          last_seen: new Date(profile.last_seen || new Date())
        });
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load user'));
      setLoading(false);
    }
  };

  const setupPresenceChannel = () => {
    const presenceChannel = supabase.channel('online-users');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        // Handle presence sync
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Handle user join
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // Handle user leave
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString()
          });
        }
      });

    return presenceChannel;
  };

  const cleanupPresenceChannel = (channel: any) => {
    supabase.removeChannel(channel);
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update user'));
      throw err;
    }
  };

  const updateStatus = async (status: User['status'], customStatus?: string) => {
    try {
      const { error: statusError } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user?.id,
          status,
          customStatus,
          last_active: new Date().toISOString()
        });

      if (statusError) throw statusError;

      setUser(prev => prev ? {
        ...prev,
        status,
        customStatus: customStatus
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update status'));
      throw err;
    }
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    try {
      const { error: prefError } = await supabase
        .from('user_profiles')
        .update({
          preferences: {
            ...user?.preferences,
            ...preferences
          }
        })
        .eq('id', user?.id);

      if (prefError) throw prefError;

      setUser(prev => prev ? {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...preferences
        }
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update preferences'));
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        updateUser,
        updateStatus,
        updatePreferences,
        signOut
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default useUser; 