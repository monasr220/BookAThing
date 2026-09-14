import { useTheaters } from '../context/TheaterContext'

function TheaterSwitcher() {
  const { theaters, selectedTheaterId, setSelectedTheaterId, loading } =
    useTheaters()

  if (loading || theaters.length === 0) return null

  return (
    <select
      className="form-select theater-switcher"
      value={selectedTheaterId || ''}
      onChange={(e) => setSelectedTheaterId(e.target.value)}
    >
      {theaters.map((theater) => {
        const id = theater._id || theater.id
        return (
          <option key={id} value={id}>
            {theater.name}
          </option>
        )
      })}
    </select>
  )
}

export default TheaterSwitcher
