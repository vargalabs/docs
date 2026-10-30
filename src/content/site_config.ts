export type site_link_t = {
    label: string
    href: string
    external?: boolean
}

export const site_config = {
    site_name: 'VargaLABS',
    brand_tagline: 'Technical systems for work under your control',
    contact_email: 'info@vargalabs.com',
    primary_navigation: [
        { label: 'Products', href: '/#products' },
        { label: 'Solutions', href: '/#solutions' },
        { label: 'Verify', href: '/#verify' },
        { label: 'Documentation', href: '/#documentation' },
        { label: 'Roadmap', href: '/#roadmap' },
    ] satisfies site_link_t[],
    store_link: { label: 'Store', href: 'https://store-dev.vargalabs.com/', external: true } satisfies site_link_t,
    footer_links: [
        { label: 'Privacy', href: 'https://vargalabs.com/privacy/', external: true },
        { label: 'Terms', href: 'https://vargalabs.com/terms/', external: true },
    ] satisfies site_link_t[],
}
