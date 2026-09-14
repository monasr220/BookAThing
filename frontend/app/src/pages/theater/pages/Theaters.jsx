import { useState } from 'react'
import Modal from '../components/Modal'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import { useTheaters } from '../context/TheaterContext'
import { createTheater, updateTheater, deleteTheater } from '../api/theaters'
import { getErrorMessage } from '../api/client'

// Backend stores city/address nested under `location` (see models/theater.js) —
// the form keeps them as flat fields for simplicity and nests them on submit.
const emptyForm = { name: '', city: '', address: '', phone: '' }

function Theaters() {
  const { theaters, loading, error, refreshTheaters } = useTheaters()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTheater, setEditingTheater] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const openAddModal = () => {
    setEditingTheater(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (theater) => {
    setEditingTheater(theater)
    setForm({
      name: theater.name || '',
      city: theater.location?.city || theater.city || '',
      address: theater.location?.address || theater.address || '',
      phone: theater.phone || '',
    })
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
      const id = editingTheater?._id || editingTheater?.id
      // API expects { name, phone, location: { city, address } } — see API_DOCUMENTATION.md
      const payload = {
        name: form.name,
        phone: form.phone,
        location: { city: form.city, address: form.address },
      }
      if (id) {
        await updateTheater(id, payload)
      } else {
        await createTheater(payload)
      }
      await refreshTheaters()
      setModalOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save theater'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (theater) => {
    const id = theater._id || theater.id
    if (!window.confirm(`Delete "${theater.name}"? This cannot be undone.`)) return
    try {
      await deleteTheater(id)
      await refreshTheaters()
    } catch (err) {
      window.alert(getErrorMessage(err, 'Could not delete theater'))
    }
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <h2>Manage Theaters</h2>
          <p>Manage all your cinema theaters</p>
        </div>

        <button className="gold-button" onClick={openAddModal}>
          <i className="fa-solid fa-plus"></i>
          Add Theater
        </button>
      </div>

      {loading && <LoadingState label="Loading theaters..." />}
      {!loading && error && <ErrorState message={error} onRetry={refreshTheaters} />}
      {!loading && !error && theaters.length === 0 && (
        <EmptyState message="No theaters yet. Click 'Add Theater' to create your first one." />
      )}

      {!loading && !error && theaters.length > 0 && (
        <div className="row g-4">
          {theaters.map((theater) => {
            const id = theater._id || theater.id
            return (
              <div className="col-xl-4 col-md-6" key={id}>
                <div className="theater-card">
                  <div className="theater-icon">
                    <i className="fa-solid fa-building"></i>
                  </div>

                  <div className="theater-header">
                    <div>
                      <h5>{theater.name}</h5>
                      <p>
                        <i className="fa-solid fa-location-dot"></i>
                        {theater.location?.city || theater.location?.address || '—'}
                      </p>
                    </div>

                    <span className="status confirmed">
                      {theater.status || 'Active'}
                    </span>
                  </div>

                  <div className="theater-info">
                    <div>
                      <span>Screens</span>
                      <strong>{theater.screensCount ?? '—'}</strong>
                    </div>

                    <div>
                      <span>Phone</span>
                      <strong>{theater.phone || '—'}</strong>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button onClick={() => openEditModal(theater)}>
                      <i className="fa-solid fa-pen"></i>
                      Edit
                    </button>

                    <button className="delete-button" onClick={() => handleDelete(theater)}>
                      <i className="fa-solid fa-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title={editingTheater ? 'Edit Theater' : 'Add Theater'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="app-form">
            {formError && <div className="form-error">{formError}</div>}

            <label>Name</label>
            <input value={form.name} onChange={handleChange('name')} required />

            <label>City</label>
            <input value={form.city} onChange={handleChange('city')} required />

            <label>Address</label>
            <input value={form.address} onChange={handleChange('address')} />

            <label>Phone</label>
            <input value={form.phone} onChange={handleChange('phone')} />

            <button type="submit" className="gold-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </Modal>
      )}
    </section>
  )
}

export default Theaters
