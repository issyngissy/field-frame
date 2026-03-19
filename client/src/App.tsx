import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Drivers from './pages/Drivers'
import Customers from './pages/Customers'
import Jobs from './pages/Jobs'

const API = 'http://localhost:3001'

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  async function handleLogin() {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    })
    const data = await res.json()
    if (data.token) {
      setToken(data.token)
    } else {
      alert('Invalid credentials')
    }
  }

  if (!token) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '40px', width: '360px' }}>
          <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '3px', marginBottom: '8px' }}>FIELD FRAME</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '32px' }}>Sign In</div>
          <input
            type='email'
            autoComplete='email'
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px', width: '100%', marginBottom: '12px', boxSizing: 'border-box' }}
            placeholder='Email'
            value={loginForm.email}
            onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
          />
          <input
            type='password'
            autoComplete='current-password'
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px', width: '100%', marginBottom: '20px', boxSizing: 'border-box' }}
            placeholder='Password'
            value={loginForm.password}
            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          <button
            onClick={handleLogin}
            style={{ background: '#4a9eff', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', width: '100%', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}
          >
            SIGN IN
          </button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout token={token} onLogout={() => setToken(null)} />}>
          <Route index element={<Dashboard />} />
          <Route path='drivers' element={<Drivers />} />
          <Route path='customers' element={<Customers />} />
          <Route path='jobs' element={<Jobs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}