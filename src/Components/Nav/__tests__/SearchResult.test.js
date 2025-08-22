import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import SearchResult from '../SearchResult'

// Mock the navigation
const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock CategoryIcon component
vi.mock('../../CategoryIcon', () => ({
  default: ({ category_id }) => (
    <div data-testid="category-icon" data-category-id={category_id}>
      Category {category_id}
    </div>
  )
}))

// Mock remove-markdown
vi.mock('remove-markdown', () => ({
  default: (content) => content.replace(/[#*_]/g, '') // Simple mock removing markdown symbols
}))

const renderWithRouter = (ui) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  )
}

describe('SearchResult Component', () => {
  const mockSetShowSearchBoxComponent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockSearchedPosts = {
    isSuccess: true,
    data: {
      pages: [
        {
          data: [
            {
              id: 1,
              category_id: 2,
              post_title: 'React Testing Best Practices',
              post_content: '# Learn how to test React components effectively\n\nThis guide covers **unit testing** and *integration testing*.'
            },
            {
              id: 2,
              category_id: 1,
              post_title: 'JavaScript Fundamentals',
              post_content: 'Understanding the basics of JavaScript programming language.'
            }
          ]
        },
        {
          data: [
            {
              id: 3,
              category_id: 3,
              post_title: 'Advanced TypeScript',
              post_content: 'Deep dive into TypeScript advanced features and patterns.'
            }
          ]
        }
      ]
    }
  }

  const mockEmptySearchedPosts = {
    isSuccess: false,
    data: {
      pages: []
    }
  }

  it('renders all posts from all pages', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockSearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // Should render all 3 posts from both pages
    expect(screen.getByText('React Testing Best Practices')).toBeInTheDocument()
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument()
    expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument()
  })

  it('renders category icons for each post', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockSearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    const categoryIcons = screen.getAllByTestId('category-icon')
    expect(categoryIcons).toHaveLength(3)
    
    expect(categoryIcons[0]).toHaveAttribute('data-category-id', '2')
    expect(categoryIcons[1]).toHaveAttribute('data-category-id', '1')
    expect(categoryIcons[2]).toHaveAttribute('data-category-id', '3')
  })

  it('strips markdown from post content', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockSearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // Should show content without markdown symbols
    expect(screen.getByText(/Learn how to test React components effectively/)).toBeInTheDocument()
    expect(screen.getByText(/This guide covers unit testing and integration testing/)).toBeInTheDocument()
    
    // Markdown symbols should be removed
    const content = screen.getByText(/Learn how to test React components effectively/).textContent
    expect(content).not.toContain('#')
    expect(content).not.toContain('**')
    expect(content).not.toContain('*')
  })

  it('applies proper styling classes', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockSearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // Check main container
    const container = document.querySelector('.flex.flex-col.gap-2')
    expect(container).toBeInTheDocument()

    // Check post item styling
    const postItems = document.querySelectorAll('.hover\\:bg-gray-100')
    expect(postItems).toHaveLength(3)

    postItems.forEach(item => {
      expect(item.className).toContain('px-1')
      expect(item.className).toContain('group')
      expect(item.className).toContain('rounded')
      expect(item.className).toContain('cursor-pointer')
      expect(item.className).toContain('relative')
    })
  })

  it('applies proper title styling with hover effects', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockSearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    const titleContainers = document.querySelectorAll('.text-lg.text-gray-900.group-hover\\:text-emerald-500')
    expect(titleContainers).toHaveLength(3)

    titleContainers.forEach(container => {
      expect(container.className).toContain('flex')
      expect(container.className).toContain('items-center')
      expect(container.className).toContain('gap-1')
    })
  })

  it('truncates long titles and content', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockSearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // Check title truncation
    const titleElements = document.querySelectorAll('.truncate')
    expect(titleElements.length).toBeGreaterThan(0)

    // Check content truncation
    const contentElements = document.querySelectorAll('.text-sm.text-gray-400.truncate')
    expect(contentElements).toHaveLength(3)
  })

  it('handles post click navigation', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockSearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // Find the clickable overlay for the first post
    const clickableOverlays = document.querySelectorAll('.after\\:absolute.after\\:inset-0')
    expect(clickableOverlays).toHaveLength(3)

    // Click on the first post
    fireEvent.click(clickableOverlays[0])

    expect(mockNavigate).toHaveBeenCalledWith('/single-post?post_id=1')
    expect(mockSetShowSearchBoxComponent).toHaveBeenCalledWith(false)
  })

  it('handles clicks on different posts correctly', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockSearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    const clickableOverlays = document.querySelectorAll('.after\\:absolute.after\\:inset-0')

    // Click on second post
    fireEvent.click(clickableOverlays[1])
    expect(mockNavigate).toHaveBeenCalledWith('/single-post?post_id=2')

    // Click on third post
    fireEvent.click(clickableOverlays[2])
    expect(mockNavigate).toHaveBeenCalledWith('/single-post?post_id=3')

    expect(mockSetShowSearchBoxComponent).toHaveBeenCalledTimes(2)
  })

  it('does not render when search is not successful', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockEmptySearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // Should not render any posts when isSuccess is false
    expect(screen.queryByText('React Testing Best Practices')).not.toBeInTheDocument()
    expect(screen.queryByText('JavaScript Fundamentals')).not.toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    const emptySuccessfulData = {
      isSuccess: true,
      data: {
        pages: [
          {
            data: []
          }
        ]
      }
    }

    renderWithRouter(
      <SearchResult 
        searchedPosts={emptySuccessfulData}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // Should render container but no posts
    const container = document.querySelector('.flex.flex-col.gap-2')
    expect(container).toBeInTheDocument()
    expect(container.children).toHaveLength(0)
  })

  it('preserves post ID in clickable element', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockSearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    const clickableOverlays = document.querySelectorAll('.after\\:absolute.after\\:inset-0')
    
    expect(clickableOverlays[0]).toHaveAttribute('id', '1')
    expect(clickableOverlays[1]).toHaveAttribute('id', '2')
    expect(clickableOverlays[2]).toHaveAttribute('id', '3')
  })

  it('renders posts with unique keys', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockSearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    // React should render all posts without key warnings
    // This is implicit in the successful rendering, but we can verify structure
    const postContainers = document.querySelectorAll('.hover\\:bg-gray-100')
    expect(postContainers).toHaveLength(3)
    
    // Each post should be unique
    const titles = Array.from(postContainers).map(container => 
      container.querySelector('.truncate')?.textContent
    )
    
    expect(titles).toEqual([
      'React Testing Best Practices',
      'JavaScript Fundamentals', 
      'Advanced TypeScript'
    ])
  })

  it('integrates CategoryIcon with correct category IDs', () => {
    renderWithRouter(
      <SearchResult 
        searchedPosts={mockSearchedPosts}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    expect(screen.getByText('Category 2')).toBeInTheDocument() // First post
    expect(screen.getByText('Category 1')).toBeInTheDocument() // Second post  
    expect(screen.getByText('Category 3')).toBeInTheDocument() // Third post
  })

  it('handles single page with single post', () => {
    const singlePostData = {
      isSuccess: true,
      data: {
        pages: [
          {
            data: [
              {
                id: 42,
                category_id: 5,
                post_title: 'Single Result',
                post_content: 'Only one post found'
              }
            ]
          }
        ]
      }
    }

    renderWithRouter(
      <SearchResult 
        searchedPosts={singlePostData}
        setShowSearchBoxComponent={mockSetShowSearchBoxComponent}
      />
    )

    expect(screen.getByText('Single Result')).toBeInTheDocument()
    expect(screen.getByText('Only one post found')).toBeInTheDocument()
    expect(screen.getByText('Category 5')).toBeInTheDocument()

    const clickableOverlay = document.querySelector('.after\\:absolute.after\\:inset-0')
    fireEvent.click(clickableOverlay)
    
    expect(mockNavigate).toHaveBeenCalledWith('/single-post?post_id=42')
  })
})