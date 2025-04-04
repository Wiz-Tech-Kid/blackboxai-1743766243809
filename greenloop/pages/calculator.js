import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const EMISSION_CATEGORIES = {
  ENERGY: {
    label: 'Energy',
    subcategories: [
      { value: 'ELECTRICITY', label: 'Electricity' },
      { value: 'NATURAL_GAS', label: 'Natural Gas' },
      { value: 'SOLAR', label: 'Solar' }
    ],
    units: 'kWh'
  },
  TRANSPORT: {
    label: 'Transport',
    subcategories: [
      { value: 'CAR_GASOLINE', label: 'Car (Gasoline)' },
      { value: 'CAR_ELECTRIC', label: 'Car (Electric)' },
      { value: 'BUS', label: 'Bus' },
      { value: 'TRAIN', label: 'Train' },
      { value: 'PLANE', label: 'Plane' }
    ],
    units: 'km'
  },
  DIGITAL: {
    label: 'Digital',
    subcategories: [
      { value: 'CLOUD_STORAGE', label: 'Cloud Storage' },
      { value: 'STREAMING', label: 'Streaming' }
    ],
    units: 'GB/month'
  },
  WASTE: {
    label: 'Waste',
    subcategories: [
      { value: 'LANDFILL', label: 'Landfill' },
      { value: 'RECYCLING', label: 'Recycling' },
      { value: 'COMPOST', label: 'Compost' }
    ],
    units: 'kg'
  }
}

export default function Calculator() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    category: 'ENERGY',
    subcategory: 'ELECTRICITY',
    value: '',
    unit: 'kWh'
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Set default unit when category changes
    const categoryData = EMISSION_CATEGORIES[formData.category]
    setFormData(prev => ({
      ...prev,
      unit: categoryData.units,
      subcategory: categoryData.subcategories[0].value
    }))
  }, [formData.category])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/emissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Calculation failed')

      setResult({
        co2e: data.co2e,
        category: formData.category,
        subcategory: formData.subcategory
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Carbon Calculator | GreenLoop</title>
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Carbon Calculator</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Selection */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {Object.entries(EMISSION_CATEGORIES).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory Selection */}
              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  value={formData.subcategory}
                  onChange={handleChange}
                >
                  {EMISSION_CATEGORIES[formData.category].subcategories.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              {/* Value Input */}
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                  Value
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="value"
                    id="value"
                    step="0.01"
                    min="0"
                    required
                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    value={formData.value}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {formData.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Calculating...' : 'Calculate CO2 Emissions'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Your {EMISSION_CATEGORIES[result.category].label.toLowerCase()} ({EMISSION_CATEGORIES[result.category].subcategories.find(sc => sc.value === result.subcategory).label.toLowerCase()}) activity produces <span className="font-bold">{result.co2e.toFixed(2)} kg CO2e</span>.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="btn-primary"
                    >
                      View Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}