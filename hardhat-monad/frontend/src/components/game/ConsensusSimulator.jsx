// src/components/game/ConsensusSimulator.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Chip
} from '@mui/material';
import {
  AccountBalanceWallet,
  VerifiedUser,
  Timeline,
  CheckCircle,
  Warning
} from '@mui/icons-material';

// Simulated validators
const defaultValidators = [
  { address: 'Alice', stake: 100, isVoting: true, vote: true },
  { address: 'Bob', stake: 70, isVoting: true, vote: true },
  { address: 'Charlie', stake: 50, isVoting: true, vote: false },
  { address: 'Dave', stake: 30, isVoting: false, vote: false }
];

const ConsensusSimulator = ({ userStake = 0, totalStake = 0, currentBlock = 1, votingPower = 0 }) => {
  const [validators, setValidators] = useState([...defaultValidators]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [consensusReached, setConsensusReached] = useState(false);
  const [approvalPercentage, setApprovalPercentage] = useState(0);
  const [votingPercentage, setVotingPercentage] = useState(0);
  
  // Add user to validators if they have stake
  useEffect(() => {
    if (userStake > 0) {
      const newValidators = [...defaultValidators];
      const userValidator = {
        address: 'You',
        stake: userStake,
        isVoting: true,
        vote: true
      };
      
      // Replace existing 'You' validator or add a new one
      const userIndex = newValidators.findIndex(v => v.address === 'You');
      if (userIndex >= 0) {
        newValidators[userIndex] = userValidator;
      } else {
        newValidators.push(userValidator);
      }
      
      setValidators(newValidators);
    }
  }, [userStake]);

  // Simulate consensus
  useEffect(() => {
    // Start simulation
    setSimulationRunning(true);
    setConsensusReached(false);
    
    // Calculate voting stats
    const simulationTimeout = setTimeout(() => {
      let totalVotingStake = 0;
      let totalApprovalStake = 0;
      
      validators.forEach(validator => {
        if (validator.isVoting) {
          totalVotingStake += validator.stake;
          if (validator.vote) {
            totalApprovalStake += validator.stake;
          }
        }
      });
      
      const simulatedTotalStake = validators.reduce((sum, v) => sum + v.stake, 0);
      setVotingPercentage((totalVotingStake / simulatedTotalStake) * 100);
      setApprovalPercentage((totalApprovalStake / totalVotingStake) * 100);
      
      // Check if consensus is reached (> 66% approval)
      const reached = approvalPercentage >= 66 && votingPercentage >= 66;
      setConsensusReached(reached);
      
      setSimulationRunning(false);
    }, 2000);
    
    return () => clearTimeout(simulationTimeout);
  }, [validators, currentBlock]);

  // Calculate system status
  const getSystemStatus = () => {
    if (simulationRunning) {
      return { label: "Collecting Votes...", color: "warning" };
    }
    
    if (votingPercentage < 66) {
      return { label: "Awaiting More Votes", color: "warning" };
    }
    
    if (approvalPercentage >= 66) {
      return { label: "Consensus Reached", color: "success" };
    }
    
    return { label: "Block Rejected", color: "error" };
  };

  const status = getSystemStatus();

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
          Consensus Simulator
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2">
            Active Block: <strong>#{currentBlock}</strong>
          </Typography>
          <Chip 
            icon={consensusReached ? <CheckCircle /> : <Warning />}
            label={status.label}
            color={status.color}
            size="small"
          />
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Voting Participation
              </Typography>
              {simulationRunning ? (
                <CircularProgress size={30} />
              ) : (
                <>
                  <LinearProgress 
                    variant="determinate" 
                    value={votingPercentage} 
                    color={votingPercentage >= 66 ? "success" : "warning"}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="body2" align="right">
                    {votingPercentage.toFixed(1)}%
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Approval Rate
              </Typography>
              {simulationRunning ? (
                <CircularProgress size={30} />
              ) : (
                <>
                  <LinearProgress 
                    variant="determinate" 
                    value={approvalPercentage} 
                    color={approvalPercentage >= 66 ? "success" : "error"}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="body2" align="right">
                    {approvalPercentage.toFixed(1)}%
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        <Typography variant="subtitle2" gutterBottom>
          Validator Network
        </Typography>
        
        <Grid container spacing={1}>
          {validators.map((validator, index) => (
            <Grid item xs={6} key={validator.address}>
              <Tooltip 
                title={validator.isVoting 
                  ? `Voting ${validator.vote ? 'YES' : 'NO'}` 
                  : 'Not participating'}
                arrow
              >
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    display: 'flex', 
                    alignItems: 'center',
                    opacity: validator.isVoting ? 1 : 0.6,
                    bgcolor: validator.isVoting 
                      ? (validator.vote ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)') 
                      : 'inherit'
                  }}
                >
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    {validator.address === 'You' ? (
                      <AccountBalanceWallet color="primary" />
                    ) : (
                      <VerifiedUser color={validator.isVoting ? "success" : "disabled"} />
                    )}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={validator.address === 'You' ? 'bold' : 'normal'}
                    >
                      {validator.address}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(validator.stake / (totalStake || 280)) * 100}
                        sx={{ height: 6, borderRadius: 3, flexGrow: 1, mr: 1 }}
                        color={validator.address === 'You' ? "primary" : "secondary"}
                      />
                      <Typography variant="caption">
                        {validator.stake} ETH
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          This simulation shows how validators with different stake amounts participate in consensus.
          {userStake > 0 && " Your voting power is proportional to your stake."}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ConsensusSimulator;