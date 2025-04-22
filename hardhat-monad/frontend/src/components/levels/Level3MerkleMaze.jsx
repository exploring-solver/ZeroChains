// src/components/levels/Level3MerkleMaze.jsx
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  ExpandMore, 
  AccountTree, 
  Code, 
  Check,
  HelpOutline,
  PlayArrow,
  LockOpen
} from '@mui/icons-material';

import { useWeb3 } from '../../contexts/Web3Context';
import CodeEditor from '../game/CodeEditor';
import MerkleTreeVisualizer from '../game/MerkleTreeVisualizer';

// Helper function to create a Merkle Tree
const createMerkleTree = (leaves) => {
  if (!leaves || leaves.length === 0) return { root: null, proofs: [] };
  
  // Convert leaves to bytes32 hashes if they aren't already
  const leafHashes = leaves.map(leaf => {
    if (typeof leaf === 'string' && leaf.startsWith('0x') && leaf.length === 66) {
      return leaf;
    }
    return ethers.keccak256(ethers.toUtf8Bytes(leaf));
  });
  
  // Build tree
  let level = leafHashes;
  let proofs = leafHashes.map(() => []);
  
  while (level.length > 1) {
    const nextLevel = [];
    
    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 < level.length) {
        // Calculate parent node
        const left = level[i];
        const right = level[i + 1];
        const hash = ethers.keccak256(
          ethers.encodeBytes32String(['bytes32', 'bytes32'], [left, right])
        );
        nextLevel.push(hash);
        
        // Update proofs for children
        for (let j = 0; j < leafHashes.length; j++) {
          if (j >= i * Math.pow(2, proofs.length - 1) && j < (i + 2) * Math.pow(2, proofs.length - 1)) {
            if (j < (i + 1) * Math.pow(2, proofs.length - 1)) {
              proofs[j].push(right);
            } else {
              proofs[j].push(left);
            }
          }
        }
      } else {
        // Odd number of nodes at this level
        nextLevel.push(level[i]);
      }
    }
    
    level = nextLevel;
  }
  
  return {
    root: level[0],
    proofs: proofs
  };
};

const Level3MerkleMaze = ({ onComplete, isCompleted }) => {
  const { contracts, account, provider } = useWeb3();
  
  const [rootHash, setRootHash] = useState('');
  const [transactions, setTransactions] = useState([
    'Transfer 1 ETH from Alice to Bob',
    'Transfer 0.5 ETH from Charlie to Dave',
    'Transfer 0.3 ETH from Eve to Mallory',
    'Transfer 2 ETH from Frank to Grace'
  ]);
  const [merkleTree, setMerkleTree] = useState(null);
  const [selectedLeaf, setSelectedLeaf] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [codeExample, setCodeExample] = useState(`// Function to create a Merkle tree and generate proofs
function generateMerkleTree(leaves) {
  // Convert strings to bytes32 hashes
  const leafHashes = leaves.map(leaf => 
    ethers.keccak256(ethers.toUtf8Bytes(leaf))
  );
  
  // Build the tree levels
  let level = leafHashes;
  const tree = [level];
  
  // Store proofs for each leaf
  const proofs = leafHashes.map(() => []);
  
  // Build tree until we reach the root
  while (level.length > 1) {
    const nextLevel = [];
    
    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 < level.length) {
        // Hash pair of nodes
        const left = level[i];
        const right = level[i + 1];
        const hash = ethers.keccak256(
          ethers.defaultAbiCoder.encode(['bytes32', 'bytes32'], [left, right])
        );
        nextLevel.push(hash);
        
        // Update proofs
        for (let j = 0; j < leafHashes.length; j++) {
          const position = Math.floor(j / Math.pow(2, tree.length - 1));
          if (position === Math.floor(i / 2)) {
            if (j % 2 === 0) {
              proofs[j].push(level[i + 1]);
            } else {
              proofs[j].push(level[i]);
            }
          }
        }
      } else {
        // Single node at this level
        nextLevel.push(level[i]);
      }
    }
    
    level = nextLevel;
    tree.push(level);
  }
  
  return {
    root: level[0],
    proofs: proofs
  };
}`);

  const hints = [
    "Create a Merkle tree from the provided transaction list.",
    "Generate a Merkle proof for one of the transactions to prove it's part of the tree.",
    "Submit the proof along with the leaf (transaction hash) and its index to verify."
  ];

  useEffect(() => {
    const loadRootHash = async () => {
      try {
        if (contracts.level3) {
          const root = await contracts.level3.rootHash();
          setRootHash(root);
        }
      } catch (err) {
        console.error("Error loading root hash:", err);
      }
    };
    
    loadRootHash();
    
    if (isCompleted) {
      setSuccess(true);
    }
  }, [contracts.level3, isCompleted]);

  useEffect(() => {
    // Generate Merkle tree when transactions change
    if (transactions.length > 0) {
      const tree = createMerkleTree(transactions);
      setMerkleTree(tree);
    }
  }, [transactions]);

  const handleNewTransaction = () => {
    // Add a new transaction
    setTransactions([
      ...transactions,
      `Transfer ${(Math.random() * 3).toFixed(2)} ETH from User${Math.floor(Math.random() * 1000)} to User${Math.floor(Math.random() * 1000)}`
    ]);
  };

  const submitProof = async () => {
    if (!merkleTree || !merkleTree.root) {
      setError("Please generate a Merkle tree first");
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const level3Contract = contracts.level3;
      
      // Get the selected leaf and its proof
      const leafText = transactions[selectedLeaf];
      const leafHash = ethers.keccak256(ethers.toUtf8Bytes(leafText));
      const proof = merkleTree.proofs[selectedLeaf];
      
      // Call the contract to verify the proof
      const tx = await level3Contract.verifyMerkleProof(
        proof,
        leafHash,
        selectedLeaf
      );
      
      // Wait for transaction confirmation
      await tx.wait();
      
      setSuccess(true);
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error("Proof submission error:", err);
      setError("Merkle proof verification failed. The proof may be invalid or incorrect.");
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
          Congratulations! You've completed Level 3: Merkle Maze
        </Alert>
        <Typography variant="body1" paragraph>
          You've successfully learned about Merkle trees and how to create and verify Merkle proofs.
          This concept is fundamental to blockchain data structures and optimizing data verification.
        </Typography>
        <Typography variant="body1" paragraph>
          Key concepts you've mastered:
        </Typography>
        <ul>
          <li>Merkle tree construction</li>
          <li>Proof generation for membership verification</li>
          <li>Efficient validation of data integrity</li>
        </ul>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Merkle Maze Challenge
      </Typography>
      <Typography variant="body1" paragraph>
        Your task is to create a Merkle tree from a list of transactions and generate a valid proof that one transaction belongs to the tree.
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Target Root Hash:
          </Typography>
          <TextField
            fullWidth
            value={rootHash}
            variant="outlined"
            inputProps={{ readOnly: true }}
            helperText="This is the root hash your Merkle tree should match"
          />
        </CardContent>
      </Card>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                1. Transaction List
              </Typography>
              <List dense>
                {transactions.map((tx, index) => (
                  <ListItem 
                    key={index}
                    button
                    selected={selectedLeaf === index}
                    onClick={() => setSelectedLeaf(index)}
                  >
                    <ListItemIcon>
                      {selectedLeaf === index ? <Check color="primary" /> : null}
                    </ListItemIcon>
                    <ListItemText 
                      primary={tx} 
                      secondary={`Index: ${index}`} 
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleNewTransaction}
                startIcon={<PlayArrow />}
                sx={{ mt: 2 }}
              >
                Add Random Transaction
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                2. Merkle Tree
              </Typography>
              {merkleTree && merkleTree.root && (
                <Box>
                  <Typography variant="body2" paragraph>
                    Root Hash: <code>{merkleTree.root.slice(0, 10)}...{merkleTree.root.slice(-8)}</code>
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Selected Leaf: <strong>{selectedLeaf}</strong> - {transactions[selectedLeaf]}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Proof Length: <strong>{merkleTree.proofs[selectedLeaf].length}</strong> elements
                  </Typography>
                  <MerkleTreeVisualizer 
                    transactions={transactions}
                    selectedIndex={selectedLeaf}
                    height={200}
                  />
                </Box>
              )}
              <Button
                variant="contained"
                color="secondary"
                onClick={submitProof}
                disabled={!merkleTree || !merkleTree.root || isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={24} /> : <LockOpen />}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Proof'}
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

export default Level3MerkleMaze;