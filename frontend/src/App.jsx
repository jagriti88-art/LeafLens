import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Component Imports
import Navbar from './components/Navbar_updated';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Diagnosis from './pages/Diagnosis';
import Dashboard from './pages/Dashboard';
import DiagnosisReport from './pages/DiagnosisReport'; // ADD THIS IMPORT
import { useAuth } from './context/AuthContext';

// A "Protected Route" wrapper to prevent unauthorized access
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F0F4F0] font-sans">
        <Navbar />
        
        {/* AnimatePresence allows for smooth page transitions */}
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected Routes (Require Login) */}
            <Route 
              path="/diagnose" 
              element={
                <ProtectedRoute>
                  <Diagnosis />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* ADD THIS NEW PROTECTED ROUTE */}
            <Route 
              path="/report/:id" 
              element={
                <ProtectedRoute>
                  <DiagnosisReport />
                </ProtectedRoute>
              } 
            />

            {/* Redirect any unknown routes to Landing */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;