const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: { // THIS MUST BE 'userId' for your existing notesController
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  desc: { // THIS MUST BE 'desc' for your existing notesController
    type: String,
    required: true
  },
  date: {
    type: Date, // Keep as Date type
    default: Date.now // Mongoose will automatically set current date/time
  },
  pinned: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Note', noteSchema);