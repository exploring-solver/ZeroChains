import { useState, useEffect } from 'react';

const MerkleTreeVisualization = ({ merkleTree, selectedIndex }) => {
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    if (!merkleTree || !merkleTree.levels) return;
    
    const { levels } = merkleTree;
    const formattedLevels = levels.map((level, levelIndex) => {
      return level.map((node, nodeIndex) => {
        // For the bottom level (leaves), check if this is the selected leaf
        const isSelected = levelIndex === 0 && nodeIndex === selectedIndex;
        
        // Determine if this node is part of the proof path
        let isInProofPath = false;
        if (selectedIndex !== null && levelIndex === 0) {
          // For leaf level, the selected node is in the path
          isInProofPath = nodeIndex === selectedIndex;
        } else if (selectedIndex !== null && levelIndex > 0) {
          // For upper levels, check if the node is a parent of the selected path
          const parentIndex = Math.floor(selectedIndex / Math.pow(2, levelIndex));
          isInProofPath = nodeIndex === parentIndex;
        }
        
        return {
          hash: node,
          truncatedHash: `${node.substring(0, 6)}...${node.substring(node.length - 4)}`,
          isSelected,
          isInProofPath
        };
      });
    });
    
    setTreeData(formattedLevels);
  }, [merkleTree, selectedIndex]);

  if (!merkleTree || treeData.length === 0) {
    return <div className="tree-loading">Loading Merkle tree...</div>;
  }

  return (
    <div className="merkle-tree-visualization">
      <h4>Merkle Tree</h4>
      
      <div className="tree-container">
        {treeData.slice().reverse().map((level, levelIndex) => (
          <div key={levelIndex} className="tree-level">
            {level.map((node, nodeIndex) => (
              <div 
                key={`${levelIndex}-${nodeIndex}`} 
                className={`tree-node ${node.isSelected ? 'selected' : ''} ${node.isInProofPath ? 'in-path' : ''}`}
                title={node.hash}
              >
                {node.truncatedHash}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="tree-legend">
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selected Node</span>
        </div>
        <div className="legend-item">
          <div className="legend-color in-path"></div>
          <span>Proof Path</span>
        </div>
      </div>
      
      <style jsx>{`
        .merkle-tree-visualization {
          margin-top: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
        }
        
        .tree-container {
          overflow-x: auto;
          margin-top: 16px;
        }
        
        .tree-level {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        
        .tree-node {
          background-color: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 8px 12px;
          margin: 0 8px;
          font-family: monospace;
          font-size: 12px;
          transition: all 0.2s;
        }
        
        .tree-node.selected {
          background-color: #eaf7ff;
          border-color: #2196f3;
          box-shadow: 0 0 5px rgba(33, 150, 243, 0.5);
        }
        
        .tree-node.in-path {
          background-color: #e8f5e9;
          border-color: #4caf50;
        }
        
        .tree-legend {
          display: flex;
          margin-top: 16px;
          justify-content: center;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          margin: 0 12px;
        }
        
        .legend-color {
          width: 16px;
          height: 16px;
          margin-right: 8px;
          border: 1px solid #ccc;
          border-radius: 3px;
        }
        
        .legend-color.selected {
          background-color: #eaf7ff;
          border-color: #2196f3;
        }
        
        .legend-color.in-path {
          background-color: #e8f5e9;
          border-color: #4caf50;
        }
      `}</style>
    </div>
  );
};

export default MerkleTreeVisualization;