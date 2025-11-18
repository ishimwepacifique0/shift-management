import axios from "axios"
import Cookies from "js-cookie"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002/api"
const resolvedBaseUrl = apiBaseUrl && apiBaseUrl.trim().length > 0
  ? apiBaseUrl
  : "http://localhost:3002/api"

export const apiClient = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  },
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("token")
    console.log('API Request:', config.url, 'Token:', token ? 'Present' : 'Missing')
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.error('No token found in cookies for request:', config.url)
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.message)
    
    // Handle 403 Forbidden specifically - but don't auto-logout
    if (error.response?.status === 403) {
      console.error('403 Forbidden - Authentication required. Token:', Cookies.get("token") ? 'Present' : 'Missing')
      // Don't auto-logout, let the component handle it
    }
    
    // Preserve the original error structure so components can access error.response.data
    // This allows components to extract error messages from different locations
    if (error.response) {
      // Keep the original axios error structure so error.response.data is accessible
      return Promise.reject(error)
    }
    
    // For non-response errors (network errors, etc.), create a new error
    const message = error?.message || "Request failed"
    return Promise.reject(new Error(message))
  },
)

export default apiClient



