import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import PopularTags from '../PopularTags'
import { useAuthStore } from '../../../stores'

// Mock the navigation
const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/', search: '' })
  }
})

// Mock the tags API
const mockUseTags = vi.fn()
vi.mock('../../../APIs/tags', () => ({
  useTags: () => mockUseTags()
}))

// Create test wrapper with providers
const createWrapper = (initialRoute = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('PopularTags Component - Working Tests', () => {
  const mockTags = [
    { id: 1, tag_name: 'React' },
    { id: 2, tag_name: 'JavaScript' },
    { id: 3, tag_name: 'TypeScript' },
    { id: 4, tag_name: 'Node.js' },
    { id: 5, tag_name: 'Python' }
  ]

  const defaultProps = {
    tags: [],
    setTags: vi.fn(),
    setCurrentPage: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset auth store
    useAuthStore.setState({ isLoggedIn: false })

    // Default mock implementation
    mockUseTags.mockReturnValue({
      status: 'success',
      isSuccess: true,
      data: mockTags,
      queryKey: ['tags', 'locale', 'en']
    })
  })

  it('renders popular tags when API call succeeds', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...defaultProps} />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })
  })

  it('renders show more/less tags toggle button', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...defaultProps} />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('show more tags ...')).toBeInTheDocument()
    })
  })

  it('applies basic styling to unselected tags', async () => {
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...defaultProps} />
      </Wrapper>
    )

    await waitFor(() => {
      const reactTag = screen.getByText('React')
      expect(reactTag.className).toContain('py-1')
      expect(reactTag.className).toContain('px-3')
      expect(reactTag.className).toContain('border-blue-400')
      expect(reactTag.className).toContain('rounded-2xl')
      expect(reactTag.className).toContain('bg-slate-200')
      expect(reactTag.className).toContain('hover:bg-slate-400')
    })
  })

  it('applies correct styling to selected tags', async () => {
    const propsWithSelectedTags = {
      ...defaultProps,
      tags: ['1', '3'] // React and TypeScript selected
    }
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...propsWithSelectedTags} />
      </Wrapper>
    )

    await waitFor(() => {
      const reactTag = screen.getByText('React')
      expect(reactTag.className).toContain('bg-slate-400')
      
      const jsTag = screen.getByText('JavaScript')
      expect(jsTag.className).toContain('hover:bg-slate-400')
    })
  })

  it('moves selected tags to the front of the list', async () => {
    const propsWithSelectedTags = {
      ...defaultProps,
      tags: ['3', '5'] // TypeScript and Python selected
    }
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...propsWithSelectedTags} />
      </Wrapper>
    )

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const tagButtons = buttons.filter(btn => btn.textContent !== 'show more tags ...')
      
      // Selected tags should appear first
      expect(tagButtons[0]).toHaveTextContent('TypeScript')
      expect(tagButtons[1]).toHaveTextContent('Python')
    })
  })

  it('handles tag selection and navigation', async () => {
    const mockSetCurrentPage = vi.fn()
    const propsWithMock = {
      ...defaultProps,
      setCurrentPage: mockSetCurrentPage
    }
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...propsWithMock} />
      </Wrapper>
    )

    await waitFor(() => {
      const reactTag = screen.getByText('React')
      fireEvent.click(reactTag)
      
      expect(mockSetCurrentPage).toHaveBeenCalledWith(1)
      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: '/',
        search: 'tags=1'
      })
    })
  })

  it('handles tag deselection correctly', async () => {
    const propsWithSelectedTags = {
      ...defaultProps,
      tags: ['1', '2'] // React and JavaScript selected
    }
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...propsWithSelectedTags} />
      </Wrapper>
    )

    await waitFor(() => {
      const reactTag = screen.getByText('React')
      fireEvent.click(reactTag)
      
      // Should navigate with only JavaScript tag (removed React)
      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: '/',
        search: 'tags=2'
      })
    })
  })

  it('handles multiple tag selection', async () => {
    const propsWithOneTag = {
      ...defaultProps,
      tags: ['1'] // React selected
    }
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...propsWithOneTag} />
      </Wrapper>
    )

    await waitFor(() => {
      const jsTag = screen.getByText('JavaScript')
      fireEvent.click(jsTag)
      
      // Should navigate with both tags
      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: '/',
        search: 'tags=1&tags=2'
      })
    })
  })

  it('toggles show more/less tags functionality', async () => {
    // Create more than 10 tags to test the toggle
    const manyTags = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      tag_name: `Tag${i + 1}`
    }))
    
    mockUseTags.mockReturnValue({
      status: 'success',
      isSuccess: true,
      data: manyTags,
      queryKey: ['tags', 'locale', 'en']
    })

    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...defaultProps} />
      </Wrapper>
    )

    await waitFor(() => {
      // Initially should show only 10 tags
      expect(screen.getByText('Tag1')).toBeInTheDocument()
      expect(screen.getByText('Tag10')).toBeInTheDocument()
      expect(screen.queryByText('Tag11')).not.toBeInTheDocument()
    })

    // Click show more
    fireEvent.click(screen.getByText('show more tags ...'))

    await waitFor(() => {
      expect(screen.getByText('Tag11')).toBeInTheDocument()
      expect(screen.getByText('Tag15')).toBeInTheDocument()
      expect(screen.getByText('show less tags ...')).toBeInTheDocument()
    })

    // Click show less
    fireEvent.click(screen.getByText('show less tags ...'))

    await waitFor(() => {
      expect(screen.queryByText('Tag11')).not.toBeInTheDocument()
      expect(screen.getByText('show more tags ...')).toBeInTheDocument()
    })
  })

  it('handles API loading state gracefully', () => {
    mockUseTags.mockReturnValue({
      status: 'loading',
      isSuccess: false,
      data: undefined,
      queryKey: ['tags', 'locale', 'en']
    })

    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...defaultProps} />
      </Wrapper>
    )

    // Should only show the toggle button, no tags
    expect(screen.getByText('show more tags ...')).toBeInTheDocument()
    expect(screen.queryByText('React')).not.toBeInTheDocument()
  })

  it('handles API error state gracefully', () => {
    mockUseTags.mockReturnValue({
      status: 'error',
      isSuccess: false,
      data: undefined,
      queryKey: ['tags', 'locale', 'en']
    })

    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...defaultProps} />
      </Wrapper>
    )

    // Should only show the toggle button, no tags
    expect(screen.getByText('show more tags ...')).toBeInTheDocument()
    expect(screen.queryByText('React')).not.toBeInTheDocument()
  })

  it('handles empty tags data', async () => {
    mockUseTags.mockReturnValue({
      status: 'success',
      isSuccess: true,
      data: [],
      queryKey: ['tags', 'locale', 'en']
    })

    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...defaultProps} />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('show more tags ...')).toBeInTheDocument()
      expect(screen.queryByText('React')).not.toBeInTheDocument()
    })
  })

  it('generates correct query parameters for multiple tags', async () => {
    const propsWithMultipleTags = {
      ...defaultProps,
      tags: ['1', '3'] // React and TypeScript
    }
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...propsWithMultipleTags} />
      </Wrapper>
    )

    await waitFor(() => {
      const jsTag = screen.getByText('JavaScript')
      fireEvent.click(jsTag)
      
      // Should add JavaScript to existing tags
      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: '/',
        search: 'tags=1&tags=3&tags=2'
      })
    })
  })

  it('resets to page 1 when tags change', async () => {
    const mockSetCurrentPage = vi.fn()
    const propsWithMock = {
      ...defaultProps,
      setCurrentPage: mockSetCurrentPage
    }
    const Wrapper = createWrapper()
    
    render(
      <Wrapper>
        <PopularTags {...propsWithMock} />
      </Wrapper>
    )

    await waitFor(() => {
      const reactTag = screen.getByText('React')
      fireEvent.click(reactTag)
      
      expect(mockSetCurrentPage).toHaveBeenCalledWith(1)
    })
  })

  it('applies proper container layout styling', async () => {
    const Wrapper = createWrapper()
    
    const { container } = render(
      <Wrapper>
        <PopularTags {...defaultProps} />
      </Wrapper>
    )

    await waitFor(() => {
      const tagsContainer = container.firstChild
      expect(tagsContainer).toHaveClass('flex', 'flex-wrap', 'gap-2')
    })
  })
})