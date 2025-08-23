import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import { useLocaleStore } from '../../stores'
import SetLocale from '../SetLocale'
import PostTitleInput from '../PostTitleInput'
import PostsInfo from '../../Pages/Posts/PostsInfo'
import SearchBoxInput from '../Nav/SearchBoxInput'
import LoginModal from '../LoginModal'

// Mock the stores
vi.mock('../../stores', () => ({
  useLocaleStore: vi.fn(),
  useAuthStore: vi.fn(() => ({ isAuthenticated: false })),
  useLoginModalStore: vi.fn(() => ({ 
    isLoginModalOpen: true,
    setIsLoginModalOpen: vi.fn()
  }))
}))

// Mock useInfinitePosts hook
vi.mock('../../APIs/posts', () => ({
  useInfinitePosts: vi.fn(() => ({
    isSuccess: true,
    data: { pages: [] }
  }))
}))

// Mock useDebounce hook
vi.mock('../../hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => value)
}))

describe('Content Translation Updates', () => {
  let queryClient
  let user

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    user = userEvent.setup()
  })

  const renderWithProviders = (ui, locale = 'en') => {
    useLocaleStore.mockReturnValue(locale)
    
    return render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <SetLocale>
            {ui}
          </SetLocale>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('PostTitleInput Translation Updates', () => {
    it('should update placeholder text when locale changes from English to Chinese', () => {
      const mockForm = { post_title: '' }
      const mockSetForm = vi.fn()
      const mockSetIsValid = vi.fn()

      // First render with English locale
      const { rerender } = renderWithProviders(
        <PostTitleInput 
          form={mockForm} 
          setForm={mockSetForm} 
          isValid={true} 
          setIsValid={mockSetIsValid} 
        />,
        'en'
      )

      expect(screen.getByPlaceholderText('Post Title')).toBeInTheDocument()

      // Re-render with Chinese locale
      useLocaleStore.mockReturnValue('zh-TW')
      rerender(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SetLocale>
              <PostTitleInput 
                form={mockForm} 
                setForm={mockSetForm} 
                isValid={true} 
                setIsValid={mockSetIsValid} 
              />
            </SetLocale>
          </QueryClientProvider>
        </MemoryRouter>
      )

      expect(screen.getByPlaceholderText('文章標題')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Post Title')).not.toBeInTheDocument()
    })

    it('should update placeholder text when locale changes from Chinese to English', () => {
      const mockForm = { post_title: '' }
      const mockSetForm = vi.fn()
      const mockSetIsValid = vi.fn()

      // First render with Chinese locale
      const { rerender } = renderWithProviders(
        <PostTitleInput 
          form={mockForm} 
          setForm={mockSetForm} 
          isValid={true} 
          setIsValid={mockSetIsValid} 
        />,
        'zh-TW'
      )

      expect(screen.getByPlaceholderText('文章標題')).toBeInTheDocument()

      // Re-render with English locale
      useLocaleStore.mockReturnValue('en')
      rerender(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SetLocale>
              <PostTitleInput 
                form={mockForm} 
                setForm={mockSetForm} 
                isValid={true} 
                setIsValid={mockSetIsValid} 
              />
            </SetLocale>
          </QueryClientProvider>
        </MemoryRouter>
      )

      expect(screen.getByPlaceholderText('Post Title')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('文章標題')).not.toBeInTheDocument()
    })
  })

  describe('SearchBoxInput Translation Updates', () => {
    it('should update search placeholder when locale changes from English to Chinese', () => {
      const mockProps = {
        showSearchResultDropdown: false,
        setShowSearchResultDropdown: vi.fn(),
        setShowSearchBoxComponent: vi.fn()
      }

      // First render with English locale
      const { rerender } = renderWithProviders(
        <SearchBoxInput {...mockProps} />,
        'en'
      )

      expect(screen.getByPlaceholderText('Search content & title')).toBeInTheDocument()

      // Re-render with Chinese locale
      useLocaleStore.mockReturnValue('zh-TW')
      rerender(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SetLocale>
              <SearchBoxInput {...mockProps} />
            </SetLocale>
          </QueryClientProvider>
        </MemoryRouter>
      )

      expect(screen.getByPlaceholderText('搜尋文章/標題')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Search content & title')).not.toBeInTheDocument()
    })
  })

  describe('PostsInfo Translation Updates', () => {
    it('should update button text when locale changes from English to Chinese', () => {
      const mockSetSort = vi.fn()
      const mockSort = 'created_at'

      // First render with English locale
      const { rerender } = renderWithProviders(
        <PostsInfo setSort={mockSetSort} sort={mockSort} />,
        'en'
      )

      expect(screen.getByText('Latest Posts')).toBeInTheDocument()
      expect(screen.getByText('Recently Updated')).toBeInTheDocument()

      // Re-render with Chinese locale
      useLocaleStore.mockReturnValue('zh-TW')
      rerender(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SetLocale>
              <PostsInfo setSort={mockSetSort} sort={mockSort} />
            </SetLocale>
          </QueryClientProvider>
        </MemoryRouter>
      )

      expect(screen.getByText('最新文章')).toBeInTheDocument()
      expect(screen.getByText('最近更新')).toBeInTheDocument()
      expect(screen.queryByText('Latest Posts')).not.toBeInTheDocument()
      expect(screen.queryByText('Recently Updated')).not.toBeInTheDocument()
    })

    it('should maintain functionality when locale changes', async () => {
      const mockSetSort = vi.fn()
      const mockSort = 'created_at'

      // First render with Chinese locale
      const { rerender } = renderWithProviders(
        <PostsInfo setSort={mockSetSort} sort={mockSort} />,
        'zh-TW'
      )

      const latestPostsButton = screen.getByText('最新文章')
      await user.click(latestPostsButton)
      expect(mockSetSort).toHaveBeenCalledWith('created_at')

      // Clear mock calls
      mockSetSort.mockClear()

      // Re-render with English locale
      useLocaleStore.mockReturnValue('en')
      rerender(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SetLocale>
              <PostsInfo setSort={mockSetSort} sort={mockSort} />
            </SetLocale>
          </QueryClientProvider>
        </MemoryRouter>
      )

      const latestPostsButtonEn = screen.getByText('Latest Posts')
      await user.click(latestPostsButtonEn)
      expect(mockSetSort).toHaveBeenCalledWith('created_at')
    })
  })

  describe('LoginModal Translation Updates', () => {
    it('should update modal content when locale changes from English to Chinese', () => {
      // First render with English locale
      const { rerender } = renderWithProviders(
        <LoginModal />,
        'en'
      )

      expect(screen.getByText('Oops! You are not the owner')).toBeInTheDocument()
      expect(screen.getByText('Please chant the spell')).toBeInTheDocument()

      // Re-render with Chinese locale
      useLocaleStore.mockReturnValue('zh-TW')
      rerender(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SetLocale>
              <LoginModal />
            </SetLocale>
          </QueryClientProvider>
        </MemoryRouter>
      )

      expect(screen.getByText('哎呀, 您並非擁有者')).toBeInTheDocument()
      expect(screen.getByText('請詠唱擁有者的咒語')).toBeInTheDocument()
      expect(screen.queryByText('Oops! You are not the owner')).not.toBeInTheDocument()
      expect(screen.queryByText('Please chant the spell')).not.toBeInTheDocument()
    })
  })

  describe('SetLocale Component Translation Loading', () => {
    it('should load English messages when locale is set to "en"', () => {
      const TestComponent = () => {
        const { useIntl } = require('react-intl')
        const intl = useIntl()
        return <div>{intl.formatMessage({id: 'nav.login_button'})}</div>
      }

      renderWithProviders(<TestComponent />, 'en')
      expect(screen.getByText('Login')).toBeInTheDocument()
    })

    it('should load Chinese messages when locale is set to "zh-TW"', () => {
      const TestComponent = () => {
        const { useIntl } = require('react-intl')
        const intl = useIntl()
        return <div>{intl.formatMessage({id: 'nav.login_button'})}</div>
      }

      renderWithProviders(<TestComponent />, 'zh-TW')
      expect(screen.getByText('芝麻開門')).toBeInTheDocument()
    })

    it('should handle locale switching without errors', () => {
      const TestComponent = () => {
        const { useIntl } = require('react-intl')
        const intl = useIntl()
        return <div>{intl.formatMessage({id: 'nav.login_button'})}</div>
      }

      // Test that both supported locales work correctly
      renderWithProviders(<TestComponent />, 'en')
      expect(screen.getByText('Login')).toBeInTheDocument()
      
      // Clean up and test Chinese locale
      cleanup()
      renderWithProviders(<TestComponent />, 'zh-TW') 
      expect(screen.getByText('芝麻開門')).toBeInTheDocument()
    })
  })

  describe('Dynamic Content Updates', () => {
    it('should update content immediately when locale store changes', async () => {
      let currentLocale = 'en'
      const mockSetLocale = vi.fn((locale) => {
        currentLocale = locale
      })
      
      // Mock locale store with dynamic return value
      useLocaleStore.mockImplementation(() => currentLocale)

      const TestComponent = () => {
        const { useIntl } = require('react-intl')
        const intl = useIntl()
        return (
          <div>
            <div data-testid="login-text">{intl.formatMessage({id: 'nav.login_button'})}</div>
            <div data-testid="logout-text">{intl.formatMessage({id: 'nav.logout_button'})}</div>
            <button onClick={() => {
              currentLocale = 'zh-TW'
              mockSetLocale('zh-TW')
            }}>Change to Chinese</button>
          </div>
        )
      }

      const { rerender } = renderWithProviders(<TestComponent />)

      // Initial state - English
      expect(screen.getByTestId('login-text')).toHaveTextContent('Login')
      expect(screen.getByTestId('logout-text')).toHaveTextContent('Logout')

      // Simulate locale change
      await user.click(screen.getByText('Change to Chinese'))
      
      // Force re-render with new locale
      useLocaleStore.mockReturnValue('zh-TW')
      rerender(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SetLocale>
              <TestComponent />
            </SetLocale>
          </QueryClientProvider>
        </MemoryRouter>
      )

      // Check updated content
      expect(screen.getByTestId('login-text')).toHaveTextContent('芝麻開門')
      expect(screen.getByTestId('logout-text')).toHaveTextContent('芝麻關門')
    })
  })

  describe('Complex Translation Keys', () => {
    it('should handle parameterized translations correctly', () => {
      const TestComponent = () => {
        const { useIntl } = require('react-intl')
        const intl = useIntl()
        return (
          <div>
            {intl.formatMessage({id: 'article_count'}, {value: 5})}
          </div>
        )
      }

      // Test English parameterized translation
      renderWithProviders(<TestComponent />, 'en')
      expect(screen.getByText('5 articles')).toBeInTheDocument()
    })

    it('should handle parameterized translations in Chinese', () => {
      const TestComponent = () => {
        const { useIntl } = require('react-intl')
        const intl = useIntl()
        return (
          <div>
            {intl.formatMessage({id: 'article_count'}, {value: 3})}
          </div>
        )
      }

      // Test Chinese parameterized translation
      renderWithProviders(<TestComponent />, 'zh-TW')
      expect(screen.getByText('3 篇文章')).toBeInTheDocument()
    })
  })

  describe('Multiple Component Translation Updates', () => {
    it('should update all components simultaneously when locale changes', () => {
      const mockForm = { post_title: '' }
      const mockSetForm = vi.fn()
      const mockSetIsValid = vi.fn()
      const mockSetSort = vi.fn()

      const MultipleComponents = () => (
        <div>
          <PostTitleInput 
            form={mockForm} 
            setForm={mockSetForm} 
            isValid={true} 
            setIsValid={mockSetIsValid} 
          />
          <PostsInfo setSort={mockSetSort} sort="created_at" />
          <LoginModal />
        </div>
      )

      // First render with English locale
      const { rerender } = renderWithProviders(<MultipleComponents />, 'en')

      expect(screen.getByPlaceholderText('Post Title')).toBeInTheDocument()
      expect(screen.getByText('Latest Posts')).toBeInTheDocument()
      expect(screen.getByText('Oops! You are not the owner')).toBeInTheDocument()

      // Re-render with Chinese locale
      useLocaleStore.mockReturnValue('zh-TW')
      rerender(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SetLocale>
              <MultipleComponents />
            </SetLocale>
          </QueryClientProvider>
        </MemoryRouter>
      )

      expect(screen.getByPlaceholderText('文章標題')).toBeInTheDocument()
      expect(screen.getByText('最新文章')).toBeInTheDocument()
      expect(screen.getByText('哎呀, 您並非擁有者')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Post Title')).not.toBeInTheDocument()
      expect(screen.queryByText('Latest Posts')).not.toBeInTheDocument()
      expect(screen.queryByText('Oops! You are not the owner')).not.toBeInTheDocument()
    })
  })
})