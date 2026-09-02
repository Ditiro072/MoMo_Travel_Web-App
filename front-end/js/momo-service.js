/* ==========================================================
   MTN MoMo Travel — MoMo Service (Demo/Sandbox Mode)
   ==========================================================
   We don't have live MTN MoMo sandbox credentials yet, so this
   file simulates the Collections / Request-to-Pay API and the
   voucher lifecycle client-side — exactly the "Demo Payment Mode"
   the project spec calls for, so the whole flow is demoable
   without real credentials.

   WHEN REAL CREDENTIALS ARRIVE:
   Only `requestToPay()` needs to change — swap its body for a
   real fetch() to your backend (which calls MTN MoMo server-side,
   the key must never live in this frontend file). Every other
   function (voucher generation, funding requests) stays the same,
   since they don't care whether the payment was real or simulated.
   ========================================================== */

const PAYMENT_MODE = "demo"; // 'demo' | 'sandbox' | 'production' — see project spec §13

// --- Simulated MTN MoMo Collections / Request-to-Pay ---
// Real version: POST to your backend, which calls
// MTN's /collection/v1_0/requesttopay, then polls /requesttopay/{id}.
function requestToPay({ msisdn, amount, note }) {
  return new Promise((resolve) => {
    // Simulate realistic network + MoMo approval latency
    setTimeout(() => {
      resolve({
        success: true,
        momoReferenceId: "MOMO-" + Date.now().toString(36).toUpperCase(),
        payerMsisdn: msisdn,
        amount,
        note,
        status: "SUCCESSFUL",
        mode: PAYMENT_MODE,
      });
    }, 1600);
  });
}

// --- Account validation (MTN MoMo Account Validation API, simulated) ---
// Real version: POST to your backend -> MTN /v1_0/accountholder/msisdn/{msisdn}/active
function validateMomoAccount(msisdn) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const digits = msisdn.replace(/[^0-9]/g, "");
      resolve({ valid: digits.length >= 9 });
    }, 500);
  });
}

// --- Voucher generation ---
// Cryptographically-random-ish reference (Math.random is fine for a demo;
// swap for crypto.randomUUID()-derived values before this touches real money).
function generateVoucherReference(destination) {
  const cityCode = (destination || "TRV").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JP-${cityCode}-${random}`;
}

function generateVoucherPin() {
  return String(Math.floor(1000 + Math.random() * 9000)); // 4 digits
}

// Builds a full voucher object from a funding request that just got paid.
// Mirrors the shape from the project spec's §14 voucher model.
function mintVoucher(fundingRequest) {
  return {
    id: "vch-" + Date.now(),
    reference: generateVoucherReference(fundingRequest.tripDestination),
    pin: generateVoucherPin(),
    tripId: fundingRequest.tripId,
    tripDestination: fundingRequest.tripDestination,
    itemId: fundingRequest.itemId,
    itemName: fundingRequest.itemName,
    itemLocation: fundingRequest.itemLocation,
    providerAccepts: fundingRequest.momoAccepted,
    amount: fundingRequest.amount,
    currency: "ZAR",
    status: "unredeemed", // unredeemed -> redeemed
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days
    redeemedAt: null,
  };
}
