const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    let userId;
    let userEmail;

    if (error || !user) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        userEmail = decoded.email;
      } catch (jwtErr) {
        return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
      }
    } else {
      userId = user.id;
      userEmail = user.email;
    }

    // Get role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    req.user = {
      id: userId,
      email: userEmail,
      role: profile ? profile.role : 'client'
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Not authorized' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
