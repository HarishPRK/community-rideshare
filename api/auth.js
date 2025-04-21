// Import the configured Express app
const app = require('./src/server'); 
// Import the specific router for authentication routes
const authRoutes = require('./src/routes/authRoutes');

// Mount the authentication routes under the /api/auth path
// Note: Vercel routes requests starting with /api/auth to this file.
// The router itself defines paths relative to its mount point (e.g., /register, /login)
// So, we mount it at the root ('/') within this specific handler file.
// However, since the original code mounted *all* routes under /api in server.js,
// and the auth router expects /register (not /api/auth/register),
// let's mount it directly to handle requests coming to this file.
// Vercel maps /api/auth/* -> this file. Express needs to map /* -> authRoutes
// A better approach might be to adjust routes in authRoutes.js to not expect /api/auth
// But let's try this first: mount the specific router.

// Mount the specific router directly. Vercel handles the /api/auth part based on filename.
app.use('/', authRoutes); 

// Export the app instance for Vercel
module.exports = app;
