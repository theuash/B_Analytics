import axios from 'axios'

const API_BASE = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const dashboardAPI = {
  // Get schema
  getSchema: async () => {
    const response = await api.get('/schema')
    return response.data
  },

  // Process query
  processQuery: async (query) => {
    const response = await api.post('/query', {
      query: query,
      use_uploaded_data: false
    })
    return response.data
  },

  // Process multi-query
  processMultiQuery: async (query) => {
    const response = await api.post('/multi-query', {
      query: query,
      use_uploaded_data: false
    })
    return response.data
  },

  // Upload CSV
  uploadCSV: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Get sample queries
  getSampleQueries: async () => {
    const response = await api.get('/sample-queries')
    return response.data
  },

  // Health check
  health: async () => {
    const response = await api.get('/health')
    return response.data
  }
}

export default api
