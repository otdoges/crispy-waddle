-- Schema for Encrypted Messaging App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create RLS (Row Level Security) policies
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

CREATE POLICY "Users can insert and update their own public keys" ON public_keys
    FOR ALL USING (auth.uid() = user_id);

-- User devices policies
CREATE POLICY "Users can view their own devices" ON user_devices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own devices" ON user_devices
    FOR ALL USING (auth.uid() = user_id);

-- Message reactions policies
CREATE POLICY "Users can view message reactions in channels they have access to" ON message_reactions
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM messages WHERE channel_id IN (
                SELECT id FROM channels WHERE server_id IN (
                    SELECT server_id FROM server_members WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can insert and update their own message reactions" ON message_reactions
    FOR ALL USING (auth.uid() = user_id);

-- Direct message reactions policies
CREATE POLICY "Users can view direct message reactions in their conversations" ON direct_message_reactions
    FOR SELECT USING (
        direct_message_id IN (
            SELECT id FROM direct_messages WHERE conversation_id IN (
                SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert and update their own direct message reactions" ON direct_message_reactions
    FOR ALL USING (auth.uid() = user_id);

-- Function to update conversation last_message_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_last_message() 
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the last_message_at when a new direct message is created
CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON direct_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();