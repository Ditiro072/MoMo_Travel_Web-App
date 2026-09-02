/* ==========================================================
   MTN MoMo Travel — Signup handler
   ==========================================================
   FIX: previously imported `auth` from firebase-config.js, which
   didn't export it (see firebase-config.js) — signup silently
   failed. Now also writes a Firestore profile doc (fullName,
   mobile, gender aren't part of Firebase Auth itself, so they
   need somewhere to live), and sets displayName so the nav
   shows the real name instead of "Nhlakanipho" everywhere.
   ========================================================== */

import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth } from "./firebase-config.js";
import { saveUserProfile } from "./firestore-service.js";

const form = document.getElementById("signupForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // --- Get form values ---
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const gender = document.getElementById("gender").value;
    const mobile = document.getElementById("mobile").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // --- Get PIN values (payment PIN — separate from the login password) ---
    const pinInputs = document.getElementById("signupPinBoxes").querySelectorAll("input");
    const confirmPinInputs = document.getElementById("confirmPinBoxes").querySelectorAll("input");
    const pin = Array.from(pinInputs).map(i => i.value).join("");
    const confirmPin = Array.from(confirmPinInputs).map(i => i.value).join("");

    // --- Validation ---
    let valid = true;

    if (!fullName) { valid = false; document.getElementById("fullNameGroup").classList.add("error"); }
    if (!email) { valid = false; document.getElementById("emailGroup").classList.add("error"); }
    if (!gender) { valid = false; document.getElementById("genderGroup").classList.add("error"); }
    if (mobile.replace(/[^0-9]/g, "").length < 9) { valid = false; document.getElementById("mobileGroup").classList.add("error"); }
    if (password.length < 6) { valid = false; document.getElementById("passwordGroup").classList.add("error"); }
    if (password !== confirmPassword) { valid = false; document.getElementById("confirmPasswordGroup").classList.add("error"); }

    const pinMatchHint = document.getElementById("pinMatchHint");
    pinMatchHint.textContent = "";
    pinMatchHint.style.color = "";

    if (pin.length !== 4 || confirmPin.length !== 4) {
      valid = false;
      pinMatchHint.textContent = "Please fill out all 4 PIN digits.";
      pinMatchHint.style.color = "var(--danger)";
    } else if (pin !== confirmPin) {
      valid = false;
      pinMatchHint.textContent = "PINs don't match — try again.";
      pinMatchHint.style.color = "var(--danger)";
    }

    if (!valid) return;

    const submitBtn = form.querySelector(".btn-primary");
    submitBtn.classList.add("loading");

    try {
      // --- Create the Firebase Auth account ---
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Auth only stores email/password — everything else goes to Firestore.
      await saveUserProfile(user.uid, { fullName, email, gender, mobile });

      // So the nav shows a real name instead of Firebase's blank default.
      await updateProfile(user, { displayName: fullName });

      // NOTE: the payment PIN (pin/confirmPin) is intentionally NOT saved
      // anywhere yet — it's collected for the future MoMo payment flow,
      // but storing a PIN needs proper hashing server-side first. Wire
      // this up once real MoMo payment integration happens.

      submitBtn.classList.remove("loading");
      document.getElementById("successBanner").classList.add("show");

      setTimeout(() => {
        window.location.href = "/home";
      }, 1200);

    } catch (error) {
      submitBtn.classList.remove("loading");
      console.error("Firebase registration error:", error);

      if (error.code === "auth/email-already-in-use") {
        alert("This email address is already registered.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        alert("Your password is too weak.");
      } else {
        alert("Registration failed. Please try again.");
      }
    }
  });
}
