/* eslint-disable import/first */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { IntlProvider } from 'react-intl'
import en from '../../locales/en.json'

// Mock APIs and child components to avoid network/ESM and store issues
vi.mock('../../APIs/categories', () => ({
  useCategories: () => ({ isSuccess: true, data: [] }),
}))
vi.mock('../../APIs/auth', () => ({
  useLoginWithMetaMask: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useLogout: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))
vi.mock('./SearchBoxComponent', () => ({
  default: () => <div data-testid="search-component" />
}))
vi.mock('./Categories', () => ({
  default: () => <div data-testid="categories" />
}))
vi.mock('./MobileCategories', () => ({
  default: () => <div data-testid="mobile-categories" />
}))
vi.mock('./AboutButton', () => ({
  default: () => <div data-testid="about-button" />
}))
vi.mock('./LocaleDropdown', () => ({
  default: () => <div data-testid="locale-dropdown" />
}))

// Mock the auth store only
vi.mock('../../stores', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useAuthStore: vi.fn(),
  }
})

import Nav from '.'
import { useAuthStore } from '../../stores'

const renderNav = () => {
  return render(
    <IntlProvider locale="en" messages={en}>
      <MemoryRouter>
        <Nav />
      </MemoryRouter>
    </IntlProvider>
  )
}

describe('Nav', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows Login when not logged in', () => {
    useAuthStore.mockImplementation((selector) => selector({ isLoggedIn: false }))
    renderNav()
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.queryByText('Logout')).toBeNull()
  })

  it('shows Logout when logged in', () => {
    useAuthStore.mockImplementation((selector) => selector({ isLoggedIn: true }))
    renderNav()
    expect(screen.getByText('Logout')).toBeInTheDocument()
    expect(screen.queryByText('Login')).toBeNull()
  })
})