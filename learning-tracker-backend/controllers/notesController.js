const Note = require('../models/Note');

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ date: -1 }); // Sorting by date directly
    res.json(notes);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ message: 'Server error fetching notes.' });
  }
};

exports.createNote = async (req, res) => {
  const { title, desc } = req.body;
  // Removed 'const date = new Date().toLocaleDateString();'
  // Let Mongoose handle the default 'Date.now' for the 'date' field in the schema.
  try {
    const note = await Note.create({ userId: req.userId, title, desc });
    res.status(201).json({ message: 'Note created successfully', note });
  } catch (err) {
    console.error('Error creating note:', err);
    // If it's a validation error, send a 400. Otherwise, a 500.
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message, errors: err.errors });
    }
    res.status(500).json({ message: 'Server error creating note.' });
  }
};

exports.deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Note.deleteOne({ _id: id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Note not found or not authorized to delete.' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ message: 'Server error deleting note.' });
  }
};

exports.updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, desc } = req.body;
  try {
    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { title, desc },
      { new: true, runValidators: true } // runValidators ensures schema validation on update
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found or not authorized to update.' });
    }
    res.json({ message: 'Note updated successfully', note });
  } catch (err) {
    console.error('Error updating note:', err);
     if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message, errors: err.errors });
    }
    res.status(500).json({ message: 'Server error updating note.' });
  }
};