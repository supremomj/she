# How to Deploy Sheryl's Freedom Wall to Vercel 🚀💜

This website is **100% ready for Vercel** with real-time multi-user syncing! When deployed, anyone with your Vercel link can stick notes, upload real photos, and react live from any device.

---

## ⚡ Option 1: Deploy with Vercel Web Dashboard (Easiest)

1. **Upload / Push to GitHub**:
   - Push this `sheryl-farewell` folder to a GitHub repository (e.g. `sheryl-farewell`).
2. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** &rarr; **"Project"**.
   - Select your `sheryl-farewell` repository and click **Deploy**.
3. **Done!** Vercel will give you a live production URL (e.g. `https://sheryl-farewell.vercel.app`).

---

## 💻 Option 2: Deploy directly via Vercel CLI (10 Seconds)

If you have Node.js and the Vercel CLI installed:
```bash
cd c:\Users\PMR\Downloads\sheryl-farewell
vercel
```
Follow the prompt (press Enter for defaults), and your site will be live immediately!

---

## 🔴 Enabling Real-Time Multi-User Sync (Free Firebase Setup)

Because Vercel is a static web host, multi-user real-time sync uses a **free Firebase Realtime Database**. This allows teammate notes to appear on everyone's screens instantly without page refreshes.

### 2-Minute Free Firebase Setup:
1. Go to [console.firebase.google.com](https://console.firebase.google.com) (free with any Google account).
2. Click **Create a project** &rarr; Name it `sheryl-freedom-wall`.
3. In the left menu, click **Build** &rarr; **Realtime Database** &rarr; **Create Database**.
4. Choose **Start in test mode** (this allows anyone with the link to post notes).
5. In Project Settings (gear icon), click the Web icon (`</>`) to get your Firebase configuration.
6. Either:
   - Paste the config values into `js/firebase-config.js`, **OR**
   - Click the **"Local Mode"** pill in the website header and paste your Firebase JSON directly in the browser!

Once configured, the indicator shows **🟢 Live Realtime Synced**, and all teammates can pin notes, upload photos, and react live together!
