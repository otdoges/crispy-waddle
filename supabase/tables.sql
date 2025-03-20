-- Performance optimized tables for SecureChat

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For query performance monitoring

-- Create materialized views for frequently accessed data
CREATE MATERIALIZED VIEW IF NOT EXISTS active_users AS
SELECT 
    user_id,
    username,
    status,
    last_active
FROM user_profiles
WHERE status != 'OFFLINE'
WITH DATA;

-- Create indexes for materialized views
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_users_user_id ON active_users(user_id);

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY active_users;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views_trigger()
RETURNS trigger AS $$
BEGIN
    PERFORM refresh_materialized_views();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for materialized view refresh
CREATE TRIGGER refresh_materialized_views_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_materialized_views_trigger();

-- Create partitioned tables for better performance with large datasets
CREATE TABLE IF NOT EXISTS messages_partitioned (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    content TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    channel_id UUID NOT NULL,
    user_id UUID NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    file_url TEXT,
    encrypted_file_data TEXT,
    reply_to UUID
) PARTITION BY RANGE (created_at);

-- Create partitions for messages
CREATE TABLE IF NOT EXISTS messages_recent PARTITION OF messages_partitioned
    FOR VALUES FROM ('2024-01-01') TO (MAXVALUE);

CREATE TABLE IF NOT EXISTS messages_2023 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

-- Create function to automatically create new partitions
CREATE OR REPLACE FUNCTION create_message_partition()
RETURNS void AS $$
DECLARE
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := date_trunc('year', now() + interval '1 year');
    end_date := start_date + interval '1 year';
    partition_name := 'messages_' || to_char(start_date, 'YYYY');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF messages_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic partition creation
CREATE OR REPLACE FUNCTION create_message_partition_trigger()
RETURNS trigger AS $$
BEGIN
    PERFORM create_message_partition();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_message_partition_trigger
    AFTER INSERT ON messages_partitioned
    FOR EACH STATEMENT
    EXECUTE FUNCTION create_message_partition_trigger();

-- Create function for message archiving
CREATE OR REPLACE FUNCTION archive_old_messages()
RETURNS void AS $$
BEGIN
    -- Archive messages older than 1 year
    INSERT INTO messages_archive
    SELECT * FROM messages_partitioned
    WHERE created_at < now() - interval '1 year';
    
    -- Delete archived messages from partitioned table
    DELETE FROM messages_partitioned
    WHERE created_at < now() - interval '1 year';
END;
$$ LANGUAGE plpgsql;

-- Create archive table for old messages
CREATE TABLE IF NOT EXISTS messages_archive (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE,
    content TEXT,
    encrypted_content TEXT,
    channel_id UUID,
    user_id UUID,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN,
    file_url TEXT,
    encrypted_file_data TEXT,
    reply_to UUID
) WITH (autovacuum_enabled = false);

-- Create function for message compression
CREATE OR REPLACE FUNCTION compress_archived_messages()
RETURNS void AS $$
BEGIN
    -- Compress archived messages using pgcrypto
    UPDATE messages_archive
    SET encrypted_content = pgp_sym_encrypt(
        encrypted_content::text,
        current_setting('app.encryption_key')
    )::text
    WHERE created_at < now() - interval '2 years';
END;
$$ LANGUAGE plpgsql;

-- Create function for automatic cleanup
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete archived messages older than 5 years
    DELETE FROM messages_archive
    WHERE created_at < now() - interval '5 years';
    
    -- Clean up old sessions
    DELETE FROM user_sessions
    WHERE expires_at < now() - interval '30 days';
    
    -- Clean up old login attempts
    DELETE FROM login_attempts
    WHERE attempted_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job for cleanup
SELECT cron.schedule('0 0 * * *', $$SELECT cleanup_old_data()$$);

-- Create function for message search optimization
CREATE OR REPLACE FUNCTION create_message_search_index()
RETURNS void AS $$
BEGIN
    -- Create GIN index for full-text search
    CREATE INDEX IF NOT EXISTS idx_messages_search ON messages_partitioned
    USING GIN (to_tsvector('english', content));
END;
$$ LANGUAGE plpgsql;

-- Create function for automatic index maintenance
CREATE OR REPLACE FUNCTION maintain_indexes()
RETURNS void AS $$
BEGIN
    -- Reindex tables with high write activity
    REINDEX TABLE CONCURRENTLY messages_partitioned;
    REINDEX TABLE CONCURRENTLY user_sessions;
    REINDEX TABLE CONCURRENTLY login_attempts;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job for index maintenance
SELECT cron.schedule('0 1 * * *', $$SELECT maintain_indexes()$$);

-- Create function for connection pooling optimization
CREATE OR REPLACE FUNCTION optimize_connections()
RETURNS void AS $$
BEGIN
    -- Set connection pool parameters
    ALTER SYSTEM SET max_connections = '200';
    ALTER SYSTEM SET shared_buffers = '1GB';
    ALTER SYSTEM SET effective_cache_size = '3GB';
    ALTER SYSTEM SET maintenance_work_mem = '256MB';
    ALTER SYSTEM SET checkpoint_completion_target = '0.9';
    ALTER SYSTEM SET wal_buffers = '16MB';
    ALTER SYSTEM SET default_statistics_target = '100';
    ALTER SYSTEM SET random_page_cost = '1.1';
    ALTER SYSTEM SET effective_io_concurrency = '200';
    ALTER SYSTEM SET work_mem = '16MB';
END;
$$ LANGUAGE plpgsql;

-- Create function for query performance monitoring
CREATE OR REPLACE FUNCTION monitor_query_performance()
RETURNS void AS $$
BEGIN
    -- Reset pg_stat_statements
    SELECT pg_stat_statements_reset();
    
    -- Analyze query performance
    CREATE TABLE IF NOT EXISTS query_performance_log (
        id SERIAL PRIMARY KEY,
        query_id BIGINT,
        calls BIGINT,
        total_time DOUBLE PRECISION,
        mean_time DOUBLE PRECISION,
        rows BIGINT,
        shared_blks_hit BIGINT,
        shared_blks_read BIGINT,
        shared_blks_dirtied BIGINT,
        shared_blks_written BIGINT,
        local_blks_hit BIGINT,
        local_blks_read BIGINT,
        local_blks_dirtied BIGINT,
        local_blks_written BIGINT,
        temp_blks_read BIGINT,
        temp_blks_written BIGINT,
        blk_read_time DOUBLE PRECISION,
        blk_write_time DOUBLE PRECISION,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Log slow queries
    INSERT INTO query_performance_log
    SELECT 
        queryid,
        calls,
        total_time,
        mean_time,
        rows,
        shared_blks_hit,
        shared_blks_read,
        shared_blks_dirtied,
        shared_blks_written,
        local_blks_hit,
        local_blks_read,
        local_blks_dirtied,
        local_blks_written,
        temp_blks_read,
        temp_blks_written,
        blk_read_time,
        blk_write_time
    FROM pg_stat_statements
    WHERE mean_time > 1000; -- Log queries taking more than 1 second
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job for query monitoring
SELECT cron.schedule('0 */4 * * *', $$SELECT monitor_query_performance()$$);

-- Create function for automatic vacuum
CREATE OR REPLACE FUNCTION auto_vacuum()
RETURNS void AS $$
BEGIN
    -- Vacuum tables with high write activity
    VACUUM ANALYZE messages_partitioned;
    VACUUM ANALYZE user_sessions;
    VACUUM ANALYZE login_attempts;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job for vacuum
SELECT cron.schedule('0 2 * * *', $$SELECT auto_vacuum()$$);

-- Create function for connection pooling
CREATE OR REPLACE FUNCTION setup_connection_pool()
RETURNS void AS $$
BEGIN
    -- Set up connection pooling parameters
    ALTER SYSTEM SET max_connections = '200';
    ALTER SYSTEM SET shared_buffers = '1GB';
    ALTER SYSTEM SET effective_cache_size = '3GB';
    ALTER SYSTEM SET maintenance_work_mem = '256MB';
    ALTER SYSTEM SET checkpoint_completion_target = '0.9';
    ALTER SYSTEM SET wal_buffers = '16MB';
    ALTER SYSTEM SET default_statistics_target = '100';
    ALTER SYSTEM SET random_page_cost = '1.1';
    ALTER SYSTEM SET effective_io_concurrency = '200';
    ALTER SYSTEM SET work_mem = '16MB';
END;
$$ LANGUAGE plpgsql;

-- Execute initial setup
SELECT setup_connection_pool();
SELECT create_message_partition();
SELECT refresh_materialized_views();

-- Enhanced messaging schema with GUI features
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES channels(id),
    root_message_id UUID REFERENCES messages_partitioned(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    participant_count INT DEFAULT 1,
    is_pinned BOOLEAN DEFAULT false,
    title TEXT,
    CONSTRAINT fk_channel FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE
);

-- Add rich message content support
ALTER TABLE messages_partitioned
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text/plain' CHECK (content_type IN (
    'text/plain',
    'text/markdown',
    'application/json',
    'text/x-url'
)),
ADD COLUMN IF NOT EXISTS rich_content JSONB,
ADD COLUMN IF NOT EXISTS link_preview JSONB,
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS read_by UUID[] DEFAULT ARRAY[]::UUID[];

-- Message metadata for GUI
CREATE TABLE IF NOT EXISTS message_metadata (
    message_id UUID PRIMARY KEY REFERENCES messages_partitioned(id) ON DELETE CASCADE,
    edit_history JSONB[],
    embeds JSONB[],
    client_info JSONB,
    rendering_time_ms INT,
    last_displayed TIMESTAMP WITH TIME ZONE
);

-- GUI user preferences
CREATE TABLE IF NOT EXISTS message_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark',
    font_size INT DEFAULT 14 CHECK (font_size BETWEEN 10 AND 24),
    message_grouping INTERVAL DEFAULT '5 minutes',
    animation_level TEXT DEFAULT 'medium' CHECK (animation_level IN ('low', 'medium', 'high')),
    show_read_receipts BOOLEAN DEFAULT true,
    show_typing_indicators BOOLEAN DEFAULT true,
    message_preview_length INT DEFAULT 200 CHECK (message_preview_length BETWEEN 50 AND 1000)
);

-- Typing indicators
CREATE TABLE IF NOT EXISTS typing_indicators (
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_typed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (channel_id, user_id)
);

-- Message search optimization
CREATE INDEX IF NOT EXISTS idx_message_search ON messages_partitioned USING GIN (
    to_tsvector('english', content),
    rich_content
);

-- Materialized view for unread messages
CREATE MATERIALIZED VIEW IF NOT EXISTS unread_messages AS
SELECT 
    m.id,
    m.channel_id,
    m.user_id,
    m.created_at,
    COUNT(*) FILTER (WHERE NOT (u.id = ANY(m.read_by))) AS unread_count
FROM messages_partitioned m
JOIN channel_members cm ON m.channel_id = cm.channel_id
JOIN auth.users u ON cm.user_id = u.id
GROUP BY m.id, m.channel_id, m.user_id, m.created_at
WITH DATA;

-- Refresh unread messages view function
CREATE OR REPLACE FUNCTION refresh_unread_messages()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY unread_messages;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message updates
CREATE TRIGGER refresh_unread_messages_trigger
AFTER INSERT OR UPDATE ON messages_partitioned
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_unread_messages();

-- Rich message components
CREATE TABLE IF NOT EXISTS message_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages_partitioned(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('button', 'form', 'carousel', 'accordion')),
    component_data JSONB,
    position INT,
    style JSONB
);

-- Message drafts
CREATE TABLE IF NOT EXISTS message_drafts (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    draft_content JSONB,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, channel_id)
);

-- Enhanced security for message access
ALTER TABLE messages_partitioned ENABLE ROW LEVEL SECURITY;

CREATE POLICY message_access_policy ON messages_partitioned
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM channel_members
        WHERE channel_members.channel_id = messages_partitioned.channel_id
        AND channel_members.user_id = auth.uid()
    )
);

-- Enhanced Authentication and Session Management
CREATE TABLE IF NOT EXISTS enhanced_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    refresh_token TEXT UNIQUE,
    access_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_info JSONB,
    ip_address TEXT,
    is_valid BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Interface Customization
CREATE TABLE IF NOT EXISTS ui_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    colors JSONB NOT NULL,
    typography JSONB,
    spacing JSONB,
    animations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_system BOOLEAN DEFAULT false
);

-- User Theme Preferences
CREATE TABLE IF NOT EXISTS user_theme_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES ui_themes(id),
    custom_overrides JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Attachments with Enhanced Features
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages_partitioned(id) ON DELETE CASCADE,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    file_name TEXT,
    mime_type TEXT,
    thumbnail_url TEXT,
    processing_status TEXT DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced User Presence
CREATE TABLE IF NOT EXISTS user_presence (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'offline',
    custom_status TEXT,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_type TEXT,
    client_info JSONB,
    is_mobile BOOLEAN DEFAULT false
);

-- Message Reactions with Animations
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages_partitioned(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    animation_type TEXT DEFAULT 'bounce',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Chat Features and Settings
CREATE TABLE IF NOT EXISTS chat_features (
    channel_id UUID PRIMARY KEY REFERENCES channels(id) ON DELETE CASCADE,
    enable_threads BOOLEAN DEFAULT true,
    enable_reactions BOOLEAN DEFAULT true,
    enable_attachments BOOLEAN DEFAULT true,
    enable_voice_messages BOOLEAN DEFAULT true,
    message_retention_days INTEGER DEFAULT 365,
    max_participants INTEGER DEFAULT 1000,
    features JSONB
);

-- Default System Theme
INSERT INTO ui_themes (name, colors, typography, spacing, animations, is_system) 
VALUES (
    'Default Dark',
    '{
        "primary": "#7C3AED",
        "secondary": "#5B21B6",
        "background": "#1F2937",
        "surface": "#374151",
        "text": "#F9FAFB",
        "accent": "#60A5FA"
    }'::jsonb,
    '{
        "fontFamily": "Inter, system-ui, sans-serif",
        "headingSize": "1.25rem",
        "bodySize": "1rem",
        "lineHeight": "1.5"
    }'::jsonb,
    '{
        "padding": "1rem",
        "gap": "0.5rem",
        "radius": "0.5rem"
    }'::jsonb,
    '{
        "transition": "all 0.2s ease-in-out",
        "messageIn": "slideInLeft",
        "messageOut": "slideInRight",
        "reaction": "bounce"
    }'::jsonb,
    true
) ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enhanced_sessions_user ON enhanced_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);

-- Add RLS policies
ALTER TABLE enhanced_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Session access policy
CREATE POLICY session_access_policy ON enhanced_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Presence access policy
CREATE POLICY presence_view_policy ON user_presence
    FOR SELECT USING (true);
CREATE POLICY presence_modify_policy ON user_presence
    FOR ALL USING (auth.uid() = user_id);

-- Reaction access policy
CREATE POLICY reaction_access_policy ON message_reactions
    FOR ALL USING (auth.uid() = user_id);

-- Attachment access policy
CREATE POLICY attachment_access_policy ON message_attachments
    USING (EXISTS (
        SELECT 1 FROM messages_partitioned m
        JOIN channel_members cm ON m.channel_id = cm.channel_id
        WHERE m.id = message_attachments.message_id
        AND cm.user_id = auth.uid()
    ));

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_presence (user_id, status, last_active)
    VALUES (NEW.id, 'online', NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        status = 'online',
        last_active = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user presence
CREATE TRIGGER user_presence_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_presence();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM enhanced_sessions
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule session cleanup
SELECT cron.schedule('0 */6 * * *', $$SELECT cleanup_expired_sessions()$$);

-- Function to update last activity
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE enhanced_sessions
    SET last_activity = NOW()
    WHERE user_id = NEW.user_id
    AND is_valid = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for activity tracking
CREATE TRIGGER last_activity_trigger
    AFTER INSERT OR UPDATE ON messages_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION update_last_activity(); 