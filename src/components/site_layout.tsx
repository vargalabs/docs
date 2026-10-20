import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './site_header'
import Footer from './site_footer'

export function SiteLayout() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

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
