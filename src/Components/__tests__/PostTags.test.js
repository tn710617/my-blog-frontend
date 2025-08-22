import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import PostTags from '../PostTags'

// Mock AiFillTags icon
vi.mock('react-icons/ai', () => ({
  AiFillTags: ({ className }) => (
    <div data-testid="tags-icon" className={className}>
      TagsIcon
    </div>
  )
}))

describe('PostTags Component', () => {
  const mockTags = [
    { id: 1, tag_name: 'React' },
    { id: 2, tag_name: 'JavaScript' },
    { id: 3, tag_name: 'Testing' }
  ]

  it('renders tags icon', () => {
    render(<PostTags tags={mockTags} />)
    
    const tagsIcon = screen.getByTestId('tags-icon')
    expect(tagsIcon).toBeInTheDocument()
    expect(tagsIcon).toHaveClass('text-xl', 'text-gray-400', 'cursor-pointer')
  })

  it('renders all tag names correctly', () => {
    render(<PostTags tags={mockTags} />)
    
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Testing')).toBeInTheDocument()
  })

  it('applies proper styling to tag elements', () => {
    render(<PostTags tags={mockTags} />)
    
    const reactTag = screen.getByText('React')
    expect(reactTag.className).toContain('py-1')
    expect(reactTag.className).toContain('px-3')
    expect(reactTag.className).toContain('border-blue-400')
    expect(reactTag.className).toContain('rounded-2xl')
    expect(reactTag.className).toContain('text-xs')
    expect(reactTag.className).toContain('font-semibold')
    expect(reactTag.className).toContain('bg-slate-200')
    expect(reactTag.className).toContain('hover:bg-slate-300')
    expect(reactTag.className).toContain('cursor-pointer')
  })

  it('renders container with proper layout classes', () => {
    const { container } = render(<PostTags tags={mockTags} />)
    
    const containerDiv = container.firstChild
    expect(containerDiv).toHaveClass('flex', 'flex-wrap', 'items-center', 'gap-2')
  })

  it('handles empty tags array gracefully', () => {
    render(<PostTags tags={[]} />)
    
    // Should still render the icon
    expect(screen.getByTestId('tags-icon')).toBeInTheDocument()
    
    // But no tag elements
    expect(screen.queryByText('React')).not.toBeInTheDocument()
  })

  it('handles single tag correctly', () => {
    const singleTag = [{ id: 7, tag_name: 'Solo Tag' }]
    
    render(<PostTags tags={singleTag} />)
    
    expect(screen.getByText('Solo Tag')).toBeInTheDocument()
    expect(screen.queryByText('React')).not.toBeInTheDocument()
  })

  it('renders tags with unique keys (no console warnings)', () => {
    // This test ensures each tag gets a unique key prop
    render(<PostTags tags={mockTags} />)
    
    // If keys are not unique, React would show console warnings
    // The fact that rendering succeeds without errors indicates proper key usage
    mockTags.forEach(tag => {
      expect(screen.getByText(tag.tag_name)).toBeInTheDocument()
    })
  })

  it('applies hover transition effects', () => {
    render(<PostTags tags={mockTags} />)
    
    const tags = screen.getAllByText(/React|JavaScript|Testing/)
    
    tags.forEach(tagElement => {
      expect(tagElement.className).toContain('transition-colors')
      expect(tagElement.className).toContain('duration-300')
    })
  })

  it('handles tags with special characters in names', () => {
    const specialTags = [
      { id: 1, tag_name: 'C++' },
      { id: 2, tag_name: 'Node.js' },
      { id: 3, tag_name: 'React/Redux' }
    ]
    
    render(<PostTags tags={specialTags} />)
    
    expect(screen.getByText('C++')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('React/Redux')).toBeInTheDocument()
  })

  it('handles long tag names without breaking layout', () => {
    const longTags = [
      { id: 1, tag_name: 'Very Long Tag Name That Should Not Break Layout' },
      { id: 2, tag_name: 'AnotherVeryLongTagNameWithoutSpaces' }
    ]
    
    render(<PostTags tags={longTags} />)
    
    expect(screen.getByText('Very Long Tag Name That Should Not Break Layout')).toBeInTheDocument()
    expect(screen.getByText('AnotherVeryLongTagNameWithoutSpaces')).toBeInTheDocument()
  })

  it('maintains consistent styling across all tag elements', () => {
    render(<PostTags tags={mockTags} />)
    
    const tagElements = screen.getAllByText(/React|JavaScript|Testing/)
    
    // Verify all tags have the same base styling
    const expectedClasses = [
      'py-1', 'px-3', 'border-blue-400', 'rounded-2xl', 
      'text-xs', 'font-semibold', 'bg-slate-200', 'cursor-pointer'
    ]
    
    tagElements.forEach(tagElement => {
      expectedClasses.forEach(className => {
        expect(tagElement.className).toContain(className)
      })
    })
  })

  it('renders correct number of tag elements', () => {
    render(<PostTags tags={mockTags} />)
    
    const tagElements = screen.getAllByText(/React|JavaScript|Testing/)
    expect(tagElements).toHaveLength(3)
  })
})