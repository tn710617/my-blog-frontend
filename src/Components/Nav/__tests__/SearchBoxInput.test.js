import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IntlProvider } from 'react-intl'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import SearchBoxInput from '../SearchBoxInput'
import en from '../../../locales/en.json'

// Mock the useDebounce hook to return value immediately for testing
vi.mock('../../../hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => value)
}))

// Mock the infinite posts API
const mockUseInfinitePosts = vi.fn(() => ({
  data: {
    pages: [{
      data: [
        { id: 1, post_title: 'React Testing', post_content: 'Test content', category_id: 1 },
        { id: 2, post_title: 'JavaScript Guide', post_content: 'JS content', category_id: 2 }
      ]
    }]
  },
  isSuccess: true,
  isLoading: false,
  error: null
}))

vi.mock('../../../APIs/posts', () => ({
  useInfinitePosts: (...args) => mockUseInfinitePosts(...args)
}))

// Mock SearchResultDropdown
vi.mock('../SearchResultDropdown', () => ({
  default: ({ searchTerm, searchedPosts }) => (
    <div data-testid="search-dropdown">
      Results for: {searchTerm} ({searchedPosts?.data?.pages?.[0]?.data?.length || 0} found)
    </div>
  )
}))

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({ 
    defaultOptions: { 
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return render(
    <IntlProvider locale="en" messages={en}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    </IntlProvider>
  )
}

describe('SearchBoxInput Core Functionality', () => {
  const mockSetShowSearchResultDropdown = vi.fn()
  const mockSetShowSearchBoxComponent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    showSearchResultDropdown: false,
    setShowSearchResultDropdown: mockSetShowSearchResultDropdown,
    setShowSearchBoxComponent: mockSetShowSearchBoxComponent
  }

  it('renders search input with correct placeholder', () => {
    renderWithProviders(<SearchBoxInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Search content & title')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('focuses input on mount', () => {
    renderWithProviders(<SearchBoxInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    expect(document.activeElement).toBe(input)
  })

  it('updates search term on user input', () => {
    renderWithProviders(<SearchBoxInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test search' } })
    
    expect(input.value).toBe('test search')
  })

  it('shows dropdown when search term is entered', () => {
    renderWithProviders(<SearchBoxInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'react' } })
    
    expect(mockSetShowSearchResultDropdown).toHaveBeenCalledWith(true)
  })

  it('hides dropdown when search term is cleared', () => {
    renderWithProviders(<SearchBoxInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    
    // Type something first
    fireEvent.change(input, { target: { value: 'react' } })
    // Then clear it
    fireEvent.change(input, { target: { value: '' } })
    
    expect(mockSetShowSearchResultDropdown).toHaveBeenCalledWith(false)
  })

  it('calls API with correct parameters when search term exists', () => {
    renderWithProviders(<SearchBoxInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'testing' } })
    
    expect(mockUseInfinitePosts).toHaveBeenCalledWith(
      { enabled: true },
      null,
      [],
      null,
      'testing'
    )
  })

  it('disables API call when search term is empty', () => {
    renderWithProviders(<SearchBoxInput {...defaultProps} />)
    
    expect(mockUseInfinitePosts).toHaveBeenCalledWith(
      { enabled: false },
      null,
      [],
      null,
      ''
    )
  })

  it('renders dropdown when all conditions are met', () => {
    const propsWithDropdown = {
      ...defaultProps,
      showSearchResultDropdown: true
    }
    
    renderWithProviders(<SearchBoxInput {...propsWithDropdown} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'react' } })
    
    expect(screen.getByTestId('search-dropdown')).toBeInTheDocument()
    expect(screen.getByText(/Results for: react/)).toBeInTheDocument()
  })

  it('does not render dropdown when showSearchResultDropdown is false', () => {
    renderWithProviders(<SearchBoxInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'react' } })
    
    expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument()
  })

  it('does not render dropdown when search term is empty', () => {
    const propsWithDropdown = {
      ...defaultProps,
      showSearchResultDropdown: true
    }
    
    renderWithProviders(<SearchBoxInput {...propsWithDropdown} />)
    
    expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument()
  })

  it('renders with proper CSS classes', () => {
    renderWithProviders(<SearchBoxInput {...defaultProps} />)
    
    const container = document.querySelector('.relative')
    expect(container.className).toContain('top-20')
    expect(container.className).toContain('bg-white')
    expect(container.className).toContain('rounded-xl')
    
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('outline-none')
    expect(input.className).toContain('w-full')
  })

  it('generates unique input IDs', () => {
    const { unmount } = renderWithProviders(<SearchBoxInput {...defaultProps} />)
    const firstInputId = screen.getByRole('textbox').getAttribute('id')
    
    unmount()
    
    renderWithProviders(<SearchBoxInput {...defaultProps} />)
    const secondInputId = screen.getByRole('textbox').getAttribute('id')
    
    expect(firstInputId).not.toBe(secondInputId)
    expect(firstInputId).toMatch(/-search-box$/)
    expect(secondInputId).toMatch(/-search-box$/)
  })

  it('integrates with debounce functionality', () => {
    renderWithProviders(<SearchBoxInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Component should work with debounced values
    // The mock returns the value immediately, so API should be called
    expect(mockUseInfinitePosts).toHaveBeenCalledWith(
      { enabled: true },
      null,
      [],
      null,
      'test'
    )
  })
})