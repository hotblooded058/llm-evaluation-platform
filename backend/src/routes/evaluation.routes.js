const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluation.controller');

// Routes
router.post('/', evaluationController.startEvaluation);
router.get('/', evaluationController.getEvaluations);
router.get('/:id', evaluationController.getEvaluationById);
router.delete('/:id', evaluationController.deleteEvaluation);

module.exports = router; 