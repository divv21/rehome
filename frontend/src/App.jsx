import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SubmitReturn from './pages/SubmitReturn'
import AdminDashboard from './pages/AdminDashboard'
import Rehome from './pages/Rehome'
import Prevention from './pages/Prevention'
import HealthCard from './pages/HealthCard'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<SubmitReturn />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/rehome" element={<Rehome />} />
        <Route path="/prevention" element={<Prevention />} />
        <Route path="/health/:id" element={<HealthCard />} />
      </Routes>
    </BrowserRouter>
  )
}
