const pathParts = window.location.pathname.split("/");
const code = pathParts[pathParts.length - 1];

const loadingEl = document.getElementById("stats-loading");
const errorEl = document.getElementById("stats-error");
const contentEl = document.getElementById("stats-content");

const shortUrlEl = document.getElementById("short-url");
const codeEl = document.getElementById("code");
const targetUrlEl = document.getElementById("target-url");
const totalClicksEl = document.getElementById("total-clicks");
const lastClickedEl = document.getElementById("last-clicked");
const createdAtEl = document.getElementById("created-at");

async function loadStats() {
  try {
    const res = await fetch(`/api/links/${code}`);
    if (res.status === 404) {
      throw new Error("Link not found");
    }
    if (!res.ok) {
      throw new Error("Failed to load stats");
    }

    const data = await res.json();
    loadingEl.style.display = "none";
    contentEl.style.display = "block";

    const shortUrl = `${window.location.origin}/${data.code}`;
    shortUrlEl.href = shortUrl;
    shortUrlEl.textContent = shortUrl;

    codeEl.textContent = data.code;

    targetUrlEl.href = data.target_url;
    targetUrlEl.textContent = data.target_url;

    totalClicksEl.textContent = data.total_clicks;
    lastClickedEl.textContent = data.last_clicked_at
      ? new Date(data.last_clicked_at).toLocaleString()
      : "Never";

    createdAtEl.textContent = new Date(data.created_at).toLocaleString();
  } catch (err) {
    loadingEl.style.display = "none";
    errorEl.style.display = "block";
    errorEl.textContent = err.message;
  }
}

loadStats();
