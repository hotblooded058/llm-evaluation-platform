import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { getDatasets, getPrompts, getEvaluations } from '../services/api';
import { Dataset, Prompt, Evaluation } from '../types';

const Dashboard: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [datasetsRes, promptsRes, evaluationsRes] = await Promise.all([
          getDatasets(),
          getPrompts(),
          getEvaluations(),
        ]);

        if (datasetsRes.success && datasetsRes.data) {
          setDatasets(datasetsRes.data);
        }
        if (promptsRes.success && promptsRes.data) {
          setPrompts(promptsRes.data);
        }
        if (evaluationsRes.success && evaluationsRes.data) {
          setEvaluations(evaluationsRes.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Datasets
              </Typography>
              <Typography variant="h3" gutterBottom>
                {datasets.length}
              </Typography>
              <Button
                component={RouterLink}
                to="/datasets"
                variant="contained"
                color="primary"
              >
                Manage Datasets
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Prompts
              </Typography>
              <Typography variant="h3" gutterBottom>
                {prompts.length}
              </Typography>
              <Button
                component={RouterLink}
                to="/prompts"
                variant="contained"
                color="primary"
              >
                Manage Prompts
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evaluations
              </Typography>
              <Typography variant="h3" gutterBottom>
                {evaluations.length}
              </Typography>
              <Button
                component={RouterLink}
                to="/evaluations"
                variant="contained"
                color="primary"
              >
                View Evaluations
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 