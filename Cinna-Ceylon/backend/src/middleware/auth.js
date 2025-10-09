import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
console.log('🔐 Auth middleware JWT_SECRET:', JWT_SECRET);

export default (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded successfully:', { id: decoded.id, userType: decoded.userType, isAdmin: decoded.isAdmin });
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    res.status(401).json({ error: 'Token is not valid', details: err.message });
  }
};
