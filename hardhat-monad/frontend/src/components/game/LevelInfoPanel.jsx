// src/components/game/LevelInfoPanel.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Chip
} from '@mui/material';
import {
  School,
  PlayArrow,
  CheckCircle,
  LockOpen,
  SecurityUpdateWarning
} from '@mui/icons-material';

const LevelInfoPanel = ({ levelId, activeStep = 0, steps = [], onStepChange }) => {
  const levelIcons = {
    1: <LockOpen />,
    2: <SecurityUpdateWarning />,
    3: <School />,
    4: <School />,
    5: <CheckCircle />
  };

  const levelDescriptions = {
    1: "Learn about digital signatures in Ethereum using ECDSA.",
    2: "Explore cryptographic hashing and solve hash-based challenges.",
    3: "Master Merkle trees and create valid proofs.",
    4: "Identify, exploit, and fix a reentrancy vulnerability.",
    5: "Understand Proof-of-Stake mechanics through a simulated consensus system."
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ mr: 2 }}>
          {levelIcons[levelId] || <School />}
        </Box>
        <Box>
          <Typography variant="h6">
            Level {levelId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {levelDescriptions[levelId] || "Complete this challenge to progress."}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        Progress
      </Typography>

      <List dense>
        {Array.isArray(steps) && steps.map((step, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton 
              selected={activeStep === index}
              onClick={() => onStepChange(index)}
            >
              <ListItemIcon>
                {activeStep > index ? (
                  <CheckCircle color="success" />
                ) : activeStep === index ? (
                  <PlayArrow color="primary" />
                ) : (
                  <School color="disabled" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={step} 
                secondary={activeStep > index ? "Completed" : activeStep === index ? "In Progress" : "Pending"}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        Skills
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {levelId === 1 && (
          <>
            <Chip size="small" label="ECDSA" />
            <Chip size="small" label="Signatures" />
            <Chip size="small" label="Wallet Integration" />
          </>
        )}
        {levelId === 2 && (
          <>
            <Chip size="small" label="Cryptography" />
            <Chip size="small" label="Keccak256" />
            <Chip size="small" label="Hash Mining" />
          </>
        )}
        {levelId === 3 && (
          <>
            <Chip size="small" label="Merkle Trees" />
            <Chip size="small" label="Merkle Proofs" />
            <Chip size="small" label="Data Structures" />
          </>
        )}
        {levelId === 4 && (
          <>
            <Chip size="small" label="Smart Contract Security" />
            <Chip size="small" label="Reentrancy" />
            <Chip size="small" label="Exploit Development" />
          </>
        )}
        {levelId === 5 && (
          <>
            <Chip size="small" label="Consensus" />
            <Chip size="small" label="Proof-of-Stake" />
            <Chip size="small" label="Governance" />
          </>
        )}
      </Box>
    </Paper>
  );
};

LevelInfoPanel.propTypes = {
  levelId: PropTypes.number.isRequired,
  activeStep: PropTypes.number,
  steps: PropTypes.arrayOf(PropTypes.string),
  onStepChange: PropTypes.func.isRequired
};

export default LevelInfoPanel;