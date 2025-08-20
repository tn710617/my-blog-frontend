/* eslint-disable import/first */
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'

// Mock Layout to render children via Outlet to avoid heavy imports
vi.mock('./Components/Layout', () => {
  const React = require('react')
  const { Outlet } = require('react-router-dom')
  return function MockLayout() {
    return (
      <div>
        <div>Layout</div>
        <Outlet />
      </div>
    )
  }
})

// Mock gated route to simply render children
vi.mock('./Components/ProtectedRoute', () => {
  const React = require('react')
  const { Outlet } = require('react-router-dom')
  return function MockProtected() {
    return <Outlet />
  }
})

// Mock pages to avoid API and ESM deps
vi.mock('./Pages/Posts', () => () => <div>Posts Page</div>)
vi.mock('./Pages/SinglePost', () => () => <div>Single Post Page</div>)
vi.mock('./Pages/CreatePost', () => () => <div>Create Post Page</div>)
vi.mock('./Pages/EditPost', () => () => <div>Edit Post Page</div>)
vi.mock('./Pages/About', () => () => <div>About Page</div>)

import App from './App'

describe('App routes', () => {
  it('renders Posts at root', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Layout')).toBeInTheDocument()
    expect(screen.getByText('Posts Page')).toBeInTheDocument()
  })

  it('renders About at /about', () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('About Page')).toBeInTheDocument()
  })

  it('renders SinglePost at /single-post', () => {
    render(
      <MemoryRouter initialEntries={["/single-post?post_id=1"]}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Single Post Page')).toBeInTheDocument()
  })

  it('renders CreatePost behind ProtectedRoute', () => {
    render(
      <MemoryRouter initialEntries={["/create-post"]}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Create Post Page')).toBeInTheDocument()
  })

  it('renders EditPost behind ProtectedRoute', () => {
    render(
      <MemoryRouter initialEntries={["/edit-post"]}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Edit Post Page')).toBeInTheDocument()
  })

  it('wildcard routes back to Posts', () => {
    render(
      <MemoryRouter initialEntries={["/non-existent"]}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Posts Page')).toBeInTheDocument()
  })
})
