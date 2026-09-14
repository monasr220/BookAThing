import { useState } from 'react'
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
import './theater.css'

function DashboardShell() {
  const [activePage, setActivePage] = useState('Dashboard')

  const renderPage = () => {
    if (activePage === 'Dashboard') return <Dashboard />
    if (activePage === 'Theaters') return <Theaters />
    if (activePage === 'Screens') return <Screens />
    if (activePage === 'Showtimes') return <Showtimes />
    if (activePage === 'Bookings') return <Bookings />
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
