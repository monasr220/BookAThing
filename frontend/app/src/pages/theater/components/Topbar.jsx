import { useAuth } from '../context/AuthContext'

function Topbar() {
  const { user, isAdmin } = useAuth()
  const displayName = user?.name || user?.fullName || (isAdmin ? 'Admin' : 'Theater Owner')
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="topbar">
      <div>
        <h5>{isAdmin ? 'Admin Dashboard' : 'Owner Dashboard'}</h5>
        <p>{isAdmin ? 'Manage movies, offers, and refunds' : 'Manage your cinema easily'}</p>
      </div>

      <div className="topbar-actions">
        <button className="icon-button">
          <i className="fa-regular fa-bell"></i>
        </button>

        <div className="profile">
          <div className="profile-avatar">{initials || 'TO'}</div>

          <div>
            <strong>{displayName}</strong>
            <small>{isAdmin ? 'Admin' : 'Owner'}</small>
          </div>

          <i className="fa-solid fa-chevron-down"></i>
        </div>
      </div>
    </header>
  )
}

export default Topbar
