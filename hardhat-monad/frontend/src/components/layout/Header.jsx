// src/components/layout/Header.jsx
import React, { useState } from 'react';
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
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Security,
  EmojiEvents,
  AccountCircle,
  Menu as MenuIcon,
  Home,
  PlayArrow,
  EmojiObjects,
  Person,
  Info
} from '@mui/icons-material';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { account, isConnected, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const { playerLevel, securityPoints } = useGame();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navLinks = [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Starting Point', path: '/scriptfun', icon: <PlayArrow /> },
    { text: 'Remote Execution', path: '/remote-execution', icon: <PlayArrow /> },
    { text: 'Chain Labs', path: '/premium-labs', icon: <PlayArrow /> },
    { text: 'Challenges', path: '/game', icon: <EmojiObjects /> },
    { text: 'Profile', path: '/profile', icon: <Person /> },
    { text: 'About', path: '/about', icon: <Info /> }
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        ZeroChain
      </Typography>
      <Divider />
      <List>
        {navLinks.map((link) => (
          <ListItem
            button
            key={link.path}
            component={RouterLink}
            to={link.path}
            sx={{ textAlign: 'left' }}
          >
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
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
                ZeroChain
              </Typography>
            </Link>
          </Box>

          {/* Show buttons only when not mobile */}
          {!isMobile && (
            <Stack
              direction="row"
              spacing={2}
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
          )}

          {isConnected ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                icon={<EmojiEvents />}
                label={`Level ${playerLevel}`}
                color="primary"
                size="small"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              />
              <Chip
                label={`${securityPoints} Points`}
                color="secondary"
                size="small"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
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

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;