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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  MedicalServices,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tabValue, setTabValue] = useState(0); // 0: upcoming, 1: past
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ open: false, id: null, newStatus: '' });
  const [viewDialog, setViewDialog] = useState({ open: false, appointment: null });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/doctor-appointments');
      setAppointments(data);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // تصفية المواعيد حسب التبويب (قادمة / سابقة)
  useEffect(() => {
    const now = new Date();
    let filteredList = [...appointments];
    if (tabValue === 0) {
      // قادمة: التاريخ أكبر من الآن أو اليوم مع وقت مستقبلي (تبسيطاً: التاريخ >= اليوم)
      filteredList = filteredList.filter(app => new Date(app.date) >= now);
    } else {
      // سابقة
      filteredList = filteredList.filter(app => new Date(app.date) < now);
    }
    // ترتيب تصاعدي للقادمة، تنازلي للسابقة
    filteredList.sort((a, b) => tabValue === 0 ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
    setFiltered(filteredList);
  }, [appointments, tabValue]);

  const updateAppointmentStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      // استخدم API مخصص لتحديث الحالة (سنضيفه في backend إذا لم يكن موجوداً)
      // حالياً نستخدم PUT /api/appointments/:id/cancel للإلغاء، لكن للتأكيد/الإكمال نحتاج endpoint جديد.
      // مؤقتاً سنضيف في backend (سأكتب التعديل لاحقاً) أو نستخدم نفس المسار مع body.
      // للتبسيط، سنفترض أن لدينا PUT /api/appointments/:id/status
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      setAppointments(prev =>
        prev.map(app => app._id === id ? { ...app, status: newStatus } : app)
      );
      setStatusDialog({ open: false, id: null, newStatus: '' });
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = (id) => {
    setStatusDialog({ open: true, id, newStatus: 'cancelled' });
  };

  const handleConfirm = (id) => {
    setStatusDialog({ open: true, id, newStatus: 'confirmed' });
  };

  const handleComplete = (id) => {
    setStatusDialog({ open: true, id, newStatus: 'completed' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Schedule
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Tabs value={tabValue} onChange={(e, newVal) => setTabValue(newVal)} sx={{ mb: 3 }}>
            <Tab label="Upcoming" />
            <Tab label="Past" />
          </Tabs>

          {filtered.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No appointments found.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {filtered.map((app) => (
                <Grid item xs={12} key={app._id}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {app.patient?.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📞 {app.patient?.phone || 'N/A'} | 📧 {app.patient?.email}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            📅 {new Date(app.date).toLocaleDateString()} | ⏰ {app.timeSlot}
                          </Typography>
                          <Typography variant="body2">
                            Type: {app.type === 'clinic' ? 'In Clinic' : 'Virtual'}
                          </Typography>
                          <Typography variant="body2">
                            Reason: {app.reason || 'Not specified'}
                          </Typography>
                          {app.notes && (
                            <Typography variant="body2" color="text.secondary">
                              Notes: {app.notes}
                            </Typography>
                          )}
                        </Box>
                        <Box textAlign="right" sx={{ minWidth: 150 }}>
                          <Chip
                            label={getStatusText(app.status)}
                            color={getStatusColor(app.status)}
                            sx={{ mb: 1 }}
                          />
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            {app.status === 'pending' && (
                              <>
                                <Tooltip title="Confirm">
                                  <IconButton color="success" onClick={() => handleConfirm(app._id)}>
                                    <CheckCircle />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton color="error" onClick={() => handleCancel(app._id)}>
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {app.status === 'confirmed' && (
                              <>
                                <Tooltip title="Mark Completed">
                                  <IconButton color="primary" onClick={() => handleComplete(app._id)}>
                                    <MedicalServices />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton color="error" onClick={() => handleCancel(app._id)}>
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="View Details">
                              <IconButton color="info" onClick={() => setViewDialog({ open: true, appointment: app })}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>

      {/* حوار تأكيد تغيير الحالة */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, id: null, newStatus: '' })}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change this appointment status to <strong>{statusDialog.newStatus}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, id: null, newStatus: '' })}>Cancel</Button>
          <Button onClick={() => updateAppointmentStatus(statusDialog.id, statusDialog.newStatus)} color="primary" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار عرض التفاصيل الكاملة */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, appointment: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {viewDialog.appointment && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle1"><strong>Patient:</strong> {viewDialog.appointment.patient?.fullName}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {viewDialog.appointment.patient?.email}</Typography>
              <Typography variant="body2"><strong>Phone:</strong> {viewDialog.appointment.patient?.phone || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {new Date(viewDialog.appointment.date).toLocaleDateString()}</Typography>
              <Typography variant="body2"><strong>Time:</strong> {viewDialog.appointment.timeSlot}</Typography>
              <Typography variant="body2"><strong>Type:</strong> {viewDialog.appointment.type === 'clinic' ? 'In Clinic' : 'Virtual'}</Typography>
              <Typography variant="body2"><strong>Reason:</strong> {viewDialog.appointment.reason || 'Not specified'}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {getStatusText(viewDialog.appointment.status)}</Typography>
              {viewDialog.appointment.notes && (
                <Typography variant="body2"><strong>Notes:</strong> {viewDialog.appointment.notes}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, appointment: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}