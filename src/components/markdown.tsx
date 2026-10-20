import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { Mermaid } from './mermaid'

export function Markdown({ source }: { source: string }) {
    return (
        <div className="docs-prose">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a({ href, children }) {
                        if (href && href.startsWith('/') && !href.startsWith('//'))
                            return <Link to={href}>{children}</Link>
                        return <a href={href}>{children}</a>
                    },
                    pre({ children }) {
                        return <>{children}</>
                    },
                    code({ className, children }) {
                        const text = String(children).replace(/\n$/, '')
                        const language = /language-([\w-]+)/.exec(className ?? '')?.[1]

                        if (language === 'mermaid')
                            return <Mermaid chart={text} />
                        if (language || text.includes('\n'))
                            return <pre className="docs-code"><code className={className}>{text}</code></pre>
                        return <code className="docs-inline-code">{children}</code>
                    },
                    table({ children }) {
                        return <div className="docs-table-wrap"><table>{children}</table></div>
                    },
                }}
            >
                {source}
            </ReactMarkdown>
        </div>
    )
}
