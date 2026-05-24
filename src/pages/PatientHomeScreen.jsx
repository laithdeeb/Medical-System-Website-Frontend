import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const specialties = [
  { name: "Cardiology", doctors: "18 doctors", color: "#e3f2fd" },
  { name: "Dermatology", doctors: "12 doctors", color: "#fce4ec" },
  { name: "Neurology", doctors: "9 doctors", color: "#ede7f6" },
  { name: "Pediatrics", doctors: "15 doctors", color: "#e8f5e9" },
  { name: "Orthopedics", doctors: "11 doctors", color: "#fff3e0" },
  { name: "Dentistry", doctors: "14 doctors", color: "#e0f7fa" },
];

const quickStats = [
  { label: "Upcoming Appointments", value: "2" },
  { label: "Saved Doctors", value: "8" },
  { label: "Lab Results", value: "5" },
];

export default function PatientHomeScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        background:
          "linear-gradient(180deg, #f5f9ff 0%, #eef6fb 45%, #f9fcff 100%)",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8.5, lg: 9 }}>
            <Stack spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, #0f6d8c 0%, #1388a7 55%, #7dd3c7 100%)",
                  color: "white",
                }}
              >
                <Typography variant="overline" sx={{ letterSpacing: 1.3 }}>
                  Patient Portal
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mt: 1, mb: 1.5 }}
                >
                  Find the right medical service quickly
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ maxWidth: 620, opacity: 0.92, mb: 3 }}
                >
                  Search for doctors, specialties, and clinics in one place.
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    p: 1,
                    borderRadius: 3,
                    display: "flex",
                    gap: 1,
                    flexDirection: { xs: "column", sm: "row" },
                    backgroundColor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Search doctors, clinics, or specialties"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                        borderRadius: 2.5,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      minWidth: { xs: "100%", sm: 160 },
                      borderRadius: 2.5,
                      bgcolor: "#083b4c",
                      "&:hover": { bgcolor: "#062d3a" },
                    }}
                  >
                    Search
                  </Button>
                </Paper>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  border: "1px solid #dbe8f0",
                  backgroundColor: "rgba(255,255,255,0.9)",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                  sx={{ mb: 3 }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Browse Specialties
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Explore the most requested medical services.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label="Popular" color="primary" variant="outlined" />
                    <Chip label="Nearby" variant="outlined" />
                    <Chip label="Available Today" variant="outlined" />
                  </Stack>
                </Stack>

                <Grid container spacing={2}>
                  {specialties.map((specialty) => (
                    <Grid key={specialty.name} size={{ xs: 12, sm: 6, xl: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          height: "100%",
                          borderRadius: 3,
                          border: "1px solid #e4eef3",
                          backgroundColor: specialty.color,
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: "white",
                              color: "#0f6d8c",
                              fontWeight: 700,
                            }}
                          >
                            {specialty.name.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {specialty.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {specialty.doctors}
                          </Typography>
                          <Button
                            variant="text"
                            sx={{
                              width: "fit-content",
                              px: 0,
                              fontWeight: 700,
                            }}
                          >
                            View specialists
                          </Button>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 3.5, lg: 3 }}>
            <Stack spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid #dbe8f0",
                  backgroundColor: "white",
                }}
              >
                <Stack spacing={2.5} alignItems="flex-start">
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: "#0f6d8c",
                      fontSize: 28,
                      fontWeight: 700,
                    }}
                  >
                    PS
                  </Avatar>

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Patient Profile
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sarah Parker
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label="Verified" color="success" size="small" />
                    <Chip label="Insurance Active" size="small" />
                  </Stack>

                  <Divider flexItem />

                  <Stack spacing={1.5} sx={{ width: "100%" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Next appointment
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Apr 30, 10:30 AM
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Preferred clinic
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        HealthCare Center
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Membership
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Premium Care
                      </Typography>
                    </Box>
                  </Stack>

                  <Button fullWidth variant="contained" size="large">
                    View Full Profile
                  </Button>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid #dbe8f0",
                  backgroundColor: "white",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Quick Overview
                </Typography>
                <Stack spacing={2}>
                  {quickStats.map((stat) => (
                    <Box
                      key={stat.label}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "#f6fafc",
                        border: "1px solid #e4eef3",
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
