import { useAuth } from '../context/AuthContext'

function Topbar() {
  const { user } = useAuth()
  const displayName = user?.name || user?.fullName || 'Theater Owner'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="topbar">
      <div>
        <h5>Owner Dashboard</h5>
        <p>Manage your cinema easily</p>
      </div>

      <div className="topbar-actions">
        <button className="icon-button">
          <i className="fa-regular fa-bell"></i>
        </button>

        <div className="profile">
          <div className="profile-avatar">{initials || 'TO'}</div>

          <div>
            <strong>{displayName}</strong>
            <small>Owner</small>
          </div>

          <i className="fa-solid fa-chevron-down"></i>
        </div>
      </div>
    </header>
  )
}

export default Topbar
