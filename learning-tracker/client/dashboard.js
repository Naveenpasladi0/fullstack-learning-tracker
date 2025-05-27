const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'index.html';
}

function getUserNameFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.name || 'User';
  } catch {
    return 'User';
  }
}

const userName = getUserNameFromToken(token);
document.querySelector('h2').innerHTML = `Welcome, <span style="display: inline-flex; align-items: center; gap: 4px;">${userName} <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="30px" fill="#e3e3e3" style="vertical-align: middle;"><path d="m430-500 283-283q12-12 28-12t28 12q12 12 12 28t-12 28L487-444l-57-56Zm99 99 254-255q12-12 28.5-12t28.5 12q12 12 12 28.5T840-599L586-345l-57-56ZM211-211q-91-91-91-219t91-219l120-120 59 59q7 7 12 14.5t10 15.5l148-149q12-12 28.5-12t28.5 12q12 12 12 28.5T617-772L444-599l-85 84 19 19q46 46 44 110t-49 111l-57-56q23-23 25.5-54.5T321-440l-47-46q-12-12-12-28.5t12-28.5l57-56q12-12 12-28.5T331-656l-64 64q-68 68-68 162.5T267-267q68 68 163 68t163-68l239-240q12-12 28.5-12t28.5 12q12 12 12 28.5T889-450L649-211q-91 91-219 91t-219-91Zm219-219ZM680-39v-81q66 0 113-47t47-113h81q0 100-70.5 170.5T680-39ZM39-680q0-100 70.5-170.5T280-921v81q-66 0-113 47t-47 113H39Z"/></svg></span>`;

const addNoteBtn = document.getElementById('addNoteBtn');
const noteModal = document.getElementById('noteModal');
const closeModal = document.getElementById('closeModal');
const saveNote = document.getElementById('saveNote');
const noteTitle = document.getElementById('noteTitle');
const noteDesc = document.getElementById('noteDesc');
const notesContainer = document.getElementById('notesContainer');
const logoutBtn = document.querySelector('nav button');

function applyBlurBackgroundToButtons() {
  const blurStyle = `background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);`;
  if (addNoteBtn) {
    addNoteBtn.style.cssText += blurStyle;
    addNoteBtn.addEventListener('mouseenter', () => addNoteBtn.style.opacity = '0.9');
    addNoteBtn.addEventListener('mouseleave', () => addNoteBtn.style.opacity = '1');
  }

  if (logoutBtn) {
    logoutBtn.style.cssText += blurStyle;
    logoutBtn.addEventListener('mouseenter', () => logoutBtn.style.opacity = '0.9');
    logoutBtn.addEventListener('mouseleave', () => logoutBtn.style.opacity = '1');
  }
}

addNoteBtn.addEventListener('click', () => noteModal.classList.remove('hidden'));
closeModal.addEventListener('click', () => {
  noteModal.classList.add('hidden');
  noteTitle.value = ''; // Clear fields on cancel
  noteDesc.value = '';  // Clear fields on cancel
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
});

window.addEventListener('DOMContentLoaded', () => {
  applyBlurBackgroundToButtons();
  loadNotes();
});

let currentlyEditingId = null;

async function loadNotes() {
  try {
    const res = await fetch('https://fullstack-learning-tracker.onrender.com/api/notes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      return window.location.href = 'index.html';
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to load notes');
    }

    const notes = await res.json();

    // Sort by pinned first, then by date (most recent first)
    notes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date) - new Date(a.date);
    });

    notesContainer.innerHTML = ''; // Clear existing notes before adding new ones

    notes.forEach(note => {
      // Your rendering logic here (already correct in your code)
    });

  } catch (err) {
    console.error('Error loading notes:', err);
    alert('Failed to load notes: ' + err.message);
  }
}

      // Add 'pinned-note' class if the note is pinned for optional styling
      if (note.pinned) {
        noteEl.classList.add('pinned-note');
      }

      if (currentlyEditingId === note._id) {
        // Render in editing mode
        noteEl.innerHTML = `
          <input type="text" class="title-input w-full mb-2 px-2 py-1 rounded bg-white/20 text-white placeholder:text-white/80" value="${note.title}" />
          <textarea class="desc-input w-full mb-2 px-2 py-1 rounded bg-white/20 text-white placeholder:text-white/80" rows="3">${note.desc}</textarea>
          <div class="flex justify-between items-center">
            <button class="pin-btn text-yellow-400 hover:text-yellow-500 text-xl" title="Pin/Unpin Note">${note.pinned ? '<svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor"><path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"/></svg>'}</button>
            <div class="flex space-x-2">
              <button class="save-edit-btn px-3 py-1 rounded text-sm text-white font-bold bg-transparent backdrop-blur-sm border border-white/20 hover:bg-green-500 transition duration-200">Save</button>
              <button class="delete-btn px-3 py-1 rounded text-sm text-white font-bold bg-transparent backdrop-blur-sm border border-white/20 hover:bg-red-500 transition duration-200">Delete</button>
              <button class="cancel-btn px-3 py-1 rounded text-sm text-white font-bold bg-transparent backdrop-blur-sm border border-white/20 hover:bg-gray-500 transition duration-200">Cancel</button>
            </div>
          </div>
        `;
        const titleInput = noteEl.querySelector('.title-input');
        const descInput = noteEl.querySelector('.desc-input');

        noteEl.querySelector('.save-edit-btn').addEventListener('click', async (e) => {
          e.stopPropagation();
          const updatedTitle = titleInput.value.trim();
          const updatedDesc = descInput.value.trim();

          if (!updatedTitle || !updatedDesc) {
            alert('Both title and description are required.');
            return;
          }

          try {
            const updateRes = await fetch(`http://localhost:5000/api/notes/${note._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ title: updatedTitle, desc: updatedDesc })
            });

            if (!updateRes.ok) {
              const errorData = await updateRes.json();
              throw new Error(errorData.message || 'Update failed');
            }

            currentlyEditingId = null;
            loadNotes();
          } catch (err) {
            console.error('Error updating note:', err);
            alert('Failed to update note: ' + err.message);
          }
        });

        noteEl.querySelector('.delete-btn').addEventListener('click', async (e) => {
          e.stopPropagation();
          const confirmDelete = confirm('Are you sure you want to delete this note?');
          if (!confirmDelete) return;

          try {
            const deleteRes = await fetch(`http://localhost:5000/api/notes/${note._id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (!deleteRes.ok) {
              const errorData = await deleteRes.json();
              throw new Error(errorData.message || 'Delete failed');
            }

            currentlyEditingId = null;
            loadNotes();
          } catch (err) {
            console.error('Error deleting note:', err);
            alert('Failed to delete note: ' + err.message);
          }
        });

        noteEl.querySelector('.cancel-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          currentlyEditingId = null;
          loadNotes();
        });

        // Pin button for editing mode (already existing, but ensure it works)
        noteEl.querySelector('.pin-btn').addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            const res = await fetch(`http://localhost:5000/api/notes/${note._id}/pin`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || 'Pin toggle failed');
            }
            loadNotes();
          } catch (err) {
            console.error('Error pinning/unpinning note:', err);
            alert('Failed to pin/unpin note: ' + err.message);
          }
        });

      } else {
        // Render in display mode
        noteEl.innerHTML = `
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold mb-1">${note.title}</h3>
            <button class="pin-display-btn text-xl" title="Pin/Unpin Note">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${note.pinned ? '#FBBF24' : '#E3E3E3'}"><path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"/></svg>
            </button>
          </div>
          <p class="whitespace-pre-wrap">${note.desc}</p>
          <p class="text-sm text-gray-400 mt-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="200 -860 760 960" width="26px" fill="#e3e3e3" class="mr-1">
            <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/>
            </svg>${new Date(note.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        `;
        // Attach event listener for the new pin icon in display mode
        noteEl.querySelector('.pin-display-btn').addEventListener('click', async (e) => {
          e.stopPropagation(); // Prevent the note from entering edit mode
          try {
            const res = await fetch(`http://localhost:5000/api/notes/${note._id}/pin`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || 'Pin toggle failed');
            }
            loadNotes(); // Reload notes to reorder and update icon
          } catch (err) {
            console.error('Error pinning/unpinning note:', err);
            alert('Failed to pin/unpin note: ' + err.message);
          }
        });

        // Existing click listener for editing the note
        noteEl.addEventListener('click', () => {
          currentlyEditingId = note._id;
          loadNotes();
        });
      }

saveNote.addEventListener('click', async () => {
  const title = noteTitle.value.trim();
  const desc = noteDesc.value.trim();
  if (!title || !desc) return alert('Please fill in all fields.');

  try {
    const res = await fetch('http://localhost:5000/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, desc }) // Sending 'desc' not 'description'
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      return window.location.href = 'index.html';
    }

    if (!res.ok) { // Check for non-2xx responses from the backend
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to save note.');
    }

    noteTitle.value = '';
    noteDesc.value = '';
    noteModal.classList.add('hidden');
    loadNotes(); // Reload notes after successful save

  } catch (err) {
    console.error('Failed to save note:', err);
    alert('Error saving note: ' + err.message);
  }
});