import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Badge, IconButton, Menu, MenuItem } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  if (!user) return null;

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          MediServe
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* باقي الأزرار حسب الدور */}
          {user.role === 'patient' && (
  <>
    <Button color="inherit" onClick={() => navigate('/doctors')}>Find Doctor</Button>
    <Button color="inherit" onClick={() => navigate('/my-appointments')}>My Appointments</Button>
    <Button color="inherit" onClick={() => navigate('/my-medical-records')}>Medical Records</Button>
    <Button color="inherit" onClick={() => navigate('/my-prescriptions')}>My Prescriptions</Button>
  </>
)}
          {user.role === 'doctor' && (
            <>
              <Button color="inherit" onClick={() => navigate('/doctor-appointments')}>My Schedule</Button>
              <Button color="inherit" onClick={() => navigate('/doctor-availability')}>Set Availability</Button>
              <Button color="inherit" onClick={() => navigate('/doctor-weekly-schedule')}>Weekly View</Button>
              <Button color="inherit" onClick={() => navigate('/doctor-medical')}>Manage Medical</Button>
            </>
          )}
          {user.role === 'assistant' && (
            <Button color="inherit" onClick={() => navigate('/assistant-dashboard')}>My Dashboard</Button>
          )}
          {user.role === 'admin' && (
            <>
              <Button color="inherit" onClick={() => navigate('/admin')}>Dashboard</Button>
              <Button color="inherit" onClick={() => navigate('/admin/users')}>Users</Button>
              <Button color="inherit" onClick={() => navigate('/admin/doctors')}>Doctors</Button>
            </>
          )}
          <Button color="inherit" onClick={() => navigate('/profile')}>Profile</Button>

          {/* أيقونة الإشعارات */}
          <IconButton color="inherit" onClick={handleOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Button color="inherit" onClick={logout}>Logout</Button>
        </Box>

        {/* القائمة المنسدلة للإشعارات */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: { maxHeight: 400, width: '350px' }
          }}
        >
          {notifications.length === 0 ? (
            <MenuItem onClick={handleClose}>No notifications</MenuItem>
          ) : (
            notifications.slice(0, 10).map(notif => (
              <MenuItem
                key={notif._id}
                onClick={() => {
                  markAsRead(notif._id);
                  handleClose();
                }}
                style={{ whiteSpace: 'normal', borderBottom: '1px solid #eee' }}
              >
                <Box>
                  <Typography variant="body2" style={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notif.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
          {notifications.length > 10 && (
            <MenuItem onClick={() => navigate('/notifications')}>View all notifications</MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;