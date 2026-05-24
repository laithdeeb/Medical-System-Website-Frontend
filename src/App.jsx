import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import BookAppointment from './pages/BookAppointment';
import { Box, CircularProgress } from '@mui/material';
import DoctorsList from './pages/DoctorsList';
import MyAppointments from './pages/MyAppointments';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorAvailability from './pages/DoctorAvailability';
import DoctorWeeklySchedule from './pages/DoctorWeeklySchedule';


import DoctorHomeScreen from './pages/DoctorHomeScreen';
import PatientHomeScreen from './pages/PatientHomeScreen';

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/nothing" element={<DoctorHomeScreen />} />
        <Route path="/doctors" element={<ProtectedRoute><DoctorsList /></ProtectedRoute>} />
        <Route path="/patient" element={<PatientHomeScreen />} />
        <Route path="/book/:doctorId" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
        <Route path="/doctor-appointments" element={<ProtectedRoute><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/doctor-availability" element={<ProtectedRoute><DoctorAvailability /></ProtectedRoute>} />
        <Route path="/doctor-weekly-schedule" element={<ProtectedRoute><DoctorWeeklySchedule /></ProtectedRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

function App() {
  return <AppContent />;
}

export default App;