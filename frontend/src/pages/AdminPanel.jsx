
import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function AdminPanel() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(() => alert('Erreur récupération utilisateurs'))
  }, [])

  return (
    <div>
      <h1>Panneau Admin</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} - {user.email} ({user.isActive ? 'actif' : 'désactivé'})
          </li>
        ))}
      </ul>
    </div>
  )
}
