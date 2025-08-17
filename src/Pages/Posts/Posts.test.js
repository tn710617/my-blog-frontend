/* eslint-disable import/first */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import en from '../../locales/en.json'

// Mock child component that pulls in query-string via tags API
jest.mock('./PopularTags', () => () => <div>PopularTags</div>)

// Mock APIs to avoid ESM deps and network
jest.mock('../../APIs/categories', () => ({
  useCategories: () => ({
    isSuccess: true,
    status: 'success',
    data: [
      { id: 1, category_name: 'General', category_description: 'General topics' },
    ],
  }),
}))

jest.mock('../../APIs/posts', () => ({
  useIndexPosts: () => ({
    isSuccess: true,
    status: 'success',
    data: {
      data: [
        { id: 101, post_title: 'First Post', post_content: 'Hello world', tags: [], category_id: 1, category: { category_name: 'General' }, created_at: '2024-01-01', updated_at: '2024-01-01', is_public: true },
        { id: 102, post_title: 'Second Post', post_content: 'More content', tags: [], category_id: 1, category: { category_name: 'General' }, created_at: '2024-01-02', updated_at: '2024-01-02', is_public: true },
      ],
      meta: { last_page: 3, per_page: 10, total: 2 },
    },
    queryKey: ['mock'],
  }),
}))

import Posts from '.'

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <IntlProvider locale="en" messages={en}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    </IntlProvider>
  )
}

describe('Posts page (mocked APIs)', () => {
  it('renders post list and toggles current page on click', () => {
    renderWithProviders(<Posts />)

    // Posts rendered
    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()

    // Current page starts at 1 (disabled)
    expect(screen.getByRole('button', { name: '1' })).toBeDisabled()

    // Click page 2
    fireEvent.click(screen.getByRole('button', { name: '2' }))

    // Now page 2 should be current (disabled)
    expect(screen.getByRole('button', { name: '2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '1' })).toBeEnabled()
  })
})
