const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();

// ✅ Use CORS BEFORE defining routes — apply to all incoming requests
app.use(cors({
  origin: 'https://learning-tracker-frontend-static.onrender.com', // Your frontend domain
  credentials: true
}));

app.use(express.json());

// ✅ Define routes AFTER CORS is applied
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// ✅ PORT setup
const PORT = process.env.PORT || 5000;

// ✅ MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
