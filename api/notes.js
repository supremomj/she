// api/notes.js - Vercel Serverless Function for Sheryl's Freedom Wall
// Supports Upstash Redis / Vercel KV REST API + Admin Moderation Delete & Image Fit Adjustments

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Upstash or Vercel KV environment variables (Vercel sets either of these)
  const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const STORAGE_KEY = 'sheryl_freedom_wall_notes_v1';
  
  // Default Admin Password (can be customized via Vercel Environment Variables: ADMIN_PASSWORD)
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sheryl2026';

  // Read notes from Upstash / Vercel KV
  async function getStoredNotes() {
    if (!KV_URL || !KV_TOKEN) {
      return null;
    }

    try {
      const response = await fetch(`${KV_URL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['GET', STORAGE_KEY])
      });

      const data = await response.json();
      if (data && data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.error('KV read error:', err);
    }

    return [];
  }

  // Save notes to Upstash / Vercel KV
  async function saveStoredNotes(notes) {
    if (!KV_URL || !KV_TOKEN) {
      return false;
    }

    try {
      const response = await fetch(`${KV_URL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['SET', STORAGE_KEY, JSON.stringify(notes)])
      });

      const data = await response.json();
      return data && data.result === 'OK';
    } catch (err) {
      console.error('KV write error:', err);
      return false;
    }
  }

  const isConfigured = Boolean(KV_URL && KV_TOKEN);

  // Handle GET - Return notes
  if (req.method === 'GET') {
    if (!isConfigured) {
      return res.status(200).json({
        success: true,
        isVercelKV: false,
        message: 'Database not connected yet. Select Upstash in Vercel Storage to enable multi-device sync.',
        count: 0,
        notes: []
      });
    }

    try {
      const notes = await getStoredNotes();
      return res.status(200).json({
        success: true,
        isVercelKV: true,
        count: notes ? notes.length : 0,
        notes: notes || []
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // Handle POST - Add note, react, admin delete, or admin image crop
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!body) {
        return res.status(400).json({ success: false, message: 'Invalid request body' });
      }

      // Check admin password verification request
      if (body.action === 'verify_admin') {
        if (body.password === ADMIN_PASSWORD) {
          return res.status(200).json({ success: true, message: 'Admin verified' });
        } else {
          return res.status(401).json({ success: false, message: 'Incorrect password' });
        }
      }

      if (!isConfigured) {
        return res.status(200).json({
          success: false,
          isVercelKV: false,
          message: 'Database not connected yet. Select Upstash in Vercel Storage to enable multi-device sync.'
        });
      }

      const notes = (await getStoredNotes()) || [];

      // Action 1: Admin Delete Note
      if (body.action === 'delete' && body.noteId) {
        if (body.adminPassword !== ADMIN_PASSWORD) {
          return res.status(401).json({ success: false, message: 'Unauthorized: Invalid admin password' });
        }

        const filtered = notes.filter(n => n.id !== body.noteId);
        await saveStoredNotes(filtered);

        return res.status(200).json({
          success: true,
          message: 'Note successfully removed',
          notes: filtered
        });
      }

      // Action 2: Admin Update Image Fit & Crop Options
      if (body.action === 'update_image_style' && body.noteId) {
        if (body.adminPassword !== ADMIN_PASSWORD) {
          return res.status(401).json({ success: false, message: 'Unauthorized: Invalid admin password' });
        }

        const target = notes.find(n => n.id === body.noteId);
        if (target) {
          target.imageFit = body.imageFit || 'cover';
          target.imagePosition = body.imagePosition || 'center';
          target.imageAspect = body.imageAspect || 'square';
          await saveStoredNotes(notes);

          return res.status(200).json({
            success: true,
            message: 'Image fit updated successfully',
            note: target
          });
        }
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      // Action 3: Toggle Reaction
      if (body.action === 'react' && body.noteId) {
        const target = notes.find(n => n.id === body.noteId);
        if (target) {
          target.reactions = (target.reactions || 0) + 1;
          await saveStoredNotes(notes);
          return res.status(200).json({ success: true, note: target });
        }
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      // Action 4: Add New Note
      if (!body.text || !body.name) {
        return res.status(400).json({ success: false, message: 'Name and message required' });
      }

      const newNote = {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: String(body.name).substring(0, 80),
        role: String(body.role || 'Teammate & Friend').substring(0, 80),
        text: String(body.text).substring(0, 2000),
        color: body.color || 'lavender',
        sticker: body.sticker || '💜',
        fastener: body.fastener || 'tape',
        pinColor: body.pinColor || 'amethyst',
        tapeColor: body.tapeColor || 'lavender',
        image: body.image || null,
        imageFit: 'cover',
        imagePosition: 'center',
        imageAspect: 'square',
        reactions: 1,
        date: 'Just now',
        createdAt: Date.now()
      };

      notes.unshift(newNote);
      await saveStoredNotes(notes);

      return res.status(201).json({
        success: true,
        isVercelKV: true,
        note: newNote
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
