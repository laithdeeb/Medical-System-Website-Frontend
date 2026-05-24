import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          MediServe
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {user.role === 'patient' && (
            <>
              <Button color="inherit" onClick={() => navigate('/doctors')}>Find Doctor</Button>
              <Button color="inherit" onClick={() => navigate('/my-appointments')}>My Appointments</Button>
            </>
          )}
          {user.role === 'doctor' && (
            <>
              <Button color="inherit" onClick={() => navigate('/doctor-appointments')}>My Schedule</Button>
              <Button color="inherit" onClick={() => navigate('/doctor-availability')}>Set Availability</Button>
              <Button color="inherit" onClick={() => navigate('/doctor-weekly-schedule')}>Weekly View</Button>
            </>
          )}
          <Button color="inherit" onClick={() => navigate('/profile')}>Profile</Button>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;