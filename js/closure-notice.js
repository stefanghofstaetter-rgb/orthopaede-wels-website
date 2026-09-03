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
//    Feld "Grund" leer lassen (kein Urlaub/keine Fortbildung
//    eingetragen): Es erscheint dann automatisch der neutrale Text
//    "Unsere Ordination ist vom ... bis ... geschlossen." Ist ein
//    Grund eingetragen, wird er eingebaut: "... ist wegen Urlaub
//    vom ... bis ... geschlossen."
//
// In beiden Fällen: Vergangene Zeilen können stehen bleiben – sie
// werden automatisch ausgeblendet, sobald das Enddatum vorbei ist,
// und das Pop-up erscheint jeweils nur während des Zeitraums selbst.
// ============================================================
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1hP-BPFKpS2olLab7Ox7-lDCOGvEYPbZx5VZTzyG1Jvs/export?format=csv";

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

function formatDateDE(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}.${m}.${date.getFullYear()}`;
}

function nextBusinessDay(date) {
  const next = new Date(date);
  do {
    next.setDate(next.getDate() + 1);
  } while (next.getDay() === 0 || next.getDay() === 6); // Sonntag / Samstag überspringen
  return next;
}

const MONTHS_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
function formatDateDELong(date) {
  return `${date.getDate()}. ${MONTHS_DE[date.getMonth()]} ${date.getFullYear()}`;
}

function closureSentence(reason, startDE, endDE) {
  const start = parseDateDE(startDE);
  const end = parseDateDE(endDE);
  let dateClause;
  if (startDE === endDE) {
    dateClause = `am ${formatDateDELong(start)}`;
  } else if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    dateClause = `vom ${start.getDate()}. bis ${formatDateDELong(end)}`;
  } else {
    dateClause = `vom ${formatDateDELong(start)} bis ${formatDateDELong(end)}`;
  }
  const isGeneric = !reason || reason.trim().toLowerCase() === "geschlossen";
  const reasonClause = isGeneric ? "" : ` wegen ${reason}`;
  return `Unsere Ordination ist${reasonClause} <strong>${dateClause}</strong> geschlossen.`;
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  return lines
    .slice(1) // Kopfzeile überspringen
    .map((line) => line.split(","))
    .filter((cols) => cols.length >= 3 && cols[1].trim() && cols[2].trim())
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

  const latestEnd = active.reduce(
    (max, c) => {
      const end = parseDateDE(c.endDE);
      return end > max ? end : max;
    },
    parseDateDE(active[0].endDE)
  );
  const reachableAgain = formatDateDELong(nextBusinessDay(latestEnd));

  const items = active
    .map((c) => {
      return `<li class="closure-item">
        <span class="closure-item-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </span>
        <p>${closureSentence(c.reason, c.startDE, c.endDE)}</p>
      </li>`;
    })
    .join("");

  const overlay = document.createElement("div");
  overlay.className = "closure-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Ordination vorübergehend geschlossen");
  overlay.innerHTML = `
    <div class="closure-box">
      <ul class="closure-list">${items}</ul>
      <div class="closure-reopen">
        <span class="closure-reopen-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 9 17 20 6"></polyline></svg>
        </span>
        <p><strong>Ab dem ${reachableAgain}</strong> sind wir gerne wieder wie gewohnt für Sie <strong>da</strong>.</p>
      </div>
      <div class="closure-urgent">
        <span class="closure-urgent-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        </span>
        <p><strong>Bei dringenden Anliegen</strong> wenden Sie sich bitte an den auf unserem Anrufbeantworter genannten Vertretungsarzt, an die Gesundheitsberatung unter <a href="tel:1450">1450</a> oder an Ihren Hausarzt.</p>
      </div>
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
