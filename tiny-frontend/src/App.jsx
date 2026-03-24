/*
  App.jsx — React Router 
*/

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Checkin from './pages/Checkin'
import Weekly from './pages/Weekly'

export default function App() {
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
