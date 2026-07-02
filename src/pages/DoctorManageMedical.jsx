import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function DoctorManageMedical() {
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [profile, setProfile] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    allergies: '',
    chronicDiseases: '',
    pastSurgeries: '',
    regularMedications: '',
  });
  const [vitalForm, setVitalForm] = useState({
    height: '',
    weight: '',
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    bloodSugar: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    notes: '',
  });

  useEffect(() => {
    if (selectedPatientId) {
      fetchMedicalData();
    }
  }, [selectedPatientId]);

  const fetchMedicalData = async () => {
    setLoadingData(true);
    setError('');
    try {
      const [profileRes, vitalsRes] = await Promise.all([
        api.get(`/medical/profile/${selectedPatientId}`),
        api.get(`/medical/vitals/${selectedPatientId}`),
      ]);
      setProfile(profileRes.data);
      setVitals(vitalsRes.data);
      setFormData({
        bloodType: profileRes.data.bloodType || '',
        allergies: profileRes.data.allergies || '',
        chronicDiseases: profileRes.data.chronicDiseases || '',
        pastSurgeries: profileRes.data.pastSurgeries || '',
        regularMedications: profileRes.data.regularMedications || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load medical data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVitalChange = (e) => {
    setVitalForm({ ...vitalForm, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      await api.put(`/medical/profile/${selectedPatientId}`, formData);
      setSuccess('Medical profile updated');
      setTimeout(() => setSuccess(''), 3000);
      setEditMode(false);
      fetchMedicalData();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const addVitalSign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medical/vitals', {
        patientId: selectedPatientId,
        ...vitalForm,
      });
      setSuccess('Vital sign added');
      setVitalForm({
        height: '',
        weight: '',
        heartRate: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        bloodSugar: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        notes: '',
      });
      fetchMedicalData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vital sign');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>Manage Medical Records</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Enter Patient ID to view and update health data</Typography>
          <Divider sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <TextField
            fullWidth
            label="Patient ID"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            sx={{ mb: 3 }}
            helperText="You can find the patient ID from the patient's profile or database"
          />

          {selectedPatientId && (
            <>
              {loadingData ? (
                <CircularProgress />
              ) : (
                <>
                  {/* الملف الطبي الثابت */}
                  <Card variant="outlined" sx={{ mb: 4, p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Medical Profile</Typography>
                      <IconButton onClick={() => setEditMode(!editMode)}><Edit /></IconButton>
                    </Box>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Blood Type"
                          name="bloodType"
                          value={formData.bloodType}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                          select
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="A+">A+</MenuItem>
                          <MenuItem value="A-">A-</MenuItem>
                          <MenuItem value="B+">B+</MenuItem>
                          <MenuItem value="B-">B-</MenuItem>
                          <MenuItem value="AB+">AB+</MenuItem>
                          <MenuItem value="AB-">AB-</MenuItem>
                          <MenuItem value="O+">O+</MenuItem>
                          <MenuItem value="O-">O-</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Allergies" name="allergies" value={formData.allergies} onChange={handleProfileChange} disabled={!editMode} multiline rows={2} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Chronic Diseases" name="chronicDiseases" value={formData.chronicDiseases} onChange={handleProfileChange} disabled={!editMode} multiline rows={2} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Past Surgeries" name="pastSurgeries" value={formData.pastSurgeries} onChange={handleProfileChange} disabled={!editMode} multiline rows={2} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Regular Medications" name="regularMedications" value={formData.regularMedications} onChange={handleProfileChange} disabled={!editMode} multiline rows={2} />
                      </Grid>
                    </Grid>
                    {editMode && (
                      <Button variant="contained" onClick={saveProfile} sx={{ mt: 2 }}>Save Profile</Button>
                    )}
                  </Card>

                  {/* إضافة قياس حيوي جديد */}
                  <Card variant="outlined" sx={{ mb: 4, p: 2 }}>
                    <Typography variant="h6" gutterBottom>Add Vital Signs</Typography>
                    <form onSubmit={addVitalSign}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="Height (cm)" name="height" type="number" value={vitalForm.height} onChange={handleVitalChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="Weight (kg)" name="weight" type="number" value={vitalForm.weight} onChange={handleVitalChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="Heart Rate (bpm)" name="heartRate" type="number" value={vitalForm.heartRate} onChange={handleVitalChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="BP Systolic" name="bloodPressureSystolic" type="number" value={vitalForm.bloodPressureSystolic} onChange={handleVitalChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="BP Diastolic" name="bloodPressureDiastolic" type="number" value={vitalForm.bloodPressureDiastolic} onChange={handleVitalChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Blood Sugar (mg/dL)" name="bloodSugar" type="number" value={vitalForm.bloodSugar} onChange={handleVitalChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Temperature (°C)" name="temperature" type="number" value={vitalForm.temperature} onChange={handleVitalChange} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Notes" name="notes" value={vitalForm.notes} onChange={handleVitalChange} multiline rows={2} />
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="contained" startIcon={<Add />}>Add Record</Button>
                        </Grid>
                      </Grid>
                    </form>
                  </Card>

                  {/* جدول القياسات السابقة */}
                  <Typography variant="h6" gutterBottom>Vital Signs History</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Weight</TableCell>
                          <TableCell>BMI</TableCell>
                          <TableCell>Heart Rate</TableCell>
                          <TableCell>BP</TableCell>
                          <TableCell>Blood Sugar</TableCell>
                          <TableCell>Temp</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vitals.map(v => (
                          <TableRow key={v._id}>
                            <TableCell>{new Date(v.recordedAt).toLocaleDateString()}</TableCell>
                            <TableCell>{v.weight}</TableCell>
                            <TableCell>{v.bmi}</TableCell>
                            <TableCell>{v.heartRate}</TableCell>
                            <TableCell>{v.bloodPressureSystolic}/{v.bloodPressureDiastolic}</TableCell>
                            <TableCell>{v.bloodSugar}</TableCell>
                            <TableCell>{v.temperature}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}