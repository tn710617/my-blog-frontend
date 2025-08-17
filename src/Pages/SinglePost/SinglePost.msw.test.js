/* eslint-disable import/first */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IntlProvider } from 'react-intl'
import { MemoryRouter } from 'react-router-dom'
import en from '../../locales/en.json'

// Avoid ESM issues from react-markdown in test
jest.mock('./PostBody', () => () => <div>Body</div>)

import SinglePost from '.'

const renderWithProviders = (ui, path = '/single-post?post_id=555') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <IntlProvider locale="en" messages={en}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    </IntlProvider>
  )
}

describe('SinglePost page (MSW)', () => {
  it('loads and renders a single post via API', async () => {
    renderWithProviders(<SinglePost />)

    expect(await screen.findByText('MSW Show Post 555')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })
})
