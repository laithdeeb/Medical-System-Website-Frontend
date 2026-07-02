import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  People,
  MedicalServices,
  Assignment,
  Pending,
  EventAvailable,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: <People fontSize="large" color="primary" />, color: '#1976d2' },
    { title: 'Patients', value: stats.totalPatients, icon: <People fontSize="large" />, color: '#2e7d32' },
    { title: 'Doctors', value: stats.totalDoctors, icon: <MedicalServices fontSize="large" />, color: '#ed6c02' },
    { title: 'Assistants', value: stats.totalAssistants, icon: <Assignment fontSize="large" />, color: '#9c27b0' },
    { title: 'Pending Doctors', value: stats.pendingDoctors, icon: <Pending fontSize="large" />, color: '#d32f2f' },
    { title: 'Total Appointments', value: stats.totalAppointments, icon: <EventAvailable fontSize="large" />, color: '#0288d1' },
    { title: 'Upcoming Appointments', value: stats.upcomingAppointments, icon: <EventAvailable fontSize="large" />, color: '#00796b' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>Admin Dashboard</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Welcome back, {user?.fullName}</Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" color="text.secondary">{card.title}</Typography>
                      {card.icon}
                    </Box>
                    <Typography variant="h3" fontWeight={700} sx={{ mt: 2, color: card.color }}>{card.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}