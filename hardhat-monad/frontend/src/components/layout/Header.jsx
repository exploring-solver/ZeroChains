// src/components/layout/Header.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { useGame } from '../../contexts/GameContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Link,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Divider
} from '@mui/material';
import {
  Security,
  EmojiEvents,
  AccountCircle,
  Menu as MenuIcon
} from '@mui/icons-material';

const Header = () => {
  const { account, isConnected, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const { playerLevel, securityPoints } = useGame();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navLinks = [
    { text: 'Home', path: '/' },
    { text: 'Game', path: '/game' },
    { text: 'Profile', path: '/profile' },
    { text: 'About', path: '/about' }
  ];

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            edge="start"
            color="inherit"
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Link
            component={RouterLink}
            to="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Security sx={{ mr: 1 }} />
            <Typography variant="h6" noWrap>
              Blockchain Guardian
            </Typography>
          </Link>
        </Box>

        <Stack 
          direction="row" 
          spacing={2}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          {navLinks.map((link) => (
            <Button
              key={link.path}
              component={RouterLink}
              to={link.path}
              color="inherit"
            >
              {link.text}
            </Button>
          ))}
        </Stack>

        {isConnected ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<EmojiEvents />}
              label={`Level ${playerLevel}`}
              color="primary"
              size="small"
            />
            <Chip
              label={`${securityPoints} Points`}
              color="secondary"
              size="small"
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                avatar={<Avatar><AccountCircle /></Avatar>}
                label={formatAddress(account)}
                variant="outlined"
                onClick={disconnectWallet}
              />
            </Box>
          </Stack>
        ) : (
          <Button
            variant="contained"
            onClick={connectWallet}
            disabled={isConnecting}
            startIcon={<AccountCircle />}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;

