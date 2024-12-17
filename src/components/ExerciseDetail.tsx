import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, Typography, Button, CircularProgress, Chip, Divider } from '@mui/material';
import { FitnessCenter, Speed, Category, ArrowBack } from '@mui/icons-material';

interface Exercise {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    instructions: string;
    benefits: string;
    muscles_worked: string;
    variations: string;
    image_path?: string;
    animation_path?: string;
}

const ExerciseDetail: React.FC = () => {
    const { title } = useParams<{ title: string }>();
    const navigate = useNavigate();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExercise = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8000/exercises/${encodeURIComponent(title || '')}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Exercise not found');
                    }
                    throw new Error('Failed to fetch exercise details');
                }
                const data = await response.json();
                setExercise(data);
                setError(null);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to fetch exercise details');
            } finally {
                setLoading(false);
            }
        };

        if (title) {
            fetchExercise();
        }
    }, [title]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !exercise) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error" variant="h6" gutterBottom>
                    {error || 'Exercise not found'}
                </Typography>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/exercises')}
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    Back to Exercises
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 'lg', mx: 'auto' }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/exercises')}
                sx={{ mb: 3 }}
            >
                Back to Exercises
            </Button>
            
            <Card sx={{ mb: 4 }}>
                {(exercise.animation_path || exercise.image_path) && (
                    <CardMedia
                        component="img"
                        height="400"
                        image={exercise.animation_path ? `http://localhost:8000${exercise.animation_path}` : `http://localhost:8000${exercise.image_path}`}
                        alt={exercise.title}
                        sx={{ objectFit: 'contain', bgcolor: 'background.paper' }}
                    />
                )}
                
                <CardContent>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {exercise.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip 
                                icon={<Category />} 
                                label={exercise.category} 
                                color="primary" 
                                variant="outlined"
                            />
                            <Chip 
                                icon={<Speed />} 
                                label={exercise.difficulty} 
                                color="secondary" 
                                variant="outlined"
                            />
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            {exercise.description}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Instructions
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {exercise.instructions}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Benefits
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {exercise.benefits}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Muscles Worked
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {exercise.muscles_worked}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Variations
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {exercise.variations}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ExerciseDetail;
