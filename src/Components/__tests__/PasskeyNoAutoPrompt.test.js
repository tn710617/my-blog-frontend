import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IntlProvider } from 'react-intl'
import { MemoryRouter, Route, Routes } from 'react-router'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import Layout from '../Layout'
import { server } from '../../mocks/server'
import { useAuthStore, useLoginModalStore } from '../../stores'
import en from '../../locales/en.json'

// 決策 15-1 第 3 點:開站與打開登入小視窗都不自動跳密碼管理器;passkey 失敗不轉錢包。
// 這裡用真的 Layout / LoginModal / usePasskeyLogin,只把瀏覽器的 WebAuthn 與錢包換成假的。
const { mockStartAuthentication, mockGetEthersProvider } = vi.hoisted(() => ({
  mockStartAuthentication: vi.fn(),
  mockGetEthersProvider: vi.fn(),
}))

vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: mockStartAuthentication,
  startRegistration: vi.fn(),
}))

vi.mock('../../wallet/getProvider', () => ({
  getEthersProvider: mockGetEthersProvider,
  disconnectWalletSession: vi.fn(),
}))

vi.mock('../Nav', () => ({ default: () => <nav data-testid="nav" /> }))
vi.mock('../Footer', () => ({ default: () => <footer /> }))


const renderLayout = () => render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <IntlProvider locale="en" messages={en}>
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<div>home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </IntlProvider>
  </QueryClientProvider>
)

describe('passkey is never prompted on its own', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // react-hot-toast 的 Toaster 要 matchMedia,jsdom 沒有
    window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }))
    useAuthStore.setState({ isLoggedIn: false })
    useLoginModalStore.setState({ showLoginModal: false })
    server.use(
      http.get('*/csrf-cookie', () => HttpResponse.json({})),
      http.post('*/passkey-login-options', () => HttpResponse.json({ challenge: 'abc', rpId: 'localhost', userVerification: 'required' })),
    )
  })

  it('does not call the WebAuthn API on page load', async () => {
    renderLayout()

    expect(await screen.findByText('home')).toBeInTheDocument()
    expect(mockStartAuthentication).not.toHaveBeenCalled()
  })

  it('does not call the WebAuthn API just because the login modal opened', async () => {
    useLoginModalStore.setState({ showLoginModal: true })
    renderLayout()

    expect(await screen.findByRole('button', { name: en['login_modal.passkey_button'] })).toBeInTheDocument()
    expect(mockStartAuthentication).not.toHaveBeenCalled()
  })

  it('stays on the modal and never touches the wallet when the passkey prompt is cancelled', async () => {
    mockStartAuthentication.mockRejectedValue(Object.assign(new Error('cancelled'), { name: 'NotAllowedError' }))
    useLoginModalStore.setState({ showLoginModal: true })
    renderLayout()

    fireEvent.click(await screen.findByRole('button', { name: en['login_modal.passkey_button'] }))

    await waitFor(() => expect(mockStartAuthentication).toHaveBeenCalledTimes(1))
    expect(mockGetEthersProvider).not.toHaveBeenCalled()
    expect(useLoginModalStore.getState().showLoginModal).toBe(true)
    expect(useAuthStore.getState().isLoggedIn).toBe(false)
  })
})
