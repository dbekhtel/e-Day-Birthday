let eDigits = null;

const out = document.getElementById("out");
const btn = document.getElementById("go");
const dateInput = document.getElementById("date");
const topBtn = document.getElementById("top");
if (topBtn) {
    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// Show hard errors instead of silently "sticking"
window.addEventListener("error", (e) => {
    out.textContent = `JS error: ${e.message}`;
    btn.disabled = true;
});
window.addEventListener("unhandledrejection", (e) => {
    const msg = e.reason?.message ?? String(e.reason);
    out.textContent = `Promise error: ${msg}`;
    btn.disabled = true;
});


function mdyyKeyFromISO(iso) {
    // iso: "YYYY-MM-DD"
    const [Y, M, D] = iso.split("-").map(x => parseInt(x, 10));
    const yy = (Y % 100).toString().padStart(2, "0");
    // M and D are NOT padded
    return `${M}${D}${yy}`;
}

async function loadDigits() {
    // Robust URL for GitHub Pages project sites
    const digitsUrl = new URL("eMillionDigits.txt", window.location.href).toString();

    out.textContent = `Fetching: ${digitsUrl}`;
    const res = await fetch(digitsUrl, { cache: "no-store" });

    if (!res.ok) throw new Error(`Couldn't fetch digits file: ${res.status}`);

    let txt = await res.text();

    // Remove whitespace and decimal point if present
    txt = txt.replace(/\s+/g, "").replace(/\./g, "");

    if (!/^\d+$/.test(txt)) {
    throw new Error("Digits file doesn't look like digits after cleaning.");
    }

    return txt;
}

// Return a string that STARTS at the match and continues after it.
function searchKey(key, after = 200) {
    const pos = eDigits.indexOf(key);
    if (pos === -1) return null;

    const start = pos; // start at the birthday match
    const end = Math.min(eDigits.length, pos + key.length + after);

    const shown = eDigits.slice(start, end);

    return { pos, shown };
}

(async () => {
    try {
    eDigits = await loadDigits();
    out.innerHTML =
        `Loaded ${eDigits.length.toLocaleString()} digits.\nPick a date and click Search.\n\n` +
        `<span class="digits">${eDigits}</span>`;
    } catch (e) {
    out.textContent = `Error loading digits: ${e.message}`;
    btn.disabled = true;
    }
})();

btn.addEventListener("click", () => {
    const iso = dateInput.value
    if (!eDigits) {
        out.textContent = "Digits aren't loaded yet (or failed to load).";
        return;
    }
    if (!iso) {
        out.textContent = "Pick a date first.";
        return;
    }

    const key = mdyyKeyFromISO(iso);
    const pos = eDigits.indexOf(key);

    if (pos === -1) {
        out.textContent = `Key: ${key}\nNot found in the loaded digits.\n\n` + eDigits;
        return;
    }

    const before = eDigits.slice(0, pos);
    const hit = eDigits.slice(pos, pos + key.length);
    const after = eDigits.slice(pos + key.length);

    out.innerHTML =
        `Key: ${key}\n` +
        `First occurrence starts at index: ${pos} (0-based)\n\n` +
        `<span class="digits">` +
        before +
        `<mark id="hit">${hit}</mark>` +
        after +
        `</span>`;

    document.getElementById("hit").scrollIntoView({ behavior: "smooth", block: "center" });
});
