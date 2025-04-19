// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // Token parameters
  const name = "Simple Token";
  const symbol = "SIM";
  const decimals = 18;
  const initialSupply = 1000000; // 1 million tokens

  console.log("Deploying SimpleERC20Token...");
  
  // Deploy the contract
  const SimpleERC20Token = await ethers.getContractFactory("SimpleERC20Token");
  const token = await SimpleERC20Token.deploy(name, symbol, decimals, initialSupply);
  
  await token.waitForDeployment();
  
  const address = await token.getAddress();
  console.log(`SimpleERC20Token deployed to: ${address}`);
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Initial Supply: ${initialSupply} tokens`);
  
  // For verification
  console.log("\nContract details for verification:");
  console.log(`npx hardhat verify --network <network> ${address} "${name}" "${symbol}" ${decimals} ${initialSupply}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });