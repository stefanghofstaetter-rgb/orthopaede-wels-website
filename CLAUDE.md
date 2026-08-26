# orthopaede-wels-website

Homepage von Priv. Doz. Dr. Stefan Hofstätter (Facharzt für Orthopädie, Wels).

## Tech-Stack

Statisches HTML/CSS/JS ohne Build-Schritt, kein Framework, kein Bundler, kein `package.json`. Jede Seite ist eine eigenständige `.html`-Datei mit identischem Header/Footer-Markup (Header/Footer werden nicht per Include geteilt, sondern in jeder Datei dupliziert – bei Nav-/Footer-Änderungen also alle 8 HTML-Dateien anpassen).

## Dateistruktur

```
index.html            Startseite
ueber-mich.html        Über mich (Werdegang, Philosophie)
ordination.html        Ordination & Team
therapiezentrum.html   Leistungen (aufklappbare Liste, Bilderkarussell)
faq.html                FAQ (aufklappbare Liste)
kontakt.html            Kontakt, Öffnungszeiten, Anfahrt, Karte
impressum.html, datenschutz.html   Rechtstexte
css/style.css           gemeinsames Stylesheet (ein einziges File, ~750 Zeilen)
js/main.js              mobiles Menü (Hamburger-Toggle)
js/therapy-carousel.js  Bilderkarussell auf therapiezentrum.html
js/closure-notice.js    Popup für Schließzeiten (Daten direkt im Script + optional Google-Sheet-CSV, siehe Kommentar im File)
img/                     alle Bilder (siehe unten)
```

Git-Root ist dieser `website/`-Ordner selbst (nicht das übergeordnete Verzeichnis).

## CSS-Konventionen

- Alles in `css/style.css`, kein CSS-in-JS, keine Präprozessoren.
- Design-Tokens als CSS-Variablen in `:root` (Farben, Fonts, `--max-width: 1120px`, `--radius`, `--shadow`).
- Layout-Grundbausteine: `.section` / `.section-alt` (alternierender Hintergrund zwischen Abschnitten), `.container` (max-width + Padding), `.section-header` (schmale Intro-Texte, `max-width: 70ch`).
- Wiederkehrende Komponenten: `.focus-list`/`.focus-item`/`.focus-sublist` (Karten-Listen), `.service-list`/`.service-item` (natives `<details>/<summary>`-Akkordeon für FAQ/Leistungen/Werdegang), `.btn`/`.btn-primary`/`.btn-outline` (Buttons), `.two-col` (Text+Bild-Layout).
- Neue Sektionen/Komponenten an bestehende Klassennamen und Spacing-Werte (rem-basiert) anlehnen statt neue Muster zu erfinden.
- Reihenfolge beachten: Wenn eine speziellere Media-Query eine allgemeinere Regel überschreiben soll, muss sie *später* im File stehen (CSS-Kaskade nach Quellreihenfolge, nicht nur Spezifität) – das war schon mehrfach Ursache für „Änderung wirkt nicht“.

## Breakpoints

- `max-width: 340px` – sehr kleine Handys
- `max-width: 600px`, `max-width: 780px`, `max-width: 860px` – mobil/Nav-Umschaltung (Hamburger unter 860px)
- `min-width: 421px and max-width: 1099px` – Tablet-Zwischenbereich
- `min-width: 640px`, `min-width: 781px`, `min-width: 980px` – wachsende Spaltenzahl bei Grids/Galerien
- `min-width: 1100px` – Desktop-Breite generell
- `min-width: 1100px and (hover: hover) and (pointer: fine)` – **echter Desktop/Maus**, bewusst getrennt von reiner Breite, damit große iPads (die auch >1100px breit sein können) nicht fälschlich die Desktop-Optik bekommen. Für "nur am PC, nicht am iPad"-Anpassungen immer diese Query verwenden.

## Bilder & Dokumente

- Alles unter `img/`: Fotos (`portrait*.jpg`, `ordination-*.jpg`, `therapie-*.jpg`), Logo (`logo.svg`, `logo-icon.svg`).
- Rohmaterial/Quelldateien (unbearbeitete Fotos etc.) liegen **außerhalb** des Repos unter `../1 Bilder für Homepage NEU 2026/` im übergeordneten Projektordner – von dort ins `img/`-Verzeichnis kopieren, wenn ein Bild verwendet werden soll.
- Keine Bildoptimierung/Build-Pipeline – Dateien werden so eingebunden, wie sie abgelegt sind.

## Lokal testen

Kein Server nötig: `index.html` (bzw. jede andere Seite) direkt im Browser öffnen. Da es keinen Build-Schritt gibt, sind Änderungen sofort sichtbar (Browser-Cache beachten).

## Deployment (GitHub Pages)

- Repo: `stefanghofstaetter-rgb/orthopaede-wels-website`, Pages-Quelle ist Branch `master`, Pfad `/` (kein `gh-pages`-Branch, kein Actions-Workflow).
- Ablauf: committen → `git push` → GitHub Pages baut automatisch neu. Build-Status prüfen mit:
  ```
  gh api repos/stefanghofstaetter-rgb/orthopaede-wels-website/pages/builds/latest --jq '.status'
  ```
  (auf `"built"` warten, bevor man live verifiziert).
- Live-URL: `https://stefanghofstaetter-rgb.github.io/orthopaede-wels-website/`
- Nach dem Deploy immer mit `curl -s "<url>?v=$(date +%s)"` (Cache-Busting) gegenprüfen, ob die Änderung tatsächlich live ist – nicht nur auf den Push verlassen.
