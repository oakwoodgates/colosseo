import { Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StrategiesPage from './pages/StrategiesPage'
import StrategyPage from './pages/StrategyPage'
import TradesPage from './pages/TradesPage'
import ArenasPage from './pages/ArenasPage'

function App() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="border-b border-border bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-text-primary">
            Colosseo
          </Link>
          <Link to="/strategies" className="text-text-secondary hover:text-text-primary">
            Strategies
          </Link>
          <Link to="/trades" className="text-text-secondary hover:text-text-primary">
            Trades
          </Link>
          <Link to="/arenas" className="text-text-secondary hover:text-text-primary">
            Arenas
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/strategies" element={<StrategiesPage />} />
          <Route path="/strategies/:id" element={<StrategyPage />} />
          <Route path="/trades" element={<TradesPage />} />
          <Route path="/arenas" element={<ArenasPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
