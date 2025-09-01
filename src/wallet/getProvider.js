import { ethers } from 'ethers';

const isMobileUA = () => {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android/i.test(navigator.userAgent);
};

export async function getEthersProvider() {
  const hasInjected = typeof window !== 'undefined' && window.ethereum;
  const isMobile = isMobileUA();

  if (!isMobile && hasInjected) {
    // Desktop: use MetaMask (or another injected) provider
    return new ethers.BrowserProvider(window.ethereum);
  }

  // Mobile (or no injected provider): WalletConnect
  const projectId = import.meta?.env?.VITE_WC_PROJECT_ID || process.env.VITE_WC_PROJECT_ID;
  const chainIdEnv = import.meta?.env?.VITE_CHAIN_ID || process.env.VITE_CHAIN_ID || '1';
  const chainId = Number(chainIdEnv);

  if (!projectId) {
    throw new Error('Missing VITE_WC_PROJECT_ID for WalletConnect.');
  }

  // Lazy import to avoid bundling if not used
  const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
  const { WalletConnectModal } = await import('@walletconnect/modal');

  const wc = await EthereumProvider.init({
    projectId,
    chains: [chainId],
    methods: ['eth_requestAccounts', 'personal_sign', 'eth_signTypedData', 'eth_sign'],
    showQrModal: false, // we control the modal explicitly below
    events: ['chainChanged', 'accountsChanged', 'disconnect'],
    metadata: {
      name: 'My Blog',
      description: 'Login with wallet',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://example.com',
      icons: typeof window !== 'undefined' ? [window.location.origin + '/favicon.ico'] : [],
    },
  });

  // Initialize WalletConnect Modal for better mobile UX
  const modal = new WalletConnectModal({
    projectId,
    themeMode: 'dark',
  });

  // Open the modal when a URI is available
  wc.on('display_uri', (uri) => {
    try { modal.openModal({ uri }); } catch {}
  });

  try {
    // Create a fresh pairing (prompts wallet selection / deep-link)
    await wc.connect();
  } finally {
    try { modal.closeModal(); } catch {}
  }

  // Optional listeners for debugging
  try {
    wc.on?.('accountsChanged', (accounts) => console.log('WC accountsChanged', accounts));
    wc.on?.('disconnect', () => console.log('WC disconnect'));
  } catch {}

  // Expose for optional disconnect/switch flows
  try { window.__wcProvider = wc; } catch {}

  // Wrap WalletConnect provider with ethers BrowserProvider
  return new ethers.BrowserProvider(wc);
}

// Optionally disconnect existing WalletConnect session to force a fresh account choice
export async function disconnectWalletSession() {
  try {
    const wc = typeof window !== 'undefined' ? window.__wcProvider : null;
    if (wc && typeof wc.disconnect === 'function') {
      await wc.disconnect();
      window.__wcProvider = null;
      // continue to clear any persisted storage below
    }
  } catch (e) {
    console.warn('Failed to disconnect WalletConnect session', e);
  }
  // Hard clear WalletConnect persisted sessions so next connect always prompts
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(window.localStorage);
      keys.forEach((k) => {
        if (k.startsWith('wc@2:') || k.startsWith('walletconnect')) {
          window.localStorage.removeItem(k);
        }
      });
    }
  } catch (e) {
    console.warn('Failed to clear WalletConnect storage', e);
  }
  return true;
}
