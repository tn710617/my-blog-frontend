import React from 'react'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen, act } from '@testing-library/react'
import ProtectedRoute from './ProtectedRoute'
import { useAuthStore, useLoginModalStore } from '../stores'

// Mock the is-logged-in query to avoid network/React Query behaviors
vi.mock('../APIs/auth', () => ({
  useIsLoggedIn: () => ({})
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    // Reset store state
    useAuthStore.setState({ isLoggedIn: false })
    useLoginModalStore.setState({ showLoginModal: false })
  })

  it('redirects and opens login modal when not logged in', async () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route element={<ProtectedRoute redirectPath="/" /> }>
            <Route path="/protected" element={<div>Secret</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    // Should land on Home instead of Secret
    expect(await screen.findByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Secret')).toBeNull()

    // Login modal should be opened via store
    expect(useLoginModalStore.getState().showLoginModal).toBe(true)
  })

  it('renders child route when logged in', async () => {
    // Seed auth store and localStorage to appear logged in
    useAuthStore.setState({ isLoggedIn: true })
    localStorage.setItem('learn_or_die_is_logged_in', 'true')

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route element={<ProtectedRoute redirectPath="/" /> }>
            <Route path="/protected" element={<div>Secret</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Secret')).toBeInTheDocument()
    expect(screen.queryByText('Home')).toBeNull()
    // Modal should remain closed
    expect(useLoginModalStore.getState().showLoginModal).toBe(false)
  })

  it('redirects to custom path when specified', async () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute redirectPath="/login" /> }>
            <Route path="/protected" element={<div>Secret</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    // Should redirect to custom login page
    expect(await screen.findByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Secret')).toBeNull()
    expect(useLoginModalStore.getState().showLoginModal).toBe(true)
  })

  it('logs out user when auth store becomes false', async () => {
    // Start logged in
    useAuthStore.setState({ isLoggedIn: true })
    localStorage.setItem('learn_or_die_is_logged_in', 'true')

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route element={<ProtectedRoute redirectPath="/" /> }>
            <Route path="/protected" element={<div>Secret</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    // Should show protected content initially
    expect(await screen.findByText('Secret')).toBeInTheDocument()

    // Simulate logout - auth store becomes false
    act(() => {
      useAuthStore.setState({ isLoggedIn: false })
    })

    // Should redirect to home and open login modal
    expect(await screen.findByText('Home')).toBeInTheDocument()
    expect(useLoginModalStore.getState().showLoginModal).toBe(true)
    
    // localStorage should be cleared
    expect(localStorage.getItem('learn_or_die_is_logged_in')).toBeNull()
  })
})
