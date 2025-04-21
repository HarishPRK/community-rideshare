/**
 * Simplified authentication middleware that sets a mock user
 * This is for development purposes only to bypass full JWT authentication
 */
const simplifiedAuth = (req, res, next) => {
  console.log('Using simplified auth middleware');
  console.log('Headers received:', req.headers);
  
  // Create a mock user
  req.user = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    status: 'ACTIVE'
  };
  
  // Log the bypass
  console.log('Auth bypassed with mock user:', req.user);
  
  // Continue to next middleware/route handler
  next();
};

module.exports = simplifiedAuth;
