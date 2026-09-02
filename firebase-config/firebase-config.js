/* ==========================================================
   MTN MoMo Travel — Firebase init
   ==========================================================
   FIX: the previous version created `auth` but never exported
   it — firebase-config.js only exported { app }, while auth.js
   tried to `import { auth } from "./firebase-config.js"`. That
   import silently failed (auth was undefined), which is why
   signup wasn't actually working yet. Also added Firestore,
   which nothing here initialised before.
   ========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFvpWGXWb5RuMQjpvfFKRq1C3kxeHlrx8",
  authDomain: "momo-travel-bff33.firebaseapp.com",
  projectId: "momo-travel-bff33",
  storageBucket: "momo-travel-bff33.firebasestorage.app",
  messagingSenderId: "941002203317",
  appId: "1:941002203317:web:745c5cbafc055687c6defc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
