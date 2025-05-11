import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getEvaluationById, getDatasetContent } from '../services/api';
import EvaluationResults from '../components/EvaluationResults';

interface EvaluationDetailsProps {}

const EvaluationDetails: React.FC<EvaluationDetailsProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [datasetData, setDatasetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Fetch evaluation details
      const evaluationResponse = await getEvaluationById(id!);
      if (!evaluationResponse.success || !evaluationResponse.data) {
        throw new Error(evaluationResponse.message || 'Failed to fetch evaluation');
      }
      setEvaluation(evaluationResponse.data);

      // Fetch dataset content
      const datasetResponse = await getDatasetContent(evaluationResponse.data.dataset._id);
      if (!datasetResponse.success || !datasetResponse.data) {
        throw new Error(datasetResponse.message || 'Failed to fetch dataset content');
      }
      setDatasetData(datasetResponse.data.rows);

      // If evaluation is completed or failed, stop polling
      if (evaluationResponse.data.status === 'completed' || evaluationResponse.data.status === 'failed') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Stop polling on error
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    } finally {
      setLoading(false);
    }
  }, [id, pollingInterval]);

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Start polling if evaluation is in progress
    if (evaluation?.status === 'in_progress' && !pollingInterval) {
      const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
      setPollingInterval(interval);
    }

    // Cleanup function
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [fetchData, evaluation?.status, pollingInterval]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!evaluation) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Evaluation not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Evaluation Details
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Evaluation Information
        </Typography>
        <Typography>
          <strong>Dataset:</strong> {evaluation.dataset.name}
        </Typography>
        <Typography>
          <strong>Prompt Template:</strong> {evaluation.prompt.name}
        </Typography>
        <Typography>
          <strong>Status:</strong> {evaluation.status}
        </Typography>
        <Typography>
          <strong>Created:</strong> {new Date(evaluation.createdAt).toLocaleString()}
        </Typography>
      </Paper>

      {evaluation.status === 'in_progress' && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography>Evaluation in progress... Results will update automatically.</Typography>
        </Box>
      )}

      <EvaluationResults
        results={evaluation.results}
        datasetData={datasetData}
      />
    </Box>
  );
};

export default EvaluationDetails; 