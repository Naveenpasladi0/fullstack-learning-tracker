const apiUrl = "https://fullstack-learning-tracker.onrender.com/api";
const token = localStorage.getItem("token");

// Validate token and redirect if missing
if (!token) {
  window.location.href = "login.html";
}

// Decode token to get username
const payload = JSON.parse(atob(token.split(".")[1]));
const username = payload.name || "User";
document.getElementById("greeting").textContent = `Welcome, ${username}!`;

let editingNoteId = null;

// Modal Elements
const modal = document.getElementById("note-modal");
const openModalBtn = document.getElementById("open-modal");
const closeModalBtn = document.getElementById("close-modal");
const createNoteBtn = document.getElementById("create-note");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");

// Open modal
openModalBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  titleInput.value = "";
  contentInput.value = "";
  titleInput.focus();
});

// Close modal
closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Create new note
createNoteBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert("Please enter both title and content.");
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) throw new Error("Failed to create note");

    modal.classList.add("hidden");
    loadNotes();
  } catch (error) {
    console.error("Error creating note:", error);
  }
});

// Load and render notes
async function loadNotes() {
  try {
    const res = await fetch(`${apiUrl}/notes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch notes");

    const notes = await res.json();
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = "";

    // Sort by pinned then createdAt
    notes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    notes.forEach((note) => {
      const noteCard = document.createElement("div");
      noteCard.className = "bg-white p-4 rounded shadow relative group";
      noteCard.setAttribute("data-id", note._id);

      if (editingNoteId === note._id) {
        // Edit mode
        noteCard.innerHTML = `
          <input type="text" class="title-input w-full text-xl font-bold mb-2 border border-gray-300 rounded px-2 py-1" value="${note.title}">
          <textarea class="content-input w-full text-gray-700 border border-gray-300 rounded px-2 py-1">${note.content}</textarea>
          <div class="mt-4 flex justify-end space-x-2">
            <button class="save-note px-3 py-1 bg-green-500 text-white rounded backdrop-blur-sm hover:bg-green-600">Save</button>
            <button class="cancel-edit px-3 py-1 bg-gray-300 text-gray-700 rounded backdrop-blur-sm hover:bg-gray-400">Cancel</button>
            <button class="delete-note px-3 py-1 bg-red-500 text-white rounded backdrop-blur-sm hover:bg-red-600">Delete</button>
          </div>
        `;
      } else {
        // Display mode
        noteCard.innerHTML = `
          <h3 class="text-xl font-bold mb-2">${note.title}</h3>
          <p class="text-gray-700">${note.content}</p>
          <div class="absolute top-2 right-2 space-x-2 opacity-0 group-hover:opacity-100 transition">
            <button class="edit-note text-blue-500 hover:text-blue-700 backdrop-blur-sm">Edit</button>
            <button class="pin-note text-yellow-500 hover:text-yellow-700 backdrop-blur-sm">${note.pinned ? "Unpin" : "Pin"}</button>
          </div>
        `;
      }

      notesList.appendChild(noteCard);
    });
  } catch (error) {
    console.error("Error loading notes:", error);
  }
}

// Handle actions (edit, save, cancel, delete, pin)
document.getElementById("notes-list").addEventListener("click", async (e) => {
  const noteCard = e.target.closest(".group");
  if (!noteCard) return;

  const noteId = noteCard.getAttribute("data-id");

  // Edit
  if (e.target.classList.contains("edit-note")) {
    editingNoteId = noteId;
    loadNotes();
  }

  // Cancel
  if (e.target.classList.contains("cancel-edit")) {
    editingNoteId = null;
    loadNotes();
  }

  // Save
  if (e.target.classList.contains("save-note")) {
    const newTitle = noteCard.querySelector(".title-input").value.trim();
    const newContent = noteCard.querySelector(".content-input").value.trim();

    try {
      const res = await fetch(`${apiUrl}/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });

      if (!res.ok) throw new Error("Failed to update note");

      editingNoteId = null;
      loadNotes();
    } catch (error) {
      console.error("Error updating note:", error);
    }
  }

  // Delete
  if (e.target.classList.contains("delete-note")) {
    try {
      const res = await fetch(`${apiUrl}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete note");

      editingNoteId = null;
      loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  }

  // Pin/Unpin
  if (e.target.classList.contains("pin-note")) {
    const note = await fetch(`${apiUrl}/notes/${noteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());

    const updatedPinned = !note.pinned;

    try {
      const res = await fetch(`${apiUrl}/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pinned: updatedPinned }),
      });

      if (!res.ok) throw new Error("Failed to toggle pin");

      loadNotes();
    } catch (error) {
      console.error("Error pinning/unpinning note:", error);
    }
  }
});

// Initial load
loadNotes();
