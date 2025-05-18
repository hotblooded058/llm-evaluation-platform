const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  dataset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true
  },
  prompt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true
  },
  results: [{
    rowIndex: {
      type: Number,
      required: true
    },
    generatedPrompt: {
      type: String,
      required: true
    },
    responses: [{
      model: {
        type: String,
        required: true,
        enum: ['groq', 'gemini', 'groq2']
      },
      response: {
        type: String,
        required: true
      },
      scores: {
        correctness: {
          type: Number,
          required: true,
          min: 1,
          max: 10
        },
        faithfulness: {
          type: Number,
          required: true,
          min: 1,
          max: 10
        }
      }
    }]
  }],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

evaluationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Evaluation', evaluationSchema); 