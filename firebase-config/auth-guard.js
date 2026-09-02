/* ==========================================================
   MTN MoMo Travel — Auth guard + nav sync
   ==========================================================
   Two jobs:
   1. requireAuth() — call on pages that need a signed-in user
      (Trips, JourneyFund) since Firestore reads/writes need a
      real uid. Redirects to login if signed out.
   2. initNavAuthUI() — call on every page. Swaps the nav's
      avatar/name for the real signed-in user, and wires the
      Sign Out button if the page has one (#logoutBtn).
   ========================================================== */

import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged, signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Resolves once with the current user (or null) after Firebase's
// initial auth check completes — auth state is unknown for a brief
// moment on page load, so callers must wait for this rather than
// reading auth.currentUser synchronously.
function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    const here = encodeURIComponent(window.location.href);
    window.location.href = `../signup&login/login.html?redirect=${here}`;
    return null;
  }
  return user;
}

function initNavAuthUI() {
  onAuthStateChanged(auth, (user) => {
    const nameEl = document.querySelector(".user-name");
    const avatarEl = document.querySelector(".avatar");
    if (user) {
      const label = user.displayName || user.email || "Traveller";
      if (nameEl) nameEl.textContent = label;
      if (avatarEl) avatarEl.textContent = label.charAt(0).toUpperCase();
    } else {
      if (nameEl) nameEl.textContent = "Log In";
      if (avatarEl) avatarEl.textContent = "?";
    }
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "../signup&login/login.html";
    });
  }
}

export { getCurrentUser, requireAuth, initNavAuthUI };

window.AuthGuard = { getCurrentUser, requireAuth, initNavAuthUI };

// Every page that includes this script wants its nav synced — no need
// for each page to remember to call this separately.
initNavAuthUI();
