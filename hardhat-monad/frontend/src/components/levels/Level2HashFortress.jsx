// src/components/levels/Level2HashFortress.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import LevelCompletion from './LevelCompletion';

const Level2HashFortress = () => {
  const { contracts } = useWeb3();
  
  const [targetPrefix, setTargetPrefix] = useState('');
  const [solution, setSolution] = useState('');
  const [hashedSolution, setHashedSolution] = useState('');
  const [hashMatches, setHashMatches] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [solutionFound, setSolutionFound] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [gasUsed, setGasUsed] = useState(0);
  
  // Fetch target prefix from contract
  useEffect(() => {
    const fetchTargetPrefix = async () => {
      if (!contracts.levels || !contracts.levels[2]) return;
      
      try {
        const prefix = await contracts.levels[2].targetPrefixHash();
        setTargetPrefix(prefix);
      } catch (error) {
        console.error('Error fetching target prefix:', error);
        setError('Failed to fetch target prefix from the contract');
      }
    };
    
    fetchTargetPrefix();
  }, [contracts.levels]);
  
  // Calculate hash of solution using the correct contract method
  const calculateHash = () => {
    if (!solution.trim()) {
      setError('Please enter a solution to hash');
      return;
    }
    
    try {
      // Convert solution to bytes32
      const bytes32Solution = ethers.encodeBytes32String(solution);
      
      // Calculate hash using the CORRECT contract method: keccak256(abi.encode(solution))
      const hash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [bytes32Solution])
      );
      
      setHashedSolution(hash);
      
      // SIMPLIFIED: Check if hash matches target prefix (first byte only)
      const targetPrefixMask = '0xff00000000000000000000000000000000000000000000000000000000000000';
      const maskedTarget = BigInt(targetPrefix) & BigInt(targetPrefixMask);
      const maskedHash = BigInt(hash) & BigInt(targetPrefixMask);
      
      setHashMatches(maskedTarget === maskedHash);
      setError('');
    } catch (error) {
      console.error('Error calculating hash:', error);
      setError('Failed to calculate hash. Please try again.');
    }
  };
  
  // Mine for a solution with matching prefix
  const mineSolution = async () => {
    if (!targetPrefix) {
      setError('Target prefix not loaded yet');
      return;
    }
    
    setIsMining(true);
    setError('');
    
    try {
      // SIMPLIFIED: Target prefix mask (first byte only)
      const targetPrefixMask = '0xff00000000000000000000000000000000000000000000000000000000000000';
      const maskedTarget = BigInt(targetPrefix) & BigInt(targetPrefixMask);
      
      // Try random solutions until one matches
      let found = false;
      let attempt = 0;
      let solution = '';
      let hash = '';
      
      while (!found && attempt < 10000) {
        // Generate random bytes32 value
        solution = ethers.hexlify(ethers.randomBytes(32));
        
        // Calculate hash using the CORRECT contract method
        hash = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [solution])
        );
        
        // Check if first byte matches using BigInt
        const maskedHash = BigInt(hash) & BigInt(targetPrefixMask);
        
        if (maskedTarget === maskedHash) {
          found = true;
          setSolution(solution);
          setHashedSolution(hash);
          setHashMatches(true);
          setSolutionFound(true);
        }
        
        attempt++;
        
        // Add a small delay every 100 attempts to keep the UI responsive
        if (attempt % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      if (!found) {
        setError('Could not find a solution in the allowed attempts. Try again or enter a solution manually.');
      }
    } catch (error) {
      console.error('Error mining solution:', error);
      setError('Error while mining for a solution');
    } finally {
      setIsMining(false);
    }
  };
  
  // Submit solution to contract
  const submitSolution = async () => {
    if (!solution || !hashMatches) {
      setError('Please find a valid solution first');
      return;
    }
    
    setIsSolving(true);
    setError('');
    
    try {
      // Convert solution to bytes32 if it's not already in bytes32 format
      const bytes32Solution = solution.startsWith('0x') && solution.length === 66 
        ? solution 
        : ethers.encodeBytes32String(solution);
      
      // Estimate gas
      const gasEstimate = await contracts.levels[2].solveHashPuzzle(bytes32Solution);
      const gasLimit = gasEstimate.mul(110).div(100); // Add 10% buffer
      
      // Call contract to verify
      const tx = await contracts.levels[2].solveHashPuzzle(bytes32Solution, { gasLimit });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Get gas used
      setGasUsed(receipt.gasUsed.toNumber());
      
      // Show completion modal
      setShowCompletion(true);
    } catch (error) {
      console.error('Error submitting solution:', error);
      setError('Failed to submit solution to the contract. Make sure the solution is valid.');
    } finally {
      setIsSolving(false);
    }
  };
  
  return (
    <div className="level-container">
      <div className="level-header">
        <h2>Level 2: Hash Fortress (Simplified)</h2>
        <p className="level-description">
          Master cryptographic hashing by solving a hash puzzle with specific requirements.
        </p>
      </div>
      
      <div className="level-content">
        <div className="level-instructions">
          <h3>Instructions</h3>
          <ol>
            <li>Enter a solution text or click "Mine Solution" to automatically find one</li>
            <li>The solution must generate a hash whose first byte matches the target prefix</li>
            <li>Submit your solution to the contract to complete the level</li>
          </ol>
          
          <div className="info-box">
            <h4>What are cryptographic hash functions?</h4>
            <p>
              Hash functions are one-way mathematical algorithms that convert data of any size into a fixed-size output.
              In blockchain, the keccak256 hash function is commonly used.
              Key properties include:
            </p>
            <ul>
              <li><strong>Deterministic:</strong> Same input always produces the same output</li>
              <li><strong>One-way:</strong> Easy to compute but practically impossible to reverse</li>
              <li><strong>Avalanche effect:</strong> Small changes in input create completely different outputs</li>
            </ul>
          </div>
          
          <div className="target-prefix">
            <h4>Target Prefix:</h4>
            <p className="code-display">
              {targetPrefix ? targetPrefix : 'Loading...'}
            </p>
          </div>
        </div>
        
        <div className="level-interaction">
          <div className="input-group">
            <label htmlFor="solution">Your Solution:</label>
            <div className="solution-input-container">
              <input
                type="text"
                id="solution"
                value={solution}
                onChange={(e) => {
                  setSolution(e.target.value);
                  setHashMatches(false);
                  setSolutionFound(false);
                }}
                placeholder="Enter a solution"
              />
              <button 
                className="action-button secondary"
                onClick={calculateHash}
                disabled={!solution.trim()}
              >
                Calculate Hash
              </button>
            </div>
          </div>
          
          <button 
            className="action-button primary"
            onClick={mineSolution}
            disabled={isMining || !targetPrefix}
          >
            {isMining ? 'Mining...' : 'Mine Solution'}
          </button>
          
          {hashedSolution && (
            <div className="hash-result">
              <h4>Hashed Result:</h4>
              <div className={`hash-value ${hashMatches ? 'match' : 'no-match'}`}>
                {hashedSolution}
              </div>
              <p className="hash-status">
                {hashMatches 
                  ? '✅ Hash prefix matches the target!' 
                  : '❌ Hash prefix does not match the target'}
              </p>
            </div>
          )}
          
          {solutionFound && (
            <button
              className="action-button submit"
              onClick={submitSolution}
              disabled={isSolving}
            >
              {isSolving ? 'Submitting...' : 'Submit Solution'}
            </button>
          )}
          
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
      
      {showCompletion && (
        <LevelCompletion
          level={2}
          pointsEarned={200}
          gasUsed={gasUsed}
          onClose={() => setShowCompletion(false)}
        />
      )}
    </div>
  );
};

export default Level2HashFortress;