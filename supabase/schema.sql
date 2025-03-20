-- Schema for Encrypted Messaging App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth schema if not exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Profiles table (for storing user profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Servers table
CREATE TABLE IF NOT EXISTS servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    image_url TEXT,
    encrypted_data TEXT,
    owner_id UUID NOT NULL,
    invite_code TEXT NOT NULL UNIQUE
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('TEXT', 'VOICE', 'VIDEO')),
    server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    encrypted_data TEXT,
    position INTEGER NOT NULL,
    UNIQUE(server_id, name)
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'IDLE', 'DO_NOT_DISTURB')),
    custom_status TEXT,
    encrypted_status_data TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public keys table (NEW)
CREATE TABLE IF NOT EXISTS public_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    public_key TEXT NOT NULL,
    key_type TEXT NOT NULL DEFAULT 'PRIMARY' CHECK (key_type IN ('PRIMARY', 'BACKUP', 'ROTATION')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, key_type, is_active)
);

-- User devices table (NEW)
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_name TEXT NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    encrypted_device_key TEXT NOT NULL,
    push_token TEXT,
    is_trusted BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(user_id, device_id)
);

-- Server members table
CREATE TABLE IF NOT EXISTS server_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'GUEST' CHECK (role IN ('ADMIN', 'MODERATOR', 'GUEST')),
    encrypted_key_data TEXT,
    UNIQUE(server_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    content TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    file_url TEXT,
    encrypted_file_data TEXT,
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL
);

-- Message reactions table (NEW)
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    emoji TEXT NOT NULL,
    encrypted_emoji_data TEXT,
    UNIQUE(message_id, user_id, emoji)
);

-- Message read status table (NEW)
CREATE TABLE IF NOT EXISTS message_read_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Conversations table (for direct messages)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    encrypted_key_data TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    encrypted_key_data TEXT,
    muted BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(conversation_id, user_id)
);

-- Direct messages table
CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    content TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    file_url TEXT,
    encrypted_file_data TEXT,
    reply_to UUID REFERENCES direct_messages(id) ON DELETE SET NULL
);

-- Direct message reactions table (NEW)
CREATE TABLE IF NOT EXISTS direct_message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    direct_message_id UUID NOT NULL REFERENCES direct_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    emoji TEXT NOT NULL,
    encrypted_emoji_data TEXT,
    UNIQUE(direct_message_id, user_id, emoji)
);

-- Direct message read status table (NEW)
CREATE TABLE IF NOT EXISTS direct_message_read_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    direct_message_id UUID NOT NULL REFERENCES direct_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(direct_message_id, user_id)
);

-- Server verification table (NEW)
CREATE TABLE IF NOT EXISTS server_verification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    verification_code TEXT UNIQUE,
    verified_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(server_id)
);

-- NEW TABLES FOR ENHANCED FEATURES --

-- Two-Factor Authentication table
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('APP', 'SMS', 'EMAIL')),
    secret TEXT,
    phone_number TEXT,
    backup_codes TEXT[],
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_used TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- Login Attempts (for rate limiting and security)
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID,
    email TEXT,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    location TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions (for tracking active sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    device_info TEXT,
    ip_address TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- File Storage (for encrypted file storage)
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    encrypted_file_url TEXT NOT NULL,
    encrypted_file_key TEXT NOT NULL,
    thumbnail_url TEXT,
    message_id UUID,
    direct_message_id UUID,
    is_public BOOLEAN NOT NULL DEFAULT FALSE
);

-- User Badges (for achievements and recognitions)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    badge_description TEXT,
    badge_color TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Connections (for linking to external services)
CREATE TABLE IF NOT EXISTS user_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('GOOGLE', 'GITHUB', 'TWITTER', 'DISCORD', 'APPLE')),
    provider_user_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    profile_data JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(user_id, provider)
);

-- User Settings (for app preferences)
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'DARK' CHECK (theme IN ('LIGHT', 'DARK', 'SYSTEM')),
    notification_preferences JSONB NOT NULL DEFAULT '{"direct_messages": true, "group_messages": true, "mentions": true}',
    language TEXT NOT NULL DEFAULT 'en',
    timezone TEXT,
    encrypted_settings JSONB,
    UNIQUE(user_id)
);

-- Message Threads (for conversation threading)
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    latest_reply_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reply_count INTEGER NOT NULL DEFAULT 0,
    participants JSONB
);

-- Voice Call History (for tracking calls)
CREATE TABLE IF NOT EXISTS voice_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    initiator_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('STARTED', 'ENDED', 'MISSED', 'REJECTED')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    participants JSONB,
    encrypted_metadata JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channels_server_id ON channels(server_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_server_members_server_id ON server_members(server_id);
CREATE INDEX IF NOT EXISTS idx_server_members_user_id ON server_members(user_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation_id ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_user_id ON direct_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_public_keys_user_id ON public_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_message_id ON message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id ON message_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_direct_message_reactions_direct_message_id ON direct_message_reactions(direct_message_id);
CREATE INDEX IF NOT EXISTS idx_direct_message_reactions_user_id ON direct_message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_direct_message_read_status_direct_message_id ON direct_message_read_status(direct_message_id);
CREATE INDEX IF NOT EXISTS idx_direct_message_read_status_user_id ON direct_message_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);
CREATE INDEX IF NOT EXISTS idx_direct_messages_reply_to ON direct_messages(reply_to);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_message_id ON files(message_id);
CREATE INDEX IF NOT EXISTS idx_files_direct_message_id ON files(direct_message_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_parent_message_id ON message_threads(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_initiator_id ON voice_calls(initiator_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_channel_id ON voice_calls(channel_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_conversation_id ON voice_calls(conversation_id);

-- Enable RLS on all tables
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_verification ENABLE ROW LEVEL SECURITY;

-- Enable RLS on new tables
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
-- These are basic policies and should be refined based on specific security requirements

-- Server policies
CREATE POLICY "Users can view servers they are members of" ON servers
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM server_members WHERE server_id = id
        )
    );

CREATE POLICY "Server owners can update their servers" ON servers
    FOR UPDATE USING (auth.uid() = owner_id);

-- Channel policies
CREATE POLICY "Users can view channels in servers they are members of" ON channels
    FOR SELECT USING (
        server_id IN (
            SELECT server_id FROM server_members WHERE user_id = auth.uid()
        )
    );

-- Message policies
CREATE POLICY "Users can view messages in channels they have access to" ON messages
    FOR SELECT USING (
        channel_id IN (
            SELECT id FROM channels WHERE server_id IN (
                SELECT server_id FROM server_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert their own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Direct message policies
CREATE POLICY "Users can view direct messages in their conversations" ON direct_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own direct messages" ON direct_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own direct messages" ON direct_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- User profile policies
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Public key policies
CREATE POLICY "Users can view all public keys" ON public_keys
    FOR SELECT USING (true);

-- RLS policies for new tables
CREATE POLICY "Users can view their own 2FA settings" ON two_factor_auth
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own 2FA settings" ON two_factor_auth
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can revoke their own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own files" ON files
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can see files in messages they can access" ON files
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM messages WHERE channel_id IN (
                SELECT id FROM channels WHERE server_id IN (
                    SELECT server_id FROM server_members WHERE user_id = auth.uid()
                )
            )
        ) OR
        direct_message_id IN (
            SELECT id FROM direct_messages WHERE conversation_id IN (
                SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage their own badges visibility" ON user_badges
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' visible badges" ON user_badges
    FOR SELECT USING (is_visible = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own connections" ON user_connections
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view message threads they have access to" ON message_threads
    FOR SELECT USING (
        parent_message_id IN (
            SELECT id FROM messages WHERE channel_id IN (
                SELECT id FROM channels WHERE server_id IN (
                    SELECT server_id FROM server_members WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can view calls they participated in" ON voice_calls
    FOR SELECT USING (
        auth.uid() = initiator_id OR
        auth.uid()::text IN (SELECT jsonb_array_elements_text(participants) FROM voice_calls WHERE id = voice_calls.id)
    );