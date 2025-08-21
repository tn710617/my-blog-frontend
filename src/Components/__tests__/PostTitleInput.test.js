import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { vi } from 'vitest'
import PostTitleInput from '../PostTitleInput'
import en from '../../locales/en.json'

const wrap = (ui) => (
  <IntlProvider locale="en" messages={en}>{ui}</IntlProvider>
)

describe('PostTitleInput', () => {
  const mockForm = { post_title: '' }
  const mockSetForm = vi.fn()
  const mockSetIsValid = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with placeholder text from locale', () => {
    render(wrap(
      <PostTitleInput 
        form={mockForm} 
        setForm={mockSetForm} 
        isValid={true} 
        setIsValid={mockSetIsValid} 
      />
    ))
    
    expect(screen.getByPlaceholderText('Post Title')).toBeInTheDocument()
  })

  it('displays current form value', () => {
    const formWithTitle = { post_title: 'My Great Post' }
    
    render(wrap(
      <PostTitleInput 
        form={formWithTitle} 
        setForm={mockSetForm} 
        isValid={true} 
        setIsValid={mockSetIsValid} 
      />
    ))
    
    expect(screen.getByDisplayValue('My Great Post')).toBeInTheDocument()
  })

  it('calls setForm when user types', () => {
    render(wrap(
      <PostTitleInput 
        form={mockForm} 
        setForm={mockSetForm} 
        isValid={true} 
        setIsValid={mockSetIsValid} 
      />
    ))
    
    const input = screen.getByPlaceholderText('Post Title')
    fireEvent.change(input, { target: { value: 'New Title' } })
    
    expect(mockSetForm).toHaveBeenCalledWith({ ...mockForm, post_title: 'New Title' })
  })

  it('calls setIsValid(true) when user types to clear validation error', () => {
    render(wrap(
      <PostTitleInput 
        form={mockForm} 
        setForm={mockSetForm} 
        isValid={false} 
        setIsValid={mockSetIsValid} 
      />
    ))
    
    const input = screen.getByPlaceholderText('Post Title')
    fireEvent.change(input, { target: { value: 'Valid Title' } })
    
    expect(mockSetIsValid).toHaveBeenCalledWith(true)
  })

  it('applies error styling when isValid is false', () => {
    render(wrap(
      <PostTitleInput 
        form={mockForm} 
        setForm={mockSetForm} 
        isValid={false} 
        setIsValid={mockSetIsValid} 
      />
    ))
    
    const input = screen.getByPlaceholderText('Post Title')
    expect(input.className).toContain('border-red-300')
  })

  it('applies normal styling when isValid is true', () => {
    render(wrap(
      <PostTitleInput 
        form={mockForm} 
        setForm={mockSetForm} 
        isValid={true} 
        setIsValid={mockSetIsValid} 
      />
    ))
    
    const input = screen.getByPlaceholderText('Post Title')
    expect(input.className).not.toContain('border-red-300')
    expect(input.className).toContain('border-gray-300')
  })

  it('has required attribute for form validation', () => {
    render(wrap(
      <PostTitleInput 
        form={mockForm} 
        setForm={mockSetForm} 
        isValid={true} 
        setIsValid={mockSetIsValid} 
      />
    ))
    
    const input = screen.getByPlaceholderText('Post Title')
    expect(input).toBeRequired()
  })
})