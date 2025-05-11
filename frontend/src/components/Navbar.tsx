import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          LLM Evaluation Platform
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/datasets"
          >
            Datasets
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/prompts"
          >
            Prompts
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/evaluations"
          >
            Evaluations
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 