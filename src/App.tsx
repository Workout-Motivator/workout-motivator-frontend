import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Button, Container, CircularProgress, Tabs, Tab, IconButton } from '@mui/material';
import { auth, db } from './firebase';
import { useAuth } from './auth/AuthContext';
import Login from './components/Login';
import WorkoutBrowser from './components/WorkoutBrowser';
import { AccountabilityPartner } from './components/AccountabilityPartner';
import ChatRoom from './components/ChatRoom';
import ExerciseList from './components/ExerciseList';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import { User } from 'firebase/auth';

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#2ecc71' : '#00c853',
    },
    secondary: {
      main: mode === 'light' ? '#e74c3c' : '#ff5252',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#2c3e50' : '#ffffff',
      secondary: mode === 'light' ? '#7f8c8d' : '#b3b3b3',
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
    h6: {
      fontWeight: 600,
      letterSpacing: '0.25px',
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
        } as const,
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
        } as const,
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
          borderBottom: '1px solid',
          borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
          '& .MuiTab-root': {
            minHeight: '48px',
          },
        } as const,
        indicator: {
          height: '3px',
        } as const,
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9375rem',
          minWidth: '120px',
          padding: '12px 16px',
        } as const,
      },
    },
  },
});

function App() {
  const { user, loading } = useAuth();
  const [value, setValue] = useState(() => {
    const savedTab = localStorage.getItem('selectedTab');
    return savedTab ? parseInt(savedTab) : 0;
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as 'light' | 'dark') || 'light';
  });

  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('read', '==', false),
      where('uid', '!=', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setValue(event.detail);
      localStorage.setItem('selectedTab', event.detail.toString());
      const params = new URLSearchParams(window.location.search);
      params.set('tab', event.detail.toString());
      window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    };

    window.addEventListener('tabChange', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('tabChange', handleTabChange as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Login />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent mode={mode} toggleColorMode={toggleColorMode} value={value} setValue={setValue} unreadCount={unreadCount} user={user} />
      </Router>
    </ThemeProvider>
  );
}

interface AppContentProps {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
  value: number;
  setValue: (value: number) => void;
  unreadCount: number;
  user: User;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AppContent: React.FC<AppContentProps> = ({ mode, toggleColorMode, value, setValue, unreadCount, user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabChange = (newValue: number) => {
    setValue(newValue);
    localStorage.setItem('selectedTab', newValue.toString());
    const params = new URLSearchParams(window.location.search);
    params.set('tab', newValue.toString());
    navigate(`?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    
    if (tabFromUrl !== null && !isNaN(parseInt(tabFromUrl))) {
      const tabIndex = parseInt(tabFromUrl);
      setValue(tabIndex);
      localStorage.setItem('selectedTab', tabIndex.toString());
    } else {
      navigate(`?tab=${value}`, { replace: true });
    }
  }, []); 

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ minHeight: '64px' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Workout Motivator
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            '& .MuiButton-root': {
              textTransform: 'none',
              fontWeight: 500
            }
          }}>
            <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: 1 }}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 500,
                fontSize: '14px'
              }}>
                {user?.displayName 
                  ? user.displayName.split(' ').map((name: string) => name[0]).join('').toUpperCase().slice(0, 2)
                  : user?.email?.charAt(0).toUpperCase() || '?'}
              </Box>
              <Typography variant="body1">
                {user?.displayName || user?.email || 'User'}
              </Typography>
            </Box>
            <Button 
              color="inherit" 
              onClick={() => auth.signOut()}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
        <Tabs 
          value={value} 
          onChange={(e, newValue) => handleTabChange(newValue)}
          aria-label="navigation tabs"
          variant="fullWidth"
          sx={{ 
            '& .MuiTab-root': { 
              color: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': { 
                color: 'primary.main',
              }
            }
          }}
        >
          <Tab 
            icon={<FitnessCenterIcon />} 
            iconPosition="start" 
            label="Workouts" 
            id="nav-tab-0" 
            aria-controls="nav-tabpanel-0" 
          />
          <Tab 
            icon={<ListAltIcon />} 
            iconPosition="start" 
            label="Exercises" 
            id="nav-tab-1" 
            aria-controls="nav-tabpanel-1" 
          />
          <Tab 
            icon={<PeopleIcon />} 
            iconPosition="start" 
            label="Partners" 
            id="nav-tab-2" 
            aria-controls="nav-tabpanel-2" 
          />
          <Tab 
            icon={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ChatIcon />
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      backgroundColor: 'secondary.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      ml: 1,
                    }}
                  >
                    {unreadCount}
                  </Box>
                )}
              </Box>
            }
            iconPosition="start"
            label="Chat"
            id="nav-tab-3" 
            aria-controls="nav-tabpanel-3"
          />
        </Tabs>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ 
        mt: 2,
        mb: 2,
        height: 'calc(100% - 48px)',
        '& .MuiTabPanel-root': {
          p: 0,
          height: '100%'
        }
      }}>
        <TabPanel value={value} index={0}>
          <WorkoutBrowser />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ExerciseList />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <AccountabilityPartner onTabChange={handleTabChange} />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <ChatRoom />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default App;
