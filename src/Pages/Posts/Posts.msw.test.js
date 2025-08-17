import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IntlProvider } from 'react-intl'
import { MemoryRouter } from 'react-router-dom'
import en from '../../locales/en.json'

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

describe('Posts page (MSW)', () => {
  it('loads and paginates posts via API', async () => {
    renderWithProviders(<Posts />)

    // Page 1 posts
    expect(await screen.findByText('MSW Post 1')).toBeInTheDocument()
    expect(screen.getByText('MSW Post 2')).toBeInTheDocument()

    // Navigate to page 2
    fireEvent.click(screen.getByRole('button', { name: '2' }))

    // Page 2 posts
    expect(await screen.findByText('MSW Post 3')).toBeInTheDocument()
  })
})

