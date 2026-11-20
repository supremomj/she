# Sheryl's Freedom Wall — Purple Edition 💜📌

A warm, tactile, and aesthetic **Purple-Themed Freedom Wall & Scrapbook** dedicated to Sheryl with real-time multi-user syncing and password-protected Admin Moderation.

---

## 🔒 Admin Moderation (Removing Notes)

To prevent spam or inappropriate notes while keeping the wall open for everyone:

1. **How to enter Admin Mode**:
   - Click the **"🔒 Admin"** button in the top navigation bar (or **"Admin Access"** in the footer).
   - Enter your Admin Password.
   - **Default Password**: `sheryl2026`
2. **Deleting Notes**:
   - Once Admin Mode is unlocked, a **`🗑️` (Remove)** button appears on the top-left of every sticky note and photo card.
   - Clicking `🗑️` asks for confirmation and permanently removes the note from the wall in real time across all devices!
3. **Exiting Admin Mode**:
   - Click the **"👑 Admin Mode Active"** button in the top bar to log out. The delete buttons will immediately disappear.
4. **Changing the Admin Password**:
   - In your Vercel Dashboard, go to your project **`she`** &rarr; **Settings** &rarr; **Environment Variables**.
   - Add a new variable:
     - **Key**: `ADMIN_PASSWORD`
     - **Value**: `YourNewSecretPassword`
   - Redeploy or save, and your new password will be active immediately!

---

## ⚡ Connecting Upstash Redis Storage on Vercel (1-Click)

1. Open your project **`she`** on **[vercel.com](https://vercel.com)**.
2. Click the **Storage** tab.
3. Click on **Upstash** *(Serverless DB: Redis)*.
4. Click **Connect to Project (`she`)**.
5. Once connected, the top status pill turns **🟢 Live Synced**, and all devices will sync notes and reactions in real time!
