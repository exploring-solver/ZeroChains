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
  AlertTitle,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  Terminal, // Assuming Terminal icon is used for the challenge
  Quiz,
  School, // Assuming School icon is used for learning
  ArrowForward,
  Check,
} from '@mui/icons-material';

import { useWeb3 } from '../contexts/Web3Context'; // Assuming context exists
import { useGame } from '../contexts/GameContext'; // Assuming context exists
import CodeEditor from '../components/game/CodeEditor'; // Assuming component exists
import CompletionDialog from '../components/game/CompletionDialog'; // Assuming component exists
import { contractAddresses } from '../config/addresses';

// --- Data (Included directly for completeness, move to separate files ideally) ---

// Remote execution script templates (Ensure these are secure and appropriate)
const scriptTemplates = {
  1: `// scripts/solveLevel1.js
const { ethers } = require("hardhat"); // or require("ethers") if not using hardhat env
require("dotenv").config();

async function main() {
  console.log("Solving Level 1: Genesis Signer Challenge");
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const level1Address = process.env.LEVEL1_CONTRACT_ADDRESS; // Get from .env or config

  if (!level1Address) throw new Error("LEVEL1_CONTRACT_ADDRESS not set");
  console.log("Using account:", signer.address);
  console.log("Level 1 Contract:", level1Address);

  const Level1Genesis_ABI = [ /* Add Level 1 ABI here */ ]; // Replace with actual ABI
  const level1Contract = new ethers.Contract(level1Address, Level1Genesis_ABI, signer);

  const message = "Approve Level 1";
  const messageHash = ethers.utils.id(message);
  console.log("Signing message:", message, "Hash:", messageHash);

  // Note: ethers v5 signMessage signs the UTF-8 bytes, not the hash directly
  // For compatibility with contract's getEthSignedMessageHash, usually sign the hash
  const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
  console.log("Signature:", signature);

  console.log("Submitting signature using verifySignatureBytes...");
  const tx = await level1Contract.verifySignatureBytes(messageHash, signature);

  console.log("Transaction submitted:", tx.hash);
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());
  console.log("Level 1 completed successfully!");
}

main().catch((error) => { console.error(error); process.exit(1); });`,
  2: `// scripts/solveLevel2.js
const { ethers } = require("ethers"); // Use ethers directly
require("dotenv").config();

async function main() {
  console.log("Solving Level 2: Hash Forge Challenge");
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const level2Address = process.env.LEVEL2_CONTRACT_ADDRESS;

  if (!level2Address) throw new Error("LEVEL2_CONTRACT_ADDRESS not set");
  console.log("Using account:", signer.address);
  console.log("Level 2 Contract:", level2Address);

  const Level2HashFortress_ABI = [ /* Add Level 2 ABI here */ ]; // Replace with actual ABI
  const level2Contract = new ethers.Contract(level2Address, Level2HashFortress_ABI, signer);

  const targetPrefix = await level2Contract.targetPrefixHash();
  console.log("Target prefix hash:", targetPrefix);

  const mask = ethers.BigNumber.from("0xff00000000000000000000000000000000000000000000000000000000000000");
  const targetFirstByte = ethers.BigNumber.from(targetPrefix).and(mask);
  console.log("Target first byte (masked):", targetFirstByte.toHexString());

  console.log("Searching for a matching hash...");
  let nonce = 0;
  let solution = ethers.constants.HashZero; // Initialize solution
  let found = false;

  while (nonce < 1000000) { // Add a reasonable limit
    // Convert nonce to bytes32
    const potentialSolution = ethers.utils.hexZeroPad(ethers.BigNumber.from(nonce).toHexString(), 32);
    const solutionHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(['bytes32'], [potentialSolution])
    );
    const solutionFirstByte = ethers.BigNumber.from(solutionHash).and(mask);

    if (solutionFirstByte.eq(targetFirstByte)) {
      console.log("Solution found after", nonce, "attempts!");
      solution = potentialSolution;
      console.log("Solution:", solution);
      console.log("Solution hash:", solutionHash);
      found = true;
      break;
    }
    nonce++;
    if (nonce % 10000 === 0) console.log("Tried", nonce, "values...");
  }

  if (!found) throw new Error("Could not find a solution within the attempt limit.");

  console.log("Submitting solution to contract...");
  const tx = await level2Contract.solveHashPuzzle(solution);

  console.log("Transaction submitted:", tx.hash);
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());
  console.log("Level 2 completed successfully!");
}

main().catch((error) => { console.error(error); process.exit(1); });`,
  3: `// scripts/solveLevel3.js
const { ethers } = require("ethers");
require("dotenv").config();
const { MerkleTree } = require('merkletreejs'); // Need to install merkletreejs

// Helper function to create a Merkle Tree using merkletreejs
function createMerkleTreeJs(leaves) {
  if (!leaves || leaves.length === 0) return null;
  const leafHashes = leaves.map(leaf => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(leaf)));
  const tree = new MerkleTree(leafHashes, ethers.utils.keccak256, { sortPairs: true });
  return tree;
}

async function main() {
  console.log("Solving Level 3: Merkle Maze Challenge");
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const level3Address = process.env.LEVEL3_CONTRACT_ADDRESS;

  if (!level3Address) throw new Error("LEVEL3_CONTRACT_ADDRESS not set");
  console.log("Using account:", signer.address);
  console.log("Level 3 Contract:", level3Address);

  const Level3MerkleMaze_ABI = [ /* Add Level 3 ABI here */ ]; // Replace with actual ABI
  const level3Contract = new ethers.Contract(level3Address, Level3MerkleMaze_ABI, signer);

  const contractRootHash = await level3Contract.rootHash();
  console.log("Contract root hash:", contractRootHash);

  // Create sample transactions (MUST MATCH the ones used to generate the root in the contract)
  // You might need to query the contract setup or know these beforehand
  const transactions = [
    "Transfer 1 ETH from Alice to Bob",
    "Transfer 0.5 ETH from Charlie to Dave",
    "Transfer 0.3 ETH from Eve to Mallory",
    "Transfer 2 ETH from Frank to Grace"
    // Add more if needed...
  ];

  const merkleTree = createMerkleTreeJs(transactions);
  const calculatedRoot = '0x' + merkleTree.getRoot().toString('hex');
  console.log("Calculated root hash:", calculatedRoot);

  if (calculatedRoot !== contractRootHash) {
     console.warn("Calculated root doesn't match contract root. Ensure transactions are correct.");
     // Optionally throw error if mismatch is critical
     // throw new Error("Merkle root mismatch!");
  }

  const leafIndex = 0; // Prove the first transaction
  const leafTransaction = transactions[leafIndex];
  const leafHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(leafTransaction));
  console.log("Proving inclusion of:", leafTransaction, " Hash:", leafHash);

  const proof = merkleTree.getHexProof(leafHash);
  console.log("Merkle proof:", proof);

  console.log("Verifying proof locally:", merkleTree.verify(proof, leafHash, merkleTree.getRoot()));

  console.log("Submitting proof to contract...");
  const tx = await level3Contract.verifyMerkleProof(proof, leafHash, leafIndex);

  console.log("Transaction submitted:", tx.hash);
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());
  console.log("Level 3 completed successfully!");
}

main().catch((error) => { console.error(error); process.exit(1); });`,
  4: `// scripts/solveLevel4.js
const { ethers } = require("ethers");
require("dotenv").config();
const fs = require('fs'); // To read attacker contract artifact
const path = require('path');

async function main() {
  console.log("Solving Level 4: Reentrancy Labyrinth Challenge");
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const level4Address = process.env.LEVEL4_CONTRACT_ADDRESS;

  if (!level4Address) throw new Error("LEVEL4_CONTRACT_ADDRESS not set");
  console.log("Using account:", signer.address);
  console.log("Level 4 Contract:", level4Address);

  // Deploy the attacker contract (assuming compiled artifact exists)
  console.log("Deploying the attacker contract...");
  const attackerArtifactPath = path.join(__dirname, '../artifacts/contracts/ReentrancyAttacker.sol/ReentrancyAttacker.json'); // Adjust path as needed
  const attackerArtifact = JSON.parse(fs.readFileSync(attackerArtifactPath, 'utf8'));

  const AttackerFactory = new ethers.ContractFactory(attackerArtifact.abi, attackerArtifact.bytecode, signer);
  const attackerContract = await AttackerFactory.deploy(level4Address);
  await attackerContract.deployed();
  console.log("Attacker contract deployed at:", attackerContract.address);

  console.log("Executing the exploit with 0.1 ETH...");
  const exploitTx = await attackerContract.exploit({ value: ethers.utils.parseEther("0.1") });
  console.log("Exploit transaction sent:", exploitTx.hash);
  await exploitTx.wait();
  console.log("Exploit likely completed (check contract balance)");

  // Optional: Withdraw funds from attacker contract
  // console.log("Withdrawing exploited funds...");
  // const withdrawTx = await attackerContract.withdraw();
  // await withdrawTx.wait();
  // console.log("Funds withdrawn to owner.");

  // After successful exploit, call validateSolution() on the Level 4 contract
  // This might need to be done via the attacker contract if it has a method,
  // or directly if the check is simple enough (e.g., based on contract balance).
  // The provided Level4 contract seems to expect a call to validateSolution()
  // directly by the EOA (signer) AFTER the exploit has happened and potentially
  // after the secureWithdraw method has also been demonstrated (which the attacker doesn't do).
  // This part might need adjustment based on the exact mechanics of validateSolution.
  // Let's assume for now we need to call it directly.

  console.log("Attempting to validate the solution (may require manual interaction or different strategy)...");
  const Level4ReentrancyLabyrinth_ABI = [ /* Add Level 4 ABI here */ ]; // Replace with actual ABI
  const level4Contract = new ethers.Contract(level4Address, Level4ReentrancyLabyrinth_ABI, signer);

  try {
      const validateTx = await level4Contract.validateSolution(); // Might fail if conditions aren't met
      console.log("Validation transaction sent:", validateTx.hash);
      const receipt = await validateTx.wait();
      console.log("Validation confirmed in block:", receipt.blockNumber);
      console.log("Gas used:", receipt.gasUsed.toString());
      console.log("Level 4 completed successfully!");
  } catch (validationError) {
      console.error("Validation failed. Conditions for validateSolution() might not be met.", validationError.reason || validationError.message);
      console.log("Ensure the exploit was successful AND potentially that secureWithdraw works.");
  }
}

main().catch((error) => { console.error(error); process.exit(1); });`,
  5: `// scripts/solveLevel5.js
const { ethers } = require("ethers");
require("dotenv").config();
const fs = require('fs'); // If using helper contract artifact
const path = require('path');

// --- Option 1: Using Helper Contract (Recommended) ---
async function solveWithHelper() {
  console.log("Solving Level 5: Consensus Arena (using Helper Contract)");
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const level5Address = process.env.LEVEL5_CONTRACT_ADDRESS;
  const gameAddress = process.env.GAME_CONTRACT_ADDRESS; // Need game address too

  if (!level5Address || !gameAddress) throw new Error("LEVEL5_CONTRACT_ADDRESS or GAME_CONTRACT_ADDRESS not set");
  console.log("Using account:", signer.address);
  console.log("Level 5 Contract:", level5Address);
  console.log("Game Contract:", gameAddress);

  // Deploy helper contracts (assuming artifact exists)
  const helperArtifactPath = path.join(__dirname, '../artifacts/contracts/VotingHelper.sol/VotingHelper.json'); // Adjust path
  const helperArtifact = JSON.parse(fs.readFileSync(helperArtifactPath, 'utf8'));
  const HelperFactory = new ethers.ContractFactory(helperArtifact.abi, helperArtifact.bytecode, signer);

  console.log("Deploying helper 1...");
  const helper1 = await HelperFactory.deploy(level5Address);
  await helper1.deployed();
  console.log("Helper 1 deployed at:", helper1.address);

  console.log("Deploying helper 2...");
  const helper2 = await HelperFactory.deploy(level5Address);
  await helper2.deployed();
  console.log("Helper 2 deployed at:", helper2.address);

  // Stake funds from main account and helpers
  const mainStake = ethers.utils.parseEther("0.1");
  const helperStake = ethers.utils.parseEther("0.1");

  const Level5ConsensusArena_ABI = [ /* Add Level 5 ABI here */ ]; // Replace with actual ABI
  const level5Contract = new ethers.Contract(level5Address, Level5ConsensusArena_ABI, signer);

  console.log("Staking from main account...");
  const stakeTx = await level5Contract.stakeTokens({ value: mainStake });
  await stakeTx.wait();

  console.log("Staking and voting from helpers...");
  const helper1Tx = await helper1.stakeAndVote(true, { value: helperStake });
  await helper1Tx.wait();
  const helper2Tx = await helper2.stakeAndVote(true, { value: helperStake });
  await helper2Tx.wait();
  console.log("Initial staking complete.");

  // Loop to vote and finalize blocks
  let startBlock = await level5Contract.currentBlockId();
  const targetBlock = startBlock.add(3); // Need to complete 3 blocks
  let currentBlock = startBlock;
  let attempts = 0;

  while (currentBlock.lt(targetBlock) && attempts < 10) { // Limit attempts
    attempts++;
    console.log(\`--- Processing Block \${currentBlock.toString()} --- Attempt \${attempts} ---\`);
    currentBlock = await level5Contract.currentBlockId(); // Refresh current block ID

    // Vote from main account if needed
    if (!(await level5Contract.hasVoted(signer.address, currentBlock))) {
      try {
        console.log(\`Main voting on block \${currentBlock.toString()}...\`);
        const voteTx = await level5Contract.submitVote(true);
        await voteTx.wait(1); // Wait 1 confirmation
        console.log("Main vote submitted.");
      } catch (e) { console.warn("Main vote failed (already voted or block finalized?)"); }
    } else { console.log(\`Main already voted on block \${currentBlock.toString()}\`) }

    // Vote from helpers if needed
     if (!(await level5Contract.hasVoted(helper1.address, currentBlock))) {
      try {
        console.log(\`Helper 1 voting on block \${currentBlock.toString()}...\`);
        const h1VoteTx = await helper1.submitVote(true);
        await h1VoteTx.wait(1);
        console.log("Helper 1 vote submitted.");
      } catch (e) { console.warn("Helper 1 vote failed."); }
    } else { console.log(\`Helper 1 already voted on block \${currentBlock.toString()}\`) }

     if (!(await level5Contract.hasVoted(helper2.address, currentBlock))) {
      try {
        console.log(\`Helper 2 voting on block \${currentBlock.toString()}...\`);
        const h2VoteTx = await helper2.submitVote(true);
        await h2VoteTx.wait(1);
        console.log("Helper 2 vote submitted.");
      } catch (e) { console.warn("Helper 2 vote failed."); }
    } else { console.log(\`Helper 2 already voted on block \${currentBlock.toString()}\`) }

    // Check if block advanced
    const newBlockCheck = await level5Contract.currentBlockId();
    if (newBlockCheck.gt(currentBlock)) {
        console.log(\`Block \${currentBlock.toString()} finalized! New block: \${newBlockCheck.toString()}\`);
        currentBlock = newBlockCheck;
    } else {
        console.log(\`Block \${currentBlock.toString()} not yet finalized. Waiting...\`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    }
  }

  // Check completion status
  const GameContract_ABI = [ /* Add Game Contract ABI for playerLevel here */ ]; // Replace with actual ABI
  const gameContract = new ethers.Contract(gameAddress, GameContract_ABI, signer);
  const finalLevel = await gameContract.playerLevel(signer.address);

  if (finalLevel.gte(5)) {
    console.log("Level 5 completed successfully!");
  } else {
    console.log("Level 5 NOT completed. Check logs or try more rounds.");
  }

  // Cleanup: Unstake
  console.log("Unstaking funds...");
  try { await level5Contract.unstake(await level5Contract.stake(signer.address)); } catch(e){ console.warn("Main unstake failed.")}
  try { await helper1.unstakeAll(); } catch(e){ console.warn("Helper 1 unstake failed.")}
  try { await helper2.unstakeAll(); } catch(e){ console.warn("Helper 2 unstake failed.")}
  console.log("Cleanup attempted.");
}

// --- Option 2: Manual (Difficult - Requires multiple accounts) ---
// async function solveManually() { ... }

// --- Run Solver ---
solveWithHelper().catch((error) => { console.error(error); process.exit(1); });`
};

const contractInfo = {
  BlockchainGuardian: {
    name: "BlockchainGuardianGame",
    address: contractAddresses.BlockchainGuardianGame,
    utilityFunctions: [
      "completeLevel(address player, uint256 level)",
      "playerLevel(address) returns (uint256)",
      "securityPoints(address) returns (uint256)",
      "setLevelContract(uint256 level, address contractAddress)",
      "isGenesisGuardian(address player) returns (bool)"
    ]
  },
  Level1: {
    name: "Level1Genesis",
    address: contractAddresses.Level1Genesis,
    mainFunctions: [
      "verifySignature(bytes32 txHash, uint8 v, bytes32 r, bytes32 s) returns (address)",
      "verifySignatureBytes(bytes32 messageHash, bytes memory signature) returns (address)",
      "getEthSignedMessageHash(bytes32 _messageHash) returns (bytes32)"
    ]
  },
  Level2: {
    name: "Level2HashFortress",
    address: contractAddresses.Level2HashFortress,
    mainFunctions: [
      "solveHashPuzzle(bytes32 solution)",
      "targetPrefixHash() returns (bytes32)"
    ]
  },
  Level3: {
    name: "Level3MerkleMaze",
    address: contractAddresses.Level3MerkleMaze,
    mainFunctions: [
      "verifyMerkleProof(bytes32[] memory proof, bytes32 leaf, uint256 index)",
      "rootHash() returns (bytes32)"
    ]
  },
  Level4: {
    name: "Level4ReentrancyLabyrinth",
    address: contractAddresses.Level4ReentrancyLabyrinth,
    mainFunctions: [
      "deposit() payable",
      "vulnerableWithdraw(uint256 amount)",
      "secureWithdraw(uint256 amount)",
      "checkExploit(address solution)",
      "validateSolution()"
    ]
  },
  Level5: {
    name: "Level5ConsensusArena",
    address: contractAddresses.Level5ConsensusArena,
    mainFunctions: [
      "stakeTokens() payable",
      "submitVote(bool approval)",
      "unstake(uint256 amount)",
      "currentBlockId() returns (uint256)",
      "hasVoted(address, uint256) returns (bool)"
    ]
  }
};

// Conceptual questions for each level
const levelQuestions = {
  1: [
    {
      id: 'q1',
      question: 'What algorithm is commonly used for digital signatures in Ethereum?',
      type: 'options', // Changed type for clarity
      options: [
        'RSA',
        'SHA-256',
        'ECDSA',
        'AES'
      ],
      correctAnswer: 2 // Index of correct option
    },
    {
      id: 'q2',
      question: 'What is the primary purpose of signing a transaction?',
      type: 'options',
      options: [
        'To encrypt the transaction data',
        'To prove the sender authorized the transaction',
        'To pay for the gas fees',
        'To choose the miner who includes the transaction'
      ],
      correctAnswer: 1
    },
    {
      id: 'q3',
      question: 'Which Solidity built-in function recovers the signer address from a hash and signature components (v, r, s)?',
      type: 'options',
      options: [
        'keccak256()',
        'ecrecover()',
        'verify()',
        'checkSig()'
      ],
      correctAnswer: 1
    },
    {
      id: 'q4',
      question: 'What are the three components of an Ethereum signature?',
      type: 'text',
      correctAnswer: 'r, s, v' // More specific answer expected
    }
  ],
  2: [
    {
      id: 'q1',
      question: 'What is the standard cryptographic hash function used extensively in Ethereum?',
      type: 'options',
      options: [
        'MD5',
        'SHA-1',
        'Keccak-256',
        'BLAKE2'
      ],
      correctAnswer: 2
    },
    {
      id: 'q2',
      question: 'What fundamental property of hash functions makes finding a specific output (like in mining) difficult?',
      type: 'options',
      options: [
        'Reversibility',
        'Fixed output size',
        'Preimage resistance (hard to find input given output)',
        'Collision resistance (hard to find two inputs with same output)'
      ],
      correctAnswer: 2
    },
    {
      id: 'q3',
      question: 'In the context of "Proof of Work", what are miners trying to find?',
      type: 'options',
      options: [
        'The private key of the recipient',
        'A random number (nonce) that results in a hash meeting specific criteria (e.g., leading zeros)',
        'The fastest computer on the network',
        'A way to reverse the hash function'
      ],
      correctAnswer: 1
    },
    {
      id: 'q4',
      question: 'Which Solidity function computes the Keccak-256 hash?',
      type: 'text',
      correctAnswer: 'keccak256'
    }
  ],
  3: [
    {
      id: 'q1',
      question: 'What is the main benefit of using a Merkle Tree?',
      type: 'options',
      options: [
        'Encrypting data',
        'Compressing data',
        'Efficiently verifying if an item is part of a dataset',
        'Storing data chronologically'
      ],
      correctAnswer: 2
    },
    {
      id: 'q2',
      question: 'What information does a Merkle Proof typically contain?',
      type: 'options',
      options: [
        'All the items in the dataset',
        'Only the root hash',
        'The specific item (leaf) and the sibling hashes needed to reconstruct the root',
        'The private key used to sign the root'
      ],
      correctAnswer: 2
    },
    {
      id: 'q3',
      question: 'How is the Merkle Root calculated?',
      type: 'options',
      options: [
        'By averaging all leaf hashes',
        'By hashing the concatenation of all leaf hashes',
        'By recursively hashing pairs of nodes until a single hash remains',
        'By selecting the hash of the first transaction'
      ],
      correctAnswer: 2
    },
    {
      id: 'q4',
      question: 'If you verify a Merkle Proof and the calculated root matches the known root, what does it confirm?',
      type: 'text',
      correctAnswer: 'inclusion or membership' // That the leaf is part of the tree/dataset
    }
  ],
  4: [
    {
      id: 'q1',
      question: 'A reentrancy attack typically occurs when a contract does what?',
      type: 'options',
      options: [
        'Runs out of gas during execution',
        'Makes an external call to another contract before updating its own state',
        'Uses deprecated Solidity features',
        'Accepts Ether without a payable fallback function'
      ],
      correctAnswer: 1
    },
    {
      id: 'q2',
      question: 'What is the recommended pattern to prevent reentrancy vulnerabilities?',
      type: 'options',
      options: [
        'External Calls -> Checks -> State Updates',
        'Checks -> State Updates -> External Calls (Interactions)',
        'State Updates -> External Calls -> Checks',
        'Checks -> External Calls -> State Updates'
      ],
      correctAnswer: 1
    },
    {
      id: 'q3',
      question: 'Besides the Checks-Effects-Interactions pattern, what is another common mechanism to guard against reentrancy?',
      type: 'options',
      options: [
        'Using `onlyOwner` modifier',
        'Using a mutex (mutual exclusion) lock or a reentrancy guard modifier',
        'Making all functions internal',
        'Storing balances in a separate contract'
      ],
      correctAnswer: 1
    },
    {
      id: 'q4',
      question: 'Which low-level Solidity call is often involved in reentrancy exploits because it forwards all gas and can trigger fallback functions?',
      type: 'text',
      correctAnswer: '.call'
    }
  ],
  5: [
    {
      id: 'q1',
      question: 'In Proof-of-Stake (PoS), what determines a validator\'s chance of proposing/validating a block?',
      type: 'options',
      options: [
        'The speed of their computer',
        'The amount of cryptocurrency they have "staked" or locked up',
        'The number of transactions they have processed',
        'A random lottery system unrelated to holdings'
      ],
      correctAnswer: 1
    },
    {
      id: 'q2',
      question: 'Why is PoS generally considered more energy-efficient than Proof-of-Work (PoW)?',
      type: 'options',
      options: [
        'It uses faster hashing algorithms',
        'Validators share the workload more evenly',
        'It doesn\'t require solving computationally intensive puzzles',
        'It processes fewer transactions per block'
      ],
      correctAnswer: 2
    },
    {
      id: 'q3',
      question: 'What is the primary role of staked tokens in a PoS system?',
      type: 'options',
      options: [
        'To pay for transaction fees',
        'To act as collateral, discouraging malicious behavior',
        'To generate interest for the holder',
        'To encrypt network communication'
      ],
      correctAnswer: 1
    },
    {
      id: 'q4',
      question: 'What is the term for the penalty imposed on a validator for malicious behavior (e.g., double-signing) in PoS?',
      type: 'text',
      correctAnswer: 'slashing'
    }
  ]
};

// Solidity Interfaces (as strings)
const levelInterfaces = {
  1: `interface ILevel1Genesis {
  function getEthSignedMessageHash(bytes32 _messageHash) external pure returns (bytes32);
  function verifySignature(bytes32 txHash, uint8 v, bytes32 r, bytes32 s) external; // Changed to not return address to match contract
  function verifySignatureBytes(bytes32 messageHash, bytes memory signature) external; // Changed to not return address
}`,
  2: `interface ILevel2HashFortress {
  function targetPrefixHash() external view returns (bytes32);
  function solveHashPuzzle(bytes32 solution) external;
}`,
  3: `interface ILevel3MerkleMaze {
  function rootHash() external view returns (bytes32);
  function verifyMerkleProof(bytes32[] memory proof, bytes32 leaf, uint256 index) external;
}`,
  4: `interface ILevel4ReentrancyLabyrinth {
  // Note: Functions might differ slightly from original provided contract
  function deposit() external payable;
  function vulnerableWithdraw(uint256 amount) external;
  function checkExploit(address solution) external; // Likely for internal testing
  function secureWithdraw(uint256 amount) external;
  function validateSolution() external; // Likely called by player EOA
}`,
  5: `interface ILevel5ConsensusArena {
  function stake(address) external view returns (uint256);
  function totalStake() external view returns (uint256);
  function currentBlockId() external view returns (uint256);
  function hasVoted(address, uint256) external view returns (bool); // Added missing function
  function stakeTokens() external payable;
  function submitVote(bool approval) external;
  function unstake(uint256 amount) external;
  // function gameContract() external view returns (address); // Removed if not needed directly in script
}`
};

// Level Details (Titles, Descriptions, etc.)
const levelDetailsData = {
  1: {
    title: "Genesis Signer",
    description: "Verify transaction authenticity using digital signatures (ECDSA).",
    steps: ["Learn Concepts", "Conceptual Quiz", "Solve the Challenge", "Completed"],
    tutorial: "Blockchains rely on digital signatures to ensure only the owner of an account can authorize transactions. This level focuses on Ethereum's Elliptic Curve Digital Signature Algorithm (ECDSA). You'll learn how a message is signed off-chain and how the contract uses `ecrecover` to verify that signature on-chain.",
    relevantFunctions: ["verifySignature", "verifySignatureBytes", "ecrecover (Solidity Built-in)"],
    concepts: ["ECDSA", "Message Hashing", "Signature Components (r, s, v)", "Signer Recovery"],
  },
  2: {
    title: "Hash Forge",
    description: "Explore cryptographic hashing (Keccak-256) and find an input matching a specific hash pattern.",
    steps: ["Learn Concepts", "Conceptual Quiz", "Solve the Challenge", "Completed"],
    tutorial: "Cryptographic hash functions create unique 'fingerprints' for data. They are essential for data integrity and Proof-of-Work consensus. Here, you'll need to find an input ('solution') whose Keccak-256 hash matches a target pattern set by the contract, similar to mining.",
    relevantFunctions: ["solveHashPuzzle", "keccak256 (Solidity Built-in)"],
    concepts: ["Cryptographic Hashing", "Keccak-256", "Hash Properties (Preimage Resistance)", "Proof-of-Work Basics"],
  },
  3: {
    title: "Merkle Maze",
    description: "Understand Merkle trees and validate data inclusion using Merkle proofs.",
    steps: ["Learn Concepts", "Conceptual Quiz", "Solve the Challenge", "Completed"],
    tutorial: "Merkle trees allow efficient verification that a specific piece of data (like a transaction) belongs to a larger dataset without needing the entire set. You'll provide a 'leaf' (the data hash), its 'index', and a 'proof' (sibling hashes) to the contract, which will recalculate the root hash and compare it to its stored root.",
    relevantFunctions: ["verifyMerkleProof"],
    concepts: ["Merkle Tree Structure", "Leaf Nodes", "Root Hash", "Merkle Proofs", "Data Integrity Verification"],
  },
  4: {
    title: "Reentrancy Labyrinth",
    description: "Identify, exploit, and fix a common smart contract vulnerability: Reentrancy.",
    steps: ["Learn Concepts", "Conceptual Quiz", "Solve the Challenge", "Completed"],
    tutorial: "Reentrancy occurs when an external call from a contract allows the called contract (or another) to call back into the original contract *before* the initial interaction finished, potentially draining funds or manipulating state. You need to exploit this vulnerability and then understand how the 'Checks-Effects-Interactions' pattern or mutex guards prevent it.",
    relevantFunctions: ["vulnerableWithdraw", "secureWithdraw", "validateSolution", ".call (Solidity Low-Level)"],
    concepts: ["Reentrancy Attack", "Checks-Effects-Interactions Pattern", "Mutex / Reentrancy Guard", "Smart Contract Security"],
  },
  5: {
    title: "Consensus Arena",
    description: "Participate in a simulated Proof-of-Stake (PoS) consensus mechanism.",
    steps: ["Learn Concepts", "Conceptual Quiz", "Solve the Challenge", "Completed"],
    tutorial: "Proof-of-Stake (PoS) consensus relies on validators locking up ('staking') currency as collateral for the right to validate transactions and propose blocks. This level simulates PoS voting. You need to stake tokens and vote correctly for multiple consecutive blocks to reach consensus and finalize them.",
    relevantFunctions: ["stakeTokens", "submitVote", "unstake"],
    concepts: ["Proof-of-Stake (PoS)", "Staking", "Consensus Mechanisms", "Block Finalization", "Validators"],
  }
};
// --- End Data ---


const Levels = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isConnected, account } = useWeb3();  // Removed contracts - assuming addresses are managed elsewhere or passed down
  const { playerLevel, refreshState } = useGame();

  const [activeStep, setActiveStep] = useState(0); // 0: Learn, 1: Quiz, 2: Challenge, 3: Completed
  const [levelDetails, setLevelDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isLevelCompletedState, setIsLevelCompletedState] = useState(false); // Renamed to avoid conflict

  // State for conceptual questions
  const [conceptQuestions, setConceptQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [conceptErrors, setConceptErrors] = useState({});

  // State for remote script information
  const [scriptCode, setScriptCode] = useState('');
  const [interfaceCode, setInterfaceCode] = useState('');

  // State for deployed contracts
  const [deployedContracts, setDeployedContracts] = useState({});
  // Add these state variables
  const [isDeploying, setIsDeploying] = useState(false);
  const [showContracts, setShowContracts] = useState(false);

  const handleShowContracts = async () => {
    setIsDeploying(true);

    // Simulate deployment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsDeploying(false);
    setShowContracts(true);
  };

  const levelId = parseInt(id);

  useEffect(() => {
    setIsLoading(true);
    setError(null); // Reset error on level change
    setActiveStep(0); // Reset step on level change
    setQuizPassed(false);
    setQuizSubmitted(false);
    setQuestionAnswers({});
    setConceptErrors({});
    setIsLevelCompletedState(false); // Reset completion state
    console.log("Connected:", isConnected, "Account:", account);
    console.log("Level ID:", levelId, "Player Level:", playerLevel);
    if (!isConnected) {
      navigate('/game'); // Redirect if not connected
      return;
    }

    // Validate levelId
    if (isNaN(levelId) || !levelDetailsData[levelId]) {
      setError("Invalid level ID.");
      setIsLoading(false);
      return;
    }

    // Check if player has unlocked this level
    if (levelId > playerLevel + 1) {
      setError("You haven't unlocked this level yet.");
      setIsLoading(false);
      // Optional: Redirect back to game or last unlocked level
      // navigate('/game');
      return;
    }

    const details = levelDetailsData[levelId];
    setLevelDetails(details);

    // Set questions, answers, script, interface
    const questions = levelQuestions[levelId] || [];
    setConceptQuestions(questions);
    const initialAnswers = {};
    questions.forEach(q => { initialAnswers[q.id] = ''; });
    setQuestionAnswers(initialAnswers);

    setScriptCode(scriptTemplates[levelId] || '// Script template not found.');
    setInterfaceCode(levelInterfaces[levelId] || '// Interface not found.');

    // Check if already completed
    if (playerLevel >= levelId) {
      setIsLevelCompletedState(true);
      // If completed, maybe skip directly to challenge or show completed state?
      // For now, let's allow reviewing steps but mark as completed.
      // To skip quiz if already completed:
      // setQuizPassed(true);
      // setActiveStep(2); // Skip to challenge step if completed
    }

    setIsLoading(false);

  }, [levelId, isConnected, playerLevel, navigate]); // Dependencies for effect

  const handleQuizSubmit = () => {
    let correctCount = 0;
    const errors = {};
    let allAnswered = true;

    conceptQuestions.forEach(question => {
      const userAnswer = questionAnswers[question.id]?.trim(); // Trim text answers

      if (userAnswer === undefined || userAnswer === '') {
        allAnswered = false;
        errors[question.id] = 'Please provide an answer.';
        return; // Skip checking correctness if not answered
      }

      let isCorrect = false;
      if (question.type === 'text') {
        // Case-insensitive, check if user answer includes the core part of the correct answer
        isCorrect = userAnswer.toLowerCase().includes(question.correctAnswer.toLowerCase());
        if (!isCorrect) errors[question.id] = `Incorrect. Hint: ${question.correctAnswer}`;
      } else { // options type
        // Ensure userAnswer is compared as a number if correctAnswer is a number
        isCorrect = parseInt(userAnswer) === question.correctAnswer;
        if (!isCorrect) {
          const correctOptionText = question.options[question.correctAnswer];
          errors[question.id] = `Incorrect. Correct answer relates to: "${correctOptionText}"`;
        }
      }

      if (isCorrect) {
        correctCount++;
      }
    });

    setConceptErrors(errors);
    setQuizSubmitted(true); // Mark as submitted regardless of completion

    if (!allAnswered) {
      setQuizPassed(false); // Cannot pass if not all answered
      setError("Please answer all questions before submitting.");
      return;
    }
    setError(null); // Clear general error if all were answered

    // Pass if score is high enough (e.g., 75%)
    const passThreshold = Math.ceil(conceptQuestions.length * 0.75);
    const passed = correctCount >= passThreshold;
    setQuizPassed(passed);

    // If passed, automatically move to the next step (Challenge)
    if (passed) {
      setActiveStep(2); // Move to challenge step
    }
  };

  const handleQuizAnswerChange = (questionId, value) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    // Clear specific error when user changes answer
    if (conceptErrors[questionId]) {
      setConceptErrors(prev => ({ ...prev, [questionId]: undefined }));
    }
    // Clear general error when user interacts
    if (error) setError(null);
  };

  // Function to be called by the actual challenge component upon success
  const handleChallengeComplete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Here you might trigger a transaction or check final state via Web3Context/GameContext
      // For now, just refresh the player's state from the context
      // await window.location.reload();
      setIsLevelCompletedState(true); // Mark level as completed in local state
      setActiveStep(3); // Move to final "Completed" step
      setShowCompletion(true); // Show dialog
    } catch (err) {
      setError("Failed to verify level completion. Please check console and try again.");
      console.error("Completion error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeployContracts = async () => {
    setIsDeploying(true);
    setError(null);

    setDeployedContracts(contracts);
  };

  // Navigation for the completion dialog
  const handleDialogClose = () => setShowCompletion(false);
  const handleNextLevelNavigation = () => {
    setShowCompletion(false);
    if (levelId < 5) { // Assuming 5 levels total
      navigate(`/level/${levelId + 1}`);
    } else {
      navigate('/game'); // Go back to main game page after last level
    }
  };


  // --- Render Logic ---

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/game')}
        >
          Back to Game Hub
        </Button>
      </Box>
    );
  }

  if (!levelDetails) {
    // This case should ideally be covered by the loading/error states, but as a fallback:
    return <Box sx={{ p: 3 }}><Alert severity="warning">Level details not loaded.</Alert></Box>;
  }

  // Determine steps based on current state
  const steps = levelDetails.steps || ["Learn", "Quiz", "Challenge", "Completed"];
  let currentVisibleStep = activeStep;
  // If completed, show the last step visually, but content might depend on review
  if (isLevelCompletedState && activeStep < steps.length - 1) {
    // Allow review, but maybe visually indicate completion differently
    // currentVisibleStep = steps.length - 1; // Or keep activeStep for review
  }


  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}> {/* Responsive padding */}
      {/* Header */}
      <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Typography variant="h4" component="h1">
            Level {levelId}: {levelDetails.title}
          </Typography>
          {isLevelCompletedState && (
            <Chip icon={<CheckCircle />} label="Completed" color="success" variant="outlined" />
          )}
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          {levelDetails.description}
        </Typography>
        <Stepper activeStep={currentVisibleStep} alternativeLabel sx={{ mb: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Main Content Area */}
      <Grid container spacing={3}>
        <Grid item xs={12}> {/* Changed to full width for step content */}
          {/* Step 0: Learn Concepts */}
          {activeStep === 0 && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <School sx={{ mr: 1 }} /> {steps[0]}: Concepts & Functions
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                {levelDetails.tutorial}
              </Typography>

              <Typography variant="h6" gutterBottom>Relevant Functions (Contract Interface)</Typography>
              <Paper variant="outlined" sx={{ p: 1.5, mb: 3, bgcolor: 'grey.100', overflowX: 'auto' }}>
                <pre><code>{interfaceCode}</code></pre>
              </Paper>

              <Typography variant="h6" gutterBottom>Key Concepts</Typography>
              <Box sx={{ mb: 3 }}>
                {(levelDetails.concepts || []).map((concept, index) => (
                  <Chip key={index} label={concept} variant="outlined" sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>

              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                endIcon={<ArrowForward />}
              >
                Go to Quiz
              </Button>
            </Paper>
          )}

          {/* Step 1: Conceptual Quiz */}
          {activeStep === 1 && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Quiz sx={{ mr: 1 }} /> {steps[1]}: Test Your Understanding
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" paragraph>
                Answer the questions below to ensure you grasp the key concepts before tackling the challenge.
                You need to get ~75% correct to proceed.
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              {quizSubmitted && !quizPassed && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Some answers are incorrect. Please review the concepts and try again. Check the hints below each question.
                </Alert>
              )}
              {quizSubmitted && quizPassed && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Great job! You've passed the conceptual quiz.
                </Alert>
              )}

              <Box component="form" noValidate autoComplete="off">
                <Grid container spacing={3}>
                  {conceptQuestions.map((question, index) => (
                    <Grid item xs={12} key={question.id}>
                      <Typography variant="subtitle1" gutterBottom>
                        {index + 1}. {question.question}
                      </Typography>
                      {question.type === 'text' ? (
                        <TextField
                          fullWidth
                          label="Your answer"
                          value={questionAnswers[question.id] || ''}
                          onChange={(e) => handleQuizAnswerChange(question.id, e.target.value)}
                          error={!!conceptErrors[question.id]}
                          helperText={conceptErrors[question.id] || ' '} // Add space to maintain height
                          disabled={quizPassed} // Disable if passed
                          variant="outlined"
                          margin="dense"
                        />
                      ) : (
                        <FormControl component="fieldset" error={!!conceptErrors[question.id]} sx={{ width: '100%' }}>
                          <RadioGroup
                            value={questionAnswers[question.id] || ''}
                            onChange={(e) => handleQuizAnswerChange(question.id, e.target.value)}
                          >
                            {question.options.map((option, idx) => (
                              <FormControlLabel
                                key={idx}
                                value={idx.toString()} // Value should be string to match state/comparison
                                control={<Radio disabled={quizPassed} />} // Disable if passed
                                label={option}
                                disabled={quizPassed} // Disable label too
                              />
                            ))}
                          </RadioGroup>
                          {conceptErrors[question.id] && (
                            <Typography variant="caption" color="error" sx={{ ml: 2 }}> {/* Indent helper text */}
                              {conceptErrors[question.id]}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Button variant="outlined" onClick={() => setActiveStep(0)}>
                    Back to Concepts
                  </Button>
                  {quizPassed ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setActiveStep(2)} // Move to Challenge step
                      endIcon={<ArrowForward />}
                    >
                      Proceed to Challenge
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleQuizSubmit}
                    >
                      Submit Answers
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          )}

          {/* Step 2: Solve the Challenge (Only shown if Quiz Passed) */}
          {activeStep === 2 && quizPassed && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Terminal sx={{ mr: 1 }} /> {steps[2]}: The Challenge
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>
                Now it's time to apply your knowledge! Use the script template below to interact
                with the level's smart contract and achieve the objective.
                You'll likely need to:
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>Fill in necessary details (like contract addresses, private keys from environment variables).</li>
                  <li>Understand the logic in the script template.</li>
                  <li>Potentially modify the script to generate the correct inputs or call sequences.</li>
                  <li>Run the script using Node.js against the correct network (testnet or local).</li>
                </Box>
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleShowContracts}
                    disabled={isDeploying}
                    startIcon={isDeploying ? <CircularProgress size={20} /> : null}
                    sx={{ mb: 2 }}
                  >
                    {isDeploying ? "Loading Contracts..." : "Show Contract Details"}
                  </Button>

                  {showContracts && (
                    <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Contract Details
                      </Typography>

                      {/* Main Game Contract */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" color="primary">
                          {contractInfo.BlockchainGuardian.name}
                        </Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          Address: {contractInfo.BlockchainGuardian.address}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                          Utility Functions:
                        </Typography>
                        <List dense>
                          {contractInfo.BlockchainGuardian.utilityFunctions.map((func, i) => (
                            <ListItem key={i}>
                              <ListItemText primary={func} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>

                      {/* Current Level Contract */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" color="primary">
                          {contractInfo[`Level${levelId}`].name}
                        </Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          Address: {contractInfo[`Level${levelId}`].address}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                          Main Functions:
                        </Typography>
                        <List dense>
                          {contractInfo[`Level${levelId}`].mainFunctions.map((func, i) => (
                            <ListItem key={i}>
                              <ListItemText primary={func} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Paper>
                  )}
                </Box>

                {Object.keys(deployedContracts).length > 0 && (
                  <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Deployed Contracts
                    </Typography>

                    {Object.entries(deployedContracts).map(([key, contract]) => (
                      <Box key={key} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" color="primary">
                          {contract.name}
                        </Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          Address: {contract.address}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                          Main Functions:
                        </Typography>
                        <List dense>
                          {contractInfo[key === 'guardian' ? 'BlockchainGuardian' : `Level${levelId}`]
                            ?.mainFunctions?.map((func, i) => (
                              <ListItem key={i}>
                                <ListItemText primary={func} />
                              </ListItem>
                            ))}
                        </List>
                        {key === 'guardian' && (
                          <>
                            <Typography variant="subtitle2">
                              Utility Functions:
                            </Typography>
                            <List dense>
                              {contractInfo.BlockchainGuardian.utilityFunctions.map((func, i) => (
                                <ListItem key={i}>
                                  <ListItemText primary={func} />
                                </ListItem>
                              ))}
                            </List>
                          </>
                        )}
                      </Box>
                    ))}
                  </Paper>
                )}
              </Box>

              <Typography variant="h6" gutterBottom>Challenge Script Template</Typography>
              <CodeEditor
                value={scriptCode}
                language="javascript"
                height="400px"
                onChange={(value) => setScriptCode(value || '')} // Update script code state if editable
                readOnly={false} // Make editor editable if needed
              />

              {/* Placeholder for actual interaction/completion logic */}
              {/* This might involve calling a function from a specific level component */}
              {/* or having a button that triggers the check */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Button variant="outlined" onClick={() => setActiveStep(1)}>
                  Back to Quiz
                </Button>
                {/* Replace this button with actual completion trigger */}
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleChallengeComplete} // Trigger completion check/process
                  endIcon={<Check />}
                  disabled={isLoading} // Disable while processing completion
                >
                  {isLoading ? <CircularProgress size={24} /> : "Verify Completion"}
                </Button>
              </Box>
            </Paper>
          )}
          {/* Message if trying to access challenge before passing quiz */}
          {activeStep === 2 && !quizPassed && (
            <Alert severity="warning">
              You must pass the conceptual quiz before attempting the challenge. Please go back and submit the correct answers.
              <Button onClick={() => setActiveStep(1)} size="small" sx={{ ml: 2 }}>Go to Quiz</Button>
            </Alert>
          )}


          {/* Step 3: Completed */}
          {activeStep === 3 && isLevelCompletedState && (
            <Alert severity="success">
              <AlertTitle>Level {levelId} Complete!</AlertTitle>
              Congratulations! You have successfully completed this level.
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextLevelNavigation}
                sx={{ mt: 2, display: 'block' }}
                endIcon={<ArrowForward />}
              >
                {levelId < 5 ? `Continue to Level ${levelId + 1}` : "Back to Game Hub"}
              </Button>
            </Alert>
          )}

        </Grid>
      </Grid>

      {/* Completion Dialog */}
      <CompletionDialog
        open={showCompletion}
        onClose={handleDialogClose}
        levelId={levelId}
        onNextLevel={handleNextLevelNavigation}
      />
    </Box>
  );
};

export default Levels;