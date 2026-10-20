import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { make_theme, set_theme, type theme_family_t, type theme_mode_t } from '../lib/theme'
import { read_stored_theme, write_stored_theme } from '../lib/theme_store'

const theme_style_options = [
    { value: 'modern', label: 'Modern' },
    { value: 'sigma', label: 'Sigma' },
] as const

const appearance_mode_options = ['light', 'dark'] as const

const theme_style_storage_key = 'sigma.ui.theme_style'
const appearance_mode_storage_key = 'sigma.ui.appearance_mode'

function is_theme_style(value: string | null): value is theme_family_t {
    return theme_style_options.some((theme_style) => theme_style.value === value)
}

function is_appearance_mode(value: string | null): value is theme_mode_t {
    return appearance_mode_options.some((appearance_mode) => appearance_mode === value)
}

function parse_stored_theme(value: string | null): { theme_style: theme_family_t; appearance_mode: theme_mode_t } | undefined {
    if (!value)
        return undefined

    const [theme_style, appearance_mode] = value.split('-')

    if (!is_theme_style(theme_style) || !is_appearance_mode(appearance_mode))
        return undefined

    return { theme_style, appearance_mode }
}

export function ThemeSwitcher() {
    const [theme_style, set_theme_style] = useState<theme_family_t>(() => {
        const shared = parse_stored_theme(read_stored_theme())
        if (shared)
            return shared.theme_style

        const stored_theme_style = window.localStorage.getItem(theme_style_storage_key)
        return is_theme_style(stored_theme_style) ? stored_theme_style : 'modern'
    })
    const [appearance_mode, set_appearance_mode] = useState<theme_mode_t>(() => {
        const shared = parse_stored_theme(read_stored_theme())
        if (shared)
            return shared.appearance_mode

        const stored_appearance_mode = window.localStorage.getItem(appearance_mode_storage_key)
        return is_appearance_mode(stored_appearance_mode) ? stored_appearance_mode : 'light'
    })

    useEffect(() => {
        const theme = make_theme(theme_style, appearance_mode)
        set_theme(theme)
        write_stored_theme(theme)
        window.localStorage.setItem(theme_style_storage_key, theme_style)
        window.localStorage.setItem(appearance_mode_storage_key, appearance_mode)
    }, [theme_style, appearance_mode])

    const next_appearance_mode = appearance_mode === 'dark' ? 'light' : 'dark'
    const ThemeModeIcon = appearance_mode === 'dark' ? Moon : Sun

    return (
        <div className="ui-theme-switcher">
            <button
                type="button"
                className="ui-button ui-button-ghost ui-theme-mode-button"
                aria-label={`Switch to ${next_appearance_mode} mode`}
                title={`Switch to ${next_appearance_mode} mode`}
                onClick={() => set_appearance_mode(next_appearance_mode)}
            >
                <ThemeModeIcon aria-hidden="true" size={16} />
            </button>
            <select
                className="ui-control"
                aria-label="Theme style"
                value={theme_style}
                onChange={(event) => set_theme_style(event.target.value as theme_family_t)}
            >
                {theme_style_options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}
