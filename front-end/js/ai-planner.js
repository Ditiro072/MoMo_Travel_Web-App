const plannerForm = document.getElementById("plannerForm");
const destinationInput = document.getElementById("destination");
const datesInput = document.getElementById("dates");
const travelersInput = document.getElementById("travelers");
const budgetSlider = document.getElementById("budget-slider");
const budgetDisplay = document.getElementById("budget-display");
const submitBtn = document.getElementById("submit-btn");
const planResults = document.getElementById("planResults");
let latestPlan = null;

function money(value) {
  return `R ${Number(value || 0).toLocaleString("en-ZA")}`;
}

function selectedInterests() {
  return Array.from(document.querySelectorAll(".interest-pill.active")).map(button =>
    button.textContent.trim()
  );
}

function updateBudget() {
  budgetDisplay.textContent = money(budgetSlider.value);
  const progress = ((Number(budgetSlider.value) - Number(budgetSlider.min)) /
    (Number(budgetSlider.max) - Number(budgetSlider.min))) * 100;
  budgetSlider.style.setProperty("--val", `${progress}%`);
}

document.querySelectorAll(".interest-pill").forEach(button => {
  button.addEventListener("click", () => button.classList.toggle("active"));
});

budgetSlider.addEventListener("input", updateBudget);
updateBudget();

plannerForm.addEventListener("submit", async event => {
  event.preventDefault();

  const payload = {
    destination: destinationInput.value.trim(),
    dates: datesInput.value.trim(),
    travelers: travelersInput.value.trim(),
    budget: Number(budgetSlider.value),
    interests: selectedInterests(),
  };

  if (!payload.destination) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating`;
  planResults.innerHTML = `
    <div class="planner-empty">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <h2>Matching your trip</h2>
      <p>Checking stays, transport, activities and dining in ${payload.destination}.</p>
    </div>
  `;

  try {
    const response = await fetch("/api/ai-planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Planner failed");
    renderPlan(data);
  } catch (error) {
    planResults.innerHTML = `
      <div class="planner-empty">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h2>Could not generate plan</h2>
        <p>${error.message}</p>
      </div>
    `;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `Generate Trip Plan <i class="fa-solid fa-arrow-right"></i>`;
  }
});

function renderPlan(data) {
  latestPlan = data;
  const budgetClass = data.withinBudget === false ? "over-budget" : "within-budget";
  const budgetText = data.withinBudget === false
    ? "Above selected budget"
    : "Within selected budget";

  planResults.innerHTML = `
    <div class="plan-summary">
      <div>
        <span class="badge"><i class="fa-solid fa-location-dot"></i> ${data.destination}</span>
        <h2>Suggested Trip Plan</h2>
        <p>${data.note}</p>
      </div>
      <div class="plan-total ${budgetClass}">
        <span>${budgetText}</span>
        <strong>${money(data.estimatedTotal)}</strong>
      </div>
    </div>
    <div class="plan-list"></div>
    <div class="plan-actions">
      <button class="btn-add-trip" id="addGeneratedTripBtn" type="button">
        <i class="fa-solid fa-plus"></i> Add Trip
      </button>
      <a class="btn-primary-dark plan-explore-link" href="/explore?destination=${encodeURIComponent(data.destination)}">
        Explore more options <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  `;

  const list = planResults.querySelector(".plan-list");
  data.plan.forEach(item => {
    const row = document.createElement("article");
    row.className = "plan-item";
    row.innerHTML = `
      <div class="listing-icon"><i class="fa-solid ${item.icon}"></i></div>
      <div>
        <span>${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.location}</p>
      </div>
      <strong>${money(item.price)}</strong>
    `;
    list.appendChild(row);
  });

  document.getElementById("addGeneratedTripBtn").addEventListener("click", () => {
    const trip = saveTripFromItems({
      destination: latestPlan.destination,
      dates: datesInput.value.trim(),
      travelers: travelersInput.value.trim(),
      items: latestPlan.plan,
      source: "ai-planner",
    });
    if (!trip) return;
    showPlannerToast(`Trip to ${trip.destination} added`);
    setTimeout(() => { window.location.href = "/trips"; }, 650);
  });
}

let plannerToastTimer;
function showPlannerToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(plannerToastTimer);
  plannerToastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
