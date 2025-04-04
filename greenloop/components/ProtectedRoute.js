import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { authService } from '../utils/api'

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No token found')
        }

        await authService.getCurrentUser()
        setIsAuthenticated(true)
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return isAuthenticated ? children : null
}