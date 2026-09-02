/* ==========================================================
   MTN MoMo Travel — Cart & Trips state
   Uses localStorage so the cart survives moving between
   home.html -> results.html and persists trips in trips.html.
   No backend yet — this is the client-side source of truth
   until we wire up Firebase.
   ========================================================== */

const CART_KEY = "momo_travel_cart";
const TRIPS_KEY = "momo_travel_trips";

// --- Cart ---

function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : { destination: null, items: [] };
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Add a listing to the cart. If the cart already has items from a
// different destination, we reset it — one trip's cart at a time.
function addToCart(item, destinationName) {
  const cart = getCart();
  if (cart.destination && cart.destination !== destinationName) {
    const startFresh = confirm(
      `Your cart has items from ${cart.destination}. Start a new cart for ${destinationName}?`
    );
    if (!startFresh) return false;
    cart.items = [];
  }
  cart.destination = destinationName;
  if (!cart.items.find(i => i.id === item.id)) {
    cart.items.push(item);
  }
  saveCart(cart);
  return true;
}

function removeFromCart(itemId) {
  const cart = getCart();
  cart.items = cart.items.filter(i => i.id !== itemId);
  if (cart.items.length === 0) cart.destination = null;
  saveCart(cart);
}

function isInCart(itemId) {
  return getCart().items.some(i => i.id === itemId);
}

function getCartTotal() {
  return getCart().items.reduce((sum, i) => sum + i.price, 0);
}

function getCartCount() {
  return getCart().items.length;
}

function clearCart() {
  saveCart({ destination: null, items: [] });
}

// --- Trips ---

function getTrips() {
  const raw = localStorage.getItem(TRIPS_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Turns the current cart into a saved trip, then empties the cart.
function addCartToTrips() {
  const cart = getCart();
  if (cart.items.length === 0) return null;

  const trip = {
    id: "trip-" + Date.now(),
    destination: cart.destination,
    createdAt: new Date().toISOString(),
    items: cart.items,
    total: cart.items.reduce((sum, i) => sum + i.price, 0),
  };

  const trips = getTrips();
  trips.unshift(trip); // newest first
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));

  const user = window.FirebaseAuth?.currentUser;
  if (user && window.FirestoreService?.addTrip) {
    window.FirestoreService.addTrip(user.uid, trip).catch(error => {
      console.warn("Trip saved locally but Firestore sync failed:", error);
    });
  }

  clearCart();
  return trip;
}
