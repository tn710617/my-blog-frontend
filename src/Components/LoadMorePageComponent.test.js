import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LoadMorePageComponent from './LoadMorePageComponent'

describe('LoadMorePageComponent', () => {
  it('renders load more text and calls fetchNextPage when enabled', () => {
    const fetchNextPage = jest.fn()
    const pagination = { hasNextPage: true, isFetching: false, fetchNextPage }

    render(
      <LoadMorePageComponent
        pagination={pagination}
        loadMoreText="Load More"
        loadingText="Loading..."
        lastPageText="No more"
      />
    )

    const button = screen.getByRole('button', { name: 'Load More' })
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(fetchNextPage).toHaveBeenCalled()
  })

  it('shows loading text when fetching', () => {
    const pagination = { hasNextPage: true, isFetching: true, fetchNextPage: jest.fn() }
    render(
      <LoadMorePageComponent
        pagination={pagination}
        loadMoreText="Load More"
        loadingText="Loading..."
        lastPageText="No more"
      />
    )
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeEnabled()
  })

  it('disables and shows last page text when no next page', () => {
    const pagination = { hasNextPage: false, isFetching: false, fetchNextPage: jest.fn() }
    render(
      <LoadMorePageComponent
        pagination={pagination}
        loadMoreText="Load More"
        loadingText="Loading..."
        lastPageText="No more"
      />
    )
    const btn = screen.getByRole('button', { name: 'No more' })
    expect(btn).toBeDisabled()
  })
})

