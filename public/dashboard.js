const API_BASE = "/api/links";

const createForm = document.getElementById("create-form");
const createBtn = document.getElementById("create-btn");
const formMessage = document.getElementById("form-message");
const tableBody = document.getElementById("links-body");
const tableEmpty = document.getElementById("table-empty");
const searchInput = document.getElementById("search");
const healthStatus = document.getElementById("health-status");

async function checkHealth() {
  try {
    const res = await fetch("/healthz");
    if (!res.ok) throw new Error();
    const data = await res.json();
    healthStatus.textContent = data.ok ? "OK" : "Degraded";
  } catch {
    healthStatus.textContent = "DOWN";
  }
}

async function loadLinks() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch links");

    const links = await res.json();
    window._linksCache = links;
    renderLinks(links);
  } catch (err) {
    console.error(err);
    tableEmpty.textContent = "Error loading links.";
  }
}

function renderLinks(links) {
  const q = (searchInput.value || "").toLowerCase();
  const filtered = links.filter(l =>
    l.code.toLowerCase().includes(q) ||
    (l.target_url || "").toLowerCase().includes(q)
  );

  tableBody.innerHTML = "";

  if (filtered.length === 0) {
    tableEmpty.style.display = "block";
  } else {
    tableEmpty.style.display = "none";
  }

  filtered.forEach(link => {
    const tr = document.createElement("tr");

    const shortUrl = `${window.location.origin}/${link.code}`;

    tr.innerHTML = `
      <td>
        <a href="/code/${link.code}">${link.code}</a>
        <button class="copy-btn" data-url="${shortUrl}">Copy</button>
      </td>
      <td title="${link.target_url}">
        <span class="truncate">${link.target_url}</span>
      </td>
      <td>${link.total_clicks}</td>
      <td>${link.last_clicked_at ? new Date(link.last_clicked_at).toLocaleString() : "Never"}</td>
      <td>
        <button class="danger-btn delete-btn" data-code="${link.code}">Delete</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMessage.textContent = "";
  formMessage.className = "message";

  const url = createForm.url.value.trim();
  const code = createForm.code.value.trim();

  if (!url) {
    formMessage.textContent = "URL is required.";
    formMessage.classList.add("error");
    return;
  }

  if (code && !/^[A-Za-z0-9]{6,8}$/.test(code)) {
    formMessage.textContent = "Code must be 6–8 letters/numbers.";
    formMessage.classList.add("error");
    return;
  }

  createBtn.disabled = true;
  createBtn.textContent = "Creating...";

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, code: code || undefined })
    });

    if (res.status === 409) {
      formMessage.textContent = "That code already exists. Try another.";
      formMessage.classList.add("error");
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      formMessage.textContent = data.error || "Failed to create link.";
      formMessage.classList.add("error");
      return;
    }

    const created = await res.json();
    formMessage.textContent = `Created: ${window.location.origin}/${created.code}`;
    formMessage.classList.add("success");

    createForm.reset();
    await loadLinks();
  } catch (err) {
    console.error(err);
    formMessage.textContent = "Network error.";
    formMessage.classList.add("error");
  } finally {
    createBtn.disabled = false;
    createBtn.textContent = "Shorten";
  }
});

tableBody.addEventListener("click", async (e) => {
  const copyBtn = e.target.closest(".copy-btn");
  const deleteBtn = e.target.closest(".delete-btn");

  if (copyBtn) {
    const url = copyBtn.dataset.url;
    try {
      await navigator.clipboard.writeText(url);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1000);
    } catch {
      alert("Failed to copy");
    }
  }

  if (deleteBtn) {
    const code = deleteBtn.dataset.code;
    if (!confirm(`Delete link '${code}'?`)) return;

    try {
      const res = await fetch(`${API_BASE}/${code}`, {
        method: "DELETE"
      });
      if (res.status === 404) {
        alert("Link not found (already deleted).");
      } else if (!res.ok) {
        alert("Failed to delete.");
      } else {
        await loadLinks();
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  }
});

searchInput.addEventListener("input", () => {
  if (window._linksCache) {
    renderLinks(window._linksCache);
  }
});

checkHealth();
loadLinks();
