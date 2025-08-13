import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      name: 'learn_or_die_auth_storage',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn }),
    }
  )
)

// 🌍 Locale Store - SSR Safe with Zustand persistence
export const useLocaleStore = create(
  persist(
    (set, get) => ({
      locale: 'en', // Safe default - will be rehydrated from localStorage
      setLocale: (locale) => set({ locale }),
      // Initialize with navigator.language after component mounts (client-side only)
      initializeFromNavigator: () => {
        const currentLocale = get().locale
        // Only set navigator language if no locale is stored (first visit)
        if (currentLocale === 'en' && isClient) {
          const navLang = safeGetNavigatorLanguage()
          set({ locale: navLang })
        }
      },
    }),
    {
      name: 'learn_or_die_locale_storage',
      partialize: (state) => ({ locale: state.locale }),
    }
  )
)

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

// 📝 Post Form Store - SSR Safe with Zustand persistence for CreatePost
export const usePostFormStore = create(
  persist(
    (set, get) => ({
      form: {
        tag_ids: [],
        post_title: '',
        post_content: '',
        category_id: "2",
        is_public: true,
        should_publish_medium: false,
        locale: "zh-TW",
        created_at: ""
      },
      setForm: (form) => set({ form }),
      updateForm: (updates) => set((state) => ({ 
        form: { ...state.form, ...updates } 
      })),
      clearForm: () => set({
        form: {
          tag_ids: [],
          post_title: '',
          post_content: '',
          category_id: "2",
          is_public: true,
          should_publish_medium: false,
          locale: "zh-TW",
          created_at: ""
        }
      }),
    }),
    {
      name: 'learn_or_die_post_form_storage',
      partialize: (state) => ({ form: state.form }),
    }
  )
)

// 🚀 SSR-Safe Initialization Hook
// Call this in your main App component after mounting to properly initialize stores
export const useInitializeStores = () => {
  return () => {
    if (isClient) {
      // Initialize locale from navigator.language if no stored value exists
      // Use getState() to avoid subscribing to store changes
      useLocaleStore.getState().initializeFromNavigator()
    }
  }
}