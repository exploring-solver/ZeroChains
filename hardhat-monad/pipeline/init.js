#!/usr/bin/env node

/**
 * init.js - Initialize the Blockchain Guardian project structure
 * 
 * This script creates the necessary directory structure for the project
 * and initializes the frontend folder.
 * 
 * Usage: node init.js
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== INITIALIZING BLOCKCHAIN GUARDIAN PROJECT ===${colors.reset}\n`);

// Create necessary directories
const directories = [
  'contracts',
  'scripts',
  'test',
  'frontend',
  'frontend/src',
  'frontend/src/abis',
  'frontend/src/config',
  'frontend/src/components',
  'frontend/public'
];

function createDirectories() {
  console.log(`${colors.yellow}Creating directory structure...${colors.reset}`);
  
  directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
  });
  
  console.log(`${colors.green}✓ Directory structure created${colors.reset}\n`);
}

// Create .env file with template
function createEnvFile() {
  console.log(`${colors.yellow}Creating .env file template...${colors.reset}`);
  
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    const envContent = `# Blockchain Guardian Environment Configuration

# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
MONAD_RPC_URL=https://rpc.monad.xyz
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz

# Explorer API keys (if available)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
`;
    fs.writeFileSync(envPath, envContent);
    console.log(`Created: .env (template)`);
  } else {
    console.log(`.env file already exists`);
  }
  
  console.log(`${colors.green}✓ .env template created${colors.reset}\n`);
}

// Create frontend placeholder files
function createFrontendPlaceholders() {
  console.log(`${colors.yellow}Creating frontend placeholder files...${colors.reset}`);
  
  // Create a basic index.js in the frontend config folder
  const indexConfigPath = path.join(process.cwd(), 'frontend/src/config/index.js');
  if (!fs.existsSync(indexConfigPath)) {
    const indexConfigContent = `// Blockchain Guardian Frontend Configuration
// This file will be populated by the deployment pipeline

export const NETWORK_CONFIG = {
  chainId: 324, // Monad chain ID
  networkName: 'Monad Network',
  rpcUrl: 'https://rpc.monad.xyz',
  explorerUrl: 'https://explorer.monad.xyz'
};

// Placeholder for contract addresses - will be replaced by deployment pipeline
export const contractAddresses = {
  // Will be populated by post-deployment script
};
`;
    fs.writeFileSync(indexConfigPath, indexConfigContent);
    console.log(`Created: frontend/src/config/index.js (placeholder)`);
  } else {
    console.log(`frontend/src/config/index.js already exists`);
  }
  
  // Create a README in the abis folder
  const abiReadmePath = path.join(process.cwd(), 'frontend/src/abis/README.md');
  if (!fs.existsSync(abiReadmePath)) {
    const abiReadmeContent = `# Contract ABIs

This directory will be populated with contract ABIs during the deployment pipeline process.
Do not manually add files here as they will be overwritten.

The deployment pipeline will generate:
- Individual ABI JSON files for each contract
- An index.js file with imports for all ABIs
`;
    fs.writeFileSync(abiReadmePath, abiReadmeContent);
    console.log(`Created: frontend/src/abis/README.md`);
  } else {
    console.log(`frontend/src/abis/README.md already exists`);
  }
  
  console.log(`${colors.green}✓ Frontend placeholders created${colors.reset}\n`);
}

// Create a placeholder README for the project
function createReadme() {
  console.log(`${colors.yellow}Creating project README...${colors.reset}`);
  
  const readmePath = path.join(process.cwd(), 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# Blockchain Guardian

A Node Defense Game where players secure a distributed network by solving blockchain security puzzles.

## Getting Started

### Prerequisites

- Node.js and npm installed
- MetaMask or another Ethereum wallet
- Monad tokens for interacting with the game

### Installation

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Create a \`.env\` file with your configuration (see .env.example)

3. Compile the contracts:
   \`\`\`
   npm run compile
   \`\`\`

4. Deploy using the pipeline:
   \`\`\`
   npm run pipeline:localhost  # For local development
   npm run pipeline:monad      # For Monad mainnet
   \`\`\`

## Project Structure

- \`/contracts\`: Solidity smart contracts
- \`/scripts\`: Deployment and utility scripts
- \`/test\`: Contract tests
- \`/frontend\`: Web interface

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
`;
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`Created: README.md`);
  } else {
    console.log(`README.md already exists`);
  }
  
  console.log(`${colors.green}✓ Project README created${colors.reset}\n`);
}

// Initialize npm if package.json doesn't exist
function initializeNpm() {
  return new Promise((resolve, reject) => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.log(`${colors.yellow}Initializing npm project...${colors.reset}`);
      
      const npm = spawn('npm', ['init', '-y'], {
        stdio: 'inherit',
        shell: true
      });
      
      npm.on('close', (code) => {
        if (code !== 0) {
          console.error(`${colors.red}npm init failed with code ${code}${colors.reset}`);
          reject(new Error('npm init failed'));
          return;
        }
        
        console.log(`${colors.green}✓ npm project initialized${colors.reset}\n`);
        resolve();
      });
    } else {
      console.log(`${colors.yellow}package.json already exists, skipping npm init${colors.reset}\n`);
      resolve();
    }
  });
}

// Main function to run all initialization steps
async function main() {
  try {
    await initializeNpm();
    createDirectories();
    createEnvFile();
    createFrontendPlaceholders();
    createReadme();
    
    console.log(`${colors.bright}${colors.green}=== PROJECT INITIALIZATION COMPLETED SUCCESSFULLY ===${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`1. Update your .env file with your private key and RPC URLs`);
    console.log(`2. Install dependencies: npm install`);
    console.log(`3. Copy your contracts to the contracts/ directory`);
    console.log(`4. Run the deployment pipeline: npm run pipeline:localhost`);
    
  } catch (error) {
    console.error(`\n${colors.red}ERROR: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();