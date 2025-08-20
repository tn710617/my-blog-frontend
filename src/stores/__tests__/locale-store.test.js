/**
 * Locale store tests: default, initializeFromNavigator, and persistence
 */

describe('useLocaleStore', () => {
  const originalNavigator = global.navigator

  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    // Set a controllable navigator
    Object.defineProperty(global, 'navigator', {
      value: { language: 'zh-TW' },
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        configurable: true,
        writable: true,
      })
    }
  })

  it('defaults to en and initializes from navigator when unset', () => {
    const { useLocaleStore } = require('..')

    // default
    expect(useLocaleStore.getState().locale).toBe('en')

    // initialize from navigator
    useLocaleStore.getState().initializeFromNavigator()
    expect(useLocaleStore.getState().locale).toBe('zh-TW')

    // persisted
    const raw = localStorage.getItem('learn_or_die_locale_storage')
    const parsed = JSON.parse(raw)
    expect(parsed.state.locale).toBe('zh-TW')
    expect(Object.keys(parsed.state)).toEqual(['locale'])
  })

  it('does not override when a locale is already set', () => {
    const { useLocaleStore } = require('..')

    useLocaleStore.getState().setLocale('fr')
    expect(useLocaleStore.getState().locale).toBe('fr')

    useLocaleStore.getState().initializeFromNavigator()
    expect(useLocaleStore.getState().locale).toBe('fr')
  })
})

