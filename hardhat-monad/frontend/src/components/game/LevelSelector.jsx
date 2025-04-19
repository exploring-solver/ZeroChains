import React from 'react';
import { useGame } from '../../contexts/GameContext';
import {
  Box,
  Typography,
  Grid
} from '@mui/material';
import LevelCard from './LevelCard';

const LevelSelector = () => {
  const { playerLevel, totalLevels } = useGame();
  
  const levelDescriptions = {
    1: "Learn about blockchain transaction signatures and verify a signature to prove your understanding.",
    2: "Master cryptographic hashing by solving a hash puzzle with specific requirements.",
    3: "Navigate the Merkle tree maze by providing valid Merkle proofs for transactions.",
    4: "Identify and exploit the reentrancy vulnerability, then secure the contract against it.",
    5: "Participate in the Proof-of-Stake consensus mechanism to validate blocks."
  };
  
  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom>
        Game Levels
      </Typography>
      <Grid container spacing={3}>
        {[...Array(totalLevels)].map((_, index) => {
          const level = index + 1;
          return (
            <Grid item xs={12} md={6} key={level}>
              <LevelCard
                level={level}
                name={getLevelName(level)}
                description={levelDescriptions[level]}
                isUnlocked={playerLevel >= level - 1}
                isCompleted={playerLevel >= level}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

// Helper function to get level names (duplicated for component independence)
function getLevelName(level) {
  switch(level) {
    case 1: return "Genesis";
    case 2: return "Hash Fortress";
    case 3: return "Merkle Maze";
    case 4: return "Reentrancy Labyrinth";
    case 5: return "Consensus Arena";
    default: return `Level ${level}`;
  }
}

export default LevelSelector;
