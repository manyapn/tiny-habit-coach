/*
  api/client.js — Axios instance

  WHY AXIOS INSTEAD OF FETCH?
    fetch() is the native browser API and works fine. Axios adds:
    - Automatic JSON parsing (fetch requires .json() call)
    - Automatic JSON serialization for requests
    - A base URL you configure once (VITE_API_URL)
    - Better error handling (fetch doesn't throw on 4xx/5xx)

  WHY AN INSTANCE (not import axios directly)?
    Configuring once here means every API file just does:
      import api from './client'
      api.get('/habits/user-id')
    No base URL repeated everywhere. No JSON headers repeated everywhere.

  VITE_API_URL:
    Vite exposes .env variables that start with VITE_ to the frontend.
    During dev: http://localhost:5000
    In production: your Railway backend URL
    Never hardcode URLs in component code.
*/

import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
