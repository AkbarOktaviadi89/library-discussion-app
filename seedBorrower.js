const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Book = require('./models/Book');
const Borrow = require('./models/Borrow');
const Request = require('./models/Request');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/library-app';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Kosongkan semua koleksi
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      Borrow.deleteMany({}),
      Request.deleteMany({})
    ]);
    console.log('🧹 All collections cleared');

    // Buat user admin
    const admin = new User({
      username: 'admin',
      password: 'admin123', // Akan di-hash oleh middleware
      role: 'admin'
    });
    await admin.save();
    console.log('👤 Admin user created:', admin.username);

    // Buat user biasa
    const borrower = new User({
      username: 'akbar',
      password: 'user123', // Akan di-hash
      role: 'user'
    });
    await borrower.save();
    console.log('👤 Regular user created:', borrower.username);

    // Tambahkan 2 buku
    const books = await Book.insertMany([
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        tahunTerbit: 2008,
        penerbit: 'Prentice Hall',
        isbn: '9780132350884',
        copies: 3
      },
      {
        title: 'You Don’t Know JS',
        author: 'Kyle Simpson',
        tahunTerbit: 2015,
        penerbit: 'O’Reilly Media',
        isbn: '9781491904244',
        copies: 2
      }
    ]);
    console.log('📚 Books created:', books.map(b => b.title));

    // Peminjaman 1: Clean Code, tanggal 1 bulan lalu
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);

    const borrow1 = new Borrow({
      user: borrower._id,
      book: books[0]._id, // Clean Code
      borrowDate: lastMonth,
      returnDate: null,
      returnRequested: false,
      isReturned: false,
      fine: 0
    });
    await borrow1.save();
    books[0].copies -= 1;
    await books[0].save();
    console.log('📄 Borrow 1 created for:', borrower.username);

    // Peminjaman 2: You Don’t Know JS, hari ini
    const borrow2 = new Borrow({
      user: borrower._id,
      book: books[1]._id, // You Don’t Know JS
      borrowDate: new Date(),
      returnDate: null,
      returnRequested: false,
      isReturned: false,
      fine: 0
    });
    await borrow2.save();
    books[1].copies -= 1;
    await books[1].save();
    console.log('📄 Borrow 2 created for:', borrower.username);

    // Selesai
    console.log('🌱 Seeding completed!');
    process.exit();
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
