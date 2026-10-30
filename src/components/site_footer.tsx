import { site_config } from '../content/site_config'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="ui-footer">
            <div className="ui-container ui-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="ui-row" style={{ alignItems: 'center' }}>
                    <span className="vargalabs-logo vargalabs-logo-footer" role="img" aria-label="VargaLABS" />
                    <div>© {year}</div>
                </div>
                <nav className="ui-nav" aria-label="Footer navigation">
                    {site_config.footer_links.map((link) => (
                        <a key={link.href} href={link.href} className="ui-link">{link.label}</a>
                    ))}
                    <a href={`mailto:${site_config.contact_email}`} className="ui-link">{site_config.contact_email}</a>
                </nav>
            </div>
        </footer>
    )
}
