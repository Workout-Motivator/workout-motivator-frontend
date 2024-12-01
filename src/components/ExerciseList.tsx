import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Select,
  SelectChangeEvent, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CardActionArea,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ExerciseDetail from './ExerciseDetail';
import { Exercise } from '../types/exercise';

interface WorkoutAsset extends Exercise {}

interface PaginatedResponse {
  exercises: WorkoutAsset[];
  total: number;
  page: number;
  pages: number;
}

const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<WorkoutAsset[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<WorkoutAsset[]>([]);
  const [category, setCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<WorkoutAsset | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []); // Only fetch categories once when component mounts

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      fetchExercises();
    }, 300); // Wait 300ms after last change before fetching

    setDebounceTimeout(timeout);

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [category, searchQuery, page]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/workouts/assets/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/workouts/assets/?page=${page}&limit=12${
          category ? `&category=${category}` : ''
        }${searchQuery ? `&search=${searchQuery}` : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
      }

      const data: PaginatedResponse = await response.json();
      
      setExercises(data.exercises);
      setFilteredExercises(data.exercises);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch exercises');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
    setPage(1); // Reset to first page when category changes
  };

  const handleExerciseClick = (exercise: WorkoutAsset) => {
    setSelectedExercise(exercise);
  };

  const handleCloseDialog = () => {
    setSelectedExercise(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }
      }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Search exercises"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ 
            flexGrow: 1,
            maxWidth: { sm: 300 }
          }}
          InputProps={{
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  edge="end"
                >
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <Grid item xs={12} sm={6} md={4} key={exercise.id}>
                  <ExerciseDetail exercise={exercise} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography>No exercises found.</Typography>
              </Grid>
            )}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Dialog
        open={Boolean(selectedExercise)}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedExercise && (
          <>
            <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
              {selectedExercise.title}
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {selectedExercise.image_path && (
                <Box
                  component="img"
                  sx={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    mb: 2,
                  }}
                  src={`http://localhost:8000/static/${selectedExercise.image_path}`}
                  alt={selectedExercise.title}
                />
              )}
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Category: {selectedExercise.category}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedExercise.description}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ExerciseList;
