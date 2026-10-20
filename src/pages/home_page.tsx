import { Link } from 'react-router-dom'
import { find_page, sections } from '../content/sections'

export function HomePage() {
    return (
        <main className="ui-section">
            <div className="ui-section-header">
                <h1 className="ui-heading">SIGMA Docs</h1>
                <p className="ui-body">Guides for SIGMA by VargaLABS. Pick a section to start.</p>
            </div>
            <div className="ui-grid docs-cards" style={{ ['--grid-cols-md' as string]: 3 }}>
                {sections.map((section) => {
                    const summary = find_page(section.slug, '')?.summary || section.description
                    return (
                        <Link key={section.slug} to={`/${section.slug}/`} className="ui-surface ui-surface-body docs-card">
                            <h2 className="ui-title docs-card-title">{section.title}</h2>
                            <p className="ui-muted">{summary}</p>
                        </Link>
                    )
                })}
            </div>
        </main>
    )
}
