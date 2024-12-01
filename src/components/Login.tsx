import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
} from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setError('Google sign-in failed. Please try again.');
    }
  };

  const handleEmailSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Email sign-in failed:', error);
      setError(error.message);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password || !displayName) {
      setError('Please fill in all fields.');
      return;
    }
  
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName,
        });
      }
    } catch (error: any) {
      console.error('Email sign-up failed:', error);
      setError(error.message);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Anonymous sign-in failed:', error);
      setError('Anonymous sign-in failed. Please try again.');
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Box mt={{ xs: 4, md: 8 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom align="center">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              {isSignUp && (
                <Grid item xs={12}>
                  <TextField
                    label="Display Name"
                    variant="outlined"
                    fullWidth
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={isSignUp ? handleEmailSignUp : handleEmailSignIn}
                >
                  {isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button variant="text" fullWidth onClick={toggleSignUp}>
                  {isSignUp
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Sign Up"}
                </Button>
              </Grid>

              {!isSignUp && (
                <>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={handleGoogleSignIn}
                    >
                      Sign In with Google
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="text"
                      color="secondary"
                      fullWidth
                      onClick={handleAnonymousSignIn}
                    >
                      Continue as Guest
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
