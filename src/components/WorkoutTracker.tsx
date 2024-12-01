import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Typography, TextField, Grid } from '@mui/material';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

interface Workout {
  id?: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  userId: string;
}

export const WorkoutTracker: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [newWorkout, setNewWorkout] = useState<Omit<Workout, 'id' | 'userId'>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    completed: false,
  });

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    if (!auth.currentUser) return;

    const workoutsRef = collection(db, 'workouts');
    const q = query(workoutsRef, where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    const workoutList: Workout[] = [];
    querySnapshot.forEach((doc) => {
      workoutList.push({ id: doc.id, ...doc.data() } as Workout);
    });
    
    setWorkouts(workoutList);
  };

  const handleAddWorkout = async () => {
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'workouts'), {
        ...newWorkout,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      });

      setNewWorkout({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        completed: false,
      });

      loadWorkouts();
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Workout Tracker
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Workout Title"
                value={newWorkout.title}
                onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                value={newWorkout.date}
                onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newWorkout.description}
                onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={handleAddWorkout}>
                Add Workout
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {workouts.map((workout) => (
          <Grid item xs={12} sm={6} md={4} key={workout.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{workout.title}</Typography>
                <Typography color="textSecondary">
                  {new Date(workout.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">{workout.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
