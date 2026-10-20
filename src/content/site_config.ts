export type site_link_t = {
    label: string
    href: string
    external?: boolean
}

export const site_config = {
    site_name: 'SIGMA Docs',
    brand_tagline: 'Documentation for SIGMA by VargaLABS',
    contact_email: 'info@vargalabs.com',
    primary_navigation: [
        { label: 'SIGMA', href: '/sigma/' },
        { label: 'sigma-aid', href: '/sigma-aid/' },
        { label: 'sigma-ide', href: '/sigma-ide/' },
        { label: 'Store', href: 'https://store.vargalabs.com', external: true },
    ] satisfies site_link_t[],
    footer_links: [
        { label: 'Privacy', href: 'https://vargalabs.com/privacy/', external: true },
        { label: 'Terms', href: 'https://vargalabs.com/terms/', external: true },
    ] satisfies site_link_t[],
}
