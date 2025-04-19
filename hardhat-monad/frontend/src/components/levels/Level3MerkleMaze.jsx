// src/components/levels/Level3MerkleMaze.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import LevelCompletion from './LevelCompletion';
import MerkleTreeVisualization from '../game/MerkleTreeVisualization';
const Level3MerkleMaze = () => {
    const { contracts } = useWeb3();

    const [rootHash, setRootHash] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [merkleProof, setMerkleProof] = useState([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [showCompletion, setShowCompletion] = useState(false);
    const [gasUsed, setGasUsed] = useState(0);
    const [merkleTree, setMerkleTree] = useState(null);

    // Fetch root hash from contract
    useEffect(() => {
        const fetchRootHash = async () => {
            if (!contracts.levels || !contracts.levels[3]) return;

            try {
                const hash = await contracts.levels[3].rootHash();
                setRootHash(hash);

                // Generate transactions and build a Merkle tree
                generateTransactions(hash);
            } catch (error) {
                console.error('Error fetching root hash:', error);
                setError('Failed to fetch Merkle root from the contract');
            }
        };

        fetchRootHash();
    }, [contracts.levels]);

    // Generate transactions and build a valid Merkle tree
    const generateTransactions = async (rootHashFromContract) => {
        try {
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

            // Calculate leaf hashes for each transaction
            const leaves = sampleTxs.map(tx => {
                // Hash the transaction data
                const txHash = ethers.keccak256(ethers.toUtf8Bytes(tx.data));
                return { ...tx, hash: txHash };
            });

            // Build the Merkle tree
            const tree = buildMerkleTree(leaves.map(leaf => leaf.hash));
            setMerkleTree(tree);

            // If we need to match a specific rootHash from the contract
            // We can adjust our tx data in a real implementation, but for this demo
            // we'll just log a warning if they don't match
            if (tree.root !== rootHashFromContract) {
                console.warn('Generated Merkle root does not match contract root hash');
                console.log('Generated root:', tree.root);
                console.log('Contract root:', rootHashFromContract);
            }

            // Add index to each transaction
            const txsWithIndex = leaves.map((tx, index) => ({
                ...tx,
                id: `tx${index + 1}`,
                index
            }));

            setTransactions(txsWithIndex);
        } catch (error) {
            console.error('Error generating transactions:', error);
            setError('Failed to generate transactions');
        }
    };

    // Build a Merkle tree from leaf nodes
    const buildMerkleTree = (leaves) => {
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
                
                // Sort the hashes before combining - this is crucial!
                const [sortedLeft, sortedRight] = [left, right].sort();
                
                // Combine hashes according to the contract's logic
                const combinedHash = ethers.keccak256(
                    ethers.concat([sortedLeft, sortedRight])
                );
                
                nextLevel.push(combinedHash);
            }
            
            levels.push(nextLevel);
            currentLevel = nextLevel;
        }

        return {
            root: currentLevel[0],
            levels
        };
    };

    // Generate a Merkle proof for a specific leaf node
    const generateMerkleProof = (index) => {
        if (!merkleTree) return [];
        
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
    };

    // Select a transaction to verify
    const selectTransaction = (index) => {
        const proof = generateMerkleProof(index);
        setSelectedIndex(index);
        setMerkleProof(proof);
        setError('');
    };

    // Verify the Merkle proof locally before submitting to the contract
    const verifyProofLocally = (leaf, proof, index) => {
        let computedHash = leaf;
        let currentIndex = index;
        
        for (let i = 0; i < proof.length; i++) {
            const proofElement = proof[i];
            
            // Determine if current hash should be left or right
            if (currentIndex % 2 === 0) {
                // Current hash is left, proof element is right
                computedHash = ethers.keccak256(
                    ethers.concat([computedHash, proofElement])
                );
            } else {
                // Current hash is right, proof element is left
                computedHash = ethers.keccak256(
                    ethers.concat([proofElement, computedHash])
                );
            }
            
            // Move up to parent index
            currentIndex = Math.floor(currentIndex / 2);
        }
        
        return computedHash === merkleTree.root;
    };

    // Verify the Merkle proof on-chain
    const verifyProof = async () => {
        if (selectedIndex === null) {
            setError('Please select a transaction first');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            const tx = transactions[selectedIndex];
            
            // Get the proof directly from generateMerkleProof
            const proof = generateMerkleProof(selectedIndex);
            
            // Verify locally first
            const isValidLocally = verifyProofLocally(tx.hash, proof, selectedIndex);
            if (!isValidLocally) {
                throw new Error('Invalid Merkle proof (local verification failed)');
            }

            // Call contract to verify with original proof (not sorted)
            const verifyTx = await contracts.levels[3].verifyMerkleProof(
                proof,
                tx.hash,
                selectedIndex,
                { gasLimit: 500000 }
            );

            const receipt = await verifyTx.wait();
            setGasUsed(receipt.gasUsed);
            setShowCompletion(true);
        } catch (error) {
            console.error('Error verifying Merkle proof:', error);
            setError(`Failed to verify Merkle proof: ${error.message}`);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="level-container">

            <MerkleTreeVisualization merkleTree={merkleTree} selectedIndex={selectedIndex}/>
            <div className="level-header">
                <h2>Level 3: Merkle Maze</h2>
                <p className="level-description">
                    Navigate the Merkle tree maze by providing valid Merkle proofs for transactions.
                </p>
            </div>

            <div className="level-content">
                <div className="level-instructions">
                    <h3>Instructions</h3>
                    <ol>
                        <li>Select a transaction from the list</li>
                        <li>View its Merkle proof</li>
                        <li>Submit the proof to the contract for verification</li>
                    </ol>

                    <div className="info-box">
                        <h4>What are Merkle Trees?</h4>
                        <p>
                            Merkle trees are binary hash trees that efficiently verify data integrity.
                            The tree is built by hashing pairs of nodes until only one hash remains (the root).
                            A Merkle proof is a path of hashes from a leaf to the root, allowing verification
                            that a specific transaction is included in the tree without needing the entire tree.
                            Ethereum uses Merkle proofs to validate transactions without storing all transaction data on every node.
                        </p>
                    </div>

                    <div className="merkle-root">
                        <h4>Merkle Root:</h4>
                        <p className="code-display">
                            {rootHash ? rootHash : 'Loading...'}
                        </p>
                        {merkleTree && (
                            <p className="code-display">
                                Generated Root: {merkleTree.root}
                            </p>
                        )}
                    </div>
                </div>

                <div className="level-interaction">
                    <div className="transactions-container">
                        <h4>Select a Transaction:</h4>

                        <div className="transaction-list">
                            {transactions.map((tx, index) => (
                                <div
                                    key={tx.id}
                                    className={`transaction-item ${selectedIndex === index ? 'selected' : ''}`}
                                    onClick={() => selectTransaction(index)}
                                >
                                    <div className="transaction-header">
                                        <span className="transaction-id">{tx.id}</span>
                                        <span className="transaction-index">Index: {tx.index}</span>
                                    </div>
                                    <div className="transaction-data">{tx.data}</div>
                                    <div className="transaction-hash">Hash: {tx.hash.substring(0, 10)}...</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedIndex !== null && (
                        <div className="proof-display">
                            <h4>Merkle Proof:</h4>
                            <div className="proof-list">
                                {merkleProof.map((hash, index) => (
                                    <div key={index} className="proof-item">
                                        <span className="proof-level">Level {index + 1}:</span>
                                        <span className="proof-hash">{hash.substring(0, 10)}...</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="action-button primary"
                                onClick={verifyProof}
                                disabled={isVerifying}
                            >
                                {isVerifying ? 'Verifying...' : 'Verify Proof'}
                            </button>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}
                </div>
            </div>

            {showCompletion && (
                <LevelCompletion
                    level={3}
                    pointsEarned={300}
                    gasUsed={gasUsed}
                    onClose={() => setShowCompletion(false)}
                />
            )}
        </div>
    );
};

export default Level3MerkleMaze;