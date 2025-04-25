import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { useWeb3 } from '../../contexts/Web3Context';
import LevelSelector from './LevelSelector';
import Leaderboard from './Leaderboard';
import PlayerProfile from './PlayerProfile';
import {
  Box,
  Container,
  Typography,
  Grid,
  LinearProgress,
  Paper,
  Chip,
  Alert,
  Button,
  Stack
} from '@mui/material';
import { Security, Stars } from '@mui/icons-material';

const GameDashboard = () => {
  const { isConnected, connectWallet } = useWeb3();
  const { playerLevel, totalLevels, isGenesisGuardian, isLoading } = useGame();
  
  const progressPercentage = (playerLevel / totalLevels) * 100;
  
  if (!isConnected) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Welcome to Blockchain Guardian
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Connect your wallet to start your journey as a Blockchain Guardian.
            Master security concepts, complete challenges, and earn NFTs as you progress.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Blockchain Guardian - Game Dashboard
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="h6">
                Your Progress: Level {playerLevel} / {totalLevels}
              </Typography><wbr></wbr>
              {isGenesisGuardian && (
                <Chip
                  icon={<Stars />}
                  label="Genesis Guardian"
                  color="secondary"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <LevelSelector />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <PlayerProfile />
              <Leaderboard />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default GameDashboard;