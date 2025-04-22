// src/components/levels/Level1Genesis.jsx
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
  CardContent
} from '@mui/material';
import { 
  ExpandMore, 
  LockOpen, 
  Code, 
  Check, 
  Info,
  HelpOutline
} from '@mui/icons-material';

import { useWeb3 } from '../../contexts/Web3Context';
import CodeEditor from '../game/CodeEditor';

const Level1Genesis = ({ onComplete, isCompleted }) => {
  const { contracts, account, provider } = useWeb3();
  
  const [message, setMessage] = useState('Approve Level 1');
  const [signature, setSignature] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [codeExample, setCodeExample] = useState(`// Example for signing a message with ethers.js
const wallet = new ethers.Wallet(privateKey);
const signature = await wallet.signMessage("Approve Level 1");
console.log("Signature:", signature);

// How signature verification works
const recovered = ethers.utils.verifyMessage("Approve Level 1", signature);
console.log("Recovered address:", recovered);
`);

  const hints = [
    "Try signing the message 'Approve Level 1' with your connected wallet.",
    "Use the personal_sign method via your wallet or ethers.js signMessage() function.",
    "Make sure to use the exact message 'Approve Level 1' - case sensitivity matters!"
  ];

  useEffect(() => {
    if (isCompleted) {
      setSuccess(true);
    }
  }, [isCompleted]);

  const handleSign = async () => {
    try {
      setError('');
      // Request signature from connected wallet
      const signer = provider.getSigner();
      console.log(signer);
      const sig = await signer.signMessage(message);
      
      setSignature(sig);
    } catch (err) {
      console.error("Signing error:", err);
      setError("Failed to sign message. Please try again.");
    }
  };

  const handleVerify = async () => {
    if (!signature) {
      setError("Please sign the message first");
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      const messageHash = ethers.hashMessage(message);
      const level1Contract = contracts.level1;
      
      // Call the contract to verify
      const tx = await level1Contract.verifySignatureBytes(
        messageHash,
        signature
      );
      
      // Wait for transaction confirmation
      await tx.wait();
      
      setSuccess(true);
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Signature verification failed. Please check your signature and try again.");
    } finally {
      setIsVerifying(false);
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
          Congratulations! You've completed Level 1: Genesis Signer
        </Alert>
        <Typography variant="body1" paragraph>
          You've successfully learned how to sign and verify messages using Ethereum's digital signature scheme (ECDSA).
          This is a fundamental concept in blockchain technology, used for transaction signing and authentication.
        </Typography>
        <Typography variant="body1" paragraph>
          Key concepts you've mastered:
        </Typography>
        <ul>
          <li>Digital signatures using ECDSA</li>
          <li>Message signing with your Ethereum wallet</li>
          <li>On-chain signature verification</li>
        </ul>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Genesis Signer Challenge
      </Typography>
      <Typography variant="body1" paragraph>
        Your task is to sign a message with your wallet and verify it using the smart contract.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                1. Sign a Message
              </Typography>
              <TextField
                fullWidth
                label="Message to sign"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                margin="normal"
                variant="outlined"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSign}
                sx={{ mt: 2 }}
                startIcon={<LockOpen />}
              >
                Sign Message
              </Button>
              
              {signature && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Signature:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={signature}
                    variant="outlined"
                    inputProps={{ readOnly: true }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                2. Verify Signature
              </Typography>
              <Typography variant="body2" paragraph>
                Click the button below to verify your signature on-chain.
                The contract will check if your signature is valid and complete the level.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleVerify}
                disabled={!signature || isVerifying}
                startIcon={isVerifying ? <CircularProgress size={24} /> : <Check />}
                sx={{ mt: 1 }}
              >
                {isVerifying ? 'Verifying...' : 'Verify Signature'}
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

export default Level1Genesis;