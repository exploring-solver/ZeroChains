#!/usr/bin/env node

/**
 * deploy-pipeline.js
 * 
 * Automated deployment pipeline that:
 * 1. Runs the contract deployment script
 * 2. Copies ABIs and addresses to the frontend
 * 
 * Usage: npm run deploy-pipeline -- --network <network-name>
 */

const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Get command line arguments - everything after --
const args = process.argv.slice(2);

// Default to localhost if no network specified
if (!args.includes('--network')) {
  args.push('--network', 'localhost');
}

console.log(`${colors.bright}${colors.cyan}=== BLOCKCHAIN GUARDIAN DEPLOYMENT PIPELINE ===${colors.reset}\n`);

// Step 1: Run deployment script
console.log(`${colors.yellow}Step 1: Deploying smart contracts...${colors.reset}`);

function runCommand(command, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.bright}> ${command} ${args.join(' ')}${colors.reset}`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
        return;
      }
      resolve();
    });
  });
}

// Main execution
async function main() {
  try {
    // Step 1: Deploy contracts
    await runCommand('npx', ['hardhat', 'run', 'scripts/deploy.ts', ...args]);
    console.log(`\n${colors.green}✓ Contracts deployed successfully${colors.reset}\n`);

    // Step 2: Run post-deployment script to update frontend
    console.log(`${colors.yellow}Step 2: Updating frontend configuration...${colors.reset}`);
    await runCommand('npx', ['hardhat', 'run', 'scripts/post-deploy.ts']);
    console.log(`\n${colors.green}✓ Frontend configuration updated successfully${colors.reset}\n`);

    console.log(`${colors.bright}${colors.green}=== DEPLOYMENT PIPELINE COMPLETED SUCCESSFULLY ===${colors.reset}`);

  } catch (error) {
    console.error(`\n${colors.red}ERROR: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();