// MyPrescriptions.jsx (النسخة المعدلة)

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { ExpandMore, Medication, Description, ThumbUp } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function MyPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState({}); // { doctorId: boolean }
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await api.get('/prescriptions/me');
      setPrescriptions(data);
      // بعد جلب الوصفات، نتحقق من حالة التوصية لكل طبيب
      const doctorIds = [...new Set(data.map(p => p.doctor?._id).filter(Boolean))];
      const statuses = {};
      for (const id of doctorIds) {
        try {
          const res = await api.get(`/recommendations/check/${id}`);
          statuses[id] = res.data.recommended;
        } catch {
          statuses[id] = false;
        }
      }
      setRecommendations(statuses);
    } catch (err) {
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendClick = (doctorId, prescriptionId) => {
    setSelectedDoctorId(doctorId);
    setSelectedPrescriptionId(prescriptionId);
    setDialogOpen(true);
  };

  const handleConfirmRecommend = async () => {
    setSubmitting(true);
    try {
      await api.post('/recommendations', {
        doctorId: selectedDoctorId,
        prescriptionId: selectedPrescriptionId,
      });
      // تحديث الحالة محلياً
      setRecommendations(prev => ({ ...prev, [selectedDoctorId]: true }));
      setDialogOpen(false);
      alert('Thank you! Your recommendation has been recorded.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to recommend');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>My Prescriptions</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>All your prescribed medications and instructions</Typography>
          <Divider sx={{ mb: 3 }} />

          {prescriptions.length === 0 ? (
            <Alert severity="info">No prescriptions found.</Alert>
          ) : (
            prescriptions.map((pres) => {
              const doctorId = pres.doctor?._id;
              const isRecommended = doctorId ? recommendations[doctorId] : false;

              return (
                <Accordion key={pres._id} sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>Dr. {pres.doctor?.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(pres.date).toLocaleDateString()} - {pres.doctor?.specialization}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip label={pres.status} size="small" color={pres.status === 'active' ? 'success' : 'default'} />
                        {doctorId && (
                          isRecommended ? (
                            <Chip label="Recommended" size="small" color="primary" icon={<ThumbUp />} />
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ThumbUp />}
                              onClick={() => handleRecommendClick(doctorId, pres._id)}
                            >
                              Recommend
                            </Button>
                          )
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="subtitle2" gutterBottom><Medication fontSize="small" /> Medications</Typography>
                    {pres.medications.map((med, index) => (
                      <Card key={index} variant="outlined" sx={{ mb: 1, bgcolor: '#f9fafb' }}>
                        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="body2"><strong>{med.name}</strong> - {med.dosage}</Typography>
                          <Typography variant="caption" display="block">Frequency: {med.frequency} | Duration: {med.duration}</Typography>
                          {med.notes && <Typography variant="caption" color="text.secondary">Notes: {med.notes}</Typography>}
                        </CardContent>
                      </Card>
                    ))}
                    {pres.instructions && (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}><Description fontSize="small" /> Instructions</Typography>
                        <Typography variant="body2">{pres.instructions}</Typography>
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </Paper>
      </Container>

      {/* حوار التأكيد */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Recommend Doctor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to recommend this doctor? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRecommend} color="primary" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Yes, Recommend'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}