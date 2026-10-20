import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/site_layout'
import { HomePage } from './pages/home_page'
import { SectionPage } from './pages/section_page'
import { DocPage } from './pages/doc_page'
import { NotFoundPage } from './pages/not_found_page'

export default function App() {
    return (
        <Routes>
            <Route element={<SiteLayout />}>
                <Route index element={<HomePage />} />
                <Route path=":section" element={<SectionPage />} />
                <Route path=":section/:slug" element={<DocPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    )
}
