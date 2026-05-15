const API_BASE_URL = "https://notes-backend-235-325409493725.us-central1.run.app/api/v1/notes";

const noteForm = document.getElementById("noteForm");
const noteIdInput = document.getElementById("noteId");
const judulInput = document.getElementById("judul");
const isiInput = document.getElementById("isi");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const refreshBtn = document.getElementById("refreshBtn");
const statusText = document.getElementById("statusText");
const notesContainer = document.getElementById("notesContainer");
const noteDetail = document.getElementById("noteDetail");
const detailTitle = document.getElementById("detailTitle");
const detailBody = document.getElementById("detailBody");
const detailMeta = document.getElementById("detailMeta");
const detailEditBtn = document.getElementById("detailEditBtn");
const detailDeleteBtn = document.getElementById("detailDeleteBtn");

let cachedNotes = [];
let selectedNoteId = null;

const setStatus = (message) => {
  statusText.textContent = message;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const resetForm = () => {
  noteIdInput.value = "";
  noteForm.reset();
  submitBtn.textContent = "Simpan Catatan";
  cancelEditBtn.classList.add("hidden");
};

const renderNoteDetail = (note) => {
  if (!note) {
    selectedNoteId = null;
    noteDetail.classList.add("empty-detail");
    detailTitle.textContent = "Pilih catatan";
    detailBody.textContent = "Klik salah satu judul catatan untuk melihat detail isi catatan.";
    detailMeta.textContent = "";
    detailEditBtn.classList.add("hidden");
    detailDeleteBtn.classList.add("hidden");
    return;
  }

  selectedNoteId = note.id;
  noteDetail.classList.remove("empty-detail");
  detailTitle.textContent = note.judul;
  detailBody.textContent = note.isi;
  detailMeta.textContent = `Dibuat: ${formatDate(note.tanggal_dibuat)}`;
  detailEditBtn.classList.remove("hidden");
  detailDeleteBtn.classList.remove("hidden");
};

const renderNotes = (notes) => {
  notesContainer.innerHTML = "";
  cachedNotes = notes;

  if (!notes.length) {
    notesContainer.innerHTML =
      '<div class="empty">Belum ada catatan. Tambahkan catatan pertamamu.</div>';
    renderNoteDetail(null);
    return;
  }

  notes.forEach((note) => {
    const button = document.createElement("button");
    button.className = "note-title-item";
    button.dataset.action = "select";
    button.dataset.id = note.id;
    button.textContent = note.judul;

    if (String(note.id) === String(selectedNoteId)) {
      button.classList.add("active");
    }

    notesContainer.appendChild(button);
  });

  const activeNote =
    notes.find((item) => String(item.id) === String(selectedNoteId)) || notes[0];

  renderNoteDetail(activeNote);

  const activeButton = notesContainer.querySelector(
    `.note-title-item[data-id="${activeNote.id}"]`
  );
  if (activeButton) activeButton.classList.add("active");
};

const fetchNotes = async () => {
  try {
    setStatus("Memuat catatan...");
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      throw new Error("Gagal mengambil data catatan");
    }

    const payload = await response.json();
    renderNotes(payload.data || []);
    setStatus(`${(payload.data || []).length} catatan ditemukan.`);
  } catch (error) {
    setStatus(error.message);
  }
};

const createNote = async (data) => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Gagal menambah catatan");
  return payload;
};

const updateNote = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Gagal memperbarui catatan");
  return payload;
};

const deleteNote = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Gagal menghapus catatan");
  return payload;
};

const findNoteById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  const payload = await response.json();

  if (!response.ok) throw new Error(payload.message || "Catatan tidak ditemukan");
  return payload.data;
};

noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const judul = judulInput.value.trim();
  const isi = isiInput.value.trim();

  if (!judul || !isi) {
    setStatus("Judul dan isi catatan wajib diisi.");
    return;
  }

  try {
    const currentId = noteIdInput.value;

    if (currentId) {
      await updateNote(currentId, { judul, isi });
      setStatus("Catatan berhasil diperbarui.");
    } else {
      await createNote({ judul, isi });
      setStatus("Catatan berhasil ditambahkan.");
    }

    resetForm();
    await fetchNotes();
  } catch (error) {
    setStatus(error.message);
  }
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
  setStatus("Mode edit dibatalkan.");
});

refreshBtn.addEventListener("click", () => {
  fetchNotes();
});

notesContainer.addEventListener("click", (event) => {
  const id = event.target.dataset.id;
  const action = event.target.dataset.action;

  if (!id || action !== "select") return;

  const note = cachedNotes.find((item) => String(item.id) === String(id));
  if (!note) return;

  notesContainer
    .querySelectorAll(".note-title-item")
    .forEach((item) => item.classList.remove("active"));
  event.target.classList.add("active");

  renderNoteDetail(note);
});

detailEditBtn.addEventListener("click", async () => {
  if (!selectedNoteId) return;

  try {
    const note = await findNoteById(selectedNoteId);
    noteIdInput.value = note.id;
    judulInput.value = note.judul;
    isiInput.value = note.isi;
    submitBtn.textContent = "Simpan Perubahan";
    cancelEditBtn.classList.remove("hidden");
    setStatus("Mode edit aktif. Ubah catatan lalu klik Simpan Perubahan.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    setStatus(error.message);
  }
});

detailDeleteBtn.addEventListener("click", async () => {
  if (!selectedNoteId) return;

  try {
    const confirmDelete = confirm("Yakin ingin menghapus catatan ini?");
    if (!confirmDelete) return;

    await deleteNote(selectedNoteId);
    setStatus("Catatan berhasil dihapus.");
    await fetchNotes();
  } catch (error) {
    setStatus(error.message);
  }
});

fetchNotes();
