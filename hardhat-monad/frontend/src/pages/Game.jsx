// src/pages/Game.jsx
import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import GameDashboard from '../components/game/GameDashboard';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box 
} from '@mui/material';
import { GamesOutlined } from '@mui/icons-material';
import Levels from './Levels';

const Game = () => {
  const { isConnected, connectWallet } = useWeb3();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {isConnected ? (
          <GameDashboard />
        ) : (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <GamesOutlined sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Connect Your Wallet to Play
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              To start playing Blockchain Guardian, you need to connect your Ethereum wallet.
              This will allow you to interact with the game's smart contracts, earn NFTs, and track your progress.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              onClick={connectWallet}
              sx={{ mt: 2 }}
            >
              Connect Wallet
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Game;

