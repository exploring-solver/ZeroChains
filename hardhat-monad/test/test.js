const { ethers } = require("ethers");

async function main() {
  // Connect to the blockchain (e.g., via Infura, Alchemy, or local node)
  const provider = new ethers.providers.JsonRpcProvider("YOUR_RPC_URL");
  
  // Create a wallet instance (for signing transactions)
  const privateKey = "YOUR_PRIVATE_KEY"; // Keep this secure!
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Contract details
  const contractAddress = "0x123..."; // The deployed contract address
  const contractAbi = [ /* Contract ABI goes here */ ];
  
  // Create contract instance
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet);
  
  // Call a read-only function on the contract
  const result = await contract.someFunction();
  console.log("Result:", result);
  
  // Call a function that modifies state (requires transaction)
  const tx = await contract.someStateChangingFunction(param1, param2);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });