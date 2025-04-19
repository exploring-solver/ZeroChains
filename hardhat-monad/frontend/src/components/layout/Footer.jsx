// src/components/layout/Footer.jsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  Divider
} from '@mui/material';
import { GitHub } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Blockchain Guardian Game
          </Typography>
          
          <Stack
            direction="row"
            spacing={3}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Link
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <GitHub sx={{ mr: 0.5 }} fontSize="small" />
              GitHub
            </Link>
            <Link href="/terms" color="inherit">
              Terms of Service
            </Link>
            <Link href="/privacy" color="inherit">
              Privacy Policy
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;