// main.js - Core game logic
import { ethers } from 'ethers';
import { contractAddresses } from './config/addresses.js';
import gameABI from './abis/BlockchainGuardianGame.json';
import level1ABI from './abis/Level1Genesis.json';
import level2ABI from './abis/Level2HashFortress.json';
import level3ABI from './abis/Level3MerkleMaze.json';
import level4ABI from './abis/Level4ReentrancyLabyrinth.json';
import level5ABI from './abis/Level5ConsensusArena.json';

// Add this near the top of the file after imports
function showMessage(message) {
  const messageBox = document.getElementById('message-box');
  if (messageBox) {
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    // Hide message after 5 seconds
    setTimeout(() => {
      messageBox.style.display = 'none';
    }, 5000);
  } else {
    console.log('Message:', message);
  }
}

// Game configuration
// const config = {
//   gameContractAddress: '0x...', // Game contract address on Monad
//   networkRPC: 'https://rpc.monad.xyz', // Monad RPC endpoint
//   chainId: 324, // Monad chain ID
//   explorerURL: 'https://explorer.monad.xyz',
// };

const networks = {
  localhost: {
    name: 'Hardhat Local',
    rpcUrl: 'http://localhost:8545',
    chainId: 31337,
    explorerURL: '',
    // These addresses will be updated by the deployment script
    contracts: {
      gameContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default local hardhat address
      level1: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      level2: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      level3: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
      level4: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
      level5: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
    }
  },
  monad: {
    name: 'Monad Network',
    rpcUrl: 'https://rpc.monad.xyz',
    chainId: 324,
    explorerURL: 'https://explorer.monad.xyz',
    contracts: {
      gameContract: '', // Will be filled by post-deployment script
      level1: '',
      level2: '',
      level3: '',
      level4: '',
      level5: ''
    }
  }
};

// Current network - default to localhost for testing
let currentNetwork = networks.localhost;

// Try to load addresses from a configuration file if it exists
try {
  // Check if addresses.js file exists from deployment pipeline
  if (typeof contractAddresses !== 'undefined') {
    currentNetwork.contracts.gameContract = contractAddresses.BlockchainGuardianGame || currentNetwork.contracts.gameContract;
    currentNetwork.contracts.level1 = contractAddresses.Level1Genesis || currentNetwork.contracts.level1;
    currentNetwork.contracts.level2 = contractAddresses.Level2HashFortress || currentNetwork.contracts.level2;
    currentNetwork.contracts.level3 = contractAddresses.Level3MerkleMaze || currentNetwork.contracts.level3;
    currentNetwork.contracts.level4 = contractAddresses.Level4ReentrancyLabyrinth || currentNetwork.contracts.level4;
    currentNetwork.contracts.level5 = contractAddresses.Level5ConsensusArena || currentNetwork.contracts.level5;
    console.log('Loaded contract addresses from configuration file');
  }
} catch (e) {
  console.log('Using default contract addresses - no configuration file found');
}

// Game state
let gameState = {
  currentLevel: 0,
  player: null,
  provider: null,
  signer: null,
  gameContract: null,
  levelContracts: {},
  playerNFTs: [],
  securityPoints: 0,
  leaderboard: [],
};

// Initialize the game
async function initGame() {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      showMessage('Please install MetaMask to play Blockchain Guardian.');
      return false;
    }

    // Configure Monad network in MetaMask if not already added
    await setupMonadNetwork();

    // Initialize provider and signer
    gameState.provider = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    gameState.signer = gameState.provider.getSigner();
    gameState.player = await gameState.signer.getAddress();

    // Initialize game contract
    gameState.gameContract = new ethers.Contract(
      currentNetwork.contracts.gameContract,
      gameABI,
      gameState.signer
    );

    // Load player state
    await loadPlayerState();

    // Set up event listeners
    setupEventListeners();

    // Initialize UI
    updateUI();

    return true;
  } catch (error) {
    console.error('Error initializing game:', error);
    showMessage(`Error initializing game: ${error.message}`);
    return false;
  }
}

// Function to add Monad network to MetaMask
async function setupMonadNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${currentNetwork.chainId.toString(16)}`,
        chainName: currentNetwork.name,
        nativeCurrency: {
          name: 'Monad',
          symbol: 'MONAD',
          decimals: 18,
        },
        rpcUrls: [currentNetwork.rpcUrl], // Fix: use the rpcUrl from network config
        blockExplorerUrls: [currentNetwork.explorerURL],
      }],
    });
    return true;
  } catch (error) {
    console.error('Error adding Monad network:', error);
    return false;
  }
}

// Load player's current state
async function loadPlayerState() {
  try {
    // Get player's current level
    gameState.currentLevel = await gameState.gameContract.playerLevel(gameState.player);
    gameState.currentLevel = gameState.currentLevel.toNumber();

    // Get player's security points
    gameState.securityPoints = await gameState.gameContract.securityPoints(gameState.player);
    gameState.securityPoints = gameState.securityPoints.toNumber();

    // Get level contract addresses
    for (let i = 1; i <= 10; i++) {
      const levelAddress = await gameState.gameContract.levelContracts(i);
      if (levelAddress !== ethers.constants.AddressZero) {
        let levelABI;
        switch (i) {
          case 1: levelABI = level1ABI; break;
          case 2: levelABI = level2ABI; break;
          case 3: levelABI = level3ABI; break;
          case 4: levelABI = level4ABI; break;
          case 5: levelABI = level5ABI; break;
          // Add cases for levels 6-10 as they're implemented
          default: continue;
        }
        
        gameState.levelContracts[i] = new ethers.Contract(
          levelAddress,
          levelABI,
          gameState.signer
        );
      }
    }

    // Load player's NFTs
    await loadPlayerNFTs();

    // Load leaderboard
    await loadLeaderboard();
  } catch (error) {
    console.error('Error loading player state:', error);
    showMessage(`Error loading player state: ${error.message}`);
  }
}

// Load player's NFTs
async function loadPlayerNFTs() {
  try {
    // Get NFT balance
    const balance = await gameState.gameContract.balanceOf(gameState.player);
    
    // Get all NFT IDs
    gameState.playerNFTs = [];
    for (let i = 0; i < balance; i++) {
      const tokenId = await gameState.gameContract.tokenOfOwnerByIndex(gameState.player, i);
      // In a full implementation, we would fetch NFT metadata here
      gameState.playerNFTs.push({
        tokenId: tokenId.toNumber(),
        // Add metadata fields here
      });
    }
  } catch (error) {
    console.error('Error loading NFTs:', error);
  }
}

// Load game leaderboard
async function loadLeaderboard() {
  try {
    // Get top 10 players
    const topPlayers = await gameState.gameContract.getTopPlayers(10);
    gameState.leaderboard = topPlayers.map(player => ({
      address: player.wallet,
      levelsCompleted: player.levelsCompleted.toNumber(),
      securityPoints: player.securityPoints.toNumber(),
      totalGasUsed: player.totalGasUsed.toNumber(),
      lastUpdate: new Date(player.lastUpdate.toNumber() * 1000),
    }));
  } catch (error) {
    console.error('Error loading leaderboard:', error);
  }
}

// Set up contract event listeners
function setupEventListeners() {
  gameState.gameContract.on('LevelCompleted', async (player, level, gasUsed, event) => {
    if (player.toLowerCase() === gameState.player.toLowerCase()) {
      showMessage(`Congratulations! You completed Level ${level}!`);
      await loadPlayerState();
      updateUI();
    }
  });

  gameState.gameContract.on('NFTMinted', async (player, tokenId, level, event) => {
    if (player.toLowerCase() === gameState.player.toLowerCase()) {
      showMessage(`You received a new NFT certificate for Level ${level}!`);
      await loadPlayerNFTs();
      updateUI();
    }
  });

  gameState.gameContract.on('LeaderboardUpdated', async (player, levelsCompleted, securityPoints, event) => {
    await loadLeaderboard();
    updateUI();
  });
}

// Start the current level
async function startLevel(levelNumber) {
  try {
    if (!gameState.levelContracts[levelNumber]) {
      showMessage(`Level ${levelNumber} is not available yet.`);
      return false;
    }

    // Update UI to show level
    document.getElementById('game-container').innerHTML = getLevelHTML(levelNumber);
    
    // Initialize level-specific UI and logic
    initializeLevelUI(levelNumber);
    
    return true;
  } catch (error) {
    console.error(`Error starting level ${levelNumber}:`, error);
    showMessage(`Error starting level: ${error.message}`);
    return false;
  }
}

// Level-specific UI and logic initialization
function initializeLevelUI(levelNumber) {
  switch (levelNumber) {
    case 1:
      initLevel1UI();
      break;
    case 2:
      initLevel2UI();
      break;
    case 3:
      initLevel3UI();
      break;
    case 4:
      initLevel4UI();
      break;
    case 5:
      initLevel5UI();
      break;
    // Add more levels as implemented
    default:
      showMessage(`Level ${levelNumber} UI not implemented yet.`);
  }
}

// Level 1: Transaction Signatures
function initLevel1UI() {
  const submitButton = document.getElementById('level1-submit');
  if (submitButton) {
    submitButton.addEventListener('click', async () => {
      try {
        const txHash = document.getElementById('tx-hash').value;
        const v = parseInt(document.getElementById('v-value').value);
        const r = document.getElementById('r-value').value;
        const s = document.getElementById('s-value').value;
        
        // Convert inputs to correct format if needed
        const txHashBytes = ethers.utils.arrayify(txHash);
        const rBytes = ethers.utils.arrayify(r);
        const sBytes = ethers.utils.arrayify(s);
        
        showMessage('Verifying signature...');
        
        // Call the contract function
        const tx = await gameState.levelContracts[1].verifySignature(
          txHashBytes,
          v,
          rBytes,
          sBytes
        );
        
        await tx.wait();
        showMessage('Transaction confirmed! Waiting for level completion...');
      } catch (error) {
        console.error('Error in Level 1:', error);
        showMessage(`Error: ${error.message}`);
      }
    });
  }
}

// Level 2: Hash Fortress
function initLevel2UI() {
  const submitButton = document.getElementById('level2-submit');
  if (submitButton) {
    submitButton.addEventListener('click', async () => {
      try {
        const solution = document.getElementById('hash-solution').value;
        
        showMessage('Checking hash solution...');
        
        // Call the contract function
        const tx = await gameState.levelContracts[2].solveHashPuzzle(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes(solution))
        );
        
        await tx.wait();
        showMessage('Transaction confirmed! Waiting for level completion...');
      } catch (error) {
        console.error('Error in Level 2:', error);
        showMessage(`Error: ${error.message}`);
      }
    });
  }
}

// Level 3: Merkle Maze
function initLevel3UI() {
  const submitButton = document.getElementById('level3-submit');
  if (submitButton) {
    submitButton.addEventListener('click', async () => {
      try {
        const leaf = document.getElementById('merkle-leaf').value;
        const proofString = document.getElementById('merkle-proof').value;
        const index = parseInt(document.getElementById('merkle-index').value);
        
        // Parse the proof array
        const proof = JSON.parse(proofString);
        
        showMessage('Verifying Merkle proof...');
        
        // Call the contract function
        const tx = await gameState.levelContracts[3].verifyMerkleProof(
          proof.map(hash => ethers.utils.arrayify(hash)),
          ethers.utils.arrayify(leaf),
          index
        );
        
        await tx.wait();
        showMessage('Transaction confirmed! Waiting for level completion...');
      } catch (error) {
        console.error('Error in Level 3:', error);
        showMessage(`Error: ${error.message}`);
      }
    });
  }
}

// Level 4: Reentrancy Labyrinth
function initLevel4UI() {
  // UI elements
  const createExploitButton = document.getElementById('create-exploit');
  const deployExploitButton = document.getElementById('deploy-exploit');
  const checkExploitButton = document.getElementById('check-exploit');
  const validateSolutionButton = document.getElementById('validate-solution');
  
  // Exploit contract code editor
  const exploitCodeEditor = document.getElementById('exploit-code');
  let deployedExploitAddress = null;
  
  if (createExploitButton) {
    createExploitButton.addEventListener('click', () => {
      // Template for exploit contract
      exploitCodeEditor.value = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVulnerableContract {
    function deposit() external payable;
    function vulnerableWithdraw(uint256 amount) external;
}

contract ReentrancyExploit {
    IVulnerableContract public target;
    uint256 public attackAmount;
    
    constructor(address _target) payable {
        target = IVulnerableContract(_target);
        attackAmount = msg.value;
    }
    
    // Exploit function to trigger the reentrancy attack
    function exploit() external {
        // Make an initial deposit
        target.deposit{value: attackAmount}();
        
        // Trigger the vulnerable withdrawal
        target.vulnerableWithdraw(attackAmount);
    }
    
    // Fallback function that gets called when receiving ETH
    receive() external payable {
        // If there are still funds in the target, reenter
        if (address(target).balance >= attackAmount) {
            target.vulnerableWithdraw(attackAmount);
        }
    }
}`;
    });
  }
  
  if (deployExploitButton) {
    deployExploitButton.addEventListener('click', async () => {
      try {
        showMessage('Compiling and deploying exploit contract...');
        
        // In a real implementation, this would compile the contract
        // For demo purposes, we'll use a pre-compiled ABI and bytecode
        const exploitFactory = new ethers.ContractFactory(
          exploitABI, // This would be generated from the code
          exploitBytecode, // This would be generated from the code
          gameState.signer
        );
        
        const exploitContract = await exploitFactory.deploy(
          gameState.levelContracts[4].address,
          { value: ethers.utils.parseEther('0.1') }
        );
        
        await exploitContract.deployed();
        deployedExploitAddress = exploitContract.address;
        
        showMessage(`Exploit contract deployed at: ${deployedExploitAddress}`);
      } catch (error) {
        console.error('Error deploying exploit:', error);
        showMessage(`Error: ${error.message}`);
      }
    });
  }
  
  if (checkExploitButton) {
    checkExploitButton.addEventListener('click', async () => {
      try {
        if (!deployedExploitAddress) {
          showMessage('Please deploy your exploit contract first.');
          return;
        }
        
        showMessage('Checking exploit...');
        
        // Call the check exploit function
        const tx = await gameState.levelContracts[4].checkExploit(deployedExploitAddress);
        await tx.wait();
        
        showMessage('Exploit successful! Now fix the vulnerability in the secure withdraw function.');
      } catch (error) {
        console.error('Error checking exploit:', error);
        showMessage(`Error: ${error.message}`);
      }
    });
  }
  
  if (validateSolutionButton) {
    validateSolutionButton.addEventListener('click', async () => {
      try {
        showMessage('Validating secure solution...');
        
        // Deposit some funds first
        const depositTx = await gameState.levelContracts[4].deposit({ 
          value: ethers.utils.parseEther('0.1') 
        });
        await depositTx.wait();
        
        // Call validate solution
        const tx = await gameState.levelContracts[4].validateSolution();
        await tx.wait();
        
        showMessage('Transaction confirmed! Waiting for level completion...');
      } catch (error) {
        console.error('Error validating solution:', error);
        showMessage(`Error: ${error.message}`);
      }
    });
  }
}

// Level 5: Consensus Arena
function initLevel5UI() {
  const stakeButton = document.getElementById('stake-tokens');
  const voteButton = document.getElementById('submit-vote');
  const unstakeButton = document.getElementById('unstake-tokens');
  
  // Update consensus state
  async function updateConsensusState() {
    try {
      const currentBlock = await gameState.levelContracts[5].currentBlockId();
      const blockInfo = await gameState.levelContracts[5].blocks(currentBlock);
      const playerStake = await gameState.levelContracts[5].stake(gameState.player);
      
      document.getElementById('current-block').textContent = currentBlock.toString();
      document.getElementById('block-votes').textContent = `${blockInfo.totalVotes} / ${blockInfo.totalStake}`;
      document.getElementById('consensus-progress').textContent = 
        blockInfo.totalStake.gt(0) 
          ? `${blockInfo.totalVotes.mul(100).div(blockInfo.totalStake)}%` 
          : '0%';
      document.getElementById('player-stake').textContent = ethers.utils.formatEther(playerStake);
      
      // Schedule next update
      setTimeout(updateConsensusState, 5000);
    } catch (error) {
      console.error('Error updating consensus state:', error);
    }
  }
  
  // Initialize consensus state
  updateConsensusState();
  
  if (stakeButton) {
    stakeButton.addEventListener('click', async () => {
      try {
        const stakeAmount = document.getElementById('stake-amount').value;
        
        showMessage(`Staking ${stakeAmount} ETH...`);
        
        // Convert to wei
        const stakeWei = ethers.utils.parseEther(stakeAmount);
        
        // Call stake function
        const tx = await gameState.levelContracts[5].stakeTokens({
          value: stakeWei
        });
        
        await tx.wait();
        showMessage('Stake successful!');
        updateConsensusState();
      } catch (error) {
        console.error('Error staking tokens:', error);
        showMessage(`Error: ${error.message}`);
      }
    });
  }
  
  if (voteButton) {
    voteButton.addEventListener('click', async () => {
      try {
        const approval = document.getElementById('vote-approval').checked;
        
        showMessage(`Submitting vote (Approval: ${approval})...`);
        
        // Call vote function
        const tx = await gameState.levelContracts[5].submitVote(approval);
        
        await tx.wait();
        showMessage('Vote submitted!');
        updateConsensusState();
      } catch (error) {
        console.error('Error submitting vote:', error);
        showMessage(`Error: ${error.message}`);
      }
    });
  }
  
  if (unstakeButton) {
    unstakeButton.addEventListener('click', async () => {
      try {
        const unstakeAmount = document.getElementById('unstake-amount').value;
        
        showMessage(`Unstaking ${unstakeAmount} ETH...`);
        
        // Convert to wei
        const unstakeWei = ethers.utils.parseEther(unstakeAmount);
        
        // Call unstake function
        const tx = await gameState.levelContracts[5].unstake(unstakeWei);
        
        await tx.wait();
        showMessage('Unstake successful!');
        updateConsensusState();
      } catch (error) {
        console.error('Error unstaking tokens:', error);
        showMessage(`Error: ${error.message}`);
      }
    });
  }
}

export { initGame };