# Mobile Wallet Login (WalletConnect / MetaMask) — Step‑by‑Step To‑Do List

> Goal: Keep users in their **original mobile browser** and use a remote wallet connection (WalletConnect or MetaMask SDK) for signing, so session cookies are set in the correct browser context.

---

## 0) Prerequisites

- Frontend: React, TanStack Query, ethers v6, axios, Zustand, react-intl (already present).
- Backend: Existing endpoints  
  - `GET /csrf-cookie` (if using CSRF/session frameworks)  
  - `GET /to-be-signed-message?wallet_address=&locale=` → returns `{ to_be_signed_message: string, nonce: string }`  
  - `POST /login/metamask { address, signature }` → sets session cookie (HttpOnly) in the response.

---

## 1) Decide on Provider Strategy

- **Primary (recommended):** WalletConnect v2 (`@walletconnect/ethereum-provider`) → works with MetaMask + many wallets.
- **Alternative:** MetaMask SDK (Web) remote connection — simpler if you only target MetaMask.

> You can keep your desktop logic (`window.ethereum`) and only change the **mobile path**.

---

## 2) Install Dependencies (WalletConnect path)

```bash
# ethers v6 assumed installed
npm i @walletconnect/ethereum-provider
# (optional) nice modal
npm i @walletconnect/modal
```

- Create a WalletConnect **Project ID** at https://cloud.walletconnect.com (free).

---

## 3) Configure Environment

Add to your env (Vite examples):

```
VITE_WC_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_CHAIN_ID=1          # or your target chain id
VITE_RPC_URL=...         # optional for some flows
```

---

## 4) Frontend: Provider Factory

Create a small helper that returns an `ethers.BrowserProvider` for the current environment.

```ts
// src/wallet/getProvider.ts
import { ethers } from 'ethers'

export async function getEthersProvider() {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent)
  const hasInjected = typeof window !== 'undefined' && (window as any).ethereum

  if (!isMobile && hasInjected) {
    // Desktop: use injected provider (MetaMask extension)
    return new ethers.BrowserProvider((window as any).ethereum)
  }

  // Mobile (or no injected provider): WalletConnect
  const { EthereumProvider } = await import('@walletconnect/ethereum-provider')
  const wc = await EthereumProvider.init({
    projectId: import.meta.env.VITE_WC_PROJECT_ID,
    chains: [Number(import.meta.env.VITE_CHAIN_ID || 1)],
    methods: ['eth_requestAccounts', 'personal_sign', 'eth_signTypedData', 'eth_sign'],
    showQrModal: true, // on mobile this will deep link into wallet apps
    optionalChains: [],
    events: ['chainChanged', 'accountsChanged', 'disconnect'],
    metadata: {
      name: 'My Blog',
      description: 'Login with wallet',
      url: window.location.origin,
      icons: [window.location.origin + '/favicon.ico'],
    },
  })

  await wc.enable()

  // You can listen to lifecycle events to improve UX
  wc.on('accountsChanged', (accounts: string[]) => {
    console.log('WC accountsChanged', accounts)
  })
  wc.on('disconnect', () => {
    console.log('WC disconnect')
  })

  return new ethers.BrowserProvider(wc as any)
}
```

> If you use MetaMask SDK instead: replace the WalletConnect block with the SDK init and return its provider.

---

## 5) Frontend: Refactor `useLoginWithMetaMask`

Replace the “mobile deep-link to MetaMask in-app browser” approach with the provider factory above.

```ts
// src/apis/auth.ts (or your auth hook file)
import { useMutation } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { useIntl } from 'react-intl'
import toast from 'react-hot-toast'
import useAxios from './useAxios'
import { useCsrfToken } from './auth' // your existing hook
import { useAuthStore } from '../stores'
import { getEthersProvider } from '../wallet/getProvider'

export function useLoginWithWallet() {
  const intl = useIntl()
  const axios = useAxios()
  const getCsrfToken = useCsrfToken()
  const setIsLoggedIn = useAuthStore(s => s.setIsLoggedIn)

  return useMutation({
    mutationFn: async () => {
      const provider = await getEthersProvider()
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      // 1) fetch message to sign
      const msgRes = await axios.get('to-be-signed-message', { params: { wallet_address: address, locale: intl.locale } })
      const message: string = msgRes.data.data.to_be_signed_message

      // 2) sign
      const signature = await signer.signMessage(message)

      // 3) (optional) CSRF cookie first (browser context)
      await getCsrfToken.mutateAsync()

      // 4) login
      const res = await axios.post('login/metamask', { signature, address })
      return res.data?.data ?? 'success'
    },
    onSuccess: () => {
      setIsLoggedIn(true)
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(intl.formatMessage({ id: 'toast.login.unauthenticated' }))
    },
  })
}
```

- Update your UI button to call `useLoginWithWallet()` instead of the previous MetaMask-only hook.
- **Remove** the `window.location.replace(getMetamaskDAppDeepLink(...))` path.

---

## 6) Axios / Credentials Setup

- Ensure axios sends cookies:

```ts
// when creating axios instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,
})
```

- Keep your `GET /csrf-cookie` call before any stateful POST (if your backend framework requires it).

---

## 7) Backend: Session & Cookie Settings

Make sure the login response sets a session cookie **in the browser**:

- `Set-Cookie: session=...; Path=/; HttpOnly; Secure; SameSite=None; Domain=.yourdomain.com`
- If you’re using subdomains, use a top-level domain: `.example.com`.

### If your backend is Laravel (Sanctum / Session) – checklist

- `.env`
  - `SESSION_DOMAIN=.yourdomain.com`
  - `SESSION_SECURE_COOKIE=true`
  - `SESSION_SAME_SITE=none`
  - `SANCTUM_STATEFUL_DOMAINS=yourdomain.com,sub.yourdomain.com`
- CORS
  - `Access-Control-Allow-Credentials: true`
  - `Access-Control-Allow-Origin: https://yourdomain.com` (no `*` when credentials=true)
  - Allow required headers & methods.
- CSRF cookie route (`/csrf-cookie`) must be accessible from the browser origin.

---

## 8) Backend: Message & Signature Security

- `to-be-signed-message` should include:
  - A **nonce** (random, single-use).
  - The **address** being authenticated.
  - **Expiry** timestamp (e.g., valid for 5 minutes).
  - Optional: domain (EIP-4361 “Sign-In with Ethereum” style) and user agent/IP binding if desired.

- Store the nonce server-side (e.g., DB or cache) with short TTL and mark as consumed after successful login.

- In `POST /login/metamask`:
  1. Recover signer from `{ address, signature }` and the original message.
  2. Verify recovered address equals `address` and nonce is valid & unconsumed.
  3. Create server session; set cookie in response.
  4. Invalidate the nonce.

---

## 9) WalletConnect Lifecycle Management

- Persist the WC session (the provider does this; you can also store flags in localStorage).
- On app load:
  - Attempt to rehydrate WalletConnect session so users stay connected.
  - Provide a “Disconnect wallet” button:
    ```ts
    await wcProvider.disconnect() // also clear any local flags
    ```
- Listen for:
  - `accountsChanged` → update UI / sign out if empty.
  - `disconnect` → clean local state, prompt re-connect.

---

## 10) Error Handling Matrix (Frontend)

- No wallet app installed → WalletConnect modal suggests stores; surface help text.
- User rejects connection or signature → show toast, keep UI actionable.
- Network/chain mismatch → optionally prompt switch chain or show informative error.
- CSRF request fails → retry or show troubleshooting.
- Login API fails → invalidate nonce on server, refetch a new message.

---

## 11) QA Checklist

- [ ] Desktop (MetaMask extension): login success, cookie present, refresh persists.
- [ ] Mobile Safari/Chrome with MetaMask app installed: WalletConnect deep link opens MetaMask → sign → returns → site shows logged-in, cookie set.
- [ ] Reject connection → graceful failure.
- [ ] Reject signature → graceful failure.
- [ ] Nonce reuse attempt → server rejects.
- [ ] Cookie attributes correct (`HttpOnly; Secure; SameSite=None; Domain=...`).
- [ ] CORS with credentials works across environments (dev/stage/prod).
- [ ] Reconnect after page refresh works (WalletConnect session restore).
- [ ] Disconnect clears state and requires re-auth.

---

## 12) Optional: MetaMask SDK Path (instead of WalletConnect)

- Install: `npm i @metamask/sdk`
- Init MetaMask SDK with dapp metadata; it will handle deep linking on mobile.
- Replace the provider factory’s WalletConnect block with MetaMask SDK provider creation.
- Trade-offs:
  - **Pros:** Tight MetaMask integration.
  - **Cons:** Wallet choice limited to MetaMask.

---

## 13) Rollout Plan

1. Ship behind a feature flag (Desktop unaffected).
2. Internal test on iOS Safari & Android Chrome.
3. Stage env with real domain + HTTPS + proper cookie & CORS config.
4. Monitor:
   - Login success/abort rates.
   - Reconnect rates.
   - Errors from `/login/metamask`.

---

## 14) Notes You Can Remove After Migration

- Do **not** redirect the whole page into MetaMask in-app browser for login — it isolates cookies.
- Keep all HTTP requests in the **original browser** context.
- WalletConnect/MetaMask SDK is only for signing & account access.

---

### Minimal Diff Guide (for your repo)

- [ ] Add `src/wallet/getProvider.ts` (see §4).
- [ ] Replace `useLoginWithMetaMask()` → `useLoginWithWallet()` using the new provider.
- [ ] Delete/disable `getMetamaskDAppDeepLink(...)` redirect on mobile.
- [ ] Verify axios `withCredentials: true`.
- [ ] Backend cookie attributes & CORS as in §7.

---

**Done.** Once these steps are followed, mobile login will complete **in the original browser** with the correct session cookie.
