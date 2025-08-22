import React, { useEffect, useState } from 'react'
import { adminListUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from '../api.js'

// Modern UI Components
const container = { padding: '24px', background: '#f8fafc', minHeight: '100vh' }
const header = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '32px',
  background: 'white',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
}
const title = { margin: 0, fontSize: '28px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }
const subtitle = { margin: '8px 0 0 0', fontSize: '16px', color: '#6b7280', fontWeight: '400' }

const card = { 
  background: 'white', 
  border: '1px solid #e5e7eb', 
  borderRadius: '16px', 
  padding: '24px', 
  marginBottom: '24px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  transition: 'all 0.2s ease'
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }
const miniGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }

const input = { 
  padding: '12px 16px', 
  border: '1px solid #e5e7eb', 
  borderRadius: '12px', 
  width: '100%', 
  fontSize: '14px',
  transition: 'all 0.2s ease',
  background: 'white'
}

const button = { 
  padding: '12px 20px', 
  border: '1px solid #e5e7eb', 
  borderRadius: '12px', 
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
  color: 'white', 
  cursor: 'pointer', 
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
}

const buttonSecondary = { 
  ...button, 
  background: 'white',
  color: '#374151',
  border: '1px solid #e5e7eb'
}

const buttonDanger = { 
  ...button, 
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
}

const buttonSuccess = { 
  ...button, 
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
}

const table = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '16px',
  background: 'white',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
}

const tableHeader = {
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  borderBottom: '2px solid #e5e7eb',
  padding: '16px 20px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#374151',
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}

const tableRow = {
  borderBottom: '1px solid #f3f4f6',
  transition: 'all 0.2s ease'
}

const tableCell = {
  padding: '16px 20px',
  fontSize: '14px',
  color: '#374151',
  verticalAlign: 'top'
}

const badge = (color) => ({
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  color: color,
  background: `${color}15`,
  border: `1px solid ${color}30`,
  display: 'inline-block'
})

const avatar = (size = 40) => ({
  width: size,
  height: size,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'grid',
  placeItems: 'center',
  color: 'white',
  fontWeight: '600',
  fontSize: size * 0.4
})

const statsCard = (color) => ({
  background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
  border: `1px solid ${color}20`,
  borderRadius: '16px',
  padding: '20px',
  textAlign: 'center',
  transition: 'all 0.2s ease'
})

const statsNumber = (color) => ({
  fontSize: '32px',
  fontWeight: '800',
  color: color,
  marginBottom: '8px'
})

const statsLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}

const checkbox = {
  width: '16px',
  height: '16px',
  margin: 0,
  cursor: 'pointer'
}

export default function Users() {
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({ email: '', password: '', username: '', name: '', is_admin: false })
	const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')

	const load = async () => {
		setLoading(true)
		setError('')
		try {
			const res = await adminListUsers()
			setUsers(res.users || [])
		} catch (e) {
			setError(e.message || 'Failed to load users')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [])

	const create = async () => {
    if (!form.email || !form.password || !form.username) {
      alert('Please fill in all required fields')
      return
    }
    
		try {
			await adminCreateUser(form)
			setForm({ email: '', password: '', username: '', name: '', is_admin: false })
			await load()
		} catch (e) {
			alert(e.message || 'Failed to create user')
		}
	}

	const toggleAdmin = async (u) => {
    try { 
      await adminUpdateUser(u.id, { is_admin: !u.is_admin }) 
      await load() 
    } catch (e) { 
      alert('Update failed') 
    }
	}

	const remove = async (u) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try { 
      await adminDeleteUser(u.id) 
      await load() 
    } catch (e) { 
      alert('Delete failed') 
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === '' || 
      (filterRole === 'admin' && user.is_admin) ||
      (filterRole === 'user' && !user.is_admin)
    
    return matchesSearch && matchesRole
  })

  const getTotalUsers = () => users.length
  const getTotalAdmins = () => users.filter(u => u.is_admin).length
  const getTotalRegularUsers = () => users.filter(u => !u.is_admin).length

	return (
    <div style={container}>
      {/* Header */}
      <div style={header}>
        <div>
          <div style={title}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            User Management
          </div>
          <div style={subtitle}>
            Create, manage, and monitor user accounts
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={load} style={buttonSecondary}>
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M1 4v6h6"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div style={grid}>
        <div style={statsCard('#3b82f6')}>
          <div style={statsNumber('#3b82f6')}>{getTotalUsers()}</div>
          <div style={statsLabel}>Total Users</div>
        </div>
        <div style={statsCard('#10b981')}>
          <div style={statsNumber('#10b981')}>{getTotalAdmins()}</div>
          <div style={statsLabel}>Administrators</div>
        </div>
        <div style={statsCard('#f59e0b')}>
          <div style={statsNumber('#f59e0b')}>{getTotalRegularUsers()}</div>
          <div style={statsLabel}>Regular Users</div>
        </div>
        <div style={statsCard('#ef4444')}>
          <div style={statsNumber('#ef4444')}>{users.filter(u => u.email && u.username).length}</div>
          <div style={statsLabel}>Complete Profiles</div>
        </div>
      </div>

      {/* Create User Form */}
      <div style={card}>
        <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '600' }}>
          Create New User
        </h3>
        
        <div style={grid}>
		<div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Email *
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={input}
              required
            />
          </div>
          
				<div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Username *
						</label>
            <input
              placeholder="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={input}
              required
            />
					</div>
				</div>

        <div style={grid}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Full Name
            </label>
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={input}
            />
          </div>
          
				<div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Password *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={input}
              required
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            id="is_admin"
            checked={form.is_admin}
            onChange={(e) => setForm({ ...form, is_admin: e.target.checked })}
            style={checkbox}
          />
          <label htmlFor="is_admin" style={{ fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
            Grant administrator privileges
          </label>
        </div>

        <div style={{ marginTop: '24px' }}>
          <button onClick={create} style={button}>
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Create User
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={card}>
        <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '600' }}>
          Search & Filter Users
        </h3>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by email, username, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...input, maxWidth: '400px' }}
          />
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ ...input, maxWidth: '200px', cursor: 'pointer' }}
          >
            <option value="">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="user">Regular Users</option>
          </select>
          
          <button onClick={() => { setSearchTerm(''); setFilterRole('') }} style={buttonSecondary}>
            Clear Filters
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {loading ? 'Loading...' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={card}>
        <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '600' }}>
          Users ({filteredUsers.length})
        </h3>
        
        {filteredUsers.length > 0 ? (
          <table style={table}>
            <thead>
              <tr>
                <th style={tableHeader}>User</th>
                <th style={tableHeader}>Email</th>
                <th style={tableHeader}>Role</th>
                <th style={tableHeader}>Status</th>
                <th style={tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id || index} style={tableRow} onMouseEnter={(e) => e.target.closest('tr').style.background = '#f9fafb'}>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={avatar(40)}>
                        {getInitials(user.name || user.username || user.email)}
								</div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                          {user.username || user.name || 'Unnamed User'}
							</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          ID: {user.id?.slice(-8)}
					</div>
				</div>
			</div>
                  </td>
                  <td style={tableCell}>
                    <div style={{ fontSize: '14px', color: '#374151' }}>
                      {user.email}
                    </div>
                  </td>
                  <td style={tableCell}>
                    <span style={badge(user.is_admin ? '#10b981' : '#6b7280')}>
                      {user.is_admin ? 'Administrator' : 'User'}
                    </span>
                  </td>
                  <td style={tableCell}>
                    <span style={badge('#3b82f6')}>
                      Active
                    </span>
                  </td>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => toggleAdmin(user)}
                        style={{ ...buttonSecondary, padding: '8px 12px', fontSize: '12px' }}
                      >
                        {user.is_admin ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => remove(user)}
                        style={{ ...buttonDanger, padding: '8px 12px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px 20px' }}>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>
              {loading ? 'Loading users...' : 'No users found'}
            </div>
            <div style={{ fontSize: '14px' }}>
              {!loading && 'Try adjusting your search filters or create some users to get started.'}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ ...card, borderColor: '#ef4444', background: '#fef2f2' }}>
          <div style={{ color: '#dc2626', fontSize: '14px', fontWeight: '600' }}>
            Error: {error}
          </div>
        </div>
      )}
		</div>
	)
}


