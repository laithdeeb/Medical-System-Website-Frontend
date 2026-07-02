import { useState, useEffect } from 'react';
import { Container, Paper, Box, Typography, TextField, Button, Grid, Alert, CircularProgress, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    doctorDetails: {
      qualifications: '',
      licenseNumber: '',
      specialization: '',
      yearsOfExperience: '',
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        doctorDetails: user.doctorDetails || {
          qualifications: '',
          licenseNumber: '',
          specialization: '',
          yearsOfExperience: '',
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDoctorDetailsChange = (e) => {
    setFormData({
      ...formData,
      doctorDetails: { ...formData.doctorDetails, [e.target.name]: e.target.value },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
      };
      if (user?.role === 'doctor') {
        payload.doctorDetails = formData.doctorDetails;
      }
      const { data } = await api.put('/users/profile', payload);
      // تحديث user في localStorage و Context
      const updatedUser = { ...user, ...data };
      updateUser(updatedUser);
      // يمكن تحديث السياق مباشرة (نحتاج دالة updateUser في AuthContext)
      // سنضيفها لاحقاً
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <CircularProgress />;

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>My Profile</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Update your personal information</Typography>
          <Divider sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone (optional)" name="phone" value={formData.phone} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    key={formData.gender}
                    labelId="gender-label"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

            </Grid>

            {user?.role === 'doctor' && (
              <>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Medical Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Qualifications" name="qualifications" value={formData.doctorDetails.qualifications} onChange={handleDoctorDetailsChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="License Number" name="licenseNumber" value={formData.doctorDetails.licenseNumber} onChange={handleDoctorDetailsChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Specialization" name="specialization" value={formData.doctorDetails.specialization} onChange={handleDoctorDetailsChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Years of Experience" name="yearsOfExperience" type="number" value={formData.doctorDetails.yearsOfExperience} onChange={handleDoctorDetailsChange} />
                  </Grid>
                </Grid>
              </>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ borderRadius: 2.5, textTransform: 'none', px: 4 }}>
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}