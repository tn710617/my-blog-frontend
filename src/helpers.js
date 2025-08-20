export function getCurrentUri(currentLocation) {
    const domain = import.meta.env.VITE_DOMAIN || import.meta.env.REACT_APP_DOMAIN
    return domain + currentLocation.pathname + currentLocation.search
}

export function getMetamaskDAppDeepLink(currentLocation) {
    return `https://metamask.app.link/dapp/${getCurrentUri(currentLocation)}`
}

// SSR-Safe localStorage helpers
const isClient = typeof window !== 'undefined'

export function isLoggedInInLocalStorage() {
    if (!isClient) return false
    try {
        return !!localStorage.getItem('learn_or_die_is_logged_in')
    } catch {
        return false
    }
}

export function loginInLocalStorage() {
    if (!isClient) return
    try {
        localStorage.setItem('learn_or_die_is_logged_in', true)
    } catch {
        // Silently fail
    }
}

export function logoutInLocalStorage() {
    if (!isClient) return
    try {
        localStorage.removeItem('learn_or_die_is_logged_in')
    } catch {
        // Silently fail
    }
}


