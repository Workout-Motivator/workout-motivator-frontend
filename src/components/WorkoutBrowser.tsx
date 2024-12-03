import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  CircularProgress,
  Stack,
  Chip,
  Collapse,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  SelectChangeEvent,
} from '@mui/material';
import { Search, FitnessCenter, Speed } from '@mui/icons-material';
import { API_BASE_URL } from '../config';

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  workout_asset_id: number;
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
  variations?: string;
  image_path: string;
  animation_path?: string;
}

const WorkoutCard: React.FC<{ workout: WorkoutAsset }> = ({ workout }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutAsset | null>(null);
  
  const getImageUrl = (path: string | null) => {
    if (!path) return '';
    return `${API_BASE_URL}/${path}`;
  };

  const fetchWorkoutDetails = async () => {
    if (workoutDetails || loading) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/workouts/assets/${workout.id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setWorkoutDetails(data);
      setExpanded(true);
    } catch (error) {
      console.error('Error fetching workout details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (expanded) {
      setExpanded(false);
    } else {
      fetchWorkoutDetails();
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        bgcolor: 'rgba(38, 38, 38, 0.9)',
        '&:hover': {
          bgcolor: 'rgba(48, 48, 48, 0.9)',
          transform: 'scale(1.02)',
        },
        transition: 'all 0.2s ease-in-out',
        borderRadius: 2,
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height={200}
          image={getImageUrl(workout.image_path)}
          alt={workout.title}
          sx={{ 
            objectFit: 'contain',
            bgcolor: 'transparent',
            mb: 2,
            borderRadius: 1,
          }}
        />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            color: '#fff',
            mb: 1,
            fontWeight: 500,
          }}
        >
          {workout.title}
        </Typography>
        <Stack direction="row" spacing={1} mb={2}>
          <Chip 
            icon={<FitnessCenter sx={{ color: '#fff !important' }} />} 
            label={workout.category} 
            size="small"
            sx={{
              bgcolor: 'rgba(0, 200, 83, 0.2)',
              color: '#fff',
              '& .MuiChip-icon': {
                color: '#fff',
              },
            }}
          />
          <Chip 
            icon={<Speed sx={{ color: '#fff !important' }} />} 
            label={workout.difficulty} 
            size="small"
            sx={{
              bgcolor: 'rgba(255, 64, 129, 0.2)',
              color: '#fff',
              '& .MuiChip-icon': {
                color: '#fff',
              },
            }}
          />
        </Stack>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {loading ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} sx={{ color: '#00c853' }} />
            </Box>
          ) : workoutDetails ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
                {workoutDetails.description}
              </Typography>
              
              <Typography variant="subtitle2" sx={{ color: '#00c853', mb: 1 }}>
                Instructions
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
                {workoutDetails.instructions}
              </Typography>

              <Typography variant="subtitle2" sx={{ color: '#00c853', mb: 1 }}>
                Benefits
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
                {workoutDetails.benefits}
              </Typography>

              <Typography variant="subtitle2" sx={{ color: '#00c853', mb: 1 }}>
                Muscles Worked
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
                {workoutDetails.muscles_worked}
              </Typography>

              {workoutDetails.variations && (
                <>
                  <Typography variant="subtitle2" sx={{ color: '#00c853', mb: 1 }}>
                    Variations
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
                    {workoutDetails.variations}
                  </Typography>
                </>
              )}
            </Box>
          ) : null}
        </Collapse>
      </Box>
    </Card>
  );
};

const WorkoutBrowser: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutAsset[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
    fetchCategories();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts/assets`, {
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

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts/assets/categories`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesCategory = !selectedCategory || workout.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'rgba(38, 38, 38, 0.9)', borderRadius: 1 }}>
            <InputLabel sx={{ color: '#fff' }}>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
              sx={{ 
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00c853',
                },
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={9}>
          <TextField
            fullWidth
            label="Search exercises"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              bgcolor: 'rgba(38, 38, 38, 0.9)',
              borderRadius: 1,
              '& label': { color: '#aaa' },
              '& input': { color: '#fff' },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00c853',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#aaa' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress sx={{ color: '#00c853' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredWorkouts.map((workout) => (
            <Grid item key={workout.id} xs={12} sm={6} md={4} lg={3}>
              <WorkoutCard workout={workout} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default WorkoutBrowser;
