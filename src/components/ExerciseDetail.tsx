import React from 'react';
import { Exercise } from '../types/exercise';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Divider } from '@mui/material';
import { FitnessCenter, Speed, Category } from '@mui/icons-material';

interface ExerciseDetailProps {
    exercise: Exercise;
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ exercise }) => {
    return (
        <Card sx={{ maxWidth: '100%', mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
                {exercise.animation_path ? (
                    <CardMedia
                        component="img"
                        height="300"
                        image={exercise.animation_path}
                        alt={exercise.title}
                        sx={{ objectFit: 'contain' }}
                    />
                ) : exercise.image_path ? (
                    <CardMedia
                        component="img"
                        height="300"
                        image={exercise.image_path}
                        alt={exercise.title}
                        sx={{ objectFit: 'contain' }}
                    />
                ) : null}
            </Box>
            
            <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
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
                    {exercise.muscles_worked && (
                        <Chip 
                            icon={<FitnessCenter />} 
                            label={exercise.muscles_worked} 
                            color="success" 
                            variant="outlined" 
                        />
                    )}
                </Box>

                <Typography variant="body1" color="text.secondary" paragraph>
                    {exercise.description}
                </Typography>

                {exercise.instructions && (
                    <>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Instructions
                        </Typography>
                        <Typography variant="body2" paragraph>
                            {exercise.instructions}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                    </>
                )}

                {exercise.benefits && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Benefits
                        </Typography>
                        <Typography variant="body2" paragraph>
                            {exercise.benefits}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                    </>
                )}

                {exercise.variations && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Variations & Alternatives
                        </Typography>
                        <Typography variant="body2" paragraph>
                            {exercise.variations}
                        </Typography>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ExerciseDetail;
