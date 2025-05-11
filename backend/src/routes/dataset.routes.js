const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const datasetController = require('../controllers/dataset.controller');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  }
});

// Routes
router.post('/', upload.single('file'), datasetController.uploadDataset);
router.get('/', datasetController.getDatasets);
router.get('/:id', datasetController.getDatasetById);
router.get('/:id/content', datasetController.getDatasetContent);
router.delete('/:id', datasetController.deleteDataset);

module.exports = router; 