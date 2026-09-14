import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import '../theater.css'

function Login() {
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand login-brand">
          <div className="brand-icon">
            <i className="fa-solid fa-clapperboard"></i>
          </div>
          <span>CINEMA</span>
        </div>

        <h2>Owner / Admin Login</h2>
        <p>Sign in to manage your cinema or the movie catalog</p>

        {error && (
          <div className="form-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="owner@example.com"
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          autoComplete="current-password"
          required
        />

        <button type="submit" className="gold-button login-button" disabled={loading}>
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i> Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  )
}

export default Login
