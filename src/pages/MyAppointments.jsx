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
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialog, setCancelDialog] = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/my-appointments');
      const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(sorted);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const id = cancelDialog.id;
    if (!id) return;
    setActionLoading(true);
    try {
      await api.put(`/appointments/${id}/cancel`);
      setAppointments(prev =>
        prev.map(app =>
          app._id === id ? { ...app, status: 'cancelled' } : app
        )
      );
      setCancelDialog({ open: false, id: null });
    } catch (err) {
      setError('Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
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
            My Appointments
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {appointments.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No appointments found.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {appointments.map((app) => {
                const isPending = app.status === 'pending';
                const isConfirmed = app.status === 'confirmed';
                const isRescheduledByAssistant = app.notes && app.notes.includes('Rescheduled to') && app.notes.includes('by assistant');

                return (
                  <Grid item xs={12} key={app._id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        border: '1px solid #dbe8f0',
                        transition: '0.2s',
                        '&:hover': { boxShadow: 3, borderColor: '#1976d2' },
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
                          {/* الجهة اليسرى: التفاصيل */}
                          <Box sx={{ flex: 1, minWidth: 200 }}>
                            <Typography variant="h6" gutterBottom>
                              Dr. {app.doctor?.fullName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {app.doctor?.doctorDetails?.specialization || 'General'}
                            </Typography>
                            <Divider sx={{ mb: 1.5 }} />
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              📅 {new Date(app.date).toLocaleDateString()} | ⏰ {app.timeSlot}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              Type: {app.type === 'clinic' ? 'In Clinic' : 'Virtual'}
                            </Typography>
                            {app.reason && (
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                Reason: {app.reason}
                              </Typography>
                            )}
                            {app.notes && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Notes: {app.notes}
                              </Typography>
                            )}
                            {isRescheduledByAssistant && (
                              <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 1 }}>
                                ℹ️ This appointment was rescheduled by an assistant. You can still cancel it if needed.
                              </Typography>
                            )}
                          </Box>

                          {/* الجهة اليمنى: الحالة + الأزرار */}
                          <Box
                            sx={{
                              mt: { xs: 2, sm: 0 },
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: 1,
                              minWidth: 120,
                            }}
                          >
                            <Chip
                              label={getStatusText(app.status)}
                              color={getStatusColor(app.status)}
                              sx={{ minWidth: 80 }}
                            />

                            {/* الأزرار حسب الحالة */}
                            {isPending && (
                              <>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  onClick={() => navigate(`/reschedule/${app._id}`)}
                                  sx={{ minWidth: 100 }}
                                >
                                  Reschedule
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => setCancelDialog({ open: true, id: app._id })}
                                  sx={{ minWidth: 100 }}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}

                            {isConfirmed && (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => setCancelDialog({ open: true, id: app._id })}
                                sx={{ minWidth: 100 }}
                              >
                                Cancel
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Paper>
      </Container>

      {/* حوار تأكيد الإلغاء */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, id: null })}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, id: null })}>No, Keep</Button>
          <Button onClick={handleCancel} color="error" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}