import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import { Male, Female, Search, Clear, ThumbUpAlt } from '@mui/icons-material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const SYRIAN_GOVERNORATES = [
  'All Governorates',
  'Damascus',
  'Rural Damascus',
  'Aleppo',
  'Homs',
  'Hama',
  'Latakia',
  'As-Suwayda',
  'Tartus',
  'Deir ez-Zor',
  'Al-Hasakah',
  'Idlib',
  'Raqqa',
  'Daraa',
  'Quneitra',
  'Ar-Raqqah',
];

const SPECIALTIES = [
  'All Specialties',
  'طبيب عام',
  'طبيب أسرة',
  'طبيب أطفال',
  'طبيب نسائي وتوليد',
  'طبيب أسنان',
  'طبيب عيون',
  'طبيب أنف وأذن وحنجرة',
  'طبيب قلبية',
  'طبيب جلدية',
  'طبيب عظام',
  'طبيب أعصاب',
  'طبيب نفسي',
  'طبيب جهاز هضمي',
];

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    keyword: '',
    specialty: 'All Specialties',
    city: 'All Governorates',
    gender: 'all',
    sortBy: 'relevance',
  });

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.specialty !== 'All Specialties') params.append('specialty', filters.specialty);
      if (filters.city !== 'All Governorates') params.append('city', filters.city);
      if (filters.gender !== 'all') params.append('gender', filters.gender);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const url = `/users/doctors/search?${params.toString()}`;
      const { data } = await api.get(url);
      setDoctors(data);
    } catch (err) {
      setError('Failed to load doctors. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      specialty: 'All Specialties',
      city: 'All Governorates',
      gender: 'all',
      sortBy: 'relevance',
    });
    setTimeout(fetchDoctors, 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchDoctors();
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error" textAlign="center" mt={4}>{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Find a Doctor
      </Typography>

      <Paper
        elevation={0}
        component="form"
        onSubmit={handleSearch}
        sx={{ p: { xs: 2, md: 4 }, mb: 4, border: '1px solid #dbe8f0', borderRadius: 3 }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Specialty</InputLabel>
              <Select
                value={filters.specialty}
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                label="Specialty"
              >
                {SPECIALTIES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>City</InputLabel>
              <Select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                label="City"
              >
                {SYRIAN_GOVERNORATES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                label="Gender"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                label="Sort by"
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="recommendations">Recommendations</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="text"
              onClick={clearFilters}
              startIcon={<Clear />}
              sx={{ height: '100%', py: 1.5, color: 'text.secondary' }}
            >
              Clear all
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search by name, specialization, or qualifications..."
            variant="outlined"
            size="medium"
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: filters.keyword && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleFilterChange('keyword', '')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              '& .MuiInputBase-root': { height: '56px' },
            }}
          />
          <Button
            variant="contained"
            type="submit"
            startIcon={<Search />}
            sx={{
              height: '56px',
              px: 3,
              minWidth: '100px',
              flexShrink: 0,
            }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
      </Typography>

      {doctors.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">No doctors found.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your filters or search terms.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {doctors.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc._id}>
              {/* ✅ البطاقة بارتفاع ثابت 330px */}
              <Card
                sx={{
                  height: 330,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid #bbdefb',
                  borderRadius: 3,
                  transition: '0.3s',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 4,
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    overflow: 'hidden',
                    height: '100%',
                  }}
                >
                  {/* القسم 1: الاسم + الجنس (ثابت) */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ flexShrink: 0 }}>
                    <Typography variant="h6" noWrap fontWeight={600} sx={{ flex: 1 }}>
                      {doc.fullName}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
                      {doc.gender === 'male' && <Male fontSize="small" sx={{ color: '#1976d2' }} />}
                      {doc.gender === 'female' && <Female fontSize="small" sx={{ color: '#d81b60' }} />}
                    </Box>
                  </Box>

                  {/* القسم 2: التخصص + التوصيات (ثابت) - مع قص النص الطويل */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ flexShrink: 0, minHeight: 28, gap: 1 }}
                  >
                    <Typography
                      color="primary"
                      fontWeight={500}
                      sx={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                      }}
                    >
                      {doc.doctorDetails?.specialization || 'General'}
                    </Typography>
                    {doc.doctorDetails?.recommendationCount > 0 && (
                      <Chip
                        icon={<ThumbUpAlt sx={{ fontSize: 14 }} />}
                        label={doc.doctorDetails.recommendationCount}
                        size="small"
                        color="primary"
                        sx={{ flexShrink: 0, height: 24 }}
                      />
                    )}
                  </Box>

                  {/* القسم 3: المؤهلات (مرن) - مع قص النص بعد 3 أسطر */}
                  <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0, mt: 0.5 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.5,
                        maxHeight: '4.5em',
                      }}
                    >
                      {doc.doctorDetails?.qualifications || ''}
                    </Typography>
                  </Box>

                  {/* القسم 4: معلومات ثابتة + أزرار (ثابت في الأسفل) */}
                  <Box sx={{ mt: 'auto', flexShrink: 0 }}>
                    <Typography variant="body2">📅 {doc.doctorDetails?.yearsOfExperience || 0} years exp.</Typography>
                    <Typography variant="body2">📍 {doc.address || 'N/A'}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>📞 {doc.phone || 'N/A'}</Typography>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 0.5 }}
                      onClick={() => navigate(`/book/${doc._id}`)}
                    >
                      Book Appointment
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 0.5 }}
                      onClick={() => navigate(`/doctor-profile/${doc._id}`)}
                    >
                      View Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}