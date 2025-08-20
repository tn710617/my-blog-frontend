/* eslint-disable import/first */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import en from '../../locales/en.json'

// Mock APIs and child components to avoid network/ESM
vi.mock('../../APIs/categories', () => ({
  useCategories: () => ({ isSuccess: true, data: [] }),
}))
vi.mock('../../APIs/auth', () => ({
  useLoginWithMetaMask: () => ({ mutateAsync: vi.fn(), isLoading: false }),
  useLogout: () => ({ mutateAsync: vi.fn(), isLoading: false }),
}))
vi.mock('./SearchBoxComponent', () => () => <div />)

// Mock helpers with a controllable value
vi.mock('../../helpers', () => ({
  isLoggedInInLocalStorage: vi.fn(),
}))

import Nav from '.'
import * as helpers from '../../helpers'

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
    helpers.isLoggedInInLocalStorage.mockReturnValue(false)
    renderNav()
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.queryByText('Logout')).toBeNull()
  })

  it('shows Logout when logged in', () => {
    helpers.isLoggedInInLocalStorage.mockReturnValue(true)
    renderNav()
    expect(screen.getByText('Logout')).toBeInTheDocument()
    expect(screen.queryByText('Login')).toBeNull()
  })
})
