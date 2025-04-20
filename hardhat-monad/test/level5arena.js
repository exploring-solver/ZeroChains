// Level5ConsensusArena Solver Script
const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    try {
        // Import addresses dynamically since it's an ESM module
        const { contractAddresses } = await import('../frontend/src/config/addresses.js');
        
        console.log("🌟 BLOCKCHAIN GUARDIAN: LEVEL 5 CONSENSUS ARENA 🌟");
        console.log("===================================================");
        
        // Connect to network
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
        const wallet = new ethers.Wallet(process.env.HT_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
        const walletAddress = wallet.address;
        
        console.log(`Using wallet address: ${walletAddress}`);
        
        // Contract addresses
        const LEVEL5_CONTRACT_ADDRESS = process.env.LEVEL5_CONTRACT_ADDRESS || contractAddresses.Level5ConsensusArena;
        const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS || contractAddresses.BlockchainGuardianGame;
        
        console.log(`Level5 Contract: ${LEVEL5_CONTRACT_ADDRESS}`);
        console.log(`Game Contract: ${GAME_CONTRACT_ADDRESS}`);
        
        // Create contract instances
        const level5Contract = new ethers.Contract(
            LEVEL5_CONTRACT_ADDRESS,
            [
                "function currentBlockId() view returns (uint256)",
                "function stake(address) view returns (uint256)",
                "function totalStake() view returns (uint256)",
                "function hasVoted(address,uint256) view returns (bool)",
                "function stakeTokens() external payable",
                "function submitVote(bool) external",
                "function unstake(uint256) external"
            ],
            wallet
        );

        const gameContract = new ethers.Contract(
            GAME_CONTRACT_ADDRESS,
            [
                "function playerLevel(address player) view returns (uint256)"
            ],
            wallet
        );
        
        // Check current player level
        const initialLevel = await gameContract.playerLevel(walletAddress);
        console.log(`Current player level: ${initialLevel}`);
        
        if (Number(initialLevel) >= 5) {
            console.log("You've already completed Level 5!");
            return;
        }

        // First, deploy the VotingHelper contract
        console.log("\nDeploying voting helper contracts...");
        
        // Read VotingHelper ABI and bytecode
        // You need to compile the contract first and have the artifact
        const VotingHelperArtifact = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../artifacts/contracts/VotingHelper.sol/VotingHelper.json'),
                'utf8'
            )
        );
        
        // Create contract factory
        const VotingHelperFactory = new ethers.ContractFactory(
            VotingHelperArtifact.abi,
            VotingHelperArtifact.bytecode,
            wallet
        );
        
        // Deploy the first helper
        console.log("Deploying helper 1...");
        const helper1Tx = await VotingHelperFactory.deploy(LEVEL5_CONTRACT_ADDRESS, {
            gasLimit: 3000000
        });
        const helper1 = await helper1Tx.waitForDeployment();
        const helper1Address = await helper1.getAddress();
        console.log(`Helper 1 deployed to: ${helper1Address}`);
        
        // Deploy the second helper
        console.log("Deploying helper 2...");
        const helper2Tx = await VotingHelperFactory.deploy(LEVEL5_CONTRACT_ADDRESS, {
            gasLimit: 3000000
        });
        const helper2 = await helper2Tx.waitForDeployment();
        const helper2Address = await helper2.getAddress();
        console.log(`Helper 2 deployed to: ${helper2Address}`);
        
        // Check the consensus threshold and determine needed stake
        const totalStake = await level5Contract.totalStake();
        console.log(`\nCurrent total stake: ${ethers.formatEther(totalStake)} ETH`);
        
        // Stake tokens to gain voting power
        const stakeAmount = ethers.parseEther("1.0"); // Stake 1 ETH
        console.log(`\nStaking ${ethers.formatEther(stakeAmount)} ETH from main account...`);
        const stakeTx = await level5Contract.stakeTokens({
            value: stakeAmount,
            gasLimit: 500000
        });
        
        console.log(`Transaction sent: ${stakeTx.hash}`);
        const stakeReceipt = await stakeTx.wait();
        console.log("✅ Staking transaction confirmed");
        
        // Have helper contracts stake tokens too
        const helperStakeAmount = ethers.parseEther("0.5"); // 0.5 ETH each
        console.log(`Staking ${ethers.formatEther(helperStakeAmount)} ETH from each helper...`);
        
        // Helper 1 stake and vote
        const helper1StakeTx = await helper1.stakeAndVote(true, {
            value: helperStakeAmount,
            gasLimit: 500000
        });
        
        console.log(`Helper 1 transaction sent: ${helper1StakeTx.hash}`);
        const helper1StakeReceipt = await helper1StakeTx.wait();
        console.log("✅ Helper 1 staking transaction confirmed");
        
        // Helper 2 stake and vote
        const helper2StakeTx = await helper2.stakeAndVote(true, {
            value: helperStakeAmount,
            gasLimit: 500000
        });
        
        console.log(`Helper 2 transaction sent: ${helper2StakeTx.hash}`);
        const helper2StakeReceipt = await helper2StakeTx.wait();
        console.log("✅ Helper 2 staking transaction confirmed");
        
        // Check updated total stake
        const updatedTotalStake = await level5Contract.totalStake();
        console.log(`Updated total stake: ${ethers.formatEther(updatedTotalStake)} ETH`);
        
        // Vote on current block and upcoming blocks until completion
        console.log("\nStarting the voting process for 3 consecutive blocks...");
        
        // Track current block
        let startBlockId = await level5Contract.currentBlockId();
        console.log(`Starting with block ID: ${startBlockId}`);
        
        // We need to vote on 3 consecutive finalized blocks to complete the level
        const targetBlockId = Number(startBlockId) + 3;
        
        // Vote on all blocks until we reach the target
        let currentBlockId = Number(await level5Contract.currentBlockId());
        let attempts = 0;
        const maxAttempts = 15; // Limit attempts to prevent infinite loops
        
        while (currentBlockId < targetBlockId && attempts < maxAttempts) {
            attempts++;
            currentBlockId = Number(await level5Contract.currentBlockId());
            console.log(`\nProcessing block ID: ${currentBlockId} (Attempt ${attempts})`);
            
            // Check if we've already voted
            const hasVoted = await level5Contract.hasVoted(walletAddress, currentBlockId);
            if (!hasVoted) {
                console.log(`Voting on block ${currentBlockId} from main account...`);
                
                try {
                    const voteTx = await level5Contract.submitVote(true, {
                        gasLimit: 500000
                    });
                    
                    console.log(`Vote transaction sent: ${voteTx.hash}`);
                    await voteTx.wait();
                    console.log(`✅ Vote submitted from main account`);
                } catch (error) {
                    console.log(`❌ Main account voting failed: ${error.reason || error.message}`);
                }
            } else {
                console.log(`Already voted on block ${currentBlockId} from main account`);
            }
            
            // Check if helper1 has voted
            const helper1HasVoted = await level5Contract.hasVoted(helper1Address, currentBlockId);
            if (!helper1HasVoted) {
                console.log(`Helper 1 voting on block ${currentBlockId}...`);
                
                try {
                    const helper1VoteTx = await helper1.submitVote(true, {
                        gasLimit: 500000
                    });
                    
                    console.log(`Helper 1 vote transaction sent: ${helper1VoteTx.hash}`);
                    await helper1VoteTx.wait();
                    console.log(`✅ Helper 1 vote submitted`);
                } catch (error) {
                    console.log(`❌ Helper 1 voting failed: ${error.reason || error.message}`);
                }
            } else {
                console.log(`Helper 1 already voted on block ${currentBlockId}`);
            }
            
            // Check if helper2 has voted
            const helper2HasVoted = await level5Contract.hasVoted(helper2Address, currentBlockId);
            if (!helper2HasVoted) {
                console.log(`Helper 2 voting on block ${currentBlockId}...`);
                
                try {
                    const helper2VoteTx = await helper2.submitVote(true, {
                        gasLimit: 500000
                    });
                    
                    console.log(`Helper 2 vote transaction sent: ${helper2VoteTx.hash}`);
                    await helper2VoteTx.wait();
                    console.log(`✅ Helper 2 vote submitted`);
                } catch (error) {
                    console.log(`❌ Helper 2 voting failed: ${error.reason || error.message}`);
                }
            } else {
                console.log(`Helper 2 already voted on block ${currentBlockId}`);
            }
            
            // Check if the block has been finalized
            const newBlockId = Number(await level5Contract.currentBlockId());
            if (newBlockId > currentBlockId) {
                console.log(`✅ Block ${currentBlockId} has been finalized! Moving to block ${newBlockId}`);
                currentBlockId = newBlockId;
            } else {
                console.log(`Waiting for more votes to finalize block ${currentBlockId}...`);
                
                // Wait a bit before checking again
                console.log("Waiting for block finalization...");
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
            }
        }
        
        if (attempts >= maxAttempts) {
            console.log("\n⚠️ Reached maximum number of attempts. The level may not be complete.");
        }
        
        // Check if level completed
        const finalLevel = await gameContract.playerLevel(walletAddress);
        console.log(`\nFinal player level: ${finalLevel}`);
        
        if (Number(finalLevel) > Number(initialLevel)) {
            console.log("\n🎮 LEVEL 5 COMPLETED SUCCESSFULLY! 🎮");
        } else {
            console.log("\n❌ Level not completed. Make sure you've participated in at least 3 consecutive successful consensus rounds.");
        }
        
        // Unstake our tokens
        console.log("\nUnstaking tokens...");
        const ourStake = await level5Contract.stake(walletAddress);
        
        if (ourStake > 0) {
            try {
                const unstakeTx = await level5Contract.unstake(ourStake, {
                    gasLimit: 500000
                });
                
                console.log(`Unstake transaction sent: ${unstakeTx.hash}`);
                await unstakeTx.wait();
                console.log(`✅ Unstaked ${ethers.formatEther(ourStake)} ETH`);
            } catch (error) {
                console.log(`❌ Unstaking failed: ${error.reason || error.message}`);
            }
        } else {
            console.log("No stake to withdraw");
        }
        
        // Unstake from helpers
        console.log("\nUnstaking from helper contracts...");
        try {
            await helper1.unstakeAll();
            console.log("✅ Helper 1 funds unstaked");
            
            await helper2.unstakeAll();
            console.log("✅ Helper 2 funds unstaked");
        } catch (error) {
            console.log(`❌ Helper unstaking failed: ${error.reason || error.message}`);
        }
        
    } catch (error) {
        console.error(`\n❌ Script failed: ${error.message}`);
        if (error.reason) console.error(`Reason: ${error.reason}`);
    }
}

// Execute the main function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });