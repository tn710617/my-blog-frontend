/**
 * 🛡️ SSR SAFETY VERIFICATION
 * 
 * Tests that stores can be imported safely on the server-side without crashes
 */

describe('🛡️ SSR Safety', () => {
  const originalWindow = global.window
  const originalNavigator = global.navigator
  const originalLocalStorage = global.localStorage

  beforeEach(() => {
    // Simulate server environment
    delete global.window
    delete global.navigator  
    delete global.localStorage
  })

  afterEach(() => {
    // Restore browser environment
    global.window = originalWindow
    global.navigator = originalNavigator
    global.localStorage = originalLocalStorage
  })

  it('should import stores safely on server-side without crashes', () => {
    // This should not throw any errors
    expect(() => {
      require('../index')
    }).not.toThrow()
  })

  it('should import helpers safely on server-side without crashes', () => {
    // This should not throw any errors
    expect(() => {
      require('../../helpers')
    }).not.toThrow()
  })

  it('should have safe default values in server environment', () => {
    // Re-import after simulating server environment
    jest.resetModules()
    const { useAuthStore, useLocaleStore } = require('../index')
    
    // Auth store should have safe default
    expect(useAuthStore.getState().isLoggedIn).toBe(false)
    
    // Locale store should have safe default
    expect(useLocaleStore.getState().locale).toBe('en')
  })

  it('should handle helper functions safely in server environment', () => {
    jest.resetModules()
    const helpers = require('../../helpers')
    
    // Should not crash and return safe defaults
    expect(helpers.isLoggedInInLocalStorage()).toBe(false)
    
    // Should not crash when called
    expect(() => helpers.loginInLocalStorage()).not.toThrow()
    expect(() => helpers.logoutInLocalStorage()).not.toThrow()
  })
})

/**
 * 🎯 WHAT THIS VERIFIES:
 * 
 * ✅ No crashes when importing stores on server
 * ✅ No crashes when importing helpers on server  
 * ✅ Safe default values in server environment
 * ✅ Helper functions don't crash when localStorage/navigator are undefined
 * ✅ Modules can be safely imported in SSR context
 * 
 * This ensures the app won't crash during Server-Side Rendering! 🚀
 */