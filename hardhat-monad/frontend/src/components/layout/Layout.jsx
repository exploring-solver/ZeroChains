// src/components/layout/Layout.jsx
import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const DRAWER_WIDTH = 240;
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onMenuClick={toggleSidebar} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            p: 3,
            backgroundColor: 'background.default',
            transition: theme => theme.transitions.create('margin', {       
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: { sm: `-${isSidebarOpen ? 0 : DRAWER_WIDTH}px` },
          }}
        >
          <Container maxWidth="lg">
            {children}
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;

