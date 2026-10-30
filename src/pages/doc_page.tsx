import { useParams } from 'react-router-dom'
import { DocStructuredView } from '../components/doc_structured_view'
import { find_page, find_section } from '../content/sections'
import { NotFoundPage } from './not_found_page'

export function DocPage() {
    const { section: section_slug, slug } = useParams()
    const clean_section = section_slug?.replace(/^\/+|\/+$/g, '')
    const clean_slug = slug?.replace(/^\/+|\/+$/g, '')
    const section = find_section(clean_section)
    const page = section && clean_slug ? find_page(section.slug, clean_slug) : undefined

    if (!section || !page)
        return <NotFoundPage />

    return <DocStructuredView section={section} page={page} />
}
