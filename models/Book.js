const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  tahunTerbit: Number,
  penerbit: String,
  isbn: String,
  copies: { type: Number, default: 1 }, 
});

module.exports = mongoose.model('Book', bookSchema);
