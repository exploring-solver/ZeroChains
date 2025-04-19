// Level3MerkleMaze Solver Script - Specifically for "test" root hash
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
    try {
        const { contractAddresses } = await import('../frontend/src/config/addresses.js');
        console.log("🌳 BLOCKCHAIN GUARDIAN: LEVEL 3 MERKLE MAZE 🌳");
        console.log("==============================================");

        // Connect to network
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
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

        // Convert the hex string to text to see if it's a readable string
        // For 0x7465737400000000000000000000000000000000000000000000000000000000 the text is "test"
        const rootHashBytes = ethers.getBytes(rootHash);
        let rootText = '';
        for (let i = 0; i < rootHashBytes.length; i++) {
            if (rootHashBytes[i] !== 0) {
                rootText += String.fromCharCode(rootHashBytes[i]);
            } else {
                break; // Stop at first null byte
            }
        }
        console.log(`Root hash as text: "${rootText}"`);

        if (rootText === 'test') {
            console.log("Special case detected: 'test' root hash");

            // For this special case, we'll create a Merkle tree with "test" as the leaf value
            // Since the contract root is just "test" padded with zeros, we'll try a simple approach first

            // Create a leaf hash from the utf8 encoded "test" string
            const testLeaf = ethers.keccak256(ethers.toUtf8Bytes("test"));
            console.log(`Test leaf hash: ${testLeaf}`);

            // Try with an empty proof first (if root hash is directly the leaf hash)
            console.log("\nAttempting with empty proof and test leaf...");
            let success = await tryProof(level3Contract, testLeaf, [], 0);

            if (!success) {
                // If that didn't work, try building a Merkle tree with multiple "test" leaves
                console.log("\nBuilding a Merkle tree with 'test' leaves...");
                const leaves = Array(8).fill(testLeaf);
                const merkleTree = buildMerkleTree(leaves);

                console.log(`Tree root: ${merkleTree.root}`);

                // Try each index with its corresponding proof
                for (let i = 0; i < leaves.length; i++) {
                    const proof = generateMerkleProof(merkleTree, i);
                    console.log(`\nTrying with index ${i}...`);
                    success = await tryProof(level3Contract, testLeaf, proof, i);

                    if (success) {
                        break;
                    }
                }
            }

            if (!success) {
                // If still no success, try direct approach with the root hash as leaf
                console.log("\nTrying direct approach with root hash as leaf...");
                await tryProof(level3Contract, rootHash, [], 0);
            }
        } else {
            // Standard approach for a non-special case
            console.log("Standard Merkle tree root detected, following normal approach...");

            // Create 8 sample transactions with unique data
            const sampleTxs = [
                { data: 'Transfer 0.5 ETH to 0x1234' },
                { data: 'Transfer 1.2 ETH to 0x5678' },
                { data: 'Transfer 0.3 ETH to 0x90ab' },
                { data: 'Transfer 2.0 ETH to 0xcdef' },
                { data: 'Transfer 0.1 ETH to 0xff00' },
                { data: 'Transfer 1.5 ETH to 0xabcd' },
                { data: 'Transfer 0.8 ETH to 0x9876' },
                { data: 'Transfer 3.0 ETH to 0x5432' }
            ];

            // Hash the transactions
            const leaves = sampleTxs.map(tx => {
                return ethers.keccak256(ethers.toUtf8Bytes(tx.data));
            });

            // Build Merkle tree
            const merkleTree = buildMerkleTree(leaves);
            console.log(`Generated root: ${merkleTree.root}`);

            // Try each leaf and its proof
            for (let i = 0; i < leaves.length; i++) {
                const proof = generateMerkleProof(merkleTree, i);
                console.log(`\nTrying leaf ${i}...`);
                await tryProof(level3Contract, leaves[i], proof, i);
            }
        }

        // Check if level completed
        const playerLevel = await gameContract.playerLevel(walletAddress);
        console.log(`\nPlayer level after attempts: ${playerLevel}`);

        if (Number(playerLevel) >= 3) {
            console.log("\n🎮 LEVEL 3 COMPLETED SUCCESSFULLY! 🎮");
        } else {
            console.log("\n❌ Level not completed. Please check your approach.");
        }
    } catch (error) {
        console.error(`\n❌ Script failed: ${error.message}`);
        if (error.reason) console.error(`Reason: ${error.reason}`);
    }
}

// Function to try a proof
async function tryProof(contract, leaf, proof, index) {
    try {
        console.log(`Trying proof for leaf: ${leaf}`);
        console.log(`Proof: [${proof.join(', ')}]`);
        console.log(`Index: ${index}`);

        const tx = await contract.verifyMerkleProof(proof, leaf, index, {
            gasLimit: 500000
        });

        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed: ${receipt.hash}`);
        console.log(`Gas used: ${receipt.gasUsed}`);

        return true;
    } catch (error) {
        console.error(`Failed to submit proof: ${error.message}`);
        return false;
    }
}

// Build a Merkle tree from leaf nodes with contract's logic
function buildMerkleTree(leaves) {
    if (leaves.length === 0) return { root: null, levels: [] };

    // Ensure we have a power of 2 number of leaves
    let paddedLeaves = [...leaves];
    while (paddedLeaves.length & (paddedLeaves.length - 1) !== 0) {
        paddedLeaves.push(paddedLeaves[paddedLeaves.length - 1]);
    }

    const levels = [paddedLeaves];
    let currentLevel = paddedLeaves;

    while (currentLevel.length > 1) {
        const nextLevel = [];

        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            const right = currentLevel[i + 1];

            // Use the same hashing function as the contract
            const hash = ethers.keccak256(
                ethers.AbiCoder.defaultAbiCoder().encode(['bytes32', 'bytes32'], [left, right])
            );

            nextLevel.push(hash);
        }

        levels.push(nextLevel);
        currentLevel = nextLevel;
    }

    return {
        root: currentLevel[0],
        levels
    };
}

// Generate a Merkle proof for a specific leaf node
function generateMerkleProof(merkleTree, index) {
    if (!merkleTree || !merkleTree.levels || merkleTree.levels.length === 0) {
        return [];
    }

    const { levels } = merkleTree;
    const proof = [];
    let currentIndex = index;

    // Traverse the tree from bottom to top
    for (let i = 0; i < levels.length - 1; i++) {
        const level = levels[i];

        // Get the sibling index
        const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;

        // Ensure the sibling index is valid
        if (siblingIndex < level.length) {
            proof.push(level[siblingIndex]);
        }

        // Move to the parent index in the next level
        currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
}

// Execute the main function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });