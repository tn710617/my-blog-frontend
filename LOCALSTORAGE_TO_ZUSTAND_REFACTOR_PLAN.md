# LocalStorage to Zustand Persist Migration Plan

## Executive Summary

This document outlines a plan to refactor localStorage helper methods in `helpers.js` to use Zustand's built-in persist functionality. The goal is to consolidate state management and eliminate direct localStorage manipulations throughout the codebase.

## Current State Analysis

### Helper Methods in `src/helpers.js`

**Authentication-related localStorage methods:**
- `isLoggedInInLocalStorage()` - Checks if user is logged in
- `loginInLocalStorage()` - Sets logged in state to localStorage 
- `logoutInLocalStorage()` - Removes logged in state from localStorage

**URI-related helper methods (no localStorage):**
- `getCurrentUri()` - Gets current URI from location
- `getMetamaskDAppDeepLink()` - Generates MetaMask deep link

### Current Usage Locations

**Authentication methods are used in:**
1. `src/Components/ProtectedRoute.jsx` - All three methods
2. `src/Components/CheckLogin.jsx` - Only `isLoggedInInLocalStorage`
3. `src/APIs/useAxios.js` - Only `logoutInLocalStorage`
4. `src/APIs/auth.js` - `loginInLocalStorage`, `logoutInLocalStorage`, `getMetamaskDAppDeepLink`

### Existing Zustand Store State

The `useAuthStore` already exists with persist configuration:
```javascript
export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      setIsLoggedIn: (value) => set({ isLoggedIn: value }),
    }),
    {
      name: 'learn_or_die_auth_storage',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn }),
    }
  )
)
```

**Key Issue Identified:** There's a **naming conflict**:
- Helper method uses localStorage key: `'learn_or_die_is_logged_in'`
- Zustand store uses localStorage key: `'learn_or_die_auth_storage'`

## Migration Strategy

### Phase 1: Consolidate Authentication State (CRITICAL)

**Problem:** The application currently has **dual authentication state tracking**:
1. Manual localStorage via helpers: `'learn_or_die_is_logged_in'` (string 'true')
2. Zustand persist: `'learn_or_die_auth_storage'` (JSON object)

This creates potential inconsistencies where the two systems can become out of sync.

**Solution:** Migrate all authentication state to use only the Zustand store.

### Phase 2: Update All Usage Locations

Replace helper method calls with Zustand store operations:

1. **ProtectedRoute.jsx**
   - Replace `isLoggedInInLocalStorage()` → `useAuthStore.getState().isLoggedIn`
   - Remove `loginInLocalStorage()` and `logoutInLocalStorage()` calls (Zustand persists automatically)

2. **CheckLogin.jsx**  
   - Replace `isLoggedInInLocalStorage()` → `useAuthStore.getState().isLoggedIn`

3. **useAxios.js**
   - Remove `logoutInLocalStorage()` call (handled by `setIsLoggedIn(false)`)

4. **auth.js**
   - Remove `loginInLocalStorage()` and `logoutInLocalStorage()` calls (handled by store)

### Phase 3: Clean Up

1. Remove authentication helper methods from `helpers.js`
2. Keep URI-related helpers (not localStorage related)
3. Update imports across all files
4. Run full test suite to ensure no regression

## Implementation Details

### Step 1: Address Storage Key Conflict

**Current State:**
- Helper: `localStorage.setItem('learn_or_die_is_logged_in', 'true')`
- Zustand: `localStorage.setItem('learn_or_die_auth_storage', '{"state":{"isLoggedIn":true},"version":0}')`

**Decision:** Skip migration entirely. Switch directly to Zustand persist (`'learn_or_die_auth_storage'`). Users will be logged out once and need to re-login naturally. This keeps the code clean without temporary migration logic.

### Step 2: Migration Code Pattern

Replace this pattern:
```javascript
// OLD
import { isLoggedInInLocalStorage, loginInLocalStorage, logoutInLocalStorage } from '../helpers'
if (isLoggedInInLocalStorage()) { /* logic */ }
loginInLocalStorage()
logoutInLocalStorage()
```

With this pattern:
```javascript
// NEW  
import { useAuthStore } from '../stores'
if (useAuthStore.getState().isLoggedIn) { /* logic */ }
useAuthStore.getState().setIsLoggedIn(true)  // Persists automatically
useAuthStore.getState().setIsLoggedIn(false) // Persists automatically
```

### Step 3: Component-Specific Changes

**ProtectedRoute.jsx:**
```javascript
// Current
const [isLoading, setIsLoading] = useState(true)
if (!isLoggedInInLocalStorage()) {
  navigate(redirectPath, {state: {from: location}, replace: true});
  setShowLoginModal(true)
}

// After refactor
const [isLoading, setIsLoading] = useState(true)
const isLoggedInLocally = useAuthStore.getState().isLoggedIn
if (!isLoggedInLocally) {
  navigate(redirectPath, {state: {from: location}, replace: true});
  setShowLoginModal(true)
}
```

**CheckLogin.jsx:**
```javascript
// Current
useIsLoggedIn({enabled: isLoggedInInLocalStorage()});

// After refactor  
const isLoggedInLocally = useAuthStore.getState().isLoggedIn
useIsLoggedIn({enabled: isLoggedInLocally});
```

## Benefits of This Refactor

1. **Single Source of Truth**: All authentication state managed through Zustand
2. **Automatic Persistence**: No manual localStorage calls needed
3. **Better SSR Support**: Zustand persist handles SSR safely
4. **Simplified State Management**: Consistent API across the application
5. **Reduced Code Duplication**: Eliminate manual localStorage helpers
6. **Better Testing**: Zustand stores are easier to test than localStorage interactions

## Risks and Considerations

1. **Storage Migration**: Users might have old `'learn_or_die_is_logged_in'` values that need handling
2. **Timing Issues**: Need to ensure Zustand hydration completes before checking auth state
3. **Testing**: Need comprehensive testing to ensure no authentication flows break

## Migration Steps (Recommended Order)

1. **Test Current State**: Run full test suite to establish baseline ✅
2. ~~**Create Migration Utility**: Handle existing `'learn_or_die_is_logged_in'` localStorage values~~ **SKIPPED - Clean approach chosen**
3. **Update ProtectedRoute**: Most critical component for auth flow
4. **Update CheckLogin**: Simple read-only usage
5. **Update useAxios**: HTTP interceptor logout logic  
6. **Update auth.js**: Login/logout mutation callbacks
7. **Remove Helper Methods**: Clean up `helpers.js`
8. **Update Tests**: Ensure all tests pass
9. **Manual Testing**: Verify login/logout flows work correctly

## Files to Modify

### Primary Changes:
- `src/helpers.js` - Remove auth localStorage methods
- `src/Components/ProtectedRoute.jsx` - Replace all helper calls
- `src/Components/CheckLogin.jsx` - Replace helper call
- `src/APIs/useAxios.js` - Replace helper call
- `src/APIs/auth.js` - Replace helper calls

### Secondary Changes:
- All test files that import or mock the helper methods
- Update any component imports that reference the removed helpers

## Success Criteria

- [ ] All authentication state managed through Zustand store
- [ ] No direct localStorage.getItem/setItem calls for authentication
- [ ] All existing functionality preserved (login, logout, protected routes)
- [ ] Full test suite passes
- [ ] No console errors or warnings
- [ ] Authentication state persists correctly across browser sessions
- [ ] SSR compatibility maintained

## Timeline Estimate

- **Phase 1** (State Analysis & Planning): ✅ Complete
- **Phase 2** (Implementation): 2-3 hours
- **Phase 3** (Testing & Cleanup): 1-2 hours

**Total Estimated Time:** 3-5 hours

This refactor will significantly improve the maintainability and consistency of authentication state management in the application.