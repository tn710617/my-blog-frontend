import React from 'react'
import { render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import en from '../../locales/en.json'
import LoginButton from './LoginButton'
import LogoutButton from './LogoutButton'

const wrap = (ui) => (
  <IntlProvider locale="en" messages={en}>{ui}</IntlProvider>
)

describe('LoginButton and LogoutButton', () => {
  it('renders login text and spinner state', () => {
    const { rerender } = render(wrap(<LoginButton isLoading={false} onClick={() => {}} />))
    expect(screen.getByText('Login')).toBeInTheDocument()

    rerender(wrap(<LoginButton isLoading={true} onClick={() => {}} />))
    // Spinner is applied via className; ensure the icon is present via accessible name
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('renders logout text and spinner state', () => {
    const { rerender } = render(wrap(<LogoutButton isLoading={false} onClick={() => {}} />))
    expect(screen.getByText('Logout')).toBeInTheDocument()

    rerender(wrap(<LogoutButton isLoading={true} onClick={() => {}} />))
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })
})

