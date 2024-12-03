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
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

interface WorkoutAsset {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  image_path: string;
}

interface PaginatedResponse {
  exercises: WorkoutAsset[];
  total: number;
  page: number;
  pages: number;
}

const ExerciseList: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<WorkoutAsset[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<WorkoutAsset[]>([]);
  const [category, setCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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
    setError(null);
    try {
      let url = `http://localhost:8000/workouts/assets/?page=${page}&limit=12`;
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaginatedResponse = await response.json();
      setExercises(data.exercises);
      setFilteredExercises(data.exercises);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch exercises');
      setExercises([]);
      setFilteredExercises([]);
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center', p: 3 }}>
          {error}
        </Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            {filteredExercises.map((exercise) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={exercise.title}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => {
                    navigate(`/exercise/${exercise.title}`);
                  }}
                >
                  {exercise.image_path && (
                    <Box sx={{ position: 'relative', pt: '56.25%' }}> {/* 16:9 aspect ratio */}
                      <Box
                        component="img"
                        src={`http://localhost:8000${exercise.image_path}`}
                        alt={exercise.title}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  )}
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {exercise.title}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {exercise.category}
                      </Typography>
                      <Chip 
                        label={exercise.difficulty}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ExerciseList;
