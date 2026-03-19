import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
    { to: '/', label: 'DASHBOARD', emoji: '📋'},
    { to: '/drivers', label: 'DRIVERS', emoji: '🚛'},
    { to: '/customers', label: 'CUSTOMERS', emoji: '🏢' },
    { to: '/jobs', label: 'JOBS', emoji: '📦' },
]

const linkStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '11px',
    letterSpacing: '2px',
    fontFamily: 'monospace',
    color: isActive ? '#4a9eff' : '#555',
    background: isActive ? '#1a2a3a' : 'transparent',
    borderLeft: isActive ? '2px solid #4a9eff' : '2px solid transparent',
})

export default function Layout({token, onLogout}: {token: string; onLogout: () => void}) {
    return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'monospace' }}>
      
      {/* Sidebar */}
      <div style={{ width: '220px', borderRight: '1px solid #1a1a1a', padding: '24px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ padding: '0 16px', marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '3px' }}>FIELD FRAME</div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                style={({ isActive }) => linkStyle(isActive)}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          onClick={onLogout}
          style={{ background: 'transparent', color: '#555', border: '1px solid #222', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '2px' }}
        >
          SIGN OUT
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <Outlet context={{ token }} />
      </div>

    </div>
  )
}