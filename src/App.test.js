/* eslint-disable import/first */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock Layout to avoid importing Nav and API-related modules
jest.mock('./Components/Layout', () => () => <div>Layout</div>)
jest.mock('./Pages/Posts', () => () => <div>Posts</div>)
jest.mock('./Pages/SinglePost', () => () => <div>SinglePost</div>)
jest.mock('./Pages/CreatePost', () => () => <div>CreatePost</div>)
jest.mock('./Pages/EditPost', () => () => <div>EditPost</div>)
jest.mock('./Components/ProtectedRoute', () => () => <div>ProtectedRoute</div>)
jest.mock('./Pages/About', () => () => <div>About</div>)

import App from './App'

test('renders Layout without heavy dependencies', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  )

  expect(screen.getByText(/Layout/)).toBeInTheDocument()
})
