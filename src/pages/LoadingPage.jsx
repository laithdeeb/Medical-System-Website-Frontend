import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f4f6fb",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: 3,
          p: 4,
        }}
      >
        <CircularProgress size={72} thickness={5} sx={{ mb: 3 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Loading
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please wait while we prepare your dashboard.
        </Typography>
      </Box>
    </Box>
  );
}
