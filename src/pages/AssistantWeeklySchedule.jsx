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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Warning, CalendarMonth } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AssistantWeeklySchedule() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(new Date());
  const [availability, setAvailability] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialog, setCancelDialog] = useState({ open: false, date: null, dateStr: '' });
  const [cancelling, setCancelling] = useState(false);
  const [doctorName, setDoctorName] = useState('');

  // ✅ جلب بيانات الطبيب المعين ومواعيده
  useEffect(() => {
    fetchDoctorAndSchedule();
  }, [startDate]);

  const fetchDoctorAndSchedule = async () => {
    setLoading(true);
    try {
      // جلب معلومات الطبيب المعين
      const docRes = await api.get('/assistant/assigned-doctor');
      setDoctorName(docRes.data?.fullName || 'Doctor');

      // جلب إعدادات التوافر
      const availRes = await api.get('/availability/doctor/' + docRes.data?._id);
      setAvailability(availRes.data);

      // جلب المواعيد للأسبوع
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      
      const appRes = await api.get('/assistant/appointments', {
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

  // response

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

  const hasCancellableAppointments = (date) => {
    const dayApps = getDayAppointments(date);
    return dayApps.some(app => app.status === 'pending' || app.status === 'confirmed');
  };

  const isWorkingDay = (date) => {
    if (!availability) return false;
    const dayOfWeek = date.getDay();
    return availability.workingDays.includes(dayOfWeek);
  };

  const formatDate = (date) => format(date, 'yyyy-MM-dd');

  const handleCancelDay = (date) => {
    const dateStr = formatDate(date);
    setCancelDialog({ open: true, date, dateStr });
  };

  const confirmCancelDay = async () => {
    if (cancelling) return;
    const { dateStr } = cancelDialog;
    setCancelling(true);
    try {
      const response = await api.post('/assistant/cancel-day', { date: dateStr });
      if (response.data.count > 0) {
        await fetchDoctorAndSchedule();
      } else {
        setError('No appointments to cancel.');
      }
      setCancelDialog({ open: false, date: null, dateStr: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel day');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!availability) return <Alert severity="info">Doctor has not set availability yet.</Alert>;

  const weekDays = getWeekDays();
  const totalAppointmentsThisWeek = appointments.length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Weekly Schedule - Dr. {doctorName}
            </Typography>

            <Box sx={{ mt: 2, mb: 3 }}>
              <DatePicker
                label="Select Week Starting"
                value={startDate}
                onChange={(newDate) => setStartDate(newDate)}
                slotProps={{ textField: { size: 'medium', fullWidth: true } }}
              />
            </Box>

            <Box
              sx={{
                mb: 4,
                p: 2,
                bgcolor: '#e8f4fd',
                borderRadius: 3,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CalendarMonth color="primary" />
              <Typography variant="h6">
                Total Appointments This Week: <strong>{totalAppointmentsThisWeek}</strong>
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {weekDays.map((day) => {
                const dayAppointments = getDayAppointments(day);
                const working = isWorkingDay(day);
                const cancellable = hasCancellableAppointments(day);
                const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
                const dateStr = day.toLocaleDateString();
                const bgColor = working ? '#ffffff' : '#f5f5f5';

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={day.toISOString()}>
                    <Card
                      variant="outlined"
                      sx={{
                        bgcolor: bgColor,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: '0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{dayName}</Typography>
                          {working && dayAppointments.length > 0 && (
                            <Chip
                              label={dayAppointments.length}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 'bold', minWidth: 30 }}
                            />
                          )}
                        </Box>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {dateStr}
                        </Typography>

                        {!working && (
                          <Chip label="Not working day" size="small" color="default" />
                        )}

                        {working && (
                          <>
                            <Typography variant="body2">
                              ⏰ {availability.startTime} - {availability.endTime}
                            </Typography>
                            {availability.breakStart && availability.breakEnd && (
                              <Typography variant="body2">
                                Break: {availability.breakStart} - {availability.breakEnd}
                              </Typography>
                            )}
                            <Typography variant="subtitle2" mt={1} fontWeight="bold">
                              Appointments ({dayAppointments.length}):
                            </Typography>
                            {dayAppointments.length === 0 && (
                              <Typography variant="body2">No appointments</Typography>
                            )}
                            {dayAppointments.slice(0, 2).map((app) => (
                              <Box key={app._id} mb={1} p={1} bgcolor="#f0f7ff" borderRadius={2}>
                                <Typography variant="body2" noWrap>
                                  {app.timeSlot} - {app.patient?.fullName}
                                </Typography>
                                <Chip
                                  label={app.status}
                                  size="small"
                                  color={
                                    app.status === 'confirmed'
                                      ? 'success'
                                      : app.status === 'pending'
                                      ? 'warning'
                                      : 'default'
                                  }
                                />
                              </Box>
                            ))}
                            {dayAppointments.length > 2 && (
                              <Typography variant="caption">
                                +{dayAppointments.length - 2} more
                              </Typography>
                            )}
                          </>
                        )}
                      </CardContent>

                      {working && cancellable && (
                        <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Warning />}
                            onClick={() => handleCancelDay(day)}
                            disabled={cancelling}
                            sx={{ textTransform: 'none' }}
                          >
                            Cancel Day
                          </Button>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {!weekDays.some((day) => isWorkingDay(day)) && (
              <Alert severity="info" sx={{ mt: 3 }}>
                No working days in this week.
              </Alert>
            )}
          </Paper>
        </Container>
      </Box>

      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, date: null, dateStr: '' })}>
        <DialogTitle>Emergency Day Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel <strong>all appointments</strong> on{' '}
            {cancelDialog.date?.toLocaleDateString()}? This action cannot be undone. Patients will
            be notified and asked to reschedule.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, date: null, dateStr: '' })}>
            No, Keep
          </Button>
          <Button
            onClick={confirmCancelDay}
            color="error"
            disabled={cancelling}
            variant="contained"
          >
            {cancelling ? <CircularProgress size={24} /> : 'Yes, Cancel All'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}