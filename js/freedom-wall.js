/**
 * SHERYL'S FREEDOM WALL — PURPLE EDITION (REALTIME & ZERO PLACEHOLDERS)
 * 
 * Clean, production-ready code for Vercel deployment:
 * 1. Zero fake placeholders — purely real user notes & Sheryl's authentic photo
 * 2. Real-time multi-user synchronization via Firebase Realtime Database
 * 3. Graceful offline fallback to LocalStorage
 * 4. Interactive note creator (pick purple pastels, sticker, fastener, message & optional photo)
 * 5. Photo compression engine for attaching real memories without bloat
 * 6. Interactive live ❤️ reactions with atomic updates
 * 7. Pinned Letter to Sheryl modal
 * 8. Falling lavender/lilac petals animation
 */

// App State
let wallNotes = [];
let firebaseDb = null;
let isLiveSyncActive = false;

// Selected note creator state
let selectedColor = 'lavender';
let selectedSticker = '💜';
let selectedFastener = 'tape';
let attachedImageBase64 = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  initWallData();
  setupEventListeners();
  setupPhotoAttachment();
  setupFallingPetals();
});

// 1. Firebase Initialization (Enables live multi-user notes on Vercel!)
function initFirebase() {
  try {
    let config = null;

    const storedConfig = localStorage.getItem('sheryl_freedom_firebase_config');
    if (storedConfig) {
      config = JSON.parse(storedConfig);
    } else if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && window.FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY') {
      config = window.FIREBASE_CONFIG;
    }

    if (config && typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      firebaseDb = firebase.database();
      isLiveSyncActive = true;
      updateSyncStatusUI(true);

      // Listen for real-time changes
      firebaseDb.ref('freedom_wall_notes').on('value', snapshot => {
        const val = snapshot.val();
        if (val) {
          wallNotes = Object.keys(val).map(key => ({
            ...val[key],
            id: key
          })).reverse(); // Newest notes first
        } else {
          wallNotes = [];
        }
        renderFreedomWall();
      });

      console.log('🟣 Freedom Wall: Real-time Firebase connected for Vercel!');
      return;
    }
  } catch (err) {
    console.warn('Firebase init warning:', err);
  }

  isLiveSyncActive = false;
  updateSyncStatusUI(false);
}

function updateSyncStatusUI(isLive) {
  const statusBtn = document.getElementById('sync-status-indicator');
  if (!statusBtn) return;

  if (isLive) {
    statusBtn.innerHTML = `<span class="sync-dot"></span> <span>Live Realtime Synced</span>`;
    statusBtn.title = 'Every note posted here updates live for everyone visiting this site on Vercel!';
  } else {
    statusBtn.innerHTML = `<span class="sync-dot offline"></span> <span>Local Mode (Connect Live Sync)</span>`;
    statusBtn.title = 'Saved locally. Click here to connect Firebase for multi-user live sync on Vercel!';
  }
}

// 2. Load Local Data if not live
function initWallData() {
  if (isLiveSyncActive) return;

  try {
    const saved = localStorage.getItem('sheryl_real_wall_notes');
    if (saved) {
      wallNotes = JSON.parse(saved);
    } else {
      wallNotes = []; // Clean start, zero placeholders!
    }
  } catch (e) {
    wallNotes = [];
  }

  renderFreedomWall();
}

function saveLocalNotes() {
  if (isLiveSyncActive) return;
  try {
    localStorage.setItem('sheryl_real_wall_notes', JSON.stringify(wallNotes));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

// 3. Render the Freedom Wall
function renderFreedomWall() {
  const container = document.getElementById('wall-notes-container');
  if (!container) return;

  container.innerHTML = '';

  // If 0 notes exist yet, display an inviting empty state
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

    // Rebind click to the empty card
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

  // Organic rotations
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

    // Attached photo (if any)
    let photoHtml = '';
    if (note.image) {
      photoHtml = `
        <div class="note-attached-photo">
          <img src="${note.image}" alt="Attached memory" loading="lazy">
        </div>
      `;
    }

    const liked = isReactionActive(note.id);

    card.innerHTML = `
      ${fastenerHtml}
      <div class="note-sticker">${escapeHtml(note.sticker || '💜')}</div>
      ${photoHtml}
      <p class="note-message">${escapeHtml(note.text)}</p>
      
      <div class="note-footer">
        <div class="note-author-info">
          <span class="note-author-name">${escapeHtml(note.name)}</span>
          <span class="note-author-role">${escapeHtml(note.role || 'Teammate')}</span>
          <span class="note-date">${escapeHtml(note.date || 'Recent')}</span>
        </div>

        <button class="note-reactions ${liked ? 'reacted' : ''}" onclick="toggleNoteReaction('${note.id}')" aria-label="React to note">
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

// 4. Reactions
function isReactionActive(noteId) {
  try {
    const reactedList = JSON.parse(localStorage.getItem('sheryl_reacted_notes_purple') || '[]');
    return reactedList.includes(noteId);
  } catch (e) {
    return false;
  }
}

window.toggleNoteReaction = function(noteId) {
  try {
    let reactedList = JSON.parse(localStorage.getItem('sheryl_reacted_notes_purple') || '[]');
    const isReacted = reactedList.includes(noteId);

    if (isLiveSyncActive && firebaseDb) {
      const noteRef = firebaseDb.ref('freedom_wall_notes/' + noteId + '/reactions');
      noteRef.transaction(current => {
        return isReacted ? Math.max(0, (current || 1) - 1) : (current || 0) + 1;
      });
    } else {
      const note = wallNotes.find(n => n.id === noteId);
      if (note) {
        if (isReacted) {
          note.reactions = Math.max(0, (note.reactions || 1) - 1);
        } else {
          note.reactions = (note.reactions || 0) + 1;
        }
        saveLocalNotes();
        renderFreedomWall();
      }
    }

    if (isReacted) {
      reactedList = reactedList.filter(id => id !== noteId);
    } else {
      reactedList.push(noteId);
      if (window.spawnBlessings) window.spawnBlessings(14);
    }
    localStorage.setItem('sheryl_reacted_notes_purple', JSON.stringify(reactedList));
  } catch (err) {
    console.warn('Reaction error:', err);
  }
};

// 5. Photo Attachment & Compression Engine
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
        // Compress image to max 800px width/height and JPEG 0.75 quality for snappy real-time syncing
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

// 6. Note Creation Modal & Logic
function setupEventListeners() {
  const pinModal = document.getElementById('pin-note-modal');
  const openPinBtns = document.querySelectorAll('.open-pin-modal');
  const closePinBtn = document.getElementById('close-pin-modal');
  const pinForm = document.getElementById('pin-note-form');

  const letterModal = document.getElementById('letter-modal');
  const openLetterBtns = document.querySelectorAll('.open-letter-modal');
  const closeLetterBtn = document.getElementById('close-letter-modal');

  const syncModal = document.getElementById('sync-setup-modal');
  const openSyncBtn = document.getElementById('sync-status-indicator');
  const closeSyncBtn = document.getElementById('close-sync-modal');
  const saveFirebaseBtn = document.getElementById('save-firebase-config-btn');

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

  if (openSyncBtn) openSyncBtn.addEventListener('click', () => openModal(syncModal));
  if (closeSyncBtn) closeSyncBtn.addEventListener('click', () => closeModal(syncModal));

  [pinModal, letterModal, syncModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [pinModal, letterModal, syncModal].forEach(closeModal);
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
    pinForm.addEventListener('submit', (e) => {
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
        reactions: 1,
        timestamp: Date.now()
      };

      if (attachedImageBase64) {
        newNote.image = attachedImageBase64;
      }

      if (isLiveSyncActive && firebaseDb) {
        // Pushes to Firebase Realtime Database — instant across all Vercel visitors!
        firebaseDb.ref('freedom_wall_notes').push(newNote);
      } else {
        newNote.id = 'note-' + Date.now();
        wallNotes.unshift(newNote);
        saveLocalNotes();
        renderFreedomWall();
      }

      // Reset form, photo preview & close modal
      pinForm.reset();
      attachedImageBase64 = null;
      const previewImg = document.getElementById('photo-preview-img');
      if (previewImg) previewImg.style.display = 'none';
      closeModal(pinModal);

      if (window.spawnBlessings) window.spawnBlessings(40);

      setTimeout(() => {
        const topNote = document.querySelector('.wall-note');
        if (topNote) {
          topNote.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    });
  }

  // Save Firebase Config Form in Sync Modal
  if (saveFirebaseBtn) {
    saveFirebaseBtn.addEventListener('click', () => {
      const configInput = document.getElementById('firebase-config-json');
      if (!configInput) return;

      try {
        const raw = configInput.value.trim();
        const parsed = JSON.parse(raw);
        localStorage.setItem('sheryl_freedom_firebase_config', JSON.stringify(parsed));
        alert('Firebase configuration saved! Reconnecting live wall for Vercel...');
        closeModal(syncModal);
        location.reload();
      } catch (err) {
        alert('Invalid JSON configuration. Please check the format and try again!');
      }
    });
  }

  // Double click anywhere on empty board to pin note
  const board = document.getElementById('freedom-wall-board');
  if (board) {
    board.addEventListener('dblclick', (e) => {
      if (e.target === board || e.target.classList.contains('wall-grid') || e.target.classList.contains('wall-container')) {
        openModal(pinModal);
      }
    });
  }
}

// 7. Falling Lavender & Lilac Petals
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
    'rgba(195, 155, 225, 0.8)', // soft wisteria
    'rgba(215, 185, 240, 0.75)', // pastel lilac
    'rgba(165, 120, 200, 0.7)',  // medium amethyst
    'rgba(240, 225, 252, 0.85)', // light lavender
    'rgba(145, 95, 180, 0.65)',  // royal purple petal
    'rgba(255, 245, 255, 0.8)'   // white orchid tint
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
