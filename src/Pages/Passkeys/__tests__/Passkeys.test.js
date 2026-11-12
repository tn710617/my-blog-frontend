import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { vi } from 'vitest'
import Passkeys from '../index'
import en from '../../../locales/en.json'

const mockRegister = vi.fn()
const mockRename = vi.fn()
const mockDelete = vi.fn()
let mockPasskeys = []

vi.mock('../../../APIs/passkeys', () => ({
  usePasskeys: () => ({ isLoading: false, isError: false, isSuccess: true, data: mockPasskeys }),
  useRegisterPasskey: () => ({ mutateAsync: mockRegister, isPending: false }),
  useRenamePasskey: () => ({ mutateAsync: mockRename, isPending: false }),
  useDeletePasskey: () => ({ mutateAsync: mockDelete, isPending: false }),
}))

const passkey = (overrides) => ({
  id: 1,
  name: '1Password',
  created_at: '2026-11-01T08:00:00+00:00',
  last_used_at: null,
  is_current: false,
  ...overrides,
})

const wrap = (ui) => (
  <IntlProvider locale="en" messages={en}>{ui}</IntlProvider>
)

const rowOf = (name) => screen.getByText(name).closest('li')

describe('Passkeys page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRename.mockResolvedValue({})
    mockDelete.mockResolvedValue(undefined)
    mockRegister.mockResolvedValue({})
    mockPasskeys = [
      passkey({ id: 1, name: '1Password', last_used_at: '2026-11-10T09:30:00+00:00', is_current: true }),
      passkey({ id: 2, name: 'iCloud Keychain' }),
      passkey({ id: 3, name: 'Work laptop' }),
    ]
  })

  it('lists name, created time and last used time of each passkey', () => {
    render(wrap(<Passkeys />))

    const first = within(rowOf('1Password'))
    expect(first.getByText('2026-11-01 08:00')).toBeInTheDocument()
    expect(first.getByText('2026-11-10 09:30')).toBeInTheDocument()
    expect(first.getByText(en['passkeys.current_badge'])).toBeInTheDocument()

    expect(within(rowOf('iCloud Keychain')).getByText(en['passkeys.never_used'])).toBeInTheDocument()
  })

  it('has an add-passkey button that starts registration', () => {
    render(wrap(<Passkeys />))

    fireEvent.click(screen.getByRole('button', { name: en['passkeys.add_button'] }))

    expect(mockRegister).toHaveBeenCalledTimes(1)
  })

  it('renames a passkey', async () => {
    render(wrap(<Passkeys />))

    fireEvent.click(within(rowOf('Work laptop')).getByRole('button', { name: en['passkeys.rename_button'] }))
    const input = screen.getByLabelText(en['passkeys.name_label'])
    fireEvent.change(input, { target: { value: 'Home desktop' } })
    fireEvent.click(screen.getByRole('button', { name: en['passkeys.save_button'] }))

    await waitFor(() => expect(mockRename).toHaveBeenCalledWith({ id: 3, name: 'Home desktop' }))
  })

  it('deletes an ordinary passkey without extra confirmation', async () => {
    render(wrap(<Passkeys />))

    fireEvent.click(within(rowOf('Work laptop')).getByRole('button', { name: en['passkeys.delete_button'] }))

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(3))
  })

  it('asks again before deleting the passkey used for this session', async () => {
    render(wrap(<Passkeys />))

    fireEvent.click(within(rowOf('1Password')).getByRole('button', { name: en['passkeys.delete_button'] }))

    expect(mockDelete).not.toHaveBeenCalled()
    expect(await screen.findByText(en['passkeys.confirm_delete.current'])).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: en['passkeys.confirm_delete.confirm_button'] }))
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(1))
  })

  it('asks again before deleting the last passkey', async () => {
    mockPasskeys = [passkey({ id: 9, name: 'Only one' })]
    render(wrap(<Passkeys />))

    fireEvent.click(within(rowOf('Only one')).getByRole('button', { name: en['passkeys.delete_button'] }))

    expect(mockDelete).not.toHaveBeenCalled()
    expect(await screen.findByText(en['passkeys.confirm_delete.last'])).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: en['passkeys.confirm_delete.confirm_button'] }))
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(9))
  })

  it('shows an empty state with the add button when there are no passkeys', () => {
    mockPasskeys = []
    render(wrap(<Passkeys />))

    expect(screen.getByText(en['passkeys.empty'])).toBeInTheDocument()
    expect(screen.getByRole('button', { name: en['passkeys.add_button'] })).toBeInTheDocument()
  })
})
