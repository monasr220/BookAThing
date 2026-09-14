import { useEffect, useState, useCallback } from 'react'
import StatCard from '../components/StatCard'
import TheaterSwitcher from '../components/TheaterSwitcher'
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews'
import { useTheaters } from '../context/TheaterContext'
import { getOverview, getRevenueByMovie, getUpcomingShowtimes } from '../api/dashboard'
import { getErrorMessage } from '../api/client'

function Dashboard() {
  const { theaters, selectedTheaterId, loading: theatersLoading } = useTheaters()

  const [overview, setOverview] = useState(null)
  const [revenueByMovie, setRevenueByMovie] = useState([])
  const [upcomingShows, setUpcomingShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    if (!selectedTheaterId) return
    setLoading(true)
    setError('')
    try {
      const [overviewData, revenueData, upcomingData] = await Promise.all([
        getOverview(selectedTheaterId),
        getRevenueByMovie(selectedTheaterId),
        getUpcomingShowtimes(selectedTheaterId),
      ])
      setOverview(overviewData)
      setRevenueByMovie(Array.isArray(revenueData) ? revenueData : revenueData?.items || [])
      setUpcomingShows(Array.isArray(upcomingData) ? upcomingData : upcomingData?.items || [])
    } catch (err) {
      setError(getErrorMessage(err, 'حصل خطأ في تحميل بيانات الداشبورد'))
    } finally {
      setLoading(false)
    }
  }, [selectedTheaterId])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (theatersLoading) return <LoadingState label="Loading theaters..." />

  if (theaters.length === 0) {
    return (
      <section className="page-content">
        <EmptyState message="You don't have any theaters yet. Add one from the Theaters page to see your dashboard." />
      </section>
    )
  }

  const maxRevenue = Math.max(1, ...revenueByMovie.map((m) => Number(m.revenue) || 0))

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back, manage your cinema from here</p>
        </div>

        <TheaterSwitcher />
      </div>

      {loading && <LoadingState label="Loading dashboard..." />}
      {!loading && error && <ErrorState message={error} onRetry={loadDashboard} />}

      {!loading && !error && (
        <>
          <div className="row g-4 mb-4">
            <StatCard
              title="Total Theaters"
              value={theaters.length}
              icon="fa-building"
              description="theaters you own"
            />

            <StatCard
              title="Total Screens"
              value={overview?.totalScreens ?? '—'}
              icon="fa-tv"
              description="in this theater"
            />

            <StatCard
              title="Total Bookings"
              value={overview?.totalBookings ?? '—'}
              icon="fa-ticket"
              description="in selected period"
            />

            <StatCard
              title="Total Revenue"
              value={overview?.totalRevenue != null ? `EGP ${overview.totalRevenue}` : '—'}
              icon="fa-coins"
              description="in selected period"
            />
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
              <div className="dashboard-card">
                <div className="card-heading">
                  <div>
                    <h5>Revenue by Movie</h5>
                    <p>Which movies are bringing in the most revenue</p>
                  </div>
                </div>

                {revenueByMovie.length === 0 ? (
                  <EmptyState message="No revenue data yet." />
                ) : (
                  <>
                    <div className="chart">
                      <div className="chart-area">
                        {revenueByMovie.map((movie) => (
                          <div
                            key={movie.movieId || movie.title}
                            className="chart-bar"
                            title={`${movie.title}: EGP ${movie.revenue}`}
                            style={{
                              height: `${(Number(movie.revenue) / maxRevenue) * 100}%`,
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>

                    <div className="chart-days">
                      {revenueByMovie.map((movie) => (
                        <span key={movie.movieId || movie.title}>{movie.title}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="dashboard-card">
                <div className="card-heading">
                  <div>
                    <h5>Upcoming Showtimes</h5>
                    <p>Next screenings for this theater</p>
                  </div>
                </div>

                {upcomingShows.length === 0 ? (
                  <EmptyState message="No upcoming showtimes." />
                ) : (
                  <div className="show-list">
                    {upcomingShows.map((show) => (
                      <div className="show-item" key={show._id || show.id}>
                        <div className="movie-icon">
                          <i className="fa-solid fa-film"></i>
                        </div>

                        <div className="show-info">
                          <strong>{show.movieTitle || show.movie?.title}</strong>
                          <span>{show.screenName || show.screen?.name}</span>
                          <small>
                            {show.time || show.startTime} • {show.date}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default Dashboard
