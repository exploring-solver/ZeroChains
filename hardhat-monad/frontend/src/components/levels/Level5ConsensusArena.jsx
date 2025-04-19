// src/components/levels/Level5ConsensusArena.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import LevelCompletion from './LevelCompletion';

const Level5ConsensusArena = () => {
  const { account, contracts } = useWeb3();
  
  // Contract state
  const [currentBlockId, setCurrentBlockId] = useState(1);
  const [blockData, setBlockData] = useState(null);
  const [totalStake, setTotalStake] = useState('0');
  const [playerStake, setPlayerStake] = useState('0');
  
  // User inputs
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [voteApproval, setVoteApproval] = useState(true);
  
  // UI state
  const [blockHistory, setBlockHistory] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [consensusProgress, setConsensusProgress] = useState(0);
  const [isStaking, setIsStaking] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [error, setError] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [gasUsed, setGasUsed] = useState(0);
  
  // Fetch contract state
  const fetchContractState = async () => {
    if (!contracts.levels || !contracts.levels[5] || !account) return;
    
    try {
      // Get current block ID
      const blockId = await contracts.levels[5].currentBlockId();
      setCurrentBlockId(blockId.toNumber());
      
      // Get block data
      const block = await contracts.levels[5].blocks(blockId);
      setBlockData({
        id: block.id.toNumber(),
        dataHash: block.dataHash,
        totalVotes: block.totalVotes.toNumber(),
        totalStake: ethers.utils.formatEther(block.totalStake),
        finalized: block.finalized
      });
      
      // Get total stake
      const stake = await contracts.levels[5].totalStake();
      setTotalStake(ethers.utils.formatEther(stake));
      
      // Get player's stake
      const playerStake = await contracts.levels[5].stake(account);
      setPlayerStake(ethers.utils.formatEther(playerStake));
      
      // Check if player has voted for current block
      const voted = await contracts.levels[5].hasVoted(account, blockId);
      setHasVoted(voted);
      
      // Calculate consensus progress
      if (block.totalStake.gt(0)) {
        const progress = (block.totalVotes.mul(100).div(block.totalStake)).toNumber();
        setConsensusProgress(progress);
      } else {
        setConsensusProgress(0);
      }
      
      // Update block history
      updateBlockHistory(blockId.toNumber());
    } catch (error) {
      console.error('Error fetching contract state:', error);
    }
  };
  
  // Update block history
  const updateBlockHistory = async (currentId) => {
    if (!contracts.levels || !contracts.levels[5]) return;
    
    try {
      const history = [];
      
      // Get data for past blocks
      for (let i = Math.max(1, currentId - 4); i < currentId; i++) {
        const block = await contracts.levels[5].blocks(i);
        history.push({
          id: block.id.toNumber(),
          dataHash: block.dataHash,
          totalVotes: block.totalVotes.toNumber(),
          totalStake: ethers.utils.formatEther(block.totalStake),
          finalized: block.finalized
        });
      }
      
      setBlockHistory(history);
    } catch (error) {
      console.error('Error updating block history:', error);
    }
  };
  
  useEffect(() => {
    fetchContractState();
    // Refresh state every 5 seconds
    const interval = setInterval(fetchContractState, 5000);
    return () => clearInterval(interval);
  }, [contracts.levels, account]);
  
  // Stake tokens
  const stakeTokens = async () => {
    if (!stakeAmount || isNaN(parseFloat(stakeAmount)) || parseFloat(stakeAmount) <= 0) {
      setError('Please enter a valid stake amount');
      return;
    }
    
    setIsStaking(true);
    setError('');
    
    try {
      const amount = ethers.utils.parseEther(stakeAmount);
      
      // Call stakeTokens function with ETH
      const tx = await contracts.levels[5].stakeTokens({ value: amount });
      await tx.wait();
      
      // Update state
      await fetchContractState();
      setStakeAmount('');
    } catch (error) {
      console.error('Error staking tokens:', error);
      setError('Failed to stake tokens');
    } finally {
      setIsStaking(false);
    }
  };
  
  // Submit vote
  const submitVote = async () => {
    if (parseFloat(playerStake) <= 0) {
      setError('You need to stake tokens before voting');
      return;
    }
    
    if (hasVoted) {
      setError('You have already voted for this block');
      return;
    }
    
    setIsVoting(true);
    setError('');
    
    try {
      // Call submitVote function
      const tx = await contracts.levels[5].submitVote(voteApproval);
      const receipt = await tx.wait();
      
      // Update state
      await fetchContractState();
      
      // Check if level is completed (player participated in 3 successful consensus rounds)
      const playerLevel = await contracts.game.playerLevel(account);
      if (playerLevel.toNumber() >= 5) {
        // Level completed
        setGasUsed(receipt.gasUsed.toNumber());
        setShowCompletion(true);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError('Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };
  
  // Unstake tokens
  const unstakeTokens = async () => {
    if (!unstakeAmount || isNaN(parseFloat(unstakeAmount)) || parseFloat(unstakeAmount) <= 0) {
      setError('Please enter a valid unstake amount');
      return;
    }
    
    if (parseFloat(unstakeAmount) > parseFloat(playerStake)) {
      setError('Cannot unstake more than your staked amount');
      return;
    }
    
    setIsUnstaking(true);
    setError('');
    
    try {
      const amount = ethers.utils.parseEther(unstakeAmount);
      
      // Call unstake function
      const tx = await contracts.levels[5].unstake(amount);
      await tx.wait();
      
      // Update state
      await fetchContractState();
      setUnstakeAmount('');
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      setError('Failed to unstake tokens');
    } finally {
      setIsUnstaking(false);
    }
  };
  
  // Format hash for display
  const formatHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };
  
  return (
    <div className="level-container">
      <div className="level-header">
        <h2>Level 5: Consensus Arena</h2>
        <p className="level-description">
          Participate in the Proof-of-Stake consensus mechanism to validate blocks.
        </p>
      </div>
      
      <div className="level-content">
        <div className="level-instructions">
          <h3>Instructions</h3>
          <ol>
            <li>Stake ETH to gain voting power in the consensus mechanism</li>
            <li>Vote on blocks to approve or reject them</li>
            <li>Participate in at least 3 consecutive successful consensus rounds</li>
            <li>Optionally unstake your tokens when you're done</li>
          </ol>
          
          <div className="info-box">
            <h4>What is Proof-of-Stake Consensus?</h4>
            <p>
              Proof-of-Stake (PoS) is a consensus mechanism where validators are selected to create new blocks
              based on the amount of cryptocurrency they have "staked" or locked up as collateral.
              Validators vote on proposed blocks, and when a sufficient majority approves a block,
              it is finalized and added to the blockchain.
            </p>
            <p>
              Unlike Proof-of-Work (PoW), PoS doesn't require solving computational puzzles,
              making it more energy-efficient. Validators are incentivized to act honestly because
              they can lose their staked tokens if they attempt to validate fraudulent transactions.
            </p>
          </div>
        </div>
        
        <div className="level-interaction">
          <div className="consensus-dashboard">
            <div className="current-block-info">
              <h4>Current Block: #{currentBlockId}</h4>
              
              {blockData && (
                <>
                  <div className="block-details">
                    <div className="detail-item">
                      <span className="detail-label">Block Hash:</span>
                      <span className="detail-value">{formatHash(blockData.dataHash)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value ${blockData.finalized ? 'finalized' : 'pending'}`}>
                        {blockData.finalized ? 'Finalized' : 'Pending'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Votes:</span>
                      <span className="detail-value">
                        {blockData.totalVotes} / {blockData.totalStake} ({consensusProgress}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="consensus-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${Math.min(consensusProgress, 100)}%` }}
                      />
                      <div className="threshold-marker" style={{ left: '66%' }}>
                        <span className="threshold-label">Threshold (66%)</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="block-history">
              <h4>Block History</h4>
              
              {blockHistory.length > 0 ? (
                <div className="history-list">
                  {blockHistory.map(block => (
                    <div key={block.id} className="history-item">
                      <div className="history-header">
                        <span className="block-id">Block #{block.id}</span>
                        <span className={`block-status ${block.finalized ? 'finalized' : 'pending'}`}>
                          {block.finalized ? 'Finalized' : 'Pending'}
                        </span>
                      </div>
                      <div className="history-details">
                        <div className="history-hash">{formatHash(block.dataHash)}</div>
                        <div className="history-votes">
                          Votes: {block.totalVotes} / {block.totalStake}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-history">No previous blocks available</p>
              )}
            </div>
          </div>
          
          <div className="staking-section">
            <div className="stake-info">
              <div className="info-item">
                <span className="info-label">Total Staked:</span>
                <span className="info-value">{totalStake} ETH</span>
              </div>
              <div className="info-item">
                <span className="info-label">Your Stake:</span>
                <span className="info-value">{playerStake} ETH</span>
              </div>
            </div>
            
            <div className="stake-actions">
              <div className="action-card">
                <h5>Stake Tokens</h5>
                <div className="input-group">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Amount to stake (ETH)"
                    min="0.01"
                    step="0.01"
                  />
                  <button 
                    className="action-button primary"
                    onClick={stakeTokens}
                    disabled={isStaking}
                  >
                    {isStaking ? 'Staking...' : 'Stake'}
                  </button>
                </div>
              </div>
              
              <div className="action-card">
                <h5>Vote on Current Block</h5>
                <div className="vote-options">
                  <label className="vote-option">
                    <input
                      type="radio"
                      name="vote"
                      checked={voteApproval}
                      onChange={() => setVoteApproval(true)}
                      disabled={hasVoted}
                    />
                    <span>Approve</span>
                  </label>
                  <label className="vote-option">
                    <input
                      type="radio"
                      name="vote"
                      checked={!voteApproval}
                      onChange={() => setVoteApproval(false)}
                      disabled={hasVoted}
                    />
                    <span>Reject</span>
                  </label>
                </div>
                <button 
                  className="action-button secondary"
                  onClick={submitVote}
                  disabled={isVoting || hasVoted || parseFloat(playerStake) <= 0}
                >
                  {isVoting ? 'Voting...' : hasVoted ? 'Already Voted' : 'Submit Vote'}
                </button>
              </div>
              
              <div className="action-card">
                <h5>Unstake Tokens</h5>
                <div className="input-group">
                  <input
                    type="number"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    placeholder="Amount to unstake (ETH)"
                    min="0.01"
                    step="0.01"
                    max={playerStake}
                  />
                  <button 
                    className="action-button"
                    onClick={unstakeTokens}
                    disabled={isUnstaking || parseFloat(playerStake) <= 0}
                  >
                    {isUnstaking ? 'Unstaking...' : 'Unstake'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
      
      {showCompletion && (
        <LevelCompletion
          level={5}
          pointsEarned={500}
          gasUsed={gasUsed}
          onClose={() => setShowCompletion(false)}
        />
      )}
    </div>
  );
}
export default Level5ConsensusArena;