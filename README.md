# Sheryl's Freedom Wall — Purple Edition 💜📌

A warm, tactile, and aesthetic **Purple-Themed Freedom Wall & Scrapbook** dedicated to Sheryl. Designed like an authentic memory corkboard / canvas wall where teammates can pin sticky notes, memories, purple stickers, and heartfelt farewell wishes.

---

## 💜 Purple Theme & Design Details

- **Lilac & Lavender Canvas**: A tactile, textured canvas surface with gentle purple grain and soft ambient lighting.
- **Purple & Pastel Sticky Notes**: 
  - Soft Lavender (`#F1E5F8`)
  - Pastel Lilac (`#F9EAF7`)
  - Dusty Mauve (`#EFE0F0`)
  - Soft Periwinkle (`#ECE8F9`)
  - Warm Orchid Cream (`#FAF6FC`)
  - Buttercup Gold (`#FFF9E0`)
- **Amethyst & Lilac Metallic Pushpins**: 3D rendered pushpins in Amethyst Purple, Rose Lilac, Gold, and Silver.
- **Purple & Lavender Washi Tapes**: Semi-translucent washi tape strips fastening the notes.
- **Falling Lavender & Lilac Petals Canvas**: Clicking the **"💜 Scatter Love"** button sends fluttering wisteria, lilac, and orchid petals gently drifting across the screen!
- **Regal Purple Wax Seal**: Pinned editorial letter tile sealed with a deep violet wax stamp.

---

## 🌐 Live Multi-User Note Posting (When Deployed)

When you deploy this website (to GitHub Pages, Vercel, Netlify, Cloudflare Pages, etc.), **any teammate visiting from their phone or computer can post a note and have it instantly appear for everyone in real time**.

This is built right into the website using **Firebase Realtime Database** (100% free, 0 backend code required!):

### 2-Minute Setup for Live Sync:
1. Go to [console.firebase.google.com](https://console.firebase.google.com) (free with any Google account).
2. Click **Create a project** (name it `sheryl-freedom-wall`).
3. In the left menu, click **Build** &rarr; **Realtime Database** &rarr; **Create Database**.
4. Choose **Start in test mode** (this allows teammates to post notes without logging in).
5. In Project Settings (gear icon), click the Web icon (`</>`) to get your config object.
6. Either:
   - Paste the config into `js/firebase-config.js`, **OR**
   - Click the **"Local Mode / Live Sync"** button in the top bar of the website and paste it directly into the box!

Once connected, the indicator turns **🟢 Live Synced**, and any note posted anywhere in the world will show up live across everyone's screens instantly!

> **Note:** If you don't connect Firebase, the wall runs smoothly in **Local Mode**, automatically saving notes to `localStorage`.

---

## 📁 File Structure

- [index.html](file:///c:/Users/PMR/Downloads/sheryl-farewell/index.html) — Purple Freedom Wall canvas & interactive modals
- [css/freedom-wall.css](file:///c:/Users/PMR/Downloads/sheryl-farewell/css/freedom-wall.css) — Purple styling, sticky notes, washi tapes, pushpins, and canvas
- [js/freedom-wall.js](file:///c:/Users/PMR/Downloads/sheryl-farewell/js/freedom-wall.js) — Live rendering, note composer, reactions, and purple petals
- [js/firebase-config.js](file:///c:/Users/PMR/Downloads/sheryl-farewell/js/firebase-config.js) — Multi-user real-time sync configuration
- [images/sheryl.jpg](file:///c:/Users/PMR/Downloads/sheryl-farewell/images/sheryl.jpg) — Sheryl's featured photo
