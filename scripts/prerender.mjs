// Post-build step for GitHub Pages: copy the app shell to one index.html per route,
// so deep links answer 200, plus 404.html and CNAME.
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const content = join(root, 'content')
const shell = join(dist, 'index.html')

const routes = new Set()
for (const section of readdirSync(content, { withFileTypes: true })) {
    if (!section.isDirectory())
        continue
    const files = readdirSync(join(content, section.name)).filter((name) => name.endsWith('.md'))
    if (files.length === 0)
        continue
    routes.add(section.name)
    for (const file of files) {
        const slug = file.slice(0, -3)
        if (slug !== 'index')
            routes.add(`${section.name}/${slug}`)
    }
}

for (const route of routes) {
    mkdirSync(join(dist, route), { recursive: true })
    copyFileSync(shell, join(dist, route, 'index.html'))
}

copyFileSync(shell, join(dist, '404.html'))
writeFileSync(join(dist, 'CNAME'), 'docs.vargalabs.com\n')
console.log(`prerender: ${routes.size} routes, 404.html, CNAME`)
