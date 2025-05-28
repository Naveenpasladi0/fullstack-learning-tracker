const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login.html';
}

const decodedToken = JSON.parse(atob(token.split('.')[1]));
const userName = decodedToken.name;
document.getElementById('greeting').textContent = `Hi ${userName}!`;

const API_BASE_URL = 'https://fullstack-learning-tracker.onrender.com/api';

const modal = document.getElementById('noteModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const noteTitle = document.getElementById('noteTitle');
const noteDescription = document.getElementById('noteDescription');
const notesContainer = document.getElementById('notesContainer');

openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

saveNoteBtn.addEventListener('click', async () => {
  const note = {
    title: noteTitle.value,
    description: noteDescription.value
  };

  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(note)
  });

  if (response.ok) {
    noteTitle.value = '';
    noteDescription.value = '';
    modal.classList.add('hidden');
    loadNotes();
  }
});

let currentlyEditingId = null;

async function loadNotes() {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const notes = await response.json();

  notes.sort((a, b) => b.pinned - a.pinned || new Date(b.createdAt) - new Date(a.createdAt));

  notesContainer.innerHTML = '';
  notes.forEach(note => {
    const noteEl = document.createElement('div');
    noteEl.className = 'bg-white p-4 rounded-lg shadow-md';

    if (currentlyEditingId === note._id) {
      noteEl.innerHTML = `
        <input type="text" value="${note.title}" class="title-input w-full text-lg font-bold mb-2" />
        <textarea class="description-input w-full">${note.description}</textarea>
        <div class="mt-2 flex justify-between">
          <div>
            <button class="save-btn px-4 py-1 rounded bg-blue-500 text-white blur-button">Save</button>
            <button class="delete-btn px-4 py-1 rounded bg-red-500 text-white blur-button">Delete</button>
            <button class="cancel-btn px-4 py-1 rounded bg-gray-400 text-white blur-button">Cancel</button>
          </div>
          <button class="pin-btn px-4 py-1 rounded ${note.pinned ? 'bg-yellow-400' : 'bg-gray-300'} text-white blur-button">
            ${note.pinned ? 'Unpin' : 'Pin'}
          </button>
        </div>
      `;

      noteEl.querySelector('.save-btn').addEventListener('click', async () => {
        const updatedNote = {
          title: noteEl.querySelector('.title-input').value,
          description: noteEl.querySelector('.description-input').value
        };

        await fetch(`${API_BASE_URL}/notes/${note._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedNote)
        });

        currentlyEditingId = null;
        loadNotes();
      });

      noteEl.querySelector('.delete-btn').addEventListener('click', async () => {
        await fetch(`${API_BASE_URL}/notes/${note._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        currentlyEditingId = null;
        loadNotes();
      });

      noteEl.querySelector('.cancel-btn').addEventListener('click', () => {
        currentlyEditingId = null;
        loadNotes();
      });

      noteEl.querySelector('.pin-btn').addEventListener('click', async () => {
        await fetch(`${API_BASE_URL}/notes/${note._id}/pin`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        loadNotes();
      });

    } else {
      noteEl.innerHTML = `
        <h3 class="text-lg font-bold">${note.title}</h3>
        <p>${note.description}</p>
        <div class="mt-2 flex justify-between">
          <button class="edit-btn px-4 py-1 rounded bg-green-500 text-white blur-button">Edit</button>
          <button class="pin-btn px-4 py-1 rounded ${note.pinned ? 'bg-yellow-400' : 'bg-gray-300'} text-white blur-button">
            ${note.pinned ? 'Unpin' : 'Pin'}
          </button>
        </div>
      `;

      noteEl.querySelector('.edit-btn').addEventListener('click', () => {
        currentlyEditingId = note._id;
        loadNotes();
      });

      noteEl.querySelector('.pin-btn').addEventListener('click', async () => {
        await fetch(`${API_BASE_URL}/notes/${note._id}/pin`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        loadNotes();
      });
    }

    notesContainer.appendChild(noteEl);
  });
}

loadNotes();
