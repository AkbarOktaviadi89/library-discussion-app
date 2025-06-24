require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');


const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(e => console.log(e));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.username || 'Anonymous';
  res.locals.userRole = req.session.role;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

app.get('/', (req, res) => {
    if (req.session.userId) {
      if (req.session.role === 'admin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/user/books');
      }
    }
    res.render('index');
  });
  

  const http = require('http').createServer(app);
  const io = require('socket.io')(http);
  const Message = require('./models/Message');
  
  io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);
  
    // Kirim pesan sebelumnya
    const messages = await Message.find().sort({ createdAt: 1 }).limit(50);
    socket.emit('load messages', messages);
  
    // Saat pesan dikirim
    socket.on('chat message', async (data) => {
      console.log('Pesan diterima:', data);
      try {
        const message = new Message({ username: data.username, text: data.text });
        await message.save();
        io.emit('chat message', message);
      } catch (err) {
        console.error('Gagal menyimpan pesan:', err.message);
      }
    });
  
    // ✅ Handler untuk mengetik
    socket.on('typing', (username) => {
      socket.broadcast.emit('typing', username); // kirim ke semua user kecuali pengirim
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
  
  
  http.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
  
