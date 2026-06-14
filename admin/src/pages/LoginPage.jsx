import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const LOGO_URL = '/logo.png'

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (rawApiUrl && rawApiUrl.trim() ? rawApiUrl.trim() : 'http://localhost:5000').replace(/\/$/, '');

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('adminToken', data.token || 'dummy_token')
        navigate('/orders')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at 60% 40%, #d4ede6 0%, #f3f3f3 60%, #e8f5ee 100%)' }}>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-8 shadow-xl border border-outline-variant/20 transition-all duration-500"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={LOGO_URL}
              alt="SG Herbals Logo"
              className="w-20 h-20 rounded-xl object-contain mb-4 shadow-sm bg-white p-1"
            />
            <h1 className="text-headline-md font-headline-md text-primary">SG Herbals Admin</h1>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Sign in to your admin account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 text-error text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-label-md font-label-md text-on-surface">
                Email Address
              </label>
              <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">mail</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-body-md font-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-label-md font-label-md text-on-surface">
                Password
              </label>
              <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-body-md font-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary rounded-lg px-6 py-3.5 text-label-md font-label-md hover:bg-primary-container transition-colors shadow-sm mt-2"
            >
              Sign In
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          {/* Security Note */}
          <p className="text-center text-label-sm font-label-sm text-on-surface-variant opacity-60 mt-6">
            Authorized personnel only. Access is monitored and logged.
          </p>
        </div>
      </div>

      {/* Admin Footer */}
      <footer className="w-full py-4 bg-surface-container-low border-t border-outline-variant/20">
        <p className="text-center text-label-sm font-label-sm text-on-surface-variant opacity-60">
          SG Herbals | © 2026 SG Herbals. Admin Portal.
        </p>
      </footer>
    </div>
  )
}
