/**
 * SHERYL'S FREEDOM WALL — VERCEL KV & ADMIN MODERATION EDITION
 * 
 * Features:
 * 1. 100% Vercel Native — Connects directly to Upstash / Vercel KV via `/api/notes`
 * 2. Controlled Note Dimensions: Long notes are gracefully clamped with a "Read full note 📖" pop-up viewer!
 * 3. Protected Admin Mode: enter admin password to unlock delete (🗑️) AND image fit/crop (🖼️ Fit)
 * 4. Admin Image Fit & Crop Studio: toggle Cover vs Contain, Top/Center/Bottom alignment, and Aspect Ratio
 * 5. Interactive note creator (purple pastels, stickers, fasteners, photo upload)
 * 6. Live ❤️ reactions synced across all devices
 * 7. Pinned Letter to Sheryl modal
 * 8. Falling lavender/lilac petals animation
 */

// App State
let wallNotes = [];
let isVercelApi = false;
let isVercelKVConnected = false;
let pollingInterval = null;
let lastKnownNotesHash = '';

// Admin State
let isAdmin = sessionStorage.getItem('sheryl_admin_auth') === 'true';
let adminPassword = sessionStorage.getItem('sheryl_admin_pwd') || '';
let currentEditingImageNoteId = null;

// Temporary state for the image crop editor
let editImageFit = 'cover';
let editImagePosition = 'center';
let editImageAspect = 'square';

// Selected note creator state
let selectedColor = 'lavender';
let selectedSticker = '💜';
let selectedFastener = 'tape';
let attachedImageBase64 = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initVercelStorage();
  updateAdminUI();
  setupEventListeners();
  setupPhotoAttachment();
  setupFallingPetals();
  setupImageEditorControls();
});

// 1. Initialize Vercel API / Storage
async function initVercelStorage() {
  const statusBtn = document.getElementById('sync-status-indicator');

  try {
    const res = await fetch('/api/notes', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      isVercelApi = true;
      isVercelKVConnected = Boolean(data.isVercelKV);

      if (data && Array.isArray(data.notes)) {
        wallNotes = data.notes;
        lastKnownNotesHash = generateHash(wallNotes);
        renderFreedomWall();
      }

      if (statusBtn) {
        if (isVercelKVConnected) {
          statusBtn.innerHTML = `<span class="sync-dot"></span> <span>Live Synced</span>`;
          statusBtn.title = 'Upstash / Vercel KV connected! Real-time syncing is active.';
        } else {
          statusBtn.innerHTML = `<span class="sync-dot offline"></span> <span>Connect Upstash</span>`;
          statusBtn.title = 'Click here to connect Upstash Redis so your phone & computer can sync notes!';
        }
      }

      if (isVercelKVConnected) {
        startRealtimePolling();
      }
      return;
    }
  } catch (err) {
    // Offline or file:// mode
  }

  // Local fallback
  isVercelApi = false;
  isVercelKVConnected = false;
  if (statusBtn) {
    statusBtn.innerHTML = `<span class="sync-dot offline"></span> <span>Local Mode</span>`;
    statusBtn.title = 'Running locally. Deploy to Vercel to sync across devices!';
  }

  loadLocalNotes();
}

// Background Real-Time Polling on Vercel
function startRealtimePolling() {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(async () => {
    if (document.hidden) return;

    try {
      const res = await fetch('/api/notes', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.notes)) {
          const newHash = generateHash(data.notes);
          if (newHash !== lastKnownNotesHash) {
            lastKnownNotesHash = newHash;
            wallNotes = data.notes;
            renderFreedomWall();
          }
        }
      }
    } catch (e) {}
  }, 2500);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && isVercelApi && isVercelKVConnected) {
      fetchLatestNotes();
    }
  });
}

async function fetchLatestNotes() {
  try {
    const res = await fetch('/api/notes', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.notes)) {
        lastKnownNotesHash = generateHash(data.notes);
        wallNotes = data.notes;
        renderFreedomWall();
      }
    }
  } catch (e) {}
}

function generateHash(notes) {
  return notes.map(n => `${n.id}:${n.reactions || 0}:${n.imageFit || ''}:${n.imagePosition || ''}:${n.imageAspect || ''}`).join('|');
}

// 2. Local Storage Fallback
function loadLocalNotes() {
  try {
    const saved = localStorage.getItem('sheryl_real_wall_notes');
    wallNotes = saved ? JSON.parse(saved) : [];
  } catch (e) {
    wallNotes = [];
  }
  renderFreedomWall();
}

function saveLocalNotes() {
  try {
    localStorage.setItem('sheryl_real_wall_notes', JSON.stringify(wallNotes));
  } catch (e) {}
}

// 3. Render the Freedom Wall
function renderFreedomWall() {
  const container = document.getElementById('wall-notes-container');
  if (!container) return;

  container.innerHTML = '';

  if (wallNotes.length === 0) {
    container.innerHTML = `
      <div class="wall-empty-state">
        <div class="empty-state-card open-pin-modal">
          <div class="pushpin pushpin-amethyst"></div>
          <div class="empty-state-icon">✍️💜</div>
          <h3 class="empty-state-title">The Wall is Waiting for Your Words!</h3>
          <p class="empty-state-sub">Be the first to pin a heartfelt note, a favorite memory, or a photo for Sheryl.</p>
          <button class="wall-btn btn-pin-note open-pin-modal" type="button" style="margin-top: 1rem;">
            <span>✏️</span> <span>+ Stick the First Note</span>
          </button>
        </div>
      </div>
    `;

    container.querySelectorAll('.open-pin-modal').forEach(el => {
      el.addEventListener('click', () => {
        const modal = document.getElementById('pin-note-modal');
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });
    return;
  }

  const rotations = [-2.2, 1.8, -1.2, 2.4, -1.9, 1.4, -2.5, 2.1];

  wallNotes.forEach((note, index) => {
    const rot = rotations[index % rotations.length];
    const card = document.createElement('div');
    card.className = `wall-note note-${note.color || 'lavender'}`;
    card.style.transform = `rotate(${rot}deg)`;
    card.id = `note-${note.id}`;

    // Fastener HTML
    let fastenerHtml = '';
    if (note.fastener === 'pin') {
      fastenerHtml = `
        <div class="note-pin-top">
          <div class="pushpin pushpin-${note.pinColor || 'amethyst'}"></div>
        </div>
      `;
    } else {
      fastenerHtml = `
        <div class="washi-tape-strip washi-tape-${note.tapeColor || 'lavender'}"></div>
      `;
    }

    // Admin Action Buttons (Delete + Crop/Fit)
    let adminActionsHtml = '';
    if (isAdmin) {
      let cropBtnHtml = '';
      if (note.image) {
        cropBtnHtml = `
          <button class="note-admin-crop" onclick="event.stopPropagation(); openAdminCropModal('${note.id}')" title="Adjust Picture Fit & Crop">
            <span>🖼️</span> <span>Fit</span>
          </button>
        `;
      }

      adminActionsHtml = `
        <div class="note-admin-actions">
          <button class="note-admin-delete" onclick="event.stopPropagation(); adminDeleteNote('${note.id}', '${escapeJs(note.name)}')" title="Delete this note">
            🗑️
          </button>
          ${cropBtnHtml}
        </div>
      `;
    }

    // User Attached Photo with Customizable Aspect and Fit
    let photoHtml = '';
    if (note.image) {
      const aspectClass = `aspect-${note.imageAspect || 'square'}`;
      const fitClass = `fit-${note.imageFit || 'cover'}`;
      const posClass = `pos-${note.imagePosition || 'center'}`;

      photoHtml = `
        <div class="note-attached-photo ${aspectClass}" onclick="openNoteReaderModal('${note.id}')">
          <img src="${note.image}" class="${fitClass} ${posClass}" alt="Attached memory" loading="lazy">
        </div>
      `;
    }

    // Handle long note truncation and popup view trigger
    const charLimit = note.image ? 100 : 160;
    const isLongNote = note.text && note.text.length > charLimit;
    const hasPhotoClass = note.image ? 'has-photo' : '';

    let readMoreBtnHtml = '';
    if (isLongNote) {
      readMoreBtnHtml = `
        <button class="read-more-pill" onclick="event.stopPropagation(); openNoteReaderModal('${note.id}')" type="button">
          <span>Read full note</span> <span>📖</span>
        </button>
      `;
    }

    const liked = isReactionActive(note.id);

    card.innerHTML = `
      ${adminActionsHtml}
      ${fastenerHtml}
      <div class="note-sticker">${escapeHtml(note.sticker || '💜')}</div>
      ${photoHtml}
      
      <div class="note-message-box" onclick="openNoteReaderModal('${note.id}')" title="Click to read in full pop-up">
        <p class="note-message ${hasPhotoClass}">${escapeHtml(note.text)}</p>
        ${readMoreBtnHtml}
      </div>
      
      <div class="note-footer">
        <div class="note-author-info">
          <span class="note-author-name">${escapeHtml(note.name)}</span>
          <span class="note-author-role">${escapeHtml(note.role || 'Teammate')}</span>
          <span class="note-date">${escapeHtml(note.date || 'Recent')}</span>
        </div>

        <button class="note-reactions ${liked ? 'reacted' : ''}" onclick="event.stopPropagation(); toggleNoteReaction('${note.id}')" aria-label="React to note">
          <span>💜</span>
          <span class="reaction-count">${note.reactions || 0}</span>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, match => {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });
}

function escapeJs(str) {
  if (!str) return '';
  return str.replace(/['"\\]/g, '\\$&');
}

// 4. Reactions
function isReactionActive(noteId) {
  try {
    const reactedList = JSON.parse(localStorage.getItem('sheryl_reacted_notes_purple') || '[]');
    return reactedList.includes(noteId);
  } catch (e) {
    return false;
  }
}

window.toggleNoteReaction = async function(noteId) {
  try {
    let reactedList = JSON.parse(localStorage.getItem('sheryl_reacted_notes_purple') || '[]');
    const isReacted = reactedList.includes(noteId);

    const note = wallNotes.find(n => n.id === noteId);
    if (note) {
      note.reactions = isReacted ? Math.max(0, (note.reactions || 1) - 1) : (note.reactions || 0) + 1;
      renderFreedomWall();
    }

    if (isReacted) {
      reactedList = reactedList.filter(id => id !== noteId);
    } else {
      reactedList.push(noteId);
      if (window.spawnBlessings) window.spawnBlessings(14);
    }
    localStorage.setItem('sheryl_reacted_notes_purple', JSON.stringify(reactedList));

    if (isVercelApi && isVercelKVConnected) {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'react', noteId: noteId })
      });
      fetchLatestNotes();
    } else {
      saveLocalNotes();
    }
  } catch (err) {
    console.warn('Reaction error:', err);
  }
};

// 5. Note Reader Pop-up Modal (Full View for Long Notes)
window.openNoteReaderModal = function(noteId) {
  const note = wallNotes.find(n => n.id === noteId);
  if (!note) return;

  const modal = document.getElementById('note-reader-modal');
  const card = document.getElementById('note-reader-card');
  const imageWrap = document.getElementById('note-reader-image-wrap');
  const imgEl = document.getElementById('note-reader-img');
  const textEl = document.getElementById('note-reader-text');
  const authorEl = document.getElementById('note-reader-author');
  const roleEl = document.getElementById('note-reader-role');
  const dateEl = document.getElementById('note-reader-date');
  const stickerEl = document.getElementById('note-reader-sticker');

  if (!modal) return;

  // Set card color
  card.className = `freedom-modal-card note-reader-card note-${note.color || 'lavender'}`;

  // Image
  if (note.image) {
    imgEl.src = note.image;
    imageWrap.style.display = 'block';
  } else {
    imageWrap.style.display = 'none';
  }

  // Text & Meta
  textEl.textContent = note.text;
  authorEl.textContent = note.name;
  roleEl.textContent = note.role || 'Teammate & Friend';
  dateEl.textContent = note.date || 'Recent';
  stickerEl.textContent = note.sticker || '💜';

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

// 6. Admin Image Crop / Fit Editor
window.openAdminCropModal = function(noteId) {
  if (!isAdmin) return;

  const note = wallNotes.find(n => n.id === noteId);
  if (!note || !note.image) return;

  currentEditingImageNoteId = noteId;
  editImageFit = note.imageFit || 'cover';
  editImagePosition = note.imagePosition || 'center';
  editImageAspect = note.imageAspect || 'square';

  const modal = document.getElementById('admin-crop-modal');
  const previewImg = document.getElementById('crop-preview-img');

  if (!modal || !previewImg) return;

  previewImg.src = note.image;
  updateCropPreview();
  updateCropButtonsUI();

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

function updateCropPreview() {
  const previewBox = document.getElementById('crop-preview-box');
  const previewImg = document.getElementById('crop-preview-img');
  if (!previewBox || !previewImg) return;

  previewImg.className = `fit-${editImageFit} pos-${editImagePosition}`;
  
  if (editImageAspect === 'square') {
    previewBox.style.height = '240px';
  } else if (editImageAspect === 'portrait') {
    previewBox.style.height = '300px';
  } else {
    previewBox.style.height = 'auto';
  }
}

function updateCropButtonsUI() {
  document.querySelectorAll('[data-crop-fit]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cropFit === editImageFit);
  });
  document.querySelectorAll('[data-crop-pos]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cropPos === editImagePosition);
  });
  document.querySelectorAll('[data-crop-aspect]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cropAspect === editImageAspect);
  });
}

function setupImageEditorControls() {
  // Fit buttons
  document.querySelectorAll('[data-crop-fit]').forEach(btn => {
    btn.addEventListener('click', () => {
      editImageFit = btn.dataset.cropFit;
      updateCropPreview();
      updateCropButtonsUI();
    });
  });

  // Position buttons
  document.querySelectorAll('[data-crop-pos]').forEach(btn => {
    btn.addEventListener('click', () => {
      editImagePosition = btn.dataset.cropPos;
      updateCropPreview();
      updateCropButtonsUI();
    });
  });

  // Aspect buttons
  document.querySelectorAll('[data-crop-aspect]').forEach(btn => {
    btn.addEventListener('click', () => {
      editImageAspect = btn.dataset.cropAspect;
      updateCropPreview();
      updateCropButtonsUI();
    });
  });

  // Save changes button
  const saveBtn = document.getElementById('save-crop-settings-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!currentEditingImageNoteId) return;

      const note = wallNotes.find(n => n.id === currentEditingImageNoteId);
      if (note) {
        note.imageFit = editImageFit;
        note.imagePosition = editImagePosition;
        note.imageAspect = editImageAspect;
        renderFreedomWall();
      }

      const modal = document.getElementById('admin-crop-modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }

      if (isVercelApi && isVercelKVConnected) {
        try {
          await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_image_style',
              noteId: currentEditingImageNoteId,
              imageFit: editImageFit,
              imagePosition: editImagePosition,
              imageAspect: editImageAspect,
              adminPassword: adminPassword
            })
          });
          fetchLatestNotes();
        } catch (e) {
          console.error('Failed to update image style:', e);
        }
      } else {
        saveLocalNotes();
      }

      currentEditingImageNoteId = null;
    });
  }
}

// 7. Admin Delete Action
window.adminDeleteNote = async function(noteId, authorName) {
  if (!isAdmin) return;

  const confirmed = confirm(`Are you sure you want to permanently remove this note from "${authorName}"?`);
  if (!confirmed) return;

  wallNotes = wallNotes.filter(n => n.id !== noteId);
  renderFreedomWall();

  if (isVercelApi && isVercelKVConnected) {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          noteId: noteId,
          adminPassword: adminPassword
        })
      });

      const data = await res.json();
      if (!data.success) {
        alert('Could not delete note: ' + (data.message || 'Unauthorized'));
        fetchLatestNotes();
      }
    } catch (e) {
      console.error('Delete note failed:', e);
    }
  } else {
    saveLocalNotes();
  }
};

function updateAdminUI() {
  const adminBtn = document.getElementById('admin-mode-toggle-btn');
  if (adminBtn) {
    if (isAdmin) {
      adminBtn.innerHTML = `<span>👑</span> <span>Admin Mode Active</span>`;
      adminBtn.classList.add('active');
      adminBtn.title = 'Click to exit Admin Mode';
    } else {
      adminBtn.innerHTML = `<span>🔒</span> <span>Admin</span>`;
      adminBtn.classList.remove('active');
      adminBtn.title = 'Click to log in as Admin to manage and remove notes';
    }
  }
}

// 8. Photo Attachment Engine for Note Composer
function setupPhotoAttachment() {
  const fileInput = document.getElementById('note-photo-input');
  const previewImg = document.getElementById('photo-preview-img');

  if (!fileInput || !previewImg) return;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      attachedImageBase64 = null;
      previewImg.style.display = 'none';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        attachedImageBase64 = canvas.toDataURL('image/jpeg', 0.75);
        previewImg.src = attachedImageBase64;
        previewImg.style.display = 'block';
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// 9. Modals & Event Listeners
function setupEventListeners() {
  const pinModal = document.getElementById('pin-note-modal');
  const openPinBtns = document.querySelectorAll('.open-pin-modal');
  const closePinBtn = document.getElementById('close-pin-modal');
  const pinForm = document.getElementById('pin-note-form');

  const letterModal = document.getElementById('letter-modal');
  const openLetterBtns = document.querySelectorAll('.open-letter-modal');
  const closeLetterBtn = document.getElementById('close-letter-modal');

  const kvModal = document.getElementById('kv-help-modal');
  const openKvBtn = document.getElementById('sync-status-indicator');
  const closeKvBtn = document.getElementById('close-kv-modal');

  // Reader Modal
  const readerModal = document.getElementById('note-reader-modal');
  const closeReaderBtn = document.getElementById('close-reader-modal');

  // Crop Modal
  const cropModal = document.getElementById('admin-crop-modal');
  const closeCropBtn = document.getElementById('close-crop-modal');

  // Admin Modal
  const adminModal = document.getElementById('admin-login-modal');
  const adminToggleBtn = document.getElementById('admin-mode-toggle-btn');
  const closeAdminBtn = document.getElementById('close-admin-modal');
  const adminForm = document.getElementById('admin-login-form');

  const openModal = (m) => {
    if (m) {
      m.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };
  const closeModal = (m) => {
    if (m) {
      m.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  openPinBtns.forEach(btn => btn.addEventListener('click', () => openModal(pinModal)));
  if (closePinBtn) closePinBtn.addEventListener('click', () => closeModal(pinModal));

  openLetterBtns.forEach(btn => btn.addEventListener('click', () => openModal(letterModal)));
  if (closeLetterBtn) closeLetterBtn.addEventListener('click', () => closeModal(letterModal));

  if (closeReaderBtn) closeReaderBtn.addEventListener('click', () => closeModal(readerModal));
  if (closeCropBtn) closeCropBtn.addEventListener('click', () => closeModal(cropModal));

  if (openKvBtn) {
    openKvBtn.addEventListener('click', () => {
      if (!isVercelKVConnected) {
        openModal(kvModal);
      }
    });
  }
  if (closeKvBtn) closeKvBtn.addEventListener('click', () => closeModal(kvModal));

  // Admin button toggle
  if (adminToggleBtn) {
    adminToggleBtn.addEventListener('click', () => {
      if (isAdmin) {
        if (confirm('Exit Admin Mode? (Moderation buttons will be hidden)')) {
          isAdmin = false;
          adminPassword = '';
          sessionStorage.removeItem('sheryl_admin_auth');
          sessionStorage.removeItem('sheryl_admin_pwd');
          updateAdminUI();
          renderFreedomWall();
        }
      } else {
        openModal(adminModal);
        setTimeout(() => {
          const pwdInput = document.getElementById('admin-password-input');
          if (pwdInput) pwdInput.focus();
        }, 150);
      }
    });
  }

  if (closeAdminBtn) closeAdminBtn.addEventListener('click', () => closeModal(adminModal));

  // Admin Form Submit
  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwdInput = document.getElementById('admin-password-input');
      const errorMsg = document.getElementById('admin-error-msg');
      const inputVal = pwdInput.value.trim();

      if (!inputVal) return;

      try {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify_admin',
            password: inputVal
          })
        });

        const data = await res.json();
        if (data.success) {
          isAdmin = true;
          adminPassword = inputVal;
          sessionStorage.setItem('sheryl_admin_auth', 'true');
          sessionStorage.setItem('sheryl_admin_pwd', inputVal);

          if (errorMsg) errorMsg.style.display = 'none';
          pwdInput.value = '';
          closeModal(adminModal);
          updateAdminUI();
          renderFreedomWall();
          alert('👑 Admin Mode Unlocked! You can now delete notes (🗑️) and adjust photo fit (🖼️ Fit).');
        } else {
          if (errorMsg) {
            errorMsg.textContent = 'Incorrect admin password. Please try again.';
            errorMsg.style.display = 'block';
          }
        }
      } catch (err) {
        if (inputVal === 'sheryl2026') {
          isAdmin = true;
          adminPassword = inputVal;
          sessionStorage.setItem('sheryl_admin_auth', 'true');
          sessionStorage.setItem('sheryl_admin_pwd', inputVal);
          closeModal(adminModal);
          updateAdminUI();
          renderFreedomWall();
        } else {
          if (errorMsg) {
            errorMsg.textContent = 'Incorrect password.';
            errorMsg.style.display = 'block';
          }
        }
      }
    });
  }

  [pinModal, letterModal, kvModal, adminModal, readerModal, cropModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [pinModal, letterModal, kvModal, adminModal, readerModal, cropModal].forEach(closeModal);
    }
  });

  // Color selection
  document.querySelectorAll('.color-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedColor = opt.dataset.color || 'lavender';
    });
  });

  // Sticker selection
  document.querySelectorAll('.sticker-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sticker-opt-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSticker = btn.dataset.sticker || '💜';
    });
  });

  // Fastener selection
  document.querySelectorAll('input[name="fastener-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedFastener = e.target.value;
    });
  });

  // Submit Note Form
  if (pinForm) {
    pinForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('note-author-input').value.trim();
      const role = document.getElementById('note-role-input').value.trim() || 'Friend & Teammate';
      const text = document.getElementById('note-message-input').value.trim();

      if (!name || !text) return;

      const newNote = {
        name: name,
        role: role,
        text: text,
        color: selectedColor,
        sticker: selectedSticker,
        fastener: selectedFastener,
        pinColor: ['amethyst', 'lilac', 'gold', 'silver'][Math.floor(Math.random() * 4)],
        tapeColor: ['lavender', 'lilac', 'amethyst', 'gold'][Math.floor(Math.random() * 4)],
        date: 'Just now',
        reactions: 1
      };

      if (attachedImageBase64) {
        newNote.image = attachedImageBase64;
      }

      pinForm.reset();
      attachedImageBase64 = null;
      const previewImg = document.getElementById('photo-preview-img');
      if (previewImg) previewImg.style.display = 'none';
      closeModal(pinModal);

      if (window.spawnBlessings) window.spawnBlessings(40);

      if (isVercelApi && isVercelKVConnected) {
        try {
          const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNote)
          });
          const data = await res.json();
          if (data && data.note) {
            wallNotes.unshift(data.note);
            renderFreedomWall();
          }
        } catch (err) {
          console.error('Post note error:', err);
        }
      } else {
        newNote.id = 'note_' + Date.now();
        wallNotes.unshift(newNote);
        saveLocalNotes();
        renderFreedomWall();

        if (isVercelApi && !isVercelKVConnected) {
          setTimeout(() => {
            openModal(kvModal);
          }, 800);
        }
      }

      setTimeout(() => {
        const topNote = document.querySelector('.wall-note');
        if (topNote) {
          topNote.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    });
  }

  const board = document.getElementById('freedom-wall-board');
  if (board) {
    board.addEventListener('dblclick', (e) => {
      if (e.target === board || e.target.classList.contains('wall-grid') || e.target.classList.contains('wall-container')) {
        openModal(pinModal);
      }
    });
  }
}

// 10. Falling Lavender & Lilac Petals
function setupFallingPetals() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  let petals = [];
  let isRunning = false;

  const purpleColors = [
    'rgba(195, 155, 225, 0.8)',
    'rgba(215, 185, 240, 0.75)',
    'rgba(165, 120, 200, 0.7)',
    'rgba(240, 225, 252, 0.85)',
    'rgba(145, 95, 180, 0.65)',
    'rgba(255, 245, 255, 0.8)'
  ];

  class Petal {
    constructor(x, y) {
      this.x = x !== undefined ? x : Math.random() * width;
      this.y = y !== undefined ? y : -20 - Math.random() * 40;
      this.size = 8 + Math.random() * 11;
      this.speedY = 1.3 + Math.random() * 1.8;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 2;
      this.color = purpleColors[Math.floor(Math.random() * purpleColors.length)];
      this.time = Math.random() * 100;
    }

    update() {
      this.time += 0.02;
      this.x += this.speedX + Math.sin(this.time) * 0.85;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;

      ctx.beginPath();
      ctx.moveTo(0, -this.size / 2);
      ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size / 2, this.size / 2, 0, this.size);
      ctx.bezierCurveTo(-this.size / 2, this.size / 2, -this.size / 2, -this.size / 2, 0, -this.size / 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();

      if (petals[i].y > height + 20) {
        petals.splice(i, 1);
        i--;
      }
    }

    if (petals.length > 0) {
      requestAnimationFrame(loop);
    } else {
      isRunning = false;
      ctx.clearRect(0, 0, width, height);
    }
  }

  window.spawnBlessings = function(count = 45) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        petals.push(new Petal(Math.random() * width, -10 - Math.random() * 40));
        if (!isRunning) {
          isRunning = true;
          loop();
        }
      }, i * 35);
    }
  };

  const scatterBtn = document.getElementById('scatter-love-btn');
  if (scatterBtn) {
    scatterBtn.addEventListener('click', () => {
      window.spawnBlessings(55);
      scatterBtn.innerHTML = `<span>💜</span> Purple Love Sent!`;
      setTimeout(() => {
        scatterBtn.innerHTML = `<span>💜</span> Scatter Love`;
      }, 3000);
    });
  }
}
