import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  EventAvailable,
  Today,
  Delete,
  Warning,
  CalendarMonth,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function DoctorWeeklySchedule() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(new Date());
  const [availability, setAvailability] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [disabledDays, setDisabledDays] = useState([]);
  const [cancelDialog, setCancelDialog] = useState({ open: false, date: null, dateStr: '' });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchData();
  }, [startDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const availRes = await api.get('/availability');
      setAvailability(availRes.data);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      const appRes = await api.get('/appointments/doctor-appointments', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });
      setAppointments(appRes.data);
    } catch (err) {
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getDayAppointments = (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return appointments.filter(
      (app) => new Date(app.date) >= startOfDay && new Date(app.date) <= endOfDay
    );
  };

  const isWorkingDay = (date) => {
    if (!availability) return false;
    const dayOfWeek = date.getDay();
    return availability.workingDays.includes(dayOfWeek);
  };

  const isDisabledDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return disabledDays.includes(dateStr);
  };

  const toggleDisableDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setDisabledDays((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleCancelDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setCancelDialog({ open: true, date, dateStr });
  };

  const confirmCancelDay = async () => {
    const { dateStr, date } = cancelDialog;
    setCancelling(true);
    try {
      await api.post('/appointments/cancel-day', { date: dateStr });
      // إعادة تحميل البيانات
      await fetchData();
      setCancelDialog({ open: false, date: null, dateStr: '' });
      // عرض رسالة نجاح (يمكن إضافة Snackbar)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel day');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!availability) return <Alert severity="info">Please set your availability first.</Alert>;

  const weekDays = getWeekDays();
  const totalAppointmentsThisWeek = appointments.length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={3}>
              <Typography variant="h4" fontWeight={700}>Weekly Schedule</Typography>
              <DatePicker label="Select Week Starting" value={startDate} onChange={(newDate) => setStartDate(newDate)} slotProps={{ textField: { size: 'small' } }} />
            </Box>

            <Box sx={{ mb: 4, p: 2, bgcolor: '#e8f4fd', borderRadius: 3, display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonth color="primary" />
              <Typography variant="h6">Total Appointments This Week: <strong>{totalAppointmentsThisWeek}</strong></Typography>
            </Box>

            <Grid container spacing={3}>
              {weekDays.map((day) => {
                const dayAppointments = getDayAppointments(day);
                const working = isWorkingDay(day);
                const disabled = isDisabledDay(day);
                const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
                const dateStr = day.toLocaleDateString();
                let bgColor = '#fff';
                if (disabled) bgColor = '#f9f0e8';
                else if (!working) bgColor = '#f5f5f5';
                else bgColor = '#ffffff';

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={day.toISOString()}>
                    <Card variant="outlined" sx={{ bgcolor: bgColor, height: '100%', transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{dayName}</Typography>
                          <Badge badgeContent={dayAppointments.length} color="primary" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>{dateStr}</Typography>

                        {!working && !disabled && <Chip label="Not working day" size="small" color="default" />}

                        {working && !disabled && (
                          <>
                            <Typography variant="body2">⏰ {availability.startTime} - {availability.endTime}</Typography>
                            {availability.breakStart && availability.breakEnd && (
                              <Typography variant="body2">Break: {availability.breakStart} - {availability.breakEnd}</Typography>
                            )}
                            <Typography variant="subtitle2" mt={1} fontWeight="bold">Appointments ({dayAppointments.length}):</Typography>
                            {dayAppointments.length === 0 && <Typography variant="body2">No appointments</Typography>}
                            {dayAppointments.slice(0, 2).map((app) => (
                              <Box key={app._id} mb={1} p={1} bgcolor="#f0f7ff" borderRadius={2}>
                                <Typography variant="body2" noWrap>{app.timeSlot} - {app.patient?.fullName}</Typography>
                                <Chip label={app.status} size="small" color={app.status === 'confirmed' ? 'success' : app.status === 'pending' ? 'warning' : 'default'} />
                              </Box>
                            ))}
                            {dayAppointments.length > 2 && <Typography variant="caption">+{dayAppointments.length - 2} more</Typography>}
                          </>
                        )}

                        {disabled && (
                          <Box mt={1}>
                            <Chip label="Day Off" color="error" size="small" />
                            <Typography variant="caption" display="block">No appointments shown.</Typography>
                          </Box>
                        )}

                        <Box mt={2} display="flex" justifyContent="space-between">
                          <Tooltip title="Cancel all appointments this day (emergency)">
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Warning />}
                              onClick={() => handleCancelDay(day)}
                              disabled={dayAppointments.length === 0}
                            >
                              Cancel Day
                            </Button>
                          </Tooltip>
                          <Tooltip title={disabled ? 'Enable day' : 'Take day off'}>
                            <IconButton size="small" color={disabled ? 'success' : 'warning'} onClick={() => toggleDisableDay(day)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {!weekDays.some((day) => isWorkingDay(day) && !isDisabledDay(day)) && (
              <Alert severity="info" sx={{ mt: 3 }}>No working days in this week or all days are disabled.</Alert>
            )}
          </Paper>
        </Container>
      </Box>

      {/* حوار تأكيد إلغاء اليوم */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, date: null, dateStr: '' })}>
        <DialogTitle>Emergency Day Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel <strong>all appointments</strong> on {cancelDialog.date?.toLocaleDateString()}?
            This action cannot be undone. Patients will be notified and asked to reschedule.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, date: null, dateStr: '' })}>No, Keep</Button>
          <Button onClick={confirmCancelDay} color="error" disabled={cancelling}>
            {cancelling ? <CircularProgress size={24} /> : 'Yes, Cancel All'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}