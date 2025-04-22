// src/components/game/TutorialPanel.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  School, 
  ArrowForward, 
  CheckCircle 
} from '@mui/icons-material';

const TutorialPanel = ({ title, content, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  
  // Split content into steps for a more interactive experience
  const tutorialSteps = [
    {
      label: 'Introduction',
      content: content
    },
    {
      label: 'Key Concepts',
      content: 'Understanding these key concepts will help you solve the challenge successfully.'
    },
    {
      label: 'Practical Examples',
      content: 'Let\'s look at some practical examples of how these concepts are applied in blockchain.'
    }
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        <School sx={{ mr: 1, verticalAlign: 'middle' }} />
        {title}
      </Typography>
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {tutorialSteps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Typography variant="body1" paragraph>
                {step.content}
              </Typography>
              <Box sx={{ mb: 2 }}>
                {index < tutorialSteps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleComplete}
                    endIcon={<CheckCircle />}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Complete Tutorial
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === tutorialSteps.length && (
        <Card variant="outlined" sx={{ mt: 2, bgcolor: 'success.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
              Tutorial Completed!
            </Typography>
            <Typography variant="body1">
              You're now ready to take on the challenge.
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleComplete}
            >
              Start Challenge
            </Button>
          </CardActions>
        </Card>
      )}
    </Paper>
  );
};

export default TutorialPanel;