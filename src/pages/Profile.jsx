import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Wc,
  School,
  Badge,
  Science,
  Work,
  InsertDriveFile,
  PictureAsPdf,
  CloudUpload,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// ===== دوال التحقق =====
const isValidFullName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const nameRegex = /^[\p{L}][\p{L}\s]{1,}$/u;
  return nameRegex.test(name.trim());
};

const isValidPhone = (phone) => {
  if (!phone) return true;
  const phoneRegex = /^[\d+\-()\s]{7,15}$/;
  return phoneRegex.test(phone.trim());
};

// ===== قائمة المحافظات السورية بالعربية =====
const SYRIAN_GOVERNORATES_AR = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'جبلة',
  'إدلب',
  'دير الزور',
  'الحسكة',
  'الرقة',
  'درعا',
  'السويداء',
  'القنيطرة',
];

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [uploadingCV, setUploadingCV] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      documents: [],
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
          documents: [],
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'yearsOfExperience' && value < 0) return;
    setFormData({ ...formData, [name]: value });

    if (name === 'fullName') setNameError('');
    if (name === 'phone') setPhoneError('');
  };

  const handleDoctorDetailsChange = (e) => {
    const { name, value } = e.target;
    if (name === 'yearsOfExperience' && value < 0) return;
    setFormData({
      ...formData,
      doctorDetails: { ...formData.doctorDetails, [name]: value },
    });
  };

  const handleCVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'File size must be less than 5MB.', severity: 'error' });
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('cv', file);

    setUploadingCV(true);
    try {
      const { data } = await api.post('/users/doctor/upload-cv', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({
        ...prev,
        doctorDetails: {
          ...prev.doctorDetails,
          documents: data.documents,
        },
      }));
      setSnackbar({ open: true, message: 'CV uploaded successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Upload failed.',
        severity: 'error',
      });
    } finally {
      setUploadingCV(false);
      event.target.value = '';
    }
  };

  const handleDeleteDocument = async (index) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const updatedDocs = formData.doctorDetails.documents.filter((_, i) => i !== index);
      await api.put('/users/profile', {
        doctorDetails: { documents: updatedDocs },
      });
      setFormData((prev) => ({
        ...prev,
        doctorDetails: { ...prev.doctorDetails, documents: updatedDocs },
      }));
      setSnackbar({ open: true, message: 'Document deleted.', severity: 'info' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Delete failed.', severity: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidFullName(formData.fullName)) {
      setNameError('Full name must start with a letter and be at least 2 characters long.');
      return;
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      setPhoneError('Must contain only numbers.');
      return;
    }

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
      const updatedUser = { ...user, ...data };
      updateUser(updatedUser);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <CircularProgress />;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)',
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: '1px solid #dbe8f0',
            boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Update your personal information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* ===== Full Name ===== */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  error={!!nameError}
                  helperText={nameError || 'Must start with a letter (at least 2 characters)'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* ===== Email ===== */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* ===== Phone ===== */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone (optional)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!phoneError}
                  helperText={phoneError || 'e.g., +963 11 1234567'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* ===== Address (Select) ===== */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="address-label">Address</InputLabel>
                  <Select
                    labelId="address-label"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    label="Address"
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOn color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">None</MenuItem>
                    {SYRIAN_GOVERNORATES_AR.map((city) => (
                      <MenuItem key={city} value={city}>{city}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* ===== Gender ===== */}
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
                    startAdornment={
                      <InputAdornment position="start">
                        <Wc color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* ===== Doctor Details ===== */}
            {user?.role === 'doctor' && (
              <>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Medical Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Qualifications"
                      name="qualifications"
                      value={formData.doctorDetails.qualifications}
                      onChange={handleDoctorDetailsChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <School color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="License Number"
                      name="licenseNumber"
                      value={formData.doctorDetails.licenseNumber}
                      onChange={handleDoctorDetailsChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Badge color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Specialization"
                      name="specialization"
                      value={formData.doctorDetails.specialization}
                      onChange={handleDoctorDetailsChange}
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Science color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Describe your specialization in detail"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Years of Experience"
                      name="yearsOfExperience"
                      type="number"
                      value={formData.doctorDetails.yearsOfExperience}
                      onChange={handleDoctorDetailsChange}
                      inputProps={{ min: 0, step: 1 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Work color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Enter a non-negative number"
                    />
                  </Grid>
                </Grid>

                {/* ===== CV Management ===== */}
                <Card variant="outlined" sx={{ mt: 3, borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InsertDriveFile fontSize="medium" color="primary" /> CV / Resume Management
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {formData.doctorDetails?.documents && formData.doctorDetails.documents.length > 0 ? (
                      <Stack spacing={1.5} sx={{ mb: 2 }}>
                        {formData.doctorDetails.documents.map((docUrl, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1,
                              bgcolor: '#f5f9ff',
                              borderRadius: 2,
                              border: '1px solid #e0eaf5',
                            }}
                          >
                            <Button
                              component="a"
                              href={`http://localhost:5000${docUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<PictureAsPdf />}
                              sx={{ textTransform: 'none', flex: 1, justifyContent: 'flex-start' }}
                            >
                              {docUrl.split('/').pop() || `Document ${index + 1}`}
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteDocument(index)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No CV uploaded yet.
                      </Typography>
                    )}

                    <Box>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUpload />}
                        disabled={uploadingCV}
                        fullWidth
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        {uploadingCV ? 'Uploading...' : 'Upload CV'}
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleCVUpload}
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        Allowed: PDF, DOC, DOCX, JPG, PNG (max 5MB)
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ borderRadius: 2.5, textTransform: 'none', px: 4 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}