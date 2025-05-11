const express = require('express');
const router = express.Router();
const promptController = require('../controllers/prompt.controller');

// Routes
router.post('/', promptController.createPrompt);
router.get('/', promptController.getPrompts);
router.get('/:id', promptController.getPromptById);
router.put('/:id', promptController.updatePrompt);
router.delete('/:id', promptController.deletePrompt);

module.exports = router; 