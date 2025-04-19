// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { useGame } from '../../contexts/GameContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Alert,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Lock,
  CheckCircle,
  PlayCircleOutline,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

const Sidebar = ({ isOpen, onClose }) => {
  const { isConnected } = useWeb3();
  const { playerLevel, totalLevels } = useGame();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const renderLevelLinks = () => {
    return Array.from({ length: totalLevels }, (_, i) => {
      const level = i + 1;
      const isCompleted = playerLevel >= level;
      const isLocked = !isConnected || playerLevel < level - 1;
      const isActive = location.pathname === `/level/${level}`;

      return (
        <ListItem key={`level-${level}`} disablePadding>
          <ListItemButton
            component={RouterLink}
            to={`/level/${level}`}
            disabled={isLocked}
            selected={isActive}
          >
            <ListItemIcon>
              {isLocked ? (
                <Lock color="action" />
              ) : isCompleted ? (
                <CheckCircle color="success" />
              ) : (
                <PlayCircleOutline color="primary" />
              )}
            </ListItemIcon>
            <ListItemText 
              primary={`Level ${level}`}
              secondary={getLevelName(level)}
              sx={{
                opacity: isLocked ? 0.5 : 1
              }}
            />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isOpen}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
        '& .MuiDrawer-paperAnchorLeft': {
          [theme.breakpoints.up('sm')]: {
            left: isOpen ? 0 : -DRAWER_WIDTH,
          },
        },
      }}
    >
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Typography variant="h6" gutterBottom>
          Game Levels
        </Typography>
        <IconButton onClick={onClose}>
          {theme.direction === 'ltr' ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>
      <Divider />
      {isConnected ? (
        <List>
          {renderLevelLinks()}
        </List>
      ) : (
        <Box sx={{ p: 2 }}>
          <Alert severity="info">
            Connect your wallet to access game levels
          </Alert>
        </Box>
      )}
    </Drawer>
  );
};

// Helper function to get level names
function getLevelName(level) {
  switch(level) {
    case 1: return "Genesis";
    case 2: return "Hash Fortress";
    case 3: return "Merkle Maze";
    case 4: return "Reentrancy Labyrinth";
    case 5: return "Consensus Arena";
    default: return `Level ${level}`;
  }
}

export default Sidebar;
