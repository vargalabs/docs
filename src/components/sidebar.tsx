import { NavLink } from 'react-router-dom'
import { section_pages, type section_t } from '../content/sections'

export function Sidebar({ section }: { section: section_t }) {
    return (
        <nav className="docs-sidebar" aria-label={`${section.title} pages`}>
            <div className="ui-eyebrow docs-sidebar-title">{section.title}</div>
            {section_pages(section.slug).map((page) => (
                <NavLink key={page.route} to={page.route} end className="docs-sidebar-link">
                    {page.title}
                </NavLink>
            ))}
        </nav>
    )
}
