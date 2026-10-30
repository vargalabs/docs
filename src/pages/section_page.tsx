import { useParams } from 'react-router-dom'
import { DocStructuredView } from '../components/doc_structured_view'
import { find_page, find_section, section_pages } from '../content/sections'
import { NotFoundPage } from './not_found_page'

export function SectionPage() {
    const { section: section_slug } = useParams()
    const clean_section = section_slug?.replace(/^\/+|\/+$/g, '')
    const section = find_section(clean_section)

    if (!section)
        return <NotFoundPage />

    const index = find_page(section.slug, '') ?? section_pages(section.slug)[0]
    if (!index)
        return <NotFoundPage />

    return <DocStructuredView section={section} page={index} />
}
