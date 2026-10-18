import { useEffect, useState } from 'react'
import Auth from './components/Auth'
import OrdersPage from './pages/OrdersPage'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('foody_user'))
      return storedUser && typeof storedUser.name === 'string' ? storedUser : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    const handleExpiredSession = () => setUser(null)
    window.addEventListener('foody:unauthorized', handleExpiredSession)
    return () => window.removeEventListener('foody:unauthorized', handleExpiredSession)
  }, [])

  const authenticate = authenticatedUser => {
    localStorage.setItem('foody_user', JSON.stringify(authenticatedUser))
    setUser(authenticatedUser)
  }

  const logout = () => {
    localStorage.removeItem('foody_token')
    localStorage.removeItem('foody_user')
    setUser(null)
  }

  return (
    <ErrorBoundary>
      {user
        ? <OrdersPage user={user} onLogout={logout} />
        : <Auth onAuth={authenticate} />}
    </ErrorBoundary>
  )
}
