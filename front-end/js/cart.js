/* ==========================================================
   MTN MoMo Travel — Cart & Trips state
   Uses localStorage so the cart survives moving between
   home.html -> results.html and persists trips in trips.html.
   No backend yet — this is the client-side source of truth
   until we wire up Firebase.
   ========================================================== */

const CART_KEY = "momo_travel_cart";
const TRIPS_KEY = "momo_travel_trips";
const WALLET_KEY = "momo_travel_wallet";
const EXPENSES_KEY = "momo_travel_expenses";

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

function setTrips(trips) {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

function saveTripFromItems({ destination, items, source = "cart", dates = "", travelers = "" }) {
  if (!items?.length) return null;
  const trip = {
    id: "trip-" + Date.now(),
    destination,
    dates,
    travelers,
    source,
    status: "planned",
    createdAt: new Date().toISOString(),
    paidAmount: 0,
    members: [],
    items,
    total: items.reduce((sum, i) => sum + Number(i.price || 0), 0),
  };

  const trips = getTrips();
  trips.unshift(trip);
  setTrips(trips);

  const user = window.FirebaseAuth?.currentUser;
  if (user && window.FirestoreService?.addTrip) {
    window.FirestoreService.addTrip(user.uid, trip).catch(error => {
      console.warn("Trip saved locally but Firestore sync failed:", error);
    });
  }

  return trip;
}

// Turns the current cart into a saved trip, then empties the cart.
function addCartToTrips({ dates = "" } = {}) {
  const cart = getCart();
  const trip = saveTripFromItems({
    destination: cart.destination,
    items: cart.items,
    source: "explore",
    dates,
  });
  if (!trip) return null;
  clearCart();
  return trip;
}

function updateTrip(tripId, changes) {
  const trips = getTrips();
  const index = trips.findIndex(trip => trip.id === tripId);
  if (index === -1) return null;
  trips[index] = { ...trips[index], ...changes, updatedAt: new Date().toISOString() };
  setTrips(trips);
  return trips[index];
}

function addTripMember(tripId, member) {
  const trips = getTrips();
  const index = trips.findIndex(trip => trip.id === tripId);
  if (index === -1) return null;
  const currentMembers = Array.isArray(trips[index].members) ? trips[index].members : [];
  trips[index].members = [
    ...currentMembers,
    {
      id: "member-" + Date.now(),
      name: member.name,
      msisdn: member.msisdn,
      invitedAt: new Date().toISOString(),
      status: "invited",
    },
  ];
  trips[index].updatedAt = new Date().toISOString();
  setTrips(trips);
  return trips[index];
}

function getWallet() {
  const raw = localStorage.getItem(WALLET_KEY);
  return raw ? JSON.parse(raw) : { balance: 0, updatedAt: null };
}

function saveWallet(wallet) {
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  window.dispatchEvent(new CustomEvent("momo-wallet-updated", { detail: wallet }));
  return wallet;
}

function getWalletBalance() {
  return Number(getWallet().balance || 0);
}

function adjustWalletBalance(amount, reason) {
  const wallet = getWallet();
  const nextBalance = Number(wallet.balance || 0) + Number(amount || 0);
  if (nextBalance < 0) {
    return { success: false, balance: Number(wallet.balance || 0), message: "Insufficient virtual card balance." };
  }
  const nextWallet = {
    ...wallet,
    balance: nextBalance,
    lastReason: reason,
    updatedAt: new Date().toISOString(),
  };
  saveWallet(nextWallet);
  return { success: true, balance: nextBalance };
}

function getExpenses() {
  const raw = localStorage.getItem(EXPENSES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function addExpense(expense) {
  const expenses = getExpenses();
  const entry = {
    id: "exp-" + Date.now(),
    createdAt: new Date().toISOString(),
    ...expense,
  };
  expenses.unshift(entry);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  return entry;
}
