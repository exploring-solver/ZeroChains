// src/components/game/CompletionDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Divider
} from '@mui/material';
import {
  EmojiEvents,
  CheckCircle,
  Celebration,
  ArrowForward,
  Home
} from '@mui/icons-material';

const CompletionDialog = ({ open, levelId, levelName, onClose, onNextLevel }) => {
  // Completion messages based on level
  const completionMessages = {
    1: "You've mastered ECDSA signatures! You now understand how blockchain transactions are signed and verified.",
    2: "You're a hash mining expert! You now understand how cryptographic hashing works in blockchain systems.",
    3: "You've conquered the Merkle tree! You now understand how data can be efficiently verified in blockchains.",
    4: "You've exploited and patched a reentrancy vulnerability! You're on your way to becoming a smart contract security expert.",
    5: "You've participated in a consensus system! You now understand how Proof-of-Stake systems work."
  };

  // Points and badges based on level
  const levelRewards = {
    1: { points: 100, badge: "Genesis Signer" },
    2: { points: 200, badge: "Hash Miner" },
    3: { points: 300, badge: "Merkle Master" },
    4: { points: 400, badge: "Security Guardian" },
    5: { points: 500, badge: "Consensus Validator" }
  };

  const rewards = levelRewards[levelId] || { points: 100, badge: "Guardian" };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          backgroundImage: 'linear-gradient(to bottom right, #3a3a3a, #1a1a1a)',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        <Celebration sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          Level Complete!
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="subtitle1" color="primary.light" gutterBottom>
            Level {levelId}: {levelName}
          </Typography>
          <Typography variant="body1" paragraph>
            {completionMessages[levelId] || "You've completed the challenge successfully!"}
          </Typography>
        </Box>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3, 
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EmojiEvents sx={{ fontSize: 30, color: '#FFD700', mr: 2 }} />
            <Typography variant="h6">
              Rewards Earned
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Security Points:</Typography>
            <Typography variant="body1" fontWeight="bold" color="primary.light">
              +{rewards.points} Points
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1">NFT Badge:</Typography>
            <Typography variant="body1" fontWeight="bold" color="secondary.light">
              "{rewards.badge}"
            </Typography>
          </Box>
        </Paper>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" color="primary.light" gutterBottom>
            <CheckCircle sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
            Level {levelId} progress saved to blockchain
          </Typography>
          {levelId < 5 ? (
            <Typography variant="body2">
              Continue to Level {levelId + 1} to keep building your skills!
            </Typography>
          ) : (
            <Typography variant="body2">
              Congratulations! You've completed all levels and become a Blockchain Guardian!
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        {levelId < 5 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={onNextLevel}
            endIcon={<ArrowForward />}
            size="large"
            sx={{ px: 3 }}
          >
            Next Level
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
            endIcon={<Home />}
            size="large"
            sx={{ px: 3 }}
          >
            Back to Home
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CompletionDialog;