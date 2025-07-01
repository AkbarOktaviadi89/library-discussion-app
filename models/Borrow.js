const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  borrowDate: { type: Date, default: Date.now },
  returnDate: Date,
  returnRequested: { type: Boolean, default: false },
  isReturned: { type: Boolean, default: false },
  fine: { type: Number, default: 0 }
});


module.exports = mongoose.model('Borrow', borrowSchema);
