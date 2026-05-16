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
  res.json({ status: 'ok' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Serve Frontend
const clientBuildPath = path.join(__dirname, '../../client/dist');
const fs = require('fs');
console.log('Looking for client build at:', clientBuildPath);
console.log('Client dist exists:', fs.existsSync(clientBuildPath));

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(503).send(`
      <h2>Build not found</h2>
      <p>Expected at: ${clientBuildPath}</p>
      <p>Server working correctly — frontend build step may have failed.</p>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
