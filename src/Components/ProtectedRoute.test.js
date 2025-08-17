import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from './ProtectedRoute'
import { useAuthStore, useLoginModalStore } from '../stores'

// Mock the is-logged-in query to avoid network/React Query behaviors
jest.mock('../APIs/auth', () => ({
  useIsLoggedIn: () => ({})
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.resetModules()
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
})

