// ============================================================
// SCHLIESSZEITEN DER ORDINATION (Urlaub, Fortbildung, etc.)
// ------------------------------------------------------------
// Hier einfach neue Zeilen hinzufügen oder bestehende ändern.
// Format:  { reason: "Urlaub", start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
// Bei nur einem Tag: start und end gleich setzen.
// Vergangene Einträge müssen NICHT gelöscht werden – sie werden
// automatisch ausgeblendet, sobald das Enddatum vorbei ist.
// ============================================================
const CLOSURES = [
  { reason: "Urlaub", start: "2026-08-03", end: "2026-08-17" },
  { reason: "Urlaub", start: "2026-08-22", end: "2026-08-22" },
  { reason: "Urlaub", start: "2026-08-23", end: "2026-08-23" },
];
// ============================================================

function formatDateDE(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const active = CLOSURES.filter((c) => {
    const end = new Date(c.end + "T23:59:59");
    return end >= today;
  });

  if (active.length === 0) return;

  const sessionKey = "closureNoticeSeen:" + active.map((c) => `${c.reason}|${c.start}|${c.end}`).join(";");
  if (sessionStorage.getItem(sessionKey)) return;

  const items = active
    .map((c) => {
      const when = c.start === c.end
        ? `am ${formatDateDE(c.start)}`
        : `von ${formatDateDE(c.start)} bis ${formatDateDE(c.end)}`;
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
      <p>Bei dringenden Anliegen erreichen Sie uns telefonisch unter <a href="tel:+43724251960">07242 51960</a>.</p>
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
