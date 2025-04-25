// src/components/levels/LevelCard.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CardActions
} from '@mui/material';
import {
  Lock,
  CheckCircle,
  PlayArrow
} from '@mui/icons-material';

const LevelCard = ({ level, name, description, isUnlocked, isCompleted }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: isUnlocked ? 1 : 0.7
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            Level {level}: {name}
          </Typography>
          {isCompleted && (
            <Chip
              icon={<CheckCircle />}
              label="Completed"
              color="success"
              size="small"
            />
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>

      <CardActions>
        {isUnlocked ? (
          <Button
            component={RouterLink}
            to={`/levels/${level}`}
            variant="contained"
            startIcon={<PlayArrow />}
            fullWidth
          >
            {isCompleted ? 'Play Again' : 'Start Level'}
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<Lock />}
            disabled
            fullWidth
          >
            Complete Previous Level
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default LevelCard;