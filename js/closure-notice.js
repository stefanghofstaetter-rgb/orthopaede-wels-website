// ============================================================
// SCHLIESSZEITEN DER ORDINATION (Urlaub, Fortbildung, etc.)
// ------------------------------------------------------------
// Die Termine werden aus dieser Google-Tabelle geladen:
// https://docs.google.com/spreadsheets/d/1hP-BPFKpS2olLab7Ox7-lDCOGvEYPbZx5VZTzyG1Jvs/edit
//
// Einfach dort eine neue Zeile eintragen: Grund | Von | Bis
// (Datumsformat TT.MM.JJJJ, bei nur einem Tag Von = Bis).
// Vergangene Zeilen können stehen bleiben – sie werden auf der
// Website automatisch ausgeblendet, sobald das Enddatum vorbei ist.
//
// FALLBACK_CLOSURES unten wird nur verwendet, falls die Tabelle
// gerade nicht erreichbar ist (z. B. keine Internetverbindung).
// ============================================================
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1hP-BPFKpS2olLab7Ox7-lDCOGvEYPbZx5VZTzyG1Jvs/export?format=csv&gid=0";

const FALLBACK_CLOSURES = [
  { reason: "Urlaub", startDE: "03.08.2026", endDE: "17.08.2026" },
  { reason: "Urlaub", startDE: "22.08.2026", endDE: "22.08.2026" },
  { reason: "Urlaub", startDE: "23.08.2026", endDE: "23.08.2026" },
];
// ============================================================

function parseDateDE(str) {
  const [d, m, y] = str.trim().split(".");
  return new Date(`${y}-${m}-${d}T00:00:00`);
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  return lines
    .slice(1) // Kopfzeile überspringen
    .map((line) => line.split(","))
    .filter((cols) => cols.length >= 3 && cols[0].trim())
    .map(([reason, startDE, endDE]) => ({
      reason: reason.trim(),
      startDE: startDE.trim(),
      endDE: endDE.trim(),
    }));
}

async function loadClosures() {
  try {
    const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Tabelle nicht erreichbar");
    const parsed = parseCSV(await res.text());
    return parsed.length ? parsed : FALLBACK_CLOSURES;
  } catch (err) {
    return FALLBACK_CLOSURES;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const closures = await loadClosures();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const active = closures.filter((c) => parseDateDE(c.startDE) <= today && parseDateDE(c.endDE) >= today);
  if (active.length === 0) return;

  const sessionKey = "closureNoticeSeen:" + active.map((c) => `${c.reason}|${c.startDE}|${c.endDE}`).join(";");
  if (sessionStorage.getItem(sessionKey)) return;

  const items = active
    .map((c) => {
      const when = c.startDE === c.endDE ? `am ${c.startDE}` : `von ${c.startDE} bis ${c.endDE}`;
      return `<li>${c.reason} ${when}</li>`;
    })
    .join("");

  const overlay = document.createElement("div");
  overlay.className = "closure-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "closure-title");
  overlay.innerHTML = `
    <div class="closure-box">
      <h2 id="closure-title">Ordination vorübergehend geschlossen</h2>
      <ul>${items}</ul>
      <p>Bei dringenden Anliegen wenden Sie sich bitte an den auf unserem Anrufbeantworter genannten Vertretungsarzt, an die Gesundheitsberatung unter <a href="tel:1450">1450</a> oder an Ihren Hausarzt.</p>
      <button type="button" class="btn btn-primary closure-close">Verstanden</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.classList.add("closure-open");

  overlay.querySelector(".closure-close").addEventListener("click", () => {
    overlay.remove();
    document.body.classList.remove("closure-open");
    sessionStorage.setItem(sessionKey, "1");
  });
});
