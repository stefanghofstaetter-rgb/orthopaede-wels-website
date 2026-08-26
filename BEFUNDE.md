# Befunde – Systematische Website-Prüfung

Datum: 2026-08-25 · Geprüft: alle 8 HTML-Seiten (live via GitHub Pages)
Tools: `html-validate`, `linkinator`, `@axe-core/cli`, `lighthouse` (Desktop + Mobil, jeweils Startseite), manuelle Code-Durchsicht

Es wurde **noch nichts geändert** – reine Bestandsaufnahme.

## Ergebnisse der automatisierten Läufe (kurz)

- **html-validate**: 42 Fehler, alle 8 Dateien betroffen (siehe Tabelle, überwiegend niedrige Priorität)
- **linkinator** (34 Links/Ressourcen geprüft): **keine toten Links, keine fehlenden Bilder** – alles `200 OK`
- **axe-core** (8 Seiten): 0–6 Verstöße pro Seite, v. a. `color-contrast` und `heading-order`
- **Lighthouse Startseite Desktop**: Performance 92 · Accessibility 95 · Best Practices 96 · SEO 100
- **Lighthouse Startseite Mobil**: Performance **67** (LCP 9,1 s!) · Accessibility 95 · Best Practices 96 · SEO 100
- **Konsistenzprüfung** (Adresse, Telefonnummer, Öffnungszeiten, Leistungsnamen): auf allen Seiten identisch – keine Abweichungen gefunden

## Befunde-Tabelle

| Datei | Zeile | Problem | Schweregrad | Fix-Vorschlag |
|---|---|---|---|---|
| index.html | 50 | `img/portrait-start.jpg` ist 955 KB (Quelle 2115×2706 px), wird aber nur mit 637×815 px angezeigt → 868 KB verschenkt. Ursache für mobile LCP von 9,1 s (Lighthouse-Score 0,01) und Mobil-Performance nur 67/100 | **hoch** | Bild vor dem Einsatz auf ca. 1300 px Breite skalieren und als JPEG mit ca. 75–80 % Qualität komprimieren (Zielgröße ~80–150 KB) |
| ueber-mich.html | 53 | `img/portrait.jpg` ist 4,25 MB (!) – wird aber nie breiter als 260 px (Desktop) bzw. Spaltenbreite (mobil) dargestellt. Noch stärker überdimensioniert als das Hero-Bild | **hoch** | Gleiche Behandlung wie oben, Zielbreite ~800 px reicht für alle Ausgabegrößen |
| alle 8 Seiten | z. B. index.html:98, ordination.html:136, ueber-mich.html:139, therapiezentrum.html:269, faq.html:152, kontakt.html:108, impressum.html:57, datenschutz.html:98 | Footer-Überschriften nutzen `<h4>`, obwohl im Hauptinhalt zuvor nur bis `<h2>`/`<h3>` gezählt wird → Ebene wird übersprungen (axe: `heading-order`) | mittel | `<h4>` → `<h3>` im Footer **und** CSS-Selektor `.site-footer h4` (style.css:543) → `.site-footer h3` – rein strukturelle Änderung, keine optische Auswirkung |
| impressum.html, datenschutz.html | jeweils `<head>` (nach Zeile 5) | Kein `<meta name="description">`, im Gegensatz zu den anderen 6 Seiten | mittel | Kurze Beschreibung ergänzen, analog zu den übrigen Seiten |
| alle 8 Seiten | `<head>` | Kein Favicon eingebunden → `favicon.ico` liefert 404, wird von Lighthouse als Konsolenfehler gewertet (`errors-in-console`) | mittel | `<link rel="icon" href="img/logo-icon.svg">` (oder generiertes .ico) in jedem `<head>` ergänzen |
| ordination.html | 51 (`.gallery-scroll`) | Horizontal scrollbarer Bereich ohne Tastatur-Fokussierbarkeit (axe: `scrollable-region-focusable`, betrifft v. a. Safari) | mittel | `tabindex="0"` und passendes `aria-label` auf den scrollenden Container |
| therapiezentrum.html | 51 (`#therapyScroll`) | Gleiches Problem wie oben beim Therapie-Karussell | mittel | Gleicher Fix |
| index.html (50), alle 8 Seiten (Logo, Zeile 18) | – | `<img>` ohne `width`/`height`-Attribute (Lighthouse: `unsized-images`) → Risiko für Layout-Verschiebung beim Laden | mittel | Explizite `width`/`height` (im Originalseitenverhältnis) ergänzen |
| 7 von 8 Seiten (nicht faq.html) | u. a. `.btn-primary`, `.section-label`, `.principle strong` | Farbkontrast erfüllt WCAG-AA nicht (axe: `color-contrast`) – v. a. Akzent-Grün `#3bab78` als Text- oder Button-Hintergrundfarbe | mittel | **Erfordert Farbänderung – gemäß Vorgabe "Farben nicht eigenmächtig ändern" nicht ohne Rücksprache umsetzen.** Betroffene Farbe müsste dunkler werden, um AA zu erfüllen |
| alle 8 Seiten | Zeile 19 (`.nav-toggle`) | `<button>` ohne `type`-Attribut (html-validate: `no-implicit-button-type`) | niedrig | `type="button"` ergänzen |
| mehrere Seiten (alle Vorkommen von `tel:+43724251960` im Fließtext) | diverse | Telefonnummer im sichtbaren Text mit normalem Leerzeichen statt `&nbsp;` (html-validate: `tel-non-breaking`) → kann an ungünstiger Stelle umbrechen | niedrig | Leerzeichen in der Anzeige-Telefonnummer durch `&nbsp;` ersetzen |
| impressum.html | 46 | RIS-Link im Fließtext nur durch Farbe vom Text unterscheidbar (axe: `link-in-text-block`) – Ursache ist sitewide `a { text-decoration: none }` (style.css:47) | niedrig | **Ebenfalls eine Design-Änderung (Link-Unterstreichung) – nicht ohne Rücksprache umsetzen.** |
| viele Stellen, alle Seiten | diverse | html-validate meldet "Inline style is not allowed" | niedrig / kein Handlungsbedarf | Bewusst genutztes Muster in diesem Projekt für punktuelle Anpassungen – kein Bug, keine Aktion vorgeschlagen |

## Manueller Browser-Test (390px, Menü, Konsole)

- Menü öffnet/schließt korrekt über den Hamburger-Button (`aria-expanded` wird richtig gesetzt), schließt sich auch automatisch beim Klick auf einen Link.
- Alle 6 Menü-Links (Start, Über mich, Ordination & Team, Therapiezentrum, FAQ / Info, Kontakt) wurden bei 390px Breite angeklickt/navigiert – alle führen korrekt zur jeweiligen Seite.
- Browser-Konsole auf jeder der 6 Seiten geprüft: **keine JavaScript-Fehler**.
- ⇒ Keine Befunde aus diesem Testschritt.

## Nicht geprüft / Einschränkungen

- Lighthouse wurde nur für die **Startseite** ausgeführt (Vorgabe war `<URL>` ohne Seitenliste); die Bildgrößen-Problematik betrifft aber mit hoher Wahrscheinlichkeit auch `ordination.html` (Galerie) und `therapiezentrum.html` (Karussell) – dort wurden die Bilder kürzlich für Desktop vergrößert dargestellt, ohne dass die Quelldateien geprüft wurden.
- Rechtschreibprüfung erfolgte manuell/stichprobenartig (kein Wörterbuch-Tool verfügbar) – keine Tippfehler gefunden, aber keine Garantie für 100 % Abdeckung.
