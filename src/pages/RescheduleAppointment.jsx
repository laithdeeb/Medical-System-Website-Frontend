import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Container,
  Paper,
  Typography,
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

export default function RescheduleAppointment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // جلب بيانات الموعد الحالي
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // ملاحظة: نحتاج API لجلب موعد معين. يمكنك إضافته أو استدعاء my-appointments وتصفية
        // للتبسيط، سنفترض أن لدينا GET /appointments/:id
        const { data } = await api.get(`/appointments/${appointmentId}`);
        setAppointment(data);
        setSelectedDate(new Date(data.dateString));
        setSelectedSlot(data.timeSlot);
        // جلب بيانات الطبيب وتوافره
        const doctorRes = await api.get(`/users/doctors/${data.doctor._id}`);
        setDoctor(doctorRes.data.doctor);
        setAvailability(doctorRes.data.availability);
      } catch (err) {
        setError('Failed to load appointment');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  // جلب الأوقات المتاحة عند تغيير التاريخ
  useEffect(() => {
    if (selectedDate && doctor && availability) {
      const fetchSlots = async () => {
        try {
          const localDateStr = format(selectedDate, 'yyyy-MM-dd');
          const { data } = await api.get(`/appointments/available-slots/${doctor._id}?date=${localDateStr}`);
          setTimeSlots(data);
          // إذا كان الوقت الحالي لا يزال متاحاً، اتركه؛ وإلا افرغه
          if (!data.includes(selectedSlot)) {
            setSelectedSlot('');
          }
        } catch (err) {
          setError('Failed to load available slots');
        }
      };
      fetchSlots();
    }
  }, [selectedDate, doctor, availability, selectedSlot]);

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
      setError('Please select a new date and time slot');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const localDateStr = format(selectedDate, 'yyyy-MM-dd');
      await api.put(`/appointments/${appointmentId}/reschedule`, {
        date: localDateStr,
        timeSlot: selectedSlot,
      });
      setSuccess('Appointment rescheduled successfully!');
      setTimeout(() => navigate('/my-appointments'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reschedule failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error && !appointment) return <Alert severity="error">{error}</Alert>;
  if (!appointment) return <Alert severity="warning">Appointment not found</Alert>;

  const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const workingDayNames = availability?.workingDays?.map(num => dayMap[num]) || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>Reschedule Appointment</Typography>
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
                    label="Select New Date"
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    shouldDisableDate={shouldDisableDate}
                    minDate={new Date()}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>New Time Slot</InputLabel>
                    <Select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      label="New Time Slot"
                      disabled={!selectedDate || timeSlots.length === 0}
                    >
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {selectedDate && timeSlots.length === 0 && (
                    <Typography variant="caption" color="error">No available slots for this date.</Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" size="large" disabled={saving} fullWidth sx={{ borderRadius: 2.5, py: 1.5 }}>
                    {saving ? <CircularProgress size={24} /> : 'Confirm Reschedule'}
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