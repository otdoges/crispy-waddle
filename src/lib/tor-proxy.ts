import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

// Tor proxy configuration
const TOR_PROXY_HOST = process.env.TOR_PROXY_HOST || '127.0.0.1';
const TOR_PROXY_PORT = process.env.TOR_PROXY_PORT || '9050';
const TOR_SOCKS_PORT = process.env.TOR_SOCKS_PORT || '9051';

// Create Tor SOCKS proxy agent
const torSocksAgent = new SocksProxyAgent(`socks5://${TOR_PROXY_HOST}:${TOR_SOCKS_PORT}`);

// Create Tor HTTP proxy agent
const torHttpAgent = new HttpsProxyAgent(`http://${TOR_PROXY_HOST}:${TOR_PROXY_PORT}`);

// Create a Tor-enabled Supabase client
export const createTorEnabledClient = () => {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        'X-Tor-Enabled': 'true',
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      fetch: (url, options = {}) => {
        // Use Tor proxy for all requests
        return fetch(url, {
          ...options,
          agent: torSocksAgent,
        });
      },
    },
  });
};

// Function to rotate Tor circuit
export const rotateTorCircuit = async () => {
  try {
    const response = await fetch(`http://${TOR_PROXY_HOST}:${TOR_PROXY_PORT}/tor/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'SIGNAL NEWNYM',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to rotate Tor circuit');
    }
    
    return true;
  } catch (error) {
    console.error('Error rotating Tor circuit:', error);
    return false;
  }
};

// Function to check Tor connection status
export const checkTorConnection = async () => {
  try {
    const response = await fetch('https://check.torproject.org/api/ip', {
      agent: torSocksAgent,
    });
    
    const data = await response.json();
    return data.IsTor;
  } catch (error) {
    console.error('Error checking Tor connection:', error);
    return false;
  }
};

// Function to get current Tor exit node
export const getTorExitNode = async () => {
  try {
    const response = await fetch('https://check.torproject.org/api/ip', {
      agent: torSocksAgent,
    });
    
    const data = await response.json();
    return {
      ip: data.IP,
      country: data.Country,
      isTor: data.IsTor,
    };
  } catch (error) {
    console.error('Error getting Tor exit node:', error);
    return null;
  }
};

// Function to create a new Tor circuit with specific exit node
export const createTorCircuitWithExit = async (countryCode: string) => {
  try {
    const response = await fetch(`http://${TOR_PROXY_HOST}:${TOR_PROXY_PORT}/tor/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: `SIGNAL NEWNYM ${countryCode}`,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create Tor circuit with specific exit node');
    }
    
    return true;
  } catch (error) {
    console.error('Error creating Tor circuit with exit:', error);
    return false;
  }
};

// Function to get available Tor exit nodes
export const getAvailableTorExits = async () => {
  try {
    const response = await fetch('https://check.torproject.org/api/exits', {
      agent: torSocksAgent,
    });
    
    const data = await response.json();
    return data.exits;
  } catch (error) {
    console.error('Error getting available Tor exits:', error);
    return [];
  }
};

// Function to create a new Tor circuit with random exit node
export const createRandomTorCircuit = async () => {
  try {
    const exits = await getAvailableTorExits();
    if (exits.length === 0) {
      throw new Error('No Tor exit nodes available');
    }
    
    const randomExit = exits[Math.floor(Math.random() * exits.length)];
    return await createTorCircuitWithExit(randomExit.country);
  } catch (error) {
    console.error('Error creating random Tor circuit:', error);
    return false;
  }
};

// Function to check if a specific IP is a Tor exit node
export const isTorExitNode = async (ip: string) => {
  try {
    const response = await fetch(`https://check.torproject.org/api/ip/${ip}`, {
      agent: torSocksAgent,
    });
    
    const data = await response.json();
    return data.IsTor;
  } catch (error) {
    console.error('Error checking if IP is Tor exit node:', error);
    return false;
  }
};

// Function to get Tor circuit statistics
export const getTorCircuitStats = async () => {
  try {
    const response = await fetch(`http://${TOR_PROXY_HOST}:${TOR_PROXY_PORT}/tor/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'GETINFO circuit-status',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get Tor circuit statistics');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting Tor circuit statistics:', error);
    return null;
  }
};

// Function to create a new Tor circuit with specific bandwidth requirements
export const createTorCircuitWithBandwidth = async (minBandwidth: number) => {
  try {
    const response = await fetch(`http://${TOR_PROXY_HOST}:${TOR_PROXY_PORT}/tor/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: `SIGNAL NEWNYM ${minBandwidth}`,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create Tor circuit with bandwidth requirements');
    }
    
    return true;
  } catch (error) {
    console.error('Error creating Tor circuit with bandwidth:', error);
    return false;
  }
};

// Function to get Tor bandwidth statistics
export const getTorBandwidthStats = async () => {
  try {
    const response = await fetch(`http://${TOR_PROXY_HOST}:${TOR_PROXY_PORT}/tor/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'GETINFO bandwidth',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get Tor bandwidth statistics');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting Tor bandwidth statistics:', error);
    return null;
  }
}; 