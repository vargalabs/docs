import { type KeyboardEvent, useState, useSyncExternalStore } from 'react'
import { ArrowRight, BookOpen, Cpu, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

type journey_t = {
    eyebrow: string
    title: string
    body: string
    href: string
    cue: string
    icon: typeof ShieldAlert
}

type product_t = {
    title: string
    body: string
    href: string
    status: string
}

type perspective_key_t = 'reliability' | 'control' | 'cost' | 'maintainability' | 'continuity'

type perspective_detail_t = {
    tag: string
    title: string
    eyebrow: string
    headline: string
    question_label: string
    question: string
    body: string[]
    controls_badge: string
    proof: {
        label: string
        href: string
    }
}

const perspective_keys: perspective_key_t[] = ['reliability', 'control', 'cost', 'maintainability', 'continuity']

const perspectives: Record<perspective_key_t, perspective_detail_t> = {
    reliability: {
        tag: '01 // RELIABILITY',
        title: 'Leave it to the AI',
        eyebrow: 'AI AGENTS IN REAL WORK',
        headline: 'An AI system as reliable as any other',
        question_label: 'THE RELIABILITY QUESTION',
        question: "What to do when you can't trust the result?",
        body: [
            'You ask for a small fix. The agent fixes it, rewrites the function you asked it to leave alone, and announces that the tests pass without running them. You were hoping to be at lunch by now.',
            'sigma-aid refuses file edits unless the session has already read the file and verified it has not changed on disk, then writes updates by atomic rename. Every tool call, delegation, and exit status is recorded to an append-only session tape that you can inspect in sigma-ide alongside the working-tree diff.',
            'The tape and file gates stop blind overwrites and show exactly what ran. Your compiler, test suite, and review still decide whether the fix is right.',
        ],
        controls_badge: 'INSPECT THE RECORDED RUN BEFORE YOU MERGE',
        proof: {
            label: 'See what Agent Activity records',
            href: '/sigma-ide/features/',
        },
    },
    control: {
        tag: '02 // CONTROL',
        title: 'Tools with real permissions',
        eyebrow: 'WHEN THE AGENT CAN MAKE CHANGES',
        headline: 'Know what the agent can touch before it starts.',
        question_label: 'THE CONTROL QUESTION',
        question: 'What are you willing to let it change?',
        body: [
            'An agent is only useful once it can edit files, run a build, or commit to a branch. Finding out where its permissions end by watching it work means finding out after the command has already run.',
            'In sigma-aid, read, write, subprocess, and git authority are configured as separate grants, and file paths are confined relative to the workspace root. Irreversible actions such as opening a pull request or resetting a branch pause for explicit user approval, where a timeout counts as a refusal.',
            'Subprocess tools still run as the daemon user inside the configured root unless subprocess sandboxing is enabled for the deployment.',
        ],
        controls_badge: 'SET GRANTS AND APPROVAL BOUNDARIES UP FRONT',
        proof: {
            label: 'Read the tool grants',
            href: '/sigma-aid/tools-mcp-skills/',
        },
    },
    cost: {
        tag: '03 // COST',
        title: 'Retries that keep spending',
        eyebrow: 'THE COST OF AN UNFINISHED TASK',
        headline: 'A stuck loop burns tokens until something stops it.',
        question_label: 'THE COST QUESTION',
        question: 'How do I see what a task is spending, and which limits stop a runaway turn?',
        body: [
            'When an agent gets stuck on a failing compiler error, each retry sends the growing transcript back to the provider. By the time it gives up, you have paid for twenty variations of the same mistake and still have a broken build.',
            'sigma-aid enforces per-turn output token caps, delegation-tree token budgets, nano-USD spend limits, and recursion depth caps in the daemon, while ordering static instructions ahead of dynamic context so repeated turns hit provider prompt caches. In sigma-ide, the status bar tracks live token deltas, context-window fill, and remaining subscription quotas as the turn runs.',
            'Metered caps rely on configured per-million-token model rates, and an unpriced metered model is refused when a money budget is active rather than allowed to spend silently.',
        ],
        controls_badge: 'BOUND DELEGATION DEPTH AND TURN BUDGETS',
        proof: {
            label: 'Read the limit settings',
            href: '/sigma-aid/configuration/',
        },
    },
    maintainability: {
        tag: '04 // MAINTAINABILITY',
        title: 'After the code is generated',
        eyebrow: 'THE WORK AFTER THE PROTOTYPE',
        headline: 'The code arrived in minutes. Your team owns it for years.',
        question_label: 'THE MAINTAINABILITY QUESTION',
        question: 'Can we review and change this code safely after the chat is over?',
        body: [
            'Generating five hundred lines takes less than a minute. Explaining during an incident why a dependency changed or why an edge case disappeared takes considerably longer.',
            'sigma-ide keeps Git inspection next to the conversation: a Working Tree view for staging and amending, a multi-branch Commit Graph with file diffs, and /diff and /review commands that check the current worktree before anything is committed.',
            'Keeping the diff beside the prompt makes the review faster, but your team still owns every line that lands on the branch.',
        ],
        controls_badge: 'REVIEW DIFFS AND COMMIT HISTORY IN WORKSPACE',
        proof: {
            label: 'Read about the source control views',
            href: '/sigma-ide/features/',
        },
    },
    continuity: {
        tag: '05 // CONTINUITY',
        title: 'Picking up the work tomorrow',
        eyebrow: 'WHEN THE WORK CONTINUES TOMORROW',
        headline: 'How much of today’s context survives until tomorrow?',
        question_label: 'THE CONTINUITY QUESTION',
        question: 'Can I resume tomorrow, or hand work to a colleague, without starting over?',
        body: [
            'Closing an editor tab usually turns an afternoon of debugging into a cold start the next morning. The commit shows what changed, while the dead ends and the reason for the fix stay buried in a lost chat window.',
            'sigma-aid persists the session tape in SQLite or Redis and extracts verified long-term memories across sessions. Reopening a session in sigma-ide replays the transcript and tool activity from the daemon store rather than keeping state in the browser tab.',
            'Session replay and long-term memory recover what the agent tried and learned, while architectural decisions still belong in your repository.',
        ],
        controls_badge: 'REPLAY SESSIONS AND RETAIN VERIFIED MEMORY',
        proof: {
            label: 'Read about sessions',
            href: '/sigma-ide/features/',
        },
    },
}

type family_area_t = 'ai' | 'access' | 'compute' | 'research'

type family_area_detail_t = {
    title: string
    status: 'Available now' | 'Roadmap'
    body: string
    href?: string
}

const journeys: journey_t[] = [
    {
        eyebrow: 'The exposure',
        title: 'Review the architecture',
        body: 'Examine the daemon architecture and how the editor connects before deciding what work to delegate.',
        href: '#solutions',
        cue: 'From exposure to control',
        icon: ShieldAlert,
    },
    {
        eyebrow: 'The solution',
        title: 'Explore the workspace',
        body: 'Read about the sigma-aid daemon and its connected sigma-ide development environment.',
        href: '#products',
        cue: 'Meet the documented products',
        icon: Cpu,
    },
    {
        eyebrow: 'Proof of claims',
        title: 'Verify the foundation',
        body: 'Review the local client connection and provider configuration. Check the details before granting access.',
        href: '#verify',
        cue: 'Evidence before commitment',
        icon: ShieldCheck,
    },
    {
        eyebrow: 'Production adoption',
        title: 'Read the setup guides',
        body: 'Review installation, account linking and licensing requirements before setting up your workspace.',
        href: '/sigma/',
        cue: 'Understand the setup requirements',
        icon: BookOpen,
    },
]

const available_products: product_t[] = [
    {
        title: 'sigma-aid daemon',
        body: 'A local daemon that connects clients to model providers, tools and local storage.',
        href: '/sigma-aid/',
        status: 'Documentation available',
    },
    {
        title: 'sigma-ide editor',
        body: 'A Theia-based development environment that connects to the sigma-aid daemon.',
        href: '/sigma-ide/',
        status: 'Documentation available',
    },
    {
        title: 'SIGMA account and licences',
        body: 'Getting started, account linking, billing and licence documentation.',
        href: '/sigma/',
        status: 'Documentation available',
    },
]

const roadmap_products = [
    ['Secure access and workspaces', 'Identity, access and browser-workspace services.'],
    ['Compute and data', 'Job management and storage for technical workloads.'],
    ['Research and trade', 'Research, backtesting and market-data systems.'],
]

const family_areas: Record<family_area_t, family_area_detail_t> = {
    ai: {
        title: 'Build with AI',
        status: 'Available now',
        body: 'Explore the documented sigma-aid daemon, its model-provider configuration and the connected sigma-ide workspace.',
        href: '#products',
    },
    access: {
        title: 'Secure access and workspaces',
        status: 'Roadmap',
        body: 'Identity, access and browser-workspace services are in development. Start with the available AI workspace documentation today.',
    },
    compute: {
        title: 'Compute and data',
        status: 'Roadmap',
        body: 'Job management and storage for technical workloads are part of the VargaLABS direction. They are not available products on this page.',
    },
    research: {
        title: 'Research and trade',
        status: 'Roadmap',
        body: 'Research, backtesting and market-data systems are on the roadmap. Their scope and availability will be documented when they are ready.',
    },
}

const compact_layout_query = '(max-width: 520px)'

function subscribeToCompactLayout(callback: () => void) {
    const media_query = window.matchMedia(compact_layout_query)
    media_query.addEventListener('change', callback)
    return () => media_query.removeEventListener('change', callback)
}

function getCompactLayoutSnapshot() {
    return window.matchMedia(compact_layout_query).matches
}

function getServerCompactLayoutSnapshot() {
    return false
}

function isActivationKey(event: KeyboardEvent<SVGGElement>) {
    return event.key === 'Enter' || event.key === ' '
}

function FamilyMap() {
    const [selected_area, setSelectedArea] = useState<family_area_t>('ai')
    const is_compact = useSyncExternalStore(subscribeToCompactLayout, getCompactLayoutSnapshot, getServerCompactLayoutSnapshot)
    const selected = family_areas[selected_area]

    const selectArea = (area: family_area_t) => {
        setSelectedArea(area)
    }

    const selectWithKeyboard = (event: KeyboardEvent<SVGGElement>, area: family_area_t) => {
        if (!isActivationKey(event)) {
            return
        }
        event.preventDefault()
        selectArea(area)
    }

    return (
        <figure className="docs-family-map" aria-labelledby="family-map-title" aria-describedby="family-map-caption">
            <h2 id="family-map-title" className="docs-visually-hidden">VargaLABS product-family navigation</h2>
            <svg viewBox="0 0 640 440" role="group" aria-hidden={is_compact}>
                <defs>
                    <linearGradient id="family-path" x1="0" x2="1" y1="0" y2="1">
                        <stop stopColor="var(--color-accent)" offset="0" />
                        <stop stopColor="var(--color-accent-hover)" offset="1" />
                    </linearGradient>
                </defs>
                <path className="docs-map-link" d="M320 218 L165 112 M320 218 L480 112 M320 218 L165 334 M320 218 L480 334" aria-hidden="true" />
                <path className="docs-map-orbit" d="M320 74 A144 144 0 1 1 319 74" aria-hidden="true" />
                <g className="docs-map-node docs-map-node-core" aria-hidden="true">
                    <circle cx="320" cy="218" r="72" />
                    <path d="M294 218h52M320 192v52" />
                </g>
                <g
                    className={`docs-map-node docs-map-node-interactive docs-map-node-available ${selected_area === 'ai' ? 'docs-map-node-is-selected' : ''}`}
                    role="button"
                    tabIndex={is_compact ? -1 : 0}
                    aria-hidden={is_compact || undefined}
                    aria-label="Build with AI, available now"
                    aria-pressed={selected_area === 'ai'}
                    onClick={() => selectArea('ai')}
                    onKeyDown={(event) => selectWithKeyboard(event, 'ai')}
                >
                    <circle cx="165" cy="112" r="52" />
                    <path d="M141 112h48M165 88v48" />
                    <text className="docs-map-label" x="165" y="42" aria-hidden="true">Build with AI</text>
                </g>
                <g
                    className={`docs-map-node docs-map-node-interactive docs-map-node-roadmap ${selected_area === 'access' ? 'docs-map-node-is-selected' : ''}`}
                    role="button"
                    tabIndex={is_compact ? -1 : 0}
                    aria-hidden={is_compact || undefined}
                    aria-label="Secure access and workspaces, roadmap"
                    aria-pressed={selected_area === 'access'}
                    onClick={() => selectArea('access')}
                    onKeyDown={(event) => selectWithKeyboard(event, 'access')}
                >
                    <circle cx="480" cy="112" r="52" />
                    <path d="M458 100h44M458 124h44" />
                    <text className="docs-map-label" x="480" y="42" aria-hidden="true">Secure access and workspaces</text>
                </g>
                <g
                    className={`docs-map-node docs-map-node-interactive docs-map-node-roadmap ${selected_area === 'compute' ? 'docs-map-node-is-selected' : ''}`}
                    role="button"
                    tabIndex={is_compact ? -1 : 0}
                    aria-hidden={is_compact || undefined}
                    aria-label="Compute and data, roadmap"
                    aria-pressed={selected_area === 'compute'}
                    onClick={() => selectArea('compute')}
                    onKeyDown={(event) => selectWithKeyboard(event, 'compute')}
                >
                    <circle cx="165" cy="334" r="52" />
                    <path d="M143 346l18-28 25 20 16-25" />
                    <text className="docs-map-label" x="165" y="420" aria-hidden="true">Compute and data</text>
                </g>
                <g
                    className={`docs-map-node docs-map-node-interactive docs-map-node-roadmap ${selected_area === 'research' ? 'docs-map-node-is-selected' : ''}`}
                    role="button"
                    tabIndex={is_compact ? -1 : 0}
                    aria-hidden={is_compact || undefined}
                    aria-label="Research and trade, roadmap"
                    aria-pressed={selected_area === 'research'}
                    onClick={() => selectArea('research')}
                    onKeyDown={(event) => selectWithKeyboard(event, 'research')}
                >
                    <circle cx="480" cy="334" r="52" />
                    <path d="M458 346l15-34 17 22 12-20 20 32" />
                    <text className="docs-map-label" x="480" y="420" aria-hidden="true">Research and trade</text>
                </g>
                <text className="docs-map-label docs-map-label-core" x="320" y="308" aria-hidden="true">VargaLABS</text>
            </svg>
            <nav className="docs-map-mobile-nav" aria-label="Product-family areas">
                <button className={selected_area === 'ai' ? 'docs-map-mobile-active' : ''} type="button" aria-pressed={selected_area === 'ai'} onClick={() => selectArea('ai')}>Build with AI</button>
                <button className="docs-map-mobile-roadmap" type="button" aria-pressed={selected_area === 'access'} onClick={() => selectArea('access')}>Secure access and workspaces</button>
                <button className="docs-map-mobile-roadmap" type="button" aria-pressed={selected_area === 'compute'} onClick={() => selectArea('compute')}>Compute and data</button>
                <button className="docs-map-mobile-roadmap" type="button" aria-pressed={selected_area === 'research'} onClick={() => selectArea('research')}>Research and trade</button>
            </nav>
            <div className="docs-map-panel">
                <div>
                    <span className={`docs-map-status ${selected.status === 'Roadmap' ? 'docs-map-status-roadmap' : ''}`}>{selected.status}</span>
                    <h3>{selected.title}</h3>
                    <p>{selected.body}</p>
                </div>
                {selected.href ? (
                    <a className="docs-map-panel-action" href={selected.href}>
                        Explore product <ArrowRight aria-hidden="true" size={16} />
                    </a>
                ) : (
                    <a className="docs-map-panel-action" href="#roadmap">
                        View the roadmap <ArrowRight aria-hidden="true" size={16} />
                    </a>
                )}
            </div>
            <figcaption id="family-map-caption">
                <span className="docs-map-caption-wide">The VargaLABS product family: explore the AI workspace documentation and see which areas are on the roadmap.</span>
                <span className="docs-map-caption-compact">Explore the AI workspace documentation and the wider product roadmap.</span>
            </figcaption>
        </figure>
    )
}

export function HomePage() {
    const [selected_perspective, setSelectedPerspective] = useState<perspective_key_t>('reliability')
    const current_perspective = perspectives[selected_perspective]

    return (
        <main className="docs-home">
            <section className="docs-home-hero">
                <div className="ui-section docs-hero-wrapper">
                    <nav className="docs-hero-lens-bar" aria-label="Evaluation perspective">
                        {perspective_keys.map((key) => {
                            const p = perspectives[key]
                            const is_active = selected_perspective === key
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    className={`docs-hero-lens-tab ${is_active ? 'docs-hero-lens-tab-active' : ''}`}
                                    onClick={() => setSelectedPerspective(key)}
                                    aria-pressed={is_active}
                                >
                                    <span className="docs-hero-lens-tag">{p.tag}</span>
                                    <span className="docs-hero-lens-title">{p.title}</span>
                                </button>
                            )
                        })}
                    </nav>

                    <div className="docs-home-hero-grid">
                        <div className="ui-hero-copy">
                            <span className="ui-eyebrow">{current_perspective.eyebrow}</span>
                            <h1 className="ui-hero-title">{current_perspective.headline}</h1>
                            <div className="docs-hero-question-block">
                                <span className="docs-hero-question-label">{current_perspective.question_label}</span>
                                <p className="docs-hero-question-text">{current_perspective.question}</p>
                            </div>
                            <div className="ui-hero-body">
                                {current_perspective.body.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                                <p>
                                    <Link className="docs-card-action" to={current_perspective.proof.href}>
                                        {current_perspective.proof.label} <ArrowRight aria-hidden="true" size={16} />
                                    </Link>
                                </p>
                            </div>
                            <div className="docs-hero-controls-badge">
                                <code>{current_perspective.controls_badge}</code>
                            </div>
                            <div className="ui-row docs-home-actions">
                                <a className="ui-button ui-button-primary" href="#products">Explore the AI workspace</a>
                                <a className="ui-button ui-button-secondary" href="#verify">Read the technical details</a>
                            </div>
                        </div>
                        <FamilyMap />
                    </div>
                </div>
            </section>

            <section className="ui-section docs-home-section" aria-labelledby="start-heading">
                <div className="ui-section-header">
                    <span className="ui-eyebrow">Evaluate VargaLABS</span>
                    <h2 id="start-heading" className="ui-heading">Bring these questions to the workspace.</h2>
                    <p className="ui-body">sigma-aid is a daemon that runs on your machine. It routes requests to the AI providers you configure, runs tools for the model and keeps sessions and memory in the storage you configure. sigma-ide is a Theia-based editor that connects to the daemon over a Unix domain socket. Read how they fit together, then check the documented limits against the work you want to delegate.</p>
                </div>
                <div className="ui-grid docs-journey-grid" style={{ ['--grid-cols-md' as string]: 2, ['--grid-cols-lg' as string]: 4 }}>
                    {journeys.map((journey, index) => {
                        const Icon = journey.icon
                        return (
                            <a key={journey.title} className="ui-select-card docs-journey-card" data-route={index + 1} href={journey.href}>
                                <span className="docs-journey-index" aria-hidden="true">0{index + 1}</span>
                                <span className="docs-journey-icon" aria-hidden="true"><Icon size={25} strokeWidth={1.7} /></span>
                                <span className="ui-eyebrow">{journey.eyebrow}</span>
                                <h3 className="ui-subheading">{journey.title}</h3>
                                <span className="ui-select-card-body">{journey.body}</span>
                                <span className="docs-journey-cue">{journey.cue}</span>
                                <span className="docs-card-action">Explore <ArrowRight aria-hidden="true" size={16} /></span>
                            </a>
                        )
                    })}
                </div>
            </section>

            <section id="products" className="ui-section docs-home-section" aria-labelledby="products-heading">
                <div className="ui-section-header">
                    <span className="ui-eyebrow">Available documentation</span>
                    <h2 id="products-heading" className="ui-heading">Build with AI.</h2>
                    <p className="ui-body">Start with the documented parts of the family. Each page links to technical details rather than hiding them.</p>
                </div>
                <div className="ui-grid docs-product-grid" style={{ ['--grid-cols-md' as string]: 3 }}>
                    {available_products.map((product) => (
                        <Link key={product.title} to={product.href} className="ui-surface ui-surface-body docs-product-card">
                            <span className="ui-badge">{product.status}</span>
                            <h3 className="ui-subheading">{product.title}</h3>
                            <p className="ui-body">{product.body}</p>
                            <span className="docs-card-action">Open documentation <ArrowRight aria-hidden="true" size={16} /></span>
                        </Link>
                    ))}
                </div>
            </section>

            <section id="solutions" className="docs-solution-band" aria-labelledby="solutions-heading">
                <div className="ui-section docs-solution-grid">
                    <div>
                        <span className="ui-eyebrow">Guides to a solution</span>
                        <h2 id="solutions-heading" className="ui-heading">Begin with the operational problem.</h2>
                        <p className="ui-body">
                            Product pages tell you what a system does. Solution guides help you decide whether that system belongs in your work.
                        </p>
                    </div>
                    <div className="ui-stack docs-solution-links">
                        <Link to="/sigma-aid/" className="ui-surface ui-surface-body docs-solution-link">
                            <span className="ui-eyebrow">AI control</span>
                            <h3 className="ui-subheading">AI with visible operating boundaries</h3>
                            <p className="ui-body">Start with the daemon architecture, providers, clients and storage.</p>
                        </Link>
                        <Link to="/sigma-ide/" className="ui-surface ui-surface-body docs-solution-link">
                            <span className="ui-eyebrow">Engineering workflow</span>
                            <h3 className="ui-subheading">AI in the development workspace</h3>
                            <p className="ui-body">See how the editor and daemon connect through a local socket boundary.</p>
                        </Link>
                    </div>
                </div>
            </section>

            <section id="verify" className="ui-section docs-home-section" aria-labelledby="verify-heading">
                <div className="ui-section-header">
                    <span className="ui-eyebrow">Technical verification</span>
                    <h2 id="verify-heading" className="ui-heading">Inspect the foundation before you adopt it.</h2>
                    <p className="ui-body">Read the architecture and operating model. Product limits belong next to the claims they qualify.</p>
                </div>
                <div className="ui-grid docs-verify-grid" style={{ ['--grid-cols-md' as string]: 3 }}>
                    <Link to="/sigma-aid/" className="ui-panel docs-verify-card">
                        <h3 className="ui-subheading">Local client boundary</h3>
                        <p className="ui-body">The documented clients connect to the sigma-aid daemon through a Unix domain socket.</p>
                    </Link>
                    <Link to="/sigma-aid/providers-and-keys/" className="ui-panel docs-verify-card">
                        <h3 className="ui-subheading">Provider configuration</h3>
                        <p className="ui-body">Review provider and credential configuration before connecting a model account.</p>
                    </Link>
                    <Link to="/sigma-ide/" className="ui-panel docs-verify-card">
                        <h3 className="ui-subheading">Editor deployment</h3>
                        <p className="ui-body">Review browser and desktop deployment through the documented daemon connection.</p>
                    </Link>
                </div>
            </section>

            <section id="roadmap" className="docs-roadmap-band" aria-labelledby="roadmap-heading">
                <div className="ui-section">
                    <div className="ui-section-header">
                        <span className="ui-eyebrow">Roadmap</span>
                        <h2 id="roadmap-heading" className="ui-heading">The wider technical platform.</h2>
                        <p className="ui-body">These systems are part of the VargaLABS direction. They are not presented as available products on this page.</p>
                    </div>
                    <div className="ui-grid docs-roadmap-grid" style={{ ['--grid-cols-md' as string]: 3 }}>
                        {roadmap_products.map(([title, body]) => (
                            <article key={title} className="ui-surface ui-surface-body docs-roadmap-card">
                                <span className="ui-badge">In development</span>
                                <h3 className="ui-subheading">{title}</h3>
                                <p className="ui-body">{body}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="documentation" className="ui-section docs-home-section">
                <div className="ui-final-cta">
                    <span className="ui-eyebrow">Existing users</span>
                    <h2 className="ui-final-cta-heading">Open the documentation you need.</h2>
                    <p className="ui-final-cta-body">Installation, licensing, provider configuration and editor deployment are available in the current guides.</p>
                    <div className="ui-row docs-home-actions">
                        <Link className="ui-button docs-final-cta-primary" to="/sigma/">Open SIGMA guides</Link>
                        <a className="ui-button ui-button-secondary" href="https://store-dev.vargalabs.com/">Visit the store</a>
                    </div>
                </div>
            </section>
        </main>
    )
}
