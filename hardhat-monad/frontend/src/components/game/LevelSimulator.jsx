// src/components/game/LevelSimulator.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  TextField,
  Grid,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Code,
  ArrowForward,
  Terminal
} from '@mui/icons-material';

import CodeEditor from './CodeEditor';

const LevelSimulator = ({ levelId, onAdvance }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Level-specific simulator code
  const simulatorCode = {
    1: `// ECDSA Signature Example
const { ethers } = require('ethers');

// Create a random wallet (do not use this for real funds!)
const wallet = ethers.Wallet.createRandom();
console.log("Wallet address:", wallet.address);

// Create a message to sign
const message = "Hello, Blockchain!";
console.log("Message:", message);

// Sign the message
async function signMessage() {
  const signature = await wallet.signMessage(message);
  console.log("Signature:", signature);
  
  // Verify the signature
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  console.log("Recovered address:", recoveredAddress);
  console.log("Matches original address:", recoveredAddress === wallet.address);
}

signMessage();`,
    2: `// Cryptographic Hashing Example
const { ethers } = require('ethers');

// Simple hashing of a string
const message = "Hello, Blockchain!";
const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));
console.log("Message:", message);
console.log("Keccak256 hash:", messageHash);

// Mining simulation - find a hash with specific prefix
function mineHash(prefix) {
  console.log("Mining for hash with prefix:", prefix);
  let nonce = 0;
  let hash;
  
  console.log("Starting mining...");
  const startTime = Date.now();
  
  while (true) {
    // Convert nonce to bytes32
    const nonceHex = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(nonce).toHexString(), 
      32
    );
    
    // Calculate hash
    hash = ethers.utils.keccak256(nonceHex);
    
    // Check if hash starts with required prefix
    if (hash.startsWith(prefix)) {
      break;
    }
    
    nonce++;
    
    // Show progress for simulator
    if (nonce % 100 === 0) {
      process.stdout.write(".");
    }
    
    // Prevent infinite loop in simulator
    if (nonce > 500) {
      console.log("\\nStopping after 500 iterations for simulator");
      break;
    }
  }
  
  const endTime = Date.now();
  console.log("\\nMining complete!");
  console.log("Nonce found:", nonce);
  console.log("Resulting hash:", hash);
  console.log("Time taken:", (endTime - startTime) / 1000, "seconds");
}

// Find a hash starting with "0x00"
mineHash("0x00");`,
    3: `// Merkle Tree Example
const { ethers } = require('ethers');

// Create some sample data
const transactions = [
  "Alice sends 1 ETH to Bob",
  "Charlie sends 0.5 ETH to Dave",
  "Eve sends 2 ETH to Frank",
  "Grace sends 0.3 ETH to Heidi"
];

console.log("Original transactions:");
transactions.forEach((tx, i) => console.log(\`\${i}: \${tx}\`));

// Convert transactions to leaf nodes (hash each transaction)
const leaves = transactions.map(tx => 
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(tx))
);

console.log("\\nLeaf nodes (transaction hashes):");
leaves.forEach((leaf, i) => console.log(\`\${i}: \${leaf}\`));

// Build a Merkle Tree
function buildMerkleTree(leaves) {
  if (leaves.length === 0) return { root: null, layers: [] };
  
  const layers = [leaves];
  let currentLayer = leaves;
  
  // Build the tree layer by layer until we reach the root
  while (currentLayer.length > 1) {
    const newLayer = [];
    
    // Create parent nodes by pairing and hashing children
    for (let i = 0; i < currentLayer.length; i += 2) {
      if (i + 1 < currentLayer.length) {
        // Hash the pair of nodes
        const hash = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['bytes32', 'bytes32'],
            [currentLayer[i], currentLayer[i + 1]]
          )
        );
        newLayer.push(hash);
      } else {
        // Odd number of nodes at this level, promote the unpaired one
        newLayer.push(currentLayer[i]);
      }
    }
    
    // Add this layer to our tree
    layers.push(newLayer);
    currentLayer = newLayer;
  }
  
  return {
    root: currentLayer[0],
    layers: layers
  };
}

const tree = buildMerkleTree(leaves);

console.log("\\nMerkle Tree Layers:");
tree.layers.forEach((layer, i) => {
  console.log(\`Layer \${i}:\`);
  layer.forEach(node => console.log(\`  \${node}\`));
});

console.log("\\nMerkle Root:", tree.root);

// Generate a Merkle proof for a specific transaction
function generateProof(index, layers) {
  const proof = [];
  let currentIndex = index;
  
  // Go through each layer (except the root)
  for (let i = 0; i < layers.length - 1; i++) {
    const layer = layers[i];
    const isLeft = currentIndex % 2 === 0;
    const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;
    
    // Add the sibling to the proof if it exists
    if (siblingIndex < layer.length) {
      proof.push(layer[siblingIndex]);
    }
    
    // Move to the parent's index in the next layer
    currentIndex = Math.floor(currentIndex / 2);
  }
  
  return proof;
}

// Generate a proof for transaction 1
const txIndex = 1;
const proof = generateProof(txIndex, tree.layers);

console.log(\`\\nProof for transaction \${txIndex}:\`);
proof.forEach((node, i) => console.log(\`\${i}: \${node}\`));

// Verify the proof
function verifyProof(leaf, proof, root, index) {
  let hash = leaf;
  let currentIndex = index;
  
  for (let i = 0; i < proof.length; i++) {
    const isLeft = currentIndex % 2 === 0;
    
    // According to the index, determine if the proof node is on the left or right
    if (isLeft) {
      // Current node is left, proof node is right
      hash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['bytes32', 'bytes32'],
          [hash, proof[i]]
        )
      );
    } else {
      // Current node is right, proof node is left
      hash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['bytes32', 'bytes32'],
          [proof[i], hash]
        )
      );
    }
    
    // Move to the parent's index
    currentIndex = Math.floor(currentIndex / 2);
  }
  
  // The final hash should match the root
  return hash === root;
}

const isValid = verifyProof(leaves[txIndex], proof, tree.root, txIndex);
console.log("\\nProof verification:", isValid ? "VALID" : "INVALID");`,
    4: `// Reentrancy Vulnerability Example
// This is a simulation - no real contracts are deployed

console.log("Simulating a Reentrancy Attack");
console.log("-------------------------------");

// Vulnerable Bank Contract (simplified for simulation)
class VulnerableBank {
  constructor(initialBalance = 10) {
    this.balances = {};
    this.totalFunds = initialBalance;
    console.log(\`Bank initialized with \${initialBalance} ETH\`);
  }
  
  deposit(address, amount) {
    this.balances[address] = (this.balances[address] || 0) + amount;
    this.totalFunds += amount;
    console.log(\`\${address} deposited \${amount} ETH\`);
  }
  
  // Vulnerable withdraw function (bad practice!)
  vulnerableWithdraw(address, amount) {
    console.log(\`\${address} requests to withdraw \${amount} ETH\`);
    
    // Check if the user has enough balance
    const userBalance = this.balances[address] || 0;
    if (userBalance < amount) {
      console.log("Insufficient balance, withdrawal failed");
      return false;
    }
    
    // THIS IS THE VULNERABILITY:
    // Sending funds before updating balances
    console.log(\`Sending \${amount} ETH to \${address}...\`);
    
    // Simulate the external call that can be hijacked
    if (address === "attacker") {
      console.log("Attacker contract's fallback function triggered!");
      
      // The attacker uses the callback to withdraw again before balance update
      if (this.totalFunds > 0 && this.balances[address] >= amount) {
        console.log("Attacker reentering vulnerableWithdraw function!");
        this.vulnerableWithdraw(address, amount);
      }
    }
    
    // Finally update the balance (too late!)
    this.balances[address] -= amount;
    this.totalFunds -= amount;
    
    console.log(\`Withdrawal complete. Bank balance: \${this.totalFunds} ETH\`);
    return true;
  }
  
  // Secure withdraw function (correct implementation)
  secureWithdraw(address, amount) {
    console.log(\`\${address} requests to securely withdraw \${amount} ETH\`);
    
    // Check if the user has enough balance
    const userBalance = this.balances[address] || 0;
    if (userBalance < amount) {
      console.log("Insufficient balance, withdrawal failed");
      return false;
    }
    
    // CORRECT APPROACH:
    // Update balances before sending funds
    this.balances[address] -= amount;
    this.totalFunds -= amount;
    
    // Now it's safe to send funds
    console.log(\`Sending \${amount} ETH to \${address}...\`);
    
    // Even if the attacker tries to reenter, the balance is already updated
    if (address === "attacker") {
      console.log("Attacker contract's fallback function triggered!");
      
      // Try to withdraw again (will fail due to updated balance)
      if (this.totalFunds > 0 && this.balances[address] >= amount) {
        console.log("Attacker trying to reenter secureWithdraw function!");
        this.secureWithdraw(address, amount);
      } else {
        console.log("Attacker couldn't reenter: balance already updated!");
      }
    }
    
    console.log(\`Secure withdrawal complete. Bank balance: \${this.totalFunds} ETH\`);
    return true;
  }
  
  getBalances() {
    console.log("Current bank state:");
    console.log(\`Total funds: \${this.totalFunds} ETH\`);
    Object.keys(this.balances).forEach(addr => {
      console.log(\`\${addr} balance: \${this.balances[addr]} ETH\`);
    });
  }
}

// Run the simulation
const bank = new VulnerableBank();

// Regular user
bank.deposit("alice", 2);

// Attacker prepares
bank.deposit("attacker", 1);

console.log("\\n--- Simulating Vulnerable Withdraw ---");
bank.getBalances();
bank.vulnerableWithdraw("attacker", 1);
bank.getBalances();

// Reset for secure example
const secureBank = new VulnerableBank();
secureBank.deposit("alice", 2);
secureBank.deposit("attacker", 1);

console.log("\\n--- Simulating Secure Withdraw ---");
secureBank.getBalances();
secureBank.secureWithdraw("attacker", 1);
secureBank.getBalances();`,
    5: `// Proof-of-Stake Consensus Simulation
console.log("Simulating a Proof-of-Stake System");
console.log("-----------------------------------");

class Validator {
  constructor(address, stake) {
    this.address = address;
    this.stake = stake;
    this.isOnline = true;
  }
}

class Block {
  constructor(id, proposer) {
    this.id = id;
    this.proposer = proposer;
    this.votes = {};
    this.finalized = false;
  }
  
  addVote(validator, approve) {
    this.votes[validator.address] = approve;
  }
  
  getVotingPower(validators) {
    let approvalStake = 0;
    let totalVotingStake = 0;
    
    Object.keys(this.votes).forEach(address => {
      const validator = validators.find(v => v.address === address);
      if (validator && validator.isOnline) {
        totalVotingStake += validator.stake;
        if (this.votes[address]) {
          approvalStake += validator.stake;
        }
      }
    });
    
    return {
      approvalStake,
      totalVotingStake,
      approvalPercentage: totalVotingStake > 0 
        ? (approvalStake / totalVotingStake) * 100 
        : 0
    };
  }
}

class ConsensusSimulator {
  constructor() {
    this.validators = [];
    this.totalStake = 0;
    this.blocks = [];
    this.currentBlockId = 1;
    this.consensusThreshold = 66; // 66% approval needed
  }
  
  addValidator(address, stake) {
    const validator = new Validator(address, stake);
    this.validators.push(validator);
    this.totalStake += stake;
    console.log(\`Validator \${address} added with stake \${stake} ETH\`);
  }
  
  createNewBlock() {
    // Select proposer weighted by stake
    const proposerIndex = this.selectProposer();
    const proposer = this.validators[proposerIndex];
    
    // Create a new block
    const block = new Block(this.currentBlockId, proposer.address);
    this.blocks.push(block);
    
    console.log(\`Block #\${this.currentBlockId} created by proposer \${proposer.address}\`);
    this.currentBlockId++;
    
    return block;
  }
  
  submitVote(validatorAddress, blockId, approve) {
    const block = this.blocks.find(b => b.id === blockId);
    const validator = this.validators.find(v => v.address === validatorAddress);
    
    if (!block || !validator) {
      console.log("Invalid block or validator");
      return false;
    }
    
    if (block.finalized) {
      console.log(\`Block #\${blockId} is already finalized\`);
      return false;
    }
    
    block.addVote(validator, approve);
    console.log(\`Validator \${validatorAddress} voted \${approve ? "to approve" : "to reject"} block #\${blockId}\`);
    
    // Check if consensus is reached
    this.checkConsensus(blockId);
    
    return true;
  }
  
  checkConsensus(blockId) {
    const block = this.blocks.find(b => b.id === blockId);
    if (!block || block.finalized) return false;
    
    const { approvalStake, totalVotingStake, approvalPercentage } = block.getVotingPower(this.validators);
    
    console.log(\`Block #\${blockId} - Votes: \${totalVotingStake} ETH of stake voted (\${approvalPercentage.toFixed(2)}% approval)\`);
    
    // Need at least 2/3 of total stake to vote for consensus
    if (totalVotingStake >= this.totalStake * 2/3) {
      if (approvalPercentage >= this.consensusThreshold) {
        block.finalized = true;
        console.log(\`Block #\${blockId} FINALIZED - Consensus reached with \${approvalPercentage.toFixed(2)}% approval\`);
        return true;
      } else {
        console.log(\`Block #\${blockId} REJECTED - Below threshold with only \${approvalPercentage.toFixed(2)}% approval\`);
      }
    } else {
      console.log(\`Block #\${blockId} - Awaiting more votes (needs 2/3 of stake to vote)\`);
    }
    
    return false;
  }
  
  selectProposer() {
    // Simple weighted random selection based on stake
    const totalStake = this.totalStake;
    const randomPoint = Math.random() * totalStake;
    
    let cumulativeStake = 0;
    for (let i = 0; i < this.validators.length; i++) {
      cumulativeStake += this.validators[i].stake;
      if (randomPoint <= cumulativeStake) {
        return i;
      }
    }
    
    return 0; // Fallback to first validator
  }
  
  getStatus() {
    console.log("\\nCurrent Consensus Status:");
    console.log(\`Total validators: \${this.validators.length}\`);
    console.log(\`Total stake: \${this.totalStake} ETH\`);
    console.log(\`Consensus threshold: \${this.consensusThreshold}%\`);
    console.log("\\nValidators:");
    this.validators.forEach(v => {
      console.log(\`\${v.address}: \${v.stake} ETH (\${((v.stake / this.totalStake) * 100).toFixed(2)}% of stake)\`);
    });
    
    console.log("\\nBlocks:");
    this.blocks.forEach(b => {
      const { approvalPercentage } = b.getVotingPower(this.validators);
      console.log(\`Block #\${b.id} - Proposer: \${b.proposer} - Status: \${b.finalized ? "Finalized" : "Pending"} - Approval: \${approvalPercentage.toFixed(2)}%\`);
    });
  }
}

// Run the simulation
const consensus = new ConsensusSimulator();

// Add validators with different stakes
consensus.addValidator("Alice", 100);
consensus.addValidator("Bob", 50);
consensus.addValidator("Charlie", 30);
consensus.addValidator("Dave", 20);
consensus.addValidator("You", 80); // The user has significant stake

// Create first block
const block1 = consensus.createNewBlock();

// Submit votes
consensus.submitVote("Alice", 1, true);
consensus.submitVote("Bob", 1, true);
consensus.submitVote("Charlie", 1, false); // Charlie votes against
consensus.submitVote("You", 1, true);

// Check status after voting
consensus.getStatus();

// Create another block
const block2 = consensus.createNewBlock();

// Submit votes for block 2
consensus.submitVote("Alice", 2, true);
consensus.submitVote("Bob", 2, false);
consensus.submitVote("Charlie", 2, false);
consensus.submitVote("Dave", 2, true);
consensus.submitVote("You", 2, true);

// Final status
consensus.getStatus();`
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Running simulation...\n\n');
    
    // Simulate console output
    setTimeout(() => {
      let simulationOutput = '';
      
      // Generate output based on level
      switch (levelId) {
        case 1:
          simulationOutput = `Wallet address: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F
Message: Hello, Blockchain!
Signature: 0x8a39ce2f9ab0a44ba8e2d4cbb7336d2b183acac8c3f7b67afd51f63d6194b9531ab018e02721ba8f461b6f23d9bd5e63cb5a192992b1ec16be05ec88b8a93a4f1b
Recovered address: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F
Matches original address: true`;
          break;
        case 2:
          simulationOutput = `Message: Hello, Blockchain!
Keccak256 hash: 0x8eb4e9a85e1e3db3ab013ef9153ce96555a6abf269b4ce239c84fb71626c8d88
Mining for hash with prefix: 0x00
Starting mining...
...................................................
Mining complete!
Nonce found: 258
Resulting hash: 0x00f2802e86f23e0d045722c7f4023f8a1aad29e501fdedfa1db66f5da5cb9395
Time taken: 0.235 seconds`;
          break;
        case 3:
          simulationOutput = `Original transactions:
0: Alice sends 1 ETH to Bob
1: Charlie sends 0.5 ETH to Dave
2: Eve sends 2 ETH to Frank
3: Grace sends 0.3 ETH to Heidi

Leaf nodes (transaction hashes):
0: 0x4f6e7f5b69def4b86e7b3b3e2f0e8bf7db1a20e16a81e6c6cc0afb39a3f9654c
1: 0x14a7f3a2efebdd51cb0ea6e402c2ef2d24e7aed95c5aa35713a53b40fcab13e4
2: 0xc9fca48f16f7a3167833da8754c7f3e274a74e895fbaa964c2c9908054fddd07
3: 0x99eb9950a3dc9d1934f0455d3c3456582d86697f7dbbd066b5ec5c5845317c9e

Merkle Tree Layers:
Layer 0:
  0x4f6e7f5b69def4b86e7b3b3e2f0e8bf7db1a20e16a81e6c6cc0afb39a3f9654c
  0x14a7f3a2efebdd51cb0ea6e402c2ef2d24e7aed95c5aa35713a53b40fcab13e4
  0xc9fca48f16f7a3167833da8754c7f3e274a74e895fbaa964c2c9908054fddd07
  0x99eb9950a3dc9d1934f0455d3c3456582d86697f7dbbd066b5ec5c5845317c9e
Layer 1:
  0xc3a24b0501bd2c13a7e57f2db4369ec4c223a1b0a4c5190a582b931794089a11
  0x22b85d5f5d5117f76add9aae1033978a5be4aeed6af3f66c910a79adb7ba14c5
Layer 2:
  0x3fd8b96b4129c4badef4bf9e33d25f8bc4a5a3760181d5768d69e0ac15662698

Merkle Root: 0x3fd8b96b4129c4badef4bf9e33d25f8bc4a5a3760181d5768d69e0ac15662698

Proof for transaction 1:
0: 0x4f6e7f5b69def4b86e7b3b3e2f0e8bf7db1a20e16a81e6c6cc0afb39a3f9654c
1: 0x22b85d5f5d5117f76add9aae1033978a5be4aeed6af3f66c910a79adb7ba14c5

Proof verification: VALID`;
          break;
        case 4:
          simulationOutput = `Simulating a Reentrancy Attack
-------------------------------
Bank initialized with 10 ETH
alice deposited 2 ETH
attacker deposited 1 ETH

--- Simulating Vulnerable Withdraw ---
Current bank state:
Total funds: 13 ETH
alice balance: 2 ETH
attacker balance: 1 ETH
attacker requests to withdraw 1 ETH
Sending 1 ETH to attacker...
Attacker contract's fallback function triggered!
Attacker reentering vulnerableWithdraw function!
attacker requests to withdraw 1 ETH
Sending 1 ETH to attacker...
Attacker contract's fallback function triggered!
Attacker couldn't reenter: balance already updated!
Withdrawal complete. Bank balance: 11 ETH
Withdrawal complete. Bank balance: 10 ETH
Current bank state:
Total funds: 10 ETH
alice balance: 2 ETH
attacker balance: -1 ETH

--- Simulating Secure Withdraw ---
Current bank state:
Total funds: 13 ETH
alice balance: 2 ETH
attacker balance: 1 ETH
attacker requests to securely withdraw 1 ETH
Sending 1 ETH to attacker...
Attacker contract's fallback function triggered!
Attacker trying to reenter secureWithdraw function!
attacker requests to securely withdraw 1 ETH
Insufficient balance, withdrawal failed
Attacker couldn't reenter: balance already updated!
Secure withdrawal complete. Bank balance: 12 ETH
Current bank state:
Total funds: 12 ETH
alice balance: 2 ETH
attacker balance: 0 ETH`;
          break;
        case 5:
          simulationOutput = `Simulating a Proof-of-Stake System
-----------------------------------
Validator Alice added with stake 100 ETH
Validator Bob added with stake 50 ETH
Validator Charlie added with stake 30 ETH
Validator Dave added with stake 20 ETH
Validator You added with stake 80 ETH
Block #1 created by proposer Alice
Validator Alice voted to approve block #1
Validator Bob voted to approve block #1
Validator Charlie voted to reject block #1
Validator You voted to approve block #1
Block #1 - Votes: 230 ETH of stake voted (82.61% approval)
Block #1 FINALIZED - Consensus reached with 82.61% approval

Current Consensus Status:
Total validators: 5
Total stake: 280 ETH
Consensus threshold: 66%

Validators:
Alice: 100 ETH (35.71% of stake)
Bob: 50 ETH (17.86% of stake)
Charlie: 30 ETH (10.71% of stake)
Dave: 20 ETH (7.14% of stake)
You: 80 ETH (28.57% of stake)

Blocks:
Block #1 - Proposer: Alice - Status: Finalized - Approval: 82.61%
Block #2 created by proposer You
Validator Alice voted to approve block #2
Validator Bob voted to reject block #2
Validator Charlie voted to reject block #2
Validator Dave voted to approve block #2
Validator You voted to approve block #2
Block #2 - Votes: 280 ETH of stake voted (71.43% approval)
Block #2 FINALIZED - Consensus reached with 71.43% approval

Current Consensus Status:
Total validators: 5
Total stake: 280 ETH
Consensus threshold: 66%

Validators:
Alice: 100 ETH (35.71% of stake)
Bob: 50 ETH (17.86% of stake)
Charlie: 30 ETH (10.71% of stake)
Dave: 20 ETH (7.14% of stake)
You: 80 ETH (28.57% of stake)

Blocks:
Block #1 - Proposer: Alice - Status: Finalized - Approval: 82.61%
Block #2 - Proposer: You - Status: Finalized - Approval: 71.43%`;
          break;
        default:
          simulationOutput = "No simulation available for this level yet.";
      }
      
      setOutput(simulationOutput);
      setIsRunning(false);
    }, 1500);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Interactive Simulator
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This simulator will help you understand the core concepts before tackling the challenge.
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab icon={<Code />} label="Code" />
        <Tab icon={<Terminal />} label="Output" />
      </Tabs>
      
      {activeTab === 0 && (
        <Box>
          <CodeEditor
            value={simulatorCode[levelId] || '// No code available for this level'}
            language="javascript"
            readOnly
            height="300px"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleRun}
            disabled={isRunning}
            startIcon={isRunning ? <CircularProgress size={24} /> : <PlayArrow />}
            sx={{ mt: 2 }}
          >
            {isRunning ? 'Running...' : 'Run Simulation'}
          </Button>
        </Box>
      )}
      
      {activeTab === 1 && (
        <Box 
          sx={{ 
            bgcolor: 'black', 
            color: 'white', 
            p: 2, 
            borderRadius: 1,
            fontFamily: 'monospace',
            height: '300px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap'
          }}
        >
          {output || 'Run the simulation to see output...'}
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={onAdvance}
          endIcon={<ArrowForward />}
        >
          Continue to Challenge
        </Button>
      </Box>
    </Paper>
  );
};

export default LevelSimulator;