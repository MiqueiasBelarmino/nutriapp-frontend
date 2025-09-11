
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import NewPatient from './pages/NewPatient'
import PatientHistory from './pages/PatientHistory'
import NewConsultation from './pages/NewConsultation'
import NewMealPlan from './pages/NewMealPlan'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/new" element={<NewPatient />} />
            <Route path="/patient-history/:id" element={<PatientHistory />} />
            <Route path="/consultations/new" element={<NewConsultation />} />
            <Route path="/meal-plans/new" element={<NewMealPlan />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App
