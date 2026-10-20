import { Link } from 'react-router-dom'

export function NotFoundPage() {
    return (
        <main className="ui-section">
            <div className="ui-section-header">
                <h1 className="ui-heading">Page not found</h1>
                <p className="ui-body">This page does not exist. <Link to="/">Go to the home page.</Link></p>
            </div>
        </main>
    )
}
