import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IntlProvider } from 'react-intl'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import CreatePost from '../index'
import { usePostFormStore } from '../../../stores'
import en from '../../../locales/en.json'

// Mock the APIs and external dependencies
vi.mock('../../../APIs/tags', () => ({
  useTags: () => ({
    status: 'success',
    data: [
      { id: 1, tag_name: 'react' },
      { id: 2, tag_name: 'javascript' },
      { id: 3, tag_name: 'testing' }
    ]
  })
}))

vi.mock('../../../APIs/categories', () => ({
  useCategories: () => ({
    status: 'success',
    data: [
      { id: 1, category_name: 'General', category_description: 'General topics' },
      { id: 2, category_name: 'Tech', category_description: 'Technology' }
    ]
  })
}))

const mockMutate = vi.fn()
const mockStorePost = {
  mutate: mockMutate,
  isLoading: false,
  data: { id: 123 }
}

vi.mock('../../../APIs/posts', () => ({
  useStorePost: () => mockStorePost
}))

// Mock Toast UI Editor
vi.mock('@toast-ui/react-editor', () => ({
  Editor: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      getInstance: () => ({
        getMarkdown: () => 'Mock markdown content',
        setMarkdown: vi.fn()
      })
    }))
    
    return (
      <textarea
        data-testid="mock-editor"
        onChange={(e) => props.onChange && props.onChange()}
        placeholder="Mock Toast UI Editor"
      />
    )
  })
}))

// Mock Tagify
vi.mock('@yaireo/tagify', () => ({
  default: class MockTagify {
    constructor(element, options) {
      this.element = element
      this.options = options
      // Simulate tagify being attached to element
      element.__tagify = this
    }
    
    removeAllTags() {}
    addTags(tags) {}
    destroy() {}
  }
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

describe('CreatePost Form Validation Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    usePostFormStore.getState().clearForm()
  })

  it('renders all form components correctly', () => {
    renderWithProviders(<CreatePost />)
    
    // Check main form elements
    expect(screen.getByText('Write an Article')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Post Title')).toBeInTheDocument()
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Reset')).toBeInTheDocument()
  })

  it('handles post title validation workflow', async () => {
    renderWithProviders(<CreatePost />)
    
    const titleInput = screen.getByPlaceholderText('Post Title')
    const saveButton = screen.getByText('Save')
    
    // Initially valid styling
    expect(titleInput.className).not.toContain('border-red-300')
    
    // Enter a title
    fireEvent.change(titleInput, { target: { value: 'My Test Post' } })
    
    // Click save to trigger form submission
    fireEvent.click(saveButton)
    
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        post_title: 'My Test Post'
      }),
      expect.any(Object)
    )
  })

  it('handles form reset correctly', () => {
    renderWithProviders(<CreatePost />)
    
    const titleInput = screen.getByPlaceholderText('Post Title')
    const resetButton = screen.getByText('Reset')
    
    // Enter some data
    fireEvent.change(titleInput, { target: { value: 'Test Title' } })
    expect(titleInput.value).toBe('Test Title')
    
    // Reset form
    fireEvent.click(resetButton)
    
    // Should clear the input
    expect(titleInput.value).toBe('')
    
    // Store should be reset to defaults
    const form = usePostFormStore.getState().form
    expect(form.post_title).toBe('')
    expect(form.category_id).toBe('2')
    expect(form.is_public).toBe(true)
  })

  it('integrates with form store for title updates', () => {
    renderWithProviders(<CreatePost />)
    
    const titleInput = screen.getByPlaceholderText('Post Title')
    
    // Fill form data
    fireEvent.change(titleInput, { target: { value: 'Integration Test Post' } })
    
    // Check store state for title (most reliable part)
    const form = usePostFormStore.getState().form
    expect(form.post_title).toBe('Integration Test Post')
    expect(form.category_id).toBe('2') // Default value
    expect(form.is_public).toBe(true) // Default value
  })

  it('calls mutation when form is submitted', () => {
    renderWithProviders(<CreatePost />)
    
    const titleInput = screen.getByPlaceholderText('Post Title')
    const saveButton = screen.getByText('Save')
    
    // Fill out the form
    fireEvent.change(titleInput, { target: { value: 'Submit Test' } })
    
    // Submit form
    fireEvent.click(saveButton)
    
    // Should call mutation (check that it was called, don't worry about exact content)
    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        post_title: 'Submit Test'
      }),
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function)
      })
    )
  })

  it('handles form submission success scenario', async () => {
    // Mock successful submission
    const mockNavigate = vi.fn()
    vi.doMock('react-router', async () => {
      const actual = await vi.importActual('react-router')
      return {
        ...actual,
        useNavigate: () => mockNavigate
      }
    })

    renderWithProviders(<CreatePost />)
    
    const titleInput = screen.getByPlaceholderText('Post Title')
    const saveButton = screen.getByText('Save')
    
    fireEvent.change(titleInput, { target: { value: 'Success Test' } })
    fireEvent.click(saveButton)
    
    // Get the success callback and call it
    const calls = mockMutate.mock.calls
    expect(calls).toHaveLength(1)
    const [, options] = calls[0]
    
    // Simulate successful response
    act(() => {
      options.onSuccess()
    })
    
    // Should clear form after success
    await waitFor(() => {
      expect(usePostFormStore.getState().form.post_title).toBe('')
    })
  })

  it('displays character count for content', () => {
    renderWithProviders(<CreatePost />)
    
    // Should show character count (appears twice - mobile and desktop)
    const characterCounts = screen.getAllByText(/\/\s*30000/)
    expect(characterCounts).toHaveLength(2) // Mobile and desktop versions
  })

  it('provides error and success callbacks for form submission', () => {
    renderWithProviders(<CreatePost />)
    
    const titleInput = screen.getByPlaceholderText('Post Title')
    const saveButton = screen.getByText('Save')
    
    fireEvent.change(titleInput, { target: { value: 'Error Test' } })
    fireEvent.click(saveButton)
    
    // Should call mutation with proper error and success handlers
    expect(mockMutate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function)
      })
    )
    
    // Verify we can access the callback functions
    const calls = mockMutate.mock.calls
    const [, options] = calls[0]
    expect(typeof options.onError).toBe('function')
    expect(typeof options.onSuccess).toBe('function')
  })
})