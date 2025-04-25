// src/pages/About.jsx
import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import { 
  Security, 
  Code, 
  School, 
  Group,
  Architecture
} from '@mui/icons-material';

const About = () => {
  const sections = [
    {
      icon: <Security />,
      title: 'Our Mission',
      content: 'To make blockchain security education interactive and accessible to developers worldwide.'
    },
    {
      icon: <Code />,
      title: 'Smart Contracts',
      content: 'Learn about smart contract security through hands-on experience with real-world scenarios.'
    },
    {
      icon: <School />,
      title: 'Educational Approach',
      content: 'Progressive learning path from basic concepts to advanced security challenges.'
    },
    {
      icon: <Architecture />,
      title: 'Technical Stack',
      content: 'Built on Ethereum using Solidity, Hardhat, and React with Material-UI.'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom>
          About ZeroChain
        </Typography>
        
        <Grid container spacing={4}>
          {sections.map((section, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {React.cloneElement(section.icon, { sx: { mr: 1, color: 'primary.main' } })}
                  <Typography variant="h5">
                    {section.title}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {section.content}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Why Choose ZeroChain?
          </Typography>
          <List>
            {[
              'Interactive learning through gamification',
              'Real-world security scenarios',
              'Progressive difficulty levels',
              'NFT rewards for completed challenges',
              'Community-driven learning experience'
            ].map((item, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Group color="primary" />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default About;


// src/pages/About.jsx
// import React from 'react';
// import { Link } from 'react-router-dom';

// const About = () => {
//   return (
//     <div className="about-page">
//       <div className="about-header">
//         <h1>About Blockchain Guardian</h1>
//         <p className="subtitle">Educational blockchain security game</p>
//       </div>
      
//       <div className="about-section">
//         <h2>The Mission</h2>
//         <p>
//           Blockchain Guardian is an educational game designed to teach blockchain security concepts
//           through interactive challenges. Our mission is to make blockchain security accessible and 
//           engaging for developers, enthusiasts, and anyone interested in blockchain technology.
//         </p>
//       </div>
      
//       <div className="about-section">
//         <h2>How It Works</h2>
//         <p>
//           The game consists of 5 levels, each focusing on a different aspect of blockchain security:
//         </p>
        
//         <div className="level-explanations">
//           <div className="level-card">
//             <h3>Level 1: Genesis</h3>
//             <p>
//               Learn about transaction signatures and cryptography fundamentals.
//               Verify message signatures on the blockchain to prove authenticity.
//             </p>
//           </div>
          
//           <div className="level-card">
//             <h3>Level 2: Hash Fortress</h3>
//             <p>
//               Understand cryptographic hash functions and their importance in blockchain.
//               Solve hash puzzles that require finding specific inputs for given hash outputs.
//             </p>
//           </div>
          
//           <div className="level-card">
//             <h3>Level 3: Merkle Maze</h3>
//             <p>
//               Explore Merkle trees and how they efficiently verify transaction inclusion.
//               Navigate through a maze of hashes to provide valid Merkle proofs.
//             </p>
//           </div>
          
//           <div className="level-card">
//             <h3>Level 4: Reentrancy Labyrinth</h3>
//             <p>
//               Discover smart contract vulnerabilities, particularly reentrancy attacks.
//               Learn to identify, exploit, and fix vulnerable contracts.
//             </p>
//           </div>
          
//           <div className="level-card">
//             <h3>Level 5: Consensus Arena</h3>
//             <p>
//               Participate in blockchain consensus mechanisms, focusing on Proof-of-Stake.
//               Stake tokens, vote on blocks, and secure the network through consensus.
//             </p>
//           </div>
//         </div>
//       </div>
      
//       <div className="about-section">
//         <h2>Rewards and Recognition</h2>
//         <p>
//           As you complete levels, you'll earn:
//         </p>
//         <ul>
//           <li>Security Points that contribute to your ranking on the global leaderboard</li>
//           <li>Unique NFTs for each level, certifying your blockchain security skills</li>
//           <li>The prestigious "Genesis Guardian" title upon completing all levels</li>
//         </ul>
//       </div>
      
//       <div className="about-section">
//         <h2>Get Started</h2>
//         <p>
//           Ready to become a Blockchain Guardian? Connect your wallet and start your journey today!
//         </p>
//         <div className="cta-buttons">
//           <Link to="/game" className="primary-button">Enter the Game</Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default About;