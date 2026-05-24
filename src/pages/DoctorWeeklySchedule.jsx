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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  EventAvailable,
  Today,
  Delete,
  Visibility,
  CalendarMonth,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// DeleteOutline 

export default function DoctorWeeklySchedule() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(new Date());
  const [availability, setAvailability] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [disabledDays, setDisabledDays] = useState([]); // تخزين الأيام المعطلة محلياً

  useEffect(() => {
    fetchData();
  }, [startDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // جلب إعدادات التوافر
      const availRes = await api.get('/availability');
      setAvailability(availRes.data);

      // حساب نهاية الأسبوع (بعد 7 أيام)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      // جلب المواعيد للفترة
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

  // توليد الأيام من startDate إلى startDate+6
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

  // الحصول على مواعيد يوم معين
  const getDayAppointments = (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return appointments.filter(
      (app) => new Date(app.date) >= startOfDay && new Date(app.date) <= endOfDay
    );
  };

  // هل اليوم ضمن أيام العمل حسب الإعدادات؟
  const isWorkingDay = (date) => {
    if (!availability) return false;
    const dayOfWeek = date.getDay();
    return availability.workingDays.includes(dayOfWeek);
  };

  // هل اليوم معطل يدوياً (إجازة)
  const isDisabledDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return disabledDays.includes(dateStr);
  };

  // تبديل حالة تعطيل اليوم (محلياً، يمكن رفعه للـ API لاحقاً)
  const toggleDisableDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setDisabledDays((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!availability)
    return (
      <Alert severity="info">
        Please set your availability first in "Set Availability" page.
      </Alert>
    );

  const weekDays = getWeekDays();
  const totalAppointmentsThisWeek = appointments.length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
          background:
            'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: '1px solid #dbe8f0',
              boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)',
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              mb={3}
            >
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Weekly Schedule
              </Typography>
              <DatePicker
                label="Select Week Starting"
                value={startDate}
                onChange={(newDate) => setStartDate(newDate)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>

            {/* إجمالي الحجوزات للأسبوع */}
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
                Total Appointments This Week:{' '}
                <strong>{totalAppointmentsThisWeek}</strong>
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {weekDays.map((day) => {
                const dayAppointments = getDayAppointments(day);
                const working = isWorkingDay(day);
                const disabled = isDisabledDay(day);
                const dayName = day.toLocaleDateString('en-US', {
                  weekday: 'long',
                });
                const dateStr = day.toLocaleDateString();

                // لون الخلفية بناءً على الحالة
                let bgColor = '#fff';
                if (disabled) bgColor = '#f9f0e8';
                else if (!working) bgColor = '#f5f5f5';
                else bgColor = '#ffffff';

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={day.toISOString()}>
                    <Card
                      variant="outlined"
                      sx={{
                        bgcolor: bgColor,
                        height: '100%',
                        transition: '0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{dayName}</Typography>
                          <Badge badgeContent={dayAppointments.length} color="primary" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {dateStr}
                        </Typography>

                        {!working && !disabled && (
                          <Chip label="Not working day" size="small" color="default" />
                        )}

                        {working && !disabled && (
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
                              <Box
                                key={app._id}
                                mb={1}
                                p={1}
                                bgcolor="#f0f7ff"
                                borderRadius={2}
                              >
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

                        {disabled && (
                          <Box mt={1}>
                            <Chip label="Day Off (Disabled)" color="error" size="small" />
                            <Typography variant="caption" display="block">
                              No appointments will be shown.
                            </Typography>
                          </Box>
                        )}

                        <Box mt={2} display="flex" justifyContent="flex-end">
                          <Tooltip title={disabled ? 'Enable day' : 'Take day off'}>
                            <IconButton
                              size="small"
                              color={disabled ? 'success' : 'warning'}
                              onClick={() => toggleDisableDay(day)}
                            >
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
              <Alert severity="info" sx={{ mt: 3 }}>
                No working days in this week or all days are disabled.
              </Alert>
            )}
          </Paper>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}