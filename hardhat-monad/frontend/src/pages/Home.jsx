// src/pages/Home.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import {
  Security,
  EmojiEvents,
  Leaderboard,
  School,
  Lock,
  Hub,
  AccountTree,
  BugReport,
  Groups,
} from '@mui/icons-material';

const Home = () => {
  const { isConnected, connectWallet } = useWeb3();

  const features = [
    { icon: <Security />, title: 'Interactive Challenges', description: 'Solve real blockchain security puzzles through interactive gameplay' },
    { icon: <EmojiEvents />, title: 'Earn NFTs', description: 'Collect unique NFTs for each completed challenge to showcase your skills' },
    { icon: <Leaderboard />, title: 'Global Leaderboard', description: 'Compete with other players and climb the security expert rankings' },
    { icon: <School />, title: 'Learn by Doing', description: 'Gain practical knowledge through hands-on experience' },
  ];

  const levels = [
    { icon: <Lock />, title: 'Level 1: Genesis', description: 'Learn about transaction signatures and verify message signatures on-chain' },
    { icon: <Hub />, title: 'Level 2: Hash Fortress', description: 'Master cryptographic hashing by solving complex hash puzzles' },
    { icon: <AccountTree />, title: 'Level 3: Merkle Maze', description: 'Navigate Merkle trees and provide valid proofs for transactions' },
    { icon: <BugReport />, title: 'Level 4: Reentrancy Labyrinth', description: 'Identify, exploit, and fix smart contract vulnerabilities' },
    { icon: <Groups />, title: 'Level 5: Consensus Arena', description: 'Participate in blockchain consensus and validate transactions' },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Hero Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Blockchain Guardian
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Master blockchain security through interactive challenges
          </Typography>

          <List>
            {['Transaction signatures and cryptography',
              'Hash functions and data integrity',
              'Merkle trees and proof validation',
              'Smart contract vulnerabilities and prevention',
              'Consensus mechanisms and blockchain validation'
            ].map((item, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Security />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 4 }}>
            {isConnected ? (
              <Button
                component={RouterLink}
                to="/game"
                variant="contained"
                size="large"
                sx={{ mr: 2 }}
              >
                Enter the Game
              </Button>
            ) : (
              <Button
                onClick={connectWallet}
                variant="contained"
                size="large"
                sx={{ mr: 2 }}
              >
                Connect Wallet to Play
              </Button>
            )}
            <Button
              component={RouterLink}
              to="/about"
              variant="outlined"
              size="large"
            >
              Learn More
            </Button>
          </Box>
        </Paper>

        {/* Features Section */}
        <Typography variant="h3" component="h2" gutterBottom>
          Game Features
        </Typography>
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Levels Section */}
        <Typography variant="h3" component="h2" gutterBottom>
          Game Levels
        </Typography>
        <Grid container spacing={4}>
          {levels.map((level, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {level.icon}
                    <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
                      {level.title}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    {level.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;

