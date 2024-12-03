import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Grid,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000';

interface WorkoutAsset {
  id: string;
  title: string;
  category: string;
}

interface CategoryCount {
  category: string;
  count: number;
}

const ExerciseList: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<WorkoutAsset[]>([]);
  const [category, setCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/workouts/assets/categories`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array');
      }

      const categoryList = data
        .filter((item: CategoryCount) => item && typeof item === 'object' && item.category)
        .map((item: CategoryCount) => item.category);

      setCategories(categoryList);
      setError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
      setCategories([]); // Reset categories on error
    }
  }, []);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/workouts/assets?skip=${(page - 1) * 24}&limit=24${
          category ? `&category=${encodeURIComponent(category)}` : ''
        }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      
      const data = await response.json();
      setExercises(data.exercises || []);
      setTotalPages(Math.ceil((data.total || 0) / 24));
      setError(null);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, [page, category, searchQuery]);

  const handleCategoryChange = useCallback((event: SelectChangeEvent<string>) => {
    setCategory(event.target.value);
    setPage(1); // Reset to first page when changing category
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises, page, category, searchQuery]);

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
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
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            value={category}
            onChange={handleCategoryChange}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          <Grid container spacing={2}>
            {exercises.map((exercise) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={exercise.id}>
                <Paper
                  sx={{
                    p: 2.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateY(-2px)',
                    },
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '80px',
                    borderRadius: '8px',
                  }}
                  onClick={() => navigate(`/exercise/${exercise.id}`)}
                >
                  <Typography>{exercise.title}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {exercises.length === 0 && !loading && (
            <Typography sx={{ textAlign: 'center', my: 4 }}>
              No exercises found
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ExerciseList;
