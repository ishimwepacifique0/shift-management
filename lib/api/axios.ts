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
    
    // Extract error message from response data
    const message = error?.response?.data?.message || 
                   error?.response?.data?.error || 
                   error?.message || 
                   "Request failed"
    
    return Promise.reject(new Error(message))
  },
)

export default apiClient



