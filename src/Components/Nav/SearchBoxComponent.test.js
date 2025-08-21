import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import SearchBoxComponent from './SearchBoxComponent'

vi.mock('./SearchBoxInput', () => ({
  default: () => <div>SearchInput</div>
}))

describe('SearchBoxComponent', () => {
  it('closes on ESC key', () => {
    const setShow = vi.fn()
    const setDropdown = vi.fn()
    render(
      <SearchBoxComponent
        showSearchBoxComponent={true}
        setShowSearchBoxComponent={setShow}
        showSearchResultDropdown={true}
        setShowSearchResultDropdown={setDropdown}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(setShow).toHaveBeenCalledWith(false)
    expect(setDropdown).toHaveBeenCalledWith(false)
  })
})
