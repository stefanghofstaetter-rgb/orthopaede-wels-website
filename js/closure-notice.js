// ============================================================
// SCHLIESSZEITEN DER ORDINATION (Urlaub, Fortbildung, etc.)
// ------------------------------------------------------------
// Einfach hier eine neue Zeile eintragen: Grund | Von | Bis
// (Datumsformat TT.MM.JJJJ, bei nur einem Tag Von = Bis).
// Vergangene Zeilen können stehen bleiben – sie werden auf der
// Website automatisch ausgeblendet, sobald das Enddatum vorbei ist.
// Das Pop-up erscheint nur während des jeweiligen Zeitraums.
// ============================================================
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

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const active = CLOSURES.filter((c) => parseDateDE(c.startDE) <= today && parseDateDE(c.endDE) >= today);
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
