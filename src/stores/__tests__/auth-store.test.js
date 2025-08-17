/**
 * Auth store tests: default state, updates, and persistence
 */

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.resetModules()
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
})

