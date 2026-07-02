import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Divider,
} from '@mui/material';
import { CheckCircle, Cancel, VerifiedUser } from '@mui/icons-material';
import api from '../services/api';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const { data } = await api.get('/admin/users');
      const pending = data.filter(u => u.role === 'doctor' && u.doctorDetails?.isVerified === false);
      setDoctors(pending);
    } catch (err) {
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const verifyDoctor = async (id) => {
    setActionId(id);
    try {
      await api.put(`/admin/doctors/${id}/verify`);
      fetchPendingDoctors();
    } catch (err) {
      setError('Failed to verify doctor');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>Doctor Verification Requests</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Review pending doctor registrations</Typography>
          <Divider sx={{ mb: 3 }} />

          {doctors.length === 0 ? (
            <Alert severity="info">No pending doctors to verify.</Alert>
          ) : (
            <Grid container spacing={3}>
              {doctors.map((doc) => (
                <Grid item xs={12} md={6} key={doc._id}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6">{doc.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">📧 {doc.email}</Typography>
                      <Typography variant="body2">📞 {doc.phone || 'N/A'}</Typography>
                      {doc.doctorDetails && (
                        <>
                          <Typography variant="body2" sx={{ mt: 1 }}><strong>Qualifications:</strong> {doc.doctorDetails.qualifications}</Typography>
                          <Typography variant="body2"><strong>License:</strong> {doc.doctorDetails.licenseNumber}</Typography>
                          <Typography variant="body2"><strong>Specialization:</strong> {doc.doctorDetails.specialization}</Typography>
                          <Typography variant="body2"><strong>Experience:</strong> {doc.doctorDetails.yearsOfExperience} years</Typography>
                        </>
                      )}
                      <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                        <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => verifyDoctor(doc._id)} disabled={actionId === doc._id}>
                          {actionId === doc._id ? <CircularProgress size={20} /> : 'Approve'}
                        </Button>
                        <Button variant="outlined" color="error" startIcon={<Cancel />}>Reject</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
}