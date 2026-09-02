let trips = getTrips();

const checkoutTripSelect = document.getElementById("checkoutTripSelect");
const memberTripSelect = document.getElementById("memberTripSelect");
const inviteModalOverlay = document.getElementById("inviteModalOverlay");

function money(value) {
  return `R ${Number(value || 0).toLocaleString("en-ZA")}`;
}

function activeTrips() {
  return trips.filter(trip => (trip.status || "planned") !== "cancelled");
}

function refreshTrips() {
  trips = getTrips();
  populateTripSelects();
  renderCheckoutSummary();
  renderMembers();
}

function populateTripSelect(select, placeholder, includePaid = false) {
  const currentValue = select.value;
  select.disabled = false;
  select.innerHTML = `<option value="">${placeholder}</option>`;

  activeTrips()
    .filter(trip => includePaid || (trip.status || "planned") !== "paid")
    .forEach(trip => {
      const option = document.createElement("option");
      option.value = trip.id;
      option.textContent = `${trip.destination}${trip.dates ? ` - ${formatTripDate(trip.dates)}` : ""} - ${money(trip.total)}`;
      select.appendChild(option);
    });

  select.value = [...select.options].some(option => option.value === currentValue) ? currentValue : "";
}

function populateTripSelects() {
  populateTripSelect(checkoutTripSelect, "Select a trip...");
  populateTripSelect(memberTripSelect, "Select a trip...", true);

  if (activeTrips().length === 0) {
    checkoutTripSelect.innerHTML = `<option value="">No active trips yet</option>`;
    memberTripSelect.innerHTML = `<option value="">No active trips yet</option>`;
    checkoutTripSelect.disabled = true;
    memberTripSelect.disabled = true;
  }
}

function formatTripDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function refreshWalletBalance() {
  document.getElementById("jf-balance").textContent = money(getWalletBalance());
}

document.getElementById("addFundsBtn").addEventListener("click", async () => {
  const raw = prompt("Amount to add to your virtual card", "5000");
  const amount = Number(raw);
  if (!amount || amount <= 0) return;

  const response = await requestToPay({
    msisdn: "46733123453",
    amount,
    note: "JourneyFund virtual card top-up",
  });

  if (!response.success) {
    showToast("Top-up failed");
    return;
  }

  adjustWalletBalance(amount, "virtual_card_topup");
  addExpense({
    type: "topup",
    amount,
    label: "Virtual card top-up",
    reference: response.momoReferenceId,
  });
  refreshWalletBalance();
  renderCheckoutSummary();
  renderExpenses();
  showToast(`${money(amount)} added to your virtual card`);
});

document.getElementById("sendFundsBtn").addEventListener("click", async () => {
  const msisdn = prompt("Recipient MoMo number", "46733123453");
  if (!msisdn) return;
  const amount = Number(prompt("Amount to send", "500"));
  if (!amount || amount <= 0) return;

  const debit = adjustWalletBalance(-amount, "send_funds");
  if (!debit.success) {
    showToast(debit.message);
    return;
  }

  try {
    const response = await fetch("/api/disburse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, mobileNumber: msisdn, note: "JourneyFund send funds" }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Transfer failed");

    addExpense({
      type: "transfer",
      amount,
      label: `Sent funds to ${msisdn}`,
      reference: result.reference,
    });
    showToast(`${money(amount)} sent`);
  } catch (error) {
    adjustWalletBalance(amount, "send_funds_reversal");
    showToast(error.message);
  }

  refreshWalletBalance();
  renderCheckoutSummary();
  renderExpenses();
});

checkoutTripSelect.addEventListener("change", renderCheckoutSummary);

function renderCheckoutSummary() {
  const trip = trips.find(item => item.id === checkoutTripSelect.value);
  const box = document.getElementById("checkoutSummary");
  const button = document.getElementById("checkoutTripBtn");

  if (!trip) {
    box.innerHTML = `<div class="empty-state compact"><p>Select a trip to see checkout details.</p></div>`;
    button.disabled = true;
    button.textContent = "Checkout Trip";
    return;
  }

  const amountDue = Math.max(0, Number(trip.total || 0) - Number(trip.paidAmount || 0));
  box.innerHTML = `
    <div class="checkout-row"><span>Destination</span><strong>${trip.destination}</strong></div>
    <div class="checkout-row"><span>Trip date</span><strong>${trip.dates ? formatTripDate(trip.dates) : "Not selected"}</strong></div>
    <div class="checkout-row"><span>Items</span><strong>${trip.items.length}</strong></div>
    <div class="checkout-row"><span>Amount due</span><strong>${money(amountDue)}</strong></div>
    <div class="checkout-row"><span>Virtual card balance</span><strong>${money(getWalletBalance())}</strong></div>
  `;

  button.disabled = amountDue <= 0;
  button.textContent = amountDue <= 0 ? "Trip Already Paid" : `Pay ${money(amountDue)}`;
}

document.getElementById("checkoutTripBtn").addEventListener("click", () => {
  const trip = trips.find(item => item.id === checkoutTripSelect.value);
  if (!trip) return;

  const amountDue = Math.max(0, Number(trip.total || 0) - Number(trip.paidAmount || 0));
  const debit = adjustWalletBalance(-amountDue, "trip_checkout");
  if (!debit.success) {
    showToast(debit.message);
    return;
  }

  updateTrip(trip.id, {
    status: "paid",
    paidAt: new Date().toISOString(),
    paidAmount: Number(trip.paidAmount || 0) + amountDue,
  });
  addExpense({
    type: "payment",
    amount: amountDue,
    tripId: trip.id,
    tripDestination: trip.destination,
    label: `Checkout for ${trip.destination}`,
    reference: `CHK-${Date.now().toString(36).toUpperCase()}`,
  });

  showToast(`${trip.destination} checkout complete`);
  refreshWalletBalance();
  refreshTrips();
  renderExpenses();
});

document.getElementById("openInviteModalBtn").addEventListener("click", () => {
  inviteModalOverlay.classList.add("show");
  document.getElementById("memberName").focus();
});

document.getElementById("closeInviteModalBtn").addEventListener("click", closeInviteModal);
inviteModalOverlay.addEventListener("click", event => {
  if (event.target === inviteModalOverlay) closeInviteModal();
});

function closeInviteModal() {
  inviteModalOverlay.classList.remove("show");
}

document.getElementById("inviteMemberBtn").addEventListener("click", () => {
  const tripId = memberTripSelect.value;
  const name = document.getElementById("memberName").value.trim();
  const msisdn = document.getElementById("memberMsisdn").value.trim();

  if (!tripId || !name || !msisdn) {
    showToast("Select a trip and enter member details");
    return;
  }

  addTripMember(tripId, { name, msisdn });
  document.getElementById("memberName").value = "";
  document.getElementById("memberMsisdn").value = "";
  closeInviteModal();
  refreshTrips();
  showToast(`Invite sent to ${name}`);
});

function renderMembers() {
  const list = document.getElementById("memberList");
  const members = trips.flatMap(trip =>
    (trip.members || []).map(member => ({ ...member, tripDestination: trip.destination }))
  );

  if (!members.length) {
    list.innerHTML = `<div class="empty-state compact"><p>No invited members yet.</p></div>`;
    return;
  }

  list.innerHTML = members.map(member => `
    <div class="member-row">
      <span><strong>${member.name}</strong><small>${member.tripDestination} - ${member.msisdn}</small></span>
      <span class="status-badge pending">${member.status}</span>
    </div>
  `).join("");
}

function renderExpenses() {
  const list = document.getElementById("expenseList");
  const expenses = getExpenses();

  if (!expenses.length) {
    list.innerHTML = `<div class="empty-state compact"><i class="fa-solid fa-receipt"></i><p>No expenses yet.</p></div>`;
    return;
  }

  list.innerHTML = expenses.map(expense => `
    <div class="expense-row ${expense.type}">
      <div>
        <strong>${expense.label}</strong>
        <span>${new Date(expense.createdAt).toLocaleString("en-ZA")} ${expense.reference ? `- ${expense.reference}` : ""}</span>
      </div>
      <strong>${expense.type === "refund" || expense.type === "topup" ? "+" : "-"}${money(expense.amount)}</strong>
    </div>
  `).join("");
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

populateTripSelects();
refreshWalletBalance();
renderCheckoutSummary();
renderMembers();
renderExpenses();
window.addEventListener("momo-wallet-updated", () => {
  refreshWalletBalance();
  renderCheckoutSummary();
});
