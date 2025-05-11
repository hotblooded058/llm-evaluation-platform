const Dataset = require('../models/dataset.model');
const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Upload and process dataset
exports.uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded',
        data: null
      });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse CSV to get columns and row count
    const parser = csv.parse({
      columns: true,
      skip_empty_lines: true
    });

    const records = [];
    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on('end', async function() {
      const columns = Object.keys(records[0] || {});
      
      const dataset = new Dataset({
        name: req.body.name || path.parse(req.file.originalname).name,
        description: req.body.description,
        filePath,
        columns,
        rowCount: records.length
      });

      await dataset.save();
      res.status(201).json({
        success: true,
        message: 'Dataset uploaded successfully',
        data: dataset
      });
    });

    parser.write(fileContent);
    parser.end();
  } catch (error) {
    console.error('Error uploading dataset:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get all datasets
exports.getDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find().select('-filePath');
    res.json({
      success: true,
      message: 'Datasets retrieved successfully',
      data: datasets
    });
  } catch (error) {
    console.error('Error getting datasets:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get dataset by ID
exports.getDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ 
        success: false,
        message: 'Dataset not found',
        data: null
      });
    }
    res.json({
      success: true,
      message: 'Dataset retrieved successfully',
      data: dataset
    });
  } catch (error) {
    console.error('Error getting dataset:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Delete dataset
exports.deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ 
        success: false,
        message: 'Dataset not found',
        data: null
      });
    }

    // Delete the file
    if (fs.existsSync(dataset.filePath)) {
      fs.unlinkSync(dataset.filePath);
    }

    await Dataset.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true,
      message: 'Dataset deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get dataset content
exports.getDatasetContent = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ 
        success: false,
        message: 'Dataset not found',
        data: null
      });
    }

    const fileContent = fs.readFileSync(dataset.filePath, 'utf-8');
    
    // Parse CSV using promises
    const parseCSV = promisify(csv.parse);
    const records = await parseCSV(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    res.json({
      success: true,
      message: 'Dataset content retrieved successfully',
      data: {
        columns: dataset.columns,
        rows: records
      }
    });
  } catch (error) {
    console.error('Error getting dataset content:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: null
    });
  }
}; 