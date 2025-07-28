const mongoose = require('mongoose');

const ocrResultSchema = new mongoose.Schema({
  ocrData: { type: mongoose.Schema.Types.Mixed }, // Store the entire OCR result as JSON
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const OcrResult = mongoose.model('OcrResult', ocrResultSchema);

module.exports = OcrResult;
