// ============================================================
// SCHLIESSZEITEN DER ORDINATION (Urlaub, Fortbildung, etc.)
// ------------------------------------------------------------
// Zwei Möglichkeiten, einen Zeitraum einzutragen (beide wirken
// gleichzeitig, es reicht eine davon):
//
// 1) Direkt hier unten in CLOSURES eine neue Zeile eintragen.
//
// 2) In der Google-Tabelle eine neue Zeile eintragen:
//    https://docs.google.com/spreadsheets/d/1hP-BPFKpS2olLab7Ox7-lDCOGvEYPbZx5VZTzyG1Jvs/edit
//    Spalten: Grund | Von | Bis (Datumsformat TT.MM.JJJJ,
//    bei nur einem Tag Von = Bis). Damit das funktioniert, muss
//    die Tabelle auf "Jeder mit dem Link: Betrachter" freigegeben
//    sein (Freigeben-Button oben rechts in der Tabelle).
//
// In beiden Fällen: Vergangene Zeilen können stehen bleiben – sie
// werden automatisch ausgeblendet, sobald das Enddatum vorbei ist,
// und das Pop-up erscheint jeweils nur während des Zeitraums selbst.
// ============================================================
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1hP-BPFKpS2olLab7Ox7-lDCOGvEYPbZx5VZTzyG1Jvs/export?format=csv&gid=0";

const CLOSURES = [
  { reason: "Geschlossen", startDE: "04.09.2026", endDE: "04.09.2026" },
  { reason: "Geschlossen", startDE: "26.10.2026", endDE: "30.10.2026" },
  { reason: "Geschlossen", startDE: "24.12.2026", endDE: "31.12.2026" },
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
    const fromSheet = parseCSV(await res.text());
    return CLOSURES.concat(fromSheet);
  } catch (err) {
    return CLOSURES;
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
