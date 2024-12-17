import React, { useState } from 'react';
import { Box, Button, Typography, Container, TextField, Divider, Alert } from '@mui/material';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../auth/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmailIcon from '@mui/icons-material/Email';

const Login = () => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      setError(error.message);
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error: any) {
      setError(error.message);
    }
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
          component="form"
          onSubmit={handleEmailAuth}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 3,
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
            mb: 2,
            maxWidth: '600px',
            lineHeight: 1.6
          }}>
            Connect with workout partners, track your progress, and stay motivated together
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            startIcon={<EmailIcon />}
            sx={{
              py: 1.5,
              borderRadius: '4px',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 500,
            }}
          >
            {isRegistering ? 'Sign Up with Email' : 'Sign In with Email'}
          </Button>

          <Button
            sx={{ mt: 1 }}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>

          <Divider sx={{ width: '100%', my: 2 }}>
            <Typography color="text.secondary">OR</Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleSignIn}
            startIcon={<GoogleIcon />}
            sx={{
              py: 1.5,
              borderRadius: '4px',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 500,
            }}
          >
            Continue with Google
          </Button>
        </Box>
      </Container>

      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #ff6b6b 30%, #ff8e53 90%)',
          filter: 'blur(60px)',
          opacity: 0.4,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #4facfe 30%, #00f2fe 90%)',
          filter: 'blur(60px)',
          opacity: 0.4,
        }}
      />
    </Box>
  );
};

export default Login;
