# SecureChat Database Architecture

The database for SecureChat is designed to ensure end-to-end encryption while providing the necessary structure for a modern chat application. This document explains the database schema and the security considerations behind it.

## Security Principles

1. **Zero Knowledge Architecture**: The server never has access to unencrypted message content
2. **End-to-End Encryption**: All sensitive content is encrypted on the client before being sent to the server
3. **Row-Level Security**: Supabase RLS policies ensure that users can only access data they have permission to see
4. **Public Key Infrastructure**: Uses asymmetric encryption with public/private key pairs per user

## Schema Overview

### Users & Authentication

- **profiles**: Extends Supabase Auth users with additional profile information
- **public_keys**: Stores users' public encryption keys (private keys never leave the client)

### Messaging

- **chats**: Represents chat channels (direct messages or group chats)
- **chat_members**: Links users to the chats they're a part of
- **messages**: Stores encrypted message content
- **message_reactions**: Stores encrypted reactions to messages

### Servers (Discord-like functionality)

- **servers**: Represents community servers
- **channels**: Text or voice channels within a server
- **server_members**: Links users to the servers they've joined

## Security Implementation

### Encryption at Rest

All sensitive data is encrypted before it reaches the server:

- Message content is encrypted with the recipient's public key
- Group chat messages use a shared encryption key
- Chat metadata (like group chat names) is encrypted
- Message reactions are encrypted

### Row-Level Security

Each table has Postgres RLS policies that ensure:

- Users can only see messages in chats they're members of
- Users can only send messages to chats they belong to
- Users can only see members of chats they're in
- Only chat owners can add members to a chat

### Metadata Protection

The database is designed to minimize metadata exposure:

- Message timestamps are stored to enable chronological ordering
- General message types (text, image, file) are stored for UI purposes
- The system tracks which users are in which chats, but not which messages they've seen

## Database Diagrams

```
profiles
├── id (PK, FK -> auth.users)
├── username
├── email
├── full_name
├── avatar_url
├── bio
├── created_at
└── updated_at

public_keys
├── id (PK)
├── user_id (FK -> auth.users)
├── public_key
├── key_type
├── device_id
├── key_id
├── created_at
└── updated_at

chats
├── id (PK)
├── name
├── type
├── owner_id (FK -> auth.users)
├── encrypted_details
├── created_at
└── updated_at

chat_members
├── id (PK)
├── chat_id (FK -> chats)
├── user_id (FK -> auth.users)
├── role
└── joined_at

messages
├── id (PK)
├── chat_id (FK -> chats)
├── user_id (FK -> auth.users)
├── recipient_id (FK -> auth.users)
├── message_type
├── encrypted_content
├── read_at
├── created_at
└── updated_at

message_reactions
├── id (PK)
├── message_id (FK -> messages)
├── user_id (FK -> auth.users)
├── encrypted_reaction
└── created_at

servers
├── id (PK)
├── name
├── description
├── image_url
├── user_id (FK -> auth.users)
├── created_at
└── updated_at

channels
├── id (PK)
├── server_id (FK -> servers)
├── name
├── description
├── type
├── position
├── created_at
└── updated_at

server_members
├── id (PK)
├── server_id (FK -> servers)
├── user_id (FK -> auth.users)
├── role
└── joined_at
```

## Data Flow

1. **Key Generation**:
   - When a user registers, a public/private key pair is generated client-side
   - The public key is stored in the `public_keys` table
   - The private key is stored in the browser's localStorage

2. **Sending a Message**:
   - The client encrypts the message using the recipient's public key
   - The encrypted content is sent to the server and stored in the `messages` table
   - The server never sees the unencrypted content

3. **Receiving a Message**:
   - The client fetches encrypted messages
   - Messages are decrypted using the user's private key
   - Decryption happens entirely on the client

4. **Key Rotation**:
   - Users can rotate their encryption keys periodically
   - Old keys are preserved to decrypt historical messages
   - New messages use the latest keys automatically

## Database Migrations

The `schema.sql` file contains the full database schema that can be run to set up the database structure. When deploying to Supabase, this can be used as an SQL migration. 