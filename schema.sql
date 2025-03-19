-- Create the required tables for the encrypted messaging application

-- Users Profile table (extends the auth.users from Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public keys table (stores users' public keys)
CREATE TABLE IF NOT EXISTS public_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  public_key TEXT NOT NULL, -- Base64 encoded public key
  key_type TEXT NOT NULL DEFAULT 'PRIMARY', -- PRIMARY, DEVICE, BACKUP
  device_id TEXT, -- Unique identifier for the device
  key_id TEXT, -- Unique identifier for the key
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE (user_id, key_id)
);

-- Chat channels table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- Encrypted at the client side for group chats
  type TEXT NOT NULL DEFAULT 'DIRECT', -- DIRECT, GROUP
  owner_id UUID REFERENCES auth.users(id),
  encrypted_details JSONB, -- Additional encrypted metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat members table
CREATE TABLE IF NOT EXISTS chat_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'MEMBER', -- OWNER, ADMIN, MEMBER
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE (chat_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id), -- For direct messages
  message_type TEXT NOT NULL DEFAULT 'TEXT', -- TEXT, IMAGE, FILE, VOICE
  encrypted_content JSONB NOT NULL, -- Encrypted message content with metadata
  read_at TIMESTAMP WITH TIME ZONE, -- When the message was read
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for efficient querying
  INDEX messages_chat_id_created_at_idx (chat_id, created_at DESC)
);

-- Message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  encrypted_reaction TEXT NOT NULL, -- Encrypted emoji or reaction
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE (message_id, user_id)
);

-- Servers table (for Discord-like functionality)
CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server channels
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID REFERENCES servers(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'TEXT', -- TEXT, VOICE
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server members
CREATE TABLE IF NOT EXISTS server_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID REFERENCES servers(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'GUEST', -- OWNER, ADMIN, MODERATOR, GUEST
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE (server_id, user_id)
);

-- Create RLS policies for security

-- Profiles: Allow users to view any profile, but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Public Keys: Allow users to view any public key, but only create/update their own
ALTER TABLE public_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public keys are viewable by everyone" 
  ON public_keys FOR SELECT USING (true);

CREATE POLICY "Users can create their own public keys" 
  ON public_keys FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own public keys" 
  ON public_keys FOR UPDATE USING (auth.uid() = user_id);

-- Chats: Allow users to view and send messages to chats they're members of
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chats they are members of" 
  ON chats FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = chats.id 
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats" 
  ON chats FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Chat owners can update chats" 
  ON chats FOR UPDATE USING (owner_id = auth.uid());

-- Chat Members: Allow users to see members of chats they're in
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of chats they are in" 
  ON chat_members FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members AS cm
      WHERE cm.chat_id = chat_members.chat_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Chat owners can add members" 
  ON chat_members FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_id 
      AND chats.owner_id = auth.uid()
    )
  );

-- Messages: Allow users to see and send messages in chats they're members of
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in chats they are members of" 
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = messages.chat_id 
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to chats they are members of" 
  ON messages FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = messages.chat_id 
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own messages" 
  ON messages FOR DELETE USING (user_id = auth.uid());

-- Message Reactions: Allow users to see and add reactions to messages in chats they're in
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions to messages in their chats" 
  ON message_reactions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN chat_members ON chat_members.chat_id = messages.chat_id
      WHERE messages.id = message_reactions.message_id
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add reactions to messages in their chats" 
  ON message_reactions FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM messages
      JOIN chat_members ON chat_members.chat_id = messages.chat_id
      WHERE messages.id = message_id
      AND chat_members.user_id = auth.uid()
    )
  );

-- Servers: Allow users to see and join servers
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Servers are viewable by everyone" 
  ON servers FOR SELECT USING (true);

CREATE POLICY "Users can create servers" 
  ON servers FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Server owners can update servers" 
  ON servers FOR UPDATE USING (user_id = auth.uid());

-- Channels: Allow users to see channels in servers they're members of
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view channels in servers they are members of" 
  ON channels FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM server_members 
      WHERE server_members.server_id = channels.server_id 
      AND server_members.user_id = auth.uid()
    )
  );

-- Server Members: Allow users to see members of servers they're in
ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of servers they are in" 
  ON server_members FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM server_members AS sm
      WHERE sm.server_id = server_members.server_id 
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join servers" 
  ON server_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create function to handle updating the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the timestamp function to all tables with 'updated_at'
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON servers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 