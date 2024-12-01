import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../config';

interface Exercise {
  id: number;
  title: string;
  instructions: string;
  benefits: string;
  image_paths: string; // JSON string of image paths
}

interface WorkoutAsset {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  instructions: string;
  benefits: string;
  muscles_worked: string;
  variations: string;
  image_path: string;
  animation_path: string | null;
}

interface WorkoutAssetDetail extends WorkoutAsset {
  exercises: Exercise[];
}

const WorkoutBrowser: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutAssetDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch categories
    fetch(`${API_BASE_URL}/api/workouts/assets/categories`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching categories:', error));

    // Fetch all workouts
    fetch(`${API_BASE_URL}/api/workouts/assets`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setWorkouts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching workouts:', error);
        setLoading(false);
      });
  }, []);

  const filteredWorkouts = selectedCategory
    ? workouts.filter(workout => workout.category === selectedCategory)
    : workouts;

  const handleWorkoutClick = async (workout: WorkoutAsset) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts/assets/${workout.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedWorkout(data);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error fetching workout details:', error);
    }
  };

  const handleStartWorkout = async () => {
    if (!selectedWorkout || !user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/workouts/user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedWorkout.title,
          description: selectedWorkout.description,
          date: new Date().toISOString(),
          user_id: user.uid,
        }),
      });
      await response.json();
      setDialogOpen(false);
      // You can add navigation to the workout tracker here
    } catch (error) {
      console.error('Error starting workout:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Browse Workouts
      </Typography>

      <Box sx={{ mb: 3 }}>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredWorkouts.map((workout) => (
            <Grid item xs={12} sm={6} md={4} key={workout.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' }
                }}
                onClick={() => handleWorkoutClick(workout)}
              >
                {workout.image_path && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`/static/exercises/${workout.image_path}`}
                    alt={workout.title}
                    sx={{ objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error(`Failed to load image: ${target.src}`);
                      target.style.display = 'none';
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {workout.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {workout.description}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {workout.difficulty}
                  </Typography>

                  {/* Instructions Section */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Instructions</h4>
                    <p className="text-gray-600 whitespace-pre-line">{workout.instructions}</p>
                  </div>

                  {/* Benefits Section */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Benefits</h4>
                    <p className="text-gray-600 whitespace-pre-line">{workout.benefits}</p>
                  </div>

                  {/* Variations Section */}
                  {workout.variations && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Variations & Alternatives</h4>
                      <p className="text-gray-600 whitespace-pre-line">{workout.variations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedWorkout && (
          <>
            <DialogTitle>{selectedWorkout.title}</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                Difficulty: {selectedWorkout.difficulty}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedWorkout.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Exercises:
              </Typography>
              {selectedWorkout.exercises.map((exercise) => (
                <Box key={exercise.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {exercise.title}
                  </Typography>
                  {JSON.parse(exercise.image_paths).map((path: string, index: number) => (
                    <CardMedia
                      key={index}
                      component="img"
                      image={`/media/${path}`}
                      alt={exercise.title}
                      sx={{ height: 200, mb: 1, objectFit: 'contain' }}
                    />
                  ))}
                  <Typography variant="body2" paragraph>
                    <strong>Instructions:</strong>
                    <div dangerouslySetInnerHTML={{ __html: exercise.instructions }} />
                  </Typography>
                  <Typography variant="body2">
                    <strong>Benefits:</strong>
                    <div dangerouslySetInnerHTML={{ __html: exercise.benefits }} />
                  </Typography>
                </Box>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button onClick={handleStartWorkout} variant="contained" color="primary">
                Start Workout
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default WorkoutBrowser;
