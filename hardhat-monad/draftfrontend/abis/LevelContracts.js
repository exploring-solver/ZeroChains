// LevelContracts.js - ABI loader for all level contracts
// This file loads the ABIs for all level contracts

// Create an object that will be available globally 
window.ContractABIs = window.ContractABIs || {};

// Function to load an ABI for a specific level
const loadLevelABI = (levelName) => {
  return fetch(`src/abis/${levelName}.json`)
    .then(response => response.json())
    .then(data => {
      window.ContractABIs[levelName] = data;
      console.log(`Loaded ${levelName} ABI`);
      return data;
    })
    .catch(error => {
      console.error(`Error loading ${levelName} ABI:`, error);
    });
};

// Load all level ABIs
Promise.all([
  loadLevelABI('Level1Genesis'),
  loadLevelABI('Level2HashFortress'),
  loadLevelABI('Level3MerkleMaze'),
  loadLevelABI('Level4ReentrancyLabyrinth'),
  loadLevelABI('Level5ConsensusArena')
])
.then(() => {
  // Dispatch an event when all ABIs are loaded
  const event = new CustomEvent('level-abis-loaded');
  window.dispatchEvent(event);
  console.log('All level ABIs loaded');
})
.catch(error => {
  console.error('Error loading level ABIs:', error);
});