import { Routes, Route } from 'react-router-dom'

import App from '../App'
import Dashboard from '../Dashboard'
import DashboardAlternative from '../Dashboard_Alternative'

export default function AppRoutes() {

    return (
        <Routes>
            <Route path='/' element={<App />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/dashboardalternative' element={<DashboardAlternative />} />
        </Routes>
    )
}