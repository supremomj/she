# How to Deploy Sheryl's Freedom Wall on Vercel (100% Vercel Native) 🚀💜

This freedom wall is **100% Vercel Native** — **NO Firebase, NO Google Cloud, and NO external accounts required!**

It uses a Vercel Serverless Function (`api/notes.js`) with fast automatic polling to sync notes and real photo uploads across all visitors in real time.

---

## ⚡ Instant Deploy to Vercel (3 Clicks)

1. Go to **[vercel.com/new](https://vercel.com/new)** (log in with your GitHub account).
2. Under **Import Git Repository**, select your repository **`she`** and click **Import**.
3. Leave all settings at default and click **Deploy**.

Vercel will build and deploy the project in ~15 seconds and give you a live production URL (e.g. `https://she.vercel.app`)!

---

## 🔒 Enabling Permanent Vercel KV Storage (Optional, Recommended)

The site works out of the box immediately. If you want permanent, private storage hosted directly on Vercel:

1. In your Vercel Dashboard, open your project **`she`**.
2. Click the **Storage** tab at the top.
3. Click **Create Database** &rarr; select **KV**.
4. Click **Connect to Project** &rarr; select `she`.

Vercel will automatically connect Vercel KV to your serverless API. That's it! Everything stays 100% on Vercel.
