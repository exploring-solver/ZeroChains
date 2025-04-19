// src/utils/merkleTree.js
import { ethers } from 'ethers';

/**
 * Builds a Merkle tree from an array of leaf node hashes
 * @param {string[]} leaves Array of leaf node hashes (bytes32 as hex strings)
 * @returns {Object} The Merkle tree with root and levels
 */
export function buildMerkleTree(leaves) {
  if (leaves.length === 0) return { root: null, levels: [] };

  // Ensure we have a power of 2 number of leaves
  let paddedLeaves = [...leaves];
  while (paddedLeaves.length & (paddedLeaves.length - 1) !== 0) {
    paddedLeaves.push(paddedLeaves[paddedLeaves.length - 1]);
  }

  // Store all levels of the tree
  const levels = [paddedLeaves];
  
  // Build the tree level by level
  let currentLevel = paddedLeaves;
  
  while (currentLevel.length > 1) {
    const nextLevel = [];
    
    for (let i = 0; i < currentLevel.length; i += 2) {
      // Hash the pair of nodes according to the contract's logic
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

/**
 * Generates a Merkle proof for a leaf node at the given index
 * @param {Object} merkleTree The Merkle tree object
 * @param {number} index The index of the leaf node
 * @returns {string[]} The Merkle proof as an array of sibling hashes
 */
export function generateMerkleProof(merkleTree, index) {
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

/**
 * Verifies a Merkle proof
 * @param {string} leaf The leaf node hash
 * @param {string[]} proof The Merkle proof (array of sibling hashes)
 * @param {number} index The index of the leaf in the tree
 * @param {string} root The Merkle root hash
 * @returns {boolean} True if the proof is valid
 */
export function verifyMerkleProof(leaf, proof, index, root) {
  let hash = leaf;
  let currentIndex = index;
  
  for (let i = 0; i < proof.length; i++) {
    // Use the same hashing logic as the contract
    hash = currentIndex % 2 === 0
      ? ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['bytes32', 'bytes32'], [hash, proof[i]]))
      : ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['bytes32', 'bytes32'], [proof[i], hash]));
    
    currentIndex = Math.floor(currentIndex / 2);
  }
  
  return hash === root;
}

/**
 * Generates leaf node hashes from transaction data
 * @param {Array} transactions Array of transaction objects
 * @returns {Array} Array of transaction objects with hash property added
 */
export function generateLeafHashes(transactions) {
  return transactions.map(tx => {
    // Hash the transaction data
    const txHash = ethers.keccak256(ethers.toUtf8Bytes(tx.data));
    return { ...tx, hash: txHash };
  });
}

/**
 * Creates a sample set of transactions for testing
 * @param {number} count Number of transactions to generate
 * @returns {Array} Array of transaction objects
 */
export function createSampleTransactions(count = 8) {
  const transactions = [];
  
  for (let i = 0; i < count; i++) {
    const amount = (Math.random() * 5).toFixed(2);
    const address = `0x${Math.random().toString(16).substring(2, 10)}`;
    
    transactions.push({
      data: `Transfer ${amount} ETH to ${address}`,
      id: `tx${i + 1}`,
      index: i
    });
  }
  
  return transactions;
}