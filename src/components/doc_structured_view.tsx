import { ArrowRight, BookOpen, Columns, Cpu, Layers, Maximize2, Minimize2, ShieldCheck, Terminal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { type page_t, type section_t, section_pages, sections } from '../content/sections'
import { Markdown } from './markdown'
import { Mermaid } from './mermaid'

type parsed_subsection_t = {
    id: string
    title: string
    markdown: string
}

type parsed_section_t = {
    id: string
    index_label: string
    title: string
    lead_markdown: string
    subsections: parsed_subsection_t[]
}

type parsed_doc_t = {
    h1: string
    intro_markdown: string
    hero_mermaid?: string
    sections: parsed_section_t[]
}

type fullscreen_card_t = {
    badge: string
    title: string
    markdown?: string
    mermaid?: string
}

const short_tags_by_route: Record<string, string> = {
    '/sigma-aid/': 'OVERVIEW',
    '/sigma-aid/install/': 'INSTALL',
    '/sigma-aid/providers-and-keys/': 'PROVIDERS',
    '/sigma-aid/agents-and-roles/': 'AGENTS & ROLES',
    '/sigma-aid/tools-mcp-skills/': 'TOOLS & MCP',
    '/sigma-aid/configuration/': 'CONFIGURATION',
    '/sigma-aid/sigma-wsd/': 'SIGMA-WSD',
    '/sigma-aid/sigma-acp/': 'SIGMA-ACP',
    '/sigma-aid/security/': 'SECURITY',
    '/sigma-aid/licensing/': 'LICENSING',
    '/sigma-ide/': 'OVERVIEW',
    '/sigma-ide/install-and-run/': 'INSTALL',
    '/sigma-ide/features/': 'WORKSPACE',
    '/sigma-ide/connecting-to-sigma-aid/': 'CONNECTION',
    '/sigma-ide/deployment/': 'DEPLOYMENT',
    '/sigma/': 'OVERVIEW',
    '/sigma/getting-started/': 'GETTING STARTED',
    '/sigma/licensing/': 'LICENSING',
    '/sigma/team-setup/': 'TEAM SETUP',
    '/sigma/account-linking/': 'ACCOUNT LINKING',
    '/sigma/billing/': 'BILLING',
    '/sigma/privacy-and-data/': 'PRIVACY',
    '/sigma/account-and-linking/': 'ACCOUNT LINKING',
    '/sigma/licences-and-billing/': 'LICENCES',
    '/sigma/downloads-and-installation/': 'INSTALLATION',
}

function clean_heading_text(text: string): string {
    return text.replace(/`/g, '').trim()
}

function slugify_heading(text: string): string {
    return text
        .toLowerCase()
        .replace(/[`*_~]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function page_lens_tag(page: page_t, index: number): string {
    const num = String(index + 1).padStart(2, '0')
    const label = short_tags_by_route[page.route] ?? page.title.toUpperCase()
    return `${num} // ${label}`
}

function extract_first_mermaid(markdown: string): { cleaned: string; chart?: string } {
    const match = /```mermaid\n([\s\S]*?)```\n?/.exec(markdown)
    if (!match)
        return { cleaned: markdown.trim() }

    const cleaned = (markdown.slice(0, match.index) + markdown.slice(match.index + match[0].length)).trim()
    return { cleaned, chart: match[1].trim() }
}

function has_wide_block_content(markdown: string): boolean {
    if (markdown.includes('!['))
        return true
    if (/^\s*\|.+\|\s*$/m.test(markdown))
        return true
    const fence_match = /```[\s\S]*?```/.exec(markdown)
    if (fence_match && fence_match[0].split('\n').length > 8)
        return true
    return false
}

function strip_standalone_hr(lines: string[]): string[] {
    return lines.filter((line) => !/^\s*---\s*$/.test(line))
}

function parse_subsections(section_body: string): { lead_markdown: string; subsections: parsed_subsection_t[] } {
    const lines = strip_standalone_hr(section_body.split('\n'))
    const lead_lines: string[] = []
    const subsections: parsed_subsection_t[] = []

    let in_fence = false
    let current_title: string | undefined
    let current_lines: string[] = []

    const flush_subsection = () => {
        if (!current_title)
            return
        subsections.push({
            id: slugify_heading(current_title),
            title: clean_heading_text(current_title),
            markdown: current_lines.join('\n').trim(),
        })
        current_title = undefined
        current_lines = []
    }

    for (const line of lines) {
        if (/^```/.test(line.trim()))
            in_fence = !in_fence

        if (!in_fence && line.startsWith('### ')) {
            flush_subsection()
            current_title = line.slice(4).trim()
            continue
        }

        if (current_title)
            current_lines.push(line)
        else
            lead_lines.push(line)
    }

    flush_subsection()

    return {
        lead_markdown: lead_lines.join('\n').trim(),
        subsections,
    }
}

function parse_doc_markdown(source: string, fallback_title: string): parsed_doc_t {
    const lines = source.replace(/\r\n/g, '\n').split('\n')
    let h1 = fallback_title
    let h1_found = false
    let in_fence = false

    const intro_lines: string[] = []
    const raw_sections: { title: string; lines: string[] }[] = []
    let current_section: { title: string; lines: string[] } | undefined

    for (const line of lines) {
        if (/^```/.test(line.trim()))
            in_fence = !in_fence

        if (!in_fence && !h1_found && line.startsWith('# ')) {
            h1 = clean_heading_text(line.slice(2))
            h1_found = true
            continue
        }

        if (!in_fence && line.startsWith('## ')) {
            if (current_section)
                raw_sections.push(current_section)
            current_section = { title: clean_heading_text(line.slice(3)), lines: [] }
            continue
        }

        if (current_section)
            current_section.lines.push(line)
        else
            intro_lines.push(line)
    }

    if (current_section)
        raw_sections.push(current_section)

    const intro_extracted = extract_first_mermaid(intro_lines.join('\n').trim())
    let hero_mermaid = intro_extracted.chart

    const parsed_sections: parsed_section_t[] = raw_sections.map((raw, idx) => {
        const body_text = raw.lines.join('\n').trim()
        const { lead_markdown, subsections } = parse_subsections(body_text)
        let final_lead = lead_markdown

        if (!hero_mermaid && idx === 0) {
            const first_sec_mermaid = extract_first_mermaid(final_lead)
            if (first_sec_mermaid.chart) {
                hero_mermaid = first_sec_mermaid.chart
                final_lead = first_sec_mermaid.cleaned
            }
        }

        return {
            id: slugify_heading(raw.title),
            index_label: String(idx + 1).padStart(2, '0'),
            title: raw.title,
            lead_markdown: final_lead,
            subsections,
        }
    })

    return {
        h1,
        intro_markdown: intro_extracted.cleaned,
        hero_mermaid,
        sections: parsed_sections,
    }
}

const route_icons = [ ShieldCheck, Cpu, Layers, Terminal, BookOpen ]

export function DocStructuredView({ section, page }: { section: section_t; page: page_t }) {
    const all_section_pages = section_pages(section.slug)
    const active_index = Math.max(0, all_section_pages.findIndex((candidate) => candidate.route === page.route))
    const next_page = all_section_pages[(active_index + 1) % all_section_pages.length]
    const active_tag = page_lens_tag(page, active_index)
    const parsed = parse_doc_markdown(page.body, page.title)

    const [ expanded_cards, set_expanded_cards ] = useState<Record<string, boolean>>({})
    const [ fullscreen_card, set_fullscreen_card ] = useState<fullscreen_card_t | null>(null)

    useEffect(() => {
        if (!fullscreen_card)
            return
        const handle_keydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape')
                set_fullscreen_card(null)
        }
        window.addEventListener('keydown', handle_keydown)
        return () => window.removeEventListener('keydown', handle_keydown)
    }, [ fullscreen_card ])

    const toggle_inline_span = (card_id: string, default_wide: boolean) => {
        set_expanded_cards((prev) => {
            const current = prev[card_id] ?? default_wide
            return { ...prev, [card_id]: !current }
        })
    }

    return (
        <main className="docs-home">
            <section className="docs-home-hero">
                <div className="ui-section docs-hero-wrapper">
                    <nav className="docs-hero-lens-bar" aria-label={`${section.title} documentation navigation`}>
                        {all_section_pages.map((item, idx) => {
                            const is_active = item.route === page.route
                            return (
                                <Link
                                    key={item.route}
                                    to={item.route}
                                    className={`docs-hero-lens-tab docs-hero-lens-link ${is_active ? 'docs-hero-lens-tab-active' : ''}`}
                                    aria-current={is_active ? 'page' : undefined}
                                >
                                    <span className="docs-hero-lens-tag">{page_lens_tag(item, idx)}</span>
                                    <span className="docs-hero-lens-title">{item.title}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="docs-home-hero-grid">
                        <div className="ui-hero-copy">
                            <span className="ui-eyebrow">{section.title} // {active_tag}</span>
                            <h1 className="ui-hero-title">{parsed.h1}</h1>
                            {page.summary && (
                                <div className="docs-hero-question-block">
                                    <span className="docs-hero-question-label">DOCUMENTATION SCOPE</span>
                                    <p className="docs-hero-question-text">{page.summary}</p>
                                </div>
                            )}
                            {parsed.intro_markdown && (
                                <div className="ui-hero-body docs-hero-markdown">
                                    <Markdown source={parsed.intro_markdown} />
                                </div>
                            )}
                            <div className="docs-hero-controls-badge">
                                <code>
                                    {section.title.toUpperCase()} // {String(active_index + 1).padStart(2, '0')} OF {String(all_section_pages.length).padStart(2, '0')} GUIDES // {parsed.sections.length} {parsed.sections.length === 1 ? 'SECTION' : 'SECTIONS'}
                                </code>
                            </div>
                            <div className="ui-row docs-home-actions">
                                {parsed.sections.length > 0 && (
                                    <a className="ui-button ui-button-primary" href={`#${parsed.sections[0].id}`}>
                                        Explore {parsed.sections[0].title}
                                    </a>
                                )}
                                {next_page && next_page.route !== page.route && (
                                    <Link className="ui-button ui-button-secondary" to={next_page.route}>
                                        Next: {next_page.title} <ArrowRight aria-hidden="true" size={16} />
                                    </Link>
                                )}
                                <Link className="ui-button ui-button-secondary" to="/">
                                    Product family overview
                                </Link>
                            </div>
                        </div>

                        <aside className="docs-family-map docs-doc-map" aria-label="On this page">
                            {parsed.hero_mermaid && (
                                <div className="ui-surface ui-surface-body docs-doc-diagram-card">
                                    <div className="docs-card-header-bar">
                                        <span className="ui-eyebrow">Architecture boundary</span>
                                        <div className="docs-card-window-actions">
                                            <button
                                                type="button"
                                                className="docs-card-window-btn"
                                                onClick={() =>
                                                    set_fullscreen_card({
                                                        badge: `${section.title} // ARCHITECTURE`,
                                                        title: `${parsed.h1} — Architecture boundary`,
                                                        mermaid: parsed.hero_mermaid,
                                                    })
                                                }
                                                aria-label="Maximize architecture diagram to full screen"
                                                title="Full screen"
                                            >
                                                <Maximize2 size={14} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="docs-doc-diagram-body">
                                        <Mermaid chart={parsed.hero_mermaid} />
                                    </div>
                                </div>
                            )}
                            <div className="ui-surface ui-surface-body docs-doc-outline-card">
                                <div className="docs-doc-outline-header">
                                    <span className="docs-map-status">{section.title}</span>
                                    <span className="docs-journey-index">{active_tag}</span>
                                </div>
                                <h2 className="ui-subheading docs-doc-outline-title">On this page</h2>
                                {parsed.sections.length > 0 ? (
                                    <nav className="docs-doc-outline-list" aria-label="Page sections">
                                        {parsed.sections.map((sec) => (
                                            <a key={sec.id} href={`#${sec.id}`} className="docs-doc-outline-link">
                                                <span className="docs-doc-outline-index">{sec.index_label}</span>
                                                <span className="docs-doc-outline-label">{sec.title}</span>
                                                <ArrowRight aria-hidden="true" size={14} />
                                            </a>
                                        ))}
                                    </nav>
                                ) : (
                                    <p className="ui-body">{section.description}</p>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {parsed.sections.map((sec, sec_idx) => {
                const is_band = sec_idx % 2 === 1
                const has_subsections = sec.subsections.length > 0
                const has_image_subsection = sec.subsections.some((sub) => sub.markdown.includes('!['))
                const grid_cols_md = has_image_subsection
                    ? 1
                    : (sec.subsections.length === 2 || sec.subsections.length === 4 ? 2 : 3)

                return (
                    <section
                        key={sec.id}
                        id={sec.id}
                        className={is_band ? 'docs-solution-band docs-doc-band' : 'ui-section docs-home-section'}
                        aria-labelledby={`${sec.id}-heading`}
                    >
                        <div className={is_band ? 'ui-section' : undefined}>
                            <div className="ui-section-header">
                                <span className="ui-eyebrow">{sec.index_label} // {section.title}</span>
                                <h2 id={`${sec.id}-heading`} className="ui-heading">{sec.title}</h2>
                            </div>

                            {sec.lead_markdown && (
                                <div className="ui-surface ui-surface-body docs-doc-section-surface">
                                    <div className="docs-card-header-bar docs-section-surface-bar">
                                        <span className="ui-badge">{sec.index_label}</span>
                                        <div className="docs-card-window-actions">
                                            <button
                                                type="button"
                                                className="docs-card-window-btn"
                                                onClick={() =>
                                                    set_fullscreen_card({
                                                        badge: `${sec.index_label} // ${section.title}`,
                                                        title: sec.title,
                                                        markdown: sec.lead_markdown,
                                                    })
                                                }
                                                aria-label={`Maximize ${sec.title} to full screen`}
                                                title="Full screen"
                                            >
                                                <Maximize2 size={14} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                    <Markdown source={sec.lead_markdown} />
                                </div>
                            )}

                            {has_subsections && (
                                <div
                                    className="ui-grid docs-product-grid docs-doc-subsection-grid"
                                    style={{ ['--grid-cols-md' as string]: grid_cols_md }}
                                >
                                    {sec.subsections.map((sub, sub_idx) => {
                                        const card_key = `${sec.id}-${sub.id}`
                                        const badge_label = `${sec.index_label}.${sub_idx + 1}`
                                        const default_wide = grid_cols_md === 1 || has_wide_block_content(sub.markdown)
                                        const is_wide = expanded_cards[card_key] ?? default_wide

                                        return (
                                            <article
                                                key={sub.id}
                                                id={sub.id}
                                                className={`ui-surface ui-surface-body docs-product-card docs-doc-subsection-card ${is_wide ? 'docs-doc-subsection-card-wide' : ''}`}
                                            >
                                                <div className="docs-card-header-bar">
                                                    <span className="ui-badge">{badge_label}</span>
                                                    <div className="docs-card-window-actions">
                                                        {grid_cols_md > 1 && (
                                                            <button
                                                                type="button"
                                                                className={`docs-card-window-btn ${is_wide ? 'docs-card-window-btn-active' : ''}`}
                                                                onClick={() => toggle_inline_span(card_key, default_wide)}
                                                                aria-label={is_wide ? `Restore ${sub.title} to column width` : `Expand ${sub.title} across full row`}
                                                                title={is_wide ? 'Restore column width' : 'Span full row'}
                                                            >
                                                                <Columns size={14} aria-hidden="true" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="docs-card-window-btn"
                                                            onClick={() =>
                                                                set_fullscreen_card({
                                                                    badge: badge_label,
                                                                    title: sub.title,
                                                                    markdown: sub.markdown,
                                                                })
                                                            }
                                                            aria-label={`Maximize ${sub.title} to full screen`}
                                                            title="Full screen"
                                                        >
                                                            <Maximize2 size={14} aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h3 className="ui-subheading">{sub.title}</h3>
                                                <div className="docs-doc-card-prose">
                                                    <Markdown source={sub.markdown} />
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                )
            })}

            {fullscreen_card && (
                <div
                    className="docs-fullscreen-backdrop"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="docs-fullscreen-title"
                    onClick={(event) => {
                        if (event.target === event.currentTarget)
                            set_fullscreen_card(null)
                    }}
                >
                    <div className="ui-surface ui-surface-body docs-fullscreen-modal">
                        <div className="docs-fullscreen-header">
                            <div className="docs-fullscreen-title-group">
                                <span className="ui-badge">{fullscreen_card.badge}</span>
                                <h2 id="docs-fullscreen-title" className="ui-heading docs-fullscreen-heading">
                                    {fullscreen_card.title}
                                </h2>
                            </div>
                            <div className="docs-card-window-actions">
                                <button
                                    type="button"
                                    className="docs-card-window-btn docs-card-window-btn-active"
                                    onClick={() => set_fullscreen_card(null)}
                                    aria-label="Restore from full screen"
                                    title="Restore (Esc)"
                                >
                                    <Minimize2 size={15} aria-hidden="true" />
                                    <span className="docs-window-btn-label">Minimize</span>
                                </button>
                                <button
                                    type="button"
                                    className="docs-card-window-btn"
                                    onClick={() => set_fullscreen_card(null)}
                                    aria-label="Close full screen view"
                                    title="Close (Esc)"
                                >
                                    <X size={15} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                        <div className="docs-fullscreen-body">
                            {fullscreen_card.mermaid && (
                                <div className="docs-fullscreen-mermaid">
                                    <Mermaid chart={fullscreen_card.mermaid} />
                                </div>
                            )}
                            {fullscreen_card.markdown && (
                                <div className="docs-fullscreen-prose">
                                    <Markdown source={fullscreen_card.markdown} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <section className="ui-section docs-home-section" aria-labelledby="section-guides-heading">
                <div className="ui-section-header">
                    <span className="ui-eyebrow">{section.title} documentation</span>
                    <h2 id="section-guides-heading" className="ui-heading">All guides in {section.title}.</h2>
                    <p className="ui-body">{section.description}</p>
                </div>
                <div
                    className="ui-grid docs-journey-grid"
                    style={{ ['--grid-cols-md' as string]: 2, ['--grid-cols-lg' as string]: Math.min(4, all_section_pages.length) }}
                >
                    {all_section_pages.map((item, idx) => {
                        const Icon = route_icons[idx % route_icons.length]
                        const is_current = item.route === page.route
                        return (
                            <Link
                                key={item.route}
                                to={item.route}
                                className={`ui-select-card docs-journey-card ${is_current ? 'docs-journey-card-current' : ''}`}
                                data-route={(idx % 4) + 1}
                                aria-current={is_current ? 'page' : undefined}
                            >
                                <span className="docs-journey-index" aria-hidden="true">0{idx + 1}</span>
                                <span className="docs-journey-icon" aria-hidden="true"><Icon size={25} strokeWidth={1.7} /></span>
                                <span className="ui-eyebrow">{page_lens_tag(item, idx)}</span>
                                <h3 className="ui-subheading">{item.title}</h3>
                                <span className="ui-select-card-body">{item.summary || section.description}</span>
                                <span className="docs-journey-cue">{is_current ? 'Current guide' : section.title}</span>
                                <span className="docs-card-action">
                                    {is_current ? 'Reading now' : 'Open guide'} <ArrowRight aria-hidden="true" size={16} />
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </section>

            <section className="docs-roadmap-band" aria-labelledby="other-sections-heading">
                <div className="ui-section">
                    <div className="ui-section-header">
                        <span className="ui-eyebrow">Product family documentation</span>
                        <h2 id="other-sections-heading" className="ui-heading">Switch documentation area.</h2>
                        <p className="ui-body">Move between the daemon, the editor, account and licensing guides, or return to the evaluation lenses on the main page.</p>
                    </div>
                    <div className="ui-grid docs-product-grid" style={{ ['--grid-cols-md' as string]: 3 }}>
                        {sections.map((sec_item) => {
                            const is_active_section = sec_item.slug === section.slug
                            return (
                                <Link
                                    key={sec_item.slug}
                                    to={`/${sec_item.slug}/`}
                                    className={`ui-surface ui-surface-body docs-product-card ${is_active_section ? 'ui-surface-strong' : ''}`}
                                >
                                    <span className="ui-badge">{is_active_section ? 'Current section' : 'Documentation section'}</span>
                                    <h3 className="ui-subheading">{sec_item.title}</h3>
                                    <p className="ui-body">{sec_item.description}</p>
                                    <span className="docs-card-action">
                                        {is_active_section ? `View ${sec_item.title} overview` : `Open ${sec_item.title}`} <ArrowRight aria-hidden="true" size={16} />
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>
        </main>
    )
}
