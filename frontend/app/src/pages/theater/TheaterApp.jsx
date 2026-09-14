import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TheaterProvider } from './context/TheaterContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Theaters from './pages/Theaters'
import Screens from './pages/Screens'
import Showtimes from './pages/Showtimes'
import Bookings from './pages/Bookings'
import Refunds from './pages/Refunds'
import AdminMovies from './pages/AdminMovies'
import AdminOffers from './pages/AdminOffers'
import './theater.css'

function DashboardShell() {
  const { isAdmin } = useAuth()
  const [activePage, setActivePage] = useState(isAdmin ? 'Movies' : 'Dashboard')

  // لو نفس الحساب بقى فيه role مختلف بعد إعادة تحميل (نادر بس ممكن)، نرجّع
  // الصفحة الافتراضية المناسبة بدل ما نفضل واقفين على صفحة مش موجودة في المنيو بتاعه.
  useEffect(() => {
    setActivePage(isAdmin ? 'Movies' : 'Dashboard')
  }, [isAdmin])

  const renderPage = () => {
    if (isAdmin) {
      if (activePage === 'Movies') return <AdminMovies />
      if (activePage === 'Offers') return <AdminOffers />
      if (activePage === 'Refunds') return <Refunds />
      return <AdminMovies />
    }

    if (activePage === 'Dashboard') return <Dashboard />
    if (activePage === 'Theaters') return <Theaters />
    if (activePage === 'Screens') return <Screens />
    if (activePage === 'Showtimes') return <Showtimes />
    if (activePage === 'Bookings') return <Bookings />
    if (activePage === 'Refunds') return <Refunds />
    return <Dashboard />
  }

  return (
    <TheaterProvider>
      <div className="app">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

        <main className="main-content">
          <Topbar />
          {renderPage()}
        </main>
      </div>
    </TheaterProvider>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <DashboardShell /> : <Login />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
