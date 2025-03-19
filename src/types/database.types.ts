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
                };
            };
            conversations: {
                Row: {
                    id: string;
                    created_at: string;
                    encrypted_key_data: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    encrypted_key_data?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    encrypted_key_data?: string | null;
                };
            };
            conversation_participants: {
                Row: {
                    id: string;
                    created_at: string;
                    conversation_id: string;
                    user_id: string;
                    encrypted_key_data: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    conversation_id: string;
                    user_id: string;
                    encrypted_key_data?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    conversation_id?: string;
                    user_id?: string;
                    encrypted_key_data?: string | null;
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
        };
    };
}