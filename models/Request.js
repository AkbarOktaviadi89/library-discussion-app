const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookTitle: String,
  author: String,
  tahunTerbit: Number,
  penerbit: String,
  isbn: String,
  status: { type: String, enum: ['pending', 'disetujui', 'ditolak'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
