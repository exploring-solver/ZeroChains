// src/components/levels/LevelCompletion.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';

const LevelCompletion = ({ level, pointsEarned, gasUsed, onClose }) => {
  const { refreshGameData } = useGame();

  // Refresh game data when component mounts
  useEffect(() => {
    refreshGameData();
  }, [refreshGameData]);

  // Get badge and message based on level
  const getBadgeAndMessage = (level) => {
    switch(level) {
      case 1:
        return {
          badge: '🛡️',
          title: 'Genesis Guardian Badge',
          message: 'You have proven your understanding of transaction signatures, a fundamental blockchain security concept.'
        };
      case 2:
        return {
          badge: '🔐',
          title: 'Hash Fortress Badge',
          message: 'You have mastered cryptographic hashing, demonstrating your ability to secure data on the blockchain.'
        };
      case 3:
        return {
          badge: '🌲',
          title: 'Merkle Guardian Badge',
          message: 'You have successfully navigated the Merkle tree maze, proving your knowledge of blockchain data verification.'
        };
      case 4:
        return {
          badge: '🛑',
          title: 'Anti-Reentrancy Badge',
          message: 'You have identified, exploited, and fixed a smart contract vulnerability. Your skills in contract security are confirmed.'
        };
      case 5:
        return {
          badge: '⚖️',
          title: 'Consensus Guardian Badge',
          message: 'You have participated in and secured the blockchain consensus mechanism, contributing to the security of the network.'
        };
      default:
        return {
          badge: '🏆',
          title: `Level ${level} Badge`,
          message: `You have completed level ${level}, demonstrating advanced blockchain security skills.`
        };
    }
  };
  
  const { badge, title, message } = getBadgeAndMessage(level);
  
  // Calculate next level
  const nextLevel = level + 1;
  
  return (
    <div className="level-completion-modal">
      <div className="modal-content">
        <div className="completion-header">
          <div className="badge-container">
            <div className="badge-icon">{badge}</div>
          </div>
          <h2>Level {level} Completed!</h2>
          <h3>{title}</h3>
        </div>
        
        <div className="completion-message">
          <p>{message}</p>
        </div>
        
        <div className="rewards-section">
          <h4>Rewards Earned</h4>
          <div className="rewards-grid">
            <div className="reward-item">
              <div className="reward-icon">🎖️</div>
              <div className="reward-info">
                <span className="reward-label">Security Points</span>
                <span className="reward-value">+{pointsEarned}</span>
              </div>
            </div>
            <div className="reward-item">
              <div className="reward-icon">🏮</div>
              <div className="reward-info">
                <span className="reward-label">Gas Used</span>
                <span className="reward-value">{gasUsed}</span>
              </div>
            </div>
            <div className="reward-item">
              <div className="reward-icon">🖼️</div>
              <div className="reward-info">
                <span className="reward-label">NFT Earned</span>
                <span className="reward-value">Level {level} Guardian NFT</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="completion-actions">
          <Link to={`/level/${nextLevel}`} className="next-level-btn">
            Continue to Level {nextLevel}
          </Link>
          <Link to="/game" className="return-dashboard-btn">
            Return to Dashboard
          </Link>
          <button className="play-again-btn" onClick={onClose}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelCompletion;