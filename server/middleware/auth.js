import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chitfund_jwt_secret_2026';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Auth: No token provided in request');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Auth: Invalid token -', error.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error('❌ Auth: No user found in request');
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      console.error(`❌ Auth: User ${req.user.userId} with role ${req.user.role} attempted to access restricted resource`);
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: user.modules || [],
      permissions: user.permissions || []
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
