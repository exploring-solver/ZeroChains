// src/pages/BlockchainFundamentals.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Divider,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  ArrowForward,
  Check,
  Code,
  Storage,
  Security,
  AccountTree,
  Money,
  HowToVote
} from '@mui/icons-material';

const BlockchainFundamentals = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: ''
  });
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState({
    passed: false,
    score: 0,
    feedback: ''
  });

  const handleQuizChange = (question, value) => {
    setQuizAnswers({ ...quizAnswers, [question]: value });
  };

  const handleQuizSubmit = () => {
    const correctAnswers = {
      q1: 'distributed ledger',
      q2: 'hash',
      q3: 'consensus',
      q4: 'smart contract',
      q5: 'private key'
    };

    // Check answers (simple string matching, could be improved)
    let score = 0;
    Object.keys(correctAnswers).forEach(question => {
      if (quizAnswers[question].toLowerCase().includes(correctAnswers[question])) {
        score++;
      }
    });

    const passed = score >= 4; // Pass with 4 or more correct
    
    setQuizResults({
      passed,
      score,
      feedback: passed 
        ? "Great job! You understand the key blockchain concepts." 
        : "Let's review the blockchain fundamentals a bit more."
    });
    
    setQuizSubmitted(true);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleComplete = () => {
    navigate('/script-fundamentals');
  };

  const fundamentalSteps = [
    {
      label: 'What is Blockchain?',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            A blockchain is a <strong>distributed, immutable, and transparent digital ledger</strong>. 
            Think of it like a shared spreadsheet or accounting book that's duplicated across many 
            computers in a network.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Storage sx={{ mr: 1 }} /> Distributed
                  </Typography>
                  <Typography variant="body2">
                    Instead of being stored in one central location, the ledger is copied and 
                    spread across numerous computers (called nodes) worldwide. This makes it 
                    highly resistant to single points of failure or censorship.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Security sx={{ mr: 1 }} /> Immutable
                  </Typography>
                  <Typography variant="body2">
                    Once a record (a "transaction") is added to the ledger and verified, it's 
                    extremely difficult (practically impossible) to alter or delete it. This 
                    is achieved through cryptographic hashing.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Code sx={{ mr: 1 }} /> Transparent
                  </Typography>
                  <Typography variant="body2">
                    While the identity of participants can be pseudonymous (represented by addresses), 
                    the transactions themselves are typically public and viewable by anyone on the network.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      label: 'How Blockchain Works',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Blockchain technology combines several concepts to create a secure, distributed system:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    1. Transactions
                  </Typography>
                  <Typography variant="body2">
                    Users initiate transactions (e.g., sending cryptocurrency, recording data, 
                    executing a smart contract function).
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    2. Blocks
                  </Typography>
                  <Typography variant="body2">
                    These transactions are gathered together into blocks. Each block contains a 
                    list of recent transactions, a timestamp, and crucial cryptographic information.
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    3. Hashing
                  </Typography>
                  <Typography variant="body2">
                    Each block includes a unique identifier called a "hash" – a fingerprint generated 
                    from the data inside the block using a cryptographic hash function (like SHA-256 
                    or Keccak256). Each new block also contains the hash of the previous block.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    4. Chaining
                  </Typography>
                  <Typography variant="body2">
                    This linking of blocks using hashes creates a "chain." If someone tries to tamper 
                    with the data in an older block, its hash will change. This change would invalidate 
                    its link to the next block, breaking the chain and making tampering immediately obvious.
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    5. Consensus Mechanisms
                  </Typography>
                  <Typography variant="body2">
                    Before a new block can be added to the chain, the nodes in the network must agree on 
                    its validity. This agreement process is called a consensus mechanism (e.g., Proof-of-Work 
                    where nodes solve complex puzzles, or Proof-of-Stake where nodes stake collateral).
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    6. Decentralization
                  </Typography>
                  <Typography variant="body2">
                    Because the ledger is distributed and validated by many independent nodes following 
                    the protocol rules, no single entity controls the network or can unilaterally change the records.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      label: 'Smart Contracts & Ethereum',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Smart contracts extend blockchain capabilities beyond simple transactions:
          </Typography>
          
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Smart Contracts
              </Typography>
              <Typography variant="body1" paragraph>
                Smart contracts are self-executing programs stored on a blockchain that run 
                when predetermined conditions are met. They typically are used to automate 
                agreement execution so all participants can be immediately certain of the outcome 
                without any intermediary's involvement.
              </Typography>
              <Typography variant="body1">
                Key characteristics:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2">
                    <strong>Automation:</strong> Execute automatically when conditions are met
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Immutability:</strong> Once deployed, cannot be changed (unless specifically designed for upgrades)
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Transparency:</strong> Code is visible to all participants
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Deterministic:</strong> Same input always produces the same output
                  </Typography>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ethereum Platform
              </Typography>
              <Typography variant="body1" paragraph>
                Ethereum is the most popular blockchain for smart contracts, providing a 
                complete programming environment:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Solidity Programming Language
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Ethereum's primary programming language, designed specifically for 
                    writing smart contracts.
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Gas System
                  </Typography>
                  <Typography variant="body2">
                    Computations cost "gas" (paid in ETH) to prevent spam and 
                    resource abuse on the network.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Ethereum Virtual Machine (EVM)
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Runtime environment for smart contracts that is isolated from 
                    the network, making it a "sandbox" for code execution.
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Decentralized Applications (dApps)
                  </Typography>
                  <Typography variant="body2">
                    Applications built on Ethereum that use smart contracts for 
                    their backend logic rather than centralized servers.
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      ),
    },
    {
      label: 'Blockchain Security Concepts',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Security is a critical aspect of blockchain technology, especially for 
            smart contracts where vulnerabilities can lead to significant financial losses.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Digital Signatures & ECDSA
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Digital signatures in blockchain use public key cryptography (specifically Elliptic Curve Digital Signature Algorithm - ECDSA) to:
                  </Typography>
                  <ul>
                    <li>
                      <Typography variant="body2">
                        <strong>Authenticate:</strong> Prove the identity of transaction initiators
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Ensure Integrity:</strong> Verify messages weren't altered
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Provide Non-repudiation:</strong> Prevent the sender from denying they sent a transaction
                      </Typography>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Merkle Trees
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Merkle trees are binary trees of hashes that efficiently verify the integrity of data:
                  </Typography>
                  <ul>
                    <li>
                      <Typography variant="body2">
                        <strong>Efficient Verification:</strong> Verify if a transaction is part of a block using only the Merkle root and a short proof
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Data Integrity:</strong> Any change in transaction data would cascade up to change the Merkle root
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Scalability:</strong> Enable lightweight clients to verify transactions without downloading entire blocks
                      </Typography>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Smart Contract Vulnerabilities
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Common security issues in smart contracts include:
                  </Typography>
                  <ul>
                    <li>
                      <Typography variant="body2">
                        <strong>Reentrancy Attacks:</strong> When an external call to another contract takes over control flow and makes unexpected recursive calls
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Integer Overflow/Underflow:</strong> When arithmetic operations exceed the size limits of their variable types
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Access Control Issues:</strong> When functions lack proper access restrictions
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Front-Running:</strong> When an attacker observes a pending transaction and submits their own with higher gas fees to execute first
                      </Typography>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Consensus Mechanisms
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Methods for achieving agreement on the state of the blockchain:
                  </Typography>
                  <ul>
                    <li>
                      <Typography variant="body2">
                        <strong>Proof of Work (PoW):</strong> Miners compete to solve complex cryptographic puzzles
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Proof of Stake (PoS):</strong> Validators are selected to create blocks based on how many coins they stake
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Delegated Proof of Stake (DPoS):</strong> Token holders vote for delegates who validate blocks
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Practical Byzantine Fault Tolerance (PBFT):</strong> Validators agree through a multi-round voting process
                      </Typography>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      label: 'Knowledge Check',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Blockchain Fundamentals Quiz
          </Typography>
          <Typography variant="body2" paragraph>
            Let's test your understanding of blockchain concepts. Fill in the blanks with the 
            correct terms:
          </Typography>
          
          {quizSubmitted ? (
            <Box sx={{ mb: 3 }}>
              <Alert severity={quizResults.passed ? "success" : "warning"}>
                {quizResults.feedback} You got {quizResults.score}/5 correct.
              </Alert>
              <Button
                variant="outlined"
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({q1: '', q2: '', q3: '', q4: '', q5: ''});
                }}
                sx={{ mt: 2 }}
              >
                Retry Quiz
              </Button>
            </Box>
          ) : (
            <Box component="form" sx={{ mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="1. Blockchain is often described as a __________ __________ technology, meaning the same data is stored across many computers."
                    value={quizAnswers.q1}
                    onChange={(e) => handleQuizChange('q1', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="2. Each block contains a cryptographic __________ of the previous block, creating a chain that cannot easily be tampered with."
                    value={quizAnswers.q2}
                    onChange={(e) => handleQuizChange('q2', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="3. Before a new block can be added to the blockchain, network participants must reach __________ through mechanisms like Proof-of-Work or Proof-of-Stake."
                    value={quizAnswers.q3}
                    onChange={(e) => handleQuizChange('q3', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="4. A __________ __________ is a self-executing program stored on the blockchain that runs when predetermined conditions are met."
                    value={quizAnswers.q4}
                    onChange={(e) => handleQuizChange('q4', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="5. In blockchain, a user's __________ __________ must be kept secure as it is used to sign transactions and provides access to their assets."
                    value={quizAnswers.q5}
                    onChange={(e) => handleQuizChange('q5', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={handleQuizSubmit}
                disabled={Object.values(quizAnswers).some(answer => !answer)}
                sx={{ mt: 2 }}
              >
                Submit Answers
              </Button>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Ready to Move Forward?
          </Typography>
          <Typography variant="body1" paragraph>
            Once you've completed the quiz, you can proceed to learn about scripting and interacting with blockchain contracts.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleComplete}
            disabled={!quizResults.passed}
            endIcon={<ArrowForward />}
          >
            Continue to Scripting Fundamentals
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Blockchain Fundamentals
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Learn the basic concepts and principles of blockchain technology.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {fundamentalSteps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {step.content}
                  <Box sx={{ mt: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={index === fundamentalSteps.length - 1 && quizResults.passed ? handleComplete : handleNext}
                        sx={{ mt: 1, mr: 1 }}
                        endIcon={index === fundamentalSteps.length - 1 ? <Check /> : <ArrowForward />}
                      >
                        {index === fundamentalSteps.length - 1 ? 'Finish' : 'Continue'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === fundamentalSteps.length && (
          <Box sx={{ p: 3, mt: 2 }}>
            <Typography gutterBottom>
              All steps completed - you're ready to start interacting with blockchain!
            </Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Review Again
            </Button>
            <Button 
              variant="contained" 
              onClick={handleComplete}
              endIcon={<ArrowForward />} 
              sx={{ mt: 1, mr: 1 }}
            >
              Continue to Scripting Fundamentals
            </Button>
          </Box>
        )}
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Additional Resources
        </Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography><AccountTree sx={{ mr: 1, verticalAlign: 'middle' }} /> Blockchain Architecture</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Blockchain architecture consists of blocks that contain transaction data, a timestamp, 
              and a reference to the previous block (hash). This creates an append-only chain of blocks 
              that is extremely difficult to modify retroactively.
            </Typography>
            <Typography variant="body2">
              Learn more about blockchain architecture in these resources:
            </Typography>
            <ul>
              <li>Ethereum Whitepaper</li>
              <li>Bitcoin Whitepaper by Satoshi Nakamoto</li>
              <li>Mastering Blockchain (book by Imran Bashir)</li>
            </ul>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography><Money sx={{ mr: 1, verticalAlign: 'middle' }} /> Cryptoeconomics</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Cryptoeconomics is the combination of cryptography and economic incentives to design 
              robust decentralized protocols and applications. It's the study of economic interaction 
              in adversarial environments.
            </Typography>
            <Typography variant="body2">
              Key concepts include:
            </Typography>
            <ul>
              <li>Token Economics</li>
              <li>Mechanism Design</li>
              <li>Game Theory in Blockchain</li>
              <li>Network Effects</li>
            </ul>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography><HowToVote sx={{ mr: 1, verticalAlign: 'middle' }} /> Consensus Algorithms in Depth</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Consensus algorithms allow distributed systems to agree on a single version of truth. 
              Different blockchains use different consensus mechanisms with varying tradeoffs in terms 
              of security, scalability, and decentralization.
            </Typography>
            <Typography variant="body2">
              Common consensus algorithms:
            </Typography>
            <ul>
              <li><strong>Proof of Work (PoW):</strong> Used by Bitcoin and (historically) Ethereum</li>
              <li><strong>Proof of Stake (PoS):</strong> Used by Ethereum 2.0, Cardano, and others</li>
              <li><strong>Delegated Proof of Stake (DPoS):</strong> Used by EOS and TRON</li>
              <li><strong>Practical Byzantine Fault Tolerance (PBFT):</strong> Used by Hyperledger Fabric</li>
              <li><strong>Proof of Authority (PoA):</strong> Used by many private blockchains</li>
            </ul>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default BlockchainFundamentals;