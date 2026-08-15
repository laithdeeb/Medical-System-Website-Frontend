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
  Stack,
} from '@mui/material';
import { CheckCircle, Cancel, Description, Download } from '@mui/icons-material';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: '1px solid #dbe8f0',
            boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Doctor Verification Requests
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Review pending doctor registrations
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {doctors.length === 0 ? (
            <Alert severity="info">No pending doctors to verify.</Alert>
          ) : (
            <Grid container spacing={3}>
              {doctors.map((doc) => {
                const cvDocuments = doc.doctorDetails?.documents || [];
                const hasCV = cvDocuments.length > 0;

                return (
                  <Grid item xs={12} md={6} key={doc._id}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        height: '100%',
                        transition: '0.2s',
                        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.04)' },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* الرأس: الاسم + حالة الانتظار */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                          <Box>
                            <Typography variant="h6" fontWeight={700}>
                              {doc.fullName}
                            </Typography>
                          </Box>
                        </Box>

                        {/* معلومات الاتصال */}
                        <Stack spacing={0.5} sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            📧 {doc.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📞 {doc.phone || 'Not provided'}
                          </Typography>
                        </Stack>

                        <Divider sx={{ my: 1.5 }} />

                        {/* التفاصيل المهنية (بدون تخصص) */}
                        {doc.doctorDetails && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                              Professional Details
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">Qualifications</Typography>
                                <Typography variant="body2">{doc.doctorDetails.qualifications || 'N/A'}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">License Number</Typography>
                                <Typography variant="body2">{doc.doctorDetails.licenseNumber || 'N/A'}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Years of Experience</Typography>
                                <Typography variant="body2">{doc.doctorDetails.yearsOfExperience || 0} years</Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        )}

                        {/* ===== قسم الـ CV (كما هو معجبك) ===== */}
                        {hasCV ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              bgcolor: '#f0f7ff',
                              p: 1.5,
                              borderRadius: 2,
                              border: '1px dashed #1976d2',
                              mb: 2,
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Description color="primary" fontSize="small" />
                              <Typography variant="body2" fontWeight={500}>
                                {cvDocuments.length} CV file{cvDocuments.length > 1 ? 's' : ''} attached
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<Download />}
                              component="a"
                              href={`${API_URL}${cvDocuments[0]}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Download
                            </Button>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: '#f5f5f5',
                              mb: 2,
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              <Description fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              No CV uploaded yet
                            </Typography>
                          </Box>
                        )}

                        <Divider sx={{ my: 1.5 }} />

                        {/* أزرار الإجراءات */}
<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
  <Button
    variant="outlined"
    color="error"
    startIcon={<Cancel />}
    disabled={actionId === doc._id}
    fullWidth  // هذه هي الحركة السحرية
    sx={{ borderRadius: 2, textTransform: 'none' }}
  >
    Reject
  </Button>
  <Button
    variant="contained"
    color="success"
    startIcon={<CheckCircle />}
    onClick={() => verifyDoctor(doc._id)}
    disabled={actionId === doc._id}
    fullWidth  // وهنا أيضاً
    sx={{ borderRadius: 2, textTransform: 'none' }}
  >
    {actionId === doc._id ? <CircularProgress size={20} /> : 'Approve'}
  </Button>
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
    </Box>
  );
}