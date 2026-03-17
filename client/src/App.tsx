import { useState, useEffect } from 'react'

interface Driver {
  id: number
  name: string
  email: string
  phone: string | null
  status: string
}

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
}

interface Job {
  id: number
  driver: Driver
  customer: Customer
  origin: string
  destination: string
  commodity: string
  status: string
  created_at: string
}

const API = 'http://localhost:3001'

const statusColors: Record<string, { bg: string; color: string }> = {
  'Pending':     { bg: '#2a2a2a', color: '#888' },
  'In Progress': { bg: '#1a3a2a', color: '#4caf7d' },
  'Delivered':   { bg: '#1a2a3a', color: '#4a9eff' },
  'Completed':   { bg: '#1a1a3a', color: '#a78bfa' },
}

function App() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [form, setForm] = useState({
    driver_id: '',
    customer_id: '',
    origin: '',
    destination: '',
    commodity: '',
  })

  useEffect(() => {
    fetch(`${API}/jobs`).then(r => r.json()).then(setJobs)
    fetch(`${API}/drivers`).then(r => r.json()).then(setDrivers)
    fetch(`${API}/customers`).then(r => r.json()).then(setCustomers)
  }, [])

  async function createJob() {
    const res = await fetch(`${API}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        driver_id: parseInt(form.driver_id),
        customer_id: parseInt(form.customer_id),
      })
    })
    const newJob: Job = await res.json()
    setJobs([newJob, ...jobs])
    setForm({ driver_id: '', customer_id: '', origin: '', destination: '', commodity: '' })
  }

  async function cycleStatus(job: Job) {
    const statuses = ['Pending', 'In Progress', 'Delivered', 'Completed']
    const next = statuses[(statuses.indexOf(job.status) + 1) % statuses.length]
    const res = await fetch(`${API}/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next })
    })
    const updated: Job = await res.json()
    setJobs(jobs.map(j => j.id === updated.id ? updated : j))
  }

  async function deleteJob(id: number) {
    await fetch(`${API}/jobs/${id}`, { method: 'DELETE' })
    setJobs(jobs.filter(j => j.id !== id))
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '3px', marginBottom: '4px' }}>FIELD FRAME</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Scheduler Dashboard</div>
          </div>
          <div style={{ fontSize: '12px', color: '#555' }}>{jobs.length} ACTIVE JOBS</div>
        </div>

        {/* Create Job Form */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '2px', marginBottom: '16px' }}>NEW JOB</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <select
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px' }}
              value={form.driver_id}
              onChange={e => setForm({ ...form, driver_id: e.target.value })}
            >
              <option value=''>Driver</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px' }}
              value={form.customer_id}
              onChange={e => setForm({ ...form, customer_id: e.target.value })}
            >
              <option value=''>Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px' }}
              placeholder='Origin'
              value={form.origin}
              onChange={e => setForm({ ...form, origin: e.target.value })}
            />
            <input
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px' }}
              placeholder='Destination'
              value={form.destination}
              onChange={e => setForm({ ...form, destination: e.target.value })}
            />
            <input
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px' }}
              placeholder='Commodity'
              value={form.commodity}
              onChange={e => setForm({ ...form, commodity: e.target.value })}
            />
            <button
              onClick={createJob}
              style={{ background: '#4a9eff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}
            >
              + CREATE
            </button>
          </div>
        </div>

        {/* Jobs Table */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 120px 140px', padding: '12px 20px', borderBottom: '1px solid #222', fontSize: '11px', color: '#555', letterSpacing: '2px' }}>
            <span>ID</span>
            <span>DRIVER</span>
            <span>CUSTOMER</span>
            <span>ORIGIN → DEST</span>
            <span>COMMODITY</span>
            <span>STATUS</span>
            <span>ACTIONS</span>
          </div>
          {jobs.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#333' }}>No jobs yet — create one above</div>
          )}
          {jobs.map(job => {
            const s = statusColors[job.status] || statusColors['Pending']
            return (
              <div key={job.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 120px 140px', padding: '16px 20px', borderBottom: '1px solid #1a1a1a', alignItems: 'center' }}>
                <span style={{ color: '#555', fontSize: '12px' }}>#{job.id}</span>
                <span>{job.driver.name}</span>
                <span>{job.customer.name}</span>
                <span style={{ color: '#888', fontSize: '12px' }}>{job.origin} → {job.destination}</span>
                <span style={{ color: '#888', fontSize: '12px' }}>{job.commodity}</span>
                <span>
                  <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px' }}>
                    {job.status}
                  </span>
                </span>
                <span style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => cycleStatus(job)} style={{ background: '#1a1a1a', color: '#4a9eff', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px' }}>UPDATE</button>
                  <button onClick={() => deleteJob(job.id)} style={{ background: '#1a1a1a', color: '#ff4a4a', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px' }}>DEL</button>
                </span>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default App
