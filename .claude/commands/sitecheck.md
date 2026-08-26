Prüfe die gesamte Website systematisch und leg die Ergebnisse in
BEFUNDE.md ab (Tabelle: Datei | Zeile | Problem | Schweregrad | Fix-Vorschlag).
Ändere noch nichts.

Prüfe:
1. HTML-Validität: `npx --yes html-validate "**/*.html"`
2. Tote Links + fehlende Bilder: `npx --yes linkinator ./ --recurse`
3. Barrierefreiheit: `npx --yes @axe-core/cli <URL>`
4. Performance/SEO: `npx --yes lighthouse <URL> --preset=desktop`
   und ein zweiter Lauf mobil
5. Manuell im Code: fehlende alt-Texte, doppelte IDs, inkonsistente
   Überschriften-Hierarchie (h1/h2/h3), fehlende meta description,
   Rechtschreib- und Tippfehler im Fließtext (deutsch, Österreich)
6. Konsistenz: Adresse, Telefonnummer, Öffnungszeiten, Leistungsnamen
   auf allen Seiten identisch?
7. Manuell im Browser: Menü öffnen/schließen bei 390px Breite testen,
   alle Links im Menü anklicken, und die Browser-Konsole dabei auf
   JavaScript-Fehler prüfen.
