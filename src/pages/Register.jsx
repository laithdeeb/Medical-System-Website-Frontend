import { useState } from 'react';
import { Container, Paper, Box, Stack, Typography, Button, TextField, Alert, Select, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      await registerUser(payload);
      alert('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'left' }}>
              <MedicalServicesIcon color="primary" sx={{ fontSize: 140, mx: 'auto', display: 'block' }} />
              <Typography variant="h1" color="primary" sx={{ fontWeight: 700, fontSize: 60, display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                MediServe
              </Typography>
              <Typography variant="overline" sx={{ letterSpacing: 1.2 }}>Medical Services Portal</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>Sign up</Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField label="Full Name" name="fullName" fullWidth value={formData.fullName} onChange={handleChange} required />
              <TextField label="Email" name="email" type="email" fullWidth value={formData.email} onChange={handleChange} required />
              <TextField label="Password" name="password" type="password" fullWidth value={formData.password} onChange={handleChange} required />
              <TextField label="Confirm Password" name="confirmPassword" type="password" fullWidth value={formData.confirmPassword} onChange={handleChange} required />
              
              <FormControl fullWidth>
                <InputLabel id="role-label">User Type</InputLabel>
                <Select labelId="role-label" name="role" value={formData.role} onChange={handleChange} label="User Type">
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="assistant">Assistant</MenuItem>
                </Select>
              </FormControl>

              <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.4, borderRadius: 2.5, textTransform: 'none' }}>
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </Box>

            <Typography align="center">
              Already have an account?{' '}
              <Button component={Link} to="/login" sx={{ textTransform: 'none' }}>Log in</Button>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}