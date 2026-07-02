import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  MedicalServices,
  Work,
  School,
  Badge,
  Schedule,
  Phone,
  Email,
  LocationOn,
  Star,
  Male,
  Female,
  ArrowBack 
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// doctor.fullname

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await api.get(`/users/doctors/${doctorId}`);
        setDoctor(data.doctor);
        setAvailability(data.availability);
      } catch (err) {
        setError('Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!doctor) return <Alert severity="warning">Doctor not found</Alert>;

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>

          <Button
    startIcon={<ArrowBack />}
    onClick={() => navigate(-1)}
    sx={{ mb: 2, textTransform: 'none' }}
  >
    Back
  </Button>
          {/* رأس الملف الشخصي */}
          <Box display="flex" alignItems="center" gap={3} flexWrap="wrap" mb={4}>
            <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
              {doctor.fullName.charAt(0)}
            </Avatar>
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h4" fontWeight={700}>{doctor.fullName}</Typography>
                {doctor.gender === 'male' && <Male sx={{ color: '#1976d2', fontSize: 30 }} />}
                {doctor.gender === 'female' && <Female sx={{ color: '#d81b60', fontSize: 30 }} />}
              </Box>
              <Chip label={doctor.doctorDetails?.specialization || 'General'} color="primary" size="small" />
              <Box display="flex" gap={1} mt={1}>
                <Chip label={doctor.doctorDetails?.isVerified ? 'Verified' : 'Pending'} color={doctor.doctorDetails?.isVerified ? 'success' : 'warning'} size="small" />
                <Chip label={`${doctor.doctorDetails?.yearsOfExperience || 0} years exp`} icon={<Work />} variant="outlined" />
              </Box>
            </Box>
          </Box>


          <Grid container spacing={4}>
            {/* العمود الأيمن - المعلومات الشخصية */}
            <Grid item xs={12} md={5}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Contact Information</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2">{doctor.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">{doctor.phone || 'Not provided'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2">{doctor.address || 'Not provided'}</Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 3, mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Professional Details</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
                    <School fontSize="small" color="action" />
                    <Typography variant="body2"><strong>Qualifications:</strong> {doctor.doctorDetails?.qualifications || 'N/A'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Badge fontSize="small" color="action" />
                    <Typography variant="body2"><strong>License Number:</strong> {doctor.doctorDetails?.licenseNumber || 'N/A'}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* العمود الأيسر - الجدول الزمني */}
            <Grid item xs={12} md={7}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Working Hours</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {availability ? (
                    <>
                      <Typography variant="body2"><strong>Working Days:</strong> {availability.workingDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</Typography>
                      <Typography variant="body2"><strong>Hours:</strong> {availability.startTime} - {availability.endTime}</Typography>
                      {availability.breakStart && availability.breakEnd && (
                        <Typography variant="body2"><strong>Break:</strong> {availability.breakStart} - {availability.breakEnd}</Typography>
                      )}
                      <Typography variant="body2"><strong>Slot Duration:</strong> {availability.slotDuration} minutes</Typography>
                      <Typography variant="body2"><strong>Max Patients/Day:</strong> {availability.maxPatientsPerDay}</Typography>
                    </>
                  ) : (
                    <Typography variant="body2">No availability set yet.</Typography>
                  )}
                </CardContent>
              </Card>

              {/* زر الحجز */}
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(`/book/${doctorId}`)}
                  disabled={user?.role !== 'patient'}
                  sx={{ borderRadius: 2.5, px: 4 }}
                >
                  Book Appointment
                </Button>
              </Box>
              {user?.role !== 'patient' && (
                <Typography variant="caption" color="text.secondary" display="block" textAlign="right" mt={1}>
                  You need to be logged in as a patient to book an appointment.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}