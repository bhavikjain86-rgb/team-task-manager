const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env before using
dotenv.config();

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173'] : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    db_url_exists: !!process.env.DATABASE_URL
  });
});

app.get('/api/debug-path', (req, res) => {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  res.json({
    dirname: __dirname,
    clientBuildPath,
    exists: fs.existsSync(clientBuildPath),
    files: fs.existsSync(clientBuildPath) ? fs.readdirSync(clientBuildPath) : []
  });
});

// Serve Frontend
const clientBuildPath = path.join(__dirname, '../../client/dist');
console.log('[TaskFlow] Client dist path:', clientBuildPath);
console.log('[TaskFlow] Client dist exists:', fs.existsSync(clientBuildPath));

app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
  // If it's an API route that didn't match, let it go to 404 or error handler
  if (req.path.startsWith('/api')) return next();
  
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next(); // Fall through to the final handler
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[TaskFlow] Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Final 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <h2>404 - Not Found</h2>
    <p>Route: ${req.path}</p>
    <p>If this is the home page, the frontend build might be missing.</p>
    <p>Check /api/debug-path for details.</p>
  `);
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
