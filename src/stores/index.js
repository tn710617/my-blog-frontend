import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getLocaleFromLocalStorage, setLocaleInLocalStorage, isLoggedInInLocalStorage } from '../helpers'

// Auth Store
export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: isLoggedInInLocalStorage(),
      setIsLoggedIn: (value) => set({ isLoggedIn: value }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn }),
    }
  )
)

// Locale Store 
export const useLocaleStore = create((set) => ({
  locale: getLocaleFromLocalStorage() || navigator.language,
  setLocale: (locale) => {
    setLocaleInLocalStorage(locale)
    set({ locale })
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