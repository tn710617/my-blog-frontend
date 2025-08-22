import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { IntlProvider } from 'react-intl'
import { vi } from 'vitest'
import LocaleDropdown from '../LocaleDropdown'
import { useLocaleStore } from '../../../stores'
import en from '../../../locales/en.json'

// Mock the flag images
vi.mock('../taiwan.png', () => ({ default: 'taiwanese-flag-mock.png' }))
vi.mock('../en.png', () => ({ default: 'english-flag-mock.png' }))

// Mock react-router hooks using same pattern as working Categories test
const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }) // Simple static location
  }
})

const renderWithRouter = (ui, initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <IntlProvider locale="en" messages={en}>
        {ui}
      </IntlProvider>
    </MemoryRouter>
  )
}

describe('LocaleDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset locale store
    useLocaleStore.setState({ locale: 'en' })
  })

  describe('Basic rendering', () => {
    it('renders dropdown button with English locale by default', () => {
      renderWithRouter(<LocaleDropdown />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('EN')).toBeInTheDocument()
      expect(screen.getByAltText('EN')).toHaveAttribute('src', 'english-flag-mock.png')
    })

    it('renders dropdown button with Chinese locale when store is set to zh-TW', () => {
      useLocaleStore.setState({ locale: 'zh-TW' })
      
      renderWithRouter(<LocaleDropdown />)

      expect(screen.getByText('繁中')).toBeInTheDocument()
      expect(screen.getByAltText('繁中')).toHaveAttribute('src', 'taiwanese-flag-mock.png')
    })

    it('renders dropdown arrow icon', () => {
      renderWithRouter(<LocaleDropdown />)

      const svgElement = screen.getByRole('button').querySelector('svg')
      expect(svgElement).toBeInTheDocument()
      expect(svgElement).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Dropdown interaction', () => {
    it('shows dropdown options when button is clicked', () => {
      renderWithRouter(<LocaleDropdown />)

      // Initially, dropdown options should not be visible
      expect(screen.queryAllByText('繁中')).toHaveLength(0)

      // Click to open dropdown
      fireEvent.click(screen.getByRole('button'))

      // Both locale options should now be visible
      const allButtons = screen.getAllByRole('button')
      expect(allButtons).toHaveLength(3) // Main button + 2 dropdown options
      expect(screen.getAllByText('繁中')).toHaveLength(1) // Chinese option
      expect(screen.getAllByText('EN')).toHaveLength(2) // Button + English option
    })

    it('hides dropdown options when button is clicked twice', () => {
      renderWithRouter(<LocaleDropdown />)

      const button = screen.getByRole('button')
      
      // Open dropdown
      fireEvent.click(button)
      expect(screen.getAllByText('繁中')).toHaveLength(1)
      
      // Close dropdown
      fireEvent.click(button)
      expect(screen.queryByText('繁中')).not.toBeInTheDocument()
    })
  })

  describe('Language selection', () => {
    it('changes locale when option is selected', async () => {
      renderWithRouter(<LocaleDropdown />)

      // Open dropdown and select Chinese
      fireEvent.click(screen.getByRole('button'))
      const chineseOptions = screen.getAllByText('繁中')
      fireEvent.click(chineseOptions[0])

      await waitFor(() => {
        expect(useLocaleStore.getState().locale).toBe('zh-TW')
      })
    })

    it('closes dropdown after selecting an option', async () => {
      renderWithRouter(<LocaleDropdown />)

      // Open dropdown
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getAllByText('繁中')).toHaveLength(1)
      
      // Select option
      const chineseOptions = screen.getAllByText('繁中')
      fireEvent.click(chineseOptions[0])

      await waitFor(() => {
        // After clicking, the dropdown should close, only button shows Chinese
        const allChineseText = screen.getAllByText('繁中')
        expect(allChineseText).toHaveLength(1) // Only in button, not in dropdown
      })
    })

  })

  describe('Navigation integration', () => {
    it('does not call navigate when not on single-post page', async () => {
      renderWithRouter(<LocaleDropdown />)

      // Open dropdown and select Chinese
      fireEvent.click(screen.getByRole('button'))
      const chineseOptions = screen.getAllByText('繁中')
      fireEvent.click(chineseOptions[0])

      await waitFor(() => {
        expect(useLocaleStore.getState().locale).toBe('zh-TW')
      })

      // Should not have called navigate since we're on home page
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('provides proper button role', () => {
      renderWithRouter(<LocaleDropdown />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('provides proper image alt texts', () => {
      renderWithRouter(<LocaleDropdown />)

      // Open dropdown to see all images
      fireEvent.click(screen.getByRole('button'))

      const enImages = screen.getAllByAltText('EN')
      const zhImages = screen.getAllByAltText('繁中')
      
      expect(enImages).toHaveLength(2) // One in button, one in dropdown
      expect(zhImages).toHaveLength(1) // One in dropdown
    })
  })

  describe('Locale switching', () => {
    it('displays all available locale options', () => {
      renderWithRouter(<LocaleDropdown />)

      // Open dropdown
      fireEvent.click(screen.getByRole('button'))

      // Should show both English and Chinese options
      expect(screen.getAllByText('EN')).toHaveLength(2) // Button + option
      expect(screen.getAllByText('繁中')).toHaveLength(1) // Option only
    })

    it('handles switching between supported languages', async () => {
      renderWithRouter(<LocaleDropdown />)

      // Switch to Chinese
      fireEvent.click(screen.getByRole('button'))
      const chineseOptions = screen.getAllByText('繁中')
      fireEvent.click(chineseOptions[0])

      await waitFor(() => {
        expect(useLocaleStore.getState().locale).toBe('zh-TW')
      })

      // Switch back to English
      fireEvent.click(screen.getByRole('button'))
      const englishOptions = screen.getAllByText('EN')
      fireEvent.click(englishOptions[englishOptions.length - 1]) // Last one is the dropdown option

      await waitFor(() => {
        expect(useLocaleStore.getState().locale).toBe('en')
      })
    })
  })
})