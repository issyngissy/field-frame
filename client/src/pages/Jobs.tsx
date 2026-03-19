import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

interface Driver { id: number; name: string }
interface Customer { id: number; name: string }
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

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001'

const statusColors: Record<string, { bg: string; color: string }> = {
  'Pending':     { bg: '#2a2a2a', color: '#888' },
  'In Progress': { bg: '#1a3a2a', color: '#4caf7d' },
  'Delivered':   { bg: '#1a2a3a', color: '#4a9eff' },
  'Completed':   { bg: '#1a1a3a', color: '#a78bfa' },
}

const ALL_STATUSES = ['All', 'Pending', 'In Progress', 'Delivered', 'Completed']

export default function Jobs() {
  // Get JWT token from Layout context
  const { token } = useOutletContext<{ token: string }>()

  const [jobs, setJobs] = useState<Job[]>([])
  // Active filter — 'All' shows everything
  const [filter, setFilter] = useState('All')

  // Fetch all jobs on mount
  useEffect(() => {
    fetch(`${API}/jobs`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(setJobs)
  }, [token])

  // Filter jobs client-side based on selected status
  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.status === filter)

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '3px', marginBottom: '4px' }}>LOGISTICS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Jobs</div>
        </div>
        <div style={{ fontSize: '12px', color: '#555' }}>{filtered.length} JOBS</div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              background: filter === s ? '#4a9eff' : '#111',
              color: filter === s ? '#fff' : '#555',
              border: `1px solid ${filter === s ? '#4a9eff' : '#222'}`,
              padding: '6px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '11px',
              letterSpacing: '1px'
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Jobs table */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden' }}>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 130px 120px', padding: '12px 20px', borderBottom: '1px solid #222', fontSize: '11px', color: '#555', letterSpacing: '2px' }}>
          <span>ID</span>
          <span>DRIVER</span>
          <span>CUSTOMER</span>
          <span>ORIGIN → DEST</span>
          <span>COMMODITY</span>
          <span>STATUS</span>
          <span>DATE</span>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#333' }}>
            No jobs {filter !== 'All' ? `with status "${filter}"` : 'yet'}
          </div>
        )}

        {/* Job rows — read only, status managed from Dashboard */}
        {filtered.map(job => {
          const s = statusColors[job.status] || statusColors['Pending']
          return (
            <div key={job.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 130px 120px', padding: '16px 20px', borderBottom: '1px solid #1a1a1a', alignItems: 'center' }}>
              <span style={{ color: '#555', fontSize: '12px' }}>#{job.id}</span>
              <span>{job.driver?.name}</span>
              <span>{job.customer?.name}</span>
              <span style={{ color: '#888', fontSize: '12px' }}>{job.origin} → {job.destination}</span>
              <span style={{ color: '#888', fontSize: '12px' }}>{job.commodity}</span>
              <span>
                <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px' }}>
                  {job.status}
                </span>
              </span>
              <span style={{ color: '#555', fontSize: '11px' }}>
                {new Date(job.created_at).toLocaleDateString('en-AU')}
              </span>
            </div>
          )
        })}
      </div>

    </div>
  )
}