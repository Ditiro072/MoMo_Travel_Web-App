/* ==========================================================
   MTN MoMo Travel — JourneyFund state + page logic
   ==========================================================
   JourneyFund is the purpose-based funding layer: instead of
   "send me R2,500", a request is always tied to one specific
   trip item — "pay my hotel — R2,500" — and produces a Travel
   Voucher once paid, not just a balance change.
   ========================================================== */

const FUNDING_KEY = "momo_travel_funding_requests";
const VOUCHERS_KEY = "momo_travel_vouchers";

// --- Funding requests ---

function getFundingRequests() {
  const raw = localStorage.getItem(FUNDING_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveFundingRequests(list) {
  localStorage.setItem(FUNDING_KEY, JSON.stringify(list));
}

function createFundingRequest({ trip, item, fundMode, funderName, funderMsisdn, message }) {
  const request = {
    id: "fund-" + Date.now(),
    tripId: trip.id,
    tripDestination: trip.destination,
    itemId: item.id,
    itemName: item.name,
    itemLocation: item.location,
    momoAccepted: item.momoAccepted,
    amount: item.price,
    fundMode, // 'self' | 'friend'
    funderName: fundMode === "self" ? "You" : funderName,
    funderMsisdn: fundMode === "self" ? null : funderMsisdn,
    message: message || "",
    status: "pending", // pending -> paid | declined | expired
    createdAt: new Date().toISOString(),
    paidAt: null,
  };
  const list = getFundingRequests();
  list.unshift(request);
  saveFundingRequests(list);

  const user = window.FirebaseAuth?.currentUser;
  if (user && window.FirestoreService?.addFundingRequest) {
    window.FirestoreService.addFundingRequest(user.uid, request).catch(error => {
      console.warn("Funding request saved locally but Firestore sync failed:", error);
    });
  }

  return request;
}

function updateFundingRequest(id, changes) {
  const list = getFundingRequests();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...changes };
  saveFundingRequests(list);

  const user = window.FirebaseAuth?.currentUser;
  if (user && window.FirestoreService?.updateFundingRequest) {
    window.FirestoreService.updateFundingRequest(user.uid, id, changes).catch(error => {
      console.warn("Funding request updated locally but Firestore sync failed:", error);
    });
  }

  return list[idx];
}

// --- Vouchers ---

function getVouchers() {
  const raw = localStorage.getItem(VOUCHERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveVoucher(voucher) {
  const list = getVouchers();
  list.unshift(voucher);
  localStorage.setItem(VOUCHERS_KEY, JSON.stringify(list));

  const user = window.FirebaseAuth?.currentUser;
  if (user && window.FirestoreService?.addVoucher) {
    window.FirestoreService.addVoucher(user.uid, voucher).catch(error => {
      console.warn("Voucher saved locally but Firestore sync failed:", error);
    });
  }

  return voucher;
}

function redeemVoucherByReference(reference, pin) {
  const list = getVouchers();
  const idx = list.findIndex(v => v.reference === reference);
  if (idx === -1) return { success: false, message: "Voucher not found." };
  const voucher = list[idx];
  if (voucher.status === "redeemed") return { success: false, message: "This voucher has already been redeemed." };
  if (voucher.pin !== pin) return { success: false, message: "Incorrect PIN." };

  list[idx] = { ...voucher, status: "redeemed", redeemedAt: new Date().toISOString() };
  localStorage.setItem(VOUCHERS_KEY, JSON.stringify(list));
  return { success: true, voucher: list[idx] };
}
