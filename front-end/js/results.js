/* ==========================================================
   MTN MoMo Travel — Results page logic
   Reads ?destination= (and optional ?category=) from the URL,
   looks it up in DESTINATIONS (data.js), and renders tabs +
   listing cards. Cart actions read/write via cart.js.
   ========================================================== */

const CATEGORY_LABELS = {
  stays: "Stays",
  transport: "Transport",
  activities: "Things to do",
  food: "Food & Dining",
};

// --- Read URL params ---
const params = new URLSearchParams(window.location.search);
const destinationQuery = params.get("destination") || "Cape Town"; // sensible default
let activeCategory = params.get("category") || "stays";

const destination = findDestination(destinationQuery);

// --- Header ---
document.getElementById("destinationTitle").textContent = destination
  ? `Explore ${destination.displayName}`
  : `No results for "${destinationQuery}"`;

document.getElementById("destinationSubtitle").textContent = destination
  ? `${destination.country} — showing stays, transport, activities and food in this area`
  : "Try one of our popular destinations from the home page instead.";

// --- Tabs: wire up clicks, set counts ---
const tabBar = document.getElementById("tabBar");

function updateTabCounts() {
  Object.keys(CATEGORY_LABELS).forEach(cat => {
    const el = document.getElementById(`count-${cat}`);
    const items = destination ? (destination[cat] || []) : [];
    el.textContent = items.length;
  });
}

function setActiveTab(category) {
  activeCategory = category;
  tabBar.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });
  renderListings();
}

tabBar.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => setActiveTab(btn.dataset.category));
});

// --- Render listing cards for the active category ---
const listingGrid = document.getElementById("listingGrid");

function renderListings() {
  listingGrid.innerHTML = "";

  if (!destination) {
    listingGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-map-location-dot"></i>
        <p>We don't have listings for "${destinationQuery}" yet. Try Cape Town or Durban.</p>
      </div>`;
    return;
  }

  const items = destination[activeCategory] || [];

  if (items.length === 0) {
    listingGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-box-open"></i>
        <p>No ${CATEGORY_LABELS[activeCategory].toLowerCase()} listed for ${destination.displayName} yet.</p>
      </div>`;
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "listing-card";

    const momoBadge = item.momoAccepted
      ? `<span class="momo-badge accepted"><i class="fa-solid fa-circle-check"></i> Accepts MTN MoMo</span>`
      : `<span class="momo-badge not-accepted"><i class="fa-solid fa-circle-xmark"></i> MoMo not accepted here</span>`;

    const alreadyAdded = isInCart(item.id);

    card.innerHTML = `
      <div class="listing-top">
        <div class="listing-icon"><i class="fa-solid ${item.icon}"></i></div>
        <div class="listing-title-block">
          <h3>${item.name}</h3>
          <div class="listing-location"><i class="fa-solid fa-location-dot"></i> ${item.location}</div>
        </div>
        <div class="listing-rating"><i class="fa-solid fa-star"></i> ${item.rating}</div>
      </div>
      <p class="listing-desc">${item.description}</p>
      ${momoBadge}
      <div class="listing-footer">
        <div class="listing-price">R${item.price}<span>${item.priceUnit}</span></div>
        <button class="add-cart-btn ${alreadyAdded ? "added" : ""}" data-id="${item.id}">
          <i class="fa-solid ${alreadyAdded ? "fa-check" : "fa-plus"}"></i> ${alreadyAdded ? "Added" : "Add"}
        </button>
      </div>
    `;

    // Wire the add-to-cart button for this specific card
    const btn = card.querySelector(".add-cart-btn");
    btn.addEventListener("click", () => {
      if (isInCart(item.id)) {
        removeFromCart(item.id);
        btn.classList.remove("added");
        btn.innerHTML = `<i class="fa-solid fa-plus"></i> Add`;
        showToast(`Removed ${item.name} from cart`);
      } else {
        const added = addToCart(item, destination.displayName);
        if (added) {
          btn.classList.add("added");
          btn.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
          showToast(`Added ${item.name} to cart`);
        }
      }
      refreshCartBar();
    });

    listingGrid.appendChild(card);
  });
}

// --- Floating cart bar ---
const cartBar = document.getElementById("cartBar");

function refreshCartBar() {
  const count = getCartCount();
  const total = getCartTotal();
  const cart = getCart();

  document.getElementById("cartBarCount").textContent = count;
  document.getElementById("cartBarTotal").textContent = `R${total}`;
  document.getElementById("cartBarDestination").textContent = cart.destination
    ? `item${count === 1 ? "" : "s"} for ${cart.destination}`
    : "";

  cartBar.classList.toggle("show", count > 0);
}

cartBar.addEventListener("click", openCartPanel);
document.getElementById("cartIconBtn").addEventListener("click", openCartPanel);

// --- Cart panel ---
const cartOverlay = document.getElementById("cartOverlay");
const cartPanel = document.getElementById("cartPanel");
const cartPanelBody = document.getElementById("cartPanelBody");

function openCartPanel() {
  renderCartPanel();
  cartOverlay.classList.add("show");
  cartPanel.classList.add("show");
}

function closeCartPanel() {
  cartOverlay.classList.remove("show");
  cartPanel.classList.remove("show");
}

document.getElementById("cartPanelClose").addEventListener("click", closeCartPanel);
cartOverlay.addEventListener("click", closeCartPanel);

function renderCartPanel() {
  const cart = getCart();
  cartPanelBody.innerHTML = "";

  if (cart.items.length === 0) {
    cartPanelBody.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Your cart is empty. Add stays, transport, food or activities to build your trip.</p>
      </div>`;
  } else {
    cart.items.forEach(item => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item-icon"><i class="fa-solid ${item.icon}"></i></div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>${item.location} · R${item.price} ${item.priceUnit}</span>
        </div>
        <button class="cart-item-remove" aria-label="Remove"><i class="fa-solid fa-trash"></i></button>
      `;
      row.querySelector(".cart-item-remove").addEventListener("click", () => {
        removeFromCart(item.id);
        renderCartPanel();
        renderListings();  // updates that item's "Add" button back to unselected
        refreshCartBar();
      });
      cartPanelBody.appendChild(row);
    });
  }

  const total = getCartTotal();
  document.getElementById("cartPanelTotal").textContent = `R${total}`;

  const addToTripBtn = document.getElementById("addToTripBtn");
  addToTripBtn.disabled = cart.items.length === 0;
}

document.getElementById("addToTripBtn").addEventListener("click", () => {
  const trip = addCartToTrips();
  if (!trip) return;
  showToast(`Trip to ${trip.destination} saved!`);
  setTimeout(() => { window.location.href = "trips.html"; }, 700);
});

// --- Toast ---
let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

// --- Init ---
updateTabCounts();
setActiveTab(activeCategory);
refreshCartBar();
