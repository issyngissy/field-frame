import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

interface Driver {
  id: number
  name: string
  email: string
  phone: string | null
  license: string | null
  status: string
  inducted: boolean
  induction_date: string | null
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001'

const emptyForm = { name: '', email: '', phone: '', license: '' }

const statusColors: Record<string, { bg: string; color: string }> = {
  'Active':      { bg: '#1a3a2a', color: '#4caf7d' },
  'Inactive':    { bg: '#2a2a2a', color: '#888' },
  'On Leave':    { bg: '#2a2a1a', color: '#f0c040' },
}

export default function Drivers() {
  const { token } = useOutletContext<{ token: string }>()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    fetch(`${API}/drivers`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(setDrivers)
  }, [token])

  async function saveDriver() {
    if (editingId !== null) {
      const res = await fetch(`${API}/drivers/${editingId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(form)
      })
      const updated: Driver = await res.json()
      setDrivers(drivers.map(d => d.id === updated.id ? updated : d))
    } else {
      const res = await fetch(`${API}/drivers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form)
      })
      const created: Driver = await res.json()
      setDrivers([created, ...drivers])
    }
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  async function deleteDriver(id: number) {
    await fetch(`${API}/drivers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setDrivers(drivers.filter(d => d.id !== id))
  }

  async function cycleStatus(driver: Driver) {
    const statuses = ['Active', 'Inactive', 'On Leave']
    const next = statuses[(statuses.indexOf(driver.status) + 1) % statuses.length]
    const res = await fetch(`${API}/drivers/${driver.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: next })
    })
    const updated: Driver = await res.json()
    setDrivers(drivers.map(d => d.id === updated.id ? updated : d))
  }

async function toggleInduction(driver: Driver) {
    //If already inducted, undo it - otherwiesae mark as inducted with today's date
    const inducted = !driver.inducted
    const induction_date = inducted ? new Date().toISOString() : null

    const res = await fetch(`${API}/drivers/${driver.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({inducted, induction_date})
    })
    const updated: Driver = await res.json()

    //swap the updated driver into state without refetching the whole list
    setDrivers(drivers.map(d => d.id === updated.id ? updated : d))
}
  function startEdit(driver: Driver) {
    setForm({ name: driver.name, email: driver.email, phone: driver.phone || '', license: driver.license || '' })
    setEditingId(driver.id)
    setShowForm(true)
  }

  function cancelForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const inputStyle = {
    background: '#1a1a1a', border: '1px solid #333', color: '#fff',
    padding: '10px', borderRadius: '6px', fontFamily: 'monospace', width: '100%',
    boxSizing: 'border-box' as const
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '3px', marginBottom: '4px' }}>FLEET</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Drivers</div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}
          style={{ background: '#4a9eff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}
        >
          + ADD DRIVER
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '2px', marginBottom: '16px' }}>
            {editingId !== null ? 'EDIT DRIVER' : 'NEW DRIVER'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <input style={inputStyle} placeholder='Full Name' value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input style={inputStyle} placeholder='Email' value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input style={inputStyle} placeholder='Phone' value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input style={inputStyle} placeholder='License #' value={form.license} onChange={e => setForm({ ...form, license: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={saveDriver} style={{ background: '#4a9eff', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {editingId !== null ? 'SAVE CHANGES' : 'CREATE DRIVER'}
            </button>
            <button onClick={cancelForm} style={{ background: 'transparent', color: '#555', border: '1px solid #333', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace' }}>
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 120px 160px 160px', padding: '12px 20px', borderBottom: '1px solid #222', fontSize: '11px', color: '#555', letterSpacing: '2px' }}>
          <span>ID</span><span>NAME</span><span>EMAIL</span><span>PHONE</span><span>LICENSE</span><span>STATUS</span><span>INDUCTED</span><span>ACTIONS</span>
        </div>
        {drivers.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#333' }}>No drivers yet — add one above</div>
        )}
        {drivers.map(driver => {
          const s = statusColors[driver.status] || statusColors['Inactive']
          return (
            <div key={driver.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 120px 160px 160px', padding: '16px 20px', borderBottom: '1px solid #1a1a1a', alignItems: 'center' }}>
              <span style={{ color: '#555', fontSize: '12px' }}>#{driver.id}</span>
              <span>{driver.name}</span>
              <span style={{ color: '#888', fontSize: '12px' }}>{driver.email}</span>
              <span style={{ color: '#888', fontSize: '12px' }}>{driver.phone || '—'}</span>
              <span style={{ color: '#888', fontSize: '12px' }}>{driver.license || '—'}</span>
              <span>
                <span
                  onClick={() => cycleStatus(driver)}
                  style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}
                >
                  {driver.status}
                </span>
              </span>
              <span>
                {driver.inducted ? (
                  <span
                    onClick={() => toggleInduction(driver)}
                    style={{ background: '#1a3a2a', color: '#4caf7d', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ✓ {driver.induction_date ? new Date(driver.induction_date).toLocaleDateString('en-AU') : 'Inducted'}
                  </span>
                ) : (
                  <span
                    onClick={() => toggleInduction(driver)}
                    style={{ background: '#2a2a2a', color: '#888', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    NOT INDUCTED
                  </span>
                )}
              </span>
              <span style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => startEdit(driver)} style={{ background: '#1a1a1a', color: '#4a9eff', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px' }}>EDIT</button>
                <button onClick={() => deleteDriver(driver.id)} style={{ background: '#1a1a1a', color: '#ff4a4a', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px' }}>DEL</button>
              </span>
            </div>
          )
        })}
      </div>

    </div>
  )
}