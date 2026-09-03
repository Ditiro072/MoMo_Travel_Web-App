const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const vm = require("vm");
const { randomUUID } = require("crypto");

// ============================================================
// MoMo Travel API Server
// - Front-end page/static routes
// - Travel recommendations
// - JourneyFund
// - MTN MoMo Collection / Disbursement / Remittance sandbox
// ============================================================

const app = express();

// ------------------------------------------------------------
// Paths / environment
// ------------------------------------------------------------
const ROOT = __dirname;
const ENV_FILE = path.join(ROOT, ".env");
const FRONT_END = path.join(ROOT, "front-end");
const PAGES = path.join(FRONT_END, "pages");
const PORT = Number(process.env.PORT || 5000);

function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return;

  const source = fs.readFileSync(ENV_FILE, "utf8");

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;

    const equalsIndex = line.indexOf("=");
    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (!key) continue;

    // Remove matching single/double quotes.
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }

    // Do not overwrite values supplied by the shell/environment.
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const MOMO_BASE_URL = (
  process.env.MOMO_BASE_URL || "https://sandbox.momodeveloper.mtn.com"
).replace(/\/+$/, "");

const MOMO_PRODUCTS = ["collection", "disbursement", "remittance"];

// ------------------------------------------------------------
// Travel catalog
// ------------------------------------------------------------
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

  if (!fs.existsSync(dataPath)) {
    console.warn(`Travel catalog not found: ${dataPath}`);
    return {
      DESTINATION_CONFIG: {},
      DESTINATIONS: {},
      DESTINATION_LIST: [],
    };
  }

  try {
    const source = fs.readFileSync(dataPath, "utf8");
    const script = `${source}\n;({ DESTINATION_CONFIG, DESTINATIONS, DESTINATION_LIST });`;
    return vm.runInNewContext(script, { console });
  } catch (error) {
    console.error("Could not load front-end travel catalog:", error.message);
    return {
      DESTINATION_CONFIG: {},
      DESTINATIONS: {},
      DESTINATION_LIST: [],
    };
  }
}

const catalog = loadCatalog();

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function findDestination(query) {
  const search = normalize(query);
  if (!search) return null;

  const direct = catalog.DESTINATIONS?.[search];
  if (direct) return { key: search, ...direct };

  const entry = Object.entries(catalog.DESTINATION_CONFIG || {}).find(
    ([key, city]) => {
      const aliases = Array.isArray(city.aliases) ? city.aliases : [];
      const displayName = normalize(city.displayName || key);

      return (
        normalize(key) === search ||
        displayName === search ||
        aliases.some((alias) => normalize(alias) === search) ||
        displayName.includes(search) ||
        search.includes(displayName) ||
        aliases.some(
          (alias) =>
            normalize(alias).includes(search) || search.includes(normalize(alias))
        )
      );
    }
  );

  if (!entry) return null;

  const [key] = entry;
  return {
    key,
    ...(catalog.DESTINATIONS?.[key] || entry[1] || {}),
  };
}

function getAfricanDestinations() {
  return (catalog.DESTINATION_LIST || []).filter((destination) =>
    AFRICAN_COUNTRIES.has(destination.country)
  );
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
  const safeLimit = Math.max(1, Math.min(Number(limit) || 8, 50));

  return getAfricanDestinations()
    .map((destination) => {
      const details = findDestination(destination.name);
      const cityConfig = catalog.DESTINATION_CONFIG?.[destination.key];
      const totalListings = details
        ? Object.keys(CATEGORY_CONFIG).reduce(
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
    .slice(0, safeLimit);
}

function categoryFromRequest(value) {
  const key = normalize(value || "stays");
  return CATEGORY_CONFIG[key] ? key : "stays";
}

// ------------------------------------------------------------
// Google Places
// ------------------------------------------------------------
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
  const ratingLift = place.rating
    ? Math.max(0, place.rating - 4) * 80
    : 0;

  return Math.round((base * (0.65 + level * 0.35) + ratingLift) / 10) * 10;
}

function googlePhotoUrl(place, apiKey) {
  const photoName = place.photos?.[0]?.name;
  if (!photoName) return null;

  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=900&key=${encodeURIComponent(
    apiKey
  )}`;
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
      timeout: 15000,
    }
  );

  const places = response.data?.places || [];

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
      description: `${
        place.primaryTypeDisplayName?.text || CATEGORY_CONFIG[category].label
      } matched for ${destinationQuery}. Pricing is an estimate until a booking provider is connected.`,
      source: "google-places",
      providerUrl: place.googleMapsUri || null,
      userRatingCount: place.userRatingCount || 0,
    })),
  };
}

function fallbackRecommendations(destinationQuery, category) {
  const destination = findDestination(destinationQuery);
  if (!destination) return null;

  return {
    source: "local-catalog",
    destination: {
      key: destination.key,
      name: destination.displayName || destination.name,
      country: destination.country,
      currency: destination.currency || "ZAR",
    },
    category,
    listings: (destination[category] || []).map((item) => ({
      ...item,
      image: CATEGORY_CONFIG[category].image,
      source: "local-catalog",
      providerUrl: null,
    })),
  };
}

// ------------------------------------------------------------
// MTN MoMo configuration
// ------------------------------------------------------------
function momoProductConfig(product) {
  if (!MOMO_PRODUCTS.includes(product)) {
    throw new Error(`Unsupported MoMo product: ${product}`);
  }

  const prefix = `MOMO_${product.toUpperCase()}`;

  return {
    product,
    subscriptionKey:
      process.env[`${prefix}_SUBSCRIPTION_KEY`] ||
      process.env.MOMO_SUBSCRIPTION_KEY ||
      "",
    apiUser:
      process.env[`${prefix}_API_USER_ID`] ||
      process.env.MOMO_API_USER_ID ||
      "",
    apiKey:
      process.env[`${prefix}_API_KEY`] || process.env.MOMO_API_KEY || "",
    currency: process.env.MOMO_CURRENCY || "EUR",
    targetEnvironment: process.env.MOMO_TARGET_ENVIRONMENT || "sandbox",
    callbackUrl: process.env.MOMO_CALLBACK_URL || "",
  };
}

function hasMomoCredentials(product) {
  const config = momoProductConfig(product);
  return Boolean(
    config.subscriptionKey && config.apiUser && config.apiKey
  );
}

function requireMomoCredentials(product) {
  const config = momoProductConfig(product);
  const missing = [];

  if (!config.subscriptionKey) missing.push("subscription key");
  if (!config.apiUser) missing.push("API user ID");
  if (!config.apiKey) missing.push("API key");

  if (missing.length) {
    const error = new Error(
      `${product} MoMo credentials are missing: ${missing.join(", ")}`
    );
    error.code = "MOMO_NOT_CONFIGURED";
    throw error;
  }

  return config;
}

function momoHeaders(config, extra = {}) {
  return {
    "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    "X-Target-Environment": config.targetEnvironment,
    ...extra,
  };
}

function cleanMsisdn(value) {
  return String(value ?? "").replace(/[^0-9]/g, "");
}

function validateAmount(value) {
  const amount = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    return { ok: false, error: "Amount must be a positive number." };
  }

  if (Number(amount) <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }

  return { ok: true, value: amount };
}

function validateMsisdn(value) {
  const msisdn = cleanMsisdn(value);

  // MTN sandbox accounts can vary by market. We intentionally do not force
  // a country-specific length here; we only reject obviously invalid input.
  if (!/^\d{7,15}$/.test(msisdn)) {
    return {
      ok: false,
      error: "MSISDN must contain 7 to 15 digits. Use an MTN sandbox test number.",
    };
  }

  return { ok: true, value: msisdn };
}

function sanitizeNote(value, fallback) {
  const note = String(value ?? fallback)
    .replace(/[^\w\s.\-]/g, "")
    .trim();

  return note.slice(0, 100) || fallback;
}

function buildCallbackHeaders(config, referenceId) {
  const headers = {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    "X-Reference-Id": referenceId,
    "X-Target-Environment": config.targetEnvironment,
  };

  // X-Callback-Url is optional for local polling tests. If supplied in .env,
  // send it. This avoids sending an invalid placeholder URL to MTN.
  if (config.callbackUrl) {
    headers["X-Callback-Url"] = config.callbackUrl;
  }

  return headers;
}

async function getMomoAccessToken(product) {
  const config = requireMomoCredentials(product);
  const credentials = Buffer.from(
    `${config.apiUser}:${config.apiKey}`
  ).toString("base64");

  const response = await axios.post(
    `${MOMO_BASE_URL}/${product}/token/`,
    null,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      },
      timeout: 15000,
      validateStatus: () => true,
    }
  );

  if (response.status < 200 || response.status >= 300) {
    const error = new Error(`MoMo token request failed with HTTP ${response.status}`);
    error.response = response;
    throw error;
  }

  if (!response.data?.access_token) {
    const error = new Error("MoMo token response did not contain access_token");
    error.response = response;
    throw error;
  }

  return response.data.access_token;
}

async function callMomoTransaction(
  product,
  pathName,
  body,
  referenceId = randomUUID()
) {
  const config = requireMomoCredentials(product);
  const token = await getMomoAccessToken(product);

  const response = await axios.post(
    `${MOMO_BASE_URL}/${product}/v1_0/${pathName}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        ...buildCallbackHeaders(config, referenceId),
      },
      timeout: 20000,
      validateStatus: () => true,
    }
  );

  if (response.status < 200 || response.status >= 300) {
    const error = new Error(
      `MoMo ${product}/${pathName} request failed with HTTP ${response.status}`
    );
    error.response = response;
    throw error;
  }

  return { response, referenceId };
}

async function callMomoStatus(product, pathName, referenceId) {
  const config = requireMomoCredentials(product);
  const token = await getMomoAccessToken(product);

  const response = await axios.get(
    `${MOMO_BASE_URL}/${product}/v1_0/${pathName}/${encodeURIComponent(
      referenceId
    )}`,
    {
      headers: momoHeaders(config, {
        Authorization: `Bearer ${token}`,
      }),
      timeout: 15000,
      validateStatus: () => true,
    }
  );

  if (response.status < 200 || response.status >= 300) {
    const error = new Error(
      `MoMo ${product}/${pathName} status request failed with HTTP ${response.status}`
    );
    error.response = response;
    throw error;
  }

  return response.data;
}

function mask(value) {
  if (!value) return "not set";
  const stringValue = String(value);
  if (stringValue.length <= 6) return "******";
  return `${stringValue.slice(0, 3)}...${stringValue.slice(-3)}`;
}

function publicMomoError(error) {
  const status = error.response?.status;
  const data = error.response?.data;

  // Keep detailed upstream errors in the terminal, but give Postman a useful
  // diagnostic response without exposing credentials.
  return {
    status: status || 502,
    error: error.message || "MoMo request failed.",
    momo: data || undefined,
  };
}

function writeEnvConfig(values) {
  const allowed = [
    "GOOGLE_MAPS_API_KEY",
    "MOMO_BASE_URL",
    "MOMO_TARGET_ENVIRONMENT",
    "MOMO_CURRENCY",
    "MOMO_CALLBACK_URL",
    "MOMO_API_USER_ID",
    "MOMO_API_KEY",
    "MOMO_SUBSCRIPTION_KEY",
    "MOMO_COLLECTION_SUBSCRIPTION_KEY",
    "MOMO_COLLECTION_API_USER_ID",
    "MOMO_COLLECTION_API_KEY",
    "MOMO_DISBURSEMENT_SUBSCRIPTION_KEY",
    "MOMO_DISBURSEMENT_API_USER_ID",
    "MOMO_DISBURSEMENT_API_KEY",
    "MOMO_REMITTANCE_SUBSCRIPTION_KEY",
    "MOMO_REMITTANCE_API_USER_ID",
    "MOMO_REMITTANCE_API_KEY",
  ];

  const next = {};

  for (const key of allowed) {
    next[key] =
      values[key] !== undefined
        ? String(values[key]).trim()
        : process.env[key] || "";

    process.env[key] = next[key];
  }

  const body = [
    "# MTN MoMo sandbox configuration",
    ...allowed.map((key) => `${key}=${next[key]}`),
    "",
  ].join("\n");

  fs.writeFileSync(ENV_FILE, body, "utf8");
}

// ------------------------------------------------------------
// Middleware
// ------------------------------------------------------------
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Request logging makes a 404 immediately diagnosable in the terminal.
app.use((req, res, next) => {
  const started = Date.now();

  res.on("finish", () => {
    const elapsed = Date.now() - started;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${elapsed}ms)`);
  });

  next();
});

// ------------------------------------------------------------
// Static files / pages
// ------------------------------------------------------------
if (fs.existsSync(FRONT_END)) {
  app.use("/front-end", express.static(FRONT_END));
}

const imagesDir = path.join(ROOT, "images");
if (fs.existsSync(imagesDir)) {
  app.use("/images", express.static(imagesDir));
}

const firebaseDir = path.join(ROOT, "firebase-config");
if (fs.existsSync(firebaseDir)) {
  app.use("/firebase-config", express.static(firebaseDir));
}

function sendPage(res, fileName) {
  const filePath = path.join(PAGES, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(
      `Page not found: ${fileName}. Expected file at ${filePath}`
    );
  }

  return res.sendFile(filePath);
}

app.get(["/", "/home"], (req, res) => sendPage(res, "home.html"));
app.get(["/explore", "/results"], (req, res) => sendPage(res, "results.html"));
app.get(["/trips", "/bookings"], (req, res) => sendPage(res, "trips.html"));
app.get("/journeyfund", (req, res) => sendPage(res, "journeyfund.html"));
app.get("/ai-planner", (req, res) => sendPage(res, "ai-planner.html"));
app.get("/momo-settings", (req, res) => sendPage(res, "momo-settings.html"));
app.get("/login", (req, res) =>
  res.sendFile(path.join(FRONT_END, "signup&login", "login.html"))
);
app.get("/signup", (req, res) =>
  res.sendFile(path.join(FRONT_END, "signup&login", "signup.html"))
);

// ------------------------------------------------------------
// Health / diagnostics
// ------------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "MoMo Travel API",
    status: "running",
    port: PORT,
    momoBaseUrl: MOMO_BASE_URL,
    targetEnvironment: process.env.MOMO_TARGET_ENVIRONMENT || "sandbox",
    time: new Date().toISOString(),
  });
});

app.get("/api/routes", (req, res) => {
  res.json({
    method: "GET",
    routes: [
      "GET /api/health",
      "GET /api/routes",
      "GET /api/categories",
      "GET /api/destinations/popular",
      "GET /api/recommendations?destination=Cape%20Town&category=stays",
      "POST /api/ai-planner",
      "POST /api/journeyfund/requests",
      "POST /api/journeyfund/pay",
      "GET /api/journeyfund/pay/status/:reference",
      "POST /api/disburse",
      "POST /api/remittance",
      "GET /api/momo/config",
      "POST /api/momo/config",
      "POST /api/momo/provision-user",
      "GET /api/momo/status",
      "POST /api/momo/callback",
      "PUT /api/momo/callback",
    ],
  });
});

// ------------------------------------------------------------
// Travel API
// ------------------------------------------------------------
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
    console.error(
      "Google Places lookup failed:",
      error.response?.data || error.message
    );
  }

  const fallback = fallbackRecommendations(destination, category);

  if (!fallback) {
    return res.status(404).json({
      error: `No recommendations found for "${destination}".`,
      popularDestinations: getPopularAfricaDestinations(6),
    });
  }

  return res.json(fallback);
});

app.post("/api/ai-planner", async (req, res) => {
  const destination = String(req.body.destination || "").trim();
  const budget = Number(req.body.budget || 0);
  const interests = Array.isArray(req.body.interests) ? req.body.interests : [];
  const categories = ["stays", "transport", "activities", "food"];

  if (!destination) {
    return res.status(400).json({ error: "Destination is required." });
  }

  const recommendations = {};

  for (const category of categories) {
    try {
      const live = await googlePlacesRecommendations(destination, category);
      if (live?.listings?.length) {
        recommendations[category] = live.listings.slice(0, 4);
        continue;
      }
    } catch (error) {
      console.error(
        `Google Places planner lookup failed for ${category}:`,
        error.response?.data || error.message
      );
    }

    const fallback = fallbackRecommendations(destination, category);
    recommendations[category] = fallback?.listings?.slice(0, 4) || [];
  }

  const selected = [
    recommendations.stays[0],
    recommendations.transport[0],
    ...recommendations.activities.slice(0, 2),
    recommendations.food[0],
  ].filter(Boolean);

  const estimatedTotal = selected.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  return res.json({
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

// ------------------------------------------------------------
// JourneyFund
// ------------------------------------------------------------
app.post("/api/journeyfund/requests", async (req, res) => {
  const request = {
    id: `jf-${randomUUID()}`,
    status: "pending",
    mode: process.env.JOURNEYFUND_API_KEY ? "api-ready" : "demo",
    createdAt: new Date().toISOString(),
    ...req.body,
  };

  return res.status(201).json({
    success: true,
    request,
    message: process.env.JOURNEYFUND_API_KEY
      ? "JourneyFund request created with configured API key."
      : "JourneyFund request created in demo mode. Add JOURNEYFUND_API_KEY to connect live processing.",
  });
});

// Collection / RequestToPay
app.post("/api/journeyfund/pay", async (req, res) => {
  const amountResult = validateAmount(req.body.amount);
  const msisdnResult = validateMsisdn(req.body.msisdn);

  if (!amountResult.ok) {
    return res.status(400).json({ success: false, error: amountResult.error });
  }

  if (!msisdnResult.ok) {
    return res.status(400).json({ success: false, error: msisdnResult.error });
  }

  if (!hasMomoCredentials("collection")) {
    const reference = `JF-${Date.now().toString(36).toUpperCase()}`;
    return res.json({
      success: true,
      status: "SUCCESSFUL",
      mode: "demo",
      reference,
      amount: amountResult.value,
      message:
        "Demo mode. Configure MOMO_COLLECTION_SUBSCRIPTION_KEY, MOMO_COLLECTION_API_USER_ID and MOMO_COLLECTION_API_KEY for MTN sandbox testing.",
    });
  }

  try {
    const config = momoProductConfig("collection");
    const externalId = `JF-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const { referenceId } = await callMomoTransaction(
      "collection",
      "requesttopay",
      {
        amount: amountResult.value,
        currency: config.currency,
        externalId,
        payer: {
          partyIdType: "MSISDN",
          partyId: msisdnResult.value,
        },
        payerMessage: "MoMo Travel JourneyFund payment",
        payeeNote: sanitizeNote(req.body.note, "JourneyFund payment"),
      }
    );

    return res.status(202).json({
      success: true,
      status: "PENDING",
      mode: "momo-sandbox",
      product: "collection",
      reference: referenceId,
      amount: amountResult.value,
      currency: config.currency,
      message:
        "Request accepted by MTN MoMo. Poll the status endpoint or wait for the callback.",
    });
  } catch (error) {
    console.error(
      "MoMo collection request failed:",
      error.response?.status,
      error.response?.data || error.message
    );

    const upstream = publicMomoError(error);
    return res.status(upstream.status).json({
      success: false,
      error: "MoMo collection request failed.",
      details: upstream.momo,
    });
  }
});

app.get("/api/journeyfund/pay/status/:reference", async (req, res) => {
  const reference = String(req.params.reference || "").trim();

  if (!reference) {
    return res.status(400).json({ success: false, error: "Reference is required." });
  }

  if (!hasMomoCredentials("collection")) {
    return res.json({
      mode: "demo",
      reference,
      status: "SUCCESSFUL",
      message: "Demo mode - no live MoMo status check performed.",
    });
  }

  try {
    const status = await callMomoStatus(
      "collection",
      "requesttopay",
      reference
    );

    return res.json({
      mode: "momo-sandbox",
      reference,
      ...status,
    });
  } catch (error) {
    console.error(
      "MoMo collection status check failed:",
      error.response?.status,
      error.response?.data || error.message
    );

    const upstream = publicMomoError(error);
    return res.status(upstream.status).json({
      success: false,
      error: "Could not fetch MoMo requesttopay status.",
      details: upstream.momo,
      reference,
    });
  }
});

// Disbursement / Transfer
app.post("/api/disburse", async (req, res) => {
  const amountResult = validateAmount(req.body.amount);
  const msisdnResult = validateMsisdn(req.body.mobileNumber);

  if (!amountResult.ok) {
    return res.status(400).json({ success: false, error: amountResult.error });
  }

  if (!msisdnResult.ok) {
    return res.status(400).json({ success: false, error: msisdnResult.error });
  }

  if (!hasMomoCredentials("disbursement")) {
    return res.json({
      success: true,
      mode: "demo",
      reference: req.body.reference || `DIS-${Date.now()}`,
      message: "Disbursement accepted in demo mode.",
    });
  }

  try {
    const config = momoProductConfig("disbursement");
    const externalId = String(req.body.reference || `DIS-${Date.now()}`)
      .replace(/[^\w.-]/g, "")
      .slice(0, 50);

    const { referenceId } = await callMomoTransaction(
      "disbursement",
      "transfer",
      {
        amount: amountResult.value,
        currency: config.currency,
        externalId,
        payee: {
          partyIdType: "MSISDN",
          partyId: msisdnResult.value,
        },
        payerMessage: "MoMo Travel transfer",
        payeeNote: sanitizeNote(req.body.note, "MoMo Travel transfer"),
      }
    );

    return res.status(202).json({
      success: true,
      status: "PENDING",
      mode: "momo-sandbox",
      product: "disbursement",
      reference: referenceId,
      amount: amountResult.value,
      currency: config.currency,
      message: "Disbursement accepted by MTN MoMo sandbox.",
    });
  } catch (error) {
    console.error(
      "MoMo disbursement failed:",
      error.response?.status,
      error.response?.data || error.message
    );

    const upstream = publicMomoError(error);
    return res.status(upstream.status).json({
      success: false,
      error: "MoMo disbursement failed.",
      details: upstream.momo,
    });
  }
});

// Remittance / Transfer
app.post("/api/remittance", async (req, res) => {
  const amountResult = validateAmount(req.body.amount);
  const msisdnResult = validateMsisdn(req.body.mobileNumber);

  if (!amountResult.ok) {
    return res.status(400).json({ success: false, error: amountResult.error });
  }

  if (!msisdnResult.ok) {
    return res.status(400).json({ success: false, error: msisdnResult.error });
  }

  if (!hasMomoCredentials("remittance")) {
    return res.json({
      success: true,
      mode: "demo",
      reference: req.body.reference || `REM-${Date.now()}`,
      message: "Remittance accepted in demo mode.",
    });
  }

  try {
    const config = momoProductConfig("remittance");
    const externalId = String(req.body.reference || `REM-${Date.now()}`)
      .replace(/[^\w.-]/g, "")
      .slice(0, 50);

    const { referenceId } = await callMomoTransaction(
      "remittance",
      "transfer",
      {
        amount: amountResult.value,
        currency: config.currency,
        externalId,
        payee: {
          partyIdType: "MSISDN",
          partyId: msisdnResult.value,
        },
        payerMessage: "MoMo Travel remittance",
        payeeNote: sanitizeNote(req.body.note, "MoMo Travel remittance"),
      }
    );

    return res.status(202).json({
      success: true,
      status: "PENDING",
      mode: "momo-sandbox",
      product: "remittance",
      reference: referenceId,
      amount: amountResult.value,
      currency: config.currency,
      message: "Remittance accepted by MTN MoMo sandbox.",
    });
  } catch (error) {
    console.error(
      "MoMo remittance failed:",
      error.response?.status,
      error.response?.data || error.message
    );

    const upstream = publicMomoError(error);
    return res.status(upstream.status).json({
      success: false,
      error: "MoMo remittance failed.",
      details: upstream.momo,
    });
  }
});

// ------------------------------------------------------------
// MoMo config / provisioning / status
// ------------------------------------------------------------
app.get("/api/momo/config", (req, res) => {
  const products = Object.fromEntries(
    MOMO_PRODUCTS.map((product) => {
      const config = momoProductConfig(product);

      return [
        product,
        {
          configured: hasMomoCredentials(product),
          subscriptionKey: mask(config.subscriptionKey),
          apiUser: mask(config.apiUser),
          apiKey: mask(config.apiKey),
        },
      ];
    })
  );

  return res.json({
    baseUrl: MOMO_BASE_URL,
    targetEnvironment: process.env.MOMO_TARGET_ENVIRONMENT || "sandbox",
    currency: process.env.MOMO_CURRENCY || "EUR",
    callbackUrl: process.env.MOMO_CALLBACK_URL || null,
    products,
  });
});

// NOTE: Keep this endpoint for your existing momo-settings page, but do not
// expose it publicly in production without authentication/authorization.
app.post("/api/momo/config", (req, res) => {
  try {
    writeEnvConfig(req.body || {});

    return res.json({
      success: true,
      message:
        "MoMo configuration saved. Restart the server after changing environment settings.",
      config: {
        baseUrl: process.env.MOMO_BASE_URL || MOMO_BASE_URL,
        targetEnvironment:
          process.env.MOMO_TARGET_ENVIRONMENT || "sandbox",
        currency: process.env.MOMO_CURRENCY || "EUR",
      },
    });
  } catch (error) {
    console.error("Could not save MoMo configuration:", error);
    return res.status(500).json({
      success: false,
      error: "Could not save MoMo configuration.",
    });
  }
});

app.post("/api/momo/provision-user", async (req, res) => {
  const subscriptionKey =
    String(
      req.body.subscriptionKey ||
        process.env.MOMO_COLLECTION_SUBSCRIPTION_KEY ||
        process.env.MOMO_SUBSCRIPTION_KEY ||
        ""
    ).trim();

  if (!subscriptionKey) {
    return res.status(400).json({
      success: false,
      error: "A sandbox subscription key is required.",
    });
  }

  const apiUserId = String(req.body.apiUserId || randomUUID()).trim();
  const providerCallbackHost = String(
    req.body.providerCallbackHost || ""
  ).trim();

  if (!providerCallbackHost) {
    return res.status(400).json({
      success: false,
      error:
        "providerCallbackHost is required by MTN sandbox provisioning. Provide the callback host registered for your sandbox use case.",
    });
  }

  try {
    await axios.post(
      `${MOMO_BASE_URL}/v1_0/apiuser`,
      { providerCallbackHost },
      {
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          "X-Reference-Id": apiUserId,
        },
        timeout: 15000,
        validateStatus: () => true,
      }
    ).then((response) => {
      if (response.status < 200 || response.status >= 300) {
        const error = new Error(
          `Sandbox API user creation failed with HTTP ${response.status}`
        );
        error.response = response;
        throw error;
      }
    });

    const keyResponse = await axios.post(
      `${MOMO_BASE_URL}/v1_0/apiuser/${encodeURIComponent(apiUserId)}/apikey`,
      null,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": subscriptionKey,
        },
        timeout: 15000,
        validateStatus: () => true,
      }
    );

    if (
      keyResponse.status < 200 ||
      keyResponse.status >= 300 ||
      !keyResponse.data?.apiKey
    ) {
      const error = new Error(
        `Sandbox API key creation failed with HTTP ${keyResponse.status}`
      );
      error.response = keyResponse;
      throw error;
    }

    return res.status(201).json({
      success: true,
      apiUserId,
      apiKey: keyResponse.data.apiKey,
      providerCallbackHost,
      message:
        "Sandbox API user and API key created. Save the API user ID and API key in your .env file.",
    });
  } catch (error) {
    console.error(
      "MoMo sandbox user provisioning failed:",
      error.response?.status,
      error.response?.data || error.message
    );

    const upstream = publicMomoError(error);
    return res.status(upstream.status).json({
      success: false,
      error: "MoMo sandbox user provisioning failed.",
      details: upstream.momo,
    });
  }
});

app.get("/api/momo/status", async (req, res) => {
  const results = {};

  for (const product of MOMO_PRODUCTS) {
    if (!hasMomoCredentials(product)) {
      results[product] = {
        configured: false,
        status: "not_configured",
        missing: getMissingMomoFields(product),
      };
      continue;
    }

    try {
      await getMomoAccessToken(product);
      results[product] = {
        configured: true,
        status: "ok",
      };
    } catch (error) {
      console.error(
        `MoMo ${product} authentication failed:`,
        error.response?.status,
        error.response?.data || error.message
      );

      results[product] = {
        configured: true,
        status: "error",
        httpStatus: error.response?.status || null,
        details: error.response?.data || error.message,
      };
    }
  }

  const anyError = MOMO_PRODUCTS.some(
    (product) => results[product].status === "error"
  );

  return res.status(anyError ? 502 : 200).json({
    success: !anyError,
    checkedAt: new Date().toISOString(),
    baseUrl: MOMO_BASE_URL,
    targetEnvironment: process.env.MOMO_TARGET_ENVIRONMENT || "sandbox",
    currency: process.env.MOMO_CURRENCY || "EUR",
    products: results,
  });
});

function getMissingMomoFields(product) {
  const config = momoProductConfig(product);
  const missing = [];

  if (!config.subscriptionKey) missing.push("subscriptionKey");
  if (!config.apiUser) missing.push("apiUserId");
  if (!config.apiKey) missing.push("apiKey");

  return missing;
}

// ------------------------------------------------------------
// MTN callback endpoint
// ------------------------------------------------------------
// MoMo can deliver asynchronous transaction results here. We return 200
// immediately so MTN does not keep retrying while the application processes
// the event. For now we log the payload; persistence can be added later.
function handleMomoCallback(req, res) {
  console.log("\n========== MTN MOMO CALLBACK ==========");
  console.log("Method:", req.method);
  console.log("Headers:", {
    "x-reference-id": req.headers["x-reference-id"],
    "x-target-environment": req.headers["x-target-environment"],
    "content-type": req.headers["content-type"],
  });
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("=======================================\n");

  return res.status(200).json({ received: true });
}

app.post("/api/momo/callback", handleMomoCallback);
app.put("/api/momo/callback", handleMomoCallback);

// ------------------------------------------------------------
// API 404 + global error handler
// ------------------------------------------------------------
app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    error: "API route not found.",
    method: req.method,
    path: req.originalUrl,
    hint: "Open GET /api/routes to see the routes registered by this server.",
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  if (res.headersSent) return next(error);

  return res.status(500).json({
    success: false,
    error: "Internal server error.",
  });
});

// ------------------------------------------------------------
// Start server
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log("====================================================");
  console.log(`MoMo Travel app running at http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Routes: http://localhost:${PORT}/api/routes`);
  console.log(`MoMo status: http://localhost:${PORT}/api/momo/status`);
  console.log(`MoMo base URL: ${MOMO_BASE_URL}`);
  console.log("====================================================");
});
