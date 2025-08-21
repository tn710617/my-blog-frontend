/**
 * Auth store tests: default state, updates, and persistence
 */

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
  })

  it('has a safe default and updates isLoggedIn', () => {
    const { useAuthStore } = require('..')

    expect(useAuthStore.getState().isLoggedIn).toBe(false)

    useAuthStore.getState().setIsLoggedIn(true)

    expect(useAuthStore.getState().isLoggedIn).toBe(true)
  })

  it('persists only isLoggedIn via partialize', () => {
    const { useAuthStore } = require('..')

    useAuthStore.getState().setIsLoggedIn(true)

    const raw = localStorage.getItem('learn_or_die_auth_storage')
    expect(raw).toBeTruthy()

    const parsed = JSON.parse(raw)
    expect(parsed.state).toBeDefined()
    expect(parsed.state.isLoggedIn).toBe(true)
    // No other keys should be present beyond isLoggedIn in persisted state
    expect(Object.keys(parsed.state)).toEqual(['isLoggedIn'])
  })

  it('restores auth state from localStorage on initialization', () => {
    // Pre-populate localStorage with auth state
    const authState = {
      state: { isLoggedIn: true },
      version: 0
    }
    localStorage.setItem('learn_or_die_auth_storage', JSON.stringify(authState))

    // Clear module cache to force re-initialization
    vi.resetModules()
    
    // Import fresh store instance
    const { useAuthStore } = require('..')

    // Store should initialize with persisted state
    expect(useAuthStore.getState().isLoggedIn).toBe(true)
  })
})

