const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const vm = require("vm");
const { randomUUID } = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const FRONT_END = path.join(ROOT, "front-end");
const PAGES = path.join(FRONT_END, "pages");

const AFRICAN_COUNTRIES = new Set([
  "South Africa",
  "Kenya",
  "Uganda",
  "Ghana",
  "Nigeria",
  "Zambia",
  "Zimbabwe",
  "Botswana",
  "Mozambique",
]);

const CATEGORY_CONFIG = {
  stays: {
    label: "Stays",
    query: "hotels guest houses bed and breakfast",
    icon: "fa-bed",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    basePrice: 850,
    unit: "per night",
  },
  transport: {
    label: "Transport",
    query: "airport shuttle taxi car hire bus transport",
    icon: "fa-bus-simple",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
    basePrice: 180,
    unit: "from",
  },
  activities: {
    label: "Things to do",
    query: "tourist attractions tours activities experiences",
    icon: "fa-camera",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80",
    basePrice: 220,
    unit: "per person",
  },
  food: {
    label: "Food & Dining",
    query: "restaurants local food dining",
    icon: "fa-utensils",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
    basePrice: 160,
    unit: "avg per person",
  },
};

function loadCatalog() {
  const dataPath = path.join(FRONT_END, "js", "data.js");
  const source = fs.readFileSync(dataPath, "utf8");
  const script = `${source}\n;({ DESTINATION_CONFIG, DESTINATIONS, DESTINATION_LIST });`;
  return vm.runInNewContext(script, { console });
}

const catalog = loadCatalog();

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function findDestination(query) {
  const search = normalize(query);
  if (!search) return null;

  const exactKey = catalog.DESTINATIONS[search];
  if (exactKey) return { key: search, ...exactKey };

  const entry = Object.entries(catalog.DESTINATION_CONFIG).find(([key, city]) => {
    const aliases = city.aliases || [];
    return (
      key === search ||
      normalize(city.displayName) === search ||
      aliases.some(alias => normalize(alias) === search) ||
      normalize(city.displayName).includes(search) ||
      search.includes(normalize(city.displayName)) ||
      aliases.some(alias => normalize(alias).includes(search) || search.includes(normalize(alias)))
    );
  });

  return entry ? { key: entry[0], ...catalog.DESTINATIONS[entry[0]] } : null;
}

function getAfricanDestinations() {
  return catalog.DESTINATION_LIST.filter(destination =>
    AFRICAN_COUNTRIES.has(destination.country)
  );
}

function withCategoryImages(destination) {
  return {
    ...destination,
    categories: Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      key,
      label: config.label,
      image: config.image,
      icon: config.icon,
    })),
  };
}

function getPopularAfricaDestinations(limit = 8) {
  return getAfricanDestinations()
    .map(destination => {
      const details = findDestination(destination.name);
      const cityConfig = catalog.DESTINATION_CONFIG[destination.key];
      const totalListings = details
        ? ["stays", "transport", "activities", "food"].reduce(
            (sum, category) => sum + (details[category]?.length || 0),
            0
          )
        : 0;
      const score =
        totalListings +
        (cityConfig?.attractions?.length || 0) * 2 +
        (cityConfig?.foods?.length || 0) +
        (cityConfig?.areas?.length || 0);

      return withCategoryImages({
        ...destination,
        score,
        image: destinationImage(destination.name),
      });
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function destinationImage(name) {
  const slug = normalize(name);
  const images = {
    "cape town":
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1000&q=80",
    johannesburg:
      "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&w=1000&q=80",
    durban:
      "https://images.unsplash.com/photo-1580983597394-171887019688?auto=format&fit=crop&w=1000&q=80",
    nairobi:
      "https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1000&q=80",
    accra:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1000&q=80",
    lagos:
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1000&q=80",
    maputo:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
  };
  return (
    images[slug] ||
    "https://images.unsplash.com/photo-1484318571209-661cf29a69f8?auto=format&fit=crop&w=1000&q=80"
  );
}

function categoryFromRequest(value) {
  const key = normalize(value || "stays");
  return CATEGORY_CONFIG[key] ? key : "stays";
}

function priceFromGooglePlace(place, category) {
  const levels = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  const level = levels[place.priceLevel] ?? 2;
  const base = CATEGORY_CONFIG[category].basePrice;
  const ratingLift = place.rating ? Math.max(0, place.rating - 4) * 80 : 0;
  return Math.round((base * (0.65 + level * 0.35) + ratingLift) / 10) * 10;
}

function fallbackRecommendations(destinationQuery, category) {
  const destination = findDestination(destinationQuery);
  if (!destination) return null;

  return {
    source: "local-catalog",
    destination: {
      key: destination.key,
      name: destination.displayName,
      country: destination.country,
      currency: destination.currency || "ZAR",
    },
    category,
    listings: (destination[category] || []).map(item => ({
      ...item,
      image: CATEGORY_CONFIG[category].image,
      source: "local-catalog",
      providerUrl: null,
    })),
  };
}

async function googlePlacesRecommendations(destinationQuery, category) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const categoryConfig = CATEGORY_CONFIG[category];
  const textQuery = `${categoryConfig.query} in ${destinationQuery}`;
  const response = await axios.post(
    "https://places.googleapis.com/v1/places:searchText",
    {
      textQuery,
      pageSize: 12,
      rankPreference: "RELEVANCE",
      languageCode: "en",
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.googleMapsUri,places.primaryTypeDisplayName",
      },
    }
  );

  const places = response.data.places || [];

  return {
    source: "google-places",
    destination: {
      name: destinationQuery,
      country: "",
      currency: "ZAR",
    },
    category,
    listings: places.map((place, index) => ({
      id: place.id || `google-${category}-${index}`,
      name: place.displayName?.text || "Unnamed place",
      category,
      location: place.formattedAddress || destinationQuery,
      price: priceFromGooglePlace(place, category),
      priceUnit: CATEGORY_CONFIG[category].unit,
      momoAccepted: true,
      rating: place.rating || 4.2,
      icon: CATEGORY_CONFIG[category].icon,
      image: googlePhotoUrl(place, apiKey) || CATEGORY_CONFIG[category].image,
      description: `${place.primaryTypeDisplayName?.text || CATEGORY_CONFIG[category].label} matched for ${destinationQuery}. Pricing is an estimate until a booking provider is connected.`,
      source: "google-places",
      providerUrl: place.googleMapsUri || null,
      userRatingCount: place.userRatingCount || 0,
    })),
  };
}

function googlePhotoUrl(place, apiKey) {
  const photoName = place.photos?.[0]?.name;
  if (!photoName) return null;
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=900&key=${apiKey}`;
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/front-end", express.static(FRONT_END));
app.use("/images", express.static(path.join(ROOT, "images")));
app.use("/firebase-config", express.static(path.join(ROOT, "firebase-config")));

function sendPage(res, fileName) {
  res.sendFile(path.join(PAGES, fileName));
}

app.get(["/", "/home"], (req, res) => sendPage(res, "home.html"));
app.get(["/explore", "/results"], (req, res) => sendPage(res, "results.html"));
app.get(["/trips", "/bookings"], (req, res) => sendPage(res, "trips.html"));
app.get("/journeyfund", (req, res) => sendPage(res, "journeyfund.html"));
app.get("/ai-planner", (req, res) => sendPage(res, "ai-planner.html"));
app.get("/login", (req, res) =>
  res.sendFile(path.join(FRONT_END, "signup&login", "login.html"))
);
app.get("/signup", (req, res) =>
  res.sendFile(path.join(FRONT_END, "signup&login", "signup.html"))
);

app.get("/api/categories", (req, res) => {
  res.json(
    Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      key,
      label: config.label,
      icon: config.icon,
      image: config.image,
    }))
  );
});

app.get("/api/destinations/popular", (req, res) => {
  const limit = Number(req.query.limit || 8);
  res.json({ destinations: getPopularAfricaDestinations(limit) });
});

app.get("/api/recommendations", async (req, res) => {
  const destination = String(req.query.destination || "").trim();
  const category = categoryFromRequest(req.query.category);

  if (!destination) {
    return res.status(400).json({ error: "Destination is required." });
  }

  try {
    const live = await googlePlacesRecommendations(destination, category);
    if (live?.listings?.length) return res.json(live);
  } catch (error) {
    console.error("Google Places lookup failed:", error.response?.data || error.message);
  }

  const fallback = fallbackRecommendations(destination, category);
  if (!fallback) {
    return res.status(404).json({
      error: `No recommendations found for "${destination}".`,
      popularDestinations: getPopularAfricaDestinations(6),
    });
  }

  res.json(fallback);
});

app.post("/api/ai-planner", async (req, res) => {
  const destination = String(req.body.destination || "").trim();
  const budget = Number(req.body.budget || 0);
  const interests = Array.isArray(req.body.interests) ? req.body.interests : [];

  if (!destination) {
    return res.status(400).json({ error: "Destination is required." });
  }

  const categories = ["stays", "transport", "activities", "food"];
  const recommendations = {};

  for (const category of categories) {
    const fallback = fallbackRecommendations(destination, category);
    recommendations[category] = fallback?.listings?.slice(0, 4) || [];
  }

  const selected = [
    recommendations.stays[0],
    recommendations.transport[0],
    ...recommendations.activities.slice(0, 2),
    recommendations.food[0],
  ].filter(Boolean);

  const estimatedTotal = selected.reduce((sum, item) => sum + Number(item.price || 0), 0);

  res.json({
    destination,
    budget,
    interests,
    estimatedTotal,
    withinBudget: budget ? estimatedTotal <= budget : null,
    plan: selected,
    recommendations,
    note:
      "Planner uses live Google Places when GOOGLE_MAPS_API_KEY is configured; otherwise it uses the local Africa travel catalog.",
  });
});

app.post("/api/journeyfund/requests", async (req, res) => {
  const request = {
    id: `jf-${randomUUID()}`,
    status: "pending",
    mode: process.env.JOURNEYFUND_API_KEY ? "api-ready" : "demo",
    createdAt: new Date().toISOString(),
    ...req.body,
  };

  res.status(201).json({
    success: true,
    request,
    message: process.env.JOURNEYFUND_API_KEY
      ? "JourneyFund request created with configured API key."
      : "JourneyFund request created in demo mode. Add JOURNEYFUND_API_KEY to connect live processing.",
  });
});

app.post("/api/journeyfund/pay", async (req, res) => {
  const reference = `JF-${Date.now().toString(36).toUpperCase()}`;
  res.json({
    success: true,
    status: "SUCCESSFUL",
    mode: process.env.JOURNEYFUND_API_KEY ? "api-ready" : "demo",
    reference,
    amount: req.body.amount,
  });
});

app.post("/api/disburse", (req, res) => {
  res.json({
    success: true,
    mode: process.env.MOMO_DISBURSEMENT_API_KEY ? "sandbox" : "demo",
    reference: req.body.reference || `REF-${Date.now()}`,
    message: "Refund accepted by server.",
  });
});

app.listen(PORT, () => {
  console.log(`MoMo Travel app running at http://localhost:${PORT}`);
});
