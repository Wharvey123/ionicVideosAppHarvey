import { defineStore } from 'pinia'
import axios from '@/plugins/axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        _isInitialized: false
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        isInitialized: (state) => state._isInitialized
    },
    actions: {
        async initialize() {
            const token = localStorage.getItem('token')
            if (token) {
                this.token = token
                try {
                    const response = await axios.get('/user')
                    this.user = response.data
                } catch (error) {
                    console.error('Initialization error:', error)
                    this.clearAuth()
                }
            }
            this._isInitialized = true
        },

        async login(credentials) {
            try {
                const formData = new FormData()
                formData.append('email', credentials.email)
                formData.append('password', credentials.password)
                formData.append('device_name', 'IonicVideosApp')

                const response = await axios.post('/login', formData)

                if (!response.data.token) {
                    throw new Error('No token received in response')
                }

                this.token = response.data.token
                this.user = response.data.user || null
                localStorage.setItem('token', this.token)
                return true
            } catch (error) {
                console.error('Login error:', error.response?.data || error.message)
                throw new Error(error.response?.data?.message || 'Login failed')
            }
        },

        async register(userData) {
            try {
                if (userData.password !== userData.password_confirmation) {
                    throw new Error('Password and confirmation do not match')
                }

                const formData = new FormData()
                formData.append('name', userData.name)
                formData.append('email', userData.email)
                formData.append('password', userData.password)
                formData.append('password_confirmation', userData.password_confirmation)
                formData.append('device_name', 'IonicVideosApp')

                const response = await axios.post('/register', formData)

                if (!response.data.token) {
                    throw new Error('No token received in response')
                }

                this.token = response.data.token
                this.user = response.data.user || null
                localStorage.setItem('token', this.token)
                return true
            } catch (error) {
                console.error('Register error:', error.response?.data || error.message)

                // Handle validation errors from backend
                if (error.response?.data?.errors) {
                    const errorMessages = Object.values(error.response.data.errors)
                        .flat()
                        .join(', ')
                    throw new Error(errorMessages)
                }

                throw new Error(error.response?.data?.message || 'Registration failed')
            }
        },

        async logout() {
            try {
                await axios.post('/logout')
            } catch (error) {
                console.error('Logout error:', error)
            } finally {
                this.clearAuth()
            }
        },

        clearAuth() {
            this.token = null
            this.user = null
            localStorage.removeItem('token')
        }
    }
})