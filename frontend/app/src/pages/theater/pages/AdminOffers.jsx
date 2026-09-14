import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import {
  getAllOffers,
  createOffer,
  updateOffer,
  deactivateOffer,
  deleteOffer,
} from '../api/offers'
import { getMovies } from '../api/movies'
import { getErrorMessage } from '../api/client'

const emptyForm = {
  title: '',
  type: 'promocode',
  code: '',
  conditionJson: '',
  scope: 'all',
  movieId: '',
  discountType: 'percentage',
  discountValue: '',
  startsAt: '',
  endAt: '',
}

// موديل Offer.js: condition لازم تكون Object (مش string) لو type='conditional'،
// فبنخليها JSON بيتكتب في textarea وبنعمله parse قبل الإرسال - راجع Offer.js
// في الباك اند لو حبيت تعرف شكل الشروط المتوقع.
function offerToForm(offer) {
  return {
    title: offer.title || '',
    type: offer.type || 'promocode',
    code: offer.code || '',
    conditionJson: offer.condition ? JSON.stringify(offer.condition, null, 2) : '',
    scope: offer.scope || 'all',
    movieId: offer.movieId?._id || offer.movieId || '',
    discountType: offer.discountType || 'percentage',
    discountValue: offer.discountValue ?? '',
    startsAt: offer.startsAt ? new Date(offer.startsAt).toISOString().slice(0, 10) : '',
    endAt: offer.endAt ? new Date(offer.endAt).toISOString().slice(0, 10) : '',
  }
}

function buildPayload(form) {
  const payload = {
    title: form.title,
    type: form.type,
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    scope: form.scope,
  }
  if (form.code) payload.code = form.code
  if (form.scope === 'movie') payload.movieId = form.movieId
  if (form.type === 'conditional') {
    payload.condition = form.conditionJson ? JSON.parse(form.conditionJson) : {}
  }
  if (form.startsAt) payload.startsAt = form.startsAt
  if (form.endAt) payload.endAt = form.endAt
  return payload
}

function OfferForm({ form, onChange, onSubmit, saving, error, movies }) {
  return (
    <form onSubmit={onSubmit} className="app-form">
      {error && <div className="form-error">{error}</div>}

      <label>Title</label>
      <input value={form.title} onChange={onChange('title')} required />

      <label>Type</label>
      <select value={form.type} onChange={onChange('type')} required>
        <option value="promocode">Promo code</option>
        <option value="conditional">Conditional</option>
      </select>

      {/* offerMiddleware.js: code is required when type === 'promocode', optional otherwise */}
      <label>Code{form.type === 'promocode' ? '' : ' (optional)'}</label>
      <input
        value={form.code}
        onChange={onChange('code')}
        placeholder="e.g. SAVE20"
        required={form.type === 'promocode'}
      />

      {form.type === 'conditional' && (
        <>
          <label>Condition (JSON)</label>
          <textarea
            rows={3}
            value={form.conditionJson}
            onChange={onChange('conditionJson')}
            placeholder='e.g. {"minTickets": 3}'
          />
        </>
      )}

      <label>Scope</label>
      <select value={form.scope} onChange={onChange('scope')} required>
        <option value="all">All movies</option>
        <option value="movie">Specific movie</option>
        <option value="first_time">First-time booking</option>
      </select>

      {form.scope === 'movie' && (
        <>
          <label>Movie</label>
          <select value={form.movieId} onChange={onChange('movieId')} required>
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
        </>
      )}

      <label>Discount Type</label>
      <select value={form.discountType} onChange={onChange('discountType')} required>
        <option value="percentage">Percentage</option>
        <option value="flat">Flat amount</option>
      </select>

      <label>Discount Value</label>
      <input type="number" min="0" value={form.discountValue} onChange={onChange('discountValue')} required />

      <label>Starts At (optional)</label>
      <input type="date" value={form.startsAt} onChange={onChange('startsAt')} />

      <label>Ends At (optional)</label>
      <input type="date" value={form.endAt} onChange={onChange('endAt')} />

      <button type="submit" className="gold-button" disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}

function AdminOffers() {
  const [offers, setOffers] = useState([])
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [editingOffer, setEditingOffer] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [offersData, moviesData] = await Promise.all([getAllOffers(), getMovies()])
      setOffers(Array.isArray(offersData) ? offersData : offersData?.offers || [])
      setMovies(Array.isArray(moviesData) ? moviesData : moviesData?.movies || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load offers'))
    } finally {
      setLoading(false)
    }
  }, [])

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

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const payload = buildPayload(form)
      await createOffer(payload)
      await loadData()
      setModalOpen(false)
    } catch (err) {
      if (err instanceof SyntaxError) {
        setFormError('Condition must be valid JSON.')
      } else {
        setFormError(getErrorMessage(err, 'Could not create offer'))
      }
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (offer) => {
    setEditingOffer(offer)
    setEditForm(offerToForm(offer))
    setEditError('')
  }

  const closeEditModal = () => {
    if (editSaving) return
    setEditingOffer(null)
  }

  const handleEditChange = (field) => (e) => setEditForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const id = editingOffer?._id || editingOffer?.id
    setEditSaving(true)
    setEditError('')
    try {
      const payload = buildPayload(editForm)
      await updateOffer(id, payload)
      await loadData()
      setEditingOffer(null)
    } catch (err) {
      if (err instanceof SyntaxError) {
        setEditError('Condition must be valid JSON.')
      } else {
        setEditError(getErrorMessage(err, 'Could not update offer'))
      }
    } finally {
      setEditSaving(false)
    }
  }

  const handleDeactivate = async (offer) => {
    const id = offer._id || offer.id
    try {
      await deactivateOffer(id)
      await loadData()
    } catch (err) {
      window.alert(getErrorMessage(err, 'Could not deactivate offer'))
    }
  }

  const handleDelete = async (offer) => {
    const id = offer._id || offer.id
    if (!window.confirm(`Permanently delete "${offer.title}"?`)) return
    try {
      await deleteOffer(id)
      await loadData()
    } catch (err) {
      window.alert(getErrorMessage(err, 'Could not delete offer'))
    }
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <h2>Manage Offers</h2>
          <p>Create, edit, deactivate, or remove promotional offers</p>
        </div>

        <button className="gold-button" onClick={openAddModal}>
          <i className="fa-solid fa-plus"></i>
          Add Offer
        </button>
      </div>

      {loading && <LoadingState label="Loading offers..." />}
      {!loading && error && <ErrorState message={error} onRetry={loadData} />}
      {!loading && !error && offers.length === 0 && <EmptyState message="No offers created yet." />}

      {!loading && !error && offers.length > 0 && (
        <div className="dashboard-card">
          <div className="table-responsive">
            <table className="table booking-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Code</th>
                  <th>Scope</th>
                  <th>Discount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const id = offer._id || offer.id
                  return (
                    <tr key={id}>
                      <td>
                        <strong>{offer.title}</strong>
                      </td>
                      <td>{offer.code || '—'}</td>
                      <td>{offer.scope}</td>
                      <td>
                        {offer.discountType === 'percentage'
                          ? `${offer.discountValue}%`
                          : `EGP ${offer.discountValue}`}
                      </td>
                      <td>
                        <span className={offer.isActive ? 'status confirmed' : 'status pending'}>
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => openEditModal(offer)} title="Edit">
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          {offer.isActive && (
                            <button onClick={() => handleDeactivate(offer)} title="Deactivate">
                              <i className="fa-solid fa-ban"></i>
                            </button>
                          )}
                          <button className="delete-button" onClick={() => handleDelete(offer)} title="Delete">
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
        <Modal title="Add Offer" onClose={closeModal} wide>
          <OfferForm form={form} onChange={handleChange} onSubmit={handleSubmit} saving={saving} error={formError} movies={movies} />
        </Modal>
      )}

      {editingOffer && (
        <Modal title={`Edit "${editingOffer.title}"`} onClose={closeEditModal} wide>
          <OfferForm
            form={editForm}
            onChange={handleEditChange}
            onSubmit={handleEditSubmit}
            saving={editSaving}
            error={editError}
            movies={movies}
          />
        </Modal>
      )}
    </section>
  )
}

export default AdminOffers
