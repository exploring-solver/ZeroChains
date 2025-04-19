// src/components/game/PlayerProfile.jsx
import React from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useGame } from '../../contexts/GameContext';
import {
  Box,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Divider,
  Avatar
} from '@mui/material';
import {
  Security,
  LocalGasStation,
  EmojiEvents,
  Stars
} from '@mui/icons-material';

const PlayerProfile = () => {
  const { account } = useWeb3();
  const { 
    playerLevel, 
    securityPoints, 
    totalGasUsed, 
    isGenesisGuardian,
    playerNFTs, 
    isLoading 
  } = useGame();
  
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Guardian Profile
        </Typography>
        
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Chip 
                label={formatAddress(account)}
                variant="outlined"
                color="primary"
              />
              {isGenesisGuardian && (
                <Chip
                  icon={<Stars />}
                  label="Genesis Guardian"
                  color="secondary"
                />
              )}
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Security color="primary" />
                  <Typography variant="h6">{playerLevel}</Typography>
                  <Typography variant="body2" color="text.secondary">Level</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <EmojiEvents color="primary" />
                  <Typography variant="h6">{securityPoints}</Typography>
                  <Typography variant="body2" color="text.secondary">Points</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <LocalGasStation color="primary" />
                  <Typography variant="h6">{totalGasUsed}</Typography>
                  <Typography variant="body2" color="text.secondary">Gas Used</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Stars color="primary" />
                  <Typography variant="h6">{playerNFTs.length}</Typography>
                  <Typography variant="body2" color="text.secondary">NFTs</Typography>
                </Box>
              </Grid>
            </Grid>

            {playerNFTs.length > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle1" gutterBottom>
                  Recent NFTs
                </Typography>
                <Grid container spacing={1}>
                  {playerNFTs.slice(0, 3).map(nft => (
                    <Grid item xs={4} key={nft.tokenId}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box textAlign="center">
                            <Avatar sx={{ bgcolor: 'primary.main', margin: '0 auto' }}>
                              L{nft.level}
                            </Avatar>
                            <Typography variant="caption">
                              #{nft.tokenId}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerProfile;