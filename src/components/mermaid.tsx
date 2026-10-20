import { useEffect, useId, useState } from 'react'

function current_mermaid_theme(): 'dark' | 'neutral' {
    const theme = document.documentElement.getAttribute('data-theme') ?? ''
    return theme.endsWith('-dark') ? 'dark' : 'neutral'
}

export function Mermaid({ chart }: { chart: string }) {
    const id = `mermaid-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
    const [svg, set_svg] = useState('')
    const [error, set_error] = useState('')
    const [theme, set_theme] = useState(current_mermaid_theme)

    useEffect(() => {
        const observer = new MutationObserver(() => set_theme(current_mermaid_theme()))
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        let cancelled = false

        void (async () => {
            try {
                const { default: mermaid } = await import('mermaid')
                mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme })
                const result = await mermaid.render(id, chart)
                if (!cancelled) {
                    set_svg(result.svg)
                    set_error('')
                }
            } catch (cause) {
                document.getElementById(`d${id}`)?.remove()
                if (!cancelled)
                    set_error(cause instanceof Error ? cause.message : 'Diagram error')
            }
        })()

        return () => {
            cancelled = true
        }
    }, [chart, theme, id])

    if (error)
        return <pre className="docs-mermaid-error">{error}</pre>

    return <div className="docs-mermaid" role="img" aria-label="Diagram" dangerouslySetInnerHTML={{ __html: svg }} />
}
