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
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore, Medication, Science, Description } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function MyPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await api.get('/prescriptions/me');
      setPrescriptions(data);
    } catch (err) {
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
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
            prescriptions.map((pres) => (
              <Accordion key={pres._id} sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>Dr. {pres.doctor?.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(pres.date).toLocaleDateString()} - {pres.doctor?.specialization}
                      </Typography>
                    </Box>
                    <Chip label={pres.status} size="small" color={pres.status === 'active' ? 'success' : 'default'} />
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
            ))
          )}
        </Paper>
      </Container>
    </Box>
  );
}