/* ==========================================================
   MTN MoMo Travel — Login handler
   ==========================================================
   NOTE ON DESIGN: the original login mockup asked for "Mobile
   Number or Email" + "MoMo PIN". Firebase Auth's email/password
   sign-in needs the real password you set at signup — a 4-digit
   PIN can't be used as that credential (and signup already asks
   for both a real password AND a separate payment PIN — see
   auth.js). So login now asks for Email + Password to match what
   signup actually created. The payment PIN stays a payment-time
   thing, not a login credential.
   ========================================================== */

import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailGroup = document.getElementById("loginEmailGroup");
    const passwordGroup = document.getElementById("loginPasswordGroup");
    emailGroup.classList.remove("error");
    passwordGroup.classList.remove("error");

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    let valid = true;
    if (!email) { valid = false; emailGroup.classList.add("error"); }
    if (!password) { valid = false; passwordGroup.classList.add("error"); }
    if (!valid) return;

    const submitBtn = form.querySelector(".btn-primary");
    submitBtn.classList.add("loading");

    try {
      await signInWithEmailAndPassword(auth, email, password);

      submitBtn.classList.remove("loading");
      document.getElementById("successBanner").classList.add("show");

      // Honour a ?redirect= param (set by auth-guard.js when a protected
      // page bounced the user here), otherwise just go home.
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");

      setTimeout(() => {
        window.location.href = redirect ? decodeURIComponent(redirect) : "/home";
      }, 900);

    } catch (error) {
      submitBtn.classList.remove("loading");
      console.error("Firebase login error:", error);

      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        alert("Incorrect email or password.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        alert("Too many attempts — please wait a moment and try again.");
      } else {
        alert("Login failed. Please try again.");
      }
    }
  });
}
