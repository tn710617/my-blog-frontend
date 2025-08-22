import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IntlProvider } from 'react-intl'
import { vi } from 'vitest'
import { usePaginationStore, useCategoryStore, usePostTagsStore } from '../../../stores'
import en from '../../../locales/en.json'

// Mock the Posts components and APIs
vi.mock('../../../APIs/posts', () => ({
  useIndexPosts: vi.fn(() => ({
    status: 'success',
    data: {
      data: [
        { id: 1, post_title: 'Test Post 1' },
        { id: 2, post_title: 'Test Post 2' }
      ],
      meta: {
        current_page: 1,
        total: 50,
        last_page: 5
      }
    },
    queryKey: ['posts', 'index']
  }))
}))

vi.mock('../../../APIs/categories', () => ({
  useCategories: vi.fn(() => ({
    status: 'success',
    data: [
      { id: 1, category_name: 'general' },
      { id: 2, category_name: 'technology' }
    ]
  }))
}))

vi.mock('../PopularTags', () => ({
  default: ({ tags, setTags, setCurrentPage }) => (
    <div data-testid="popular-tags">
      <button onClick={() => {
        setTags(['1'])
        setCurrentPage(1)
      }}>
        Add Tag Filter
      </button>
      <span>Tags: {tags.join(',')}</span>
    </div>
  )
}))

vi.mock('../../Components/Pagination', () => ({
  default: ({ currentPage, setCurrentPage, totalPages, totalPosts }) => (
    <div data-testid="pagination">
      <span>Page {currentPage} of {totalPages}</span>
      <span>Total: {totalPosts}</span>
      <button onClick={() => setCurrentPage(currentPage + 1)}>Next Page</button>
      <button onClick={() => setCurrentPage(1)}>Reset to Page 1</button>
    </div>
  )
}))

const createWrapper = (initialRoute = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en" messages={en}>
        <MemoryRouter initialEntries={[initialRoute]}>
          {children}
        </MemoryRouter>
      </IntlProvider>
    </QueryClientProvider>
  )
}

// Simplified Posts component for testing pagination integration
const TestPostsComponent = () => {
  const currentPage = usePaginationStore((state) => state.currentPage)
  const setCurrentPage = usePaginationStore((state) => state.setCurrentPage)
  const categoryId = useCategoryStore((state) => state.categoryId)
  const setCategoryId = useCategoryStore((state) => state.setCategoryId)
  const tags = usePostTagsStore((state) => state.tags)
  const setTags = usePostTagsStore((state) => state.setTags)

  return (
    <div data-testid="posts-component">
      <div data-testid="current-filters">
        <span>Page: {currentPage}</span>
        <span>Category: {categoryId}</span>
        <span>Tags: {tags.join(',')}</span>
      </div>
      
      <div data-testid="filter-controls">
        <button onClick={() => {
          setCategoryId(2)
          setCurrentPage(1) // Reset pagination on filter change
        }}>
          Change Category
        </button>
        
        <button onClick={() => {
          setTags(['1', '2'])
          setCurrentPage(1) // Reset pagination on filter change
        }}>
          Add Multiple Tags
        </button>
        
        <button onClick={() => {
          setTags([])
          setCategoryId(1)
          setCurrentPage(1)
        }}>
          Clear All Filters
        </button>
      </div>

      {/* Mock Pagination Component */}
      <div data-testid="pagination">
        <span>Page {currentPage} of 5</span>
        <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        <button onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
        <button onClick={() => setCurrentPage(1)}>First</button>
        <button onClick={() => setCurrentPage(5)}>Last</button>
      </div>
    </div>
  )
}

describe('Pagination Integration with Filters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset all stores to default state
    usePaginationStore.setState({ currentPage: 1 })
    useCategoryStore.setState({ categoryId: 1 })
    usePostTagsStore.setState({ tags: [] })
  })

  it('resets pagination when category filter changes', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <TestPostsComponent />
      </Wrapper>
    )

    // Navigate to page 3
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    
    await waitFor(() => {
      expect(screen.getByText('Page: 3')).toBeInTheDocument()
    })

    // Change category filter
    fireEvent.click(screen.getByText('Change Category'))
    
    await waitFor(() => {
      expect(screen.getByText('Page: 1')).toBeInTheDocument() // Should reset to page 1
      expect(screen.getByText('Category: 2')).toBeInTheDocument() // Category should change
    })
  })

  it('resets pagination when tag filters change', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <TestPostsComponent />
      </Wrapper>
    )

    // Navigate to page 4
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    
    await waitFor(() => {
      expect(screen.getByText('Page: 4')).toBeInTheDocument()
    })

    // Add tag filters
    fireEvent.click(screen.getByText('Add Multiple Tags'))
    
    await waitFor(() => {
      expect(screen.getByText('Page: 1')).toBeInTheDocument() // Should reset to page 1
      expect(screen.getByText('Tags: 1,2')).toBeInTheDocument() // Tags should be added
    })
  })

  it('maintains pagination state when no filters change', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <TestPostsComponent />
      </Wrapper>
    )

    // Navigate to page 2
    fireEvent.click(screen.getByText('Next'))
    
    await waitFor(() => {
      expect(screen.getByText('Page: 2')).toBeInTheDocument()
    })

    // Navigate to page 3 (no filter change)
    fireEvent.click(screen.getByText('Next'))
    
    await waitFor(() => {
      expect(screen.getByText('Page: 3')).toBeInTheDocument() // Should maintain navigation
    })
  })

  it('handles clearing all filters and resetting pagination', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <TestPostsComponent />
      </Wrapper>
    )

    // Set up some filters and navigate to page 3
    fireEvent.click(screen.getByText('Change Category'))
    fireEvent.click(screen.getByText('Add Multiple Tags'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))

    await waitFor(() => {
      expect(screen.getByText('Page: 3')).toBeInTheDocument()
      expect(screen.getByText('Category: 2')).toBeInTheDocument()
      expect(screen.getByText('Tags: 1,2')).toBeInTheDocument()
    })

    // Clear all filters
    fireEvent.click(screen.getByText('Clear All Filters'))
    
    await waitFor(() => {
      expect(screen.getByText('Page: 1')).toBeInTheDocument() // Reset to page 1
      expect(screen.getByText('Category: 1')).toBeInTheDocument() // Reset category
      expect(screen.getByText('Tags:')).toBeInTheDocument() // Clear tags (empty)
    })
  })

  it('supports pagination navigation in both directions', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <TestPostsComponent />
      </Wrapper>
    )

    // Navigate forward
    fireEvent.click(screen.getByText('Next'))
    await waitFor(() => {
      expect(screen.getByText('Page: 2')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Next'))
    await waitFor(() => {
      expect(screen.getByText('Page: 3')).toBeInTheDocument()
    })

    // Navigate backward
    fireEvent.click(screen.getByText('Previous'))
    await waitFor(() => {
      expect(screen.getByText('Page: 2')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Previous'))
    await waitFor(() => {
      expect(screen.getByText('Page: 1')).toBeInTheDocument()
    })
  })

  it('supports direct navigation to first and last pages', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <TestPostsComponent />
      </Wrapper>
    )

    // Navigate to last page
    fireEvent.click(screen.getByText('Last'))
    await waitFor(() => {
      expect(screen.getByText('Page: 5')).toBeInTheDocument()
    })

    // Navigate to first page
    fireEvent.click(screen.getByText('First'))
    await waitFor(() => {
      expect(screen.getByText('Page: 1')).toBeInTheDocument()
    })
  })

  it('maintains store consistency across multiple operations', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <TestPostsComponent />
      </Wrapper>
    )

    // Perform multiple operations
    fireEvent.click(screen.getByText('Change Category')) // Category: 2, Page: 1
    fireEvent.click(screen.getByText('Next')) // Page: 2
    fireEvent.click(screen.getByText('Add Multiple Tags')) // Tags: [1,2], Page: 1
    fireEvent.click(screen.getByText('Last')) // Page: 5

    await waitFor(() => {
      expect(screen.getByText('Page: 5')).toBeInTheDocument()
      expect(screen.getByText('Category: 2')).toBeInTheDocument()
      expect(screen.getByText('Tags: 1,2')).toBeInTheDocument()
    })

    // Verify store states directly
    expect(usePaginationStore.getState().currentPage).toBe(5)
    expect(useCategoryStore.getState().categoryId).toBe(2)
    expect(usePostTagsStore.getState().tags).toEqual(['1', '2'])
  })

  it('handles concurrent filter and pagination changes', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <TestPostsComponent />
      </Wrapper>
    )

    // Rapid changes in quick succession
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Change Category'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Add Multiple Tags'))
    
    await waitFor(() => {
      // Should end up with: Category changed, Tags added, Page reset to 1 (due to filter changes)
      expect(screen.getByText('Page: 1')).toBeInTheDocument() // Last filter change resets to page 1
      expect(screen.getByText('Category: 2')).toBeInTheDocument()
      expect(screen.getByText('Tags: 1,2')).toBeInTheDocument()
    })
  })

  it('preserves pagination state when filters produce same results', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <TestPostsComponent />
      </Wrapper>
    )

    // Navigate to page 3
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    
    await waitFor(() => {
      expect(screen.getByText('Page: 3')).toBeInTheDocument()
    })

    // In a real scenario, if setting the same filters doesn't change results,
    // pagination might be preserved. Here we test the store behavior
    const currentPage = usePaginationStore.getState().currentPage
    expect(currentPage).toBe(3)
    
    // Manually preserving state (simulating no filter change)
    usePaginationStore.getState().setCurrentPage(currentPage)
    
    await waitFor(() => {
      expect(screen.getByText('Page: 3')).toBeInTheDocument()
    })
  })
})