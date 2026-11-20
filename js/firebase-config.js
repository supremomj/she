/**
 * FIREBASE REALTIME DATABASE CONFIGURATION (100% Free)
 * 
 * This enables REAL-TIME multi-user syncing when deployed on VERCEL!
 * Anyone visiting your Vercel link can post sticky notes, attach photos, 
 * and react with hearts — updating live on everyone's screens instantly!
 * 
 * 2-MINUTE SETUP:
 * 1. Visit: https://console.firebase.google.com (Free)
 * 2. Click "Create a project" -> Name it "sheryl-freedom-wall"
 * 3. In the sidebar, click "Build" -> "Realtime Database" -> "Create Database"
 * 4. Choose "Start in test mode" (allows teammates to write notes without login)
 * 5. In Project Settings (gear icon), add a Web App (</>) and paste your config below:
 */

window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
