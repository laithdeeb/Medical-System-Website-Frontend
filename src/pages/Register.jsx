import { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  IconButton,
  OutlinedInput,
  FormHelperText
} from '@mui/material';
import {
  MedicalServices,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

// ===== دالة التحقق من صحة الاسم =====
const isValidFullName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const nameRegex = /^[a-zA-Z\u0600-\u06FF][a-zA-Z\u0600-\u06FF\s]{1,}$/;
  return nameRegex.test(name.trim());
};

// ===== دالة التحقق من قوة كلمة المرور =====
const validatePassword = (password) => {
  // 8 أحرف على الأقل + حرف كبير + حرف صغير + رقم + رمز خاص
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // ✅ التحقق من الاسم الكامل
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (!isValidFullName(formData.fullName)) {
      newErrors.fullName = 'Must start with a letter and be at least 2 characters long (no numbers or special characters)';
    }

    // ✅ التحقق من البريد الإلكتروني
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // ✅ التحقق من قوة كلمة المرور
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    // ✅ التحقق من تطابق كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
      setErrors({ general: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: '1px solid #dbe8f0',
            boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)',
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'left' }}>
              <MedicalServices
                color="primary"
                sx={{ fontSize: 140, mx: 'auto', display: 'block' }}
              />
              <Typography
                variant="h1"
                color="primary"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: 40, sm: 60 },
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 4,
                }}
              >
                MediServe
              </Typography>
              <Typography variant="overline" sx={{ letterSpacing: 1.2 }}>
                Medical Services Portal
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
                Sign up
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {errors.general && <Alert severity="error">{errors.general}</Alert>}

              <TextField
                label="Full Name"
                name="fullName"
                fullWidth
                value={formData.fullName}
                onChange={handleChange}
                required
                error={!!errors.fullName}
                helperText={errors.fullName || 'Must start with a letter (at least 2 characters)'}
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                required
                error={!!errors.email}
                helperText={errors.email}
              />

              <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
                <InputLabel htmlFor="password-input" error={!!errors.password}>
                  Password
                </InputLabel>
                <OutlinedInput
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={!!errors.password}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
                {errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                <InputLabel htmlFor="confirm-password-input" error={!!errors.confirmPassword}>
                  Confirm Password
                </InputLabel>
                <OutlinedInput
                  id="confirm-password-input"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  error={!!errors.confirmPassword}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Confirm Password"
                />
                {errors.confirmPassword && <FormHelperText error>{errors.confirmPassword}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="role-label">User Type</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="User Type"
                >
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="assistant">Assistant</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.4,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </Box>

            <Typography align="center">
              Already have an account?{' '}
              <Button component={Link} to="/login" sx={{ textTransform: 'none' }}>
                Log in
              </Button>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}