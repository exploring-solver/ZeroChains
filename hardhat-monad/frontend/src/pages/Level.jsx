// src/pages/Level.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import { 
  Container, 
  Paper, 
  Typography, 
  Box,
  Alert,
  LinearProgress
} from '@mui/material';
import { LockOutlined, SecurityOutlined } from '@mui/icons-material';

// Import level components
import Level1Genesis from '../components/levels/Level1Genesis';
import Level2HashFortress from '../components/levels/Level2HashFortress';
import Level3MerkleMaze from '../components/levels/Level3MerkleMaze';
import Level4ReentrancyLabyrinth from '../components/levels/Level4ReentrancyLabyrinth';
import Level5ConsensusArena from '../components/levels/Level5ConsensusArena';

const Level = () => {
  const { id } = useParams();
  const { isConnected } = useWeb3();
  const { playerLevel, totalLevels } = useGame();
  
  const levelId = parseInt(id);
  const isValidLevel = !isNaN(levelId) && levelId > 0 && levelId <= totalLevels;
  const isAccessible = isConnected && playerLevel >= levelId - 1;
  
  const renderLevelComponent = () => {
    switch(levelId) {
      case 1:
        return <Level1Genesis />;
      case 2:
        return <Level2HashFortress />;
      case 3:
        return <Level3MerkleMaze />;
      case 4:
        return <Level4ReentrancyLabyrinth />;
      case 5:
        return <Level5ConsensusArena />;
      default:
        return (
          <div className="level-placeholder">
            <h2>Level {levelId}</h2>
            <p>This level is coming soon!</p>
          </div>
        );
    }
  };
  
  if (!isValidLevel) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            Invalid level. Please select a level between 1 and {totalLevels}.
          </Alert>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {isConnected ? (
          isAccessible ? (
            <Box>
              <Typography variant="h4" gutterBottom>
                Level {levelId}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(playerLevel / totalLevels) * 100} 
                sx={{ mb: 4 }}
              />
              <Paper elevation={3} sx={{ p: 3 }}>
                {renderLevelComponent()}
              </Paper>
            </Box>
          ) : (
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <LockOutlined sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Level {levelId} Locked
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You need to complete the previous level to unlock this one.
              </Typography>
            </Paper>
          )
        ) : (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <SecurityOutlined sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Connect Your Wallet to Play
            </Typography>
            <Typography variant="body1" color="text.secondary">
              To access this level, you need to connect your Ethereum wallet.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Level;

