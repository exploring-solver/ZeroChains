// src/pages/Level.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Stepper, 
  Step, 
  StepLabel, 
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  LockOpen, 
  Code, 
  Info, 
  School, 
  PlayArrow, 
  CheckCircle,
  SecurityUpdateWarning
} from '@mui/icons-material';

import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import CodeEditor from '../components/game/CodeEditor';
import LevelSimulator from '../components/game/LevelSimulator';
import LevelInfoPanel from '../components/game/LevelInfoPanel';
import TutorialPanel from '../components/game/TutorialPanel';
import CompletionDialog from '../components/game/CompletionDialog';

// Level-specific components
import Level1Genesis from '../components/levels/Level1Genesis';
import Level2HashForge from '../components/levels/Level2HashFortress';
import Level3MerkleMaze from '../components/levels/Level3MerkleMaze';
import Level4Reentrancy from '../components/levels/Level4ReentrancyLabyrinth';
import Level5Consensus from '../components/levels/Level5ConsensusArena';

const Level = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isConnected, account, contracts } = useWeb3();
  const { playerLevel, refreshState } = useGame();
  
  const [activeStep, setActiveStep] = useState(0);
  // const [levelDetails, setLevelDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [isLevelCompleted, setIsLevelCompleted] = useState(false);
  
  const levelId = parseInt(id);

  // Level specific details
  const levelComponents = {
    1: Level1Genesis,
    2: Level2HashForge,
    3: Level3MerkleMaze,
    4: Level4Reentrancy,
    5: Level5Consensus
  };

  const levelDetails = {
    1: {
      title: "Genesis Signer",
      description: "Master transaction signature verification and learn the fundamentals of ECDSA.",
      steps: ["Learn ECDSA Basics", "Understand Message Signing", "Solve the Challenge"],
      tutorial: "In this level, you'll learn about Ethereum's digital signature scheme (ECDSA) and how to verify signatures on-chain."
    },
    2: {
      title: "Hash Forge",
      description: "Explore cryptographic hashing and solve a mining-like challenge to find a specific hash prefix.",
      steps: ["Learn Cryptographic Hashing", "Practice with Keccak256", "Mine a Valid Hash"],
      tutorial: "Cryptographic hashing is the backbone of blockchain. In this level, you'll understand how hash functions work and find a value with a specific hash pattern."
    },
    3: {
      title: "Merkle Maze",
      description: "Navigate the world of Merkle trees and learn to create and validate Merkle proofs.",
      steps: ["Learn Merkle Tree Basics", "Build a Simple Merkle Tree", "Generate Valid Proofs"],
      tutorial: "Merkle trees provide an efficient way to verify data integrity. You'll build a Merkle tree and generate valid proofs to prove membership."
    },
    4: {
      title: "Reentrancy Labyrinth",
      description: "Identify and exploit a reentrancy vulnerability, then implement a secure solution.",
      steps: ["Learn Smart Contract Security", "Exploit the Vulnerability", "Fix the Vulnerability"],
      tutorial: "Reentrancy attacks are one of the most common vulnerabilities in smart contracts. You'll exploit a vulnerable contract and then secure it against the same vulnerability."
    },
    5: {
      title: "Consensus Arena",
      description: "Understand Proof-of-Stake mechanics and participate in a simulated consensus system.",
      steps: ["Learn PoS Mechanics", "Stake and Vote", "Participate in Consensus"],
      tutorial: "Proof-of-Stake is a key consensus mechanism used by modern blockchains. You'll participate in a simulated PoS system to understand its workings."
    }
  };

  useEffect(() => {
    if (!isConnected) {
      navigate('/game');
      return;
    }

    // Check if level exists and player has unlocked it
    if (!levelId || levelId < 1 || levelId > 5 || levelId > playerLevel + 1) {
      navigate('/game');
      return;
    }

    // setLevelDetails(levelDetails[levelId]);
    
    // Check if player already completed this level
    if (playerLevel >= levelId) {
      setIsLevelCompleted(true);
    }
    
    setIsLoading(false);
  }, [isConnected, playerLevel, levelId, navigate]);

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleCompleteLevel = async () => {
    setIsLoading(true);
    try {
      // This function will be called by the level-specific component
      // when the level is successfully completed
      await refreshState();
      setIsLevelCompleted(true);
      setShowCompletion(true);
    } catch (err) {
      setError("Failed to complete level. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextLevel = () => {
    if (levelId < 5) {
      navigate(`/level/${levelId + 1}`);
    } else {
      navigate('/game');
    }
    setShowCompletion(false);
  };

  const LevelComponent = levelComponents[levelId];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!levelDetails) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Level not found</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/game')}
          sx={{ mt: 2 }}
        >
          Back to Game
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Level {levelId}: {levelDetails.title}
          </Typography>
          {isLevelCompleted && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
              <CheckCircle sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Completed</Typography>
            </Box>
          )}
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {levelDetails.description}
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {levelDetails[levelId].steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {activeStep === 0 && (
            <TutorialPanel 
              title={`Learning: ${levelDetails[levelId].steps[0]}`}
              content={levelDetails[levelId].tutorial}
              onComplete={() => setActiveStep(1)}
            />
          )}
          
          {activeStep === 1 && (
            <LevelSimulator 
              levelId={levelId}
              onAdvance={() => setActiveStep(2)}
            />
          )}
          
          {activeStep === 2 && (
            <Box>
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Challenge: Solve Level {levelId}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <LevelComponent 
                  onComplete={handleCompleteLevel}
                  isCompleted={isLevelCompleted}
                />
              </Paper>
            </Box>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <LevelInfoPanel 
            levelId={levelId}
            activeStep={activeStep}
            steps={levelDetails.steps}
            onStepChange={handleStepChange}
          />
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                Helpful Resources
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                • Ethereum Yellow Paper (ECDSA sections)
              </Typography>
              <Typography variant="body2" paragraph>
                • Solidity Documentation
              </Typography>
              <Typography variant="body2" paragraph>
                • Web3.js / Ethers.js Guides
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                startIcon={<Info />}
                onClick={() => window.open('https://ethereum.org/developers', '_blank')}
              >
                More Resources
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <CompletionDialog 
        open={showCompletion}
        levelId={levelId}
        levelName={levelDetails.title}
        onClose={() => setShowCompletion(false)}
        onNextLevel={handleNextLevel}
      />
    </Box>
  );
};

export default Level;