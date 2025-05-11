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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getPrompts, createPrompt, updatePrompt, deletePrompt } from '../services/api';
import { Prompt } from '../types';

const Prompts: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: '',
    variables: [] as { name: string; description?: string; required: boolean }[],
    version: 1
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await getPrompts();
      if (response.success && response.data) {
        setPrompts(response.data);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  const handleOpen = (prompt?: Prompt) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({
        name: prompt.name,
        description: prompt.description || '',
        template: prompt.template,
        variables: prompt.variables,
        version: prompt.version
      });
    } else {
      setEditingPrompt(null);
      setFormData({
        name: '',
        description: '',
        template: '',
        variables: [],
        version: 1
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPrompt(null);
    setFormData({
      name: '',
      description: '',
      template: '',
      variables: [],
      version: 1
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingPrompt) {
        const response = await updatePrompt(editingPrompt._id, formData);
        if (response.success) {
          fetchPrompts();
          handleClose();
        }
      } else {
        const response = await createPrompt(formData);
        if (response.success) {
          fetchPrompts();
          handleClose();
        }
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setPromptToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promptToDelete) return;

    try {
      const response = await deletePrompt(promptToDelete);
      if (response.success) {
        fetchPrompts();
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
    } finally {
      setDeleteDialogOpen(false);
      setPromptToDelete(null);
    }
  };

  const handleAddVariable = () => {
    setFormData({
      ...formData,
      variables: [...formData.variables, { name: '', description: '', required: false }],
    });
  };

  const handleVariableChange = (index: number, field: string, value: string | boolean) => {
    const newVariables = [...formData.variables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    setFormData({ ...formData, variables: newVariables });
  };

  const handleRemoveVariable = (index: number) => {
    const newVariables = formData.variables.filter((_, i) => i !== index);
    setFormData({ ...formData, variables: newVariables });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Prompts</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Create Prompt
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Variables</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt._id}>
                <TableCell>{prompt.name}</TableCell>
                <TableCell>{prompt.description}</TableCell>
                <TableCell>
                  {prompt.variables.map((v) => v.name).join(', ')}
                </TableCell>
                <TableCell>{prompt.version}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpen(prompt)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(prompt._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPrompt ? 'Edit Prompt' : 'Create Prompt'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Template"
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              helperText="Use {{variableName}} to reference variables"
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Variables</Typography>
              {formData.variables.map((variable, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    label="Name"
                    value={variable.name}
                    onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                  />
                  <TextField
                    label="Description"
                    value={variable.description}
                    onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                  />
                  <Button
                    color="error"
                    onClick={() => handleRemoveVariable(index)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={handleAddVariable}
              >
                Add Variable
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData.name || !formData.template}
          >
            {editingPrompt ? 'Update' : 'Create'}
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
            Are you sure you want to delete this prompt? This action cannot be undone.
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
    </Box>
  );
};

export default Prompts; 