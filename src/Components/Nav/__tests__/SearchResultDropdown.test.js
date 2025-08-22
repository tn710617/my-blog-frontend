import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import SearchResultDropdown from '../SearchResultDropdown'
import en from '../../../locales/en.json'

// Mock the SearchResult component
vi.mock('../SearchResult', () => ({
  default: ({ searchedPosts, setShowSearchBoxComponent }) => (
    <div data-testid="search-result">
      <div data-testid="posts-count">{searchedPosts.data.pages[0].data.length}</div>
      <button onClick={() => setShowSearchBoxComponent(false)}>Close Search</button>
    </div>
  )
}))

// Mock the NoSearchResult component
vi.mock('../NoSearchResult', () => ({
  default: ({ searchTerm }) => (
    <div data-testid="no-search-result">
      No results for: {searchTerm}
    </div>
  )
}))

// Mock the LoadMorePageComponent
vi.mock('../../LoadMorePageComponent', () => ({
  default: ({ pagination, loadMoreText, lastPageText, loadingText }) => (
    <div data-testid="load-more-component">
      <div data-testid="load-more-text">{loadMoreText}</div>
      <div data-testid="last-page-text">{lastPageText}</div>
      <div data-testid="loading-text">{loadingText}</div>
    </div>
  )
}))

const renderWithProviders = (ui) => {
  return render(
    <IntlProvider locale="en" messages={en}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </IntlProvider>
  )
}

describe('SearchResultDropdown Component', () => {
  const mockSetShowSearchBoxComponent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockSearchedPostsWithResults = {
    data: {
      pages: [
        {
          data: [
            {
              id: 1,
              post_title: 'React Testing Guide',
              post_content: 'Learn how to test React components',
              category_id: 1
            },
            {
              id: 2,
              post_title: 'JavaScript Basics',
              post_content: 'Understanding JavaScript fundamentals',
              category_id: 2
            }
          ]
        }
      ]
    },
    isSuccess: true
  }

  const mockSearchedPostsEmpty = {
    data: {
      pages: [
        {
          data: []
        }
      ]
    },
    isSuccess: true
  }

  it('renders container with proper styling', () => {
    renderWithProviders(
      <SearchResultDropdown 
        searchTerm="react"
        searchedPosts={mockSearchedPostsWithResults}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    const container = document.querySelector('.max-h-\\[80vh\\]')
    expect(container).toBeInTheDocument()
    expect(container.className).toContain('overflow-y-auto')
  })

  it('renders divider line', () => {
    renderWithProviders(
      <SearchResultDropdown 
        searchTerm="react"
        searchedPosts={mockSearchedPostsWithResults}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    const divider = document.querySelector('hr')
    expect(divider).toBeInTheDocument()
    expect(divider.className).toContain('mt-1')
    expect(divider.className).toContain('mb-1')
  })

  it('shows SearchResult component when posts are found', () => {
    renderWithProviders(
      <SearchResultDropdown 
        searchTerm="react"
        searchedPosts={mockSearchedPostsWithResults}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    expect(screen.getByTestId('search-result')).toBeInTheDocument()
    expect(screen.getByTestId('posts-count')).toHaveTextContent('2')
    expect(screen.queryByTestId('no-search-result')).not.toBeInTheDocument()
  })

  it('shows NoSearchResult component when no posts are found', () => {
    renderWithProviders(
      <SearchResultDropdown 
        searchTerm="nonexistent"
        searchedPosts={mockSearchedPostsEmpty}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    expect(screen.getByTestId('no-search-result')).toBeInTheDocument()
    expect(screen.getByText('No results for: nonexistent')).toBeInTheDocument()
    expect(screen.queryByTestId('search-result')).not.toBeInTheDocument()
  })

  it('renders LoadMorePageComponent when posts are found', () => {
    renderWithProviders(
      <SearchResultDropdown 
        searchTerm="react"
        searchedPosts={mockSearchedPostsWithResults}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    expect(screen.getByTestId('load-more-component')).toBeInTheDocument()
    
    // Check that proper internationalized texts are passed
    expect(screen.getByTestId('load-more-text')).toHaveTextContent('Load More')
    expect(screen.getByTestId('last-page-text')).toHaveTextContent('No more articles')
    expect(screen.getByTestId('loading-text')).toHaveTextContent('Loading...')
  })

  it('does not render LoadMorePageComponent when no posts are found', () => {
    renderWithProviders(
      <SearchResultDropdown 
        searchTerm="nonexistent"
        searchedPosts={mockSearchedPostsEmpty}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    expect(screen.queryByTestId('load-more-component')).not.toBeInTheDocument()
  })

  it('passes correct props to SearchResult component', () => {
    renderWithProviders(
      <SearchResultDropdown 
        searchTerm="react"
        searchedPosts={mockSearchedPostsWithResults}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // Verify SearchResult component receives proper props by testing interaction
    const closeButton = screen.getByText('Close Search')
    fireEvent.click(closeButton)
    
    expect(mockSetShowSearchBoxComponent).toHaveBeenCalledWith(false)
  })

  it('handles edge case with single post', () => {
    const singlePostData = {
      data: {
        pages: [
          {
            data: [
              {
                id: 1,
                post_title: 'Single Post',
                post_content: 'Only one result',
                category_id: 1
              }
            ]
          }
        ]
      },
      isSuccess: true
    }

    renderWithProviders(
      <SearchResultDropdown 
        searchTerm="single"
        searchedPosts={singlePostData}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    expect(screen.getByTestId('search-result')).toBeInTheDocument()
    expect(screen.getByTestId('posts-count')).toHaveTextContent('1')
    expect(screen.getByTestId('load-more-component')).toBeInTheDocument()
  })

  it('applies proper CSS classes for layout', () => {
    renderWithProviders(
      <SearchResultDropdown 
        searchTerm="react"
        searchedPosts={mockSearchedPostsWithResults}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // Check results container styling
    const resultsContainer = screen.getByTestId('search-result').parentElement
    expect(resultsContainer.className).toContain('mt-2')

    // Check load more container styling
    const loadMoreContainer = screen.getByTestId('load-more-component').parentElement
    expect(loadMoreContainer.className).toContain('mt-2')
    expect(loadMoreContainer.className).toContain('text-center')
  })

  it('handles multiple pages of search results', () => {
    const multiPageData = {
      data: {
        pages: [
          {
            data: [
              { id: 1, post_title: 'Post 1', post_content: 'Content 1', category_id: 1 },
              { id: 2, post_title: 'Post 2', post_content: 'Content 2', category_id: 2 }
            ]
          },
          {
            data: [
              { id: 3, post_title: 'Post 3', post_content: 'Content 3', category_id: 1 }
            ]
          }
        ]
      },
      isSuccess: true
    }

    renderWithProviders(
      <SearchResultDropdown 
        searchTerm="post"
        searchedPosts={multiPageData}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // Should show results from first page (component checks first page for hasPosts logic)
    expect(screen.getByTestId('search-result')).toBeInTheDocument()
    expect(screen.getByTestId('posts-count')).toHaveTextContent('2')
    expect(screen.getByTestId('load-more-component')).toBeInTheDocument()
  })

  it('integrates with internationalization correctly', () => {
    renderWithProviders(
      <SearchResultDropdown 
        searchTerm="react"
        searchedPosts={mockSearchedPostsWithResults}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // Verify that intl.formatMessage is used for LoadMorePageComponent
    // The mock should receive the translated texts from en.json
    expect(screen.getByTestId('load-more-text')).toBeInTheDocument()
    expect(screen.getByTestId('last-page-text')).toBeInTheDocument()
    expect(screen.getByTestId('loading-text')).toBeInTheDocument()
  })
})