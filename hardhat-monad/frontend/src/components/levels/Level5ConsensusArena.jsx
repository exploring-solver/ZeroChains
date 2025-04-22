// src/components/levels/Level5Consensus.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  Slider,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  ExpandMore, 
  Code, 
  CheckCircleRounded,
  HelpOutline,
  VerifiedUser,
  DoneAll,
  Timeline,
  MonetizationOn,
  HowToVote
} from '@mui/icons-material';

import { useWeb3 } from '../../contexts/Web3Context';
import CodeEditor from '../game/CodeEditor';
import ConsensusSimulator from '../game/ConsensusSimulator';

const Level5Consensus = ({ onComplete, isCompleted }) => {
  const { contracts, account, provider } = useWeb3();
  
  const [totalStake, setTotalStake] = useState('0');
  const [userStake, setUserStake] = useState('0');
  const [stakeAmount, setStakeAmount] = useState('0.1');
  const [currentBlock, setCurrentBlock] = useState(1);
  const [blockFinalized, setBlockFinalized] = useState(false);
  const [voteApproval, setVoteApproval] = useState(true);
  const [blockParticipation, setBlockParticipation] = useState([]);
  const [isStaking, setIsStaking] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [codeExample, setCodeExample] = useState(`// Example of interacting with a Proof-of-Stake system
async function participateInConsensus(contract, stakeAmount) {
  // 1. Stake tokens to gain voting power
  const stakeInWei = ethers.utils.parseEther(stakeAmount);
  const stakeTx = await contract.stakeTokens({ value: stakeInWei });
  await stakeTx.wait();
  console.log("Staked:", stakeAmount, "ETH");
  
  // 2. Submit a vote for the current block
  // true = approve, false = reject
  const voteTx = await contract.submitVote(true);
  await voteTx.wait();
  console.log("Vote submitted for current block");
  
  // 3. Check if block is finalized
  const currentBlockId = await contract.currentBlockId();
  const block = await contract.blocks(currentBlockId - 1);
  console.log("Block finalized:", block.finalized);
  
  // 4. Wait for block finalization if needed
  // In a real implementation, you'd listen for events
  
  // 5. Repeat for multiple blocks to establish consensus history
}

// Calculate voting power distribution
function calculateStakeDistribution(validators) {
  const totalStake = validators.reduce((sum, v) => sum + v.stake, 0);
  return validators.map(v => ({
    ...v,
    votingPower: (v.stake / totalStake) * 100
  }));
}`);

  const hints = [
    "Stake tokens to gain voting power in the consensus system.",
    "Vote to approve blocks - you need to participate in at least 3 consecutive block finalizations.",
    "Multiple validators need to vote for consensus to be reached. If you're the only validator, you may need to create more."
  ];

  useEffect(() => {
    const loadConsensusDetails = async () => {
      try {
        if (contracts.level5) {
          const level5Contract = contracts.level5;
          
          // Get total stake
          const total = await level5Contract.totalStake();
          setTotalStake(ethers.utils.formatEther(total));
          
          // Get user stake
          const stake = await level5Contract.stake(account);
          setUserStake(ethers.utils.formatEther(stake));
          
          // Get current block
          const blockId = await level5Contract.currentBlockId();
          setCurrentBlock(blockId.toNumber());
          
          // Get block finalization status
          const block = await level5Contract.blocks(blockId.toNumber() - 1);
          setBlockFinalized(block.finalized);
          
          // Check participation history
          const participation = [];
          for (let i = Math.max(1, blockId.toNumber() - 5); i < blockId.toNumber(); i++) {
            const hasVoted = await level5Contract.hasVoted(account, i);
            participation.push({
              blockId: i,
              participated: hasVoted
            });
          }
          setBlockParticipation(participation);
        }
      } catch (err) {
        console.error("Error loading consensus details:", err);
      }
    };
    
    loadConsensusDetails();
    
    if (isCompleted) {
      setSuccess(true);
    }
    
    // Set up polling for updates
    const intervalId = setInterval(loadConsensusDetails, 5000);
    
    return () => clearInterval(intervalId);
  }, [contracts.level5, account, isCompleted]);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError("Please enter a valid stake amount");
      return;
    }

    setIsStaking(true);
    setError('');
    
    try {
      const level5Contract = contracts.level5;
      const stakeValue = ethers.utils.parseEther(stakeAmount);
      
      // Stake tokens
      const tx = await level5Contract.stakeTokens({ value: stakeValue });
      await tx.wait();
      
      // Update stake amounts
      const userStake = await level5Contract.stake(account);
      setUserStake(ethers.utils.formatEther(userStake));
      
      const totalStake = await level5Contract.totalStake();
      setTotalStake(ethers.utils.formatEther(totalStake));
    } catch (err) {
      console.error("Staking error:", err);
      setError("Failed to stake tokens. Please try again.");
    } finally {
      setIsStaking(false);
    }
  };

  const handleVote = async () => {
    setIsVoting(true);
    setError('');
    
    try {
      const level5Contract = contracts.level5;
      
      // Submit vote
      const tx = await level5Contract.submitVote(voteApproval);
      await tx.wait();
      
      // Update block status
      const blockId = await level5Contract.currentBlockId();
      setCurrentBlock(blockId.toNumber());
      
      const block = await level5Contract.blocks(blockId.toNumber() - 1);
      setBlockFinalized(block.finalized);
      
      // Check if level is completed
      if (blockId.toNumber() >= 4) {
        const hasVoted1 = await level5Contract.hasVoted(account, blockId.toNumber() - 1);
        const hasVoted2 = await level5Contract.hasVoted(account, blockId.toNumber() - 2);
        const hasVoted3 = await level5Contract.hasVoted(account, blockId.toNumber() - 3);
        
        if (hasVoted1 && hasVoted2 && hasVoted3) {
          setSuccess(true);
          if (onComplete) {
            onComplete();
          }
        }
      }
    } catch (err) {
      console.error("Voting error:", err);
      setError("Failed to submit vote. Make sure you have staked tokens and haven't already voted for this block.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleUnstake = async () => {
    if (!userStake || parseFloat(userStake) <= 0) {
      setError("You don't have any staked tokens to unstake");
      return;
    }

    setIsUnstaking(true);
    setError('');
    
    try {
      const level5Contract = contracts.level5;
      const unstakeValue = ethers.utils.parseEther(userStake);
      
      // Unstake tokens
      const tx = await level5Contract.unstake(unstakeValue);
      await tx.wait();
      
      // Update stake amounts
      const userStake = await level5Contract.stake(account);
      setUserStake(ethers.utils.formatEther(userStake));
      
      const totalStake = await level5Contract.totalStake();
      setTotalStake(ethers.utils.formatEther(totalStake));
    } catch (err) {
      console.error("Unstaking error:", err);
      setError("Failed to unstake tokens. Please try again.");
    } finally {
      setIsUnstaking(false);
    }
  };

  const getNextHint = () => {
    if (hintLevel < hints.length) {
      setHintLevel(hintLevel + 1);
    }
  };

  const renderHints = () => {
    if (hintLevel === 0) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Hints:
        </Typography>
        {hints.slice(0, hintLevel).map((hint, index) => (
          <Alert key={index} severity="info" sx={{ mb: 1 }}>
            {hint}
          </Alert>
        ))}
      </Box>
    );
  };

  const calculateVotingPower = () => {
    const userStakeValue = parseFloat(userStake);
    const totalStakeValue = parseFloat(totalStake);
    
    if (totalStakeValue === 0 || userStakeValue === 0) return 0;
    
    return (userStakeValue / totalStakeValue) * 100;
  };

  const votingPower = calculateVotingPower();
  const completedBlocks = blockParticipation.filter(block => block.participated).length;
  const needBlocks = 3 - completedBlocks > 0 ? 3 - completedBlocks : 0;

  if (success) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 2 }}>
          Congratulations! You've completed Level 5: Consensus Arena
        </Alert>
        <Typography variant="body1" paragraph>
          You've successfully learned about Proof-of-Stake mechanics and participated in a simulated consensus system.
          This is how modern blockchains validate transactions without the energy costs of Proof-of-Work.
        </Typography>
        <Typography variant="body1" paragraph>
          Key concepts you've mastered:
        </Typography>
        <ul>
          <li>Staking and voting power</li>
          <li>Block finalization through consensus</li>
          <li>Validator responsibilities</li>
        </ul>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Consensus Arena Challenge
      </Typography>
      <Typography variant="body1" paragraph>
        Participate in a simulated Proof-of-Stake consensus system. Stake tokens, vote on blocks,
        and help finalize at least 3 consecutive blocks to complete the challenge.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                <MonetizationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                Staking Pool
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Your Stake: <strong>{userStake} ETH</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Total Stake: <strong>{totalStake} ETH</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Your Voting Power: <strong>{votingPower.toFixed(2)}%</strong>
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={votingPower} 
                  sx={{ mt: 1, mb: 2, height: 8, borderRadius: 4 }}
                  color="secondary"
                />
              </Box>
              
              <TextField
                label="Stake Amount (ETH)"
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ step: 0.01, min: 0.01 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStake}
                  disabled={isStaking}
                  startIcon={isStaking ? <CircularProgress size={24} /> : <MonetizationOn />}
                >
                  {isStaking ? 'Staking...' : 'Stake Tokens'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleUnstake}
                  disabled={isUnstaking || parseFloat(userStake) === 0}
                  startIcon={isUnstaking ? <CircularProgress size={24} /> : <MonetizationOn />}
                >
                  {isUnstaking ? 'Unstaking...' : 'Unstake All'}
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                <HowToVote sx={{ mr: 1, verticalAlign: 'middle' }} />
                Block Voting
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Current Block: <strong>#{currentBlock}</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Previous Block Status: 
                  <Chip 
                    size="small"
                    label={blockFinalized ? "Finalized" : "Pending"} 
                    color={blockFinalized ? "success" : "warning"}
                    sx={{ ml: 1 }}
                  />
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={voteApproval}
                      onChange={(e) => setVoteApproval(e.target.checked)}
                      color="success"
                    />
                  }
                  label={voteApproval ? "Approve Block" : "Reject Block"}
                  sx={{ mt: 1 }}
                />
                
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleVote}
                  disabled={isVoting || parseFloat(userStake) === 0}
                  startIcon={isVoting ? <CircularProgress size={24} /> : <HowToVote />}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  {isVoting ? 'Submitting Vote...' : 'Submit Vote'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                Your Consensus Participation
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" paragraph>
                  You need to participate in at least 3 consecutive block finalizations to complete this level.
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    Progress:
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(completedBlocks / 3) * 100} 
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {completedBlocks}/3
                  </Typography>
                </Box>
                
                <Typography variant="body2" gutterBottom>
                  {needBlocks > 0 
                    ? `You need to participate in ${needBlocks} more block(s)`
                    : "You've participated in enough blocks! Complete the validation to finish this level."}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Recent Participation:
                </Typography>
                <List dense>
                  {blockParticipation.map((block) => (
                    <ListItem key={block.blockId}>
                      <ListItemIcon>
                        {block.participated ? <CheckCircleRounded color="success" /> : <VerifiedUser color="disabled" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Block #${block.blockId}`} 
                        secondary={block.participated ? "Participated" : "Did not participate"} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
          
          <ConsensusSimulator
            userStake={parseFloat(userStake)}
            totalStake={parseFloat(totalStake)}
            currentBlock={currentBlock}
            votingPower={votingPower}
          />
        </Grid>
      </Grid>
      
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      
      {renderHints()}
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={getNextHint}
          startIcon={<HelpOutline />}
          disabled={hintLevel >= hints.length}
        >
          Get Hint
        </Button>
      </Box>
      
      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography><Code sx={{ mr: 1, verticalAlign: 'middle' }} /> Code Example</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CodeEditor
            value={codeExample}
            language="javascript"
            readOnly
            height="200px"
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Level5Consensus;