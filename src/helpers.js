export function getCurrentUri(currentLocation) {
    return process.env.REACT_APP_DOMAIN + currentLocation.pathname + currentLocation.search
}

export function getMetamaskDAppDeepLink(currentLocation) {
    return `https://metamask.app.link/dapp/${getCurrentUri(currentLocation)}`
}

export function isLoginInLocalStorage() {
    return !!localStorage.getItem('is_logged_in_learn_or_die')
}

export function loginInLocalStorage() {
    localStorage.setItem('is_logged_in_learn_or_die', true)
}

export function logoutInLocalStorage() {
    localStorage.removeItem('is_logged_in_learn_or_die')
}

export function getLocaleFromLocalStorage() {
    return localStorage.getItem('locale_learn_or_die')
}

export function setLocaleInLocalStorage(locale) {
    localStorage.setItem('locale_learn_or_die', locale)
}