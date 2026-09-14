import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  getBookingStats,
} from '../api/movies'
import { getErrorMessage } from '../api/client'

const emptyForm = {
  title: '',
  StreamingType: '',
  genre: '',
  duration: '',
  releaseDate: '',
  language: '',
  description: '',
  director: '',
  production: '',
  cast: '',
  poster_url: '',
  trailer_url: '',
}

// موديل Movie.js في الباك اند بيطلب كل الحقول دي required - راجعه لو حبيت تضيف
// حقول اختيارية.
function movieToForm(movie) {
  return {
    title: movie.title || '',
    StreamingType: movie.StreamingType || '',
    genre: movie.genre || '',
    duration: movie.duration || '',
    releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().slice(0, 10) : '',
    language: movie.language || '',
    description: movie.description || '',
    director: movie.director || '',
    production: movie.production || '',
    cast: movie.cast || '',
    poster_url: movie.poster_url || '',
    trailer_url: movie.trailer_url || '',
  }
}

function MovieForm({ form, onChange, onSubmit, saving, error }) {
  return (
    <form onSubmit={onSubmit} className="app-form">
      {error && <div className="form-error">{error}</div>}

      <label>Title</label>
      <input value={form.title} onChange={onChange('title')} required />

      <label>Streaming Type</label>
      <input
        value={form.StreamingType}
        onChange={onChange('StreamingType')}
        placeholder="e.g. 2D, 3D, IMAX"
        required
      />

      <label>Genre</label>
      <input value={form.genre} onChange={onChange('genre')} placeholder="e.g. Action" required />

      <label>Duration</label>
      <input value={form.duration} onChange={onChange('duration')} placeholder="e.g. 120 min" required />

      <label>Release Date</label>
      <input type="date" value={form.releaseDate} onChange={onChange('releaseDate')} required />

      <label>Language</label>
      <input value={form.language} onChange={onChange('language')} required />

      <label>Director</label>
      <input value={form.director} onChange={onChange('director')} required />

      <label>Production</label>
      <input value={form.production} onChange={onChange('production')} required />

      <label>Cast</label>
      <input value={form.cast} onChange={onChange('cast')} placeholder="Comma-separated names" required />

      <label>Description</label>
      <textarea rows={3} value={form.description} onChange={onChange('description')} required />

      <label>Poster URL</label>
      <input value={form.poster_url} onChange={onChange('poster_url')} required />

      <label>Trailer URL</label>
      <input value={form.trailer_url} onChange={onChange('trailer_url')} required />

      <button type="submit" className="gold-button" disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}

function AdminMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [editingMovie, setEditingMovie] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const [statsMovie, setStatsMovie] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')
  const [statsValue, setStatsValue] = useState(null)

  const loadMovies = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMovies()
      setMovies(Array.isArray(data) ? data : data?.movies || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load movies'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMovies()
  }, [loadMovies])

  const openAddModal = () => {
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
  }

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await createMovie(form)
      await loadMovies()
      setModalOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not create movie'))
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (movie) => {
    setEditingMovie(movie)
    setEditForm(movieToForm(movie))
    setEditError('')
  }

  const closeEditModal = () => {
    if (editSaving) return
    setEditingMovie(null)
  }

  const handleEditChange = (field) => (e) => setEditForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const id = editingMovie?._id || editingMovie?.id
    setEditSaving(true)
    setEditError('')
    try {
      await updateMovie(id, editForm)
      await loadMovies()
      setEditingMovie(null)
    } catch (err) {
      setEditError(getErrorMessage(err, 'Could not update movie'))
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async (movie) => {
    const id = movie._id || movie.id
    if (!window.confirm(`Delete "${movie.title}" and all its showtimes/bookings data?`)) return
    try {
      await deleteMovie(id)
      await loadMovies()
    } catch (err) {
      window.alert(getErrorMessage(err, 'Could not delete movie'))
    }
  }

  const openStats = async (movie) => {
    setStatsMovie(movie)
    setStatsLoading(true)
    setStatsError('')
    setStatsValue(null)
    try {
      const id = movie._id || movie.id
      const data = await getBookingStats(id)
      setStatsValue(data?.ticketCount ?? 0)
    } catch (err) {
      setStatsError(getErrorMessage(err, 'Could not load booking stats'))
    } finally {
      setStatsLoading(false)
    }
  }

  const closeStats = () => {
    setStatsMovie(null)
  }

  const filteredMovies = movies.filter((m) =>
    (m.title || '').toLowerCase().includes(search.trim().toLowerCase())
  )

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <h2>Manage Movies</h2>
          <p>Add, edit, and remove movies from the catalog</p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <input
            className="form-control"
            style={{ maxWidth: 220 }}
            placeholder="Filter by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="gold-button" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i>
            Add Movie
          </button>
        </div>
      </div>

      {loading && <LoadingState label="Loading movies..." />}
      {!loading && error && <ErrorState message={error} onRetry={loadMovies} />}
      {!loading && !error && filteredMovies.length === 0 && (
        <EmptyState message="No movies match your search." />
      )}

      {!loading && !error && filteredMovies.length > 0 && (
        <div className="dashboard-card">
          <div className="table-responsive">
            <table className="table booking-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Duration</th>
                  <th>Release Date</th>
                  <th>Language</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie) => {
                  const id = movie._id || movie.id
                  return (
                    <tr key={id}>
                      <td>
                        <strong>{movie.title}</strong>
                      </td>
                      <td>{movie.genre}</td>
                      <td>{movie.duration}</td>
                      <td>
                        {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : '—'}
                      </td>
                      <td>{movie.language}</td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => openStats(movie)} title="Booking stats">
                            <i className="fa-solid fa-chart-simple"></i>
                          </button>
                          <button onClick={() => openEditModal(movie)} title="Edit">
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="delete-button" onClick={() => handleDelete(movie)} title="Delete">
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
        <Modal title="Add Movie" onClose={closeModal} wide>
          <MovieForm form={form} onChange={handleChange} onSubmit={handleSubmit} saving={saving} error={formError} />
        </Modal>
      )}

      {editingMovie && (
        <Modal title={`Edit "${editingMovie.title}"`} onClose={closeEditModal} wide>
          <MovieForm
            form={editForm}
            onChange={handleEditChange}
            onSubmit={handleEditSubmit}
            saving={editSaving}
            error={editError}
          />
        </Modal>
      )}

      {statsMovie && (
        <Modal title={`Booking Stats — ${statsMovie.title}`} onClose={closeStats}>
          {statsLoading && <LoadingState label="Loading stats..." />}
          {!statsLoading && statsError && <ErrorState message={statsError} />}
          {!statsLoading && !statsError && (
            <div className="revenue-card">
              <span>Tickets Booked</span>
              <h3>{statsValue}</h3>
            </div>
          )}
        </Modal>
      )}
    </section>
  )
}

export default AdminMovies
