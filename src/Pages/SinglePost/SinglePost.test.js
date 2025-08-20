/* eslint-disable import/first */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IntlProvider } from 'react-intl'
import { MemoryRouter } from 'react-router-dom'
import en from '../../locales/en.json'

// Mock ESM-heavy markdown body component
vi.mock('./PostBody', () => () => <div>Body</div>)

// Mock API to avoid network/ESM deps
vi.mock('../../APIs/posts', () => ({
  useShowPost: () => ({
    isSuccess: true,
    data: {
      id: 42,
      post_title: 'Mocked Post Title',
      post_content: 'Mocked content',
      tags: [{ id: 1, tag_name: 'tag1' }],
      category_id: 1,
      category: { category_name: 'General' },
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
      is_public: true,
      locale: 'en',
    },
  }),
  useDeletePost: () => ({ mutateAsync: vi.fn(), isLoading: false }),
}))

import SinglePost from '.'
import { useAuthStore } from '../../stores'

const renderWithProviders = (ui, initialPath = '/single-post?post_id=42') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <IntlProvider locale="en" messages={en}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    </IntlProvider>
  )
}

describe('SinglePost page (mocked API)', () => {
  beforeEach(() => {
    useAuthStore.setState({ isLoggedIn: true })
  })

  it('renders the post title and actions when logged in', () => {
    renderWithProviders(<SinglePost />)

    expect(screen.getByText('Mocked Post Title')).toBeInTheDocument()
    // Edit/Delete actions container appears when logged in
    // We assert that the Edit button text is present
    expect(screen.getByText(/Edit/i)).toBeInTheDocument()
  })
})
