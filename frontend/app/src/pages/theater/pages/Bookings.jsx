import { useEffect, useState, useCallback } from 'react'
import TheaterSwitcher from '../components/TheaterSwitcher'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import { useTheaters } from '../context/TheaterContext'
import { getOverview, getRevenueByMovie } from '../api/dashboard'
import { getErrorMessage } from '../api/client'

function Bookings() {
  const { theaters, selectedTheaterId, loading: theatersLoading } = useTheaters()

  const [overview, setOverview] = useState(null)
  const [revenueByMovie, setRevenueByMovie] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    if (!selectedTheaterId) return
    setLoading(true)
    setError('')
    try {
      const [overviewData, revenueData] = await Promise.all([
        getOverview(selectedTheaterId),
        getRevenueByMovie(selectedTheaterId),
      ])
      setOverview(overviewData)
      setRevenueByMovie(Array.isArray(revenueData) ? revenueData : revenueData?.items || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load bookings data'))
    } finally {
      setLoading(false)
    }
  }, [selectedTheaterId])

  useEffect(() => {
    loadData()
  }, [loadData])

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
          <h2>Bookings & Revenue</h2>
          <p>Track your bookings and cinema revenue</p>
        </div>

        <TheaterSwitcher />
      </div>

      {loading && <LoadingState label="Loading..." />}
      {!loading && error && <ErrorState message={error} onRetry={loadData} />}

      {!loading && !error && (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="revenue-card">
                <span>Total Revenue</span>
                <h3>{overview?.totalRevenue != null ? `EGP ${overview.totalRevenue}` : '—'}</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="revenue-card">
                <span>Total Bookings</span>
                <h3>{overview?.totalBookings ?? '—'}</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="revenue-card">
                <span>Average Booking</span>
                <h3>
                  {overview?.totalRevenue && overview?.totalBookings
                    ? `EGP ${Math.round(overview.totalRevenue / overview.totalBookings)}`
                    : '—'}
                </h3>
              </div>
            </div>
          </div>

          <div className="dashboard-card mb-4">
            <div className="card-heading">
              <div>
                <h5>Revenue by Movie</h5>
                <p>Breakdown of revenue per movie for this theater</p>
              </div>
            </div>

            {revenueByMovie.length === 0 ? (
              <EmptyState message="No revenue data for this theater yet." />
            ) : (
              <div className="table-responsive">
                <table className="table booking-table">
                  <thead>
                    <tr>
                      <th>Movie</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueByMovie.map((movie) => (
                      <tr key={movie.movieId || movie.title}>
                        <td>
                          <strong>{movie.title}</strong>
                        </td>
                        <td>{movie.bookingsCount ?? '—'}</td>
                        <td>EGP {movie.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <div className="card-heading">
              <div>
                <h5>Recent Bookings</h5>
                <p>Individual customer bookings</p>
              </div>
            </div>

            <div className="notice-box">
              <i className="fa-solid fa-circle-info"></i>
              <span>
                The current API doesn't have an endpoint yet to list individual bookings
                for a theater (only <code>POST /bookings</code> exists, for customers to
                create one). Ask the backend team to add something like{' '}
                <code>GET /theaters/:theaterId/bookings</code>, and this table can be wired
                up right away in <code>src/pages/Bookings.jsx</code>.
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default Bookings
