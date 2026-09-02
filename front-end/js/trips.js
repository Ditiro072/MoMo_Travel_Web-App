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
// (st- / tr- / ac- / fd-), since cart items are stored flat, not nested by category.
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

function renderTrips() {
  const trips = getTrips();
  const container = document.getElementById("tripsList");
  container.innerHTML = "";

  if (trips.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-suitcase-rolling"></i>
        <p>No trips yet. Head to Explore, add a few stays/transport/activities to your cart, then hit "Add to Trips".</p>
      </div>`;
    return;
  }

  trips.forEach(trip => {
    const card = document.createElement("div");
    card.className = "trip-card";

    const momoAcceptedCount = trip.items.filter(i => i.momoAccepted).length;

    card.innerHTML = `
      <div class="trip-card-header">
        <div class="trip-card-title">
          <h3>${trip.destination}</h3>
          <span>${formatDate(trip.createdAt)} · ${trip.items.length} item${trip.items.length === 1 ? "" : "s"} · ${momoAcceptedCount}/${trip.items.length} accept MoMo</span>
        </div>
        <div class="trip-card-total">
          <strong>R${trip.total}</strong>
          <span>estimated total</span>
        </div>
      </div>
      <div class="trip-card-items" id="items-${trip.id}"></div>
    `;

    const header = card.querySelector(".trip-card-header");
    const itemsBox = card.querySelector(`#items-${trip.id}`);

    trip.items.forEach(item => {
      const row = document.createElement("div");
      row.className = "trip-item-row";
      const badge = item.momoAccepted
        ? `<span class="momo-badge accepted" style="padding: 3px 8px;"><i class="fa-solid fa-circle-check"></i> MoMo</span>`
        : `<span class="momo-badge not-accepted" style="padding: 3px 8px;"><i class="fa-solid fa-circle-xmark"></i> No MoMo</span>`;
      row.innerHTML = `
        <div>
          <div class="cat-tag">${CATEGORY_LABELS[categoryOf(item)] || ""}</div>
          <strong>${item.name}</strong> — ${item.location}
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          ${badge}
          <strong>R${item.price}</strong>
        </div>
      `;
      itemsBox.appendChild(row);
    });

    header.addEventListener("click", () => {
      itemsBox.classList.toggle("show");
    });

    container.appendChild(card);
  });
}

renderTrips();
