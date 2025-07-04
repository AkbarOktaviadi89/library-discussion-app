const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Request = require('../models/Request');
const Borrow = require('../models/Borrow');
const Message = require('../models/Message');
const User = require('../models/User');
const { isLoggedIn, isAdmin } = require('../middlewares/auth');

// Middleware
router.use(isLoggedIn, isAdmin);

// ✅ Tampilkan daftar buku
router.get('/books', async (req, res) => {
  const books = await Book.find();
  res.render('admin/books', { books });
});

// ✅ Tambah buku
router.post('/books', async (req, res) => {
  const { title, author, tahunTerbit, penerbit, isbn, copies } = req.body;

  await Book.create({
    title,
    author,
    tahunTerbit,
    penerbit,
    isbn,
    copies
  });

  res.redirect('/admin/books');
});

// ✅ Form edit buku
router.get('/books/:id/edit', async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.render('admin/edit_book', { book });
});

// ✅ Update data buku
router.put('/books/:id', async (req, res) => {
  const { title, author, tahunTerbit, penerbit, isbn, copies } = req.body;

  await Book.findByIdAndUpdate(req.params.id, {
    title,
    author,
    tahunTerbit,
    penerbit,
    isbn,
    copies
  });

  res.redirect('/admin/books');
});

// ✅ Hapus buku
router.delete('/books/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect('/admin/books');
});

// ✅ Lihat request buku
router.get('/requests', async (req, res) => {
  const requests = await Request.find().populate('user');
  res.render('admin/requests', { requests });
});

// ✅ Approve request buku
router.post('/requests/:id/approve', async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return res.status(404).send('Request tidak ditemukan');
  }

  // Update status menjadi approved
  request.status = 'disetujui';
  await request.save();

  const existing = await Book.findOne({ isbn: request.isbn });
if (!existing) {
  await Book.create({
    title: request.bookTitle,
    author: request.author,
    tahunTerbit: request.tahunTerbit,
    penerbit: request.penerbit,
    isbn: request.isbn,
    copies: 1
  });
}
  res.redirect('/admin/requests');
});

// ✅ Reject request buku
router.post('/requests/:id/reject', async (req, res) => {
  await Request.findByIdAndUpdate(req.params.id, { status: 'ditolak' });
  res.redirect('/admin/requests');
});

// ✅ Tampilkan daftar peminjaman
router.get('/borrows', async (req, res) => {
  const borrows = await Borrow.find()
    .populate('user', 'username') // hanya ambil name dan email user
    .populate('book', 'title author') // hanya ambil title dan author buku
    .sort({ borrowDate: -1 }); // urutkan dari terbaru

  res.render('admin/borrows', { borrows });
});

// ✅ Hapus daftar peminjaman
router.delete('/borrows/:id', async (req, res) => {
  await Borrow.findByIdAndDelete(req.params.id);
  res.redirect('/admin/borrows');
});


// ✅ Dashboard admin
router.get('/dashboard', async (req, res) => {
  const bookCount = await Book.countDocuments();
  const requestCount = await Request.countDocuments();
  const borrowCount = await Borrow.countDocuments();
  res.render('admin/dashboard', { bookCount, requestCount, borrowCount });
});


router.get('/discussion', async (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  
  const user = await User.findById(req.session.userId);
  res.render('discussion', {
    currentUser: user.username,
    currentUserRole: user.role
  });
});


// ✅ Clear semua pesan diskusi
router.post('/clear-messages', async (req, res) => {
  try {
    await Message.deleteMany({});
    res.redirect('/admin/discussion');
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal menghapus pesan.");
  }
});


// Lihat daftar pengembalian yang perlu divalidasi
router.get('/returns', async (req, res) => {
  const borrows = await Borrow.find({ returnRequested: true, isReturned: false })
    .populate('user', 'username')
    .populate('book', 'title');
  res.render('admin/returns', { borrows });
});

// Validasi pengembalian
router.post('/returns/:id/approve', async (req, res) => {
  const borrow = await Borrow.findById(req.params.id).populate('book');
  if (!borrow) return res.redirect('/admin/borrows');

  const returnDate = new Date();
  const diffTime = returnDate - borrow.borrowDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const fine = diffDays > 14 ? 45000 : 0; 

  borrow.returnDate = returnDate;
  borrow.isReturned = true;
  borrow.returnRequested = false;
  borrow.fine = fine;
  await borrow.save();

  borrow.book.copies += 1;
  await borrow.book.save();

  res.redirect('/admin/borrows');
});

module.exports = router;
