export type theme_family_t = 'modern' | 'sigma'
export type theme_mode_t = 'light' | 'dark'
export type theme_t = `${theme_family_t}-${theme_mode_t}`

export function make_theme(family: theme_family_t, mode: theme_mode_t): theme_t {
    return `${family}-${mode}`
}

export function parse_theme(theme: theme_t): {
    family: theme_family_t
    mode: theme_mode_t
} {
    const [family, mode] = theme.split('-') as [theme_family_t, theme_mode_t]
    return { family, mode }
}

export function set_theme(theme: theme_t): void {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme.endsWith('-dark') ? 'dark' : 'light'
}