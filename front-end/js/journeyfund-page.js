/* ==========================================================
   MTN MoMo Travel — JourneyFund page wiring
   Depends on: cart.js (getTrips), momo-service.js (requestToPay,
   mintVoucher), journeyfund.js (funding requests + voucher store)
   ========================================================== */

const trips = getTrips();
let selectedTrip = null;
let selectedItem = null;
let fundMode = "self";

// --- Populate trip dropdown ---
const tripSelect = document.getElementById("tripSelect");
trips.forEach(trip => {
  const opt = document.createElement("option");
  opt.value = trip.id;
  opt.textContent = `${trip.destination} — ${trip.items.length} item${trip.items.length === 1 ? "" : "s"}`;
  tripSelect.appendChild(opt);
});

const itemSelect = document.getElementById("itemSelect");

tripSelect.addEventListener("change", () => {
  selectedTrip = trips.find(t => t.id === tripSelect.value) || null;
  selectedItem = null;
  itemSelect.innerHTML = "";

  if (!selectedTrip) {
    itemSelect.disabled = true;
    itemSelect.innerHTML = `<option value="">Select a trip first…</option>`;
    hideItemPreview();
    updateSubmitState();
    return;
  }

  itemSelect.disabled = false;
  itemSelect.innerHTML = `<option value="">Select an item…</option>`;
  selectedTrip.items.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.name} — R${item.price}`;
    itemSelect.appendChild(opt);
  });
  hideItemPreview();
  updateSubmitState();
});

itemSelect.addEventListener("change", () => {
  selectedItem = selectedTrip ? selectedTrip.items.find(i => i.id === itemSelect.value) : null;
  if (selectedItem) {
    showItemPreview(selectedItem);
  } else {
    hideItemPreview();
  }
  updateSubmitState();
});

function showItemPreview(item) {
  const preview = document.getElementById("itemPreview");
  document.getElementById("itemPreviewIcon").className = `fa-solid ${item.icon}`;
  document.getElementById("itemPreviewName").textContent = item.name;
  document.getElementById("itemPreviewLocation").textContent = item.location;
  document.getElementById("itemPreviewPrice").textContent = `R${item.price}`;
  document.getElementById("itemPreviewBadge").innerHTML = item.momoAccepted
    ? `<span class="momo-badge accepted"><i class="fa-solid fa-circle-check"></i> Accepts MTN MoMo</span>`
    : `<span class="momo-badge not-accepted"><i class="fa-solid fa-circle-xmark"></i> MoMo not accepted — can't fund via app</span>`;
  preview.classList.add("show");
}

function hideItemPreview() {
  document.getElementById("itemPreview").classList.remove("show");
}

// --- Fund mode toggle (self / friend) ---
document.querySelectorAll(".jf-mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".jf-mode-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    fundMode = btn.dataset.mode;
    document.getElementById("friendFields").classList.toggle("show", fundMode === "friend");
    updateSubmitState();
  });
});

// --- Submit button state ---
const submitBtn = document.getElementById("submitFundRequest");

function updateSubmitState() {
  if (!selectedItem) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Select a trip item to continue";
    return;
  }
  if (!selectedItem.momoAccepted) {
    submitBtn.disabled = true;
    submitBtn.textContent = "This provider doesn't accept MoMo";
    return;
  }
  if (fundMode === "friend") {
    const name = document.getElementById("funderName").value.trim();
    const msisdn = document.getElementById("funderMsisdn").value.trim();
    if (!name || !msisdn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enter your friend's details";
      return;
    }
  }
  submitBtn.disabled = false;
  submitBtn.textContent = fundMode === "self" ? "Create Request — Pay Now" : "Send Funding Request";
}

["funderName", "funderMsisdn"].forEach(id => {
  document.getElementById(id).addEventListener("input", updateSubmitState);
});

// --- Create the funding request ---
submitBtn.addEventListener("click", async () => {
  const request = createFundingRequest({
    trip: selectedTrip,
    item: selectedItem,
    fundMode,
    funderName: document.getElementById("funderName").value.trim(),
    funderMsisdn: document.getElementById("funderMsisdn").value.trim(),
    message: document.getElementById("fundMessage").value.trim(),
  });

  try {
    await fetch("/api/journeyfund/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch (error) {
    console.warn("JourneyFund request saved locally; server sync failed:", error);
  }

  showToast(fundMode === "self" ? "Request created — pay it below" : `Request sent to ${request.funderName}`);
  renderFundingRequests();

  // Reset the form
  tripSelect.value = "";
  itemSelect.innerHTML = `<option value="">Select a trip first…</option>`;
  itemSelect.disabled = true;
  hideItemPreview();
  selectedTrip = null;
  selectedItem = null;
  document.getElementById("funderName").value = "";
  document.getElementById("funderMsisdn").value = "";
  document.getElementById("fundMessage").value = "";
  updateSubmitState();

  // If self-funding, jump straight into the payment flow
  if (fundMode === "self") openPayModal(request);
});

// --- Render funding requests list ---
function renderFundingRequests() {
  const list = document.getElementById("fundingRequestsList");
  const requests = getFundingRequests();
  list.innerHTML = "";

  if (requests.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-hand-holding-dollar"></i>
        <p>No funding requests yet. Create one above once you've added items to a trip.</p>
      </div>`;
    return;
  }

  requests.forEach(req => {
    const card = document.createElement("div");
    card.className = "fund-request-card";

    const statusLabel = { pending: "Pending", paid: "Paid", declined: "Declined", expired: "Expired" }[req.status];
    const funderLine = req.fundMode === "self"
      ? "You're funding this"
      : `Waiting on ${req.funderName} (${req.funderMsisdn})`;

    let actions = `<span class="fund-request-amount">R${req.amount}</span>`;
    if (req.status === "pending") {
      actions += `<button class="btn-fr-pay" data-id="${req.id}"><i class="fa-solid fa-bolt"></i> ${req.fundMode === "self" ? "Pay Now" : "Simulate: Friend Pays"}</button>`;
      actions += `<button class="btn-fr-cancel" data-cancel="${req.id}">Cancel</button>`;
    }

    card.innerHTML = `
      <div class="fund-request-info">
        <h4>${req.itemName} <span class="status-badge ${req.status}">${statusLabel}</span></h4>
        <div class="fr-meta">${req.tripDestination} · ${req.itemLocation} · ${funderLine}</div>
        ${req.message ? `<div class="fr-meta" style="margin-top: 4px; font-style: italic;">"${req.message}"</div>` : ""}
      </div>
      <div class="fund-request-actions">${actions}</div>
    `;

    const payBtn = card.querySelector(".btn-fr-pay");
    if (payBtn) payBtn.addEventListener("click", () => openPayModal(req));

    const cancelBtn = card.querySelector(".btn-fr-cancel");
    if (cancelBtn) cancelBtn.addEventListener("click", () => {
      updateFundingRequest(req.id, { status: "declined" });
      renderFundingRequests();
      showToast("Request cancelled");
    });

    list.appendChild(card);
  });
}

// --- Payment modal (simulated MoMo Request-to-Pay) ---
const payModalOverlay = document.getElementById("payModalOverlay");
const modalPinStep = document.getElementById("modalPinStep");
const modalProcessing = document.getElementById("modalProcessing");
const modalSuccess = document.getElementById("modalSuccess");
let activeRequest = null;

function openPayModal(request) {
  activeRequest = request;
  document.getElementById("modalItemDesc").textContent = `${request.itemName} · ${request.tripDestination}`;
  document.getElementById("modalAmount").textContent = `R${request.amount}`;
  resetPinBoxes("payPinBoxes");
  modalPinStep.style.display = "block";
  modalProcessing.classList.remove("show");
  modalSuccess.classList.remove("show");
  payModalOverlay.classList.add("show");
}

function closePayModal() {
  payModalOverlay.classList.remove("show");
}

document.getElementById("cancelPayBtn").addEventListener("click", closePayModal);
payModalOverlay.addEventListener("click", (e) => {
  if (e.target === payModalOverlay) closePayModal();
});

document.getElementById("confirmPayBtn").addEventListener("click", async () => {
  const pin = getPinBoxValue("payPinBoxes");
  if (pin.length < 4) {
    showToast("Enter your 4-digit PIN");
    return;
  }

  modalPinStep.style.display = "none";
  modalProcessing.classList.add("show");

  // Simulated MTN MoMo Request-to-Pay — see momo-service.js
  const result = await requestToPay({
    msisdn: activeRequest.fundMode === "self" ? "0821234567" : activeRequest.funderMsisdn,
    amount: activeRequest.amount,
    note: `${activeRequest.itemName} — ${activeRequest.tripDestination}`,
  });

  modalProcessing.classList.remove("show");

  if (result.success) {
    // Mark request paid, mint a Travel Voucher, save it to the wallet
    updateFundingRequest(activeRequest.id, { status: "paid", paidAt: new Date().toISOString() });
    const voucher = mintVoucher(activeRequest);
    saveVoucher(voucher);

    document.getElementById("voucherRevealMini").innerHTML = `
      <div class="voucher-detail-row"><span class="voucher-detail-label" style="color: var(--momo-gray-medium);">Reference</span><span class="voucher-detail-value" style="color: var(--momo-black);">${voucher.reference}</span></div>
      <div class="voucher-detail-row" style="margin-bottom:0;"><span class="voucher-detail-label" style="color: var(--momo-gray-medium);">PIN</span><span class="voucher-detail-value" style="color: var(--momo-black);">${voucher.pin}</span></div>
    `;
    modalSuccess.classList.add("show");
    renderFundingRequests();
  } else {
    showToast("Payment failed — please try again");
    closePayModal();
  }
});

document.getElementById("closeSuccessBtn").addEventListener("click", () => {
  closePayModal();
  renderVouchers();
  document.getElementById("voucherGrid").scrollIntoView({ behavior: "smooth", block: "start" });
});

// --- PIN box helpers (same auto-advance pattern as the auth pages) ---
function resetPinBoxes(containerId) {
  const boxes = document.querySelectorAll(`#${containerId} input`);
  boxes.forEach(b => { b.value = ""; });
  if (boxes[0]) boxes[0].focus();
}

function getPinBoxValue(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} input`)).map(i => i.value).join("");
}

document.querySelectorAll("#payPinBoxes input").forEach((input, index, all) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^0-9]/g, "").slice(-1);
    if (input.value && index < all.length - 1) all[index + 1].focus();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && index > 0) all[index - 1].focus();
  });
});

// --- Render voucher wallet ---
function renderVouchers() {
  const grid = document.getElementById("voucherGrid");
  const vouchers = getVouchers();
  grid.innerHTML = "";

  if (vouchers.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-ticket"></i>
        <p>No vouchers yet — pay a funding request above to mint your first Travel Voucher.</p>
      </div>`;
    return;
  }

  vouchers.forEach(v => {
    const card = document.createElement("div");
    card.className = `voucher-ticket ${v.status === "redeemed" ? "redeemed" : ""}`;
    card.innerHTML = `
      <div class="voucher-top">
        <span class="voucher-brand">MoMo JourneyPass</span>
        <span class="voucher-status-pill ${v.status}">${v.status}</span>
      </div>
      <div class="voucher-item-name">${v.itemName}</div>
      <div class="voucher-item-loc"><i class="fa-solid fa-location-dot"></i> ${v.itemLocation}, ${v.tripDestination}</div>
      <div class="voucher-divider"></div>
      <div class="voucher-detail-row">
        <span class="voucher-detail-label">Reference</span>
        <span style="display:flex; align-items:center; gap:6px;">
          <span class="voucher-detail-value">${v.reference}</span>
          <button class="voucher-copy-btn" data-copy="${v.reference}" title="Copy reference"><i class="fa-regular fa-copy"></i></button>
        </span>
      </div>
      <div class="voucher-detail-row">
        <span class="voucher-detail-label">PIN</span>
        <span class="voucher-pin-row">
          <span class="voucher-detail-value pin-value" data-pin="${v.pin}">••••</span>
          <button class="voucher-reveal-btn" data-reveal>Reveal</button>
        </span>
      </div>
      <div class="voucher-amount-row">
        <span class="voucher-amount">R${v.amount}</span>
        <span class="voucher-expiry">Expires ${new Date(v.expiresAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>
    `;

    card.querySelector("[data-reveal]").addEventListener("click", (e) => {
      const pinSpan = card.querySelector(".pin-value");
      const isHidden = pinSpan.textContent === "••••";
      pinSpan.textContent = isHidden ? pinSpan.dataset.pin : "••••";
      e.target.textContent = isHidden ? "Hide" : "Reveal";
    });

    card.querySelector("[data-copy]").addEventListener("click", (e) => {
      navigator.clipboard?.writeText(e.currentTarget.dataset.copy);
      showToast("Reference copied");
    });

    grid.appendChild(card);
  });
}

// --- Toast ---
let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// --- Init ---
if (trips.length === 0) {
  tripSelect.innerHTML = `<option value="">No trips yet — add one from Explore first</option>`;
  tripSelect.disabled = true;
}
renderFundingRequests();
renderVouchers();
updateSubmitState();
