const form = document.getElementById("momoSettingsForm");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

async function loadConfig() {
  const response = await fetch("/api/momo/config");
  const config = await response.json();
  document.getElementById("MOMO_BASE_URL").value = config.baseUrl || "https://sandbox.momodeveloper.mtn.com";
  document.getElementById("MOMO_TARGET_ENVIRONMENT").value = config.targetEnvironment || "sandbox";
  document.getElementById("MOMO_CURRENCY").value = config.currency || "EUR";
  document.getElementById("MOMO_CALLBACK_URL").value = config.callbackUrl || "";
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  const response = await fetch("/api/momo/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    showToast(result.error || "Could not save keys");
    return;
  }
  showToast(result.message || "Keys saved");
});

loadConfig().catch(() => showToast("Could not load current config"));
