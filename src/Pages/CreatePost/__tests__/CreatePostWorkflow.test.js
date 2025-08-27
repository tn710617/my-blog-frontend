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
  isPending: false,
  data: { id: 123 }
}

vi.mock('../../../APIs/posts', () => ({
  useStorePost: () => mockStorePost
}))

// Mock @uiw/react-md-editor
vi.mock('@uiw/react-md-editor', () => ({
  default: React.forwardRef((props, ref) => {
    return (
      <textarea
        data-testid="mock-editor"
        value={props.value || ''}
        onChange={(e) => props.onChange && props.onChange(e.target.value)}
        placeholder="Mock Markdown Editor"
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
      this.settings = options || {}
      this.whitelist = options?.whitelist || []
      this.DOM = {
        input: element
      }
      this.dropdown = {
        hide: vi.fn()
      }
      // Simulate tagify being attached to element
      element.__tagify = this
      this.eventHandlers = new Map()
    }
    
    removeAllTags() {}
    addTags(tags) {}
    destroy() {}
    
    // Modern Tagify event methods
    on(event, handler) {
      if (!this.eventHandlers.has(event)) {
        this.eventHandlers.set(event, [])
      }
      this.eventHandlers.get(event).push(handler)
    }
    
    off(event, handler) {
      if (this.eventHandlers.has(event)) {
        const handlers = this.eventHandlers.get(event)
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
    
    // Simulate triggering events for testing
    trigger(event, data) {
      if (this.eventHandlers.has(event)) {
        this.eventHandlers.get(event).forEach(handler => {
          handler(data)
        })
      }
    }
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
    const contentEditor = screen.getByTestId('mock-editor')
    const saveButton = screen.getByText('Save')
    
    // Initially valid styling
    expect(titleInput.className).not.toContain('border-red-300')
    
    // Enter a title and content (both required for save)
    fireEvent.change(titleInput, { target: { value: 'My Test Post' } })
    fireEvent.change(contentEditor, { target: { value: 'Test content' } })
    
    // Click save to trigger form submission
    fireEvent.click(saveButton)
    
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        post_title: 'My Test Post',
        post_content: 'Test content'
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
    const contentEditor = screen.getByTestId('mock-editor')
    const saveButton = screen.getByText('Save')
    
    // Fill out the form with both title and content
    fireEvent.change(titleInput, { target: { value: 'Submit Test' } })
    fireEvent.change(contentEditor, { target: { value: 'Test content for submission' } })
    
    // Submit form
    fireEvent.click(saveButton)
    
    // Should call mutation (check that it was called, don't worry about exact content)
    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        post_title: 'Submit Test',
        post_content: 'Test content for submission'
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
    const contentEditor = screen.getByTestId('mock-editor')
    const saveButton = screen.getByText('Save')
    
    // Fill both required fields
    fireEvent.change(titleInput, { target: { value: 'Success Test' } })
    fireEvent.change(contentEditor, { target: { value: 'Success test content' } })
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

  it('enables reset button when any form field is changed from defaults', () => {
    renderWithProviders(<CreatePost />)
    
    const resetButtons = screen.getAllByText('Reset')
    expect(resetButtons.length).toBeGreaterThan(0) // Should have reset buttons
    
    // Initially disabled (no changes from defaults)
    resetButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
    
    // Test that title change enables reset button
    const titleInput = screen.getByPlaceholderText('Post Title')
    fireEvent.change(titleInput, { target: { value: 'Test Title' } })
    
    // Reset buttons should now be enabled
    resetButtons.forEach(button => {
      expect(button).not.toBeDisabled()
    })
    
    // Reset form and verify buttons are disabled again
    fireEvent.click(resetButtons[0])
    resetButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
    
    // Test that content change enables reset button
    const contentEditor = screen.getByTestId('mock-editor')
    fireEvent.change(contentEditor, { target: { value: 'Test content' } })
    
    resetButtons.forEach(button => {
      expect(button).not.toBeDisabled()
    })
  })

  it('provides error and success callbacks for form submission', () => {
    renderWithProviders(<CreatePost />)
    
    const titleInput = screen.getByPlaceholderText('Post Title')
    const contentEditor = screen.getByTestId('mock-editor')
    const saveButton = screen.getByText('Save')
    
    // Fill both required fields
    fireEvent.change(titleInput, { target: { value: 'Error Test' } })
    fireEvent.change(contentEditor, { target: { value: 'Error test content' } })
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