// src/components/levels/Level2HashForge.jsx
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
  LinearProgress
} from '@mui/material';
import { 
  ExpandMore, 
  Search, 
  Code, 
  Check,
  HelpOutline,
  CalculateOutlined
} from '@mui/icons-material';

import { useWeb3 } from '../../contexts/Web3Context';
import CodeEditor from '../game/CodeEditor';

const Level2HashForge = ({ onComplete, isCompleted }) => {
  const { contracts, account, provider } = useWeb3();
  
  const [targetPrefix, setTargetPrefix] = useState('');
  const [nonce, setNonce] = useState('');
  const [solution, setSolution] = useState('');
  const [hash, setHash] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [progress, setProgress] = useState(0);
  const [codeExample, setCodeExample] = useState(`// Example of finding a hash with a specific prefix
function findNonceWithPrefix() {
  let nonce = 0;
  while (true) {
    // Convert nonce to bytes32
    const nonceHex = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(nonce).toHexString(), 
      32
    );
    
    // Calculate hash
    const hash = ethers.utils.keccak256(nonceHex);
    
    // Check if hash starts with required prefix (e.g., 0x0000)
    if (hash.startsWith("0x0000")) {
      console.log("Found matching nonce:", nonce);
      console.log("Resulting hash:", hash);
      return nonceHex; // Return as bytes32
    }
    
    nonce++;
    
    // Progress indicator every million attempts
    if (nonce % 1000000 === 0) {
      console.log("Tried", nonce, "nonces so far");
    }
  }
}`);

  const hints = [
    "The target prefix is the first byte of the hash. You need to find a value whose hash starts with this byte.",
    "Use ethers.utils.keccak256() to calculate the hash of your input value.",
    "Try using a loop to increment a nonce value until you find a hash that matches the target prefix."
  ];

  useEffect(() => {
    const loadTargetPrefix = async () => {
      try {
        if (contracts.level2) {
          const prefix = await contracts.level2.targetPrefixHash();
          setTargetPrefix(prefix);
        }
      } catch (err) {
        console.error("Error loading target prefix:", err);
      }
    };
    
    loadTargetPrefix();
    
    if (isCompleted) {
      setSuccess(true);
    }
  }, [contracts.level2, isCompleted]);

  const calculateHash = () => {
    try {
      if (!nonce) return;
      
      // Convert nonce to bytes32
      const nonceBytes32 = ethers.utils.hexZeroPad(
        ethers.utils.hexlify(parseInt(nonce)), 
        32
      );
      
      // Calculate hash
      const calculatedHash = ethers.utils.keccak256(nonceBytes32);
      
      setHash(calculatedHash);
      setSolution(nonceBytes32);
    } catch (err) {
      console.error("Hash calculation error:", err);
      setError("Invalid nonce format. Please enter a valid number.");
    }
  };

  const searchForSolution = async () => {
    if (!targetPrefix) {
      setError("Target prefix not loaded yet");
      return;
    }
    
    setIsSearching(true);
    setError('');
    
    try {
      // Get the first byte of target prefix as mask
      const targetFirstByte = targetPrefix.slice(0, 4); // 0x + first byte
      
      let currentNonce = 0;
      const maxIterations = 100000; // Limit search to avoid browser hanging
      
      for (let i = 0; i < maxIterations; i++) {
        // Update progress periodically
        if (i % 1000 === 0) {
          setProgress((i / maxIterations) * 100);
          // Allow UI to update
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        // Convert nonce to bytes32
        const nonceBytes32 = ethers.utils.hexZeroPad(
          ethers.BigNumber.from(currentNonce).toHexString(), 
          32
        );
        
        // Calculate hash
        const calculatedHash = ethers.utils.keccak256(nonceBytes32);
        
        // Check if hash starts with required prefix
        if (calculatedHash.slice(0, 4) === targetFirstByte) {
          setNonce(currentNonce.toString());
          setHash(calculatedHash);
          setSolution(nonceBytes32);
          break;
        }
        
        currentNonce++;
      }
      
      if (hash === '') {
        setError("Couldn't find a solution in the limited iterations. Try a larger number or use the 'Calculate Hash' feature with different nonce values.");
      }
      
    } catch (err) {
      console.error("Search error:", err);
      setError("Error searching for solution. Please try again.");
    } finally {
      setIsSearching(false);
      setProgress(0);
    }
  };

  const submitSolution = async () => {
    if (!solution) {
      setError("Please calculate a hash first");
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const level2Contract = contracts.level2;
      
      // Call the contract to submit solution
      const tx = await level2Contract.solveHashPuzzle(solution);
      
      // Wait for transaction confirmation
      await tx.wait();
      
      setSuccess(true);
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Solution verification failed. The hash doesn't match the required pattern.");
    } finally {
      setIsSubmitting(false);
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

  if (success) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 2 }}>
          Congratulations! You've completed Level 2: Hash Forge
        </Alert>
        <Typography variant="body1" paragraph>
          You've successfully learned about cryptographic hashing and solved a mining-like challenge.
          This concept is fundamental to how blockchain miners find valid blocks.
        </Typography>
        <Typography variant="body1" paragraph>
          Key concepts you've mastered:
        </Typography>
        <ul>
          <li>Cryptographic hash functions (Keccak-256)</li>
          <li>Hash prefix matching (similar to mining)</li>
          <li>Computational work as proof</li>
        </ul>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Hash Forge Challenge
      </Typography>
      <Typography variant="body1" paragraph>
        Your task is to find a nonce value that, when hashed with Keccak-256, results in a hash with the target prefix.
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Target Prefix:
          </Typography>
          <TextField
            fullWidth
            value={targetPrefix}
            variant="outlined"
            inputProps={{ readOnly: true }}
            helperText="This is the target prefix your solution's hash must match (first byte)"
          />
        </CardContent>
      </Card>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                1. Find a Nonce
              </Typography>
              <TextField
                fullWidth
                label="Nonce (decimal number)"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
                margin="normal"
                variant="outlined"
                type="number"
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={calculateHash}
                  startIcon={<CalculateOutlined />}
                >
                  Calculate Hash
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={searchForSolution}
                  disabled={isSearching}
                  startIcon={isSearching ? <CircularProgress size={24} /> : <Search />}
                >
                  {isSearching ? 'Searching...' : 'Search for Solution'}
                </Button>
              </Box>
              
              {isSearching && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
                    Searching... {Math.round(progress)}%
                  </Typography>
                </Box>
              )}
              
              {hash && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Resulting Hash:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    value={hash}
                    variant="outlined"
                    inputProps={{ readOnly: true }}
                  />
                  <Typography variant="caption" color={hash.slice(0, 4) === targetPrefix.slice(0, 4) ? "success.main" : "error.main"}>
                    {hash.slice(0, 4) === targetPrefix.slice(0, 4) ? "✓ Prefix matches target!" : "✗ Prefix doesn't match target"}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                2. Submit Solution
              </Typography>
              <Typography variant="body2" paragraph>
                Once you've found a matching hash, submit your solution to the contract.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={submitSolution}
                disabled={!solution || isSubmitting || !hash || hash.slice(0, 4) !== targetPrefix.slice(0, 4)}
                startIcon={isSubmitting ? <CircularProgress size={24} /> : <Check />}
                sx={{ mt: 1 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Solution'}
              </Button>
            </CardContent>
          </Card>
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

export default Level2HashForge;