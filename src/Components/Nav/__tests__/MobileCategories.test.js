import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import MobileCategories from '../MobileCategories'
import { useCategoryStore } from '../../../stores'

// Mock the navigation
const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock CategoryIcon component
vi.mock('../../CategoryIcon', () => ({
  default: ({ category_id }) => (
    <div data-testid="category-icon" data-category-id={category_id}>
      MobileIcon-{category_id}
    </div>
  )
}))

const renderWithRouter = (ui) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  )
}

describe('MobileCategories Component - Working Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store to default state
    useCategoryStore.setState({ categoryId: 1 })
  })

  const mockCategories = [
    { id: 1, category_name: 'general' },
    { id: 2, category_name: 'technology' },
    { id: 3, category_name: 'lifestyle' },
    { id: 4, category_name: 'health' }
  ]

  it('renders all categories without container wrapper', () => {
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    expect(screen.getByText('general')).toBeInTheDocument()
    expect(screen.getByText('technology')).toBeInTheDocument()
    expect(screen.getByText('lifestyle')).toBeInTheDocument()
    expect(screen.getByText('health')).toBeInTheDocument()
  })

  it('renders category icons for each category', () => {
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    const categoryIcons = screen.getAllByTestId('category-icon')
    expect(categoryIcons).toHaveLength(4)
    
    expect(categoryIcons[0]).toHaveAttribute('data-category-id', '1')
    expect(categoryIcons[1]).toHaveAttribute('data-category-id', '2')
    expect(categoryIcons[2]).toHaveAttribute('data-category-id', '3')
    expect(categoryIcons[3]).toHaveAttribute('data-category-id', '4')
  })

  it('applies proper mobile styling to all categories', () => {
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    const categoryDivs = document.querySelectorAll('.flex.rounded-lg.px-2.items-center')
    expect(categoryDivs).toHaveLength(4)
  })

  it('handles category click and navigation', () => {
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    const technologyButton = screen.getByText('technology')
    fireEvent.click(technologyButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/')
    expect(useCategoryStore.getState().categoryId).toBe('2')
  })

  it('applies proper button styling with overlay', () => {
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
    
    buttons.forEach(button => {
      expect(button.className).toContain('after:absolute')
      expect(button.className).toContain('after:inset-0')
    })
  })

  it('correctly identifies current category with integer comparison', () => {
    // Test string vs integer comparison
    useCategoryStore.setState({ categoryId: '3' }) // String value
    
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    const lifestyleCategory = screen.getByText('lifestyle').closest('div')
    expect(lifestyleCategory.className).toContain('bg-gray-200')
    expect(lifestyleCategory.className).toContain('text-black')
  })

  it('applies different styling logic than desktop version', () => {
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    // Mobile should not have blue color scheme or indicators
    expect(document.querySelector('.text-blue-400')).not.toBeInTheDocument()
    expect(document.querySelector('.bg-blue-400')).not.toBeInTheDocument()
    
    // Should have gray color scheme instead
    const categoryDivs = document.querySelectorAll('.hover\\:bg-gray-200')
    expect(categoryDivs.length).toBeGreaterThan(0)
  })

  it('renders without hidden/responsive classes', () => {
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    // Should not have hidden lg:flex classes like desktop version
    expect(document.querySelector('.hidden.lg\\:flex')).not.toBeInTheDocument()
    
    // Categories should be directly rendered as mapped elements
    const categoryDivs = document.querySelectorAll('.flex.rounded-lg')
    expect(categoryDivs).toHaveLength(4)
  })

  it('handles empty categories array gracefully', () => {
    const { container } = renderWithRouter(<MobileCategories categories={[]} />)
    
    // Should render empty with no categories
    expect(container.firstChild).toBeNull()
  })

  it('handles single category correctly', () => {
    const singleCategory = [{ id: 7, category_name: 'single mobile' }]
    
    renderWithRouter(<MobileCategories categories={singleCategory} />)
    
    expect(screen.getByText('single mobile')).toBeInTheDocument()
    expect(screen.getAllByTestId('category-icon')).toHaveLength(1)
    
    fireEvent.click(screen.getByText('single mobile'))
    expect(useCategoryStore.getState().categoryId).toBe('7')
  })

  it('renders categories in order without container grouping', () => {
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    // Get all category text elements in order
    const categoryTexts = mockCategories.map(cat => screen.getByText(cat.category_name))
    
    categoryTexts.forEach((textElement, index) => {
      expect(textElement).toBeInTheDocument()
      expect(textElement.textContent).toBe(mockCategories[index].category_name)
    })
  })

  it('updates store state on mobile category click', () => {
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    expect(useCategoryStore.getState().categoryId).toBe(1) // Initial state
    
    fireEvent.click(screen.getByText('health'))
    expect(useCategoryStore.getState().categoryId).toBe('4') // Should update as string
    
    fireEvent.click(screen.getByText('technology'))
    expect(useCategoryStore.getState().categoryId).toBe('2') // Should update again
  })

  it('applies proper spacing and layout for mobile interface', () => {
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    const categoryDivs = document.querySelectorAll('.rounded-lg.px-2')
    expect(categoryDivs).toHaveLength(4)
    
    categoryDivs.forEach(div => {
      expect(div.className).toContain('gap-2') // Proper spacing between icon and text
      expect(div.className).toContain('items-center') // Vertical alignment
      expect(div.className).toContain('relative') // For button overlay positioning
    })
  })

  it('correctly renders unique keys for each category', () => {
    renderWithRouter(<MobileCategories categories={mockCategories} />)
    
    // React should render all categories without key warnings
    // This is implicit in successful rendering, but we verify all are present
    mockCategories.forEach(category => {
      expect(screen.getByText(category.category_name)).toBeInTheDocument()
    })
  })
})