import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import SegmentsPage from './pages/SegmentsPage'
import ComposePage from './pages/ComposePage'
import CampaignPage from './pages/CampaignPage'
import AnalyticsPage from './pages/AnalyticsPage'
import JourneyPage from './pages/JourneyPage'

function App() {
  const location = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '240px', padding: '2rem 2.5rem', overflowY: 'auto' }}>
        <div
          key={location.pathname}
          className="animate-fade-in"
          style={{ minHeight: '100%' }}
        >
          <Routes>
            <Route index element={<SegmentsPage />} />
            <Route path="/audience" element={<SegmentsPage />} />
            <Route path="/compose/:id" element={<ComposePage />} />
            <Route path="/campaign" element={<CampaignPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/journey" element={<JourneyPage />} />
            <Route path="*" element={<Navigate to="/audience" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
