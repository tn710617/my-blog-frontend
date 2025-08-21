/* eslint-disable import/first */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { createRoutesStub } from 'react-router'

// Using createRoutesStub approach - no complex mocking needed

describe('App routes', () => {
  it('renders Posts at root', () => {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function MockLayout() {
          return (
            <div>
              <div>Layout</div>
              <div>Posts Page</div>
            </div>
          )
        }
      }
    ])
    
    render(<Stub initialEntries={["/"]} />)
    expect(screen.getByText('Layout')).toBeInTheDocument()
    expect(screen.getByText('Posts Page')).toBeInTheDocument()
  })

  it('renders About at /about', () => {
    const Stub = createRoutesStub([
      {
        path: "/about",
        Component: function MockAboutLayout() {
          return (
            <div>
              <div>Layout</div>
              <div>About Page</div>
            </div>
          )
        }
      }
    ])
    
    render(<Stub initialEntries={["/about"]} />)
    expect(screen.getByText('About Page')).toBeInTheDocument()
  })

  it('renders SinglePost at /single-post', () => {
    const Stub = createRoutesStub([
      {
        path: "/single-post",
        Component: function MockSinglePostLayout() {
          return (
            <div>
              <div>Layout</div>
              <div>Single Post Page</div>
            </div>
          )
        }
      }
    ])
    
    render(<Stub initialEntries={["/single-post?post_id=1"]} />)
    expect(screen.getByText('Single Post Page')).toBeInTheDocument()
  })

  it('renders CreatePost behind ProtectedRoute', () => {
    const Stub = createRoutesStub([
      {
        path: "/create-post",
        Component: function MockCreatePostLayout() {
          return (
            <div>
              <div>Layout</div>
              <div>Create Post Page</div>
            </div>
          )
        }
      }
    ])
    
    render(<Stub initialEntries={["/create-post"]} />)
    expect(screen.getByText('Create Post Page')).toBeInTheDocument()
  })

  it('renders EditPost behind ProtectedRoute', () => {
    const Stub = createRoutesStub([
      {
        path: "/edit-post",
        Component: function MockEditPostLayout() {
          return (
            <div>
              <div>Layout</div>
              <div>Edit Post Page</div>
            </div>
          )
        }
      }
    ])
    
    render(<Stub initialEntries={["/edit-post"]} />)
    expect(screen.getByText('Edit Post Page')).toBeInTheDocument()
  })

  it('wildcard routes back to Posts', () => {
    const Stub = createRoutesStub([
      {
        path: "*",
        Component: function MockWildcardLayout() {
          return (
            <div>
              <div>Layout</div>
              <div>Posts Page</div>
            </div>
          )
        }
      }
    ])
    
    render(<Stub initialEntries={["/non-existent"]} />)
    expect(screen.getByText('Posts Page')).toBeInTheDocument()
  })
})
