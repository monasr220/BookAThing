import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import { LoadingState } from './StateViews'
import { getScreenSeats, updateScreenSeats } from '../api/seats'
import { getErrorMessage } from '../api/client'

// Spreadsheet-style row labels: A, B, ... Z, AA, AB, ... so this still works
// if a screen ever has more than 26 rows.
function rowLabel(index) {
  let n = index + 1
  let label = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    label = String.fromCharCode(65 + rem) + label
    n = Math.floor((n - 1) / 26)
  }
  return label
}

const SEAT_TYPES = ['standard', 'vip', 'recliner']
const DEFAULT_MULTIPLIERS = { standard: 1.0, vip: 1.5, recliner: 2.0 }
const TYPE_LABELS = { standard: 'Standard', vip: 'VIP', recliner: 'Recliner' }

function cellKey(row, num) {
  return `${row}-${num}`
}

// Builds a full grid (row x seatsPerRow) seeded from any seats the backend
// already has configured, defaulting the rest to standard.
function buildGrid(totalRows, seatsPerRow, existingSeats) {
  const existingByKey = new Map()
  ;(existingSeats || []).forEach((seat) => {
    const match = /^([A-Za-z]+)(\d+)$/.exec(seat.seatNumber || '')
    if (!match) return
    existingByKey.set(cellKey(match[1].toUpperCase(), Number(match[2])), {
      seat_type: seat.seatType || 'standard',
      priceMultiplier: seat.priceMultiplier ?? DEFAULT_MULTIPLIERS[seat.seatType] ?? 1.0,
    })
  })

  const grid = {}
  for (let r = 0; r < totalRows; r++) {
    const row = rowLabel(r)
    for (let n = 1; n <= seatsPerRow; n++) {
      const key = cellKey(row, n)
      grid[key] = existingByKey.get(key) || { seat_type: 'standard', priceMultiplier: DEFAULT_MULTIPLIERS.standard }
    }
  }
  return grid
}

function SeatConfigModal({ screen, onClose, onSaved }) {
  const screenId = screen._id || screen.id
  const totalRows = Number(screen.totalRows) || 0
  const seatsPerRow = Number(screen.seatsPerRow) || 0

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [grid, setGrid] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [hadExistingSeats, setHadExistingSeats] = useState(false)

  const rows = useMemo(() => Array.from({ length: totalRows }, (_, i) => rowLabel(i)), [totalRows])
  const columns = useMemo(() => Array.from({ length: seatsPerRow }, (_, i) => i + 1), [seatsPerRow])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    getScreenSeats(screenId)
      .then((seats) => {
        if (cancelled) return
        setHadExistingSeats(Array.isArray(seats) && seats.length > 0)
        setGrid(buildGrid(totalRows, seatsPerRow, seats))
      })
      .catch((err) => {
        if (cancelled) return
        setGrid(buildGrid(totalRows, seatsPerRow, []))
        setError(getErrorMessage(err, 'Could not load current seat layout — showing a blank grid.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [screenId, totalRows, seatsPerRow])

  const cycleSeat = (row, num) => {
    const key = cellKey(row, num)
    setGrid((prev) => {
      const current = prev[key]?.seat_type || 'standard'
      const nextType = SEAT_TYPES[(SEAT_TYPES.indexOf(current) + 1) % SEAT_TYPES.length]
      return {
        ...prev,
        [key]: { seat_type: nextType, priceMultiplier: DEFAULT_MULTIPLIERS[nextType] },
      }
    })
  }

  const applyToRow = (row, type) => {
    setGrid((prev) => {
      const next = { ...prev }
      columns.forEach((num) => {
        next[cellKey(row, num)] = { seat_type: type, priceMultiplier: DEFAULT_MULTIPLIERS[type] }
      })
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const seats = []
      rows.forEach((row) => {
        columns.forEach((num) => {
          const cell = grid[cellKey(row, num)]
          seats.push({
            row,
            number_in_row: num,
            seat_type: cell.seat_type,
            priceMultiplier: cell.priceMultiplier,
          })
        })
      })
      await updateScreenSeats(screenId, seats)
      onSaved?.()
      onClose()
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not save seat layout'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Configure Seats — ${screen.screenName}`} onClose={saving ? () => {} : onClose} wide>
      {loading && <LoadingState label="Loading seat layout..." />}

      {!loading && (
        <div className="seat-config">
          {error && <div className="form-error">{error}</div>}
          <p className="form-hint">
            {hadExistingSeats
              ? 'Click a seat to cycle Standard → VIP → Recliner. Save to apply changes.'
              : 'No seats configured yet — starting from an all-Standard grid. Click seats to mark VIP/Recliner rows, then save.'}
          </p>

          <div className="seat-legend">
            {SEAT_TYPES.map((type) => (
              <span key={type} className={`seat-legend-item seat-${type}`}>
                <i className="fa-solid fa-chair"></i> {TYPE_LABELS[type]} (x{DEFAULT_MULTIPLIERS[type]})
              </span>
            ))}
          </div>

          {saveError && <div className="form-error">{saveError}</div>}

          <div className="seat-grid-wrapper">
            <div className="seat-grid">
              {rows.map((row) => (
                <div className="seat-row" key={row}>
                  <div className="seat-row-controls">
                    <span className="seat-row-label">{row}</span>
                    {SEAT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className="seat-row-quick"
                        title={`Mark whole row ${row} as ${TYPE_LABELS[type]}`}
                        onClick={() => applyToRow(row, type)}
                      >
                        {TYPE_LABELS[type][0]}
                      </button>
                    ))}
                  </div>
                  <div className="seat-row-seats">
                    {columns.map((num) => {
                      const cell = grid[cellKey(row, num)] || { seat_type: 'standard' }
                      return (
                        <button
                          type="button"
                          key={num}
                          className={`seat-cell seat-${cell.seat_type}`}
                          onClick={() => cycleSeat(row, num)}
                          title={`${row}${num} — ${TYPE_LABELS[cell.seat_type]}`}
                        >
                          {num}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="button" className="gold-button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Seat Layout'}
          </button>
        </div>
      )}
    </Modal>
  )
}

export default SeatConfigModal
