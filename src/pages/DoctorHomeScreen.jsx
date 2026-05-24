import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const weekSchedule = [
  { day: "Mon", date: "27", hours: "8:00 - 14:00", load: 78, active: true },
  { day: "Tue", date: "28", hours: "9:00 - 15:00", load: 64 },
  { day: "Wed", date: "29", hours: "10:00 - 16:00", load: 82 },
  { day: "Thu", date: "30", hours: "8:30 - 13:00", load: 48 },
  { day: "Fri", date: "01", hours: "9:00 - 12:30", load: 35 },
];

const appointments = [
  {
    patient: "Emma Wilson",
    time: "09:00 AM",
    visitType: "Follow-up visit",
    status: "Confirmed",
  },
  {
    patient: "Noah Carter",
    time: "10:30 AM",
    visitType: "New consultation",
    status: "Waiting",
  },
  {
    patient: "Olivia Brown",
    time: "01:15 PM",
    visitType: "Lab review",
    status: "Confirmed",
  },
  {
    patient: "Liam Taylor",
    time: "03:00 PM",
    visitType: "Cardiac screening",
    status: "Rescheduled",
  },
];

const medicalRecords = [
  { title: "Pending lab approvals", value: "06", note: "Need physician sign-off" },
  { title: "Critical follow-ups", value: "03", note: "Contact before end of day" },
  { title: "Reports uploaded", value: "14", note: "New records this week" },
];

export default function DoctorHomeScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        background:
          "linear-gradient(180deg, #f7fbff 0%, #edf5fb 50%, #f8fcff 100%)",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid #dbe8f0",
                backgroundColor: "white",
                height: "100%",
              }}
            >
              <Stack spacing={3}>
                <Stack spacing={2} alignItems="flex-start">
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: "#0f6d8c",
                      fontSize: 30,
                      fontWeight: 700,
                    }}
                  >
                    DR
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Dr. David Reed
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cardiologist
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label="On Duty" color="success" size="small" />
                    <Chip label="Clinic B" size="small" />
                  </Stack>
                </Stack>

                <Divider />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Today availability
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      8:00 AM - 4:00 PM
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Patients assigned
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      24 active patients
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      Heart and Vascular Care
                    </Typography>
                  </Box>
                </Stack>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    background:
                      "linear-gradient(135deg, #0f6d8c 0%, #1b8fa5 100%)",
                    color: "white",
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    Consultation score
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
                    4.9
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.92 }}>
                    Based on 128 recent patient reviews.
                  </Typography>
                </Paper>

                <Button fullWidth variant="contained" size="large">
                  Edit Profile
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  border: "1px solid #dbe8f0",
                  backgroundColor: "white",
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
                      Week Schedule
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your shifts and booking load for this week.
                    </Typography>
                  </Box>
                  <Chip label="18 appointments booked" color="primary" />
                </Stack>

                <Grid container spacing={2}>
                  {weekSchedule.map((slot) => (
                    <Grid key={`${slot.day}-${slot.date}`} size={{ xs: 12, sm: 6, xl: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          border: slot.active
                            ? "1px solid #0f6d8c"
                            : "1px solid #e4eef3",
                          backgroundColor: slot.active ? "#eef8fb" : "#f9fcfe",
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {slot.day}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {slot.date}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {slot.hours}
                          </Typography>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mb: 1 }}
                            >
                              Booking load {slot.load}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={slot.load}
                              sx={{
                                height: 8,
                                borderRadius: 999,
                                backgroundColor: "#dcecf3",
                              }}
                            />
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  border: "1px solid #dbe8f0",
                  backgroundColor: "white",
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
                      Today's Appointments
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Patients scheduled for the rest of the day.
                    </Typography>
                  </Box>
                  <Button variant="outlined">View Calendar</Button>
                </Stack>

                <Stack spacing={2}>
                  {appointments.map((appointment) => (
                    <Paper
                      key={`${appointment.patient}-${appointment.time}`}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: "1px solid #e4eef3",
                        backgroundColor: "#fbfdff",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Stack spacing={0.5}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {appointment.patient}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.visitType}
                          </Typography>
                        </Stack>
                        <Stack
                          direction={{ xs: "row", sm: "column" }}
                          alignItems={{ xs: "center", sm: "flex-end" }}
                          spacing={1}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            {appointment.time}
                          </Typography>
                          <Chip
                            label={appointment.status}
                            size="small"
                            color={
                              appointment.status === "Confirmed"
                                ? "success"
                                : appointment.status === "Waiting"
                                  ? "warning"
                                  : "default"
                            }
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 3 }}>
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
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                  Medical Records
                </Typography>
                <Stack spacing={2}>
                  {medicalRecords.map((record) => (
                    <Box
                      key={record.title}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid #e4eef3",
                        backgroundColor: "#f7fbfd",
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {record.value}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {record.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {record.note}
                      </Typography>
                    </Box>
                  ))}
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
                  Recent Record Activity
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      MRI report signed
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Patient: Ethan Moore, 08:40 AM
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Prescription updated
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Patient: Ava Harris, 10:05 AM
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Lab results reviewed
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Patient: Mason Clark, 11:25 AM
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
