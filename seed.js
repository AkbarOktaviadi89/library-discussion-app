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
    const user = new User({
      username: 'admin',
      password: 'admin123', // Akan di-hash oleh middleware
      role: 'admin'
    });
    await user.save();
    console.log('👤 Admin user created:', user.username);

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

    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

seed();
