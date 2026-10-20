// The theme choice lives in a cookie on the parent domain, so every vargalabs.com
// site (store, store-dev, docs) shares it; localStorage is per origin and cannot.
// localStorage stays as the fallback for localhost and preview hosts.

const cookie_name = 'sigma_theme'
const legacy_storage_key = 'sigma.ui.theme'
const shared_domain = 'vargalabs.com'
const one_year_seconds = 60 * 60 * 24 * 365

function is_shared_host(hostname: string): boolean {
    return hostname === shared_domain || hostname.endsWith(`.${shared_domain}`)
}

function read_cookie(): string | null {
    for (const part of document.cookie.split(';')) {
        const [name, ...rest] = part.trim().split('=')
        if (name === cookie_name)
            return decodeURIComponent(rest.join('='))
    }
    return null
}

export function read_stored_theme(): string | null {
    return read_cookie() ?? window.localStorage.getItem(legacy_storage_key)
}

export function write_stored_theme(theme: string): void {
    window.localStorage.setItem(legacy_storage_key, theme)

    if (!is_shared_host(window.location.hostname))
        return

    document.cookie = [
        `${cookie_name}=${encodeURIComponent(theme)}`,
        `Domain=${shared_domain}`,
        'Path=/',
        `Max-Age=${one_year_seconds}`,
        'SameSite=Lax',
        'Secure',
    ].join('; ')
}
