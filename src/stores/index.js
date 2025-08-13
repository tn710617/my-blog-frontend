import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getLocaleFromLocalStorage, setLocaleInLocalStorage } from '../helpers'

// 🛡️ SSR-Safe Helpers
const isClient = typeof window !== 'undefined'
const safeGetNavigatorLanguage = () => {
  if (!isClient || !navigator?.language) {
    return 'en' // Safe default for SSR
  }
  return navigator.language
}

// 🔐 Auth Store - SSR Safe
export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false, // Safe default - will be rehydrated from localStorage
      setIsLoggedIn: (value) => set({ isLoggedIn: value }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn }),
    }
  )
)

// 🌍 Locale Store - SSR Safe with lazy navigator.language
export const useLocaleStore = create((set) => ({
  locale: getLocaleFromLocalStorage() || 'en', // Safe default - navigator.language will be set after hydration
  setLocale: (locale) => {
    setLocaleInLocalStorage(locale)
    set({ locale })
  },
  // Initialize with navigator.language after component mounts (client-side only)
  initializeFromNavigator: () => {
    const stored = getLocaleFromLocalStorage()
    if (!stored && isClient) {
      const navLang = safeGetNavigatorLanguage()
      setLocaleInLocalStorage(navLang)
      set({ locale: navLang })
    }
  },
}))

// Category Store
export const useCategoryStore = create((set) => ({
  categoryId: 1,
  setCategoryId: (categoryId) => set({ categoryId }),
}))

// Pagination Store
export const usePaginationStore = create((set) => ({
  currentPage: 1,
  setCurrentPage: (currentPage) => set({ currentPage }),
}))

// Post Sort Store
export const usePostSortStore = create((set) => ({
  sort: 'created_at',
  setSort: (sort) => set({ sort }),
}))

// Post Tags Store
export const usePostTagsStore = create((set) => ({
  tags: [],
  setTags: (tags) => set({ tags }),
}))

// UI Modal Stores
export const useLoginModalStore = create((set) => ({
  showLoginModal: false,
  setShowLoginModal: (show) => set({ showLoginModal: show }),
}))

export const useMetaMaskModalStore = create((set) => ({
  showMetaMaskModal: true,
  setShowMetaMaskModal: (show) => set({ showMetaMaskModal: show }),
}))

// 🚀 SSR-Safe Initialization Hook
// Call this in your main App component after mounting to properly initialize stores
export const useInitializeStores = () => {
  const initializeFromNavigator = useLocaleStore((state) => state.initializeFromNavigator)
  
  return () => {
    if (isClient) {
      // Initialize locale from navigator.language if no stored value exists
      initializeFromNavigator()
    }
  }
}