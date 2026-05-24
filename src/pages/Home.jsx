import { Container, Typography, Paper, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.fullName}
        </Typography>
        <Typography variant="body1">
          You are logged in as {user?.role}.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This is your dashboard. More features coming soon.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Home;