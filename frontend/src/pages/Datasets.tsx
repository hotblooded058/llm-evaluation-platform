import React, { useEffect, useState } from 'react';
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
  TextField,
  IconButton,
  Alert,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getDatasets, uploadDataset, deleteDataset, getDatasetContent } from '../services/api';
import { Dataset } from '../types';

const Datasets: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [selectedDatasetContent, setSelectedDatasetContent] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await getDatasets();
      if (response.success && response.data) {
        setDatasets(response.data);
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !name) {
      setError('Please select a file and provide a name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await uploadDataset(file, name, description);
      if (response.success) {
        setOpen(false);
        setFile(null);
        setName('');
        setDescription('');
        fetchDatasets();
      } else {
        setError(response.message || 'Failed to upload dataset');
      }
    } catch (error) {
      setError('Error uploading dataset');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDatasetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!datasetToDelete) return;

    try {
      const response = await deleteDataset(datasetToDelete);
      if (response.success) {
        fetchDatasets();
      } else {
        setError(response.message || 'Failed to delete dataset');
      }
    } catch (error) {
      setError('Error deleting dataset');
    } finally {
      setDeleteDialogOpen(false);
      setDatasetToDelete(null);
    }
  };

  const handleRowClick = async (id: string) => {
    try {
      setLoading(true);
      const response = await getDatasetContent(id);
      if (response.success && response.data) {
        setSelectedDatasetContent(response.data);
        setContentDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching dataset content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Datasets</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
        >
          Upload Dataset
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Columns</TableCell>
              <TableCell>Rows</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datasets.map((dataset) => (
              <TableRow 
                key={dataset._id}
                onClick={() => handleRowClick(dataset._id)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
              >
                <TableCell>{dataset.name}</TableCell>
                <TableCell>{dataset.description}</TableCell>
                <TableCell>{dataset.columns.join(', ')}</TableCell>
                <TableCell>{dataset.rowCount}</TableCell>
                <TableCell>
                  {new Date(dataset.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(dataset._id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Upload Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Upload Dataset</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ marginBottom: '1rem' }}
            />
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={loading || !file || !name}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this dataset? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dataset Content Dialog */}
      <Dialog 
        open={contentDialogOpen} 
        onClose={() => setContentDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}>
          Dataset Content
          <Button 
            onClick={() => setContentDialogOpen(false)}
            color="inherit"
            sx={{ minWidth: 'auto' }}
          >
            ✕
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : selectedDatasetContent ? (
            <TableContainer 
              component={Paper} 
              sx={{ 
                mt: 2,
                maxHeight: '70vh',
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                borderRadius: 1
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                        borderBottom: '2px solid #e0e0e0',
                        whiteSpace: 'nowrap',
                        px: 2,
                        py: 1.5,
                        width: '60px',
                        textAlign: 'center'
                      }}
                    >
                      #
                    </TableCell>
                    {selectedDatasetContent.columns.map((column) => (
                      <TableCell 
                        key={column}
                        sx={{ 
                          backgroundColor: '#f5f5f5',
                          fontWeight: 'bold',
                          borderBottom: '2px solid #e0e0e0',
                          whiteSpace: 'nowrap',
                          px: 2,
                          py: 1.5
                        }}
                      >
                        {column}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedDatasetContent.rows.map((row, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                        '&:hover': { backgroundColor: '#f5f5f5' }
                      }}
                    >
                      <TableCell 
                        sx={{ 
                          borderBottom: '1px solid #e0e0e0',
                          px: 2,
                          py: 1.5,
                          textAlign: 'center',
                          color: '#666',
                          fontWeight: 'medium'
                        }}
                      >
                        {index + 1}
                      </TableCell>
                      {selectedDatasetContent.columns.map((column) => (
                        <TableCell 
                          key={`${index}-${column}`}
                          sx={{ 
                            borderBottom: '1px solid #e0e0e0',
                            px: 2,
                            py: 1.5,
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Tooltip title={row[column] || ''} placement="top" arrow>
                            <Box component="span" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {row[column]}
                            </Box>
                          </Tooltip>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Datasets; 