/* ==========================================================
   MTN MoMo Travel — Firestore CRUD service
   ==========================================================
   Everything "essential" (trips, funding requests, vouchers,
   user profile) lives under:  users/{uid}/...
   The shopping cart stays in localStorage on purpose — it's
   throwaway state before you commit to a trip, not a record
   worth persisting to the database.

   This file is a module (needs import/export + the Firebase
   CDN import), but the rest of the app's JS files are plain
   classic scripts for simplicity. So every function here is
   ALSO attached to `window.FirestoreService` at the bottom,
   which is what cart.js / trips.js / journeyfund.js actually
   call. Import the named exports only if you're writing
   another module.
   ========================================================== */

import { db } from "./firebase-config.js";
import {
  collection, doc, addDoc, getDocs, getDoc, setDoc,
  updateDoc, deleteDoc, query, orderBy, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// --- User profile (users/{uid}) ---

async function saveUserProfile(uid, profile) {
  await setDoc(doc(db, "users", uid), {
    ...profile,
    createdAt: serverTimestamp(),
  });
}

async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// --- Trips (users/{uid}/trips/{tripId}) ---

async function addTrip(uid, trip) {
  const payload = {
    destination: trip.destination,
    items: trip.items,
    total: trip.total,
    createdAt: serverTimestamp(),
  };

  if (trip.id) {
    const ref = doc(db, "users", uid, "trips", trip.id);
    await setDoc(ref, payload);
    return { ...trip, id: ref.id };
  }

  const ref = await addDoc(collection(db, "users", uid, "trips"), payload);
  return { ...trip, id: ref.id };
}

async function getTrips(uid) {
  const q = query(collection(db, "users", uid, "trips"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  // `id: d.id` goes LAST so Firestore's real document id always wins,
  // even if a stray "id" field ever ends up stored inside the document.
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

async function deleteTrip(uid, tripId) {
  await deleteDoc(doc(db, "users", uid, "trips", tripId));
}

// --- Funding requests (users/{uid}/fundingRequests/{id}) ---

async function addFundingRequest(uid, request) {
  const { id, ...cleanRequest } = request;
  const payload = {
    ...cleanRequest,
    createdAt: serverTimestamp(),
  };

  if (id) {
    const ref = doc(db, "users", uid, "fundingRequests", id);
    await setDoc(ref, payload);
    return { ...cleanRequest, id: ref.id };
  }

  const ref = await addDoc(collection(db, "users", uid, "fundingRequests"), payload);
  return { ...cleanRequest, id: ref.id };
}

async function getFundingRequests(uid) {
  const q = query(collection(db, "users", uid, "fundingRequests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

async function updateFundingRequest(uid, requestId, changes) {
  await updateDoc(doc(db, "users", uid, "fundingRequests", requestId), changes);
}

// --- Vouchers (users/{uid}/vouchers/{id}) ---

async function addVoucher(uid, voucher) {
  const { id, ...cleanVoucher } = voucher;
  const payload = {
    ...cleanVoucher,
    issuedAt: serverTimestamp(),
  };

  if (id) {
    const ref = doc(db, "users", uid, "vouchers", id);
    await setDoc(ref, payload);
    return { ...cleanVoucher, id: ref.id };
  }

  const ref = await addDoc(collection(db, "users", uid, "vouchers"), payload);
  return { ...cleanVoucher, id: ref.id };
}

async function getVouchers(uid) {
  const q = query(collection(db, "users", uid, "vouchers"), orderBy("issuedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

async function updateVoucher(uid, voucherId, changes) {
  await updateDoc(doc(db, "users", uid, "vouchers", voucherId), changes);
}

export {
  saveUserProfile, getUserProfile,
  addTrip, getTrips, deleteTrip,
  addFundingRequest, getFundingRequests, updateFundingRequest,
  addVoucher, getVouchers, updateVoucher,
};

// Bridge for the plain (non-module) scripts elsewhere in the app.
window.FirestoreService = {
  saveUserProfile, getUserProfile,
  addTrip, getTrips, deleteTrip,
  addFundingRequest, getFundingRequests, updateFundingRequest,
  addVoucher, getVouchers, updateVoucher,
};
