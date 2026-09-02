/* ==========================================================
   MTN MoMo Travel — My Trips page logic
   Renders every trip saved via "Add to Trips" on the results
   page. Each trip is collapsible to show its item breakdown.
   ========================================================== */

const CATEGORY_LABELS = {
  stays: "Stay",
  transport: "Transport",
  activities: "Activity",
  food: "Food",
};

// Figure out which category a cart item belongs to by matching its id prefix
function categoryOf(item) {
  if (item.id.startsWith("st-")) return "stays";
  if (item.id.startsWith("tr-")) return "transport";
  if (item.id.startsWith("ac-")) return "activities";
  if (item.id.startsWith("fd-")) return "food";
  return "other";
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

// ----------------------------------------------------------
// UI Helper: Toast Notification
// ----------------------------------------------------------
function showNotification(message) {
  const toast = document.createElement("div");
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
  
  // Injecting inline styles for the MoMo branded toast
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    backgroundColor: '#000000',
    color: '#FFCC00',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 'bold',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    transition: 'opacity 0.3s ease',
    opacity: '1'
  });
  
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ----------------------------------------------------------
// Logic: Cancel Trip
// ----------------------------------------------------------

async function cancelTrip(tripId) {
  let trips = getTrips();
  const tripToCancel = trips.find(t => t.id === tripId);
  
  if (!tripToCancel || tripToCancel.status === "cancelled") return;

  // For sandbox testing, use an approved test MSISDN
  const testMobileNumber = "46733123453"; // Example MoMo test number
  const refundAmount = Number(tripToCancel.paidAmount || 0);

  showNotification(refundAmount > 0 ? "Initiating MoMo refund..." : "Cancelling unpaid trip...");
  
  // Disable the specific cancel button to prevent duplicate requests
  const tripCardItems = document.querySelector(`#items-${tripId}`);
  if(tripCardItems) {
      const btn = tripCardItems.parentElement.querySelector('.cancel-trip-btn');
      if(btn) btn.disabled = true;
  }

  try {
      const response = await fetch('/api/disburse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              amount: refundAmount,
              mobileNumber: testMobileNumber,
              reference: `REF-${tripId}`,
              note: "Trip Cancellation Refund"
          })
      });

      const result = await response.json();

      if (result.success) {
          updateTrip(tripId, {
            status: "cancelled",
            cancelledAt: new Date().toISOString(),
            refundReference: result.reference,
            refundedAmount: refundAmount,
            paidAmount: 0,
          });
          if (refundAmount > 0) {
            adjustWalletBalance(refundAmount, "trip_refund");
            addExpense({
              type: "refund",
              amount: refundAmount,
              tripId,
              tripDestination: tripToCancel.destination,
              label: `Refund for cancelled trip to ${tripToCancel.destination}`,
              reference: result.reference,
            });
          }
          
          renderTrips();
          showNotification(refundAmount > 0
            ? "Trip cancelled and R" + refundAmount + " returned to your virtual card."
            : "Trip cancelled.");
      } else {
          showNotification("Refund failed: " + result.error);
          
          if(tripCardItems) {
              const btn = tripCardItems.parentElement.querySelector('.cancel-trip-btn');
              if(btn) btn.disabled = false;
          }
      }
      
  } catch (error) {
      console.error(error);
      showNotification("Connection error during MoMo refund.");
      
      if(tripCardItems) {
          const btn = tripCardItems.parentElement.querySelector('.cancel-trip-btn');
          if(btn) btn.disabled = false;
      }
  }
}

// ----------------------------------------------------------
// Main Render Function
// ----------------------------------------------------------
function renderTrips() {
  const trips = getTrips();
  const container = document.getElementById("tripsList");
  container.innerHTML = "";

  if (trips.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 4rem 1rem; color: #666;">
        <i class="fa-solid fa-suitcase-rolling" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
        <p>No trips yet. Head to Explore, add a few stays/transport/activities to your cart, then hit "Add to Trips".</p>
      </div>`;
    return;
  }

  trips.forEach(trip => {
    const card = document.createElement("div");
    card.className = "trip-card";
    // Inline styles added for card structure to ensure it displays correctly if CSS is missing
    card.style.border = "1px solid #E0E0E0";
    card.style.borderRadius = "16px";
    card.style.overflow = "hidden";
    card.style.backgroundColor = "#fff";

    const momoAcceptedCount = trip.items.filter(i => i.momoAccepted).length;
    const status = trip.status || "planned";
    const isCancelled = status === "cancelled";

    card.innerHTML = `
      <div class="trip-card-header" style="display: flex; justify-content: space-between; padding: 1.5rem; cursor: pointer; background: #FAFAFA; border-bottom: 1px solid #E0E0E0;">
        <div class="trip-card-title">
          <h3 style="margin: 0 0 4px 0; font-size: 1.25rem;">${trip.destination} <span class="status-badge ${status}">${status}</span></h3>
          <span style="font-size: 0.85rem; color: #666;">${formatDate(trip.createdAt)} · ${trip.items.length} item${trip.items.length === 1 ? "" : "s"} · ${momoAcceptedCount}/${trip.items.length} accept MoMo${trip.paidAmount ? ` · R${trip.paidAmount} paid` : ""}</span>
        </div>
        <div class="trip-card-total" style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
          <div style="text-align: right;">
             <strong style="font-size: 1.2rem;">R${trip.total}</strong>
             <span style="display: block; font-size: 0.75rem; color: #666;">estimated total</span>
          </div>
          ${isCancelled ? "" : `<button class="cancel-trip-btn" style="background: transparent; border: 1px solid #dc3545; color: #dc3545; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">Cancel Trip</button>`}
        </div>
      </div>
      <div class="trip-card-items" id="items-${trip.id}" style="display: none; padding: 1.5rem;"></div>
    `;

    const header = card.querySelector(".trip-card-header");
    const itemsBox = card.querySelector(`#items-${trip.id}`);
    const cancelBtn = card.querySelector(".cancel-trip-btn");

    // Cancel Button Event Listener
    if (cancelBtn) cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevents the accordion from toggling when clicking the button
      if (confirm("Are you sure you want to cancel this trip?")) {
        cancelTrip(trip.id);
      }
    });

    // Accordion Toggle Event Listener
    header.addEventListener("click", () => {
      const isShowing = itemsBox.style.display === "block";
      itemsBox.style.display = isShowing ? "none" : "block";
    });

    trip.items.forEach(item => {
      const row = document.createElement("div");
      row.className = "trip-item-row";
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.padding = "10px 0";
      row.style.borderBottom = "1px solid #eee";

      const badge = item.momoAccepted
        ? `<span class="momo-badge accepted" style="padding: 3px 8px; font-size: 0.75rem; background: #000; color: #FFCC00; border-radius: 6px;"><i class="fa-solid fa-circle-check"></i> MoMo</span>`
        : `<span class="momo-badge not-accepted" style="padding: 3px 8px; font-size: 0.75rem; background: #f8f9fa; color: #666; border-radius: 6px;"><i class="fa-solid fa-circle-xmark"></i> No MoMo</span>`;
      
      row.innerHTML = `
        <div>
          <div class="cat-tag" style="font-size: 0.7rem; text-transform: uppercase; color: #999; font-weight: 700; margin-bottom: 2px;">${CATEGORY_LABELS[categoryOf(item)] || ""}</div>
          <strong>${item.name}</strong> <span style="color: #666;">— ${item.location}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          ${badge}
          <strong style="width: 70px; text-align: right;">R${item.price}</strong>
        </div>
      `;
      itemsBox.appendChild(row);
    });

    container.appendChild(card);
  });
}

renderTrips();
