import { useEffect, useState } from 'react'
import Auth from './components/Auth'
import OrdersPage from './pages/OrdersPage'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    const handleExpiredSession = () => setSession(null)
    window.addEventListener('foody:unauthorized', handleExpiredSession)
    return () => window.removeEventListener('foody:unauthorized', handleExpiredSession)
  }, [])

  const authenticate = (authenticatedSession) => setSession(authenticatedSession)
  const logout = () => setSession(null)

  return (
    <ErrorBoundary>
      {session ? (
        <OrdersPage user={session} token={session.token} onLogout={logout} />
      ) : (
        <Auth onAuth={authenticate} />
      )}
    </ErrorBoundary>
  )
}
