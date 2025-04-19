const web3 = require('web3');
// Web3 or ethers.js would be needed for a full implementation
function mineHashSolution(targetPrefix) {
    // Remove "0x" and keep only the first 8 characters (4 bytes)
    const prefix = targetPrefix.startsWith('0x') ? targetPrefix.slice(2, 10) : targetPrefix.slice(0, 8);
    
    let attempts = 0;
    let found = false;
    let solution;
    
    while (!found) {
      // Generate a random 32-byte hex string
      solution = '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Hash the solution using keccak256
      // Note: In a browser environment, you'd use a library like ethers.js or web3.js
      // This is a placeholder for the actual hashing function
      const hash = web3.utils.keccak256(web3.eth.abi.encodeParameters(['bytes32'], [solution]));
      
      // Check if the first 4 bytes match
      if (hash.slice(2, 10).toLowerCase() === prefix.toLowerCase()) {
        found = true;
        console.log(`Found solution after ${attempts} attempts`);
        console.log(`Solution: ${solution}`);
        console.log(`Hash: ${hash}`);
      }
      
      attempts++;
      if (attempts % 1000 === 0) {
        console.log(`Tried ${attempts} solutions...`);
      }
    }
    
    return solution;
  }
  
  // Call with your target prefix
  mineHashSolution('0x1234567800000000000000000000000000000000000000000000000000000000');