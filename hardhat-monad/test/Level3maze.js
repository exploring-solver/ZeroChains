// Level3MerkleMaze Simplified Solver Script
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
    try {
        const { contractAddresses } = await import('../frontend/src/config/addresses.js');
        console.log("🌳 BLOCKCHAIN GUARDIAN: LEVEL 3 MERKLE MAZE 🌳");
        console.log("==============================================");

        // Connect to network
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
        const wallet = new ethers.Wallet(process.env.HT_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
        const walletAddress = wallet.address;

        console.log(`Using wallet address: ${walletAddress}`);

        // Contract addresses
        const LEVEL3_CONTRACT_ADDRESS = process.env.LEVEL3_CONTRACT_ADDRESS || contractAddresses.Level3MerkleMaze;
        const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS || contractAddresses.BlockchainGuardianGame;

        console.log(`Level3 Contract: ${LEVEL3_CONTRACT_ADDRESS}`);
        console.log(`Game Contract: ${GAME_CONTRACT_ADDRESS}`);

        // Contract ABI
        const level3Abi = [
            "function rootHash() view returns (bytes32)",
            "function verifyMerkleProof(bytes32[] memory proof, bytes32 leaf, uint256 index) returns (bool)"
        ];

        const gameAbi = [
            "function playerLevel(address player) view returns (uint256)"
        ];

        // Create contract instances
        const level3Contract = new ethers.Contract(LEVEL3_CONTRACT_ADDRESS, level3Abi, wallet);
        const gameContract = new ethers.Contract(GAME_CONTRACT_ADDRESS, gameAbi, wallet);

        // Check current player level
        const initialLevel = await gameContract.playerLevel(walletAddress);
        console.log(`Current player level: ${initialLevel}`);

        if (Number(initialLevel) >= 3) {
            console.log("You've already completed Level 3!");
            return;
        }

        // Get root hash from contract
        const rootHash = await level3Contract.rootHash();
        console.log(`Contract root hash: ${rootHash}`);

        // SIMPLIFIED DIRECT APPROACH
        console.log("\n🔑 Using simplified direct approach...");
        
        // Create a leaf and a proof that will result in the root hash
        // For index 0, proof[0] must satisfy: keccak256(abi.encode(leaf, proof[0])) == rootHash
        
        // Create a simple leaf (we'll use a fixed value)
        const leaf = ethers.keccak256("0x1234");
        
        // We need to find a proof[0] such that keccak256(abi.encode(leaf, proof[0])) == rootHash
        // We'll try directly with the rootHash as the proof
        const attempts = [
            { proof: [], index: 0 },
            { proof: [], index: 1 },
            { proof: [rootHash], index: 0 },
            { proof: [rootHash], index: 1 },
            { proof: [leaf], index: 0 },
            { proof: [leaf], index: 1 },
            // Try with special values
            { proof: [ethers.ZeroHash], index: 0 },
            { proof: [ethers.ZeroHash], index: 1 }
        ];
        
        // Additional attempts with the root hash as leaf
        attempts.push({ leaf: rootHash, proof: [], index: 0 });
        attempts.push({ leaf: rootHash, proof: [], index: 1 });
        
        // Super direct approach - explicitly solve for a matching proof element
        // Taking advantage of the contract's verification logic
        if (rootHash.startsWith("0x74657374")) { // "test" in hex
            console.log("Detected 'test' root hash, using specialized approach");
            
            // Create a known leaf
            const specialLeaf = ethers.encodeBytes32String("test-leaf");
            
            // Calculate what proof[0] should be for index=0
            // We need: keccak256(abi.encode(specialLeaf, proof[0])) == rootHash
            // Try with an empty proof for simplicity
            attempts.push({ leaf: specialLeaf, proof: [], index: 0 });
            
            // Try the root hash directly
            attempts.push({ leaf: rootHash, proof: [], index: 0 });
            
            // Explicitly try the padded "test" value
            const testBytes32 = ethers.encodeBytes32String("test");
            attempts.push({ leaf: testBytes32, proof: [], index: 0 });
        }
        
        // Try each approach one by one
        for (const attempt of attempts) {
            const useLeaf = attempt.leaf || leaf;
            console.log(`\nTrying: Leaf=${useLeaf.slice(0, 10)}..., Proof Length=${attempt.proof.length}, Index=${attempt.index}`);
            
            try {
                const tx = await level3Contract.verifyMerkleProof(attempt.proof, useLeaf, attempt.index, {
                    gasLimit: 500000
                });
                
                console.log(`Transaction sent: ${tx.hash}`);
                const receipt = await tx.wait();
                console.log(`✅ SUCCESS! Transaction confirmed: ${receipt.hash}`);
                console.log(`Gas used: ${receipt.gasUsed}`);
                break; // Success, no need to try more
            } catch (error) {
                console.log(`❌ Attempt failed: ${error.reason || error.message.split('(')[0]}`);
                // Wait a moment before next attempt
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Check if level completed
        const playerLevel = await gameContract.playerLevel(walletAddress);
        console.log(`\nPlayer level after attempts: ${playerLevel}`);

        if (Number(playerLevel) >= 3) {
            console.log("\n🎮 LEVEL 3 COMPLETED SUCCESSFULLY! 🎮");
        } else {
            console.log("\n❌ Level not completed. Please check your approach.");
            
            // Special case - "test" might be the root hash as a raw string
            console.log("\nTrying special 'test' string case...");
            
            const testString = "test";
            const encoded = ethers.toUtf8Bytes(testString);
            const testHash = ethers.keccak256(encoded);
            
            console.log(`Test string hash: ${testHash}`);
            
            try {
                const tx = await level3Contract.verifyMerkleProof([], testHash, 0, {
                    gasLimit: 500000
                });
                
                console.log(`Transaction sent: ${tx.hash}`);
                const receipt = await tx.wait();
                console.log(`✅ SUCCESS with test string hash! Transaction confirmed: ${receipt.hash}`);
            } catch (error) {
                console.log(`❌ Test string hash attempt failed: ${error.reason || error.message.split('(')[0]}`);
            }
            
            // Last resort - try direct rootHash match with no verification
            console.log("\nTrying ultimate simplification - direct root hash match...");
            
            try {
                // For a level where the verification is super simple, the root hash might equal itself
                // This is uncommon but possible in test environments
                const tx = await level3Contract.verifyMerkleProof([], rootHash, 0, {
                    gasLimit: 500000
                });
                
                console.log(`Transaction sent: ${tx.hash}`);
                const receipt = await tx.wait();
                console.log(`✅ SUCCESS with direct root hash! Transaction confirmed: ${receipt.hash}`);
            } catch (error) {
                console.log(`❌ Direct root hash attempt failed: ${error.reason || error.message.split('(')[0]}`);
            }
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