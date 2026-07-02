import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Refresh, EventBusy } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AssistantDashboard() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // State لإضافة القياسات الحيوية
  const [openVitalDialog, setOpenVitalDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitalForm, setVitalForm] = useState({
    height: '', weight: '', heartRate: '', bloodPressureSystolic: '', bloodPressureDiastolic: '',
    bloodSugar: '', temperature: '', notes: ''
  });
  const [submittingVital, setSubmittingVital] = useState(false);

  // State لإعادة جدولة المواعيد الملغاة
  const [openRescheduleDialog, setOpenRescheduleDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [availability, setAvailability] = useState(null); // توافر الطبيب
  const [newDate, setNewDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCancelledAppointments();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/assistant/patients');
      setDoctor(data.doctor);
      setPatients(data.patients);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchCancelledAppointments = async () => {
    try {
      const { data } = await api.get('/assistant/cancelled-emergency');
      setCancelledAppointments(data);
    } catch (err) {
      console.error('Failed to load cancelled appointments', err);
    }
  };

  // جلب توافر الطبيب
  const fetchDoctorAvailability = async (doctorId) => {
    try {
      const { data } = await api.get(`/availability/doctor/${doctorId}`);
      setAvailability(data);
    } catch (err) {
      console.error('Failed to load availability', err);
      setAvailability(null);
    }
  };

  // ========== Vital Signs ==========
  const handleOpenVitalDialog = (patient) => {
    setSelectedPatient(patient);
    setVitalForm({
      height: '', weight: '', heartRate: '', bloodPressureSystolic: '', bloodPressureDiastolic: '',
      bloodSugar: '', temperature: '', notes: ''
    });
    setOpenVitalDialog(true);
  };

  const handleVitalChange = (e) => {
    setVitalForm({ ...vitalForm, [e.target.name]: e.target.value });
  };

  const handleSubmitVital = async (e) => {
    e.preventDefault();
    setSubmittingVital(true);
    try {
      await api.post('/assistant/vitals', {
        patientId: selectedPatient._id,
        ...vitalForm,
      });
      setSuccess('Vital sign added successfully');
      setOpenVitalDialog(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vital sign');
    } finally {
      setSubmittingVital(false);
    }
  };

  // ========== Reschedule Emergency Appointments ==========
  const handleOpenRescheduleDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(null);
    setSelectedSlot('');
    setAvailableSlots([]);
    const doctorId = appointment.doctor?._id || appointment.doctor;
    if (doctorId) {
      fetchDoctorAvailability(doctorId);
    }
    setOpenRescheduleDialog(true);
  };

  // تعطيل الأيام التي لا يعمل فيها الطبيب
  const shouldDisableDate = (date) => {
    if (!availability) return true;
    const dayNumber = date.getDay(); // 0=Sunday, 1=Monday, ...
    return !availability.workingDays.includes(dayNumber);
  };

  const handleDateChange = async (date) => {
    setNewDate(date);
    if (date && selectedAppointment) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const doctorId = selectedAppointment.doctor?._id || selectedAppointment.doctor;
      if (!doctorId) {
        setError('Doctor ID not found');
        return;
      }
      try {
        const { data } = await api.get(`/appointments/available-slots/${doctorId}?date=${formattedDate}`);
        setAvailableSlots(data);
        setSelectedSlot('');
      } catch (err) {
        setError('Failed to load available slots');
      }
    } else {
      setAvailableSlots([]);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!newDate || !selectedSlot) {
      setError('Please select a new date and time slot');
      return;
    }
    setSubmittingReschedule(true);
    try {
      await api.post(`/assistant/reschedule/${selectedAppointment._id}`, {
        newDate: format(newDate, 'yyyy-MM-dd'),
        newTimeSlot: selectedSlot,
      });
      setSuccess('Appointment rescheduled successfully');
      setOpenRescheduleDialog(false);
      await fetchCancelledAppointments(); // تحديث القائمة
      await fetchData(); // تحديث قائمة المرضى (اختياري)
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reschedule failed');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  // تحويل أيام العمل إلى أسماء للعرض
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const workingDayNames = availability?.workingDays?.map(d => dayNames[d]) || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" fontWeight={700}>Assistant Dashboard</Typography>
              <Button startIcon={<Refresh />} onClick={() => { fetchData(); fetchCancelledAppointments(); }}>Refresh</Button>
            </Box>
            <Typography variant="h6" gutterBottom>Assigned Doctor: <strong>{doctor?.fullName}</strong></Typography>
            <Divider sx={{ my: 2 }} />

            <Tabs value={tabValue} onChange={(e, newVal) => setTabValue(newVal)} sx={{ mb: 2 }}>
              <Tab label="Patients" />
              <Tab label="Emergency Cancellations" icon={<EventBusy />} iconPosition="start" />
            </Tabs>

            {/* تبويب المرضى */}
            {tabValue === 0 && (
              <>
                <Typography variant="h5" gutterBottom>Patients of Dr. {doctor?.fullName}</Typography>
                {patients.length === 0 ? (
                  <Alert severity="info">No patients found for this doctor.</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patients.map(pat => (
                          <TableRow key={pat._id}>
                            <TableCell>{pat.fullName}</TableCell>
                            <TableCell>{pat.email}</TableCell>
                            <TableCell>{pat.phone || 'N/A'}</TableCell>
                            <TableCell>
                              <Button variant="contained" size="small" onClick={() => handleOpenVitalDialog(pat)} startIcon={<Add />}>Add Vital Signs</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}

            {/* تبويب المواعيد الملغاة */}
            {tabValue === 1 && (
              <>
                <Typography variant="h5" gutterBottom>Emergency Cancellations</Typography>
                {cancelledAppointments.length === 0 ? (
                  <Alert severity="info">No emergency cancelled appointments.</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Patient</TableCell>
                          <TableCell>Original Date</TableCell>
                          <TableCell>Time Slot</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cancelledAppointments.map(app => (
                          <TableRow key={app._id}>
                            <TableCell>{app.patient?.fullName}</TableCell>
                            <TableCell>{app.dateString}</TableCell>
                            <TableCell>{app.timeSlot}</TableCell>
                            <TableCell>{app.reason || 'Emergency cancellation'}</TableCell>
                            <TableCell>
                              <Button variant="contained" size="small" onClick={() => handleOpenRescheduleDialog(app)}>Reschedule</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </Paper>
        </Container>
      </Box>

      {/* حوار إضافة قياس حيوي */}
      <Dialog open={openVitalDialog} onClose={() => setOpenVitalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Vital Signs for {selectedPatient?.fullName}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField fullWidth label="Height (cm)" name="height" type="number" value={vitalForm.height} onChange={handleVitalChange} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Weight (kg)" name="weight" type="number" value={vitalForm.weight} onChange={handleVitalChange} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Heart Rate (bpm)" name="heartRate" type="number" value={vitalForm.heartRate} onChange={handleVitalChange} /></Grid>
              <Grid item xs={3}><TextField fullWidth label="BP Systolic" name="bloodPressureSystolic" type="number" value={vitalForm.bloodPressureSystolic} onChange={handleVitalChange} /></Grid>
              <Grid item xs={3}><TextField fullWidth label="BP Diastolic" name="bloodPressureDiastolic" type="number" value={vitalForm.bloodPressureDiastolic} onChange={handleVitalChange} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Blood Sugar (mg/dL)" name="bloodSugar" type="number" value={vitalForm.bloodSugar} onChange={handleVitalChange} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Temperature (°C)" name="temperature" type="number" value={vitalForm.temperature} onChange={handleVitalChange} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Notes" name="notes" multiline rows={2} value={vitalForm.notes} onChange={handleVitalChange} /></Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVitalDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitVital} variant="contained" disabled={submittingVital}>
            {submittingVital ? <CircularProgress size={24} /> : 'Save Vital Signs'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار إعادة جدولة الموعد الملغي */}
      <Dialog open={openRescheduleDialog} onClose={() => setOpenRescheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Patient: <strong>{selectedAppointment?.patient?.fullName}</strong></Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>Original: {selectedAppointment?.dateString} at {selectedAppointment?.timeSlot}</Typography>

            {availability && workingDayNames.length > 0 && (
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                Working days: {workingDayNames.join(', ')}
              </Typography>
            )}

            <DatePicker
              label="New Date"
              value={newDate}
              onChange={handleDateChange}
              shouldDisableDate={shouldDisableDate}
              minDate={new Date()}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
            />

            {availableSlots.length > 0 && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>New Time Slot</InputLabel>
                <Select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)} label="New Time Slot">
                  {availableSlots.map(slot => <MenuItem key={slot} value={slot}>{slot}</MenuItem>)}
                </Select>
              </FormControl>
            )}

            {newDate && availableSlots.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>No available slots for this date.</Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRescheduleDialog(false)}>Cancel</Button>
          <Button onClick={handleRescheduleSubmit} variant="contained" disabled={submittingReschedule || !newDate || !selectedSlot}>
            {submittingReschedule ? <CircularProgress size={24} /> : 'Confirm Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}