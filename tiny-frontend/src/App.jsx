/*
  App.jsx — React Router with Supabase auth gate
*/

import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './api/supabase'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Checkin from './pages/Checkin'
import Weekly from './pages/Weekly'
import Login from './pages/Login'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null // loading
  if (!session) return <Login />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Onboarding />} />
        <Route path="/home"    element={<Home />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/weekly"  element={<Weekly />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
