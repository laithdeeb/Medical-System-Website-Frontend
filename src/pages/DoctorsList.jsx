import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, TextField, Box, CircularProgress } from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get('/users/doctors');
        setDoctors(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    setFiltered(doctors.filter(doc => doc.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (doc.doctorDetails?.specialization || '').toLowerCase().includes(search.toLowerCase())));
  }, [search, doctors]);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Find a Doctor</Typography>
      <TextField fullWidth label="Search by name or specialization" variant="outlined" sx={{ mb: 3 }} value={search} onChange={(e) => setSearch(e.target.value)} />
      <Grid container spacing={3}>
        {filtered.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6">{doc.fullName}</Typography>
                <Typography color="text.secondary" gutterBottom>{doc.doctorDetails?.specialization || 'General'}</Typography>
                <Typography variant="body2">{doc.doctorDetails?.qualifications}</Typography>
                <Typography variant="body2">📅 {doc.doctorDetails?.yearsOfExperience} years exp.</Typography>
                <Typography variant="body2">📞 {doc.phone || 'N/A'}</Typography>
                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => navigate(`/book/${doc._id}`)}>Book Appointment</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}