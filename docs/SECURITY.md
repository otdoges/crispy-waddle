# SecureChat Security Model

## Overview

SecureChat is built with a security-first approach, implementing end-to-end encryption (E2EE) that ensures only the intended recipients can read message content. The server and administrators have zero access to message content.

## Core Security Principles

### 1. End-to-End Encryption (E2EE)

All messages are encrypted on the sender's device and can only be decrypted by the intended recipient's device. The encryption and decryption operations happen exclusively on client devices.

### 2. Zero Knowledge Architecture

The server stores only encrypted data and cannot decrypt any message content, even if compelled to by legal or other means.

### 3. Perfect Forward Secrecy

Regular key rotation prevents past communications from being compromised even if current keys are exposed.

### 4. Local Key Storage

Private encryption keys never leave the user's device. They are stored securely in localStorage with added protection features.

### 5. Open Cryptographic Standards

We use well-established cryptographic libraries and standards:

- **TweetNaCl.js** - A trusted crypto library
- **XChaCha20-Poly1305** - For symmetric encryption
- **X25519** - For key exchange
- **Ed25519** - For signatures

## Encryption Implementation Details

### Key Generation and Storage

1. **Device Identification**:
   - Each device gets a unique ID
   - This enables multi-device support while maintaining security

2. **Key Pair Generation**:
   ```javascript
   const keyPair = generateKeyPair();
   // Returns: { publicKey, secretKey, metadata }
   ```

3. **Private Key Storage**:
   - Keys are stored in localStorage with version info
   - All operations that use private keys happen client-side only
   - Keys are never transmitted over the network

### Message Encryption Flow

1. **Sending a Direct Message**:
   - Fetch recipient's public key from server
   - Encrypt message content with recipient's public key
   - Send encrypted message to server
   - Server stores only the encrypted content

2. **Group Message Encryption**:
   - Each group has a shared encryption key
   - The shared key is encrypted separately for each group member
   - Messages are encrypted with the shared key
   - Only group members can decrypt the shared key and thus the messages

3. **Multi-Device Support**:
   - Users can have multiple devices with different key pairs
   - Public keys for all devices are stored on the server
   - Messages are attempted to be decrypted with all available keys

### Key Rotation and Forward Secrecy

1. **Automatic Key Rotation**:
   - Keys are automatically rotated every 30 days by default
   - Old keys are preserved for decrypting historical messages
   - New messages use the latest keys

2. **Manual Key Rotation**:
   ```javascript
   const newKeyPair = rotateKeyPair(currentKeyPair);
   ```

3. **Key Backup**:
   - Users can export their keys in encrypted form
   - The export is protected with a user-provided password
   - Keys can be imported on new devices

## Secure Implementation Patterns

### Defense in Depth

1. **Client-Side Validation**:
   - All encryption/decryption operations verify data integrity
   - Messages that fail validation are rejected

2. **Server-Side Protection**:
   - Row-Level Security ensures users can only access their data
   - Supabase Auth provides additional authentication security

3. **Metadata Minimization**:
   - We minimize the amount of metadata stored with messages
   - Even metadata is encrypted where feasible

### Secure Development Practices

1. **Security-Focused Code Review**:
   - All code changes undergo security review
   - Cryptographic implementations get extra scrutiny

2. **No Custom Cryptography**:
   - We use established cryptographic libraries instead of custom implementations
   - Cryptographic primitives are not modified or extended

3. **Regular Security Audits**:
   - Third-party security experts review our code and architecture
   - Any findings are promptly addressed

## Attack Surface Mitigation

### Potential Attack Vectors and Mitigations

1. **Client Device Compromise**:
   - Impact: Attacker could access keys for that device only
   - Mitigation: Regular key rotation limits the window of exposure

2. **Man-in-the-Middle Attacks**:
   - Impact: Could attempt to intercept communications
   - Mitigation: TLS encryption, signature verification

3. **Server Compromise**:
   - Impact: Limited to metadata access, content remains encrypted
   - Mitigation: Zero-knowledge architecture means content stays protected

4. **Brute Force Attacks**:
   - Impact: Attempt to guess encryption keys
   - Mitigation: Modern cryptographic algorithms with sufficient key length

## Security Reporting

If you discover any security issues, please report them by emailing [security@securechat.example.com](mailto:security@securechat.example.com) rather than using the public issue tracker.

## Limitations

While our security model is robust, users should be aware of these limitations:

1. Device security is a prerequisite - if your device is compromised, your messages could be exposed
2. Password strength for account access remains important
3. No cryptographic system is 100% unbreakable against all future attacks

## Future Security Enhancements

We're continually improving our security model. Planned enhancements include:

1. Hardware security module (HSM) support for key storage
2. Post-quantum cryptography algorithms
3. Secure enclaves for biometric authentication
4. Enhanced message ephemerality options 