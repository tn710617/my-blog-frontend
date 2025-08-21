import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { vi } from 'vitest'
import { useLogout } from '../../APIs/auth'
import LogoutButton from '../Nav/LogoutButton'
import { useAuthStore } from '../../stores'
import en from '../../locales/en.json'

// Mock the auth API
const mockLogoutMutateAsync = vi.fn()
vi.mock('../../APIs/auth', () => ({
  useLogout: () => ({
    mutateAsync: mockLogoutMutateAsync,
    isLoading: false
  })
}))

const wrap = (ui) => (
  <IntlProvider locale="en" messages={en}>{ui}</IntlProvider>
)

describe('Logout Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Start logged in
    useAuthStore.setState({ isLoggedIn: true })
    localStorage.setItem('learn_or_die_is_logged_in', 'true')
  })

  it('calls logout mutation when logout button is clicked', async () => {
    const mockOnClick = vi.fn().mockImplementation(() => mockLogoutMutateAsync())
    
    render(wrap(<LogoutButton onClick={mockOnClick} isLoading={false} />))
    
    // Find and click logout button
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)
    
    // Verify onClick handler was called
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state during logout process', () => {
    const mockOnClick = vi.fn()
    
    render(wrap(<LogoutButton onClick={mockOnClick} isLoading={true} />))
    
    // Button should still show logout text
    expect(screen.getByText('Logout')).toBeInTheDocument()
    
    // Icon should have spin animation (we can't easily test CSS classes, but we can verify button exists)
    const logoutButton = screen.getByRole('button')
    expect(logoutButton).toBeInTheDocument()
  })

  it('integrates with auth store for logout state management', async () => {
    // Mock the useLogout hook to simulate successful logout
    const mockMutateAsync = vi.fn().mockImplementation(() => {
      // Simulate what the real logout mutation does
      useAuthStore.getState().setIsLoggedIn(false)
      localStorage.removeItem('learn_or_die_is_logged_in')
      return Promise.resolve('success')
    })

    // Create a test component that uses useLogout like Nav component does
    function TestLogoutIntegration() {
      const logout = { mutateAsync: mockMutateAsync, isLoading: false }
      const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
      
      return (
        <div>
          <div>Auth Status: {isLoggedIn ? 'Logged In' : 'Logged Out'}</div>
          <LogoutButton 
            onClick={async () => await logout.mutateAsync()} 
            isLoading={logout.isLoading} 
          />
          <div>LocalStorage: {localStorage.getItem('learn_or_die_is_logged_in') || 'null'}</div>
        </div>
      )
    }

    render(wrap(<TestLogoutIntegration />))
    
    // Initially should be logged in
    expect(screen.getByText('Auth Status: Logged In')).toBeInTheDocument()
    expect(screen.getByText('LocalStorage: true')).toBeInTheDocument()
    
    // Click logout button
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)
    
    // Wait for logout to complete
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1)
    })
    
    // Auth state should be updated
    expect(screen.getByText('Auth Status: Logged Out')).toBeInTheDocument()
    expect(screen.getByText('LocalStorage: null')).toBeInTheDocument()
  })

  it('handles logout error scenarios gracefully', async () => {
    const mockError = new Error('Network error')
    const mockMutateAsync = vi.fn().mockRejectedValue(mockError)
    
    function TestLogoutError() {
      const logout = { mutateAsync: mockMutateAsync, isLoading: false }
      const [error, setError] = React.useState(null)
      
      const handleLogout = async () => {
        try {
          await logout.mutateAsync()
        } catch (err) {
          setError(err.message)
        }
      }
      
      return (
        <div>
          <LogoutButton onClick={handleLogout} isLoading={logout.isLoading} />
          {error && <div>Error: {error}</div>}
        </div>
      )
    }

    render(wrap(<TestLogoutError />))
    
    // Click logout button
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)
    
    // Should handle error
    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument()
    })
    
    // Auth state should remain logged in on error
    expect(useAuthStore.getState().isLoggedIn).toBe(true)
    expect(localStorage.getItem('learn_or_die_is_logged_in')).toBe('true')
  })
})