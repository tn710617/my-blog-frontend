import React from 'react'
import { render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { vi } from 'vitest'
import LoginModal from '../LoginModal'
import en from '../../locales/en.json'

// Mock the stores and API
const mockSetShowLoginModal = vi.fn()
const mockMutateAsync = vi.fn()

vi.mock('../../stores', () => ({
  useLoginModalStore: (selector) => {
    const state = { showLoginModal: true, setShowLoginModal: mockSetShowLoginModal }
    return selector(state)
  }
}))

vi.mock('../../APIs/auth', () => ({
  useLoginWithMetaMask: () => ({
    mutateAsync: mockMutateAsync,
    isLoading: false
  })
}))

const wrap = (ui) => (
  <IntlProvider locale="en" messages={en}>{ui}</IntlProvider>
)

describe('LoginModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal when showLoginModal is true', () => {
    render(wrap(<LoginModal />))
    
    // Check modal title from locale
    expect(screen.getByText('Oops! You are not the owner')).toBeInTheDocument()
    
    // Check modal button text from locale
    expect(screen.getByText('Please chant the spell')).toBeInTheDocument()
  })

  it('renders with info type modal styling', () => {
    render(wrap(<LoginModal />))
    
    // Modal should have the green check icon (info type)
    // Check for the green background class in the DOM
    const iconContainer = document.querySelector('.bg-green-100')
    expect(iconContainer).toBeTruthy()
  })
})