function StatCard({ title, value, icon, description }) {
  return (
    <div className="col-xl-3 col-md-6">
      <div className="stat-card">
        <div className="stat-top">
          <div>
            <p>{title}</p>
            <h3>{value}</h3>
          </div>

          <div className="stat-icon">
            <i className={`fa-solid ${icon}`}></i>
          </div>
        </div>

        <small>
          <i className="fa-solid fa-arrow-up"></i>
          {description}
        </small>
      </div>
    </div>
  )
}

export default StatCard