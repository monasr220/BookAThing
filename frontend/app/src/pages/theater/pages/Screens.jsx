import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import TheaterSwitcher from '../components/TheaterSwitcher'
import SeatConfigModal from '../components/SeatConfigModal'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import { useTheaters } from '../context/TheaterContext'
import { getScreens, createScreen, updateScreen, deleteScreen } from '../api/screens'
import { getErrorMessage } from '../api/client'

// Field names must match models/theaterScreen.js: screenName, screenType,
// totalRows, seatsPerRow, capacity (capacity is derived from rows x seats).
const emptyForm = { screenName: '', screenType: '2D', totalRows: '', seatsPerRow: '' }

function Screens() {
  const { theaters, selectedTheaterId, loading: theatersLoading } = useTheaters()

  const [screens, setScreens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingScreen, setEditingScreen] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [seatScreen, setSeatScreen] = useState(null)

  const loadScreens = useCallback(async () => {
    if (!selectedTheaterId) return
    setLoading(true)
    setError('')
    try {
      const data = await getScreens(selectedTheaterId)
      setScreens(Array.isArray(data) ? data : data?.screens || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load screens'))
    } finally {
      setLoading(false)
    }
  }, [selectedTheaterId])

  useEffect(() => {
    loadScreens()
  }, [loadScreens])

  const openAddModal = () => {
    setEditingScreen(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (screen) => {
    setEditingScreen(screen)
    setForm({
      screenName: screen.screenName || '',
      screenType: screen.screenType || '2D',
      totalRows: screen.totalRows || '',
      seatsPerRow: screen.seatsPerRow || '',
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
      const id = editingScreen?._id || editingScreen?.id
      const totalRows = Number(form.totalRows)
      const seatsPerRow = Number(form.seatsPerRow)
      const payload = {
        screenName: form.screenName,
        screenType: form.screenType,
        totalRows,
        seatsPerRow,
        capacity: totalRows * seatsPerRow,
      }
      if (id) {
        await updateScreen(selectedTheaterId, id, payload)
      } else {
        await createScreen(selectedTheaterId, payload)
      }
      await loadScreens()
      setModalOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save screen'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (screen) => {
    const id = screen._id || screen.id
    if (!window.confirm(`Delete "${screen.screenName}"?`)) return
    try {
      await deleteScreen(selectedTheaterId, id)
      await loadScreens()
    } catch (err) {
      window.alert(getErrorMessage(err, 'Could not delete screen'))
    }
  }

  if (theatersLoading) return <LoadingState label="Loading theaters..." />

  if (theaters.length === 0) {
    return (
      <section className="page-content">
        <EmptyState message="Add a theater first from the Theaters page, then come back to add screens." />
      </section>
    )
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <h2>Manage Screens</h2>
          <p>Manage 2D, 3D, IMAX and 4DX screens</p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <TheaterSwitcher />
          <button className="gold-button" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i>
            Add Screen
          </button>
        </div>
      </div>

      {loading && <LoadingState label="Loading screens..." />}
      {!loading && error && <ErrorState message={error} onRetry={loadScreens} />}
      {!loading && !error && screens.length === 0 && (
        <EmptyState message="No screens in this theater yet." />
      )}

      {!loading && !error && screens.length > 0 && (
        <div className="dashboard-card">
          <div className="table-responsive">
            <table className="table booking-table">
              <thead>
                <tr>
                  <th>Screen</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {screens.map((screen) => {
                  const id = screen._id || screen.id
                  return (
                    <tr key={id}>
                      <td>
                        <strong>{screen.screenName}</strong>
                      </td>

                      <td>
                        <span className="screen-type">{screen.screenType}</span>
                      </td>

                      <td>{screen.capacity} Seats</td>

                      <td>
                        <span className="status confirmed">
                          {screen.status || 'Active'}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button onClick={() => setSeatScreen(screen)} title="Configure Seats">
                            <i className="fa-solid fa-chair"></i>
                          </button>

                          <button onClick={() => openEditModal(screen)} title="Edit Screen">
                            <i className="fa-solid fa-pen"></i>
                          </button>

                          <button className="delete-button" onClick={() => handleDelete(screen)} title="Delete Screen">
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
        <Modal title={editingScreen ? 'Edit Screen' : 'Add Screen'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="app-form">
            {formError && <div className="form-error">{formError}</div>}

            <label>Name</label>
            <input value={form.screenName} onChange={handleChange('screenName')} required />

            <label>Type</label>
            <select value={form.screenType} onChange={handleChange('screenType')}>
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="IMAX">IMAX</option>
              <option value="4DX">4DX</option>
            </select>

            <label>Total Rows</label>
            <input
              type="number"
              min="1"
              value={form.totalRows}
              onChange={handleChange('totalRows')}
              required
            />

            <label>Seats Per Row</label>
            <input
              type="number"
              min="1"
              value={form.seatsPerRow}
              onChange={handleChange('seatsPerRow')}
              required
            />
            {form.totalRows && form.seatsPerRow && (
              <p className="form-hint">
                Capacity: {Number(form.totalRows) * Number(form.seatsPerRow)} seats
              </p>
            )}

            <button type="submit" className="gold-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </Modal>
      )}

      {seatScreen && (
        <SeatConfigModal
          screen={seatScreen}
          onClose={() => setSeatScreen(null)}
          onSaved={loadScreens}
        />
      )}
    </section>
  )
}

export default Screens
