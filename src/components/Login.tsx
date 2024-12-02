import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  useMediaQuery,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          padding: '8px 16px',
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
  },
});

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(rgba(25, 118, 210, 0.95), rgba(25, 118, 210, 0.85)), url("https://source.unsplash.com/1600x900/?fitness,gym")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              color: 'white',
              mb: 4,
            }}
          >
            <FitnessCenterIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h3" gutterBottom>
              Workout Motivator
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Your Personal Fitness Journey Starts Here
            </Typography>
          </Box>

          <Paper 
            elevation={1}
            sx={{
              p: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              textAlign: 'center',
            }}
          >
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Join a community of fitness enthusiasts and track your progress with personalized workout plans
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGoogleSignIn}
              startIcon={<GoogleIcon />}
              sx={{
                py: 1.5,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Continue with Google
            </Button>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
