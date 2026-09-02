const CATEGORY_LABELS = {
  stays: "Stays",
  transport: "Transport",
  activities: "Things to do",
  food: "Food & Dining",
};

const params = new URLSearchParams(window.location.search);
const destinationQuery = params.get("destination") || "Cape Town";
let activeCategory = params.get("category") || "stays";
const cache = {};

const destinationTitle = document.getElementById("destinationTitle");
const destinationSubtitle = document.getElementById("destinationSubtitle");
const tabBar = document.getElementById("tabBar");
const listingGrid = document.getElementById("listingGrid");
const cartBar = document.getElementById("cartBar");
const tripDateInput = document.getElementById("tripDateInput");
const cartTripDateInput = document.getElementById("cartTripDateInput");

function money(value) {
  return `R${Number(value || 0).toLocaleString("en-ZA")}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setLoading() {
  listingGrid.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Finding ${CATEGORY_LABELS[activeCategory].toLowerCase()} in ${escapeHtml(destinationQuery)}...</p>
    </div>
  `;
}

async function fetchRecommendations(category) {
  if (cache[category]) return cache[category];

  const url = `/api/recommendations?destination=${encodeURIComponent(destinationQuery)}&category=${encodeURIComponent(category)}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Recommendations unavailable");
  }

  cache[category] = data;
  return data;
}

async function setActiveTab(category) {
  activeCategory = CATEGORY_LABELS[category] ? category : "stays";

  tabBar.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === activeCategory);
  });

  setLoading();

  try {
    const data = await fetchRecommendations(activeCategory);
    updateHeader(data);
    updateTabCounts();
    renderListings(data.listings || []);
  } catch (error) {
    destinationTitle.textContent = `No results for "${destinationQuery}"`;
    destinationSubtitle.textContent = "Try another African destination or check your API configuration.";
    listingGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-map-location-dot"></i>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

function updateHeader(data) {
  const destination = data.destination || { name: destinationQuery };
  const sourceText = data.source === "google-places"
    ? "live Google Places matches"
    : "local catalog matches";

  destinationTitle.textContent = `Explore ${destination.name || destinationQuery}`;
  destinationSubtitle.textContent = `${destination.country || "Africa"} - showing ${CATEGORY_LABELS[activeCategory].toLowerCase()} from ${sourceText}`;
}

function updateTabCounts() {
  Object.keys(CATEGORY_LABELS).forEach(category => {
    const el = document.getElementById(`count-${category}`);
    el.textContent = cache[category]?.listings?.length || (category === activeCategory ? 0 : "...");
  });
}

function renderListings(items) {
  listingGrid.innerHTML = "";

  if (!items.length) {
    listingGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-box-open"></i>
        <p>No ${CATEGORY_LABELS[activeCategory].toLowerCase()} found for ${escapeHtml(destinationQuery)} yet.</p>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = document.createElement("article");
    card.className = "listing-card listing-card-media";

    const momoBadge = item.momoAccepted
      ? `<span class="momo-badge accepted"><i class="fa-solid fa-circle-check"></i> Accepts MTN MoMo</span>`
      : `<span class="momo-badge not-accepted"><i class="fa-solid fa-circle-xmark"></i> MoMo not accepted here</span>`;

    const alreadyAdded = isInCart(item.id);
    const providerLink = item.providerUrl
      ? `<a class="provider-link" href="${escapeHtml(item.providerUrl)}" target="_blank" rel="noopener">View source <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
      : `<span class="provider-link muted">Catalog estimate</span>`;

    card.innerHTML = `
      <div class="listing-image" style="background-image: url('${escapeHtml(item.image)}');">
        <span class="listing-source">${escapeHtml(item.source === "google-places" ? "Google Places" : "Catalog")}</span>
      </div>
      <div class="listing-body">
        <div class="listing-top">
          <div class="listing-icon"><i class="fa-solid ${escapeHtml(item.icon)}"></i></div>
          <div class="listing-title-block">
            <h3>${escapeHtml(item.name)}</h3>
            <div class="listing-location"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location)}</div>
          </div>
          <div class="listing-rating"><i class="fa-solid fa-star"></i> ${escapeHtml(item.rating)}</div>
        </div>
        <p class="listing-desc">${escapeHtml(item.description)}</p>
        <div class="listing-meta-row">
          ${momoBadge}
          ${providerLink}
        </div>
        <div class="listing-footer">
          <div class="listing-price">${money(item.price)}<span>${escapeHtml(item.priceUnit)}</span></div>
          <button class="add-cart-btn ${alreadyAdded ? "added" : ""}" data-id="${escapeHtml(item.id)}">
            <i class="fa-solid ${alreadyAdded ? "fa-check" : "fa-plus"}"></i> ${alreadyAdded ? "Added" : "Add"}
          </button>
        </div>
      </div>
    `;

    const btn = card.querySelector(".add-cart-btn");
    btn.addEventListener("click", () => {
      if (isInCart(item.id)) {
        removeFromCart(item.id);
        btn.classList.remove("added");
        btn.innerHTML = `<i class="fa-solid fa-plus"></i> Add`;
        showToast(`Removed ${item.name} from cart`);
      } else {
        const added = addToCart(item, cache[activeCategory].destination.name || destinationQuery);
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

tabBar.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => setActiveTab(btn.dataset.category));
});

function refreshCartBar() {
  const count = getCartCount();
  const total = getCartTotal();
  const cart = getCart();

  document.getElementById("cartBarCount").textContent = count;
  document.getElementById("cartBarTotal").textContent = money(total);
  document.getElementById("cartBarDestination").textContent = cart.destination
    ? `item${count === 1 ? "" : "s"} for ${cart.destination}`
    : "";

  cartBar.classList.toggle("show", count > 0);
}

cartBar.addEventListener("click", openCartPanel);
document.getElementById("cartIconBtn").addEventListener("click", openCartPanel);

const cartOverlay = document.getElementById("cartOverlay");
const cartPanel = document.getElementById("cartPanel");
const cartPanelBody = document.getElementById("cartPanelBody");

function openCartPanel() {
  renderCartPanel();
  cartTripDateInput.value = tripDateInput.value;
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
      </div>
    `;
  } else {
    cart.items.forEach(item => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item-icon"><i class="fa-solid ${escapeHtml(item.icon)}"></i></div>
        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <span>${escapeHtml(item.location)} - ${money(item.price)} ${escapeHtml(item.priceUnit)}</span>
        </div>
        <button class="cart-item-remove" aria-label="Remove"><i class="fa-solid fa-trash"></i></button>
      `;
      row.querySelector(".cart-item-remove").addEventListener("click", () => {
        removeFromCart(item.id);
        renderCartPanel();
        setActiveTab(activeCategory);
        refreshCartBar();
      });
      cartPanelBody.appendChild(row);
    });
  }

  document.getElementById("cartPanelTotal").textContent = money(getCartTotal());
  document.getElementById("addToTripBtn").disabled = cart.items.length === 0;
}

document.getElementById("addToTripBtn").addEventListener("click", () => {
  const tripDate = cartTripDateInput.value || tripDateInput.value;
  const trip = addCartToTrips({ dates: tripDate });
  if (!trip) return;
  showToast(`Trip to ${trip.destination} saved!`);
  setTimeout(() => { window.location.href = "/trips"; }, 700);
});

tripDateInput.addEventListener("change", () => {
  cartTripDateInput.value = tripDateInput.value;
});

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

updateTabCounts();
setActiveTab(activeCategory);
refreshCartBar();
