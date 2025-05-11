const Prompt = require('../models/prompt.model');

// Create new prompt
exports.createPrompt = async (req, res) => {
  try {
    const prompt = new Prompt(req.body);
    await prompt.save();
    res.status(201).json({
      success: true,
      message: 'Prompt created successfully',
      data: prompt
    });
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get all prompts
exports.getPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find();
    res.json({
      success: true,
      message: 'Prompts retrieved successfully',
      data: prompts
    });
  } catch (error) {
    console.error('Error getting prompts:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get prompt by ID
exports.getPromptById = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ 
        success: false,
        message: 'Prompt not found',
        data: null
      });
    }
    res.json({
      success: true,
      message: 'Prompt retrieved successfully',
      data: prompt
    });
  } catch (error) {
    console.error('Error getting prompt:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Update prompt
exports.updatePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ 
        success: false,
        message: 'Prompt not found',
        data: null
      });
    }

    // Increment version number
    req.body.version = prompt.version + 1;
    
    Object.assign(prompt, req.body);
    await prompt.save();
    res.json({
      success: true,
      message: 'Prompt updated successfully',
      data: prompt
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Delete prompt
exports.deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ 
        success: false,
        message: 'Prompt not found',
        data: null
      });
    }
    await Prompt.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true,
      message: 'Prompt deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
}; 