const express = require('express');
const {
  getNotes,
  createNote,
  deleteNote,
  updateNote
} = require('../controllers/notesController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', auth, (req, res, next) => {
  console.log('GET /api/notes hit by user', req.userId);
  next();
}, getNotes);

router.post('/', auth, (req, res, next) => { // Added console log for POST
  console.log('POST /api/notes hit by user', req.userId, 'with body:', req.body);
  next();
}, createNote);
router.delete('/:id', auth, deleteNote);
router.put('/:id', auth, updateNote);

const Note = require('../models/Note'); // This is already imported at the top, no need to re-import

router.patch('/:id/pin', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId })

    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.pinned = !note.pinned;
    await note.save();

    res.json({ message: `Note ${note.pinned ? 'pinned' : 'unpinned'} successfully.`, note }); // Return updated note
  } catch (err) {
    console.error('Error toggling pin:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;