// src/pages/RemoteExecution.jsx
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
  TextField,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ArrowForward,
  Check,
  Code,        // Used in CodeEditor display
  Terminal,    // Used for command examples
  Science,     // Could represent 'Toolbox' or 'Environment'
  Folder,      // Used for directory structure
  Assignment,  // Used for contract/file listing
  PlayArrow    // Used for Go to Game button
} from '@mui/icons-material';

// Assuming CodeEditor component exists and is imported correctly
import CodeEditor from '../components/game/CodeEditor';

const RemoteExecution = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // State for environment setup quiz
  const [setupAnswers, setSetupAnswers] = useState({
    q1: '',
    q2: '',
    q3: ''
  });

  const [setupSubmitted, setSetupSubmitted] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false); // Tracks if the quiz was passed

  // State for code examples
  const [hardhatConfigCode] = useState(`// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // Match your contracts' version
  networks: {
    // For local testing with Hardhat node
    hardhat: {
      chainId: 31337
    },
    // For testnet deployment/interaction (e.g., Sepolia)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "", // Ensure variable name matches .env
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
    // Add other networks like mainnet if needed
  },
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    cache: "./cache",
    tests: "./test"
  },
  etherscan: { // Optional: for contract verification
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};`);

  const [dotEnvCode] = useState(`# .env file (Add this file to your .gitignore!)

# Your wallet private key (keep this secret!) - DO NOT prefix with 0x
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix

# RPC URL for the network you want to connect to (e.g., Sepolia testnet)
# Get one from Infura (infura.io) or Alchemy (alchemy.com)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_or_alchemy_project_id

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Deployed contract addresses (replace with actual addresses)
GAME_CONTRACT_ADDRESS=0x...
LEVEL1_CONTRACT_ADDRESS=0x...
LEVEL2_CONTRACT_ADDRESS=0x...
LEVEL3_CONTRACT_ADDRESS=0x...
LEVEL4_CONTRACT_ADDRESS=0x...
LEVEL5_CONTRACT_ADDRESS=0x...
`);

  const [scriptCode] = useState(`// scripts/solveLevel1.js Example
const { ethers } = require("hardhat"); // Or require("ethers") if using ethers directly
require("dotenv").config();

async function main() {
  console.log("Solving Level 1: Genesis Signer Challenge");

  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL); // Or your default provider if not using hardhat env
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const level1Address = process.env.LEVEL1_CONTRACT_ADDRESS;
  if (!level1Address) {
    throw new Error("Please set LEVEL1_CONTRACT_ADDRESS in your .env file");
  }
  console.log("Using account:", signer.address);
  console.log("Attempting to interact with Level 1 Contract:", level1Address);

  // You'll need the ABI for Level1Genesis
  // Example: const Level1Genesis_ABI = require('../artifacts/contracts/Level1Genesis.sol/Level1Genesis.json').abi;
  // OR use an interface: const Level1Genesis = await ethers.getContractFactory("ILevel1Genesis");
  // Replace this line with actual ABI loading or interface usage
  const Level1Genesis_ABI = [ /* --- PASTE LEVEL 1 ABI HERE --- */ ];
  const level1Contract = new ethers.Contract(level1Address, Level1Genesis_ABI, signer);

  const message = "Approve Level 1"; // The specific message might vary
  const messageHash = ethers.utils.id(message); // Standard keccak256 hash
  console.log("Message to sign:", message);
  console.log("Message hash:", messageHash);

  // Sign the hash for compatibility with ecrecover expecting eth_sign format hash
  const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
  console.log("Generated Signature:", signature);

  console.log("Submitting signature to contract via verifySignatureBytes...");
  const tx = await level1Contract.verifySignatureBytes(messageHash, signature);

  console.log("Transaction submitted:", tx.hash);
  console.log("Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());

  // Add checks here to confirm level completion if possible (e.g., query player level)
  console.log("Level 1 script executed. Check game contract for level completion.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });`);

  const handleSetupAnswerChange = (question, value) => {
    setSetupAnswers({
      ...setupAnswers,
      [question]: value
    });
  };

  const handleSetupSubmit = () => {
    const correctAnswers = {
      q1: 'npm init -y && npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers dotenv',
      q2: 'npx hardhat run scripts/solveLevel1.js --network sepolia',
      q3: 'artifacts'
    };

    // More robust checks (allow variations)
    const q1Valid = setupAnswers.q1.includes('npm init') &&
      (setupAnswers.q1.includes('npm install') || setupAnswers.q1.includes('npm i')) &&
      setupAnswers.q1.includes('hardhat') &&
      setupAnswers.q1.includes('ethers') &&
      setupAnswers.q1.includes('dotenv');

    const q2Valid = setupAnswers.q2.includes('npx hardhat run') &&
      setupAnswers.q2.includes('--network');

    const q3Valid = setupAnswers.q3.trim().toLowerCase() === 'artifacts';

    const allValid = q1Valid && q2Valid && q3Valid;

    setSetupSubmitted(true);
    setSetupComplete(allValid); // Set completion state based on validity

    // Automatically move to next step if passed
    if (allValid) {
      handleNext();
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const gasLimit = () => {
    return 1000000; // Example gas limit, adjust as needed

  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    navigate('/game'); // Navigate back to the main game hub or overview page
  };

  const executionSteps = [
    {
      label: 'Setting Up Your Environment',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            To execute scripts that interact with smart contracts, you need a local development
            environment. We recommend using Node.js, npm (Node Package Manager), and Hardhat,
            a powerful Ethereum development framework.
          </Typography>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Setup Steps
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                1. Prerequisites
              </Typography>
              <Typography variant="body2" paragraph>
                Ensure you have these installed on your system:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Check fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Node.js (v16 or later recommended)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Check fontSize="small" /></ListItemIcon>
                  <ListItemText primary="npm (usually comes with Node.js)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Check fontSize="small" /></ListItemIcon>
                  <ListItemText primary="A code editor (like VS Code)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Check fontSize="small" /></ListItemIcon>
                  <ListItemText primary="A browser wallet (like MetaMask) funded with testnet ETH (e.g., Sepolia ETH)" />
                </ListItem>
              </List>
              {/* The misplaced list starting with Level 2 was removed from here */}

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                2. Create Project Folder & Initialize
              </Typography>
              <Typography variant="body2" paragraph>
                Open your terminal or command prompt, navigate to where you want to create your project, and run:
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                <code>
                  mkdir blockchain-guardian-solver<br />
                  cd blockchain-guardian-solver<br />
                  npm init -y
                </code>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                3. Install Dependencies
              </Typography>
              <Typography variant="body2" paragraph>
                Install Hardhat, its toolbox (which includes ethers.js and common plugins), and dotenv for environment variables:
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                <code>
                  npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers dotenv
                </code>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                4. Initialize Hardhat Project
              </Typography>
              <Typography variant="body2" paragraph>
                Run the Hardhat initializer:
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                <code>
                  npx hardhat init
                </code>
              </Box>
              <Typography variant="body2" paragraph>
                Choose "Create an empty hardhat.config.js" when prompted. This gives you a clean setup.
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                5. Create Project Folders
              </Typography>
              <Typography variant="body2" paragraph>
                Manually create these folders in your project root:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Folder fontSize="small" /></ListItemIcon>
                  <ListItemText primary="contracts/" secondary="Optional: For storing Solidity interfaces (.sol)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Folder fontSize="small" /></ListItemIcon>
                  <ListItemText primary="abis/" secondary="Optional: For storing contract ABIs (.json)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Folder fontSize="small" /></ListItemIcon>
                  <ListItemText primary="scripts/" secondary="Where your solution scripts (.js) will go" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Configuration
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                1. Configure `hardhat.config.js`
              </Typography>
              <Typography variant="body2" paragraph>
                Replace the contents of `hardhat.config.js` with the following configuration. This sets up Solidity version, network connections (local and testnet), and file paths.
              </Typography>
              <CodeEditor
                value={hardhatConfigCode}
                language="javascript"
                readOnly
                height="300px" // Adjusted height
              />

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                2. Create and Configure `.env` File
              </Typography>
              <Typography variant="body2" paragraph>
                Create a file named exactly `.env` in your project's root directory (the same level as `hardhat.config.js`). Add your sensitive information here. **Never share or commit this file!**
              </Typography>
              <CodeEditor
                value={dotEnvCode}
                language="plaintext" // Use plaintext or similar for .env
                readOnly
                height="250px" // Adjusted height
              />
              <Alert severity="warning" sx={{ mt: 2 }}>
                <AlertTitle>Security Warning</AlertTitle>
                Your `.env` file contains your private key. Keep it secret! Add `.env` to your `.gitignore` file immediately to prevent accidentally committing it.
              </Alert>
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom>
            Environment Setup Check
          </Typography>
          <Typography variant="body2" paragraph>
            Let's confirm your understanding of the setup:
          </Typography>

          {/* --- Setup Quiz --- */}
          {setupSubmitted ? (
            <Box sx={{ mb: 3 }}>
              <Alert severity={setupComplete ? "success" : "error"}> {/* Changed severity */}
                {setupComplete
                  ? "Setup understanding confirmed!"
                  : "Some answers seem incorrect. Please review the setup steps and commands."}
              </Alert>
              {!setupComplete && ( // Only show Try Again if not complete
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSetupSubmitted(false);
                    setSetupComplete(false); // Reset completion state too
                    // Keep answers so user can correct them
                  }}
                  sx={{ mt: 2 }}
                >
                  Try Again
                </Button>
              )}
            </Box>
          ) : (
            <Box component="form" noValidate autoComplete="off" sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="1. Command to init npm & install hardhat, toolbox, ethers, dotenv?"
                    value={setupAnswers.q1}
                    onChange={(e) => handleSetupAnswerChange('q1', e.target.value)}
                    variant="outlined"
                    margin="dense" // Use dense margin
                    multiline
                    rows={2} // Suggest 2 rows
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="2. Command to run 'scripts/solveLevel1.js' on Sepolia network?"
                    value={setupAnswers.q2}
                    onChange={(e) => handleSetupAnswerChange('q2', e.target.value)}
                    variant="outlined"
                    margin="dense"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="3. Default Hardhat directory for compiled contract artifacts?"
                    value={setupAnswers.q3}
                    onChange={(e) => handleSetupAnswerChange('q3', e.target.value)}
                    variant="outlined"
                    margin="dense"
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSetupSubmit}
                disabled={Object.values(setupAnswers).some(answer => !answer.trim())} // Disable if any answer is empty
                sx={{ mt: 2 }}
              >
                Check Setup Answers
              </Button>
            </Box>
          )}
        </Box>
      ),
    },
    {
      label: 'Creating Contract Interfaces (ABIs)', // Renamed for clarity
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            To interact with smart contracts programmatically, your script needs to know the contract's functions and how to call them. This is defined by the Application Binary Interface (ABI).
          </Typography>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What is an ABI?
              </Typography>
              <Typography variant="body2" paragraph>
                The ABI is essentially a list of the contract's public and external functions, events, and errors, including their names, parameter types, and return types. It's typically represented as a JSON array. Ethers.js uses the ABI to encode your function calls into the format the blockchain understands and decode the results.
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Obtaining and Using ABIs
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Option 1: Using Solidity Interfaces (with Hardhat)
              </Typography>
              <Typography variant="body2" paragraph>
                If using Hardhat, the easiest way is to define Solidity `interface` files in your `contracts/` directory. Hardhat compiles these and makes them available via `ethers.getContractFactory`.
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                Example: `contracts/ILevel1Genesis.sol`
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2, overflowX: 'auto' }}>
                <pre><code>
                  {`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILevel1Genesis {
  function getEthSignedMessageHash(bytes32 _messageHash) external pure returns (bytes32);
  // Ensure function signatures match the deployed contract exactly!
  function verifySignature(bytes32 txHash, uint8 v, bytes32 r, bytes32 s) external; // Assuming no return needed or handled internally
  function verifySignatureBytes(bytes32 messageHash, bytes memory signature) external;
}`}
                </code></pre>
              </Box>
              <Typography variant="body2" paragraph>
                You would then use it in your script like this:
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2, overflowX: 'auto' }}>
                <pre><code>
                  {`const Level1Interface = await ethers.getContractFactory("ILevel1Genesis");
const level1Contract = Level1Interface.attach(level1Address);`}
                </code></pre>
              </Box>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Option 2: Using JSON ABI Files
              </Typography>
              <Typography variant="body2" paragraph>
                Alternatively, you can get the ABI as a JSON file (e.g., from Etherscan if verified, or from compilation artifacts if you compiled the original source) and save it (e.g., in an `abis/` folder).
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Example: `abis/Level1Genesis.json` (Partial)
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2, overflowX: 'auto' }}>
                <pre><code>
                  {`[
  {
    "inputs": [ { "internalType": "bytes32", "name": "messageHash", ... }, ... ],
    "name": "verifySignatureBytes",
    "outputs": [], // Assuming no outputs
    "stateMutability": "nonpayable", // Or "view", "pure"
    "type": "function"
  }, ...
]`}
                </code></pre>
              </Box>
              <Typography variant="body2" paragraph>
                Use it in your script:
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2, overflowX: 'auto' }}>
                <pre><code>
                  {`const Level1GenesisABI = require('../abis/Level1Genesis.json'); // Or use fs.readFileSync
const level1Contract = new ethers.Contract(level1Address, Level1GenesisABI, signer);`}
                </code></pre>
              </Box>
            </CardContent>
          </Card>

          {/* Contract Address Listing - Corrected and Completed */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Blockchain Guardian Contract Addresses</Typography>
              <Typography variant="body2" paragraph>
                You will need the deployed addresses of the game contracts on the target network (e.g., Sepolia Testnet). Store these in your `.env` file. **Note: Replace the placeholder addresses below with the actual deployed addresses.**
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Assignment fontSize="small" color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Main Game Contract (BlockchainGuardianGame)"
                    secondary="Tracks progress, mints NFTs (Use GAME_CONTRACT_ADDRESS in .env)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assignment fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Level 1 (Level1Genesis)"
                    secondary="ECDSA Challenge (Use LEVEL1_CONTRACT_ADDRESS in .env)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assignment fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Level 2 (Level2HashFortress)"
                    secondary="Hashing Challenge (Use LEVEL2_CONTRACT_ADDRESS in .env)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assignment fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Level 3 (Level3MerkleMaze)"
                    secondary="Merkle Proof Challenge (Use LEVEL3_CONTRACT_ADDRESS in .env)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assignment fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Level 4 (Level4ReentrancyLabyrinth)"
                    secondary="Reentrancy Challenge (Use LEVEL4_CONTRACT_ADDRESS in .env)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assignment fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Level 5 (Level5ConsensusArena)"
                    secondary="PoS Challenge (Use LEVEL5_CONTRACT_ADDRESS in .env)"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      ),
    },
    {
      label: 'Writing & Running Solution Scripts', // Combined Step
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            With your environment set up and contract interfaces ready, you can write scripts in the `scripts/` directory to solve each level.
          </Typography>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>General Script Structure</Typography>
              <Typography variant="body2" paragraph>Most scripts will follow a similar pattern:</Typography>
              <List dense>
                <li>Import necessary libraries (`ethers`, `dotenv`).</li>
                <li>Load environment variables (`process.env`).</li>
                <li>Set up provider and signer.</li>
                <li>Get contract address and ABI/interface.</li>
                <li>Create contract instance.</li>
                <li>Implement logic specific to the level's challenge.</li>
                <li>Call the required contract function(s).</li>
                <li>Wait for transaction confirmation (`await tx.wait()`).</li>
                <li>Log results and verify success.</li>
              </List>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Example Script (Level 1)</Typography>
              <Typography variant="body2" paragraph>
                This script demonstrates solving Level 1 by signing a message and verifying it on-chain. Remember to replace placeholder comments with actual ABIs.
              </Typography>
              <CodeEditor
                value={scriptCode} // Displaying the example script state
                language="javascript"
                readOnly
                height="450px" // Adjusted height
              />
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Running Your Scripts</Typography>
              <Typography variant="body2" paragraph>
                Use the Hardhat runtime environment to execute your scripts against a specific network defined in `hardhat.config.js`.
              </Typography>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Run on Testnet (e.g., Sepolia):
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2, overflowX: 'auto' }}>
                <code>
                  npx hardhat run scripts/your_script_name.js --network sepolia
                </code>
              </Box>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Run on Local Hardhat Node:
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2, overflowX: 'auto' }}>
                <code>
                  # In one terminal, start the node:
                  npx hardhat node

                  # In another terminal, run the script:
                  npx hardhat run scripts/your_script_name.js --network localhost
                </code>
              </Box>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Run by Forking Testnet (Recommended for Testing):
              </Typography>
              <Typography variant="body2" paragraph>
                Modify your `hardhat.config.js` under `networks.hardhat` to include forking:
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2, overflowX: 'auto' }}>
                <pre><code>
                  {`hardhat: {
  chainId: 31337,
  forking: {
    url: process.env.SEPOLIA_RPC_URL || "", // Or mainnet etc.
    // blockNumber: 1234567 // Optional: Fork from a specific block
  }
}`}
                </code></pre>
              </Box>
              <Typography variant="body2" paragraph>
                Then start the node and run against `localhost` as above. This simulates the testnet state locally.
              </Typography>
            </CardContent>
          </Card>

          {/* Removed the redundant 'Solution Tips' Alert as hints are better placed within each Level page */}

        </Box>
      ),
    },
    {
      label: 'Debugging Tips', // Renamed for clarity
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Blockchain development can involve tricky debugging. Here are common issues and techniques.
          </Typography>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Common Problems & Solutions</Typography>
              <Grid container spacing={3}>
                {/* ... (Keep the debugging Grid items as they were - they seem fine) ... */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>1. Transaction Reverted</Typography>
                  <Typography variant="body2">Reason: Contract logic failed (require statement, math error, etc.).</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Debug:</Typography>
                  <List dense sx={{ pl: 1 }}>
                    <li>Check `require` messages in contract code.</li>
                    <li>Verify function parameters in your script.</li>
                    <li>Use Hardhat console (`npx hardhat console`) to interact step-by-step.</li>
                    <li>Add detailed error reasons in catch blocks (see below).</li>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>2. Gas Issues (Estimation Failed / Out of Gas)</Typography>
                  <Typography variant="body2">Reason: Often hides an underlying revert; sometimes complex loops/storage use too much gas.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Debug:</Typography>
                  <List dense sx={{ pl: 1 }}>
                    <li>Treat as a likely revert first (see point 1).</li>
                    <li>Manually set a higher gas limit in the transaction options {"{ gasLimit: 1000000 }"} to rule out simple limits.</li>
                    <li>Optimize contract code if gas usage is genuinely high.</li>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>3. Incorrect Address/Network</Typography>
                  <Typography variant="body2">Reason: Script points to wrong contract or network.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Debug:</Typography>
                  <List dense sx={{ pl: 1 }}>
                    <li>Treat as a likely revert first (see point 1).</li>
                    <li>Manually set a higher gas limit in the transaction options: {"{ gasLimit: 1000000 }"} to rule out simple limits.</li>
                    <li>Optimize contract code if gas usage is genuinely high.</li>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>4. ABI Mismatch / Function Not Found</Typography>
                  <Typography variant="body2">Reason: ABI used in script doesn't match the deployed contract.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Debug:</Typography>
                  <List dense sx={{ pl: 1 }}>
                    <li>Ensure your ABI (JSON or interface) is from the *exact* version of the deployed contract.</li>
                    <li>Verify function names, parameter types, and casing.</li>
                    <li>If using interfaces, recompile your Hardhat project (`npx hardhat clean && npx hardhat compile`).</li>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Debugging Techniques</Typography>
              {/* ... (Keep the debugging technique examples: Logging, Error Handling, Events) ... */}
              <Typography variant="subtitle1" gutterBottom>1. Console Logging</Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2, overflowX: 'auto' }}><pre><code>
                {`console.log("Address:", address);
 console.log("Value:", value.toString()); // Use toString() for BigNumbers`}
              </code></pre></Box>

              <Typography variant="subtitle1" gutterBottom>2. Detailed Error Handling</Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2, overflowX: 'auto' }}><pre><code>
                {`try {
   // ... transaction code ...
 } catch (error) {
   console.error("Error Reason:", error.reason); // Often gives Solidity revert reason
   console.error("Error Code:", error.code);
   console.error("Full Error:", error);
 }`}
              </code></pre></Box>

              <Typography variant="subtitle1" gutterBottom>3. Using Hardhat Network Helpers</Typography>
              <Typography variant="body2" paragraph>(Advanced) Hardhat lets you impersonate accounts, manipulate time, etc., on the local node for complex testing.</Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2, overflowX: 'auto' }}><pre><code>
                {`// In script or test:
 const helpers = require("@nomicfoundation/hardhat-network-helpers");
 await helpers.impersonateAccount(someAddress);
 const impersonatedSigner = await ethers.getSigner(someAddress);
 // Now send transactions as 'someAddress'`}
              </code></pre></Box>
            </CardContent>
          </Card>

          <Alert severity="success" sx={{ mt: 3 }}>
            <AlertTitle>Ready to Begin!</AlertTitle>
            <Typography variant="body2">
              You're now equipped to set up your environment, write scripts, and debug interactions for the Blockchain Guardian challenges. Head back to the main game page to start tackling the levels!
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={handleComplete}
              endIcon={<PlayArrow />}
              sx={{ mt: 2 }}
            >
              Go to Game Levels
            </Button>
          </Alert>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}> {/* Responsive Padding */}
      <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Remote Execution Setup Guide
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Prepare your local environment to write and run scripts that interact with the Blockchain Guardian contracts.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {executionSteps.map((step, index) => (
            <Step key={step.label} expanded={true}> {/* Keep steps expanded */}
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {step.content}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid lightgrey' }}> {/* Separator */}
                    <div>
                      {/* Show 'Finish' only on the last step, 'Continue' otherwise */}
                      {index === executionSteps.length - 1 ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleComplete} // Go back to game on Finish
                          sx={{ mt: 1, mr: 1 }}
                          endIcon={<PlayArrow />}
                        >
                          Finish Setup & Go to Game
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          // Disable Continue for first step if setup quiz isn't passed
                          disabled={index === 0 && !setupComplete}
                          endIcon={<ArrowForward />}
                        >
                          Continue
                        </Button>
                      )}
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

        {/* Redundant completion message if last step button handles it */}
        {/* {activeStep === executionSteps.length && ( ... )} */}
      </Paper>
    </Box>
  );
};

export default RemoteExecution;