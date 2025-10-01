export function getCurrentUri(currentLocation) {
    const domain = import.meta.env.VITE_DOMAIN
    return domain + currentLocation.pathname + currentLocation.search
}

export function getMetamaskDAppDeepLink(currentLocation) {
    return `https://metamask.app.link/dapp/${getCurrentUri(currentLocation)}`
}

// Note: Authentication localStorage helpers have been removed.
// Authentication state is now managed through Zustand store with built-in persist.
// See useAuthStore in src/stores/index.js


