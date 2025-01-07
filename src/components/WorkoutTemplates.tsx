import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';
import { useAuth } from '../auth/AuthContext';

interface Exercise {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
}

interface WorkoutExercise {
  exercise_id: number;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
  order: number;
  exercise?: Exercise;
}

interface WorkoutTemplate {
  id: number;
  title: string;
  description?: string;
  user_id: string;
  difficulty?: string;
  estimated_duration?: number;
  exercises: WorkoutExercise[];
}

const WorkoutTemplates: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    estimated_duration: '',
  });

  // Fetch templates
  useEffect(() => {
    if (user) {
      fetchTemplates();
      fetchExercises();
    }
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/workout-templates/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/exercises/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleOpenDialog = (template?: WorkoutTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        title: template.title,
        description: template.description || '',
        difficulty: template.difficulty || '',
        estimated_duration: template.estimated_duration?.toString() || '',
      });
      setSelectedExercises(template.exercises);
    } else {
      setEditingTemplate(null);
      setFormData({
        title: '',
        description: '',
        difficulty: '',
        estimated_duration: '',
      });
      setSelectedExercises([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTemplate(null);
    setSelectedExercises([]);
  };

  const handleAddExercise = () => {
    const newExercise: WorkoutExercise = {
      exercise_id: exercises.length > 0 ? exercises[0].id : 0,
      sets: 3,
      reps: 10,
      order: selectedExercises.length,
      weight: undefined,
      duration: undefined,
      distance: undefined,
      notes: ''
    };
    setSelectedExercises([...selectedExercises, newExercise]);
  };

  const handleExerciseChange = (index: number, field: keyof WorkoutExercise, value: any) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value,
    };
    setSelectedExercises(updatedExercises);
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === selectedExercises.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedExercises = [...selectedExercises];
    const temp = updatedExercises[index];
    updatedExercises[index] = updatedExercises[newIndex];
    updatedExercises[newIndex] = temp;

    // Update order
    updatedExercises.forEach((exercise, i) => {
      exercise.order = i;
    });

    setSelectedExercises(updatedExercises);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = selectedExercises.filter((_, i) => i !== index);
    // Update order
    updatedExercises.forEach((exercise, i) => {
      exercise.order = i;
    });
    setSelectedExercises(updatedExercises);
  };

  const handleSubmit = async () => {
    if (!user) return;

    const templateData = {
      title: formData.title,
      description: formData.description || undefined,
      user_id: user.uid,
      difficulty: formData.difficulty || undefined,
      estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : undefined,
      exercises: selectedExercises.map(ex => ({
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight || undefined,
        duration: ex.duration || undefined,
        distance: ex.distance || undefined,
        notes: ex.notes || undefined,
        order: ex.order
      }))
    };

    try {
      const url = editingTemplate
        ? `${API_BASE_URL}/workout-templates/${editingTemplate.id}`
        : `${API_BASE_URL}/workout-templates/`;
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000'
        },
        credentials: 'include',
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchTemplates();
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData || response.statusText);
        alert('Failed to save workout template. Please try again.');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save workout template. Please check your connection and try again.');
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workout-templates/${templateId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000'
        }
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Workout Templates</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{template.title}</Typography>
                <Typography color="textSecondary" gutterBottom>
                  {template.description}
                </Typography>
                {template.difficulty && (
                  <Chip
                    label={template.difficulty}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                {template.estimated_duration && (
                  <Chip
                    label={`${template.estimated_duration} min`}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                  Exercises: {template.exercises.length}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(template)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Edit Workout Template' : 'Create Workout Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    label="Difficulty"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Estimated Duration (minutes)"
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_duration: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Exercises
            </Typography>
            <List>
              {selectedExercises.map((exercise, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <Stack spacing={2} sx={{ width: '100%' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Exercise</InputLabel>
                          <Select
                            value={exercise.exercise_id}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                'exercise_id',
                                e.target.value
                              )
                            }
                            label="Exercise"
                          >
                            {exercises.map((ex) => (
                              <MenuItem key={ex.id} value={ex.id}>
                                {ex.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Sets"
                          type="number"
                          value={exercise.sets}
                          onChange={(e) =>
                            handleExerciseChange(
                              index,
                              'sets',
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Reps"
                          type="number"
                          value={exercise.reps}
                          onChange={(e) =>
                            handleExerciseChange(
                              index,
                              'reps',
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Weight (kg)"
                          type="number"
                          value={exercise.weight || ''}
                          onChange={(e) =>
                            handleExerciseChange(
                              index,
                              'weight',
                              parseFloat(e.target.value)
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Duration (seconds)"
                          type="number"
                          value={exercise.duration || ''}
                          onChange={(e) =>
                            handleExerciseChange(
                              index,
                              'duration',
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Distance (meters)"
                          type="number"
                          value={exercise.distance || ''}
                          onChange={(e) =>
                            handleExerciseChange(
                              index,
                              'distance',
                              parseFloat(e.target.value)
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      fullWidth
                      label="Notes"
                      value={exercise.notes || ''}
                      onChange={(e) =>
                        handleExerciseChange(index, 'notes', e.target.value)
                      }
                    />
                  </Stack>
                  <ListItemSecondaryAction>
                    <Stack direction="column">
                      <IconButton
                        edge="end"
                        onClick={() => handleMoveExercise(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUpIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleMoveExercise(index, 'down')}
                        disabled={index === selectedExercises.length - 1}
                      >
                        <ArrowDownIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveExercise(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddExercise}
              sx={{ mt: 2 }}
            >
              Add Exercise
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkoutTemplates;
