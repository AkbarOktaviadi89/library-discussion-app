const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Render Register
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Register handler
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role });
    await user.save();
    res.redirect('/login');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
});

// Render login
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Login handler
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.send('Invalid username or password');
  
  const isMatch = await user.comparePassword(password);
  if(!isMatch) return res.send('Invalid username or password');

  req.session.userId = user._id;
  req.session.username = user.username;
  req.session.role = user.role;

  if(user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }
  res.redirect('/user/books');
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
