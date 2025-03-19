# SecureChat - End-to-End Encrypted Messaging

SecureChat is a modern, secure messaging platform that prioritizes user privacy through end-to-end encryption. Every message is encrypted locally before transmission and can only be decrypted by the intended recipient.

![SecureChat Screenshot](https://via.placeholder.com/800x450.png?text=SecureChat+Screenshot)

## Features

### Privacy & Security
- 🔐 **True End-to-End Encryption** - Messages are encrypted before leaving your device
- 🔑 **Unique Encryption Keys** - Each user has their own encryption key pair
- 🚫 **Zero Knowledge Architecture** - We can't read your messages, even if we wanted to
- 💾 **Local Key Storage** - Encryption keys never leave your device
- 🔄 **Key Rotation** - Regularly change encryption keys for enhanced security
- 🧩 **XChaCha20-Poly1305 Encryption** - Military-grade encryption algorithm

### User Experience
- 💬 **Real-time Messaging** - Instant message delivery with read receipts
- 👥 **Secure Group Chats** - Create encrypted conversations with multiple participants
- 🖼️ **Media Sharing** - Send encrypted images, videos, and files
- 🌙 **Dark Mode** - Easy on the eyes, particularly in low-light environments
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- ✨ **Smooth Animations** - Polished user experience with fluid transitions

### Technical Highlights
- ⚡ **tRPC Integration** - Type-safe API calls for improved performance and reliability
- 🧱 **Next.js Architecture** - Modern React framework with server-side rendering
- 🔄 **Supabase Backend** - Secure, scalable database and authentication
- 🧠 **TypeScript** - Type safety throughout the codebase
- 📦 **PNPM Workspaces** - Efficient package management

## Getting Started

### Prerequisites
- Node.js (v16+)
- PNPM package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/encrypted-messaging-app.git
cd encrypted-messaging-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
pnpm dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_NAME=SecureChat
NEXT_PUBLIC_PASSWORD_MIN_LENGTH=12
```

## Security Model

SecureChat uses a comprehensive security approach:

1. **Client-Side Key Generation**: Encryption keys are generated in the browser using Web Crypto API
2. **Unique Key Pairs**: Each user has a unique public/private key pair
3. **Local Storage Only**: Private keys never leave the client device
4. **Message Encryption**: Each message is encrypted with the recipient's public key
5. **Multiple Device Support**: Secure key synchronization between user devices
6. **Forward Secrecy**: Regular key rotation prevents decryption of past messages if keys are compromised
7. **Zero Server Knowledge**: The server only stores encrypted data and cannot decrypt messages

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Our security model is inspired by Signal's protocol
- Special thanks to all the open-source libraries that make this project possible
