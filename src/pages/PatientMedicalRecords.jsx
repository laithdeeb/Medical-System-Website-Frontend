import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function PatientMedicalRecords() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pdfRef = useRef();

  useEffect(() => {
    fetchMedicalData();
  }, []);

  const fetchMedicalData = async () => {
    try {
      const [profileRes, vitalsRes] = await Promise.all([
        api.get(`/medical/profile/${user._id}`),
        api.get(`/medical/vitals/${user._id}`),
      ]);
      setProfile(profileRes.data);
      setVitals(vitalsRes.data);
    } catch (err) {
      setError('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;
    try {
      const originalTitle = document.title;
      document.title = 'Generating PDF...';
      const canvas = await html2canvas(element, { scale: 2, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`medical_records_${user.fullName.replace(/\s/g, '_')}.pdf`);
      document.title = originalTitle;
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  // ===== تحضير بيانات الرسم البياني =====
  const labels = vitals.map(v => new Date(v.recordedAt).toLocaleDateString());

  // تجميع بيانات المخططات ديناميكياً (فقط المخططات التي تحتوي على بيانات)
  const datasets = [];

  // 1. Weight (إذا توفرت بيانات)
  if (vitals.some(v => v.weight !== null && v.weight !== undefined)) {
    datasets.push({
      label: 'Weight (kg)',
      data: vitals.map(v => v.weight),
      borderColor: 'rgb(25, 118, 210)',
      backgroundColor: 'rgba(25, 118, 210, 0.5)',
      tension: 0.3,
    });
  }

  // 2. BMI (إذا توفرت بيانات)
  if (vitals.some(v => v.bmi !== null && v.bmi !== undefined)) {
    datasets.push({
      label: 'BMI',
      data: vitals.map(v => v.bmi),
      borderColor: 'rgb(220, 0, 78)',
      backgroundColor: 'rgba(220, 0, 78, 0.5)',
      tension: 0.3,
    });
  }

  // 3. Blood Sugar (إذا توفرت بيانات)
  if (vitals.some(v => v.bloodSugar !== null && v.bloodSugar !== undefined)) {
    datasets.push({
      label: 'Blood Sugar (mg/dL)',
      data: vitals.map(v => v.bloodSugar),
      borderColor: 'rgb(255, 159, 64)',
      backgroundColor: 'rgba(255, 159, 64, 0.5)',
      tension: 0.3,
    });
  }

  // 4. Temperature (إذا توفرت بيانات)
  if (vitals.some(v => v.temperature !== null && v.temperature !== undefined)) {
    datasets.push({
      label: 'Temperature (°C)',
      data: vitals.map(v => v.temperature),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      tension: 0.3,
    });
  }

  const chartData = { labels, datasets };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Health Trends Over Time' },
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #f6fbff 0%, #edf6fb 50%, #f9fcff 100%)' }}>
      <Container maxWidth="lg">
        <Paper ref={pdfRef} elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #dbe8f0', boxShadow: '0 24px 60px rgba(12, 61, 81, 0.08)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2}>
            <Typography variant="h4" fontWeight={700} gutterBottom>My Medical Records</Typography>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdf />}
              onClick={downloadPDF}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Download as PDF
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Your health profile and vital signs history</Typography>
          <Divider sx={{ mb: 3 }} />

          {/* الملف الطبي الثابت */}
          <Typography variant="h5" fontWeight={600} gutterBottom>Medical Profile</Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Blood Type</Typography>
                  <Typography variant="h6">{profile?.bloodType || 'Not set'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Allergies</Typography>
                  <Typography variant="body2">{profile?.allergies || 'None'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Chronic Diseases</Typography>
                  <Typography variant="body2">{profile?.chronicDiseases || 'None'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Past Surgeries</Typography>
                  <Typography variant="body2">{profile?.pastSurgeries || 'None'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Regular Medications</Typography>
                  <Typography variant="body2">{profile?.regularMedications || 'None'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* الرسم البياني (يظهر فقط إذا كان هناك بيانات) */}
          {vitals.length > 0 && datasets.length > 0 && (
            <>
              <Typography variant="h5" fontWeight={600} gutterBottom>Health Trends</Typography>
              <Box sx={{ mb: 4 }}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            </>
          )}

          {/* جدول القياسات الحيوية */}
          <Typography variant="h5" fontWeight={600} gutterBottom>Vital Signs History</Typography>
          {vitals.length === 0 ? (
            <Alert severity="info">No vital signs recorded yet.</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Weight (kg)</TableCell>
                    <TableCell>BMI</TableCell>
                    <TableCell>Heart Rate</TableCell>
                    <TableCell>Blood Pressure</TableCell>
                    <TableCell>Blood Sugar</TableCell>
                    <TableCell>Temperature</TableCell>
                    <TableCell>Doctor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vitals.map((v) => (
                    <TableRow key={v._id}>
                      <TableCell>{new Date(v.recordedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{v.weight || '-'}</TableCell>
                      <TableCell>{v.bmi || '-'}</TableCell>
                      <TableCell>{v.heartRate || '-'}</TableCell>
                      <TableCell>{v.bloodPressureSystolic && v.bloodPressureDiastolic ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}` : '-'}</TableCell>
                      <TableCell>{v.bloodSugar || '-'}</TableCell>
                      <TableCell>{v.temperature ? `${v.temperature}°C` : '-'}</TableCell>
                      <TableCell>{v.doctor?.fullName || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
}