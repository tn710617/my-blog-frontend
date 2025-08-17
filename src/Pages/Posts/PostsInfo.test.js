import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import en from '../../locales/en.json'
import PostsInfo from './PostsInfo'

const renderWithIntl = (ui) =>
  render(
    <IntlProvider locale="en" messages={en}>
      {ui}
    </IntlProvider>
  )

describe('PostsInfo', () => {
  it('calls setSort for latest and recently updated', () => {
    const setSort = jest.fn()
    renderWithIntl(<PostsInfo sort="created_at" setSort={setSort} />)

    // Click Recently Updated
    fireEvent.click(screen.getByRole('button', { name: /Recently Updated/i }))
    expect(setSort).toHaveBeenCalledWith('updated_at')

    // Click Latest Posts
    fireEvent.click(screen.getByRole('button', { name: /Latest Posts/i }))
    expect(setSort).toHaveBeenCalledWith('created_at')
  })
})

