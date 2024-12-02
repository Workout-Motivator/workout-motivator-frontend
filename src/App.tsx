import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Button, Container, CircularProgress, Tabs, Tab } from '@mui/material';
import { auth, db } from './firebase.ts';
import { useAuth } from './auth/AuthContext';
import Login from './components/Login';
import WorkoutBrowser from './components/WorkoutBrowser';
import { AccountabilityPartner } from './components/AccountabilityPartner';
import ChatRoom from './components/ChatRoom';
import ExerciseList from './components/ExerciseList';
import { query, collection, where, onSnapshot } from 'firebase/firestore';

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

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen for unread messages
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

  const AppContent = () => {
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
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'white',
                padding: '4px 8px',
                borderRadius: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 500,
                  fontSize: '14px'
                }}>
                  {user?.displayName 
                    ? user.displayName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2)
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
            sx={{ 
              '& .MuiTab-root': { 
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': { 
                  color: '#fff' 
                }
              }
            }}
          >
            <Tab label="Workouts" id="nav-tab-0" aria-controls="nav-tabpanel-0" />
            <Tab label="Exercises" id="nav-tab-1" aria-controls="nav-tabpanel-1" />
            <Tab label="Partners" id="nav-tab-2" aria-controls="nav-tabpanel-2" />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Chat
                  {unreadCount > 0 && (
                    <Box
                      sx={{
                        backgroundColor: 'error.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      {unreadCount}
                    </Box>
                  )}
                </Box>
              }
              id="nav-tab-3" 
              aria-controls="nav-tabpanel-3"
            />
          </Tabs>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4 }}>
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
