import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import GoogleIcon from '@mui/icons-material/Google';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const Login = () => {
  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(45deg, #121212 30%, #1e1e1e 90%)'
          : 'linear-gradient(45deg, #f5f5f5 30%, #ffffff 90%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 4,
            p: 4,
            borderRadius: '8px',
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(30, 30, 30, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(0, 0, 0, 0.12)',
          }}
        >
          <FitnessCenterIcon 
            sx={{ 
              fontSize: 64,
              color: 'primary.main',
              mb: 2
            }} 
          />
          
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            textAlign: 'center',
            fontSize: { xs: '2rem', sm: '3rem' }
          }}>
            Workout Motivator
          </Typography>

          <Typography variant="h5" sx={{ 
            color: 'text.secondary',
            mb: 4,
            maxWidth: '600px',
            lineHeight: 1.6
          }}>
            Connect with workout partners, track your progress, and stay motivated together
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleGoogleSignIn}
            startIcon={<GoogleIcon />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: '4px',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 500,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Sign in with Google
          </Button>
        </Box>
      </Container>

      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          opacity: 0.1,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: 'secondary.main',
          opacity: 0.1,
          zIndex: 0,
        }}
      />
    </Box>
  );
};

export default Login;
