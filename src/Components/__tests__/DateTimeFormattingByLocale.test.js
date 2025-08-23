import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { useLocaleStore } from '../../stores'
import SetLocale from '../SetLocale'
import PostMetadata from '../PostMetadata'
import MonthlyPostHistory from '../../Pages/About/MonthlyPostHistory'
import YearlyPostHistory from '../../Pages/About/YearlyPostHistory'
import Footer from '../Footer/index'

// Mock the stores
vi.mock('../../stores', () => ({
  useLocaleStore: vi.fn(),
  useCategoryStore: vi.fn(() => ({ setCategoryId: vi.fn() })),
  usePostSortStore: vi.fn(() => ({ setSort: vi.fn() }))
}))

// Mock react-router hooks
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

describe('Date/Time Formatting by Locale', () => {
  let queryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
  })

  afterEach(() => {
    cleanup()
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

  describe('PostMetadata Date Formatting', () => {
    const mockPostData = {
      id: 1,
      title: "Test Post",
      content: "Test content",
      created_at: "2024-03-15T10:30:00Z",
      updated_at: "2024-08-20T14:45:00Z",
      is_public: true,
      category_id: 1,
      category: {
        id: 1,
        category_name: "technology"
      }
    }

    it('should format dates in English locale with full month names', () => {
      renderWithProviders(
        <PostMetadata postData={mockPostData} />,
        'en'
      )

      expect(screen.getByText(/March 15, 2024/)).toBeInTheDocument()
      expect(screen.getByText(/August 20, 2024/)).toBeInTheDocument()
    })

    it('should format dates in Chinese locale with Chinese format', () => {
      renderWithProviders(
        <PostMetadata postData={mockPostData} />,
        'zh-TW'
      )

      expect(screen.getByText(/2024年3月15日/)).toBeInTheDocument()
      expect(screen.getByText(/2024年8月20日/)).toBeInTheDocument()
    })

    it('should maintain date formatting consistency', () => {
      renderWithProviders(
        <PostMetadata postData={mockPostData} />,
        'en'
      )

      const createdDate = screen.getByText(/March 15, 2024/)
      const updatedDate = screen.getByText(/August 20, 2024/)
      
      expect(createdDate).toBeInTheDocument()
      expect(updatedDate).toBeInTheDocument()
    })

    it('should handle different dates correctly', () => {
      const differentDatePost = {
        ...mockPostData,
        created_at: "2023-12-01T09:00:00Z",
        updated_at: "2024-01-15T16:30:00Z"
      }

      renderWithProviders(
        <PostMetadata postData={differentDatePost} />,
        'en'
      )

      expect(screen.getByText(/December 1, 2023/)).toBeInTheDocument()
      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument()
    })

    it('should handle different date formats consistently', () => {
      const uniqueDatePost = {
        ...mockPostData,
        created_at: "2024-05-10T12:00:00Z",
        updated_at: "2024-07-25T18:30:00Z"
      }

      renderWithProviders(
        <PostMetadata postData={uniqueDatePost} />,
        'en'
      )

      expect(screen.getByText(/May 10, 2024/)).toBeInTheDocument()
      expect(screen.getByText(/July 25, 2024/)).toBeInTheDocument()
    })
  })

  describe('MonthlyPostHistory Month Name Formatting', () => {
    const mockMonthObj = {
      month_name: "Jan",
      article_count: 5,
      posts: {}
    }

    it('should display month names in English', () => {
      renderWithProviders(
        <MonthlyPostHistory monthNumeric="01" monthObj={mockMonthObj} />,
        'en'
      )

      expect(screen.getByText(/Jan/)).toBeInTheDocument()
      expect(screen.getByText(/5 articles/)).toBeInTheDocument()
    })

    it('should display month names in Chinese', () => {
      renderWithProviders(
        <MonthlyPostHistory monthNumeric="01" monthObj={mockMonthObj} />,
        'zh-TW'
      )

      expect(screen.getByText(/一月/)).toBeInTheDocument()
      expect(screen.getByText(/5 篇文章/)).toBeInTheDocument()
    })

    it('should handle different months correctly', () => {
      const julyMonthObj = {
        month_name: "Jul",
        article_count: 3,
        posts: {}
      }

      renderWithProviders(
        <MonthlyPostHistory monthNumeric="07" monthObj={julyMonthObj} />,
        'en'
      )

      expect(screen.getByText(/Jul/)).toBeInTheDocument()
      expect(screen.getByText(/3 articles/)).toBeInTheDocument()
    })
  })

  describe('YearlyPostHistory Article Count Formatting', () => {
    const mockYearObj = {
      article_count: 12,
      months: {}
    }

    it('should format article count in English', () => {
      renderWithProviders(
        <YearlyPostHistory year="2024" yearObj={mockYearObj} />,
        'en'
      )

      expect(screen.getByText(/2024/)).toBeInTheDocument()
      expect(screen.getByText(/12 articles/)).toBeInTheDocument()
    })

    it('should format article count in Chinese', () => {
      renderWithProviders(
        <YearlyPostHistory year="2024" yearObj={mockYearObj} />,
        'zh-TW'
      )

      expect(screen.getByText(/2024/)).toBeInTheDocument()
      expect(screen.getByText(/12 篇文章/)).toBeInTheDocument()
    })
  })

  describe('Footer Copyright Year Formatting', () => {
    it('should display current year in footer copyright', () => {
      const currentYear = new Date().getFullYear()
      
      renderWithProviders(<Footer />, 'en')
      
      expect(screen.getByText(`© Copyright 2016-${currentYear}. All Rights Reserved.`)).toBeInTheDocument()
    })

    it('should maintain year format regardless of locale', () => {
      const currentYear = new Date().getFullYear()
      
      renderWithProviders(<Footer />, 'zh-TW')
      
      expect(screen.getByText(`© Copyright 2016-${currentYear}. All Rights Reserved.`)).toBeInTheDocument()
    })
  })

  describe('FormattedDate Integration', () => {
    const mockPostData = {
      id: 1,
      title: "Test Post",
      content: "Test content", 
      created_at: "2024-03-15T10:30:00Z",
      updated_at: "2024-08-20T14:45:00Z",
      is_public: true,
      category_id: 1,
      category: { id: 1, category_name: "technology" }
    }

    it('should use FormattedDate options correctly for full month names', () => {
      renderWithProviders(
        <PostMetadata postData={mockPostData} />,
        'en'
      )

      expect(screen.getByText(/March 15, 2024/)).toBeInTheDocument()
      expect(screen.queryByText(/Mar 15, 2024/)).not.toBeInTheDocument()
    })

    it('should handle timezone differences correctly', () => {
      const utcDatePost = {
        ...mockPostData,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-12-31T23:59:59Z"
      }

      renderWithProviders(
        <PostMetadata postData={utcDatePost} />,
        'en'
      )

      expect(screen.getByText(/January/)).toBeInTheDocument()
      expect(screen.getByText(/December/)).toBeInTheDocument()
    })
  })

  describe('Locale Switching Integration', () => {
    const mockPostData = {
      id: 1,
      title: "Test Post",
      content: "Test content",
      created_at: "2024-06-15T10:00:00Z",
      updated_at: "2024-06-16T14:00:00Z",
      is_public: true,
      category_id: 1,
      category: { id: 1, category_name: "technology" }
    }

    it('should change date format when locale changes from English to Chinese', () => {
      const { rerender } = renderWithProviders(
        <PostMetadata postData={mockPostData} />,
        'en'
      )

      expect(screen.getByText(/June 15, 2024/)).toBeInTheDocument()

      useLocaleStore.mockReturnValue('zh-TW')
      rerender(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SetLocale>
              <PostMetadata postData={mockPostData} />
            </SetLocale>
          </QueryClientProvider>
        </MemoryRouter>
      )

      expect(screen.queryByText(/June 15, 2024/)).not.toBeInTheDocument()
      expect(screen.getByText(/2024年6月15日/)).toBeInTheDocument()
    })

    it('should change month names when locale changes', () => {
      const mockMonthObj = { month_name: "Feb", article_count: 8, posts: {} }

      const { rerender } = renderWithProviders(
        <MonthlyPostHistory monthNumeric="02" monthObj={mockMonthObj} />,
        'en'
      )

      expect(screen.getByText(/Feb/)).toBeInTheDocument()
      expect(screen.getByText(/8 articles/)).toBeInTheDocument()

      useLocaleStore.mockReturnValue('zh-TW')
      rerender(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SetLocale>
              <MonthlyPostHistory monthNumeric="02" monthObj={mockMonthObj} />
            </SetLocale>
          </QueryClientProvider>
        </MemoryRouter>
      )

      expect(screen.getByText(/二月/)).toBeInTheDocument()
      expect(screen.getByText(/8 篇文章/)).toBeInTheDocument()
    })
  })
})