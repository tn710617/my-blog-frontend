export function getCurrentUri(currentLocation) {
    return process.env.REACT_APP_DOMAIN + currentLocation.pathname + currentLocation.search
}

export function getMetamaskDAppDeepLink(currentLocation) {
    return `https://metamask.app.link/dapp/${getCurrentUri(currentLocation)}`
}

export function isLoggedInInLocalStorage() {
    return !!localStorage.getItem('learn_or_die_is_logged_in')
}

export function loginInLocalStorage() {
    localStorage.setItem('learn_or_die_is_logged_in', true)
}

export function logoutInLocalStorage() {
    localStorage.removeItem('learn_or_die_is_logged_in')
}

export function getLocaleFromLocalStorage() {
    return localStorage.getItem('learn_or_die_locale')
}

export function setLocaleInLocalStorage(locale) {
    localStorage.setItem('learn_or_die_locale', locale)
}

export function cacheStorePostForm(form) {
    localStorage.setItem('learn_or_die_cached_post_form', JSON.stringify(form))
}

export function cacheEditPostForm(form, postId) {
    localStorage.setItem(`learn_or_die_cached_edit_form_${postId}`, JSON.stringify(form))
}

export function clearCachedEditPostForm(postId) {
    const cachedKey = `learn_or_die_cached_edit_form_${postId}`

    if (localStorage.getItem(cachedKey) === null) {
        return
    }

    localStorage.removeItem(cachedKey)
}

export function clearCachedStorePostForm() {
    if (localStorage.getItem('learn_or_die_cached_post_form') === null) {
        return
    }

    localStorage.removeItem('learn_or_die_cached_post_form')
}

export function getCachedEditPostForm(postId) {
    const cachedKey = `learn_or_die_cached_edit_form_${postId}`

    if (localStorage.getItem(cachedKey) === null) {
        return null
    }

    return JSON.parse(localStorage.getItem(cachedKey))
}

export function getCachedStorePostForm() {
    if (localStorage.getItem('learn_or_die_cached_post_form') === null) {
        return null
    }

    return JSON.parse(localStorage.getItem('learn_or_die_cached_post_form'))
}