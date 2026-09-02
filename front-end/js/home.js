const searchForm = document.getElementById("searchForm");
const destinationInput = document.getElementById("destinationInput");
const categorySelect = document.getElementById("categorySelect");
const popularDestinations = document.getElementById("popularDestinations");

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  const destination = destinationInput.value.trim();
  const category = categorySelect.value;
  if (!destination) return;
  window.location.href = `/explore?destination=${encodeURIComponent(destination)}&category=${encodeURIComponent(category)}`;
});

function destinationCard(destination) {
  const card = document.createElement("button");
  card.className = "destination-card";
  card.type = "button";
  card.style.backgroundImage = `url('${destination.image}')`;
  card.addEventListener("click", () => {
    window.location.href = `/explore?destination=${encodeURIComponent(destination.name)}`;
  });

  card.innerHTML = `
    <div class="card-overlay">
      <span class="location-tag"><i class="fa-solid fa-location-dot"></i> ${destination.country}</span>
      <h3>${destination.name}</h3>
      <p>${destination.categories.map(category => category.label).join(" • ")}</p>
    </div>
  `;

  return card;
}

async function loadPopularDestinations() {
  try {
    const response = await fetch("/api/destinations/popular?limit=8");
    if (!response.ok) throw new Error("Could not load destinations");
    const data = await response.json();

    popularDestinations.innerHTML = "";
    data.destinations.forEach(destination => {
      popularDestinations.appendChild(destinationCard(destination));
    });
  } catch (error) {
    popularDestinations.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Popular destinations are unavailable right now. Search any destination above.</p>
      </div>
    `;
  }
}

loadPopularDestinations();
