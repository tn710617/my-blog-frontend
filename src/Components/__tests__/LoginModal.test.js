import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { vi } from 'vitest'
import LoginModal from '../LoginModal'
import en from '../../locales/en.json'

// Mock the stores and API
const mockSetShowLoginModal = vi.fn()
const mockWalletMutateAsync = vi.fn()
const mockPasskeyMutateAsync = vi.fn()
let mockShowLoginModal = true

vi.mock('../../stores', () => ({
  useLoginModalStore: (selector) => {
    const state = { showLoginModal: mockShowLoginModal, setShowLoginModal: mockSetShowLoginModal }
    return selector(state)
  }
}))

vi.mock('../../APIs/auth', () => ({
  useLoginWithMetaMask: () => ({
    mutateAsync: mockWalletMutateAsync,
    isPending: false
  })
}))

vi.mock('../../APIs/passkeys', () => ({
  usePasskeyLogin: () => ({
    mutateAsync: mockPasskeyMutateAsync,
    isPending: false
  })
}))

vi.mock('../../wallet/getProvider', () => ({
  disconnectWalletSession: vi.fn()
}))

const wrap = (ui) => (
  <IntlProvider locale="en" messages={en}>{ui}</IntlProvider>
)

describe('LoginModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockShowLoginModal = true
  })

  it('renders modal when showLoginModal is true', () => {
    render(wrap(<LoginModal />))

    expect(screen.getByText('Oops! You are not the owner')).toBeInTheDocument()
  })

  it('renders with info type modal styling', () => {
    render(wrap(<LoginModal />))

    const iconContainer = document.querySelector('.bg-green-100')
    expect(iconContainer).toBeTruthy()
  })

  it('makes passkey the primary action and hides the wallet flow behind a secondary link', () => {
    render(wrap(<LoginModal />))

    expect(screen.getByRole('button', { name: en['login_modal.passkey_button'] })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: en['login_modal.use_wallet'] })).toBeInTheDocument()
    expect(screen.queryByText(en['login_modal.button_text'])).not.toBeInTheDocument()
    expect(screen.queryByText(en['login_modal.switch_account'])).not.toBeInTheDocument()
  })

  it('reveals the wallet login and switch-account only after clicking the secondary link', () => {
    render(wrap(<LoginModal />))

    fireEvent.click(screen.getByRole('button', { name: en['login_modal.use_wallet'] }))

    expect(screen.getByRole('button', { name: en['login_modal.button_text'] })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: en['login_modal.switch_account'] })).toBeInTheDocument()
    expect(mockWalletMutateAsync).not.toHaveBeenCalled()
  })

  it('logs in with passkey and closes on success', async () => {
    mockPasskeyMutateAsync.mockResolvedValue(undefined)
    render(wrap(<LoginModal />))

    fireEvent.click(screen.getByRole('button', { name: en['login_modal.passkey_button'] }))

    await waitFor(() => expect(mockSetShowLoginModal).toHaveBeenCalledWith(false))
    expect(mockWalletMutateAsync).not.toHaveBeenCalled()
  })

  it('stays put and never falls back to the wallet when passkey fails or is cancelled', async () => {
    const cancelled = Object.assign(new Error('cancelled'), { name: 'NotAllowedError' })
    mockPasskeyMutateAsync.mockRejectedValue(cancelled)
    render(wrap(<LoginModal />))

    fireEvent.click(screen.getByRole('button', { name: en['login_modal.passkey_button'] }))

    await waitFor(() => expect(mockPasskeyMutateAsync).toHaveBeenCalledTimes(1))
    expect(mockWalletMutateAsync).not.toHaveBeenCalled()
    expect(mockSetShowLoginModal).not.toHaveBeenCalledWith(false)
    expect(screen.getByRole('button', { name: en['login_modal.passkey_button'] })).toBeInTheDocument()
    expect(screen.queryByText(en['login_modal.button_text'])).not.toBeInTheDocument()
  })

  it('does not ask for a passkey just because the modal opened', () => {
    render(wrap(<LoginModal />))

    expect(mockPasskeyMutateAsync).not.toHaveBeenCalled()
    expect(mockWalletMutateAsync).not.toHaveBeenCalled()
  })

  it('does not ask for a passkey while the modal is closed (page load)', () => {
    mockShowLoginModal = false
    render(wrap(<LoginModal />))

    expect(mockPasskeyMutateAsync).not.toHaveBeenCalled()
  })
})
