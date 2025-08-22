import React, { useEffect, useState } from 'react'
import { adminListUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from '../api.js'

const card = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }
const input = { padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }
const button = { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#111827', color: 'white', cursor: 'pointer' }
const ghost = { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', color: '#111827', cursor: 'pointer' }

export default function Users() {
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({ email: '', password: '', username: '', name: '', is_admin: false })
	const [error, setError] = useState('')

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
		try {
			await adminCreateUser(form)
			setForm({ email: '', password: '', username: '', name: '', is_admin: false })
			await load()
		} catch (e) {
			alert(e.message || 'Failed to create user')
		}
	}

	const toggleAdmin = async (u) => {
		try { await adminUpdateUser(u.id, { is_admin: !u.is_admin }) ; await load() } catch (e) { alert('Update failed') }
	}

	const remove = async (u) => {
		if (!confirm('Delete user?')) return
		try { await adminDeleteUser(u.id) ; await load() } catch (e) { alert('Delete failed') }
	}

	return (
		<div>
			{loading ? 'Loading...' : null}
			{error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
				<div>
					<h4 style={{ margin: '0 0 8px 0' }}>Create user</h4>
					<div style={{ ...card, display: 'grid', gap: 8 }}>
						<input style={input} placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
						<input style={input} placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
						<input style={input} placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
						<input style={input} type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
						<label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
							<input type="checkbox" checked={form.is_admin} onChange={e=>setForm({...form, is_admin:e.target.checked})} /> Admin
						</label>
						<button onClick={create} style={button}>Create</button>
					</div>
				</div>
				<div>
					<h4 style={{ margin: '0 0 8px 0' }}>Users</h4>
					<div style={{ display: 'grid', gap: 8 }}>
						{users.map((u) => (
							<div key={u.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 8 }}>
								<div style={{ flex: 1 }}>
									<div style={{ fontWeight: 600 }}>{u.username || u.email}</div>
									<div style={{ fontSize: 12, color: '#6b7280' }}>{u.email}</div>
								</div>
								<button onClick={() => toggleAdmin(u)} style={ghost}>{u.is_admin ? 'Revoke admin' : 'Make admin'}</button>
								<button onClick={() => remove(u)} style={{ ...ghost, color: '#b91c1c' }}>Delete</button>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}


