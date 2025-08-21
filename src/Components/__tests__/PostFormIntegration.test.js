import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { vi } from 'vitest'
import PostTitleInput from '../PostTitleInput'
import { usePostFormStore } from '../../stores'
import en from '../../locales/en.json'

const wrap = (ui) => (
  <IntlProvider locale="en" messages={en}>{ui}</IntlProvider>
)

describe('Post Form Integration', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    // Reset store state
    usePostFormStore.getState().clearForm()
  })

  it('integrates PostTitleInput with post form store', () => {
    // Component that uses the actual store
    function PostTitleWithStore() {
      const form = usePostFormStore((state) => state.form)
      const updateForm = usePostFormStore((state) => state.updateForm)
      const [isValid, setIsValid] = React.useState(true)
      
      const setForm = (newForm) => updateForm(newForm)
      
      return (
        <div>
          <PostTitleInput 
            form={form} 
            setForm={setForm} 
            isValid={isValid} 
            setIsValid={setIsValid} 
          />
          <div data-testid="store-title">{form.post_title}</div>
          <div data-testid="store-category">{form.category_id}</div>
          <div data-testid="validation-state">{isValid ? 'valid' : 'invalid'}</div>
        </div>
      )
    }

    render(wrap(<PostTitleWithStore />))
    
    // Initially empty title from store defaults
    expect(screen.getByTestId('store-title')).toHaveTextContent('')
    expect(screen.getByTestId('store-category')).toHaveTextContent('2') // default category
    
    // Type in the input
    const input = screen.getByPlaceholderText('Post Title')
    fireEvent.change(input, { target: { value: 'My Integration Test Post' } })
    
    // Store should be updated
    expect(screen.getByTestId('store-title')).toHaveTextContent('My Integration Test Post')
    expect(usePostFormStore.getState().form.post_title).toBe('My Integration Test Post')
  })

  it('persists form data through store persistence', () => {
    // First component instance
    function FirstInstance() {
      const form = usePostFormStore((state) => state.form)
      const updateForm = usePostFormStore((state) => state.updateForm)
      const [isValid, setIsValid] = React.useState(true)
      
      return (
        <PostTitleInput 
          form={form} 
          setForm={(newForm) => updateForm(newForm)} 
          isValid={isValid} 
          setIsValid={setIsValid} 
        />
      )
    }

    const { unmount } = render(wrap(<FirstInstance />))
    
    // Enter data
    const input = screen.getByPlaceholderText('Post Title')
    fireEvent.change(input, { target: { value: 'Persisted Title' } })
    
    // Verify data is in store and localStorage
    expect(usePostFormStore.getState().form.post_title).toBe('Persisted Title')
    
    const stored = localStorage.getItem('learn_or_die_post_form_storage')
    expect(stored).toBeTruthy()
    expect(JSON.parse(stored).state.form.post_title).toBe('Persisted Title')
    
    unmount()

    // Second component instance (simulating page reload)
    function SecondInstance() {
      const form = usePostFormStore((state) => state.form)
      return <div data-testid="restored-title">{form.post_title}</div>
    }

    render(wrap(<SecondInstance />))
    
    // Should restore from localStorage
    expect(screen.getByTestId('restored-title')).toHaveTextContent('Persisted Title')
  })

  it('handles validation state changes properly', () => {
    function ValidationTestComponent() {
      const form = usePostFormStore((state) => state.form)
      const updateForm = usePostFormStore((state) => state.updateForm)
      const [isValid, setIsValid] = React.useState(false) // Start invalid
      
      return (
        <div>
          <PostTitleInput 
            form={form} 
            setForm={(newForm) => updateForm(newForm)} 
            isValid={isValid} 
            setIsValid={setIsValid} 
          />
          <div data-testid="validation-state">{isValid ? 'valid' : 'invalid'}</div>
          <button onClick={() => setIsValid(false)} data-testid="make-invalid">
            Make Invalid
          </button>
        </div>
      )
    }

    render(wrap(<ValidationTestComponent />))
    
    // Initially invalid
    expect(screen.getByTestId('validation-state')).toHaveTextContent('invalid')
    
    const input = screen.getByPlaceholderText('Post Title')
    expect(input.className).toContain('border-red-300')
    
    // Type to make valid
    fireEvent.change(input, { target: { value: 'Valid Title' } })
    expect(screen.getByTestId('validation-state')).toHaveTextContent('valid')
    expect(input.className).not.toContain('border-red-300')
    
    // Make invalid again via button
    fireEvent.click(screen.getByTestId('make-invalid'))
    expect(screen.getByTestId('validation-state')).toHaveTextContent('invalid')
    expect(input.className).toContain('border-red-300')
  })

  it('handles form clearing correctly', () => {
    function ClearFormTestComponent() {
      const form = usePostFormStore((state) => state.form)
      const updateForm = usePostFormStore((state) => state.updateForm)
      const clearForm = usePostFormStore((state) => state.clearForm)
      const [isValid, setIsValid] = React.useState(true)
      
      return (
        <div>
          <PostTitleInput 
            form={form} 
            setForm={(newForm) => updateForm(newForm)} 
            isValid={isValid} 
            setIsValid={setIsValid} 
          />
          <button onClick={clearForm} data-testid="clear-form">
            Clear Form
          </button>
          <div data-testid="current-title">{form.post_title}</div>
        </div>
      )
    }

    render(wrap(<ClearFormTestComponent />))
    
    // Add some data
    const input = screen.getByPlaceholderText('Post Title')
    fireEvent.change(input, { target: { value: 'Title to Clear' } })
    
    expect(screen.getByTestId('current-title')).toHaveTextContent('Title to Clear')
    expect(input.value).toBe('Title to Clear')
    
    // Clear the form
    fireEvent.click(screen.getByTestId('clear-form'))
    
    expect(screen.getByTestId('current-title')).toHaveTextContent('')
    expect(input.value).toBe('')
    
    // Should reset to default values
    expect(usePostFormStore.getState().form.post_title).toBe('')
    expect(usePostFormStore.getState().form.category_id).toBe('2')
    expect(usePostFormStore.getState().form.is_public).toBe(true)
  })
})