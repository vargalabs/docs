import { useParams } from 'react-router-dom'
import { Markdown } from '../components/markdown'
import { Sidebar } from '../components/sidebar'
import { find_page, find_section } from '../content/sections'
import { NotFoundPage } from './not_found_page'

export function DocPage() {
    const { section: section_slug, slug } = useParams()
    const section = find_section(section_slug)
    const page = section && slug ? find_page(section.slug, slug) : undefined

    if (!section || !page)
        return <NotFoundPage />

    return (
        <div className="docs-layout">
            <Sidebar section={section} />
            <main className="docs-content">
                <Markdown source={page.body} />
            </main>
        </div>
    )
}
