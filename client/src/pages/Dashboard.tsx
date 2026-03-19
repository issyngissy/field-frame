import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

//This sets the TYPES/OBJECTS of the code. Every type; Driver, Customer, Job. This defines what objects must look like when it comes back from the API
interface Driver { id: number; name: string; email: string; phone: string | null; status: string }
interface Customer { id: number; name: string; email: string | null; phone: string | null }
interface Job { id: number; driver: Driver; customer: Customer; origin: string; destination: string; commodity: string; status: string; created_at: string }

//what's calling the backend server node.js/express - can be swapped out for Azure URL in production
const API = 'http://localhost:3001'


const statusColors: Record<string, { bg: string; color: string }> = {
  'Pending':     { bg: '#2a2a2a', color: '#888' },
  'In Progress': { bg: '#1a3a2a', color: '#4caf7d' },
  'Delivered':   { bg: '#1a2a3a', color: '#4a9eff' },
  'Completed':   { bg: '#1a1a3a', color: '#a78bfa' },
}

//This is a function: It grabs the password token to interact with the site. The following consts are state slots - React is watching and Re-renders the UI
export default function Dashboard() {
  const { token } = useOutletContext<{ token: string }>()
  const [jobs, setJobs] = useState<Job[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [form, setForm] = useState({ driver_id: '', customer_id: '', origin: '', destination: '', commodity: '' })

  //Data Fetching: Fetch all the jobs, drivers & customers, store in state
  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${token}` }
    fetch(`${API}/jobs`, { headers }).then(r => r.json()).then(setJobs)
    fetch(`${API}/drivers`, { headers }).then(r => r.json()).then(setDrivers)
    fetch(`${API}/customers`, { headers }).then(r => r.json()).then(setCustomers)
  }, [token])

  //CREATE JOB: send new data (POST), tells the API it's sending, sends as json, 
  async function createJob() {
    const res = await fetch(`${API}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...form, driver_id: parseInt(form.driver_id), customer_id: parseInt(form.customer_id) })
    })
    //parse the newly created job that the backend sends back. Add it to top of the list, reset new job to empty.
    const newJob: Job = await res.json()
    setJobs([newJob, ...jobs])
    setForm({ driver_id: '', customer_id: '', origin: '', destination: '', commodity: '' })
  }

  //CYCLING JOB STATUS: 'Pending, in progress, delivered, completed'
  async function cycleStatus(job: Job) {
    const statuses = ['Pending', 'In Progress', 'Delivered', 'Completed']
    const next = statuses[(statuses.indexOf(job.status) + 1) % statuses.length]
    const res = await fetch(`${API}/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: next })
    })
    const updated: Job = await res.json()
    setJobs(jobs.map(j => j.id === updated.id ? updated : j))
  }

  //Delete job
  async function deleteJob(id: number) {
    await fetch(`${API}/jobs/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    setJobs(jobs.filter(j => j.id !== id))
  }

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '3px', marginBottom: '4px' }}>OVERVIEW</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Scheduler Dashboard</div>
        </div>
        <div style={{ fontSize: '12px', color: '#555' }}>{jobs.length} ACTIVE JOBS</div>
      </div>

      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: '#555', letterSpacing: '2px', marginBottom: '16px' }}>NEW JOB</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <select style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px' }} value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
            <option value=''>Driver</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px' }} value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
            <option value=''>Customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px' }} placeholder='Origin' value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} />
          <input style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px' }} placeholder='Destination' value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} />
          <input style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px' }} placeholder='Commodity' value={form.commodity} onChange={e => setForm({ ...form, commodity: e.target.value })} />
          <button onClick={createJob} style={{ background: '#4a9eff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}>+ CREATE</button>
        </div>
      </div>

      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 120px 140px', padding: '12px 20px', borderBottom: '1px solid #222', fontSize: '11px', color: '#555', letterSpacing: '2px' }}>
          <span>ID</span><span>DRIVER</span><span>CUSTOMER</span><span>ORIGIN → DEST</span><span>COMMODITY</span><span>STATUS</span><span>ACTIONS</span>
        </div>
        {jobs.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#333' }}>No jobs yet</div>}
        {jobs.map(job => {
          const s = statusColors[job.status] || statusColors['Pending']
          return (
            <div key={job.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 120px 140px', padding: '16px 20px', borderBottom: '1px solid #1a1a1a', alignItems: 'center' }}>
              <span style={{ color: '#555', fontSize: '12px' }}>#{job.id}</span>
              <span>{job.driver?.name}</span>
              <span>{job.customer.name}</span>
              <span style={{ color: '#888', fontSize: '12px' }}>{job.origin} → {job.destination}</span>
              <span style={{ color: '#888', fontSize: '12px' }}>{job.commodity}</span>
              <span><span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px' }}>{job.status}</span></span>
              <span style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => cycleStatus(job)} style={{ background: '#1a1a1a', color: '#4a9eff', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px' }}>UPDATE</button>
                <button onClick={() => deleteJob(job.id)} style={{ background: '#1a1a1a', color: '#ff4a4a', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px' }}>DEL</button>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}