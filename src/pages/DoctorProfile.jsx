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
  Stack,
} from '@mui/material';
import {
  MedicalServices,
  Work,
  Badge,
  Schedule,
  Phone,
  Email,
  LocationOn,
  Male,
  Female,
  ArrowBack,
  Description,
  ContactMail,
  InsertDriveFile, // للـ CV (عرض فقط)
  PictureAsPdf,    // للـ CV (عرض فقط)
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// href

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
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: '1px solid #dbe8f0',
            boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)',
          }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mb: 3, textTransform: 'none', fontWeight: 500, fontSize: '1rem' }}
          >
            Back
          </Button>

          {/* === بطاقة الطبيب الرئيسية === */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: 4,
              mb: 5,
              p: 4,
              bgcolor: '#f8faff',
              borderRadius: 3,
              border: '1px solid #e3edf5',
            }}
          >
            <Avatar
              sx={{
                width: 130,
                height: 130,
                bgcolor: 'primary.main',
                fontSize: 56,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              }}
            >
              {doctor.fullName.charAt(0)}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1.5,
                }}
              >
                <Typography variant="h3" fontWeight={700}>
                  {doctor.fullName}
                </Typography>
                {doctor.gender === 'male' && <Male sx={{ color: '#1976d2', fontSize: 34 }} />}
                {doctor.gender === 'female' && <Female sx={{ color: '#d81b60', fontSize: 34 }} />}
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                <Chip
                  label={doctor.doctorDetails?.specialization || 'General'}
                  color="primary"
                  size="medium"
                  icon={<MedicalServices />}
                  sx={{ fontSize: '0.95rem' }}
                />
                <Chip
                  label={doctor.doctorDetails?.isVerified ? 'Verified' : 'Pending'}
                  color={doctor.doctorDetails?.isVerified ? 'success' : 'warning'}
                  size="small"
                  sx={{ fontSize: '0.85rem' }}
                />
                <Chip
                  label={`${doctor.doctorDetails?.yearsOfExperience || 0} years exp`}
                  icon={<Work />}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.85rem' }}
                />
              </Stack>

              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '100%', fontSize: '1rem' }}>
                {doctor.doctorDetails?.qualifications || 'No qualifications listed'}
              </Typography>
            </Box>
          </Box>

          {/* === المعلومات التفصيلية (3 أعمدة) === */}
          <Grid container spacing={4}>
            {/* العمود 1: معلومات الاتصال والتخصص المفصل + CV (عرض فقط) */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ContactMail fontSize="medium" color="primary" /> Contact
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Email fontSize="medium" color="action" />
                        <Typography variant="body1">{doctor.email}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Phone fontSize="medium" color="action" />
                        <Typography variant="body1">{doctor.phone || 'Not provided'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <LocationOn fontSize="medium" color="action" />
                        <Typography variant="body1">{doctor.address || 'Not provided'}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Badge fontSize="medium" color="primary" /> Professional
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle1" color="text.secondary">Qualifications</Typography>
                        <Typography variant="body1">{doctor.doctorDetails?.qualifications || 'N/A'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" color="text.secondary">License Number</Typography>
                        <Typography variant="body1">{doctor.doctorDetails?.licenseNumber || 'N/A'}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {doctor.doctorDetails?.specialization && (
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Description fontSize="medium" color="primary" /> Specialization
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {doctor.doctorDetails.specialization}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* ===== بطاقة CV (عرض فقط بدون أزرار رفع) ===== */}
                {doctor.doctorDetails?.documents && doctor.doctorDetails.documents.length > 0 && (
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InsertDriveFile fontSize="medium" color="primary" /> CV / Resume
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={1.5}>
                        {doctor.doctorDetails.documents.map((docUrl, index) => (
                          <Button
                            key={index}
                            component="a"
                            href={`http://localhost:5000${docUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<PictureAsPdf />}
                            fullWidth
                            sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                          >
                            {docUrl.split('/').pop() || `Document ${index + 1}`}
                          </Button>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Grid>

            {/* العمود 2: أوقات العمل */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule fontSize="medium" color="primary" /> Working Hours
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {availability ? (
                    <Stack spacing={2}>
                      <Typography variant="body1">
                        <strong>Days:</strong>{' '}
                        {availability.workingDays.map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Hours:</strong> {availability.startTime} - {availability.endTime}
                      </Typography>
                      {availability.breakStart && availability.breakEnd && (
                        <Typography variant="body1">
                          <strong>Break:</strong> {availability.breakStart} - {availability.breakEnd}
                        </Typography>
                      )}
                      <Typography variant="body1">
                        <strong>Slot Duration:</strong> {availability.slotDuration} min
                      </Typography>
                      <Typography variant="body1">
                        <strong>Max Patients/Day:</strong> {availability.maxPatientsPerDay}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body1">No availability set yet.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* العمود 3: زر الحجز */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', p: 3 }}>
                <Typography variant="h5" gutterBottom>Ready to book?</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                  Schedule your appointment with Dr. {doctor.fullName}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(`/book/${doctorId}`)}
                  disabled={user?.role !== 'patient'}
                  sx={{ borderRadius: 3, px: 6, py: 1.8, fontSize: '1rem', width: '100%' }}
                >
                  Book Appointment
                </Button>
                {user?.role !== 'patient' && (
                  <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
                    You need to be logged in as a patient to book.
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}