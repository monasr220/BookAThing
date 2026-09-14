import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const OWNER_MENU = [
  { name: 'Dashboard', icon: 'fa-chart-pie' },
  { name: 'Theaters', icon: 'fa-building' },
  { name: 'Screens', icon: 'fa-tv' },
  { name: 'Showtimes', icon: 'fa-calendar-days' },
  { name: 'Bookings', icon: 'fa-ticket' },
  { name: 'Refunds', icon: 'fa-rotate-left' },
]

const ADMIN_MENU = [
  { name: 'Movies', icon: 'fa-film' },
  { name: 'Offers', icon: 'fa-tags' },
  { name: 'Refunds', icon: 'fa-rotate-left' },
]

function Sidebar({ activePage, setActivePage }) {
  const { logout, isAdmin, user } = useAuth()
  const menuItems = isAdmin ? ADMIN_MENU : OWNER_MENU

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <i className="fa-solid fa-clapperboard"></i>
        </div>
        <span>CINEMA</span>
      </div>

      <Link
        to="/"
        style={{ display: 'block', textAlign: 'center', fontSize: '0.8rem', color: '#999', marginBottom: '10px' }}
      >
        ← الموقع الرئيسي
      </Link>

      <div className="owner-box">
        <div className="owner-avatar">
          <i className="fa-solid fa-user"></i>
        </div>

        <div>
          <h6>{isAdmin ? 'Admin' : 'Theater Owner'}</h6>
          <small>{user?.name || user?.fullName || (isAdmin ? 'Administrator' : 'Owner')}</small>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`menu-item ${activePage === item.name ? 'active' : ''}`}
            onClick={() => setActivePage(item.name)}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="menu-item">
          <i className="fa-solid fa-gear"></i>
          <span>Settings</span>
        </button>

        <button className="menu-item" onClick={logout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
