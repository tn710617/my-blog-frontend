import React from 'react'
import { render, screen } from '@testing-library/react'
import NoSearchResult from '../NoSearchResult'

// Mock the search off icon
vi.mock('react-icons/md', () => ({
  MdSearchOff: (props) => (
    <div data-testid="search-off-icon" {...props}>
      SearchOffIcon
    </div>
  )
}))

describe('NoSearchResult Component', () => {
  it('renders search off icon', () => {
    render(<NoSearchResult searchTerm="nonexistent" />)
    
    const icon = screen.getByTestId('search-off-icon')
    expect(icon).toBeInTheDocument()
    expect(icon.className).toContain('text-2xl')
  })

  it('displays no search result message with search term', () => {
    render(<NoSearchResult searchTerm="react testing" />)
    
    expect(screen.getByText('No search result for')).toBeInTheDocument()
    expect(screen.getByText('"react testing"')).toBeInTheDocument()
  })

  it('highlights search term in black text', () => {
    render(<NoSearchResult searchTerm="javascript" />)
    
    const searchTermElement = screen.getByText('"javascript"')
    expect(searchTermElement).toBeInTheDocument()
    expect(searchTermElement.className).toContain('text-black')
  })

  it('applies proper container styling', () => {
    render(<NoSearchResult searchTerm="test" />)
    
    const container = document.querySelector('.flex.flex-col.justify-center.items-center')
    expect(container).toBeInTheDocument()
  })

  it('applies proper text styling to message', () => {
    render(<NoSearchResult searchTerm="test" />)
    
    // Find the div with text-sm class
    const messageDiv = document.querySelector('.text-sm')
    expect(messageDiv).toBeInTheDocument()
    expect(messageDiv.textContent).toContain('No search result for')
  })

  it('handles empty search term', () => {
    render(<NoSearchResult searchTerm="" />)
    
    expect(screen.getByText('No search result for')).toBeInTheDocument()
    expect(screen.getByText('""')).toBeInTheDocument()
  })

  it('handles search term with special characters', () => {
    render(<NoSearchResult searchTerm="react@test#123" />)
    
    expect(screen.getByText('"react@test#123"')).toBeInTheDocument()
  })

  it('handles very long search term', () => {
    const longTerm = 'this is a very long search term that might overflow'
    render(<NoSearchResult searchTerm={longTerm} />)
    
    expect(screen.getByText(`"${longTerm}"`)).toBeInTheDocument()
  })

  it('renders with proper layout structure', () => {
    render(<NoSearchResult searchTerm="test" />)
    
    // Should have icon and message with proper styling
    expect(screen.getByTestId('search-off-icon')).toBeInTheDocument()
    expect(document.querySelector('.text-sm')).toBeInTheDocument()
    expect(screen.getByText('No search result for')).toBeInTheDocument()
  })

  it('maintains consistent styling for different search terms', () => {
    const { rerender } = render(<NoSearchResult searchTerm="first" />)
    
    const firstIcon = screen.getByTestId('search-off-icon')
    const firstMessageDiv = document.querySelector('.text-sm')
    
    expect(firstIcon.className).toContain('text-2xl')
    expect(firstMessageDiv).toBeInTheDocument()
    
    rerender(<NoSearchResult searchTerm="second search term" />)
    
    const secondIcon = screen.getByTestId('search-off-icon')
    const secondMessageDiv = document.querySelector('.text-sm')
    
    expect(secondIcon.className).toContain('text-2xl')
    expect(secondMessageDiv).toBeInTheDocument()
  })

  it('handles search term with quotes correctly', () => {
    render(<NoSearchResult searchTerm='search "with quotes"' />)
    
    expect(screen.getByText('"search "with quotes""')).toBeInTheDocument()
  })
})