import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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

  useEffect(() => {
    if (user && user.role !== 'patient') {
      navigate('/');
    }
  }, [user, navigate]);

  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('routine');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetchingSlots, setFetchingSlots] = useState(false);

  useEffect(() => {
    const fetchDoctorAndAvailability = async () => {
      try {
        const { data } = await api.get(`/users/doctors/${doctorId}`);
        setDoctor(data.doctor);
        setAvailability(data.availability);
        if (!data.availability) {
          setError('This doctor has not set their availability yet.');
        }
      } catch (err) {
        setError('Failed to load doctor info');
      }
    };
    fetchDoctorAndAvailability();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate && doctorId && availability) {
      const fetchSlots = async () => {
        setFetchingSlots(true);
        try {
          const localDateStr = format(selectedDate, 'yyyy-MM-dd');
          const { data } = await api.get(`/appointments/available-slots/${doctorId}?date=${localDateStr}`);
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
  }, [selectedDate, doctorId, availability]);

  const shouldDisableDate = (date) => {
    if (!availability || !availability.workingDays) return true;
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const workingDayNames = availability.workingDays.map(num => dayMap[num]);
    return !workingDayNames.includes(dayName);
  };

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
      const localDateStr = format(selectedDate, 'yyyy-MM-dd');
      await api.post('/appointments', {
        doctorId,
        date: localDateStr,
        timeSlot: selectedSlot,
        reason,
        type: 'clinic',
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

  if (!doctor && !error) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error && !doctor) return <Alert severity="error">{error}</Alert>;

  const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const workingDayNames = availability?.workingDays?.map(num => dayMap[num]) || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Book Appointment
            </Typography>
            <Typography variant="body1" gutterBottom>
              with <strong>{doctor?.fullName}</strong>
            </Typography>
            {availability && (
              <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                Working days: {workingDayNames.join(', ')}
              </Typography>
            )}

            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    shouldDisableDate={shouldDisableDate}
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
                      disabled={!selectedDate || fetchingSlots || timeSlots.length === 0}
                    >
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {fetchingSlots && <Typography variant="caption">Loading available slots...</Typography>}
                  {!fetchingSlots && selectedDate && timeSlots.length === 0 && (
                    <Typography variant="caption" color="error">No available slots for this date.</Typography>
                  )}
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