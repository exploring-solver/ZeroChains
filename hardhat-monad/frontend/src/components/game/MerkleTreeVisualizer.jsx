// src/components/game/MerkleTreeVisualizer.jsx
import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { ethers } from 'ethers';

// Helper function to create a Merkle Tree (simplified for visualization)
const createMerkleTree = (transactions) => {
  if (!transactions || transactions.length === 0) return { root: null, layers: [] };
  
  // Convert transactions to leaf hashes
  const leaves = transactions.map(tx => 
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(tx))
  );
  
  // Build tree
  let level = leaves;
  const layers = [leaves];
  
  while (level.length > 1) {
    const nextLevel = [];
    
    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 < level.length) {
        // Hash pair of nodes
        const left = level[i];
        const right = level[i + 1];
        const hash = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['bytes32', 'bytes32'], [left, right])
        );
        nextLevel.push(hash);
      } else {
        // Odd number of nodes
        nextLevel.push(level[i]);
      }
    }
    
    layers.push(nextLevel);
    level = nextLevel;
  }
  
  return {
    root: level[0],
    layers: layers
  };
};

const MerkleTreeVisualizer = ({ transactions, selectedIndex, height = 300 }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !transactions || transactions.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create Merkle Tree
    const tree = createMerkleTree(transactions);
    
    // Set colors
    const normalColor = '#888888';
    const highlightColor = '#4CAF50';
    const proofColor = '#2196F3';
    const lineColor = '#555555';
    
    // Calculate dimensions
    const layerCount = tree.layers.length;
    const maxNodesInLayer = Math.max(...tree.layers.map(layer => layer.length));
    const nodeWidth = 20;
    const nodeHeight = 20;
    const layerSpacing = height / (layerCount + 1);
    
    // Calculate proof path
    const proofPath = [];
    if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < transactions.length) {
      let currentIdx = selectedIndex;
      proofPath.push({ layerIdx: 0, nodeIdx: currentIdx });
      
      for (let i = 0; i < tree.layers.length - 1; i++) {
        const isLeft = currentIdx % 2 === 0;
        const siblingIdx = isLeft ? currentIdx + 1 : currentIdx - 1;
        
        // Add sibling to proof path
        if (siblingIdx < tree.layers[i].length) {
          proofPath.push({ layerIdx: i, nodeIdx: siblingIdx, isProof: true });
        }
        
        // Move to parent node in next layer
        currentIdx = Math.floor(currentIdx / 2);
        proofPath.push({ layerIdx: i + 1, nodeIdx: currentIdx });
      }
    }
    
    // Draw each layer
    tree.layers.forEach((layer, layerIdx) => {
      const y = (layerIdx + 1) * layerSpacing;
      const totalLayerWidth = layer.length * nodeWidth * 2;
      const startX = (canvas.width - totalLayerWidth) / 2 + nodeWidth;
      
      layer.forEach((node, nodeIdx) => {
        const x = startX + nodeIdx * nodeWidth * 2;
        
        // Draw connections to parent nodes
        if (layerIdx > 0) {
          const parentLayerIdx = layerIdx - 1;
          const parentNodeIdx = Math.floor(nodeIdx / 2);
          const parentY = (parentLayerIdx + 1) * layerSpacing;
          const parentTotalWidth = tree.layers[parentLayerIdx].length * nodeWidth * 2;
          const parentStartX = (canvas.width - parentTotalWidth) / 2 + nodeWidth;
          const parentX = parentStartX + parentNodeIdx * nodeWidth * 2;
          
          ctx.beginPath();
          ctx.moveTo(x + nodeWidth / 2, y);
          ctx.lineTo(parentX + nodeWidth / 2, parentY + nodeHeight);
          ctx.strokeStyle = lineColor;
          ctx.stroke();
        }
        
        // Check if this node is in the proof path
        const pathNode = proofPath.find(p => p.layerIdx === layerIdx && p.nodeIdx === nodeIdx);
        
        // Select color based on node type
        if (pathNode) {
          if (pathNode.isProof) {
            ctx.fillStyle = proofColor;
          } else {
            ctx.fillStyle = highlightColor;
          }
        } else {
          ctx.fillStyle = normalColor;
        }
        
        // Draw node
        ctx.beginPath();
        ctx.arc(x + nodeWidth / 2, y + nodeHeight / 2, nodeWidth / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Label leaf nodes with indices
        if (layerIdx === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(nodeIdx.toString(), x + nodeWidth / 2, y + nodeHeight / 2);
        }
      });
    });
    
    // Add legend
    const legendX = 10;
    const legendY = canvas.height - 60;
    const legendSpacing = 20;
    
    // Node in path
    ctx.beginPath();
    ctx.arc(legendX + 5, legendY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = highlightColor;
    ctx.fill();
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Selected Path', legendX + 15, legendY);
    
    // Proof node
    ctx.beginPath();
    ctx.arc(legendX + 5, legendY + legendSpacing, 5, 0, 2 * Math.PI);
    ctx.fillStyle = proofColor;
    ctx.fill();
    ctx.fillStyle = '#333333';
    ctx.fillText('Proof Nodes', legendX + 15, legendY + legendSpacing);
    
    // Other nodes
    ctx.beginPath();
    ctx.arc(legendX + 5, legendY + legendSpacing * 2, 5, 0, 2 * Math.PI);
    ctx.fillStyle = normalColor;
    ctx.fill();
    ctx.fillStyle = '#333333';
    ctx.fillText('Other Nodes', legendX + 15, legendY + legendSpacing * 2);
    
  }, [transactions, selectedIndex, height]);

  return (
    <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Merkle Tree Visualization:
      </Typography>
      <Box sx={{ 
        width: '100%', 
        height: `${height}px`, 
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: '#f9f9f9'
      }}>
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={height} 
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
    </Box>
  );
};

export default MerkleTreeVisualizer;