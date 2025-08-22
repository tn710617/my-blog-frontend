import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import Categories from '../Categories'
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
      Icon-{category_id}
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

describe('Categories Component - Working Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store to default state
    useCategoryStore.setState({ categoryId: 1 })
  })

  const mockCategories = [
    { id: 1, category_name: 'general' },
    { id: 2, category_name: 'technology' },
    { id: 3, category_name: 'lifestyle' }
  ]

  it('renders all categories with proper structure', () => {
    renderWithRouter(<Categories categories={mockCategories} />)
    
    expect(screen.getByText('general')).toBeInTheDocument()
    expect(screen.getByText('technology')).toBeInTheDocument()
    expect(screen.getByText('lifestyle')).toBeInTheDocument()
  })

  it('renders category icons for each category', () => {
    renderWithRouter(<Categories categories={mockCategories} />)
    
    const categoryIcons = screen.getAllByTestId('category-icon')
    expect(categoryIcons).toHaveLength(3)
    
    expect(categoryIcons[0]).toHaveAttribute('data-category-id', '1')
    expect(categoryIcons[1]).toHaveAttribute('data-category-id', '2')
    expect(categoryIcons[2]).toHaveAttribute('data-category-id', '3')
  })

  it('applies proper container styling for desktop', () => {
    renderWithRouter(<Categories categories={mockCategories} />)
    
    const container = document.querySelector('.hidden.lg\\:flex')
    expect(container).toBeInTheDocument()
    expect(container.className).toContain('gap-4')
    expect(container.className).toContain('text-lg')
    expect(container.className).toContain('text-gray-400')
  })

  it('handles category click navigation', () => {
    renderWithRouter(<Categories categories={mockCategories} />)
    
    const technologyButton = screen.getByText('technology')
    fireEvent.click(technologyButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/')
    // Store updates with string values from button value attribute
    expect(useCategoryStore.getState().categoryId).toBe('2')
  })

  it('applies proper button styling with overlay', () => {
    renderWithRouter(<Categories categories={mockCategories} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    
    buttons.forEach(button => {
      expect(button.className).toContain('capitalize')
      expect(button.className).toContain('after:absolute')
      expect(button.className).toContain('after:inset-0')
    })
  })

  it('shows active indicator for current category', () => {
    // Set category 1 as current
    useCategoryStore.setState({ categoryId: 1 })
    
    renderWithRouter(<Categories categories={mockCategories} />)
    
    // Find the active indicator spans
    const activeIndicators = document.querySelectorAll('.opacity-100')
    const inactiveIndicators = document.querySelectorAll('.opacity-0')
    
    expect(activeIndicators.length).toBeGreaterThan(0)
    expect(inactiveIndicators.length).toBeGreaterThan(0)
  })

  it('renders with proper layout structure', () => {
    renderWithRouter(<Categories categories={mockCategories} />)
    
    const categoryDivs = document.querySelectorAll('.flex.items-center.relative.gap-2')
    expect(categoryDivs).toHaveLength(3)
    
    categoryDivs.forEach(div => {
      expect(div.className).toContain('group')
    })
  })

  it('handles empty categories array gracefully', () => {
    renderWithRouter(<Categories categories={[]} />)
    
    const container = document.querySelector('.hidden.lg\\:flex')
    expect(container).toBeInTheDocument()
    expect(container.children).toHaveLength(0)
  })

  it('handles single category correctly', () => {
    const singleCategory = [{ id: 5, category_name: 'single' }]
    
    renderWithRouter(<Categories categories={singleCategory} />)
    
    expect(screen.getByText('single')).toBeInTheDocument()
    expect(screen.getAllByTestId('category-icon')).toHaveLength(1)
    
    fireEvent.click(screen.getByText('single'))
    expect(useCategoryStore.getState().categoryId).toBe('5')
  })

  it('renders category names in capitalized format', () => {
    const categoriesWithLowercase = [
      { id: 1, category_name: 'lowercase name' },
      { id: 2, category_name: 'UPPERCASE NAME' }
    ]
    
    renderWithRouter(<Categories categories={categoriesWithLowercase} />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button.className).toContain('capitalize')
    })
  })

  it('updates store state on click', () => {
    renderWithRouter(<Categories categories={mockCategories} />)
    
    expect(useCategoryStore.getState().categoryId).toBe(1) // Initial state
    
    fireEvent.click(screen.getByText('technology'))
    expect(useCategoryStore.getState().categoryId).toBe('2') // Updates as string
    
    fireEvent.click(screen.getByText('lifestyle'))
    expect(useCategoryStore.getState().categoryId).toBe('3') // Updates again
  })
})