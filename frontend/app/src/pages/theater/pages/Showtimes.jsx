import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import TheaterSwitcher from '../components/TheaterSwitcher'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import { useTheaters } from '../context/TheaterContext'
import { getScreens } from '../api/screens'
import { getMovies } from '../api/movies'
import {
  getShowtimesByTheater,
  createShowtime,
  updateShowtime,
  cancelShowtime,
  deleteShowtime,
} from '../api/showtimes'
import { getErrorMessage } from '../api/client'

const emptyForm = { movieId: '', screenId: '', date: '', startTime: '', language: '' }
const emptyEditForm = { date: '', startTime: '', language: '' }

// Backend expects a single ISO 8601 `startTime` (see API_DOCUMENTATION.md),
// not separate date/time strings — combine the two form inputs here.
function toIsoStartTime(date, time) {
  if (!date || !time) return ''
  return new Date(`${date}T${time}`).toISOString()
}

function Showtimes() {
  const { theaters, selectedTheaterId, loading: theatersLoading } = useTheaters()

  const [showtimes, setShowtimes] = useState([])
  const [screens, setScreens] = useState([])
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [editingShowtime, setEditingShowtime] = useState(null)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const loadData = useCallback(async () => {
    if (!selectedTheaterId) return
    setLoading(true)
    setError('')
    try {
      const [showtimesData, screensData, moviesData] = await Promise.all([
        getShowtimesByTheater(selectedTheaterId),
        getScreens(selectedTheaterId),
        getMovies(),
      ])
      setShowtimes(Array.isArray(showtimesData) ? showtimesData : showtimesData?.showtimes || [])
      setScreens(Array.isArray(screensData) ? screensData : screensData?.screens || [])
      setMovies(Array.isArray(moviesData) ? moviesData : moviesData?.movies || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load showtimes'))
    } finally {
      setLoading(false)
    }
  }, [selectedTheaterId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openAddModal = () => {
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await createShowtime({
        theaterId: selectedTheaterId,
        movieId: form.movieId,
        screenId: form.screenId,
        startTime: toIsoStartTime(form.date, form.startTime),
        ...(form.language ? { language: form.language } : {}),
      })
      await loadData()
      setModalOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save showtime'))
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (showtime) => {
    const start = showtime.start_time ? new Date(showtime.start_time) : null
    setEditingShowtime(showtime)
    setEditForm({
      date: start ? start.toISOString().slice(0, 10) : '',
      startTime: start ? start.toTimeString().slice(0, 5) : '',
      language: showtime.language || '',
    })
    setEditError('')
  }

  const closeEditModal = () => {
    if (editSaving) return
    setEditingShowtime(null)
  }

  const handleEditChange = (field) => (e) => {
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const id = editingShowtime?._id || editingShowtime?.id
    setEditSaving(true)
    setEditError('')
    try {
      await updateShowtime(id, {
        startTime: toIsoStartTime(editForm.date, editForm.startTime),
        language: editForm.language,
      })
      await loadData()
      setEditingShowtime(null)
    } catch (err) {
      setEditError(getErrorMessage(err, 'Could not update showtime'))
    } finally {
      setEditSaving(false)
    }
  }

  const handleCancel = async (showtime) => {
    const id = showtime._id || showtime.id
    if (!window.confirm('Cancel this showtime?')) return
    try {
      await cancelShowtime(id)
      await loadData()
    } catch (err) {
      window.alert(getErrorMessage(err, 'Could not cancel showtime'))
    }
  }

  const handleDelete = async (showtime) => {
    const id = showtime._id || showtime.id
    if (!window.confirm('Permanently delete this showtime? This requires admin rights.')) return
    try {
      await deleteShowtime(id)
      await loadData()
    } catch (err) {
      window.alert(getErrorMessage(err, 'Could not delete showtime'))
    }
  }

  if (theatersLoading) return <LoadingState label="Loading theaters..." />

  if (theaters.length === 0) {
    return (
      <section className="page-content">
        <EmptyState message="Add a theater first from the Theaters page." />
      </section>
    )
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <h2>Manage Showtimes</h2>
          <p>Create and manage movie showtimes</p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <TheaterSwitcher />
          <button className="gold-button" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i>
            Add Showtime
          </button>
        </div>
      </div>

      {loading && <LoadingState label="Loading showtimes..." />}
      {!loading && error && <ErrorState message={error} onRetry={loadData} />}
      {!loading && !error && showtimes.length === 0 && (
        <EmptyState message="No showtimes scheduled for this theater yet." />
      )}

      {!loading && !error && showtimes.length > 0 && (
        <div className="dashboard-card">
          <div className="table-responsive">
            <table className="table booking-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Screen</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {showtimes.map((showtime) => {
                  const id = showtime._id || showtime.id
                  // getShowtimesByTheater populates movie_id/screen_id and returns a
                  // single start_time Date — see services/showTimeService.js
                  const start = showtime.start_time ? new Date(showtime.start_time) : null
                  return (
                    <tr key={id}>
                      <td>
                        <strong>{showtime.movie_id?.title || '—'}</strong>
                      </td>

                      <td>{showtime.screen_id?.screenName || '—'}</td>

                      <td>{start ? start.toLocaleDateString() : '—'}</td>

                      <td>
                        <span className="time-badge">
                          {start
                            ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </span>
                      </td>

                      <td>{showtime.language || '—'}</td>

                      <td>
                        <span
                          className={
                            showtime.status === 'cancelled'
                              ? 'status pending'
                              : 'status confirmed'
                          }
                        >
                          {showtime.status || 'Scheduled'}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button onClick={() => openEditModal(showtime)} title="Edit">
                            <i className="fa-solid fa-pen"></i>
                          </button>

                          <button onClick={() => handleCancel(showtime)} title="Cancel">
                            <i className="fa-solid fa-ban"></i>
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDelete(showtime)}
                            title="Delete permanently"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <Modal title="Add Showtime" onClose={closeModal}>
          <form onSubmit={handleSubmit} className="app-form">
            {formError && <div className="form-error">{formError}</div>}

            <label>Movie</label>
            <select value={form.movieId} onChange={handleChange('movieId')} required>
              <option value="" disabled>
                Select a movie
              </option>
              {movies.map((movie) => {
                const id = movie._id || movie.id
                return (
                  <option key={id} value={id}>
                    {movie.title}
                  </option>
                )
              })}
            </select>

            <label>Screen</label>
            <select value={form.screenId} onChange={handleChange('screenId')} required>
              <option value="" disabled>
                Select a screen
              </option>
              {screens.map((screen) => {
                const id = screen._id || screen.id
                return (
                  <option key={id} value={id}>
                    {screen.screenName}
                  </option>
                )
              })}
            </select>

            <label>Date</label>
            <input type="date" value={form.date} onChange={handleChange('date')} required />

            <label>Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={handleChange('startTime')}
              required
            />

            <label>Language (optional)</label>
            <input
              value={form.language}
              onChange={handleChange('language')}
              placeholder="e.g. English"
            />

            <button type="submit" className="gold-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </Modal>
      )}

      {editingShowtime && (
        <Modal title="Edit Showtime" onClose={closeEditModal}>
          <form onSubmit={handleEditSubmit} className="app-form">
            {editError && <div className="form-error">{editError}</div>}

            <label>Date</label>
            <input
              type="date"
              value={editForm.date}
              onChange={handleEditChange('date')}
              required
            />

            <label>Time</label>
            <input
              type="time"
              value={editForm.startTime}
              onChange={handleEditChange('startTime')}
              required
            />

            <label>Language (optional)</label>
            <input
              value={editForm.language}
              onChange={handleEditChange('language')}
              placeholder="e.g. English"
            />

            <button type="submit" className="gold-button" disabled={editSaving}>
              {editSaving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </Modal>
      )}
    </section>
  )
}

export default Showtimes
