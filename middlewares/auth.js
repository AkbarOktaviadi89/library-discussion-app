const User = require('../models/User'); 

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    next();
  };
  
  module.exports.isAdmin = (req, res, next) => {
    if (req.session.role !== 'admin') {
      return res.status(403).send('Forbidden');
    }
    next();
  };
  
  module.exports.isUser = (req, res, next) => {
    if (req.session.role !== 'user') {
      return res.status(403).send('Forbidden');
    }
    next();
  };
  