import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getEvaluations, startEvaluation, deleteEvaluation } from '../services/api';
import { getDatasets, getPrompts } from '../services/api';
import { Evaluation, Dataset, Prompt } from '../types';

const Evaluations: React.FC = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [evaluationsRes, datasetsRes, promptsRes] = await Promise.all([
        getEvaluations(),
        getDatasets(),
        getPrompts(),
      ]);

      if (evaluationsRes.success && evaluationsRes.data) {
        setEvaluations(evaluationsRes.data);
      }
      if (datasetsRes.success && datasetsRes.data) {
        setDatasets(datasetsRes.data);
      }
      if (promptsRes.success && promptsRes.data) {
        setPrompts(promptsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleStartEvaluation = async () => {
    try {
      const response = await startEvaluation(selectedDataset, selectedPrompt);
      if (response.success && response.data) {
        setOpen(false);
        fetchData();
        navigate(`/evaluations/${response.data._id}`);
      }
    } catch (error) {
      console.error('Error starting evaluation:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setEvaluationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!evaluationToDelete) return;

    try {
      const response = await deleteEvaluation(evaluationToDelete);
      if (response.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
    } finally {
      setDeleteDialogOpen(false);
      setEvaluationToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Evaluations</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
        >
          Start New Evaluation
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Dataset</TableCell>
              <TableCell>Prompt</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {evaluations.map((evaluation) => (
              <TableRow key={evaluation._id}>
                <TableCell>{evaluation.dataset?.name || 'N/A'}</TableCell>
                <TableCell>{evaluation.prompt?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={evaluation.status}
                    color={getStatusColor(evaluation.status) as any}
                  />
                </TableCell>
                <TableCell>
                  {new Date(evaluation.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/evaluations/${evaluation._id}`)}
                    sx={{ mr: 1 }}
                  >
                    View Details
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(evaluation._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Start New Evaluation</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Dataset</InputLabel>
              <Select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                label="Dataset"
              >
                {datasets.map((dataset) => (
                  <MenuItem key={dataset._id} value={dataset._id}>
                    {dataset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Prompt</InputLabel>
              <Select
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
                label="Prompt"
              >
                {prompts.map((prompt) => (
                  <MenuItem key={prompt._id} value={prompt._id}>
                    {prompt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStartEvaluation}
            variant="contained"
            color="primary"
            disabled={!selectedDataset || !selectedPrompt}
          >
            Start Evaluation
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this evaluation? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Evaluations; 