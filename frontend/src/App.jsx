import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import AmazonHome from './pages/AmazonHome'
import Rehome from './pages/Rehome'
import Prevention from './pages/Prevention'
import HealthCard from './pages/HealthCard'
import AdminDashboard from './pages/AdminDashboard'
import WarehouseSubmit from './pages/WarehouseSubmit'
import WarehouseHealthCard from './pages/WarehouseHealthCard'
import CustomerOrders from './pages/CustomerOrders'

export default function App() {
  const [serverReady, setServerReady] = useState(false)
  const [waking, setWaking] = useState(true)
  const [wakingSeconds, setWakingSeconds] = useState(0)

  useEffect(() => {
    const startTime = Date.now()

    const timer = setInterval(() => {
      setWakingSeconds(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    const checkServer = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/health`)
        if (res.ok) {
          setServerReady(true)
          setWaking(false)
          clearInterval(timer)
        }
      } catch {
        setTimeout(checkServer, 3000)
      }
    }

    setTimeout(() => {
      checkServer()
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (waking && !serverReady) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#131921',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#FF9900',
            marginBottom: '8px'
          }}>
            amazon rehome
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #FF9900',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '24px auto'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
            Waking up the server...
          </div>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>
            This takes about 30–60 seconds on first load.
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            {wakingSeconds > 0 ? `${wakingSeconds}s elapsed` : 'Starting...'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<AmazonHome />} />
        <Route path="/rehome" element={<Rehome />} />
        <Route path="/prevention" element={<Prevention />} />
        <Route path="/health/:id" element={<HealthCard />} />
        <Route path="/orders" element={<CustomerOrders />} />
        {/* Warehouse routes */}
        <Route path="/warehouse" element={<WarehouseSubmit />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/health/:id" element={<WarehouseHealthCard />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
