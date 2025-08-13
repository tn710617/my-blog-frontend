export function getCurrentUri(currentLocation) {
    return process.env.REACT_APP_DOMAIN + currentLocation.pathname + currentLocation.search
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


export function cacheStorePostForm(form) {
    if (!isClient) return
    try {
        localStorage.setItem('learn_or_die_cached_post_form', JSON.stringify(form))
    } catch {
        // Silently fail
    }
}

export function cacheEditPostForm(form, postId) {
    if (!isClient) return
    try {
        localStorage.setItem(`learn_or_die_cached_edit_form_${postId}`, JSON.stringify(form))
    } catch {
        // Silently fail
    }
}

export function clearCachedEditPostForm(postId) {
    if (!isClient) return
    try {
        const cachedKey = `learn_or_die_cached_edit_form_${postId}`
        if (localStorage.getItem(cachedKey) === null) {
            return
        }
        localStorage.removeItem(cachedKey)
    } catch {
        // Silently fail
    }
}

export function clearCachedStorePostForm() {
    if (!isClient) return
    try {
        if (localStorage.getItem('learn_or_die_cached_post_form') === null) {
            return
        }
        localStorage.removeItem('learn_or_die_cached_post_form')
    } catch {
        // Silently fail
    }
}

export function getCachedEditPostForm(postId) {
    if (!isClient) return null
    try {
        const cachedKey = `learn_or_die_cached_edit_form_${postId}`
        if (localStorage.getItem(cachedKey) === null) {
            return null
        }
        return JSON.parse(localStorage.getItem(cachedKey))
    } catch {
        return null
    }
}

export function getCachedStorePostForm() {
    if (!isClient) return null
    try {
        if (localStorage.getItem('learn_or_die_cached_post_form') === null) {
            return null
        }
        return JSON.parse(localStorage.getItem('learn_or_die_cached_post_form'))
    } catch {
        return null
    }
}