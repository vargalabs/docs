export type front_matter_t = {
    data: Record<string, string>
    body: string
}

// Minimal "key: value" front matter between two --- lines. No nesting, no lists.
export function parse_front_matter(source: string): front_matter_t {
    const text = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
    const match = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(text)

    if (!match)
        return { data: {}, body: text }

    const data: Record<string, string> = {}
    for (const line of match[1].split('\n')) {
        const separator = line.indexOf(':')
        if (separator <= 0)
            continue
        const key = line.slice(0, separator).trim()
        let value = line.slice(separator + 1).trim()
        if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.endsWith(value[0]))
            value = value.slice(1, -1)
        data[key] = value
    }

    return { data, body: text.slice(match[0].length) }
}
