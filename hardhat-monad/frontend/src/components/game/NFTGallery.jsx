// src/components/game/NFTGallery.jsx
import React from 'react';
import { useGame } from '../../contexts/GameContext';

const NFTGallery = () => {
  const { playerNFTs, isLoading } = useGame();
  
  // Generate NFT badge colors based on level
  const getBadgeColor = (level) => {
    const colors = [
      'badge-blue',     // Level 1
      'badge-green',    // Level 2
      'badge-purple',   // Level 3
      'badge-orange',   // Level 4
      'badge-red',      // Level 5
      'badge-gold'      // Higher levels
    ];
    
    return colors[Math.min(level - 1, colors.length - 1)];
  };
  
  return (
    <div className="nft-gallery">
      <h2>Your Guardian NFT Collection</h2>
      
      {isLoading ? (
        <div className="loading-spinner">Loading your NFTs...</div>
      ) : (
        <>
          {playerNFTs.length > 0 ? (
            <div className="nft-grid">
              {playerNFTs.map(nft => (
                <div key={nft.tokenId} className="nft-card">
                  <div className={`nft-image level-${nft.level}`}>
                    {/* In a real app, this would be an actual NFT image */}
                    <div className="nft-placeholder">
                      <div className="nft-icon">🛡️</div>
                      <div className={`level-badge ${getBadgeColor(nft.level)}`}>
                        Level {nft.level}
                      </div>
                    </div>
                  </div>
                  <div className="nft-info">
                    <h3>Guardian NFT #{nft.tokenId}</h3>
                    <p className="nft-description">
                      {getNFTDescription(nft.level)}
                    </p>
                    <div className="nft-metadata">
                      <div className="metadata-item">
                        <span className="metadata-label">Token ID:</span>
                        <span className="metadata-value">{nft.tokenId}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Level:</span>
                        <span className="metadata-value">{nft.level}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-gallery">
              <p>You haven't earned any Guardian NFTs yet.</p>
              <p>Complete game levels to earn unique NFTs that prove your blockchain security skills!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Helper function for NFT descriptions
function getNFTDescription(level) {
  switch(level) {
    case 1:
      return "Genesis Guardian: Mastered the fundamentals of transaction signatures. This NFT certifies your ability to verify blockchain transactions.";
    case 2:
      return "Hash Fortress Guardian: Conquered cryptographic hashing challenges. This NFT recognizes your understanding of blockchain's hash security.";
    case 3:
      return "Merkle Guardian: Successfully navigated the Merkle tree maze. This NFT proves your knowledge of blockchain data verification.";
    case 4:
      return "Anti-Reentrancy Guardian: Identified, exploited, and fixed a smart contract vulnerability. This NFT certifies your smart contract security skills.";
    case 5:
      return "Consensus Guardian: Participated in and secured the blockchain consensus mechanism. This NFT recognizes your contribution to blockchain validation.";
    default:
      return `Level ${level} Guardian: Completed advanced blockchain security challenges at level ${level}.`;
  }
}

export default NFTGallery;