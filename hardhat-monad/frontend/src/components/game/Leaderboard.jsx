import React from 'react';
import { useGame } from '../../contexts/GameContext';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

const Leaderboard = () => {
  const { leaderboard, isLoading } = useGame();
  
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!leaderboard.length) {
    return (
      <Alert severity="info">
        No players on the leaderboard yet.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <EmojiEvents color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Leaderboard
        </Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Player</TableCell>
              <TableCell align="right">Level</TableCell>
              <TableCell align="right">Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((player, index) => (
              <TableRow key={player.wallet}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{formatAddress(player.wallet)}</TableCell>
                <TableCell align="right">{player.levelsCompleted}</TableCell>
                <TableCell align="right">{player.securityPoints}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Leaderboard;