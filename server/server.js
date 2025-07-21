const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB database!');
  })
  .catch((err) => {
    console.log('❌ MongoDB connection failed:', err);
  });

// Routes
const items = require('./routes/items');
app.use('/api/items', items);

const fairs = require('./routes/fairs');
app.use('/api/fairs', fairs);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Artisan Inventory API is running!',
    timestamp: new Date().toISOString()
  });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
});