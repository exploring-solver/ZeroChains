// BlockchainGuardianGame.js - ABI loader
// This file loads the ABI for the main game contract

// Create an object that will be available globally 
window.ContractABIs = window.ContractABIs || {};

// Fetch the ABI from the JSON file
fetch('src/abis/BlockchainGuardianGame.json')
  .then(response => response.json())
  .then(data => {
    // Store the ABI in the global object
    window.ContractABIs.BlockchainGuardianGame = data;
    console.log('Loaded BlockchainGuardianGame ABI');
  })
  .catch(error => {
    console.error('Error loading BlockchainGuardianGame ABI:', error);
  });