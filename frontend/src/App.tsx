import { useState, useEffect, FormEvent } from 'react'
import './App.css'

const STORAGE_KEY = 'api_token'

interface Item {
  id: number
  type: string
  title: string
  description?: string // ✅ added
  created_at: string
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const [draft, setDraft] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [typeFilter, setTypeFilter] = useState('All')

  useEffect(() => {
    if (!token) return

    setLoading(true)
    setError(null)

    fetch('/items/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: Item[]) => {
        setItems(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [token])

  function handleConnect(e: FormEvent) {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    localStorage.setItem(STORAGE_KEY, trimmed)
    setToken(trimmed)
  }

  function handleDisconnect() {
    localStorage.removeItem(STORAGE_KEY)
    setToken('')
    setDraft('')
    setItems([])
    setError(null)
    setTypeFilter('All')
  }

  const typeOptions = Array.from(new Set(items.map((i) => i.type))).sort()
  const allTypeOptions = ['All', ...typeOptions]

  const filteredItems =
    typeFilter === 'All' ? items : items.filter((item) => item.type === typeFilter)

  if (!token) {
    return (
      <form className="token-form" onSubmit={handleConnect}>
        <h1>API Token</h1>
        <p>Enter your API token to connect.</p>
        <input
          type="password"
          placeholder="Token"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit">Connect</button>
      </form>
    )
  }

  return (
    <div>
      <header className="app-header">
        <h1>Items</h1>
        <button className="btn-disconnect" onClick={handleDisconnect}>
          Disconnect
        </button>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="typeFilter" style={{ marginRight: 8 }}>
              Type:
            </label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {allTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Title</th>
                <th>Description</th> {/* ✅ added */}
                <th>Created at</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.type}</td>
                  <td>{item.title}</td>
                  <td>{item.description ?? ''}</td> {/* ✅ added */}
                  <td>{item.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default App