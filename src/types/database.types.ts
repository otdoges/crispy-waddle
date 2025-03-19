export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            servers: {
                Row: {
                    id: string;
                    created_at: string;
                    name: string;
                    image_url: string | null;
                    encrypted_data: string | null;
                    owner_id: string;
                    invite_code: string;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    name: string;
                    image_url?: string | null;
                    encrypted_data?: string | null;
                    owner_id: string;
                    invite_code: string;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    name?: string;
                    image_url?: string | null;
                    encrypted_data?: string | null;
                    owner_id?: string;
                    invite_code?: string;
                };
            };
            channels: {
                Row: {
                    id: string;
                    created_at: string;
                    name: string;
                    type: 'TEXT' | 'VOICE' | 'VIDEO';
                    server_id: string;
                    encrypted_data: string | null;
                    position: number;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    name: string;
                    type: 'TEXT' | 'VOICE' | 'VIDEO';
                    server_id: string;
                    encrypted_data?: string | null;
                    position: number;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    name?: string;
                    type?: 'TEXT' | 'VOICE' | 'VIDEO';
                    server_id?: string;
                    encrypted_data?: string | null;
                    position?: number;
                };
            };
            messages: {
                Row: {
                    id: string;
                    created_at: string;
                    content: string;
                    encrypted_content: string;
                    channel_id: string;
                    user_id: string;
                    updated_at: string | null;
                    deleted: boolean;
                    file_url: string | null;
                    encrypted_file_data: string | null;
                    reply_to: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    content: string;
                    encrypted_content: string;
                    channel_id: string;
                    user_id: string;
                    updated_at?: string | null;
                    deleted?: boolean;
                    file_url?: string | null;
                    encrypted_file_data?: string | null;
                    reply_to?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    content?: string;
                    encrypted_content?: string;
                    channel_id?: string;
                    user_id?: string;
                    updated_at?: string | null;
                    deleted?: boolean;
                    file_url?: string | null;
                    encrypted_file_data?: string | null;
                    reply_to?: string | null;
                };
            };
            server_members: {
                Row: {
                    id: string;
                    created_at: string;
                    server_id: string;
                    user_id: string;
                    role: 'ADMIN' | 'MODERATOR' | 'GUEST';
                    encrypted_key_data: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    server_id: string;
                    user_id: string;
                    role?: 'ADMIN' | 'MODERATOR' | 'GUEST';
                    encrypted_key_data?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    server_id?: string;
                    user_id?: string;
                    role?: 'ADMIN' | 'MODERATOR' | 'GUEST';
                    encrypted_key_data?: string | null;
                };
            };
            direct_messages: {
                Row: {
                    id: string;
                    created_at: string;
                    content: string;
                    encrypted_content: string;
                    conversation_id: string;
                    user_id: string;
                    updated_at: string | null;
                    deleted: boolean;
                    file_url: string | null;
                    encrypted_file_data: string | null;
                    reply_to: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    content: string;
                    encrypted_content: string;
                    conversation_id: string;
                    user_id: string;
                    updated_at?: string | null;
                    deleted?: boolean;
                    file_url?: string | null;
                    encrypted_file_data?: string | null;
                    reply_to?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    content?: string;
                    encrypted_content?: string;
                    conversation_id?: string;
                    user_id?: string;
                    updated_at?: string | null;
                    deleted?: boolean;
                    file_url?: string | null;
                    encrypted_file_data?: string | null;
                    reply_to?: string | null;
                };
            };
            conversations: {
                Row: {
                    id: string;
                    created_at: string;
                    encrypted_key_data: string | null;
                    last_message_at: string;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    encrypted_key_data?: string | null;
                    last_message_at?: string;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    encrypted_key_data?: string | null;
                    last_message_at?: string;
                };
            };
            conversation_participants: {
                Row: {
                    id: string;
                    created_at: string;
                    conversation_id: string;
                    user_id: string;
                    encrypted_key_data: string | null;
                    muted: boolean;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    conversation_id: string;
                    user_id: string;
                    encrypted_key_data?: string | null;
                    muted?: boolean;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    conversation_id?: string;
                    user_id?: string;
                    encrypted_key_data?: string | null;
                    muted?: boolean;
                };
            };
            user_profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    username: string;
                    avatar_url: string | null;
                    status: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DO_NOT_DISTURB';
                    custom_status: string | null;
                    encrypted_status_data: string | null;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    username: string;
                    avatar_url?: string | null;
                    status?: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DO_NOT_DISTURB';
                    custom_status?: string | null;
                    encrypted_status_data?: string | null;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    username?: string;
                    avatar_url?: string | null;
                    status?: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DO_NOT_DISTURB';
                    custom_status?: string | null;
                    encrypted_status_data?: string | null;
                    updated_at?: string;
                };
            };
            public_keys: {
                Row: {
                    id: string;
                    created_at: string;
                    user_id: string;
                    public_key: string;
                    key_type: 'PRIMARY' | 'BACKUP' | 'ROTATION';
                    is_active: boolean;
                    expires_at: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    user_id: string;
                    public_key: string;
                    key_type?: 'PRIMARY' | 'BACKUP' | 'ROTATION';
                    is_active?: boolean;
                    expires_at?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    user_id?: string;
                    public_key?: string;
                    key_type?: 'PRIMARY' | 'BACKUP' | 'ROTATION';
                    is_active?: boolean;
                    expires_at?: string | null;
                };
            };
            user_devices: {
                Row: {
                    id: string;
                    created_at: string;
                    user_id: string;
                    device_id: string;
                    device_name: string;
                    last_active: string;
                    encrypted_device_key: string;
                    push_token: string | null;
                    is_trusted: boolean;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    user_id: string;
                    device_id: string;
                    device_name: string;
                    last_active?: string;
                    encrypted_device_key: string;
                    push_token?: string | null;
                    is_trusted?: boolean;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    user_id?: string;
                    device_id?: string;
                    device_name?: string;
                    last_active?: string;
                    encrypted_device_key?: string;
                    push_token?: string | null;
                    is_trusted?: boolean;
                };
            };
            message_reactions: {
                Row: {
                    id: string;
                    created_at: string;
                    message_id: string;
                    user_id: string;
                    emoji: string;
                    encrypted_emoji_data: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    message_id: string;
                    user_id: string;
                    emoji: string;
                    encrypted_emoji_data?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    message_id?: string;
                    user_id?: string;
                    emoji?: string;
                    encrypted_emoji_data?: string | null;
                };
            };
            message_read_status: {
                Row: {
                    id: string;
                    created_at: string;
                    message_id: string;
                    user_id: string;
                    read_at: string;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    message_id: string;
                    user_id: string;
                    read_at?: string;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    message_id?: string;
                    user_id?: string;
                    read_at?: string;
                };
            };
            direct_message_reactions: {
                Row: {
                    id: string;
                    created_at: string;
                    direct_message_id: string;
                    user_id: string;
                    emoji: string;
                    encrypted_emoji_data: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    direct_message_id: string;
                    user_id: string;
                    emoji: string;
                    encrypted_emoji_data?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    direct_message_id?: string;
                    user_id?: string;
                    emoji?: string;
                    encrypted_emoji_data?: string | null;
                };
            };
            direct_message_read_status: {
                Row: {
                    id: string;
                    created_at: string;
                    direct_message_id: string;
                    user_id: string;
                    read_at: string;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    direct_message_id: string;
                    user_id: string;
                    read_at?: string;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    direct_message_id?: string;
                    user_id?: string;
                    read_at?: string;
                };
            };
            server_verification: {
                Row: {
                    id: string;
                    created_at: string;
                    server_id: string;
                    verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
                    verification_code: string | null;
                    verified_at: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    server_id: string;
                    verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
                    verification_code?: string | null;
                    verified_at?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    server_id?: string;
                    verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
                    verification_code?: string | null;
                    verified_at?: string | null;
                };
            };
        };
    };
}