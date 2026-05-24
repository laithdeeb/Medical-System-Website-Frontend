import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // التأكد من أن المستخدم مريض
  useEffect(() => {
    if (user && user.role !== 'patient') {
      navigate('/');
    }
  }, [user, navigate]);

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('routine');
  const [type, setType] = useState('clinic');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // جلب بيانات الطبيب عند تحميل الصفحة
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await api.get(`/users/doctors`); // نحتاج API لجلب طبيب واحد (سنضيفه)
        const found = data.find(d => d._id === doctorId);
        setDoctor(found);
      } catch (err) {
        setError('Failed to load doctor info');
      }
    };
    fetchDoctor();
  }, [doctorId]);

  // جلب الأوقات المتاحة عند تغيير التاريخ
  useEffect(() => {
    if (selectedDate && doctorId) {
      const fetchSlots = async () => {
        setFetchingSlots(true);
        try {
          const formattedDate = selectedDate.toISOString().split('T')[0];
          const { data } = await api.get(`/appointments/available-slots/${doctorId}?date=${formattedDate}`);
          setTimeSlots(data);
          setSelectedSlot('');
        } catch (err) {
          setError('Failed to load available slots');
        } finally {
          setFetchingSlots(false);
        }
      };
      fetchSlots();
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate, doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      setError('Please select date and time slot');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/appointments', {
        doctorId,
        date: selectedDate.toISOString(),
        timeSlot: selectedSlot,
        reason,
        type,
        notes,
      });
      setSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/my-appointments'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>Book Appointment</Typography>
            <Typography variant="body1" gutterBottom>
              with <strong>{doctor.fullName}</strong> ({doctor.doctorDetails?.specialization || 'General'})
            </Typography>

            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    minDate={new Date()}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Time Slot</InputLabel>
                    <Select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      label="Time Slot"
                      disabled={!selectedDate || fetchingSlots}
                    >
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {fetchingSlots && <Typography variant="caption">Loading available slots...</Typography>}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Reason</InputLabel>
                    <Select value={reason} onChange={(e) => setReason(e.target.value)} label="Reason">
                      <MenuItem value="routine">Routine check-up</MenuItem>
                      <MenuItem value="emergency">Emergency consultation</MenuItem>
                      <MenuItem value="follow-up">Follow-up visit</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Appointment Type</InputLabel>
                    <Select value={type} onChange={(e) => setType(e.target.value)} label="Appointment Type">
                      <MenuItem value="clinic">In Clinic</MenuItem>
                      <MenuItem value="virtual">Virtual (Video Call)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes (optional)"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth sx={{ borderRadius: 2.5, py: 1.5 }}>
                    {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}