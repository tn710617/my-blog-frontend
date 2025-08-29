/**
 * Tests for URI helpers in src/helpers.js
 * Note: Authentication localStorage helpers have been migrated to Zustand stores
 */
import { describe, it, expect } from 'vitest'
import { getCurrentUri, getMetamaskDAppDeepLink } from './helpers'

describe('helpers: URI functions', () => {
  const mockLocation = {
    pathname: '/test-path',
    search: '?param=value'
  }

  it('getCurrentUri: constructs full URI from location', () => {
    // Mock environment variables
    const originalEnv = import.meta.env.VITE_DOMAIN
    import.meta.env.VITE_DOMAIN = 'https://example.com'

    const result = getCurrentUri(mockLocation)
    expect(result).toBe('https://example.com/test-path?param=value')

    // Restore
    import.meta.env.VITE_DOMAIN = originalEnv
  })

  it('getMetamaskDAppDeepLink: creates MetaMask deep link', () => {
    // Mock environment variables
    const originalEnv = import.meta.env.VITE_DOMAIN
    import.meta.env.VITE_DOMAIN = 'https://example.com'

    const result = getMetamaskDAppDeepLink(mockLocation)
    expect(result).toBe('https://metamask.app.link/dapp/https://example.com/test-path?param=value')

    // Restore
    import.meta.env.VITE_DOMAIN = originalEnv
  })
})

