import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import {
  CalendarToday,
  CheckCircle,
  Delete,
  FitnessCenter,
  Timer,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../config';
import { format } from 'date-fns';

interface Workout {
  id: number;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  user_id: string;
}

const WorkoutTracker: React.FC = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserWorkouts();
    }
  }, [user]);

  const fetchUserWorkouts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts/user/${user?.uid}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch workouts');
      const data = await response.json();
      setWorkouts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setLoading(false);
    }
  };

  const handleCompleteWorkout = async (workoutId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts/${workoutId}/complete`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to complete workout');
      await fetchUserWorkouts();
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const handleDeleteWorkout = async (workoutId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts/${workoutId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete workout');
      await fetchUserWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#fff' }}>
        My Workouts
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress sx={{ color: '#00c853' }} />
        </Box>
      ) : workouts.length === 0 ? (
        <Card sx={{ bgcolor: 'rgba(38, 38, 38, 0.9)', p: 4, borderRadius: 2 }}>
          <Typography variant="h6" align="center" sx={{ color: '#fff' }}>
            No workouts found. Start by adding some exercises from the Exercise Browser!
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {workouts.map((workout) => (
            <Grid item key={workout.id} xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  bgcolor: 'rgba(38, 38, 38, 0.9)',
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ color: '#fff' }}>
                      {workout.title}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleCompleteWorkout(workout.id)}
                        sx={{ 
                          color: workout.completed ? '#00c853' : '#aaa',
                          '&:hover': { color: '#00c853' }
                        }}
                      >
                        <CheckCircle />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteWorkout(workout.id)}
                        sx={{ 
                          color: '#aaa',
                          '&:hover': { color: '#ff1744' }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
                    {workout.description}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarToday sx={{ color: '#aaa', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#aaa' }}>
                      {format(new Date(workout.date), 'MMM d, yyyy')}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} mt={2}>
                    <Chip
                      icon={<FitnessCenter sx={{ color: '#fff !important' }} />}
                      label={workout.completed ? 'Completed' : 'In Progress'}
                      size="small"
                      sx={{
                        bgcolor: workout.completed ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                        color: '#fff',
                        '& .MuiChip-icon': {
                          color: '#fff',
                        },
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default WorkoutTracker;
