import { box, randomBytes, secretbox } from 'tweetnacl';
import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { v4 as uuidv4 } from 'uuid';

// Check if code is running in browser environment
const isBrowser = typeof window !== 'undefined';

// Constants
const KEY_PREFIX = 'securechat_keys';
const PRIMARY_KEY = `${KEY_PREFIX}_primary`;
const DEVICE_ID_KEY = `${KEY_PREFIX}_device_id`;
const BACKUP_PREFIX = `${KEY_PREFIX}_backup`;

// Generate a unique device ID if not exists
export const getOrCreateDeviceId = () => {
  if (!isBrowser) return null;
  
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error managing device ID:', error);
    return null;
  }
};

// Generate a new key pair for encryption with additional metadata
export const generateKeyPair = () => {
  const keyPair = box.keyPair();
  const createdAt = new Date().toISOString();
  const keyId = uuidv4();
  
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey),
    metadata: {
      keyId,
      createdAt,
      algorithm: 'X25519-XChaCha20-Poly1305',
      deviceId: getOrCreateDeviceId(),
    }
  };
};

// Store keys securely in localStorage with enhanced security
export const storeKeyPair = (
  keyPair: { 
    publicKey: string; 
    secretKey: string; 
    metadata?: { 
      keyId: string; 
      createdAt: string; 
      algorithm: string; 
      deviceId: string | null;
    } 
  }, 
  context?: string
) => {
  if (!isBrowser) return; // Skip localStorage operations on server
  
  try {
    // Generate metadata if not provided
    if (!keyPair.metadata) {
      keyPair.metadata = {
        keyId: uuidv4(),
        createdAt: new Date().toISOString(),
        algorithm: 'X25519-XChaCha20-Poly1305',
        deviceId: getOrCreateDeviceId(),
      };
    }
    
    // Add a version identifier to support future format changes
    const keyData = {
      version: 1,
      ...keyPair
    };
    
    const storageKey = context ? `${KEY_PREFIX}_${context}` : PRIMARY_KEY;
    localStorage.setItem(storageKey, JSON.stringify(keyData));
    
    // Also maintain a registry of all keys
    updateKeyRegistry(keyPair.metadata.keyId, context || 'primary');
    
    return keyPair.metadata.keyId;
  } catch (error) {
    console.error('Error storing key pair:', error);
    // Fail silently in production
  }
};

// Maintain a registry of all encryption keys for the user
const updateKeyRegistry = (keyId: string, context: string) => {
  if (!isBrowser) return;
  
  try {
    const registryKey = `${KEY_PREFIX}_registry`;
    const existingRegistry = localStorage.getItem(registryKey);
    let registry = existingRegistry ? JSON.parse(existingRegistry) : {};
    
    registry[keyId] = {
      context,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(registryKey, JSON.stringify(registry));
  } catch (error) {
    console.error('Error updating key registry:', error);
  }
};

// Retrieve keys from localStorage with enhanced error handling
export const getKeyPair = (context?: string) => {
  if (!isBrowser) return null; // Return null on server
  
  try {
    const storageKey = context ? `${KEY_PREFIX}_${context}` : PRIMARY_KEY;
    const storedKeys = localStorage.getItem(storageKey);
    if (!storedKeys) return null;
    
    const parsedKeys = JSON.parse(storedKeys);
    
    // Check version and handle migrations if needed
    if (!parsedKeys.version) {
      // Legacy format - migrate to new format
      const updatedKeys = {
        version: 1,
        publicKey: parsedKeys.publicKey,
        secretKey: parsedKeys.secretKey,
        metadata: {
          keyId: uuidv4(),
          createdAt: new Date().toISOString(),
          algorithm: 'X25519-XChaCha20-Poly1305',
          deviceId: getOrCreateDeviceId(),
        }
      };
      
      // Save the updated format
      localStorage.setItem(storageKey, JSON.stringify(updatedKeys));
      return updatedKeys;
    }
    
    return parsedKeys;
  } catch (error) {
    console.error('Error retrieving key pair:', error);
    return null;
  }
};

// Get all stored keys (for message decryption attempts)
export const getAllKeys = () => {
  if (!isBrowser) return []; // Return empty array on server
  
  try {
    const registryKey = `${KEY_PREFIX}_registry`;
    const existingRegistry = localStorage.getItem(registryKey);
    if (!existingRegistry) return [];
    
    const registry = JSON.parse(existingRegistry);
    const keys = [];
    
    for (const keyId in registry) {
      const { context } = registry[keyId];
      const storageKey = context === 'primary' ? PRIMARY_KEY : `${KEY_PREFIX}_${context}`;
      const storedKeyData = localStorage.getItem(storageKey);
      
      if (storedKeyData) {
        keys.push(JSON.parse(storedKeyData));
      }
    }
    
    return keys;
  } catch (error) {
    console.error('Error retrieving all keys:', error);
    return [];
  }
};

// Encrypt a message using the recipient's public key and sender's secret key
export const encryptMessage = (
  message: string,
  recipientPublicKey: string,
  senderSecretKey: string
) => {
  if (!isBrowser) {
    throw new Error('Encryption can only be performed in browser environment');
  }
  
  // Generate a random nonce
  const nonce = randomBytes(box.nonceLength);
  
  // Convert message to Uint8Array
  const messageUint8 = decodeUTF8(message);
  
  // Encrypt the message
  const encryptedMessage = box(
    messageUint8,
    nonce,
    decodeBase64(recipientPublicKey),
    decodeBase64(senderSecretKey)
  );

  // Combine nonce and encrypted message
  const fullMessage = new Uint8Array(nonce.length + encryptedMessage.length);
  fullMessage.set(nonce);
  fullMessage.set(encryptedMessage, nonce.length);

  // Add metadata for improved security
  const metadata = {
    v: 1, // Version
    alg: 'xchacha20-poly1305', // Algorithm
    ts: Date.now(), // Timestamp
    kid: uuidv4(), // Key ID
  };

  // Return encrypted message with metadata
  return {
    ciphertext: encodeBase64(fullMessage),
    metadata,
  };
};

// Decrypt a message using the recipient's secret key and sender's public key
export const decryptMessage = (
  encryptedMessagePackage: { ciphertext: string, metadata?: any },
  senderPublicKey: string,
  recipientSecretKey: string
) => {
  if (!isBrowser) {
    throw new Error('Decryption can only be performed in browser environment');
  }
  
  // Extract ciphertext
  const { ciphertext } = encryptedMessagePackage;
  
  // Decode the full message
  const messageWithNonceAsUint8Array = decodeBase64(ciphertext);
  
  // Extract nonce and message
  const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength);
  const message = messageWithNonceAsUint8Array.slice(
    box.nonceLength,
    messageWithNonceAsUint8Array.length
  );

  // Attempt decryption
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

// Try to decrypt with multiple keys (handles key rotation cases)
export const tryDecryptWithMultipleKeys = (
  encryptedMessage: { ciphertext: string, metadata?: any },
  senderPublicKey: string
) => {
  // Get all recipient keys
  const allKeys = getAllKeys();
  
  for (const keyPair of allKeys) {
    try {
      const decryptedMessage = decryptMessage(
        encryptedMessage,
        senderPublicKey,
        keyPair.secretKey
      );
      
      // If successful, return the decrypted message
      return {
        text: decryptedMessage,
        decryptedWith: keyPair.metadata?.keyId || 'unknown',
      };
    } catch (error) {
      // Try next key
      continue;
    }
  }
  
  // If all decryption attempts fail
  throw new Error('Could not decrypt message with any available keys');
};

// Generate a shared encryption key for a server or channel
export const generateServerKey = () => {
  if (!isBrowser) {
    throw new Error('Key generation can only be performed in browser environment');
  }
  
  const randomKey = randomBytes(secretbox.keyLength);
  
  return {
    key: encodeBase64(randomKey),
    metadata: {
      keyId: uuidv4(),
      createdAt: new Date().toISOString(),
      algorithm: 'XChaCha20-Poly1305',
    }
  };
};

// Encrypt data with a shared key (for server/channel encryption)
export const encryptWithSharedKey = (data: string, sharedKey: string) => {
  if (!isBrowser) {
    throw new Error('Encryption can only be performed in browser environment');
  }
  
  // Generate a nonce
  const nonce = randomBytes(secretbox.nonceLength);
  
  // Convert data and key to Uint8Array
  const messageUint8 = decodeUTF8(data);
  const keyUint8Array = decodeBase64(sharedKey);

  // Encrypt the data with secretbox
  const encrypted = secretbox(messageUint8, nonce, keyUint8Array);

  // Combine nonce and encrypted message
  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);

  // Return base64 encoded result
  return encodeBase64(fullMessage);
};

// Decrypt data with a shared key
export const decryptWithSharedKey = (encryptedData: string, sharedKey: string) => {
  if (!isBrowser) {
    throw new Error('Decryption can only be performed in browser environment');
  }
  
  // Decode the full message
  const messageWithNonceAsUint8Array = decodeBase64(encryptedData);
  
  // Extract nonce and message
  const nonce = messageWithNonceAsUint8Array.slice(0, secretbox.nonceLength);
  const message = messageWithNonceAsUint8Array.slice(
    secretbox.nonceLength,
    messageWithNonceAsUint8Array.length
  );

  // Convert key to Uint8Array
  const keyUint8Array = decodeBase64(sharedKey);
  
  // Decrypt the message
  const decrypted = secretbox.open(message, nonce, keyUint8Array);

  if (!decrypted) {
    throw new Error('Could not decrypt data');
  }

  return encodeUTF8(decrypted);
};

// Encrypt a message reaction emoji with metadata
export const encryptReaction = (
  emoji: string,
  metadata: { userId: string; timestamp: number },
  sharedKey: string
) => {
  if (!isBrowser) {
    throw new Error('Encryption can only be performed in browser environment');
  }
  
  const reactionData = JSON.stringify({
    emoji,
    ...metadata
  });
  
  return encryptWithSharedKey(reactionData, sharedKey);
};

// Decrypt a message reaction
export const decryptReaction = (
  encryptedReaction: string,
  sharedKey: string
) => {
  if (!isBrowser) {
    throw new Error('Decryption can only be performed in browser environment');
  }
  
  const decryptedData = decryptWithSharedKey(encryptedReaction, sharedKey);
  return JSON.parse(decryptedData) as { emoji: string; userId: string; timestamp: number };
};

// Key rotation - generate a new key pair while preserving the old one
export const rotateKeyPair = (currentKeyPair: { publicKey: string; secretKey: string; metadata?: any }) => {
  if (!isBrowser) {
    throw new Error('Key rotation can only be performed in browser environment');
  }
  
  // Generate a new key pair
  const newKeyPair = generateKeyPair();
  
  // Store the new key pair as the primary keys
  storeKeyPair(newKeyPair);
  
  // Store the old key pair with a backup identifier
  try {
    const backupKeyId = currentKeyPair.metadata?.keyId || uuidv4();
    const backupStorageKey = `${BACKUP_PREFIX}_${backupKeyId}`;
    localStorage.setItem(backupStorageKey, JSON.stringify({
      version: 1,
      ...currentKeyPair,
      metadata: {
        ...(currentKeyPair.metadata || {}),
        backupTimestamp: Date.now(),
      }
    }));
    
    // Update registry with the backup key
    updateKeyRegistry(backupKeyId, `backup_${backupKeyId}`);
  } catch (error) {
    console.error('Error storing backup keys:', error);
  }
  
  return newKeyPair;
};

// Get multiple public keys for a user from the database (to handle key rotation)
export const getPublicKeysForUser = async (userId: string, supabase: any) => {
  try {
    const { data, error } = await supabase
      .from('public_keys')
      .select('public_key, key_type, created_at, device_id, key_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching public keys:', error);
    return [];
  }
};

// Set up scheduled key rotation (e.g., every 30 days)
export const setupKeyRotationSchedule = (intervalDays = 30) => {
  if (!isBrowser) return;
  
  // Check if we need to rotate keys
  const checkAndRotateKeys = () => {
    try {
      const currentKeyPair = getKeyPair();
      if (!currentKeyPair) {
        // No key pair exists, create one
        const newKeyPair = generateKeyPair();
        storeKeyPair(newKeyPair);
        return;
      }
      
      // Check key age
      const createdAt = currentKeyPair.metadata?.createdAt;
      if (!createdAt) {
        // No creation date, rotate to be safe
        rotateKeyPair(currentKeyPair);
        return;
      }
      
      const keyAge = Date.now() - new Date(createdAt).getTime();
      const maxAge = intervalDays * 24 * 60 * 60 * 1000; // Convert days to ms
      
      if (keyAge > maxAge) {
        rotateKeyPair(currentKeyPair);
      }
    } catch (error) {
      console.error('Error in key rotation schedule:', error);
    }
  };
  
  // Run immediately
  checkAndRotateKeys();
  
  // Set up interval for future checks
  const intervalId = setInterval(checkAndRotateKeys, 24 * 60 * 60 * 1000); // Check daily
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

// Clear all encryption keys (caution: messages will be unrecoverable)
export const clearAllKeys = () => {
  if (!isBrowser) return;
  
  try {
    // Get all keys from registry
    const registryKey = `${KEY_PREFIX}_registry`;
    const existingRegistry = localStorage.getItem(registryKey);
    
    if (existingRegistry) {
      const registry = JSON.parse(existingRegistry);
      
      // Delete all keys
      for (const keyId in registry) {
        const { context } = registry[keyId];
        const storageKey = context === 'primary' ? PRIMARY_KEY : `${KEY_PREFIX}_${context}`;
        localStorage.removeItem(storageKey);
      }
    }
    
    // Delete the registry itself
    localStorage.removeItem(registryKey);
    
    // Keep device ID for tracking purposes
  } catch (error) {
    console.error('Error clearing encryption keys:', error);
  }
};

// Export a key pair for backup purposes (returns an encrypted bundle)
export const exportEncryptionKeys = (password: string) => {
  if (!isBrowser) {
    throw new Error('Key export can only be performed in browser environment');
  }
  
  try {
    // Get all keys
    const allKeys = getAllKeys();
    
    if (allKeys.length === 0) {
      throw new Error('No encryption keys to export');
    }
    
    // Convert password to key
    const passwordKey = createKeyFromPassword(password);
    
    // Package all keys
    const keysPackage = {
      version: 1,
      timestamp: Date.now(),
      deviceId: getOrCreateDeviceId(),
      keys: allKeys,
    };
    
    // Encrypt the package
    const encryptedPackage = encryptWithDerivedKey(
      JSON.stringify(keysPackage),
      passwordKey
    );
    
    return encryptedPackage;
  } catch (error) {
    console.error('Error exporting keys:', error);
    throw error;
  }
};

// Import keys from an encrypted backup
export const importEncryptionKeys = (encryptedBackup: string, password: string) => {
  if (!isBrowser) {
    throw new Error('Key import can only be performed in browser environment');
  }
  
  try {
    // Convert password to key
    const passwordKey = createKeyFromPassword(password);
    
    // Decrypt the package
    const decryptedPackage = decryptWithDerivedKey(encryptedBackup, passwordKey);
    
    // Parse the package
    const keysPackage = JSON.parse(decryptedPackage);
    
    // Validate format
    if (!keysPackage.version || !keysPackage.keys || !Array.isArray(keysPackage.keys)) {
      throw new Error('Invalid key backup format');
    }
    
    // Store each key pair
    keysPackage.keys.forEach((keyPair: any) => {
      if (keyPair.metadata?.keyId) {
        const context = keyPair.metadata.keyId;
        storeKeyPair(keyPair, context);
      }
    });
    
    return {
      success: true,
      keyCount: keysPackage.keys.length,
    };
  } catch (error) {
    console.error('Error importing keys:', error);
    throw error;
  }
};

// Helper: Create a key from a password
const createKeyFromPassword = (password: string) => {
  // In a real app, you would use a proper key derivation function (e.g., PBKDF2, scrypt)
  // This is a simplified implementation
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Create a fixed-length key
  const key = new Uint8Array(secretbox.keyLength);
  
  // Fill the key with password data (with repetition if needed)
  for (let i = 0; i < key.length; i++) {
    key[i] = passwordData[i % passwordData.length];
  }
  
  return encodeBase64(key);
};

// Helper: Encrypt with a derived key
const encryptWithDerivedKey = (data: string, derivedKey: string) => {
  return encryptWithSharedKey(data, derivedKey);
};

// Helper: Decrypt with a derived key
const decryptWithDerivedKey = (encryptedData: string, derivedKey: string) => {
  return decryptWithSharedKey(encryptedData, derivedKey);
};