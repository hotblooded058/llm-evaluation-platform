const Evaluation = require('../models/evaluation.model');
const Dataset = require('../models/dataset.model');
const Prompt = require('../models/prompt.model');
const { getAllResponses, evaluateResponse } = require('../services/llm.service');
const csv = require('csv-parse');
const fs = require('fs');
const { promisify } = require('util');

// Start new evaluation
exports.startEvaluation = async (req, res) => {
  try {
    const { datasetId, promptId } = req.body;

    const dataset = await Dataset.findById(datasetId);
    const prompt = await Prompt.findById(promptId);

    if (!dataset || !prompt) {
      return res.status(404).json({ 
        success: false,
        message: 'Dataset or prompt not found',
        data: null
      });
    }

    const evaluation = new Evaluation({
      dataset: datasetId,
      prompt: promptId,
      status: 'pending',
      results: []
    });

    await evaluation.save();

    // Start evaluation process in background
    processEvaluation(evaluation._id);

    res.status(201).json({
      success: true,
      message: 'Evaluation started successfully',
      data: evaluation
    });
  } catch (error) {
    console.error('Error starting evaluation:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get evaluation by ID
exports.getEvaluationById = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate('dataset', 'name columns')
      .populate('prompt', 'name template');
    
    if (!evaluation) {
      return res.status(404).json({ 
        success: false,
        message: 'Evaluation not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Evaluation retrieved successfully',
      data: evaluation
    });
  } catch (error) {
    console.error('Error getting evaluation:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get all evaluations
exports.getEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .populate('dataset', 'name')
      .populate('prompt', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Evaluations retrieved successfully',
      data: evaluations
    });
  } catch (error) {
    console.error('Error getting evaluations:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Delete evaluation
exports.deleteEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({ 
        success: false,
        message: 'Evaluation not found',
        data: null
      });
    }

    await evaluation.deleteOne();
    
    res.json({
      success: true,
      message: 'Evaluation deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Helper function to process evaluation
async function processEvaluation(evaluationId) {
  try {
    const evaluation = await Evaluation.findById(evaluationId)
      .populate('dataset')
      .populate('prompt');

    if (!evaluation) {
      throw new Error('Evaluation not found');
    }

    evaluation.status = 'in_progress';
    await evaluation.save();

    const fileContent = fs.readFileSync(evaluation.dataset.filePath, 'utf-8');
    
    // Parse CSV using promises
    const parseCSV = promisify(csv.parse);
    const records = await parseCSV(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      let generatedPrompt = evaluation.prompt.template;

      // Replace variables in prompt template
      evaluation.prompt.variables.forEach(variable => {
        const value = record[variable.name];
        if (value) {
          generatedPrompt = generatedPrompt.replace(
            new RegExp(`{{${variable.name}}}`, 'g'),
            value
          );
        }
      });

      try {
        console.log(`Processing row ${i}...`);
        
        // Step 1: Get responses from both LLMs
        const responses = await getAllResponses(generatedPrompt);

        const modelResponses = [];

        // Step 2: Use Gemini to evaluate both responses
        if (responses.gemini && responses.gemini !== 'Failed to get response') {
          try {
            const scores = await evaluateResponse(responses.gemini, generatedPrompt, record);
            modelResponses.push({
              model: 'gemini',
              response: responses.gemini,
              scores: scores
            });
          } catch (error) {
            console.error(`Error evaluating Gemini response:`, error);
            modelResponses.push({
              model: 'gemini',
              response: responses.gemini,
              scores: { correctness: 1, faithfulness: 1 },
              error: error.message
            });
          }
        }

        if (responses.groq && responses.groq !== 'Groq API not configured' && responses.groq !== 'Failed to get response') {
          try {
            const scores = await evaluateResponse(responses.groq, generatedPrompt, record);
            modelResponses.push({
              model: 'groq',
              response: responses.groq,
              scores: scores
            });
          } catch (error) {
            console.error(`Error evaluating Groq response:`, error);
            modelResponses.push({
              model: 'groq',
              response: responses.groq,
              scores: { correctness: 1, faithfulness: 1 },
              error: error.message
            });
          }
        }

        if (responses.groq2 && responses.groq2 !== 'Groq2 API not configured' && responses.groq2 !== 'Failed to get response') {
          try {
            const scores = await evaluateResponse(responses.groq2, generatedPrompt, record);
            modelResponses.push({
              model: 'groq2',
              response: responses.groq2,
              scores: scores
            });
          } catch (error) {
            console.error(`Error evaluating Groq response:`, error);
            modelResponses.push({
              model: 'groq2',
              response: responses.groq2,
              scores: { correctness: 1, faithfulness: 1 },
              error: error.message
            });
          }
        }

        evaluation.results.push({
          rowIndex: i,
          generatedPrompt,
          responses: modelResponses
        });

        await evaluation.save();
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        evaluation.results.push({
          rowIndex: i,
          generatedPrompt,
          error: error.message,
          responses: []
        });
        await evaluation.save();
      }
    }

    console.log('All rows processed, marking evaluation as completed');
    evaluation.status = 'completed';
    await evaluation.save();
    console.log('Evaluation completed successfully');
  } catch (error) {
    console.error('Evaluation processing error:', error);
    const evaluation = await Evaluation.findById(evaluationId);
    if (evaluation) {
      console.log('Marking evaluation as failed due to error');
      evaluation.status = 'failed';
      evaluation.error = error.message;
      await evaluation.save();
    }
  }
} 