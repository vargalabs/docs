import { Link, useParams } from 'react-router-dom'
import { Markdown } from '../components/markdown'
import { Sidebar } from '../components/sidebar'
import { find_page, find_section, section_pages } from '../content/sections'
import { NotFoundPage } from './not_found_page'

export function SectionPage() {
    const { section: section_slug } = useParams()
    const section = find_section(section_slug)

    if (!section)
        return <NotFoundPage />

    const index = find_page(section.slug, '')
    const others = section_pages(section.slug).filter((page) => page.slug !== '')

    return (
        <div className="docs-layout">
            <Sidebar section={section} />
            <main className="docs-content">
                {index ? <Markdown source={index.body} /> : <h1 className="ui-heading">{section.title}</h1>}
                {others.length > 0 && (
                    <ul className="docs-index">
                        {others.map((page) => (
                            <li key={page.route}>
                                <Link to={page.route}>{page.title}</Link>
                                {page.summary && <span className="ui-muted"> — {page.summary}</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    )
}
