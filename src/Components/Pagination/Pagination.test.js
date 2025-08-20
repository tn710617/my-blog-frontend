import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '.'
import { IntlProvider } from 'react-intl'
import en from '../../locales/en.json'

const renderWithIntl = (ui) => {
  return render(
    <IntlProvider locale="en" messages={en}>
      {ui}
    </IntlProvider>
  )
}

describe('Pagination component', () => {
  it('renders pages and handles page click', () => {
    const setCurrentPage = vi.fn()
    renderWithIntl(
      <Pagination currentPage={1} totalPages={5} totalPosts={50} setCurrentPage={setCurrentPage} />
    )

    // Should render page numbers 1..5 (current page is disabled)
    expect(screen.getByRole('button', { name: '1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '2' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '3' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '4' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '5' })).toBeEnabled()

    // Click page 3
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(setCurrentPage).toHaveBeenCalledWith(3)
  })

  it('disables previous at first page and next at last page', () => {
    const setCurrentPage = vi.fn()

    // At first page: previous disabled
    const { rerender } = renderWithIntl(
      <Pagination currentPage={1} totalPages={5} totalPosts={50} setCurrentPage={setCurrentPage} />
    )

    const prevButtonsFirst = screen.getAllByRole('button', { name: /Previous/i })
    prevButtonsFirst.forEach(btn => expect(btn).toBeDisabled())

    // At last page: next disabled
    rerender(
      <IntlProvider locale="en" messages={en}>
        <Pagination currentPage={5} totalPages={5} totalPosts={50} setCurrentPage={setCurrentPage} />
      </IntlProvider>
    )
    const nextButtonsLast = screen.getAllByRole('button', { name: /Next/i })
    nextButtonsLast.forEach(btn => expect(btn).toBeDisabled())
  })

  it('calls setCurrentPage on next/previous click', () => {
    const setCurrentPage = vi.fn()
    renderWithIntl(
      <Pagination currentPage={2} totalPages={5} totalPosts={50} setCurrentPage={setCurrentPage} />
    )

    const prevButtons = screen.getAllByRole('button', { name: /Previous/i })
    const nextButtons = screen.getAllByRole('button', { name: /Next/i })

    // Click the first matching prev/next (either mobile or desktop control)
    fireEvent.click(prevButtons[0])
    fireEvent.click(nextButtons[0])

    expect(setCurrentPage).toHaveBeenCalledWith(1)
    expect(setCurrentPage).toHaveBeenCalledWith(3)
  })
})

