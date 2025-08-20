/**
 * Tests for SSR-safe helpers in src/helpers.js
 * Covers server (no window/localStorage) and browser behavior
 */
import { vi, describe, it, expect, afterEach } from 'vitest'

describe('helpers: localStorage SSR-safety and behavior', () => {
  const originalWindow = global.window
  const originalLocalStorage = global.localStorage

  afterEach(() => {
    // Restore environment to JSDOM defaults after each test
    if (originalWindow) global.window = originalWindow
    if (originalLocalStorage) global.localStorage = originalLocalStorage
    vi.resetModules()
  })

  it('SSR: functions are no-ops and safe without window/localStorage', () => {
    // Simulate server environment
    // Ensure these are not defined before importing the module
    // so module-level isClient uses SSR defaults
    // eslint-disable-next-line no-undef
    delete global.window
    // eslint-disable-next-line no-undef
    delete global.localStorage
    vi.resetModules()

    const helpers = require('./helpers')

    expect(helpers.isLoggedInInLocalStorage()).toBe(false)
    expect(() => helpers.loginInLocalStorage()).not.toThrow()
    expect(() => helpers.logoutInLocalStorage()).not.toThrow()
  })

  it('Browser: login/logout toggles the stored flag', () => {
    // Ensure JSDOM localStorage is clean and window exists
    expect(typeof window).toBe('object')
    localStorage.clear()
    vi.resetModules()

    const helpers = require('./helpers')

    // default
    expect(helpers.isLoggedInInLocalStorage()).toBe(false)

    // login
    helpers.loginInLocalStorage()
    expect(!!localStorage.getItem('learn_or_die_is_logged_in')).toBe(true)
    expect(helpers.isLoggedInInLocalStorage()).toBe(true)

    // logout
    helpers.logoutInLocalStorage()
    expect(localStorage.getItem('learn_or_die_is_logged_in')).toBeNull()
    expect(helpers.isLoggedInInLocalStorage()).toBe(false)
  })
})

