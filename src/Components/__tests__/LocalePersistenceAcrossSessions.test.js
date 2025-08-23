import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

/**
 * Test locale persistence across browser sessions
 * This tests the key behaviors that would happen when:
 * 1. User visits the site (session 1)
 * 2. Changes locale 
 * 3. Closes browser
 * 4. Returns later (session 2) 
 * 5. Locale should be preserved
 */

describe('Locale Persistence Across Sessions', () => {
  const originalWindow = global.window
  const originalNavigator = global.navigator

  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    
    // Set up clean environment
    Object.defineProperty(global, 'navigator', {
      value: { language: 'en' },
      configurable: true,
      writable: true,
    })
    Object.defineProperty(global, 'window', {
      value: { localStorage: global.localStorage },
      configurable: true,
      writable: true,
    })
    
    // Clear module cache to get fresh store instances
    delete require.cache[require.resolve('../../stores')]
  })

  afterEach(() => {
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        configurable: true,
        writable: true,
      })
    }
    if (originalWindow) {
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        configurable: true,
        writable: true,
      })
    }
  })

  describe('Cross-Session Persistence', () => {
    it('should persist locale from session 1 to session 2', () => {
      // SESSION 1: User visits and changes locale
      const { useLocaleStore } = require('../../stores')
      
      // Initially defaults to 'en'
      expect(useLocaleStore.getState().locale).toBe('en')
      
      // User changes to Chinese
      act(() => {
        useLocaleStore.getState().setLocale('zh-TW')
      })
      
      expect(useLocaleStore.getState().locale).toBe('zh-TW')
      
      // Verify persistence to localStorage (simulating browser close)
      const stored = localStorage.getItem('learn_or_die_locale_storage')
      expect(stored).toBeTruthy()
      const parsedData = JSON.parse(stored)
      expect(parsedData.state.locale).toBe('zh-TW')
      
      // SESSION 2: User returns (simulate new browser session)
      vi.resetModules()
      delete require.cache[require.resolve('../../stores')]
      
      // Fresh store instance should restore from localStorage
      const { useLocaleStore: freshStore } = require('../../stores')
      
      // Should restore Chinese locale from previous session
      expect(freshStore.getState().locale).toBe('zh-TW')
    })

    it('should persist multiple locale changes across sessions', () => {
      // SESSION 1: Start with English, switch to Chinese
      const { useLocaleStore: store1 } = require('../../stores')
      
      act(() => {
        store1.getState().setLocale('zh-TW')
      })
      expect(store1.getState().locale).toBe('zh-TW')
      
      // Simulate session end
      vi.resetModules()
      delete require.cache[require.resolve('../../stores')]
      
      // SESSION 2: Should restore Chinese, then switch back to English
      const { useLocaleStore: store2 } = require('../../stores')
      expect(store2.getState().locale).toBe('zh-TW')
      
      act(() => {
        store2.getState().setLocale('en')
      })
      expect(store2.getState().locale).toBe('en')
      
      // Simulate another session end
      vi.resetModules()
      delete require.cache[require.resolve('../../stores')]
      
      // SESSION 3: Should restore English
      const { useLocaleStore: store3 } = require('../../stores')
      expect(store3.getState().locale).toBe('en')
    })

    it('should handle corrupted session data by falling back to default', () => {
      // Simulate corrupted localStorage from previous session
      localStorage.setItem('learn_or_die_locale_storage', 'invalid-json')
      
      // New session should handle corruption gracefully
      const { useLocaleStore } = require('../../stores')
      
      // Should fall back to default locale
      expect(useLocaleStore.getState().locale).toBe('en')
      
      // Should still be functional
      act(() => {
        useLocaleStore.getState().setLocale('zh-TW')
      })
      expect(useLocaleStore.getState().locale).toBe('zh-TW')
    })

    it('should maintain session data integrity across rapid changes', () => {
      const { useLocaleStore } = require('../../stores')
      
      // Rapid locale changes within same session
      const locales = ['zh-TW', 'en', 'zh-TW', 'en', 'zh-TW']
      
      locales.forEach(locale => {
        act(() => {
          useLocaleStore.getState().setLocale(locale)
        })
        expect(useLocaleStore.getState().locale).toBe(locale)
        
        // Verify each change is persisted
        const stored = JSON.parse(localStorage.getItem('learn_or_die_locale_storage'))
        expect(stored.state.locale).toBe(locale)
      })
      
      // Simulate session end and restart
      vi.resetModules()
      delete require.cache[require.resolve('../../stores')]
      
      // Should restore final locale
      const { useLocaleStore: freshStore } = require('../../stores')
      expect(freshStore.getState().locale).toBe('zh-TW')
    })
  })

  describe('localStorage Integration', () => {
    it('should use correct localStorage key for session persistence', () => {
      const { useLocaleStore } = require('../../stores')
      
      act(() => {
        useLocaleStore.getState().setLocale('zh-TW')
      })
      
      // Verify correct key is used
      expect(localStorage.getItem('learn_or_die_locale_storage')).toBeTruthy()
      expect(localStorage.getItem('wrong_key')).toBeNull()
    })

    it('should only persist locale data without exposing functions', () => {
      const { useLocaleStore } = require('../../stores')
      
      act(() => {
        useLocaleStore.getState().setLocale('zh-TW')
      })
      
      const stored = JSON.parse(localStorage.getItem('learn_or_die_locale_storage'))
      
      // Should only contain locale state, not functions
      expect(Object.keys(stored.state)).toEqual(['locale'])
      expect(stored.state.setLocale).toBeUndefined()
      expect(stored.state.initializeFromNavigator).toBeUndefined()
    })

    it('should handle missing localStorage gracefully', () => {
      // Simulate environment without localStorage
      const mockGetItem = vi.fn(() => null)
      const mockSetItem = vi.fn()
      
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: mockSetItem,
        },
        configurable: true,
      })
      
      const { useLocaleStore } = require('../../stores')
      
      // Should work even if localStorage is unavailable
      expect(() => {
        useLocaleStore.getState().setLocale('zh-TW')
      }).not.toThrow()
    })
  })

  describe('Session Recovery Scenarios', () => {
    it('should recover from localStorage with invalid version', () => {
      // Simulate old version format
      localStorage.setItem('learn_or_die_locale_storage', JSON.stringify({
        state: { locale: 'zh-TW' }
        // Missing version
      }))
      
      const { useLocaleStore } = require('../../stores')
      
      // Should still restore locale
      expect(useLocaleStore.getState().locale).toBe('zh-TW')
    })

    it('should handle partial data corruption', () => {
      // Simulate partially corrupted data
      localStorage.setItem('learn_or_die_locale_storage', JSON.stringify({
        state: { locale: 'zh-TW', corrupted: 'data' },
        version: 0
      }))
      
      const { useLocaleStore } = require('../../stores')
      
      // Should restore valid locale data
      expect(useLocaleStore.getState().locale).toBe('zh-TW')
    })
  })

  describe('Navigator Integration with Sessions', () => {
    it('should not override persisted locale with navigator language on session restore', () => {
      // SESSION 1: Set specific locale
      const { useLocaleStore: store1 } = require('../../stores')
      
      act(() => {
        store1.getState().setLocale('zh-TW')
      })
      
      // SESSION 2: Different navigator language
      vi.resetModules()
      delete require.cache[require.resolve('../../stores')]
      
      Object.defineProperty(global, 'navigator', {
        value: { language: 'fr' },
        configurable: true,
        writable: true,
      })
      
      const { useLocaleStore: store2 } = require('../../stores')
      
      // Should preserve stored locale, not use navigator language
      expect(store2.getState().locale).toBe('zh-TW')
      
      // Even after initialization
      act(() => {
        store2.getState().initializeFromNavigator()
      })
      
      expect(store2.getState().locale).toBe('zh-TW')
    })

  })
})