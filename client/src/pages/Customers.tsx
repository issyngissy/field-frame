import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

// Customer shape matching the Prisma model
interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001'

// Default empty form state for creating a new customer
const emptyForm = { name: '', email: '', phone: '', address: '' }

export default function Customers() {
  // Get JWT token passed down from the Layout via React Router context
  const { token } = useOutletContext<{ token: string }>()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null) // null = creating, number = editing
  const [showForm, setShowForm] = useState(false)

  // Auth + JSON headers reused across POST and PATCH requests
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }

  // Fetch all customers on mount
  useEffect(() => {
    fetch(`${API}/customers`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(setCustomers)
  }, [token])

  // Handles both create and edit depending on whether editingId is set
  async function saveCustomer() {
    if (editingId !== null) {
      // PATCH — update existing customer
      const res = await fetch(`${API}/customers/${editingId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(form)
      })
      const updated: Customer = await res.json()
      // Swap updated customer into state without refetching
      setCustomers(customers.map(c => c.id === updated.id ? updated : c))
    } else {
      // POST — create new customer
      const res = await fetch(`${API}/customers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form)
      })
      const created: Customer = await res.json()
      // Prepend new customer to top of list
      setCustomers([created, ...customers])
    }
    // Reset form state after save
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  // DELETE request then remove from local state
  async function deleteCustomer(id: number) {
    await fetch(`${API}/customers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setCustomers(customers.filter(c => c.id !== id))
  }

  // Populate form with existing customer data and switch to edit mode
  function startEdit(customer: Customer) {
    setForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
    })
    setEditingId(customer.id)
    setShowForm(true)
  }

  // Reset everything back to default (close form, clear fields)
  function cancelForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  // Shared input style used across all form fields
  const inputStyle = {
    background: '#1a1a1a', border: '1px solid #333', color: '#fff',
    padding: '10px', borderRadius: '6px', fontFamily: 'monospace', width: '100%',
    boxSizing: 'border-box' as const
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header row with title and add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '3px', marginBottom: '4px' }}>CLIENTS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Customers</div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}
          style={{ background: '#4a9eff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}
        >
          + ADD CUSTOMER
        </button>
      </div>

      {/* Create / edit form — only shown when showForm is true */}
      {showForm && (
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '2px', marginBottom: '16px' }}>
            {editingId !== null ? 'EDIT CUSTOMER' : 'NEW CUSTOMER'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <input style={inputStyle} placeholder='Company Name' value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input style={inputStyle} placeholder='Email' value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input style={inputStyle} placeholder='Phone' value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input style={inputStyle} placeholder='Address' value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={saveCustomer} style={{ background: '#4a9eff', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {editingId !== null ? 'SAVE CHANGES' : 'CREATE CUSTOMER'}
            </button>
            <button onClick={cancelForm} style={{ background: 'transparent', color: '#555', border: '1px solid #333', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace' }}>
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Customers table */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 160px', padding: '12px 20px', borderBottom: '1px solid #222', fontSize: '11px', color: '#555', letterSpacing: '2px' }}>
          <span>ID</span><span>NAME</span><span>EMAIL</span><span>PHONE</span><span>ADDRESS</span><span>ACTIONS</span>
        </div>

        {/* Empty state */}
        {customers.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#333' }}>No customers yet — add one above</div>
        )}

        {/* Customer rows */}
        {customers.map(customer => (
          <div key={customer.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 160px', padding: '16px 20px', borderBottom: '1px solid #1a1a1a', alignItems: 'center' }}>
            <span style={{ color: '#555', fontSize: '12px' }}>#{customer.id}</span>
            <span>{customer.name}</span>
            <span style={{ color: '#888', fontSize: '12px' }}>{customer.email || '—'}</span>
            <span style={{ color: '#888', fontSize: '12px' }}>{customer.phone || '—'}</span>
            <span style={{ color: '#888', fontSize: '12px' }}>{customer.address || '—'}</span>
            <span style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => startEdit(customer)} style={{ background: '#1a1a1a', color: '#4a9eff', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px' }}>EDIT</button>
              <button onClick={() => deleteCustomer(customer.id)} style={{ background: '#1a1a1a', color: '#ff4a4a', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px' }}>DEL</button>
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}