/* ==========================================================
   MTN MoMo Travel — JourneyPass MVP Mock Listings Data

   PURPOSE:
   - Large mock dataset for the JourneyPass MVP
   - Supports many destinations
   - 15+ options per category for every destination
   - Easy to expand with more cities
   - Designed to be replaced later with real APIs/database

   CATEGORIES:
   - stays
   - transport
   - activities
   - food

   EVERY LISTING:
   id
   name
   category
   location
   price
   priceUnit
   momoAccepted
   rating
   icon
   description
   ========================================================== */


/* ==========================================================
   DESTINATION CONFIGURATION
   ========================================================== */

const DESTINATION_CONFIG = {

  "cape town": {
    displayName: "Cape Town",
    country: "South Africa",
    currency: "ZAR",
    aliases: ["capetown", "cape", "ct"],
    areas: [
      "City Centre",
      "Sea Point",
      "Green Point",
      "Camps Bay",
      "Gardens",
      "Woodstock",
      "Bo-Kaap",
      "Constantia",
      "Hout Bay",
      "Waterfront",
      "Claremont",
      "Observatory",
      "Century City",
      "Blouberg",
      "Newlands"
    ],
    priceMultiplier: 1.00,

    attractions: [
      "Table Mountain",
      "Robben Island",
      "V&A Waterfront",
      "Bo-Kaap",
      "Camps Bay",
      "Kirstenbosch",
      "Cape Point",
      "Boulders Beach",
      "Signal Hill",
      "Constantia",
      "District Six",
      "Lion's Head",
      "Green Point Park",
      "Woodstock",
      "Hout Bay"
    ],

    foods: [
      "Cape Malay Cuisine",
      "Seafood",
      "Braai",
      "Gourmet Burgers",
      "African Cuisine",
      "Italian",
      "Indian",
      "Pizza",
      "Sushi",
      "Breakfast & Brunch",
      "Street Food",
      "Vegan Food",
      "Fine Dining",
      "Coffee & Pastries",
      "Local Desserts"
    ]
  },


  "johannesburg": {
    displayName: "Johannesburg",
    country: "South Africa",
    currency: "ZAR",
    aliases: ["joburg", "jhb", "jozi"],
    areas: [
      "Sandton",
      "Rosebank",
      "Midrand",
      "Melrose",
      "Fourways",
      "Randburg",
      "Soweto",
      "Braamfontein",
      "Maboneng",
      "Newtown",
      "Parkhurst",
      "Rivonia",
      "Bryanston",
      "Rosebank CBD",
      "City Centre"
    ],
    priceMultiplier: 0.95,

    attractions: [
      "Apartheid Museum",
      "Soweto",
      "Constitution Hill",
      "Gold Reef City",
      "Maboneng Precinct",
      "Montecasino",
      "Nelson Mandela Square",
      "Cradle of Humankind",
      "Sandton City",
      "Lion Park",
      "Vilakazi Street",
      "Braamfontein",
      "Rosebank",
      "Newtown",
      "Walter Sisulu Botanical Gardens"
    ],

    foods: [
      "South African Braai",
      "African Cuisine",
      "Indian Cuisine",
      "Steakhouse",
      "Burgers",
      "Pizza",
      "Sushi",
      "Ethiopian Food",
      "Thai Food",
      "Italian",
      "Fine Dining",
      "Street Food",
      "Breakfast & Brunch",
      "Vegan Food",
      "Coffee Shops"
    ]
  },


  "durban": {
    displayName: "Durban",
    country: "South Africa",
    currency: "ZAR",
    aliases: ["dbn", "ethekwini"],
    areas: [
      "Umhlanga",
      "North Beach",
      "South Beach",
      "Morningside",
      "Berea",
      "Glenwood",
      "Florida Road",
      "Point Waterfront",
      "Ballito",
      "La Lucia",
      "Westville",
      "Durban CBD",
      "Gateway",
      "Umdloti",
      "Bluff"
    ],
    priceMultiplier: 0.88,

    attractions: [
      "uShaka Marine World",
      "Moses Mabhida Stadium",
      "Golden Mile",
      "Umhlanga Lighthouse",
      "Durban Botanic Gardens",
      "Florida Road",
      "Valley of a Thousand Hills",
      "KwaMuhle Museum",
      "Umgeni River Bird Park",
      "Suncoast",
      "North Beach",
      "Wilson's Wharf",
      "Mitchell Park",
      "Golden Mile Promenade",
      "Umhlanga Beach"
    ],

    foods: [
      "Bunny Chow",
      "Indian Cuisine",
      "Seafood",
      "South African Braai",
      "Curry",
      "Pizza",
      "Burgers",
      "Sushi",
      "Fine Dining",
      "Street Food",
      "African Cuisine",
      "Breakfast & Brunch",
      "Vegan Food",
      "Coffee Shops",
      "Local Desserts"
    ]
  },


  "pretoria": {
    displayName: "Pretoria",
    country: "South Africa",
    currency: "ZAR",
    aliases: ["pta", "tshwane"],
    areas: [
      "Arcadia",
      "Hatfield",
      "Menlyn",
      "Brooklyn",
      "Centurion",
      "Waterkloof",
      "Sunnyside",
      "Pretoria CBD",
      "Lynnwood",
      "Groenkloof",
      "Silver Lakes",
      "Wonderboom",
      "Montana",
      "Faerie Glen",
      "Newlands"
    ],
    priceMultiplier: 0.82,

    attractions: [
      "Union Buildings",
      "Voortrekker Monument",
      "Freedom Park",
      "National Zoological Gardens",
      "Pretoria National Botanical Garden",
      "Church Square",
      "Rietvlei Nature Reserve",
      "Fort Klapperkop",
      "Menlyn Maine",
      "Loftus Versfeld",
      "Melrose House",
      "Wonderboom Nature Reserve",
      "Hazelwood",
      "Austin Roberts Bird Sanctuary",
      "Groenkloof Nature Reserve"
    ],

    foods: [
      "South African Cuisine",
      "Braai",
      "African Cuisine",
      "Indian Cuisine",
      "Steakhouse",
      "Pizza",
      "Burgers",
      "Sushi",
      "Italian",
      "Fine Dining",
      "Breakfast & Brunch",
      "Street Food",
      "Vegan Food",
      "Coffee Shops",
      "Desserts"
    ]
  },


  "gqeberha": {
    displayName: "Gqeberha",
    country: "South Africa",
    currency: "ZAR",
    aliases: ["port elizabeth", "pe"],
    areas: [
      "Summerstrand",
      "Humewood",
      "Walmer",
      "Richmond Hill",
      "Central",
      "Newton Park",
      "Mill Park",
      "Lorraine",
      "Sardinia Bay",
      "Bluewater Bay",
      "Beachview",
      "Kings Beach",
      "Brookes Hill",
      "Sunridge Park",
      "Mount Pleasant"
    ],
    priceMultiplier: 0.78,

    attractions: [
      "Addo Elephant National Park",
      "Boardwalk",
      "Kings Beach",
      "Donkin Reserve",
      "Bayworld",
      "Route 67",
      "Sardinia Bay",
      "SAMREC",
      "Cape Recife Nature Reserve",
      "Seaview Lion Park",
      "Red Location Museum",
      "Nelson Mandela Bay Stadium",
      "Humewood Beach",
      "St George's Park",
      "Van Stadens Wildflower Reserve"
    ],

    foods: [
      "Seafood",
      "South African Cuisine",
      "Braai",
      "African Cuisine",
      "Indian",
      "Pizza",
      "Burgers",
      "Sushi",
      "Italian",
      "Breakfast",
      "Street Food",
      "Fine Dining",
      "Vegan",
      "Coffee",
      "Desserts"
    ]
  },


  "bloemfontein": {
    displayName: "Bloemfontein",
    country: "South Africa",
    currency: "ZAR",
    aliases: ["bloem"],
    areas: [
      "Westdene",
      "Willows",
      "Universitas",
      "Langenhoven Park",
      "Dan Pienaar",
      "Woodlands",
      "Fleurdal",
      "Heuwelsig",
      "Bayswater",
      "Brandwag",
      "CBD",
      "Naval Hill",
      "Fichardt Park",
      "Park West",
      "Waverley"
    ],
    priceMultiplier: 0.70,

    attractions: [
      "Naval Hill",
      "Oliewenhuis Art Museum",
      "Free State National Botanical Garden",
      "Anglo-Boer War Museum",
      "Loch Logan Waterfront",
      "Bagamoya Wildlife Estate",
      "Franklin Game Reserve",
      "Fourth Raadsaal",
      "Freshford House Museum",
      "Kings Park",
      "Windmill Casino",
      "Botanical Gardens",
      "National Museum",
      "Hamilton Park",
      "Langenhoven Park"
    ],

    foods: [
      "South African Cuisine",
      "Braai",
      "African Cuisine",
      "Steakhouse",
      "Indian",
      "Pizza",
      "Burgers",
      "Sushi",
      "Italian",
      "Breakfast",
      "Street Food",
      "Fine Dining",
      "Vegan",
      "Coffee",
      "Desserts"
    ]
  },


  /* ========================================================
     AFRICA
     ======================================================== */

  "nairobi": {
    displayName: "Nairobi",
    country: "Kenya",
    currency: "KES",
    aliases: ["nbo"],
    areas: [
      "Westlands",
      "Kilimani",
      "Karen",
      "Kileleshwa",
      "CBD",
      "Parklands",
      "Lavington",
      "Runda",
      "Gigiri",
      "Kasarani",
      "Upper Hill",
      "South C",
      "Hurlingham",
      "Lang'ata",
      "Roysambu"
    ],
    priceMultiplier: 1.05,

    attractions: [
      "Nairobi National Park",
      "Giraffe Centre",
      "Karen Blixen Museum",
      "Nairobi National Museum",
      "David Sheldrick Wildlife Trust",
      "Karura Forest",
      "Bomas of Kenya",
      "Nairobi Arboretum",
      "Uhuru Park",
      "Village Market",
      "Maasai Market",
      "Kazuri Beads",
      "Railways Museum",
      "Ngong Hills",
      "The Hub Karen"
    ],

    foods: [
      "Kenyan Cuisine",
      "Nyama Choma",
      "Ugali & Beef",
      "African Cuisine",
      "Indian",
      "Ethiopian",
      "Italian",
      "Pizza",
      "Burgers",
      "Sushi",
      "Fine Dining",
      "Street Food",
      "Vegan",
      "Breakfast",
      "Coffee"
    ]
  },


  "kampala": {
    displayName: "Kampala",
    country: "Uganda",
    currency: "UGX",
    aliases: ["kmla"],
    areas: [
      "Kololo",
      "Ntinda",
      "Bugolobi",
      "Muyenga",
      "Kisementi",
      "Nakasero",
      "Makindye",
      "Naguru",
      "Kabalagala",
      "Central Kampala",
      "Bukoto",
      "Lubowa",
      "Mengo",
      "Kansanga",
      "Muyenga"
    ],
    priceMultiplier: 0.72,

    attractions: [
      "Uganda Museum",
      "Kasubi Tombs",
      "Gaddafi National Mosque",
      "Bahá'í Temple",
      "Ndere Cultural Centre",
      "Lake Victoria",
      "Mengo Palace",
      "Owino Market",
      "Uganda National Mosque",
      "Craft Village",
      "Rubaga Cathedral",
      "Namugongo Shrine",
      "Kampala City Tour",
      "Uganda Wildlife Education Centre",
      "Mabamba Swamp"
    ],

    foods: [
      "Ugandan Cuisine",
      "Rolex",
      "Matoke",
      "African Cuisine",
      "Indian",
      "Ethiopian",
      "Pizza",
      "Burgers",
      "Chicken",
      "Fish",
      "Fine Dining",
      "Street Food",
      "Vegan",
      "Breakfast",
      "Coffee"
    ]
  },


  "accra": {
    displayName: "Accra",
    country: "Ghana",
    currency: "GHS",
    aliases: ["akr"],
    areas: [
      "Osu",
      "Airport Residential",
      "East Legon",
      "Labone",
      "Cantonments",
      "Dzorwulu",
      "Adabraka",
      "Spintex",
      "Ridge",
      "Roman Ridge",
      "North Ridge",
      "Dansoman",
      "Teshie",
      "Labadi",
      "Kokomlemle"
    ],
    priceMultiplier: 0.90,

    attractions: [
      "Kwame Nkrumah Memorial Park",
      "Independence Square",
      "Labadi Beach",
      "Jamestown",
      "Makola Market",
      "National Museum of Ghana",
      "W.E.B. Du Bois Centre",
      "Osu Castle",
      "Aburi Botanical Gardens",
      "Legon Botanical Gardens",
      "Arts Centre",
      "Accra Mall",
      "Bojo Beach",
      "Oxford Street",
      "Black Star Square"
    ],

    foods: [
      "Ghanaian Cuisine",
      "Jollof Rice",
      "Waakye",
      "Banku & Tilapia",
      "African Cuisine",
      "Indian",
      "Chinese",
      "Pizza",
      "Burgers",
      "Seafood",
      "Fine Dining",
      "Street Food",
      "Vegan",
      "Breakfast",
      "Coffee"
    ]
  },


  "lagos": {
    displayName: "Lagos",
    country: "Nigeria",
    currency: "NGN",
    aliases: ["los"],
    areas: [
      "Victoria Island",
      "Lekki",
      "Ikoyi",
      "Ikeja",
      "Yaba",
      "Surulere",
      "Lagos Island",
      "Ajah",
      "Maryland",
      "Gbagada",
      "Oniru",
      "Banana Island",
      "Ikate",
      "Chevron",
      "Festac"
    ],
    priceMultiplier: 1.00,

    attractions: [
      "Lekki Conservation Centre",
      "Nike Art Gallery",
      "National Museum Lagos",
      "Tarkwa Bay",
      "Landmark Beach",
      "Freedom Park",
      "Nike Art Centre",
      "Lagos Island",
      "Third Mainland Bridge",
      "New Afrika Shrine",
      "Terra Kulture",
      "Elegushi Beach",
      "Lagos National Stadium",
      "Lekki Arts & Crafts Market",
      "Victoria Island"
    ],

    foods: [
      "Nigerian Cuisine",
      "Jollof Rice",
      "Suya",
      "Pepper Soup",
      "African Cuisine",
      "Seafood",
      "Chinese",
      "Indian",
      "Pizza",
      "Burgers",
      "Sushi",
      "Fine Dining",
      "Street Food",
      "Vegan",
      "Breakfast"
    ]
  },


  "lusaka": {
    displayName: "Lusaka",
    country: "Zambia",
    currency: "ZMW",
    aliases: ["lus"],
    areas: [
      "Kabulonga",
      "Kalingalinga",
      "Woodlands",
      "Longacres",
      "Roma",
      "Ibex Hill",
      "Chalala",
      "Makeni",
      "Mass Media",
      "Rhodes Park",
      "Olympia",
      "Chelstone",
      "Avondale",
      "New Kasama",
      "Lusaka CBD"
    ],
    priceMultiplier: 0.76,

    attractions: [
      "Lusaka National Museum",
      "Lusaka National Park",
      "Munda Wanga",
      "Kabwata Cultural Village",
      "Kalimba Reptile Park",
      "East Park Mall",
      "Arcades Shopping Mall",
      "Freedom Statue",
      "Chaminuka Game Reserve",
      "Lilayi Elephant Nursery",
      "Lusaka City Market",
      "Namwane Art Gallery",
      "Parays Game Ranch",
      "Woodlands Stadium",
      "Levy Junction"
    ],

    foods: [
      "Zambian Cuisine",
      "Nshima",
      "Braai",
      "African Cuisine",
      "Indian",
      "Chinese",
      "Italian",
      "Pizza",
      "Burgers",
      "Chicken",
      "Steakhouse",
      "Fine Dining",
      "Street Food",
      "Breakfast",
      "Coffee"
    ]
  },


  "harare": {
    displayName: "Harare",
    country: "Zimbabwe",
    currency: "USD",
    aliases: ["hre"],
    areas: [
      "Avondale",
      "Borrowdale",
      "Eastlea",
      "Mount Pleasant",
      "Milton Park",
      "Newlands",
      "Highlands",
      "Greendale",
      "Samora Machel",
      "Belgravia",
      "CBD",
      "Mabelreign",
      "Gunhill",
      "Vainona",
      "Msasa"
    ],
    priceMultiplier: 0.78,

    attractions: [
      "Harare Gardens",
      "National Heroes Acre",
      "Chapungu Sculpture Park",
      "Mukuvisi Woodlands",
      "National Gallery of Zimbabwe",
      "Balancing Rocks",
      "Lion and Cheetah Park",
      "Domboshawa",
      "Avondale Flea Market",
      "Eastgate Mall",
      "Sam Levy's Village",
      "Epworth Balancing Rocks",
      "Zimbabwe Museum",
      "Haka Game Park",
      "Borrowdale Brooke"
    ],

    foods: [
      "Zimbabwean Cuisine",
      "Sadza",
      "Braai",
      "African Cuisine",
      "Indian",
      "Chinese",
      "Italian",
      "Pizza",
      "Burgers",
      "Steakhouse",
      "Seafood",
      "Fine Dining",
      "Street Food",
      "Breakfast",
      "Coffee"
    ]
  },


  "gaborone": {
    displayName: "Gaborone",
    country: "Botswana",
    currency: "BWP",
    aliases: ["gabs"],
    areas: [
      "CBD",
      "Broadhurst",
      "Phakalane",
      "Kgale View",
      "Extension 9",
      "Extension 11",
      "Block 3",
      "Block 6",
      "Village",
      "Tlokweng",
      "Gaborone West",
      "Block 8",
      "Mogoditshane",
      "Game City",
      "Main Mall"
    ],
    priceMultiplier: 0.85,

    attractions: [
      "Gaborone Game Reserve",
      "Kgale Hill",
      "Three Dikgosi Monument",
      "National Museum",
      "Mokolodi Nature Reserve",
      "Botswana Craft",
      "Main Mall",
      "River Walk",
      "National Stadium",
      "Phakalane Golf Estate",
      "Thapong Visual Arts Centre",
      "ISKCON Temple",
      "Lion Park",
      "Kgale Hill Game Reserve",
      "Gaborone Dam"
    ],

    foods: [
      "Botswana Cuisine",
      "Seswaa",
      "Braai",
      "African Cuisine",
      "Steakhouse",
      "Indian",
      "Chinese",
      "Pizza",
      "Burgers",
      "Chicken",
      "Seafood",
      "Fine Dining",
      "Street Food",
      "Breakfast",
      "Coffee"
    ]
  },


  "maputo": {
    displayName: "Maputo",
    country: "Mozambique",
    currency: "MZN",
    aliases: ["mpm"],
    areas: [
      "Polana",
      "Sommerschield",
      "Baixa",
      "Costa do Sol",
      "Coop",
      "Malhangalene",
      "Central Maputo",
      "Alto Maé",
      "Maxaquene",
      "Triunfo",
      "Marracuene",
      "Matola",
      "Jardim",
      "Santos",
      "Kampfumo"
    ],
    priceMultiplier: 0.86,

    attractions: [
      "Maputo Central Market",
      "Maputo Fortress",
      "FEIMA",
      "Maputo Elephant Reserve",
      "Maputo Railway Station",
      "Cathedral of Maputo",
      "Independence Square",
      "Natural History Museum",
      "Costa do Sol",
      "Tunduru Botanical Gardens",
      "Maputo Bay",
      "Fish Market",
      "National Art Museum",
      "Maputo Shopping Centre",
      "Avenida Marginal"
    ],

    foods: [
      "Mozambican Cuisine",
      "Piri Piri Chicken",
      "Seafood",
      "Prawns",
      "Portuguese Cuisine",
      "African Cuisine",
      "Indian",
      "Italian",
      "Pizza",
      "Burgers",
      "Sushi",
      "Fine Dining",
      "Street Food",
      "Breakfast",
      "Coffee"
    ]
  },


  /* ========================================================
     INTERNATIONAL
     ======================================================== */

  "dubai": {
    displayName: "Dubai",
    country: "United Arab Emirates",
    currency: "AED",
    aliases: ["dxb"],
    areas: [
      "Downtown Dubai",
      "Dubai Marina",
      "Jumeirah",
      "Deira",
      "Bur Dubai",
      "Business Bay",
      "Palm Jumeirah",
      "JBR",
      "Al Barsha",
      "DIFC",
      "Al Quoz",
      "Dubai Creek",
      "Jumeirah Beach",
      "Internet City",
      "Media City"
    ],
    priceMultiplier: 3.00,

    attractions: [
      "Burj Khalifa",
      "Dubai Mall",
      "Dubai Marina",
      "Palm Jumeirah",
      "Dubai Frame",
      "Museum of the Future",
      "Desert Safari",
      "Dubai Aquarium",
      "Jumeirah Beach",
      "Burj Al Arab",
      "Global Village",
      "Dubai Creek",
      "Gold Souk",
      "Miracle Garden",
      "Ain Dubai"
    ],

    foods: [
      "Emirati Cuisine",
      "Arabic Cuisine",
      "Indian",
      "Lebanese",
      "Turkish",
      "Italian",
      "Japanese",
      "Chinese",
      "Seafood",
      "Steakhouse",
      "Burgers",
      "Pizza",
      "Fine Dining",
      "Street Food",
      "Breakfast & Brunch"
    ]
  },


  "london": {
    displayName: "London",
    country: "United Kingdom",
    currency: "GBP",
    aliases: ["ldn"],
    areas: [
      "Westminster",
      "Soho",
      "Kensington",
      "Chelsea",
      "Camden",
      "Shoreditch",
      "Mayfair",
      "Paddington",
      "Greenwich",
      "South Bank",
      "Canary Wharf",
      "Notting Hill",
      "Brixton",
      "Islington",
      "King's Cross"
    ],
    priceMultiplier: 4.50,

    attractions: [
      "London Eye",
      "Tower of London",
      "Buckingham Palace",
      "Big Ben",
      "Westminster Abbey",
      "British Museum",
      "Tower Bridge",
      "Hyde Park",
      "St Paul's Cathedral",
      "Natural History Museum",
      "Madame Tussauds",
      "Kensington Palace",
      "Greenwich",
      "Tate Modern",
      "Wembley Stadium"
    ],

    foods: [
      "British Cuisine",
      "Fish & Chips",
      "Indian",
      "Italian",
      "Chinese",
      "Thai",
      "Japanese",
      "Burgers",
      "Steakhouse",
      "Seafood",
      "Pizza",
      "Middle Eastern",
      "Fine Dining",
      "Street Food",
      "Breakfast & Brunch"
    ]
  },


  "paris": {
    displayName: "Paris",
    country: "France",
    currency: "EUR",
    aliases: ["paris france"],
    areas: [
      "Eiffel Tower",
      "Le Marais",
      "Latin Quarter",
      "Montmartre",
      "Champs-Élysées",
      "Saint-Germain",
      "Bastille",
      "Montparnasse",
      "Belleville",
      "Opera",
      "Louvre",
      "Pigalle",
      "Invalides",
      "Canal Saint-Martin",
      "Île de la Cité"
    ],
    priceMultiplier: 3.80,

    attractions: [
      "Eiffel Tower",
      "Louvre Museum",
      "Notre-Dame",
      "Arc de Triomphe",
      "Sacré-Cœur",
      "Champs-Élysées",
      "Seine River Cruise",
      "Musée d'Orsay",
      "Palace of Versailles",
      "Luxembourg Gardens",
      "Montmartre",
      "Centre Pompidou",
      "Sainte-Chapelle",
      "Moulin Rouge",
      "Tuileries Garden"
    ],

    foods: [
      "French Cuisine",
      "Croissants",
      "Crêpes",
      "French Bistro",
      "Italian",
      "Japanese",
      "Moroccan",
      "Indian",
      "Steakhouse",
      "Seafood",
      "Pizza",
      "Burgers",
      "Fine Dining",
      "Street Food",
      "Pastry & Coffee"
    ]
  },


  "new york": {
    displayName: "New York",
    country: "United States",
    currency: "USD",
    aliases: ["nyc", "new york city"],
    areas: [
      "Manhattan",
      "Brooklyn",
      "Queens",
      "Times Square",
      "SoHo",
      "Chelsea",
      "Harlem",
      "Upper East Side",
      "Upper West Side",
      "Midtown",
      "Lower East Side",
      "Williamsburg",
      "Financial District",
      "Greenwich Village",
      "Long Island City"
    ],
    priceMultiplier: 5.00,

    attractions: [
      "Statue of Liberty",
      "Times Square",
      "Central Park",
      "Empire State Building",
      "Brooklyn Bridge",
      "9/11 Memorial",
      "Top of the Rock",
      "Metropolitan Museum of Art",
      "Broadway",
      "One World Observatory",
      "Fifth Avenue",
      "Rockefeller Center",
      "High Line",
      "Grand Central Terminal",
      "Yankee Stadium"
    ],

    foods: [
      "New York Pizza",
      "Bagels",
      "American Cuisine",
      "Burgers",
      "Steakhouse",
      "Italian",
      "Chinese",
      "Japanese",
      "Korean",
      "Mexican",
      "Indian",
      "Seafood",
      "Fine Dining",
      "Street Food",
      "Breakfast & Brunch"
    ]
  },


  "istanbul": {
    displayName: "Istanbul",
    country: "Türkiye",
    currency: "TRY",
    aliases: ["istanbul turkey"],
    areas: [
      "Sultanahmet",
      "Taksim",
      "Beyoğlu",
      "Kadıköy",
      "Beşiktaş",
      "Fatih",
      "Şişli",
      "Ortaköy",
      "Karaköy",
      "Galata",
      "Üsküdar",
      "Eminönü",
      "Nişantaşı",
      "Bakırköy",
      "Bebek"
    ],
    priceMultiplier: 1.55,

    attractions: [
      "Hagia Sophia",
      "Blue Mosque",
      "Grand Bazaar",
      "Topkapi Palace",
      "Bosphorus Cruise",
      "Galata Tower",
      "Dolmabahçe Palace",
      "Basilica Cistern",
      "Spice Bazaar",
      "Ortaköy Mosque",
      "Maiden's Tower",
      "Süleymaniye Mosque",
      "Princes' Islands",
      "Istanbul Archaeology Museums",
      "Taksim Square"
    ],

    foods: [
      "Turkish Cuisine",
      "Kebab",
      "Baklava",
      "Meze",
      "Turkish Breakfast",
      "Seafood",
      "Pide",
      "Lahmacun",
      "Italian",
      "Indian",
      "Japanese",
      "Burgers",
      "Fine Dining",
      "Street Food",
      "Coffee & Desserts"
    ]
  },


  "mumbai": {
    displayName: "Mumbai",
    country: "India",
    currency: "INR",
    aliases: ["bombay"],
    areas: [
      "Colaba",
      "Bandra",
      "Juhu",
      "Andheri",
      "Worli",
      "Powai",
      "Lower Parel",
      "Fort",
      "Marine Drive",
      "Malad",
      "Goregaon",
      "Dadar",
      "Churchgate",
      "Cuffe Parade",
      "Santacruz"
    ],
    priceMultiplier: 0.95,

    attractions: [
      "Gateway of India",
      "Marine Drive",
      "Elephanta Caves",
      "Chhatrapati Shivaji Terminus",
      "Colaba Causeway",
      "Sanjay Gandhi National Park",
      "Juhu Beach",
      "Haji Ali Dargah",
      "Bandra-Worli Sea Link",
      "Siddhivinayak Temple",
      "Crawford Market",
      "Bollywood Tour",
      "Nehru Planetarium",
      "Prince of Wales Museum",
      "Bandra Fort"
    ],

    foods: [
      "Indian Cuisine",
      "Vada Pav",
      "Pav Bhaji",
      "Biryani",
      "Thali",
      "Street Food",
      "Gujarati Cuisine",
      "South Indian",
      "Chinese",
      "Italian",
      "Japanese",
      "Seafood",
      "Burgers",
      "Fine Dining",
      "Breakfast"
    ]
  },

};


/* ==========================================================
   GENERIC LISTING GENERATORS
   ==========================================================

   Instead of manually writing hundreds of objects, these
   functions create 15 listings for every category.

   This means adding a new city only requires adding its
   configuration above.
   ========================================================== */


/* -------------------------
   Helper functions
   ------------------------- */

function roundPrice(value) {
  return Math.round(value / 5) * 5;
}


function getArea(city, index) {
  return city.areas[index % city.areas.length];
}


function getRating(index) {
  const ratings = [
    4.1,
    4.2,
    4.3,
    4.4,
    4.5,
    4.6,
    4.7,
    4.8
  ];

  return ratings[index % ratings.length];
}


function getMoMoStatus(index) {
  /*
    Mock behaviour.

    Roughly 70% of listings accept MoMo.
    Replace this with real provider data later.
  */

  return index % 10 !== 3 &&
         index % 10 !== 8 &&
         index % 10 !== 9;
}


/* ==========================================================
   STAYS
   ========================================================== */

function generateStays(cityKey, city) {

  const names = [
    "City Centre Hotel",
    "Urban Stay Lodge",
    "Grand Traveller Hotel",
    "Airport View Hotel",
    "Central Park Hotel",
    "Traveller's Rest",
    "Premium City Suites",
    "Comfort Inn",
    "Metro Guest House",
    "City Lights Hotel",
    "Harbour View Hotel",
    "Executive Traveller Suites",
    "Sunrise Lodge",
    "Royal Stay Hotel",
    "JourneyPass Hotel"
  ];

  const descriptions = [
    "Comfortable accommodation in a convenient location for exploring the city.",
    "Affordable rooms with easy access to major attractions and transport.",
    "Modern rooms designed for business and leisure travellers.",
    "Convenient stay with easy access to the airport and city centre.",
    "A comfortable base for travellers exploring the destination.",
    "Budget-friendly accommodation with essential travel facilities.",
    "Premium accommodation with modern rooms and city access.",
    "Reliable accommodation for short and extended stays.",
    "Convenient guest accommodation close to restaurants and attractions.",
    "Modern city accommodation designed for travellers.",
    "Comfortable accommodation with excellent access to local attractions.",
    "Business-friendly suites with additional space and amenities.",
    "Relaxed accommodation suitable for couples and families.",
    "Higher-end accommodation with premium traveller services.",
    "JourneyPass partner-style accommodation for the MVP."
  ];

  return names.map((name, index) => {

    const basePrice = 500 + (index * 135);

    return {
      id: `st-${cityKey.replace(/\s/g, "-")}-${index + 1}`,
      name,
      category: "stays",
      location: getArea(city, index),
      price: roundPrice(basePrice * city.priceMultiplier),
      priceUnit: "per night",
      momoAccepted: getMoMoStatus(index),
      rating: getRating(index),
      icon: "fa-bed",
      description: descriptions[index]
    };
  });
}


/* ==========================================================
   TRANSPORT
   ========================================================== */

function generateTransport(cityKey, city) {

  const transportTypes = [
    {
      name: "Airport Shuttle",
      icon: "fa-shuttle-van",
      basePrice: 120,
      unit: "per trip"
    },
    {
      name: "City Taxi",
      icon: "fa-taxi",
      basePrice: 80,
      unit: "per trip (from)"
    },
    {
      name: "Airport Taxi",
      icon: "fa-taxi",
      basePrice: 180,
      unit: "per trip (from)"
    },
    {
      name: "City Bus",
      icon: "fa-bus",
      basePrice: 30,
      unit: "per trip"
    },
    {
      name: "Express Bus",
      icon: "fa-bus",
      basePrice: 55,
      unit: "per trip"
    },
    {
      name: "Tourist Bus",
      icon: "fa-bus",
      basePrice: 150,
      unit: "per trip"
    },
    {
      name: "Metro / Rail",
      icon: "fa-train",
      basePrice: 40,
      unit: "per trip"
    },
    {
      name: "Airport Train",
      icon: "fa-train",
      basePrice: 120,
      unit: "per trip"
    },
    {
      name: "Ride-Hailing",
      icon: "fa-car",
      basePrice: 70,
      unit: "per trip (from)"
    },
    {
      name: "Car Hire — Economy",
      icon: "fa-car",
      basePrice: 350,
      unit: "per day"
    },
    {
      name: "Car Hire — SUV",
      icon: "fa-car-side",
      basePrice: 650,
      unit: "per day"
    },
    {
      name: "Private Driver",
      icon: "fa-user-tie",
      basePrice: 850,
      unit: "per day"
    },
    {
      name: "Tourist Shuttle",
      icon: "fa-shuttle-van",
      basePrice: 100,
      unit: "per trip"
    },
    {
      name: "Intercity Coach",
      icon: "fa-bus",
      basePrice: 250,
      unit: "per trip"
    },
    {
      name: "Premium Transfer",
      icon: "fa-car",
      basePrice: 500,
      unit: "per trip"
    }
  ];

  return transportTypes.map((transport, index) => {

    const area = getArea(city, index);

    return {
      id: `tr-${cityKey.replace(/\s/g, "-")}-${index + 1}`,
      name: `${city.displayName} ${transport.name}`,
      category: "transport",
      location: area,
      price: roundPrice(
        transport.basePrice * city.priceMultiplier
      ),
      priceUnit: transport.unit,
      momoAccepted: getMoMoStatus(index),
      rating: getRating(index + 1),
      icon: transport.icon,
      description:
        `${transport.name} option serving ${area} and other major areas of ${city.displayName}.`
    };
  });
}


/* ==========================================================
   ACTIVITIES
   ========================================================== */

function generateActivities(cityKey, city) {

  return city.attractions.map((attraction, index) => {

    const prices = [
      80,
      120,
      150,
      180,
      220,
      250,
      280,
      320,
      350,
      400,
      450,
      500,
      550,
      650,
      750
    ];

    const icons = [
      "fa-landmark",
      "fa-camera",
      "fa-person-walking",
      "fa-tree",
      "fa-water",
      "fa-mountain",
      "fa-building",
      "fa-ticket",
      "fa-binoculars",
      "fa-ship",
      "fa-museum",
      "fa-monument",
      "fa-leaf",
      "fa-star",
      "fa-map-location-dot"
    ];

    return {
      id: `ac-${cityKey.replace(/\s/g, "-")}-${index + 1}`,
      name: attraction,
      category: "activities",
      location: getArea(city, index),
      price: roundPrice(
        prices[index] * city.priceMultiplier
      ),
      priceUnit: "per person",
      momoAccepted: getMoMoStatus(index + 2),
      rating: getRating(index + 2),
      icon: icons[index],
      description:
        `Popular ${city.displayName} experience located around ${getArea(city, index)}. Great option for travellers looking to explore the destination.`
    };
  });
}


/* ==========================================================
   FOOD
   ========================================================== */

function generateFood(cityKey, city) {

  return city.foods.map((foodType, index) => {

    const prices = [
      60,
      80,
      100,
      120,
      140,
      160,
      180,
      200,
      220,
      250,
      280,
      320,
      380,
      450,
      550
    ];

    return {
      id: `fd-${cityKey.replace(/\s/g, "-")}-${index + 1}`,
      name: `${foodType} Dining`,
      category: "food",
      location: getArea(city, index),
      price: roundPrice(
        prices[index] * city.priceMultiplier
      ),
      priceUnit: "avg per person",
      momoAccepted: getMoMoStatus(index + 4),
      rating: getRating(index + 3),
      icon: "fa-utensils",
      description:
        `${foodType} dining option available around ${getArea(city, index)} in ${city.displayName}.`
    };
  });
}


/* ==========================================================
   BUILD DESTINATIONS
   ========================================================== */

const DESTINATIONS = {};


/*
   Convert every city configuration into the same structure
   used by the existing Results page.
*/

Object.entries(DESTINATION_CONFIG).forEach(
  ([cityKey, city]) => {

    DESTINATIONS[cityKey] = {

      displayName: city.displayName,

      country: city.country,

      currency: city.currency,

      stays: generateStays(cityKey, city),

      transport: generateTransport(cityKey, city),

      activities: generateActivities(cityKey, city),

      food: generateFood(cityKey, city)

    };

  }
);


/* ==========================================================
   DESTINATION LIST
   ==========================================================

   Useful for:
   - Destination dropdowns
   - Search autocomplete
   - Landing page
   - Popular destination cards
   ========================================================== */

const DESTINATION_LIST = Object.entries(
  DESTINATION_CONFIG
).map(([key, city]) => ({
  key,
  name: city.displayName,
  country: city.country,
  currency: city.currency,
  aliases: city.aliases || []
}));


/* ==========================================================
   FIND DESTINATION
   ==========================================================

   Supports:

   "Cape Town"
   "cape town"
   "CAPE TOWN"
   "cape"
   "Joburg"
   "JHB"
   "NYC"
   "New York City"
   ========================================================== */

function findDestination(query) {

  if (!query) return null;

  const search = query
    .trim()
    .toLowerCase();

  if (!search) return null;


  /* ------------------------------------------
     1. Exact city key
     ------------------------------------------ */

  if (DESTINATIONS[search]) {
    return DESTINATIONS[search];
  }


  /* ------------------------------------------
     2. Exact display name
     ------------------------------------------ */

  const exactName = Object.keys(
    DESTINATION_CONFIG
  ).find(key =>
    DESTINATION_CONFIG[key]
      .displayName
      .toLowerCase() === search
  );

  if (exactName) {
    return DESTINATIONS[exactName];
  }


  /* ------------------------------------------
     3. Search aliases
     ------------------------------------------ */

  const aliasMatch = Object.keys(
    DESTINATION_CONFIG
  ).find(key => {

    const aliases =
      DESTINATION_CONFIG[key].aliases || [];

    return aliases.some(alias =>
      alias.toLowerCase() === search
    );

  });

  if (aliasMatch) {
    return DESTINATIONS[aliasMatch];
  }


  /* ------------------------------------------
     4. Partial city name
     ------------------------------------------ */

  const partial = Object.keys(
    DESTINATION_CONFIG
  ).find(key => {

    const cityName =
      DESTINATION_CONFIG[key]
        .displayName
        .toLowerCase();

    return (
      cityName.includes(search) ||
      search.includes(cityName)
    );

  });

  if (partial) {
    return DESTINATIONS[partial];
  }


  /* ------------------------------------------
     5. Partial alias
     ------------------------------------------ */

  const partialAlias = Object.keys(
    DESTINATION_CONFIG
  ).find(key => {

    const aliases =
      DESTINATION_CONFIG[key].aliases || [];

    return aliases.some(alias =>
      alias.toLowerCase().includes(search) ||
      search.includes(alias.toLowerCase())
    );

  });

  if (partialAlias) {
    return DESTINATIONS[partialAlias];
  }


  return null;
}


/* ==========================================================
   SEARCH DESTINATIONS
   ==========================================================

   Useful for autocomplete.

   Example:

   searchDestinations("cape")

   Returns:
   [
     {
       key: "cape town",
       name: "Cape Town",
       country: "South Africa"
     }
   ]
   ========================================================== */

function searchDestinations(query) {

  if (!query) {
    return DESTINATION_LIST;
  }

  const search = query
    .trim()
    .toLowerCase();

  return DESTINATION_LIST.filter(destination => {

    const nameMatch =
      destination.name
        .toLowerCase()
        .includes(search);

    const countryMatch =
      destination.country
        .toLowerCase()
        .includes(search);

    const aliasMatch =
      destination.aliases.some(alias =>
        alias.toLowerCase().includes(search)
      );

    return (
      nameMatch ||
      countryMatch ||
      aliasMatch
    );

  });
}


/* ==========================================================
   GET CATEGORY
   ==========================================================

   Allows the Results page to request:

   getListings("cape town", "stays")
   getListings("nairobi", "food")
   getListings("dubai", "transport")
   ========================================================== */

function getListings(destinationQuery, category) {

  const destination =
    findDestination(destinationQuery);

  if (!destination) {
    return [];
  }

  if (!destination[category]) {
    return [];
  }

  return destination[category];
}


/* ==========================================================
   GET ALL LISTINGS
   ========================================================== */

function getAllListings(destinationQuery) {

  const destination =
    findDestination(destinationQuery);

  if (!destination) {
    return [];
  }

  return [
    ...destination.stays,
    ...destination.transport,
    ...destination.activities,
    ...destination.food
  ];
}


/* ==========================================================
   FILTER LISTINGS
   ==========================================================

   Optional helper for the Results page.

   Examples:

   filterListings(
     "Cape Town",
     "stays",
     { momoOnly: true }
   );

   filterListings(
     "Nairobi",
     "food",
     { maxPrice: 300 }
   );
   ========================================================== */

function filterListings(
  destinationQuery,
  category,
  options = {}
) {

  let listings =
    getListings(
      destinationQuery,
      category
    );

  if (!listings.length) {
    return [];
  }


  /* MoMo only */

  if (options.momoOnly === true) {

    listings = listings.filter(
      listing => listing.momoAccepted === true
    );

  }


  /* Maximum price */

  if (
    typeof options.maxPrice === "number"
  ) {

    listings = listings.filter(
      listing =>
        listing.price <= options.maxPrice
    );

  }


  /* Minimum rating */

  if (
    typeof options.minRating === "number"
  ) {

    listings = listings.filter(
      listing =>
        listing.rating >= options.minRating
    );

  }


  /* Area */

  if (options.location) {

    listings = listings.filter(
      listing =>
        listing.location
          .toLowerCase()
          .includes(
            options.location.toLowerCase()
          )
    );

  }


  return listings;
}


/* ==========================================================
   DATA VALIDATION
   ==========================================================

   Useful during development.

   Run:

   validateJourneyPassData();

   in the browser console.
   ========================================================== */

function validateJourneyPassData() {

  const results = [];

  Object.entries(DESTINATIONS).forEach(
    ([cityKey, city]) => {

      results.push({
        destination: city.displayName,
        country: city.country,
        stays: city.stays.length,
        transport: city.transport.length,
        activities: city.activities.length,
        food: city.food.length,
        total:
          city.stays.length +
          city.transport.length +
          city.activities.length +
          city.food.length
      });

    }
  );

  console.table(results);

  return results;
}


/* ==========================================================
   OPTIONAL GLOBAL EXPORT
   ==========================================================

   If your project uses normal JavaScript files and needs
   these objects/functions from another script, you can use
   window.JourneyPassData.

   If you're using ES modules, export them instead.
   ========================================================== */

if (typeof window !== "undefined") {

  window.JourneyPassData = {
    DESTINATIONS,
    DESTINATION_LIST,
    findDestination,
    searchDestinations,
    getListings,
    getAllListings,
    filterListings,
    validateJourneyPassData
  };

}


/* ==========================================================
   END OF JOURNEYPASS MOCK DATA
   ========================================================== */