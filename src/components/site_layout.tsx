import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './site_header'
import Footer from './site_footer'

export function SiteLayout() {
    const { hash, key, pathname } = useLocation()

    useEffect(() => {
        if (hash) {
            try {
                document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
            }
            catch {
                return
            }
            return
        }
        window.scrollTo(0, 0)
    }, [hash, key, pathname])

    return (
        <div className="ui-page docs-shell">
            <Header />
            <div className="docs-main">
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}
