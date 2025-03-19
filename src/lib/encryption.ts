import { box, randomBytes } from 'tweetnacl';
import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

// Generate a new key pair for encryption
export const generateKeyPair = () => {
    const keyPair = box.keyPair();
    return {
        publicKey: encodeBase64(keyPair.publicKey),
        secretKey: encodeBase64(keyPair.secretKey),
    };
};

// Store keys securely in localStorage
export const storeKeyPair = (keyPair: { publicKey: string; secretKey: string }, serverId?: string) => {
    const storageKey = serverId ? `encryption_keys_${serverId}` : 'encryption_keys_default';
    localStorage.setItem(storageKey, JSON.stringify(keyPair));
};

// Retrieve keys from localStorage
export const getKeyPair = (serverId?: string) => {
    const storageKey = serverId ? `encryption_keys_${serverId}` : 'encryption_keys_default';
    const storedKeys = localStorage.getItem(storageKey);
    if (!storedKeys) return null;
    return JSON.parse(storedKeys) as { publicKey: string; secretKey: string };
};

// Encrypt a message using the recipient's public key and sender's secret key
export const encryptMessage = (
    message: string,
    recipientPublicKey: string,
    senderSecretKey: string
) => {
    const nonce = randomBytes(box.nonceLength);
    const messageUint8 = decodeUTF8(message);
    const encryptedMessage = box(
        messageUint8,
        nonce,
        decodeBase64(recipientPublicKey),
        decodeBase64(senderSecretKey)
    );

    const fullMessage = new Uint8Array(nonce.length + encryptedMessage.length);
    fullMessage.set(nonce);
    fullMessage.set(encryptedMessage, nonce.length);

    return encodeBase64(fullMessage);
};

// Decrypt a message using the recipient's secret key and sender's public key
export const decryptMessage = (
    encryptedMessage: string,
    senderPublicKey: string,
    recipientSecretKey: string
) => {
    const messageWithNonceAsUint8Array = decodeBase64(encryptedMessage);
    const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength);
    const message = messageWithNonceAsUint8Array.slice(
        box.nonceLength,
        messageWithNonceAsUint8Array.length
    );

    const decrypted = box.open(
        message,
        nonce,
        decodeBase64(senderPublicKey),
        decodeBase64(recipientSecretKey)
    );

    if (!decrypted) {
        throw new Error('Could not decrypt message');
    }

    return encodeUTF8(decrypted);
};

// Generate a shared encryption key for a server or channel
export const generateServerKey = () => {
    const randomKey = randomBytes(32);
    return encodeBase64(randomKey);
};

// Encrypt data with a shared key (for server/channel encryption)
export const encryptWithSharedKey = (data: string, sharedKey: string) => {
    const nonce = randomBytes(box.nonceLength);
    const keyUint8Array = decodeBase64(sharedKey);
    const messageUint8 = decodeUTF8(data);

    // Use secretbox for symmetric encryption
    const encrypted = box.after(messageUint8, nonce, keyUint8Array);

    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);

    return encodeBase64(fullMessage);
};

// Decrypt data with a shared key
export const decryptWithSharedKey = (encryptedData: string, sharedKey: string) => {
    const messageWithNonceAsUint8Array = decodeBase64(encryptedData);
    const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength);
    const message = messageWithNonceAsUint8Array.slice(
        box.nonceLength,
        messageWithNonceAsUint8Array.length
    );

    const keyUint8Array = decodeBase64(sharedKey);
    const decrypted = box.open.after(message, nonce, keyUint8Array);

    if (!decrypted) {
        throw new Error('Could not decrypt data');
    }

    return encodeUTF8(decrypted);
};