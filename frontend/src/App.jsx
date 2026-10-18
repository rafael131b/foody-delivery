import { useState } from 'react'
import Auth from './components/Auth'
import OrdersPage from './pages/OrdersPage'

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('foody_user'))
    } catch {
      return null
    }
  })

  const authenticate = authenticatedUser => {
    localStorage.setItem('foody_user', JSON.stringify(authenticatedUser))
    setUser(authenticatedUser)
  }

  const logout = () => {
    localStorage.removeItem('foody_token')
    localStorage.removeItem('foody_user')
    setUser(null)
  }

  return user
    ? <OrdersPage user={user} onLogout={logout} />
    : <Auth onAuth={authenticate} />
}
