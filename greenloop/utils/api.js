const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Request failed')
  }

  return response.json()
}

export const authService = {
  async login(email, password) {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },

  async register(userData) {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },

  async getCurrentUser() {
    return fetchWithAuth('/auth/me')
  }
}

export const emissionsService = {
  async calculateEmission(emissionData) {
    return fetchWithAuth('/emissions', {
      method: 'POST',
      body: JSON.stringify(emissionData)
    })
  },

  async getUserEmissions(userId) {
    return fetchWithAuth(`/emissions/user/${userId}`)
  },

  async getEmissionsSummary(userId) {
    return fetchWithAuth(`/dashboard/${userId}`)
  }
}

export const sdgService = {
  async getImpactData(userId) {
    return fetchWithAuth(`/sdg/impact/${userId}`)
  }
}
