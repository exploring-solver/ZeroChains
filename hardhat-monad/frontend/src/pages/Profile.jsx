// src/pages/Profile.jsx
import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import PlayerProfile from '../components/game/PlayerProfile';
import NFTGallery from '../components/game/NFTGallery';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Grid 
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

const Profile = () => {
  const { isConnected, connectWallet } = useWeb3();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {isConnected ? (
          <Box>
            <Typography variant="h4" gutterBottom>
              Guardian Profile
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <PlayerProfile />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    NFT Collection
                  </Typography>
                  <NFTGallery />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <AccountCircle sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Connect Your Wallet to View Profile
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              To view your Guardian profile and NFT collection, you need to connect your Ethereum wallet.
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

export default Profile;

