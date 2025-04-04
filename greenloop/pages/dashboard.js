import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import ProtectedRoute from '../components/ProtectedRoute'
import Navbar from '../components/Navbar'
import { emissionsService, sdgService } from '../utils/api'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function Dashboard() {
  const [userData, setUserData] = useState(null)
  const [emissionsData, setEmissionsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        // Fetch user data
        const userRes = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const user = await userRes.json()
        setUserData(user)

        // Fetch emissions data
        const emissionsRes = await fetch('/api/emissions/user/' + user.id, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const emissions = await emissionsRes.json()
        setEmissionsData(emissions)

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const chartData = {
    labels: emissionsData?.emissionsByCategory?.map(item => item.category) || [],
    datasets: [
      {
        label: 'CO2 Emissions (kg)',
        data: emissionsData?.emissionsByCategory?.map(item => item.total) || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard | GreenLoop</title>
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {userData?.name}</span>
            <button 
              onClick={() => {
                localStorage.removeItem('token')
                router.push('/login')
              }}
              className="text-green-600 hover:text-green-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Emissions Summary */}
          <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Your Carbon Footprint</h2>
            {emissionsData ? (
              <>
                <div className="h-64">
                  <Doughnut data={chartData} />
                </div>
                <div className="mt-4">
                  <p className="text-lg">
                    Total Emissions: <span className="font-bold">{emissionsData.totalEmissions.toFixed(2)} kg CO2e</span>
                  </p>
                </div>
              </>
            ) : (
              <p>No emissions data available</p>
            )}
          </div>

          {/* SDG Impact */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">SDG Impact</h2>
            {emissionsData?.sdgImpact ? (
              <div className="space-y-4">
                {Object.entries(emissionsData.sdgImpact).map(([sdg, data]) => (
                  <div key={sdg}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{sdg}: {data.description}</span>
                      <span>{data.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${data.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No SDG impact data available</p>
            )}
          </div>

          {/* Reduction Tips */}
          <div className="bg-white shadow rounded-lg p-6 md:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Reduction Tips</h2>
            {emissionsData?.reductionTips?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {emissionsData.reductionTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            ) : (
              <p>Keep up the good work! Your emissions are below average.</p>
            )}
            <div className="mt-6">
              <Link href="/calculator">
                <a className="btn-primary">
                  Add New Emission Data
                </a>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}