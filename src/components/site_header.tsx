import { Link } from 'react-router-dom'
import { site_config } from '../content/site_config'
import { ThemeSwitcher } from './theme_switcher'

export default function Header() {
    return (
        <header className="ui-header docs-header sticky top-0 z-10">
            <div className="ui-container docs-header-content">
                <Link to="/" className="ui-row docs-brand-link">
                    <span className="vargalabs-logo" role="img" aria-label="VargaLABS" />
                </Link>
                <div className="docs-header-actions">
                    <nav className="ui-nav docs-nav" aria-label="Primary navigation">
                        {site_config.primary_navigation.map((link) => (
                            <Link key={link.href} to={link.href} className="ui-link">{link.label}</Link>
                        ))}
                    </nav>
                    <a href={site_config.store_link.href} className="ui-button ui-button-primary docs-store-link">{site_config.store_link.label}</a>
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    )
}
