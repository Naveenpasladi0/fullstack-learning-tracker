const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Allow CORS from your frontend URL, or use '*' during dev (not recommended for production)
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL if hosted elsewhere
  credentials: true, // if you use cookies or auth headers that require credentials
}));

// Define the port to listen on. Use process.env.PORT for Render, fallback to 5000 for local development.
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Start the server only after successful database connection
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    // It's good practice to exit if the database connection fails on startup
    // process.exit(1); // Uncomment this line if you want the app to exit on DB connection failure
  });