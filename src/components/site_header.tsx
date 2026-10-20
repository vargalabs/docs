import { Link } from 'react-router-dom'
import { site_config } from '../content/site_config'
import { ThemeSwitcher } from './theme_switcher'

export default function Header() {
    return (
        <header className="ui-header sticky top-0 z-10">
            <div className="ui-container ui-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" className="ui-row" style={{ alignItems: 'center', textDecoration: 'none' }}>
                    <img
                        className="ui-brand-logo sigma-logo-light"
                        src="/sigma-iam-solarized-light.svg"
                        alt={`${site_config.site_name} logo`}
                        width={28}
                        height={28}
                    />
                    <img
                        className="ui-brand-logo sigma-logo-dark"
                        src="/sigma-iam-solarized-dark.svg"
                        alt=""
                        width={28}
                        height={28}
                    />
                    <div>
                        <div className="ui-brand">{site_config.site_name}</div>
                        <div className="ui-caption docs-tagline">{site_config.brand_tagline}</div>
                    </div>
                </Link>
                <div className="ui-row" style={{ alignItems: 'center' }}>
                    <nav className="ui-nav docs-nav">
                        {site_config.primary_navigation.map((link) =>
                            link.external ? (
                                <a key={link.href} href={link.href} className="ui-link">{link.label}</a>
                            ) : (
                                <Link key={link.href} to={link.href} className="ui-link">{link.label}</Link>
                            ),
                        )}
                    </nav>
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    )
}
