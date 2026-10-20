import { parse_front_matter } from './front_matter'

export type section_t = {
    slug: string
    title: string
    description: string
}

export type page_t = {
    section: string
    slug: string
    title: string
    order: number
    summary: string
    body: string
    route: string
}

export const sections: section_t[] = [
    { slug: 'sigma', title: 'SIGMA', description: 'Getting started, licensing, billing, downloads and account linking.' },
    { slug: 'sigma-aid', title: 'sigma-aid', description: 'The sigma-aid daemon.' },
    { slug: 'sigma-ide', title: 'sigma-ide', description: 'The sigma-ide editor.' },
]

const raw_pages = import.meta.glob<string>('/content/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
})

function make_page(path: string, source: string): page_t | undefined {
    const match = /^\/content\/([^/]+)\/([^/]+)\.md$/.exec(path)
    if (!match)
        return undefined

    const [, section, file_slug] = match
    const { data, body } = parse_front_matter(source)
    const is_index = file_slug === 'index'
    const order = Number(data.order)

    return {
        section,
        slug: is_index ? '' : file_slug,
        title: data.title || file_slug,
        order: Number.isFinite(order) ? order : 1000,
        summary: data.summary ?? '',
        body,
        route: is_index ? `/${section}/` : `/${section}/${file_slug}/`,
    }
}

export const pages: page_t[] = Object.entries(raw_pages)
    .map(([path, source]) => make_page(path, source))
    .filter((page): page is page_t => page !== undefined)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export function find_section(slug: string | undefined): section_t | undefined {
    return sections.find((section) => section.slug === slug)
}

export function section_pages(section: string): page_t[] {
    return pages.filter((page) => page.section === section)
}

export function find_page(section: string, slug: string): page_t | undefined {
    return pages.find((page) => page.section === section && page.slug === slug)
}
