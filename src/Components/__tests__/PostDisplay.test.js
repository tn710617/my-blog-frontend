import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import PostMetadata from '../PostMetadata'
import PostTags from '../PostTags'
import PostCard from '../../Pages/Posts/PostCard'
import en from '../../locales/en.json'

// Mock the stores
const mockSetCategoryId = vi.fn()
const mockSetSort = vi.fn()

vi.mock('../../stores', () => ({
  useCategoryStore: (selector) => {
    const state = { setCategoryId: mockSetCategoryId }
    return selector(state)
  },
  usePostSortStore: (selector) => {
    const state = { setSort: mockSetSort }
    return selector(state)
  }
}))

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

const renderWithProviders = (ui) => (
  <IntlProvider locale="en" messages={en}>
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  </IntlProvider>
)

describe('Post Display Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PostMetadata', () => {
    const mockPost = {
      id: 1,
      post_title: 'Test Post',
      category_id: 2,
      category: { category_name: 'tech' },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      is_public: true
    }

    it('renders post metadata with dates and category', () => {
      render(renderWithProviders(<PostMetadata postData={mockPost} />))
      
      // Check category name
      expect(screen.getByText('tech')).toBeInTheDocument()
      
      // Check dates (FormattedDate will format them)
      expect(screen.getByText('January 1, 2024')).toBeInTheDocument()
      expect(screen.getByText('January 2, 2024')).toBeInTheDocument()
    })

    it('shows private indicator for non-public posts', () => {
      const privatePost = { ...mockPost, is_public: false }
      
      render(renderWithProviders(<PostMetadata postData={privatePost} />))
      
      // Should show private icon
      const privateIcon = document.querySelector('svg[data-testid="private-icon"], .text-xl')
      expect(privateIcon).toBeTruthy()
    })

    it('does not show private indicator for public posts', () => {
      render(renderWithProviders(<PostMetadata postData={mockPost} />))
      
      // Should not show extra bullet points (only 2 for dates)
      const bullets = screen.getAllByText('•')
      expect(bullets).toHaveLength(2) // Only between category•created•updated
    })

    it('handles category click navigation', () => {
      render(renderWithProviders(<PostMetadata postData={mockPost} />))
      
      const categoryButton = screen.getByText('tech')
      fireEvent.click(categoryButton)
      
      expect(mockSetCategoryId).toHaveBeenCalledWith(2)
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('handles created date click for sorting', () => {
      render(renderWithProviders(<PostMetadata postData={mockPost} />))
      
      const createdButton = screen.getByText('January 1, 2024')
      fireEvent.click(createdButton)
      
      expect(mockSetSort).toHaveBeenCalledWith('created_at')
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('handles updated date click for sorting', () => {
      render(renderWithProviders(<PostMetadata postData={mockPost} />))
      
      const updatedButton = screen.getByText('January 2, 2024')
      fireEvent.click(updatedButton)
      
      expect(mockSetSort).toHaveBeenCalledWith('updated_at')
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('PostTags', () => {
    it('renders empty state when no tags', () => {
      render(renderWithProviders(<PostTags tags={[]} />))
      
      // Should show tags icon but no tag elements
      const tagIcon = document.querySelector('svg')
      expect(tagIcon).toBeTruthy()
      
      // No tag buttons should be present
      const tagButtons = screen.queryAllByRole('button')
      expect(tagButtons).toHaveLength(0)
    })

    it('renders tags with proper styling', () => {
      const tags = [
        { id: 1, tag_name: 'react' },
        { id: 2, tag_name: 'testing' },
        { id: 3, tag_name: 'javascript' }
      ]
      
      render(renderWithProviders(<PostTags tags={tags} />))
      
      // Check all tags are rendered
      expect(screen.getByText('react')).toBeInTheDocument()
      expect(screen.getByText('testing')).toBeInTheDocument()
      expect(screen.getByText('javascript')).toBeInTheDocument()
      
      // Check tag styling classes
      const reactTag = screen.getByText('react')
      expect(reactTag.className).toContain('border-blue-400')
      expect(reactTag.className).toContain('rounded-2xl')
      expect(reactTag.className).toContain('bg-slate-200')
    })

    it('applies hover styles to tags', () => {
      const tags = [{ id: 1, tag_name: 'hover-test' }]
      
      render(renderWithProviders(<PostTags tags={tags} />))
      
      const tag = screen.getByText('hover-test')
      expect(tag.className).toContain('hover:bg-slate-300')
      expect(tag.className).toContain('cursor-pointer')
    })
  })

  describe('PostCard Integration', () => {
    const mockPost = {
      id: 123,
      post_title: 'Integration Test Post',
      post_content: '# This is markdown content\n\nWith **bold** text and more content that should be truncated when displayed in the card preview.',
      category_id: 1,
      category: { category_name: 'general' },
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2024-03-02T00:00:00Z',
      is_public: true,
      tags: [
        { id: 1, tag_name: 'integration' },
        { id: 2, tag_name: 'test' }
      ]
    }

    it('renders complete post card with all components', () => {
      render(renderWithProviders(<PostCard post={mockPost} />))
      
      // Check title
      expect(screen.getByText('Integration Test Post')).toBeInTheDocument()
      
      // Check truncated content (markdown should be stripped)
      expect(screen.getByText(/This is markdown content/)).toBeInTheDocument()
      expect(screen.getByText(/With bold text/)).toBeInTheDocument()
      
      // Check tags
      expect(screen.getByText('integration')).toBeInTheDocument()
      expect(screen.getByText('test')).toBeInTheDocument()
      
      // Check metadata
      expect(screen.getByText('general')).toBeInTheDocument()
      expect(screen.getByText('March 1, 2024')).toBeInTheDocument()
      expect(screen.getByText('March 2, 2024')).toBeInTheDocument()
    })

    it('handles post card click navigation', () => {
      render(renderWithProviders(<PostCard post={mockPost} />))
      
      // Find the clickable overlay (has the post ID)
      const clickableArea = document.querySelector('[id="123"]')
      expect(clickableArea).toBeTruthy()
      
      fireEvent.click(clickableArea)
      
      expect(mockNavigate).toHaveBeenCalledWith('/single-post?post_id=123')
    })

    it('applies hover styles to post card', () => {
      render(renderWithProviders(<PostCard post={mockPost} />))
      
      const title = screen.getByText('Integration Test Post')
      expect(title.className).toContain('group-hover:border-blue-400')
      
      // Check for group hover classes
      const contentElement = screen.getByText(/This is markdown content/)
      expect(contentElement.className).toContain('group-hover:text-gray-500')
    })

    it('truncates long content properly', () => {
      const longPost = {
        ...mockPost,
        post_content: 'This is a very long post content that should definitely be truncated by lodash when displayed in the card because it exceeds the 200 character limit that we have set for the preview text in the post card component. This text should be cut off and show ellipsis.'
      }
      
      render(renderWithProviders(<PostCard post={longPost} />))
      
      // Should show truncated content with ellipsis
      const content = screen.getByText(/This is a very long post content/)
      expect(content.textContent).toContain('...')
      expect(content.textContent.length).toBeLessThan(250) // Should be truncated
    })

    it('handles markdown content stripping', () => {
      const markdownPost = {
        ...mockPost,
        post_content: '# Heading\n\n**Bold text** and *italic text* with `code` and [links](http://example.com)'
      }
      
      render(renderWithProviders(<PostCard post={markdownPost} />))
      
      // Should strip markdown and show plain text
      const content = screen.getByText(/Bold text and italic text/)
      expect(content.textContent).not.toContain('#')
      expect(content.textContent).not.toContain('**')
      expect(content.textContent).not.toContain('*')
      expect(content.textContent).not.toContain('`')
      expect(content.textContent).not.toContain('[')
    })
  })
})