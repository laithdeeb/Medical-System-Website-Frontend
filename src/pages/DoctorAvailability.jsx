import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// ترتيب الأيام وترقيمها (0=الأحد، 1=الاثنين، ...)
const weekdays = [
  { number: 0, name: 'Sunday' },
  { number: 1, name: 'Monday' },
  { number: 2, name: 'Tuesday' },
  { number: 3, name: 'Wednesday' },
  { number: 4, name: 'Thursday' },
  { number: 5, name: 'Friday' },
  { number: 6, name: 'Saturday' },
];

export default function DoctorAvailability() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState({
    workingDays: [1, 2, 3, 4, 5], // أرقام
    startTime: new Date(2000, 0, 1, 9, 0),
    endTime: new Date(2000, 0, 1, 17, 0),
    breakStart: new Date(2000, 0, 1, 13, 0),
    breakEnd: new Date(2000, 0, 1, 14, 0),
    slotDuration: 30,
    maxPatientsPerDay: 15,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const { data } = await api.get('/availability');
      setAvailability({
        workingDays: data.workingDays || [1,2,3,4,5],
        startTime: new Date(`2000-01-01T${data.startTime}:00`),
        endTime: new Date(`2000-01-01T${data.endTime}:00`),
        breakStart: new Date(`2000-01-01T${data.breakStart}:00`),
        breakEnd: new Date(`2000-01-01T${data.breakEnd}:00`),
        slotDuration: data.slotDuration,
        maxPatientsPerDay: data.maxPatientsPerDay,
      });
    } catch (err) {
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayNumber) => {
    setAvailability(prev => {
      const newDays = prev.workingDays.includes(dayNumber)
        ? prev.workingDays.filter(d => d !== dayNumber)
        : [...prev.workingDays, dayNumber];
      return { ...prev, workingDays: newDays };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    // تحويل الأرقام إلى أسماء قبل الإرسال (لأن واجهة المستخدم تتعامل مع الأرقام، ولكن الـ backend يقبل أسماء أيضاً)
    const dayNames = availability.workingDays.map(num => weekdays.find(d => d.number === num).name);
    const payload = {
      workingDays: dayNames, // نرسل أسماء كما في السابق (الـ backend سيحولها إلى أرقام)
      startTime: availability.startTime.toTimeString().slice(0,5),
      endTime: availability.endTime.toTimeString().slice(0,5),
      breakStart: availability.breakStart.toTimeString().slice(0,5),
      breakEnd: availability.breakEnd.toTimeString().slice(0,5),
      slotDuration: availability.slotDuration,
      maxPatientsPerDay: availability.maxPatientsPerDay,
    };
    try {
      await api.post('/availability', payload);
      setSuccess('Availability saved successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>Manage Availability</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set your working days, hours, break times and slot duration.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Working Days</Typography>
                <FormGroup row>
                  {weekdays.map(day => (
                    <FormControlLabel
                      key={day.number}
                      control={<Checkbox checked={availability.workingDays.includes(day.number)} onChange={() => handleDayToggle(day.number)} />}
                      label={day.name}
                    />
                  ))}
                </FormGroup>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Start Time"
                  value={availability.startTime}
                  onChange={(newVal) => setAvailability({ ...availability, startTime: newVal })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="End Time"
                  value={availability.endTime}
                  onChange={(newVal) => setAvailability({ ...availability, endTime: newVal })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Break Start (optional)"
                  value={availability.breakStart}
                  onChange={(newVal) => setAvailability({ ...availability, breakStart: newVal })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Break End"
                  value={availability.breakEnd}
                  onChange={(newVal) => setAvailability({ ...availability, breakEnd: newVal })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Slot Duration (minutes)"
                  type="number"
                  value={availability.slotDuration}
                  onChange={(e) => setAvailability({ ...availability, slotDuration: parseInt(e.target.value) })}
                  InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Patients Per Day"
                  type="number"
                  value={availability.maxPatientsPerDay}
                  onChange={(e) => setAvailability({ ...availability, maxPatientsPerDay: parseInt(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" onClick={handleSave} disabled={saving} size="large" fullWidth sx={{ py: 1.5, borderRadius: 2.5 }}>
                  {saving ? <CircularProgress size={24} /> : 'Save Availability'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}