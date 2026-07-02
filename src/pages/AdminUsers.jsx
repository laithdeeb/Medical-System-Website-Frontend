import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Refresh, PersonAdd } from '@mui/icons-material';
import api from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignDialog, setAssignDialog] = useState({ open: false, assistantId: null, assistantName: '' });
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDoctors();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/admin/doctors-list');
      setDoctors(data);
    } catch (err) {
      console.error('Failed to load doctors', err);
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/users/${id}`, { isActive: !currentStatus });
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const openAssignDialog = (assistant) => {
    setSelectedDoctorId('');
    setAssignDialog({ open: true, assistantId: assistant._id, assistantName: assistant.fullName });
  };

  const handleAssign = async () => {
    if (!selectedDoctorId) {
      setError('Please select a doctor');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/admin/assign-assistant/${assignDialog.assistantId}`, { doctorId: selectedDoctorId });
      setAssignDialog({ open: false, assistantId: null, assistantName: '' });
      fetchUsers(); // تحديث القائمة لعرض الطبيب المعين
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" fontWeight={700}>Manage Users</Typography>
            <IconButton onClick={fetchUsers}><Refresh /></IconButton>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Assigned Doctor (Assistant only)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={user.role} size="small" />
                    </TableCell>
                    <TableCell>
                      {user.role === 'assistant' && user.assignedDoctor ? (
                        <Chip label={user.assignedDoctor?.fullName || 'Unknown'} size="small" color="primary" />
                      ) : user.role === 'assistant' ? (
                        <Typography variant="caption" color="text.secondary">Not assigned</Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={user.isActive ? 'Active' : 'Inactive'} color={user.isActive ? 'success' : 'error'} />
                    </TableCell>
                    <TableCell>
                      {user.role === 'assistant' && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PersonAdd />}
                          onClick={() => openAssignDialog(user)}
                          sx={{ mr: 1 }}
                        >
                          Assign Doctor
                        </Button>
                      )}
                      <Switch checked={user.isActive} onChange={() => toggleUserStatus(user._id, user.isActive)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* حوار تعيين مساعد لطبيب */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, assistantId: null, assistantName: '' })}>
        <DialogTitle>Assign Assistant to Doctor</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>Assistant: <strong>{assignDialog.assistantName}</strong></Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Select Doctor</InputLabel>
            <Select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              label="Select Doctor"
            >
              {doctors.map(doc => (
                <MenuItem key={doc._id} value={doc._id}>{doc.fullName} ({doc.specialization || 'General'})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog({ open: false, assistantId: null, assistantName: '' })}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}