
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users')

        if (!response.ok) {
          throw new Error('Failed to retrieve users')
        }

        const data = await response.json()
        setUsers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <main>
      <h1>Contact Manager</h1>
      <h2>MongoDB Users</h2>

      {loading && <p>Loading users...</p>}

      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <div>
          <p>Total users: {users.length}</p>

          {users.map((user) => (
            <div key={user._id}>
              <h3>{user.firstName} {user.lastName}</h3>
              <p>Login: {user.login}</p>
              <p>MySQL ID: {user.mysqlId}</p>
              <hr />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default App
