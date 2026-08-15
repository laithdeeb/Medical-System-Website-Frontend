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
  InputAdornment,
  IconButton,
  FormControl,
  OutlinedInput,
  InputLabel,
} from '@mui/material';
import { MedicalServices, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // مسح أي خطأ سابق قبل المحاولة الجديدة
    setLoading(true);
    try {
      const userData = await loginUser(email, password);
      login(userData);
      navigate('/');
    } catch (err) {
      // ✅ التعديل الجوهري: استخراج الرسالة من رد الخادم بدلاً من err.message الافتراضي
      const errorMessage = err.response?.data?.message || 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
      setError(errorMessage);
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
                  fontSize: 60,
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
                Log in
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* حقل كلمة المرور مع أيقونة إظهار/إخفاء */}
              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="password-input">Password</InputLabel>
                <OutlinedInput
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                }}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </Button>
            </Box>

            <Typography align="center">
              Don't have an account?{' '}
              <Button component={Link} to="/register" sx={{ textTransform: 'none' }}>
                Sign up
              </Button>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}