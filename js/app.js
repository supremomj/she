/**
 * FAREWELL SHERYL — INTERACTIVE SCRIPT
 * Handles messages, filtering, local storage persistence,
 * memory photo lightbox, smooth navigation, and gentle falling petals.
 */

// Initial curated heartfelt messages
const DEFAULT_MESSAGES = [
  {
    id: 'msg-1',
    name: 'Maya Chen',
    role: 'Product & Design',
    category: 'heartfelt',
    avatarClass: 'avatar-rose',
    avatarInitials: 'MC',
    date: 'Recent',
    likes: 14,
    text: "Sheryl, you've been the heart and calm anchor of our team. Even during our most chaotic launch weeks, your smile and 'we got this!' attitude shifted the entire energy of the room. Thank you for your warmth, your sharp instincts, and for always noticing when someone needed a break or a kind word. You're going to do extraordinary things next!"
  },
  {
    id: 'msg-2',
    name: 'David & The Tech Crew',
    role: 'Engineering Team',
    category: 'memories',
    avatarClass: 'avatar-sage',
    avatarInitials: 'DT',
    date: 'Recent',
    likes: 19,
    text: "Work won't be nearly as fun without our impromptu 3 PM snack debriefs and your laughter echoing down the hallway. Thank you for always bridging the gaps with so much patience and grace. You set a standard for kindness and collaboration that we'll carry with us. Don't be a stranger!"
  },
  {
    id: 'msg-3',
    name: 'Althea Ramos',
    role: 'Marketing Lead',
    category: 'wishes',
    avatarClass: 'avatar-gold',
    avatarInitials: 'AR',
    date: 'Recent',
    likes: 12,
    text: "To our brightest spark: watching you tackle challenges with such poise has been an inspiration. You made showing up to work feel like hanging out with family. Cheering you on with all my heart as you step into this next chapter — wherever you go, they are so lucky to have you, Sheryl!"
  },
  {
    id: 'msg-4',
    name: 'Kevin Soriano',
    role: 'Operations & Strategy',
    category: 'fun',
    avatarClass: 'avatar-charcoal',
    avatarInitials: 'KS',
    date: 'Recent',
    likes: 9,
    text: "Who is going to defend our crazy food orders and keep our brainstorms from derailing now?! Sheryl, thank you for bringing so much genuine joy, honest feedback, and hilarious candid moments. May your next desk have top-tier coffee, great snacks, and teammates who appreciate your golden spirit!"
  },
  {
    id: 'msg-5',
    name: 'Camille & Sarah',
    role: 'Client Partnerships',
    category: 'heartfelt',
    avatarClass: 'avatar-rose',
    avatarInitials: 'CS',
    date: 'Recent',
    likes: 16,
    text: "Dearest Sheryl, thank you for always having our backs. Whether it was stepping up in crunch time or offering words of encouragement right when we needed them, your generosity knew no bounds. You left big shoes to fill and a very warm impression on everyone here."
  },
  {
    id: 'msg-6',
    name: 'Marcus Vance',
    role: 'Team Lead',
    category: 'wishes',
    avatarClass: 'avatar-sage',
    avatarInitials: 'MV',
    date: 'Recent',
    likes: 21,
    text: "Sheryl, leaders like you don't need a title to inspire everyone around them. Your dedication, empathy, and joy have left a permanent mark on our company culture. Wishing you endless growth, exciting breakthroughs, and deep fulfillment in everything that lies ahead."
  }
];

// State
let messages = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadMessages();
  renderMessages();
  setupNavigation();
  setupScrollReveal();
  setupModal();
  setupFilterButtons();
  setupLightbox();
  setupBlessingsCanvas();
});

// Load messages from localStorage or use defaults
function loadMessages() {
  try {
    const saved = localStorage.getItem('sheryl_farewell_messages');
    if (saved) {
      messages = JSON.parse(saved);
    } else {
      messages = [...DEFAULT_MESSAGES];
      saveMessages();
    }
  } catch (e) {
    console.warn('LocalStorage error, using defaults:', e);
    messages = [...DEFAULT_MESSAGES];
  }
}

function saveMessages() {
  try {
    localStorage.setItem('sheryl_farewell_messages', JSON.stringify(messages));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

// Render messages
function renderMessages() {
  const container = document.getElementById('messages-grid');
  if (!container) return;

  const filtered = currentFilter === 'all' 
    ? messages 
    : messages.filter(m => m.category === currentFilter);

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <p style="font-family: var(--font-serif); font-size: 1.2rem; margin-bottom: 0.5rem;">No notes in this category yet</p>
        <p style="font-size: 0.9rem;">Be the first to leave a message for Sheryl!</p>
      </div>
    `;
    return;
  }

  filtered.forEach(msg => {
    const card = document.createElement('div');
    card.className = 'message-card fade-in-up revealed';
    card.id = `card-${msg.id}`;

    const liked = isLiked(msg.id);

    card.innerHTML = `
      <div class="message-quote-icon">“</div>
      <div>
        <div class="message-header">
          <div class="sender-avatar ${msg.avatarClass || 'avatar-rose'}">
            ${escapeHtml(msg.avatarInitials || getInitials(msg.name))}
          </div>
          <div class="sender-info">
            <span class="sender-name">${escapeHtml(msg.name)}</span>
            <span class="sender-role">${escapeHtml(msg.role || 'Teammate & Friend')}</span>
          </div>
        </div>
        <p class="message-text">"${escapeHtml(msg.text)}"</p>
      </div>
      <div class="message-footer">
        <span class="message-date">${escapeHtml(msg.date || 'Recent')}</span>
        <button class="like-button ${liked ? 'liked' : ''}" onclick="toggleLike('${msg.id}')" aria-label="Like this message">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span class="like-count">${msg.likes || 0}</span>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function getInitials(name) {
  if (!name) return 'S';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

// Like management
function isLiked(id) {
  try {
    const likedList = JSON.parse(localStorage.getItem('sheryl_liked_notes') || '[]');
    return likedList.includes(id);
  } catch (e) {
    return false;
  }
}

window.toggleLike = function(id) {
  try {
    let likedList = JSON.parse(localStorage.getItem('sheryl_liked_notes') || '[]');
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    if (likedList.includes(id)) {
      likedList = likedList.filter(item => item !== id);
      msg.likes = Math.max(0, (msg.likes || 1) - 1);
    } else {
      likedList.push(id);
      msg.likes = (msg.likes || 0) + 1;
    }

    localStorage.setItem('sheryl_liked_notes', JSON.stringify(likedList));
    saveMessages();
    renderMessages();
  } catch (e) {
    console.warn('Like toggle failed:', e);
  }
};

// Filter pills
function setupFilterButtons() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'all';
      renderMessages();
    });
  });
}

// Modal handling
function setupModal() {
  const modal = document.getElementById('note-modal');
  const openButtons = document.querySelectorAll('.open-note-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const form = document.getElementById('leave-note-form');

  if (!modal) return;

  const openModal = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const nameInput = document.getElementById('sender-name');
      if (nameInput) nameInput.focus();
    }, 150);
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  openButtons.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Handle Note Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('sender-name').value.trim();
      const role = document.getElementById('sender-role').value.trim() || 'Teammate';
      const category = document.getElementById('note-category').value || 'heartfelt';
      const text = document.getElementById('note-text').value.trim();

      if (!name || !text) return;

      const avatarColors = ['avatar-rose', 'avatar-sage', 'avatar-gold', 'avatar-charcoal'];
      const chosenColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

      const newMsg = {
        id: 'msg-' + Date.now(),
        name: name,
        role: role,
        category: category,
        avatarClass: chosenColor,
        avatarInitials: getInitials(name),
        date: 'Just now',
        likes: 1,
        text: text
      };

      // Add to front
      messages.unshift(newMsg);
      saveMessages();

      // Reset & close
      form.reset();
      closeModal();

      // Trigger blessings celebration
      if (window.spawnBlessings) {
        window.spawnBlessings(35);
      }

      // Switch to 'all' and render
      currentFilter = 'all';
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === 'all');
      });
      renderMessages();

      // Smooth scroll to card
      const targetCard = document.getElementById(`card-${newMsg.id}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

// Navigation & Active Link tracking
function setupNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

// Scroll reveal animations
function setupScrollReveal() {
  const elements = document.querySelectorAll('.fade-in-up:not(.revealed)');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// Lightbox for photos
function setupLightbox() {
  const lightbox = document.getElementById('lightbox-modal');
  const imgElement = document.getElementById('lightbox-image');
  const titleElement = document.getElementById('lightbox-title');
  const captionElement = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close-btn');

  if (!lightbox) return;

  const openLightbox = (src, title, caption) => {
    imgElement.src = src;
    titleElement.textContent = title || 'A Memory with Sheryl';
    captionElement.textContent = caption || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const src = item.dataset.lightbox;
      const title = item.dataset.title;
      const caption = item.dataset.caption;
      openLightbox(src, title, caption);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

// Gentle Falling Petals / Blessings Canvas
function setupBlessingsCanvas() {
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
  let animationId = null;

  const colors = [
    'rgba(241, 180, 170, 0.75)', // dusty rose
    'rgba(224, 163, 154, 0.65)',
    'rgba(206, 218, 204, 0.6)',  // soft sage
    'rgba(245, 230, 211, 0.8)',  // warm cream
    'rgba(235, 200, 192, 0.7)'
  ];

  class Petal {
    constructor(x, y) {
      this.x = x !== undefined ? x : Math.random() * width;
      this.y = y !== undefined ? y : -20 - Math.random() * 50;
      this.size = 9 + Math.random() * 9;
      this.speedY = 1.2 + Math.random() * 2;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 2;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.oscillationSpeed = 0.02 + Math.random() * 0.03;
      this.oscillationDistance = 20 + Math.random() * 30;
      this.time = Math.random() * 100;
    }

    update() {
      this.time += this.oscillationSpeed;
      this.x += this.speedX + Math.sin(this.time) * 0.8;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;

      // Draw elegant petal shape
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
      animationId = requestAnimationFrame(loop);
    } else {
      isRunning = false;
      ctx.clearRect(0, 0, width, height);
    }
  }

  window.spawnBlessings = function(count = 45) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        petals.push(new Petal(
          Math.random() * width, 
          -10 - Math.random() * 40
        ));
        if (!isRunning) {
          isRunning = true;
          loop();
        }
      }, i * 40);
    }
  };

  // Button triggers
  const blessingsBtn = document.getElementById('send-blessings-btn');
  if (blessingsBtn) {
    blessingsBtn.addEventListener('click', () => {
      window.spawnBlessings(55);
      blessingsBtn.innerHTML = `<span>🌸</span> Blessings Sent to Sheryl!`;
      setTimeout(() => {
        blessingsBtn.innerHTML = `<span>🌸</span> Send Sheryl Blessings`;
      }, 3500);
    });
  }

  // Print Keepsake
  const printBtn = document.getElementById('print-keepsake-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}
