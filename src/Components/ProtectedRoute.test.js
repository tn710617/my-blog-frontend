import React from 'react'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
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
})
