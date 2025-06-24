const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Request = require('../models/Request');
const { isLoggedIn, isUser } = require('../middlewares/auth');
const Borrow = require('../models/Borrow');

router.use(isLoggedIn, isUser);

// List buku
router.get('/books', async (req, res) => {
  const books = await Book.find();
  const borrowed = await Borrow.find({ user: req.session.userId }).select('book');
  
  // Buat daftar ID buku yang sudah dipinjam user
  const borrowedBookIds = borrowed.map(b => b.book.toString());

  res.render('user/books', { books, borrowedBookIds });
});


// Pinjam buku
router.post('/books/:id/borrow', async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (book.copies < 1) {
    return res.send('Buku tidak tersedia');
  }

  // Kurangi stok buku
  book.copies -= 1;
  await book.save();

  // Simpan riwayat peminjaman
  await Borrow.create({
    user: req.session.userId,
    book: book._id
  });

  res.redirect('/user/borrowed');
});

// Request buku baru
router.get('/requests', async (req, res) => {
  const requests = await Request.find({ user: req.session.userId });
  res.render('user/requests', { requests });
});

router.post('/requests', async (req, res) => {
  const { bookTitle, author, tahunTerbit, penerbit, isbn } = req.body;

  await Request.create({
    user: req.session.userId,
    bookTitle,
    author,
    tahunTerbit,
    penerbit,
    isbn,
    status: 'pending'
  });

  res.redirect('/user/requests');
});

// Lihat buku yang dipinjam
router.get('/borrowed', async (req, res) => {
    const borrows = await Borrow.find({ user: req.session.userId }).populate('book');
    res.render('user/borrowed', { borrows });
  });
  
// Tampilkan form tambah request buku
router.get('/requests/new', (req, res) => {
  res.render('user/request-form');
});


router.get('/discussion', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.render('discussion');
});

module.exports = router;
