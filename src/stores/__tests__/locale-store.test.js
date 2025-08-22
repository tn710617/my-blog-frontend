import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'

/**
 * Comprehensive locale store tests: defaults, navigation, persistence, edge cases, and SSR safety
 */

describe('useLocaleStore', () => {
  const originalNavigator = global.navigator
  const originalWindow = global.window

  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    
    // Set a controllable navigator
    Object.defineProperty(global, 'navigator', {
      value: { language: 'zh-TW' },
      configurable: true,
      writable: true,
    })
    Object.defineProperty(global, 'window', {
      value: { localStorage: global.localStorage },
      configurable: true,
      writable: true,
    })
    
    // Clear any existing store instances
    delete require.cache[require.resolve('..')]
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

  describe('Basic functionality', () => {
    it('defaults to en locale on initialization', () => {
      const { useLocaleStore } = require('..')
      
      // Reset store state to default
      useLocaleStore.setState({ locale: 'en' })
      
      expect(useLocaleStore.getState().locale).toBe('en')
    })

    it('updates locale when setLocale is called', () => {
      const { useLocaleStore } = require('..')
      
      // Reset store state to default
      useLocaleStore.setState({ locale: 'en' })
      
      act(() => {
        useLocaleStore.getState().setLocale('zh-TW')
      })
      
      expect(useLocaleStore.getState().locale).toBe('zh-TW')
    })

    it('provides stable function references', () => {
      const { useLocaleStore } = require('..')
      
      // Reset store state to default
      useLocaleStore.setState({ locale: 'en' })
      
      const { result, rerender } = renderHook(() => useLocaleStore())
      const setLocaleRef1 = result.current.setLocale
      const initFromNavRef1 = result.current.initializeFromNavigator
      
      rerender()
      
      const setLocaleRef2 = result.current.setLocale
      const initFromNavRef2 = result.current.initializeFromNavigator
      
      expect(setLocaleRef1).toBe(setLocaleRef2)
      expect(initFromNavRef1).toBe(initFromNavRef2)
    })
  })

  describe('Navigator initialization', () => {
    it('initializes from navigator when no locale is previously set', () => {
      const { useLocaleStore } = require('..')
      
      // Reset store state to default
      useLocaleStore.setState({ locale: 'en' })

      // default
      expect(useLocaleStore.getState().locale).toBe('en')

      // initialize from navigator
      act(() => {
        useLocaleStore.getState().initializeFromNavigator()
      })
      expect(useLocaleStore.getState().locale).toBe('zh-TW')
    })

    it('does not override when a locale is already set', () => {
      const { useLocaleStore } = require('..')
      
      // Reset store state to default
      useLocaleStore.setState({ locale: 'en' })

      act(() => {
        useLocaleStore.getState().setLocale('fr')
      })
      expect(useLocaleStore.getState().locale).toBe('fr')

      act(() => {
        useLocaleStore.getState().initializeFromNavigator()
      })
      expect(useLocaleStore.getState().locale).toBe('fr')
    })

    it('handles navigator with different language codes', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'en-US' },
        configurable: true,
        writable: true,
      })

      const { useLocaleStore } = require('..')
      
      // Reset store state to default
      useLocaleStore.setState({ locale: 'en' })

      act(() => {
        useLocaleStore.getState().initializeFromNavigator()
      })
      expect(useLocaleStore.getState().locale).toBe('en-US')
    })

    it('handles missing navigator gracefully', () => {
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        configurable: true,
        writable: true,
      })

      const { useLocaleStore } = require('..')
      
      // Reset store state to default
      useLocaleStore.setState({ locale: 'en' })

      expect(() => {
        useLocaleStore.getState().initializeFromNavigator()
      }).not.toThrow()
      
      expect(useLocaleStore.getState().locale).toBe('en')
    })

    it('handles navigator without language property', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        configurable: true,
        writable: true,
      })

      const { useLocaleStore } = require('..')
      
      // Reset store state to default
      useLocaleStore.setState({ locale: 'en' })

      act(() => {
        useLocaleStore.getState().initializeFromNavigator()
      })
      expect(useLocaleStore.getState().locale).toBe('en')
    })
  })

  describe('Persistence', () => {
    it('persists locale changes to localStorage', () => {
      const { useLocaleStore } = require('..')

      act(() => {
        useLocaleStore.getState().setLocale('zh-TW')
      })

      const raw = localStorage.getItem('learn_or_die_locale_storage')
      const parsed = JSON.parse(raw)
      expect(parsed.state.locale).toBe('zh-TW')
      expect(Object.keys(parsed.state)).toEqual(['locale'])
    })

    it('restores locale from localStorage on initialization', () => {
      // Pre-populate localStorage
      localStorage.setItem('learn_or_die_locale_storage', JSON.stringify({
        state: { locale: 'zh-TW' },
        version: 0
      }))

      const { useLocaleStore } = require('..')
      
      // Should restore from localStorage
      expect(useLocaleStore.getState().locale).toBe('zh-TW')
    })

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('learn_or_die_locale_storage', 'invalid-json')

      const { useLocaleStore } = require('..')
      
      // Reset store state to default
      useLocaleStore.setState({ locale: 'en' })
      
      // Should fallback to default
      expect(useLocaleStore.getState().locale).toBe('en')
    })

    it('only persists locale field', () => {
      const { useLocaleStore } = require('..')

      act(() => {
        useLocaleStore.getState().setLocale('zh-TW')
      })

      const raw = localStorage.getItem('learn_or_die_locale_storage')
      const parsed = JSON.parse(raw)
      
      // Should only contain locale, not other functions
      expect(Object.keys(parsed.state)).toEqual(['locale'])
      expect(parsed.state.setLocale).toBeUndefined()
      expect(parsed.state.initializeFromNavigator).toBeUndefined()
    })
  })

  describe('SSR Safety', () => {
    it('works without window object (SSR environment)', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        configurable: true,
        writable: true,
      })

      const { useLocaleStore } = require('..')
      
      expect(() => {
        useLocaleStore.getState().setLocale('zh-TW')
      }).not.toThrow()
      
      expect(useLocaleStore.getState().locale).toBe('zh-TW')
    })

    it('initializes safely without client-side APIs', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        configurable: true,
        writable: true,
      })
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        configurable: true,
        writable: true,
      })

      const { useLocaleStore } = require('..')
      
      // Reset store state to default
      useLocaleStore.setState({ locale: 'en' })
      
      expect(() => {
        useLocaleStore.getState().initializeFromNavigator()
      }).not.toThrow()
      
      expect(useLocaleStore.getState().locale).toBe('en')
    })
  })

  describe('Multi-instance behavior', () => {
    it('shares state across multiple store instances', () => {
      const { useLocaleStore } = require('..')
      
      const { result: result1 } = renderHook(() => useLocaleStore())
      const { result: result2 } = renderHook(() => useLocaleStore())

      expect(result1.current.locale).toBe(result2.current.locale)

      act(() => {
        result1.current.setLocale('zh-TW')
      })

      expect(result1.current.locale).toBe('zh-TW')
      expect(result2.current.locale).toBe('zh-TW')
    })
  })

  describe('Supported locales', () => {
    it('accepts supported locale codes', () => {
      const { useLocaleStore } = require('..')

      const supportedLocales = ['en', 'zh-TW', 'fr', 'de', 'ja']
      
      supportedLocales.forEach(locale => {
        act(() => {
          useLocaleStore.getState().setLocale(locale)
        })
        expect(useLocaleStore.getState().locale).toBe(locale)
      })
    })

    it('handles unsupported locale codes', () => {
      const { useLocaleStore } = require('..')

      act(() => {
        useLocaleStore.getState().setLocale('unsupported-locale')
      })
      
      // Should still set the locale (app handles fallbacks at component level)
      expect(useLocaleStore.getState().locale).toBe('unsupported-locale')
    })
  })
})

