import { getCurrentUri, getMetamaskDAppDeepLink } from './helpers'

describe('helpers: URI builders', () => {
  const originalEnv = process.env.REACT_APP_DOMAIN
  const location = { pathname: '/foo', search: '?a=1&b=2' }

  beforeEach(() => {
    process.env.REACT_APP_DOMAIN = 'https://example.com'
  })

  afterEach(() => {
    process.env.REACT_APP_DOMAIN = originalEnv
  })

  it('builds current URI from location', () => {
    expect(getCurrentUri(location)).toBe('https://example.com/foo?a=1&b=2')
  })

  it('builds MetaMask deep link from current URI', () => {
    expect(getMetamaskDAppDeepLink(location)).toBe(
      'https://metamask.app.link/dapp/https://example.com/foo?a=1&b=2'
    )
  })
})

