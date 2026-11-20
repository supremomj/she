// api/notes.js - Vercel Serverless Function for Sheryl's Freedom Wall
// Supports Vercel KV directly + zero-setup fallback!

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;
  const STORAGE_KEY = 'sheryl_freedom_wall_notes_v1';

  // Read notes from storage
  async function getStoredNotes() {
    // 1. Try Vercel KV if connected
    if (KV_URL && KV_TOKEN) {
      try {
        const response = await fetch(`${KV_URL}/get/${STORAGE_KEY}`, {
          headers: { Authorization: `Bearer ${KV_TOKEN}` }
        });
        const data = await response.json();
        if (data && data.result) {
          const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (err) {
        console.error('Vercel KV read error:', err);
      }
    }

    // 2. Zero-config fallback (allows instant testing on Vercel before linking Vercel KV)
    try {
      const fbRes = await fetch(`https://kvdb.io/4yKqP9x8w7mN2bZ5vL1cR6/${STORAGE_KEY}`);
      if (fbRes.ok) {
        const data = await fbRes.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      // Fallback network error
    }

    return [];
  }

  // Save notes to storage
  async function saveStoredNotes(notes) {
    let saved = false;

    // 1. Save to Vercel KV if connected
    if (KV_URL && KV_TOKEN) {
      try {
        await fetch(`${KV_URL}/set/${STORAGE_KEY}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${KV_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(JSON.stringify(notes))
        });
        saved = true;
      } catch (err) {
        console.error('Vercel KV write error:', err);
      }
    }

    // 2. Save to zero-config fallback
    try {
      await fetch(`https://kvdb.io/4yKqP9x8w7mN2bZ5vL1cR6/${STORAGE_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notes)
      });
      saved = true;
    } catch (e) {
      // Fallback network error
    }

    return saved;
  }

  // Handle GET - Return all notes
  if (req.method === 'GET') {
    try {
      const notes = await getStoredNotes();
      return res.status(200).json({
        success: true,
        isVercelKV: Boolean(KV_URL && KV_TOKEN),
        count: notes.length,
        notes: notes
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // Handle POST - Add note OR react to a note
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!body) {
        return res.status(400).json({ success: false, message: 'Invalid body' });
      }

      const notes = await getStoredNotes();

      // Action 1: Toggle Reaction
      if (body.action === 'react' && body.noteId) {
        const target = notes.find(n => n.id === body.noteId);
        if (target) {
          target.reactions = (target.reactions || 0) + 1;
          await saveStoredNotes(notes);
          return res.status(200).json({ success: true, note: target });
        }
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      // Action 2: Add New Note
      if (!body.text || !body.name) {
        return res.status(400).json({ success: false, message: 'Name and text required' });
      }

      const newNote = {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: String(body.name).substring(0, 80),
        role: String(body.role || 'Teammate & Friend').substring(0, 80),
        text: String(body.text).substring(0, 1000),
        color: body.color || 'lavender',
        sticker: body.sticker || '💜',
        fastener: body.fastener || 'tape',
        pinColor: body.pinColor || 'amethyst',
        tapeColor: body.tapeColor || 'lavender',
        image: body.image || null,
        reactions: 1,
        date: 'Just now',
        createdAt: Date.now()
      };

      // Add to front (newest first)
      notes.unshift(newNote);

      await saveStoredNotes(notes);

      return res.status(201).json({
        success: true,
        isVercelKV: Boolean(KV_URL && KV_TOKEN),
        note: newNote
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
