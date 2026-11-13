# Testfälle

Automatisch erzeugt am 13.11.2026 mit `npm run writeDokuTestcases` – nicht von Hand bearbeiten.

242 Testfälle, davon 0 ohne erwartetes Ergebnis.

| Testdatei | Testfall | Erwartetes Ergebnis |
|---|---|---|
| cta-float.spec.ts | CTA-Buttons (Desktop) › Buttons sichtbar &amp; klickbar | Beide Buttons vollständig im Bild und nicht verdeckt – am Seitenanfang, in jeder Section und am Seitenende |
| cta-float.spec.ts | CTA-Buttons (Desktop) › Buttons bleiben beim Scrollen am selben Platz | Abstand zum unteren Bildrand ist gleich, solange der Footer nicht sichtbar ist |
| cta-float.spec.ts | CTA-Buttons (Desktop) › Buttons verdecken am Seitenende den Footer nicht | Buttons rutschen nach oben und liegen vollständig oberhalb des Footers |
| cta-float.spec.ts | CTA-Buttons (Desktop) › WhatsApp-Button öffnet WhatsApp in neuem Tab | Neuer Tab öffnet https://wa.me/4917612345678 (Link mit target="_blank" und rel="noopener") |
| cta-float.spec.ts | CTA-Buttons (Desktop) › Schaden-checken-Overlay › Button öffnet das Overlay | Overlay ist geöffnet, Überschrift „Schaden checken“ sichtbar |
| cta-float.spec.ts | CTA-Buttons (Desktop) › Schaden-checken-Overlay › Overlay schließt mit dem X | Overlay ist geschlossen |
| cta-float.spec.ts | CTA-Buttons (Desktop) › Schaden-checken-Overlay › Overlay schließt mit der Escape-Taste | Overlay ist geschlossen |
| cta-float.spec.ts | CTA-Buttons (Desktop) › Schaden-checken-Overlay › Overlay schließt bei Klick außerhalb des Formulars | Overlay ist geschlossen |
| cta-float.spec.ts | CTA-Buttons (Desktop) › Schaden-checken-Overlay › Klick in das Formular lässt das Overlay offen | Overlay bleibt geöffnet |
| cta-float.spec.ts | CTA-Buttons (Desktop) › Schaden-checken-Overlay › Seite ist bei offenem Overlay nicht scrollbar | Scrollen der Seite ist gesperrt, solange das Overlay offen ist; Scrollen erst nach dem Schließen wieder möglich |
| cta-float.spec.ts | CTA-Buttons (Smartphone) › Buttons sichtbar &amp; klickbar | Beide Buttons vollständig im Bild und nicht verdeckt – am Seitenanfang, in jeder Section und am Seitenende |
| cta-float.spec.ts | CTA-Buttons (Smartphone) › Buttons bleiben beim Scrollen am selben Platz | Abstand zum unteren Bildrand ist gleich, solange der Footer nicht sichtbar ist |
| cta-float.spec.ts | CTA-Buttons (Smartphone) › Buttons verdecken am Seitenende den Footer nicht | Buttons rutschen nach oben und liegen vollständig oberhalb des Footers |
| cta-float.spec.ts | CTA-Buttons (Smartphone) › WhatsApp-Button öffnet WhatsApp in neuem Tab | Neuer Tab öffnet https://wa.me/4917612345678 (Link mit target="_blank" und rel="noopener") |
| cta-float.spec.ts | CTA-Buttons (Smartphone) › Schaden-checken-Overlay › Button öffnet das Overlay | Overlay ist geöffnet, Überschrift „Schaden checken“ sichtbar |
| cta-float.spec.ts | CTA-Buttons (Smartphone) › Schaden-checken-Overlay › Overlay schließt mit dem X | Overlay ist geschlossen |
| cta-float.spec.ts | CTA-Buttons (Smartphone) › Schaden-checken-Overlay › Overlay schließt mit der Escape-Taste | Overlay ist geschlossen |
| cta-float.spec.ts | CTA-Buttons (Smartphone) › Schaden-checken-Overlay › Overlay schließt bei Klick außerhalb des Formulars | Overlay ist geschlossen |
| cta-float.spec.ts | CTA-Buttons (Smartphone) › Schaden-checken-Overlay › Klick in das Formular lässt das Overlay offen | Overlay bleibt geöffnet |
| cta-float.spec.ts | CTA-Buttons (Smartphone) › Schaden-checken-Overlay › Seite ist bei offenem Overlay nicht scrollbar | Scrollen der Seite ist gesperrt, solange das Overlay offen ist; Scrollen erst nach dem Schließen wieder möglich |
| damage-form.spec.ts | Schaden-Formular: verschiedene Kombinationen der Pflichtfelder › kein Feld gültig ausgefüllt, dann absenden | 3 Meldung(en) bei Vorname, Nachname, Telefon; Cursor im Feld „Vorname“ |
| damage-form.spec.ts | Schaden-Formular: verschiedene Kombinationen der Pflichtfelder › nur Vorname gültig ausgefüllt, dann absenden | 2 Meldung(en) bei Nachname, Telefon; Cursor im Feld „Nachname“ |
| damage-form.spec.ts | Schaden-Formular: verschiedene Kombinationen der Pflichtfelder › nur Nachname gültig ausgefüllt, dann absenden | 2 Meldung(en) bei Vorname, Telefon; Cursor im Feld „Vorname“ |
| damage-form.spec.ts | Schaden-Formular: verschiedene Kombinationen der Pflichtfelder › nur Telefon gültig ausgefüllt, dann absenden | 2 Meldung(en) bei Vorname, Nachname; Cursor im Feld „Vorname“ |
| damage-form.spec.ts | Schaden-Formular: verschiedene Kombinationen der Pflichtfelder › Vorname + Nachname gültig ausgefüllt, dann absenden | 1 Meldung(en) bei Telefon; Cursor im Feld „Telefon“ |
| damage-form.spec.ts | Schaden-Formular: verschiedene Kombinationen der Pflichtfelder › Vorname + Telefon gültig ausgefüllt, dann absenden | 1 Meldung(en) bei Nachname; Cursor im Feld „Nachname“ |
| damage-form.spec.ts | Schaden-Formular: verschiedene Kombinationen der Pflichtfelder › Nachname + Telefon gültig ausgefüllt, dann absenden | 1 Meldung(en) bei Vorname; Cursor im Feld „Vorname“ |
| damage-form.spec.ts | Schaden-Formular: verschiedene Kombinationen der Pflichtfelder › alles außer Pflichtfelder gültig ausgefüllt, dann absenden | 3 Meldung(en) bei Vorname, Nachname, Telefon; Cursor im Feld „Vorname“ |
| damage-form.spec.ts | Schaden-Formular: verschiedene Kombinationen der Pflichtfelder › alle Pflichtfelder gültig ausgefüllt, dann absenden | Anfrage wird abgeschickt, Danke-Ansicht mit Vornamen erscheint |
| damage-form.spec.ts | Schaden-Formular: verschiedene Kombinationen der Pflichtfelder › alle Eingabefelder gültig ausgefüllt, dann absenden | Anfrage wird abgeschickt, Danke-Ansicht mit Vornamen erscheint |
| damage-form.spec.ts | Schaden-Formular: fehlende Pflichtfelder/andere Eingaben ergänzen › Vorname gültig, dann absenden, dann gültigen Nachnamen ergänzen, absenden, dann gültiges Telefon ergänzen | Nach dem ersten und zweiten Absenden erscheint ein Fehler, Eingaben können ergänzt und beim dritten Mal erfolgreich abgesendet werden |
| damage-form.spec.ts | Schaden-Formular: fehlende Pflichtfelder/andere Eingaben ergänzen › Vorname + Nachname gültig, dann absenden, dann alle anderen Eingaben ergänzen | Nach dem ersten Absenden erscheint ein Fehler, Eingaben können dann ergänzt und erfolgreich abgesendet werden |
| damage-form.spec.ts | Schaden-Formular: Werte überschreiben › Werte nach nicht erfolgreicher Übernahme überschreiben | Werte können nach NICHT erfolgreichem Absenden überschrieben werden, neuer Vorname erscheint in der Danke-Ansicht |
| damage-form.spec.ts | Schaden-Formular: Werte überschreiben › Werte vor Absenden überschreiben | Werte können vor dem Absenden überschrieben werden, neuer Vorname erscheint in der Danke-Ansicht |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: genau 2 Zeichen | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: genau 50 Zeichen | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: Umlaute | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: Akzente | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: andere Schrift | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: Bindestrich zwischen Buchstaben | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: Leerzeichen zwischen Buchstaben | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: Apostroph | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: typografischer Apostroph | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: Leerzeichen außen werden entfernt | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: 51 Zeichen werden abgeschnitten | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: nur Leerzeichen | Meldung „Bitte geben Sie Ihren Vornamen ein.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: 1 Zeichen | Meldung „Bitte mindestens 2 Zeichen eingeben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: Ziffer | Meldung „Nur Buchstaben, Leerzeichen, Bindestrich und Apostroph sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: Sonderzeichen | Meldung „Nur Buchstaben, Leerzeichen, Bindestrich und Apostroph sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: Bindestrich am Anfang | Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: Bindestrich am Ende | Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: doppelter Bindestrich | Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: doppeltes Leerzeichen innen | Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Vorname: „St3fanie“ wird korrigiert zu „Karlie“ | Falscher Wert wird überschrieben, Meldung und rote Markierung verschwinden. |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: genau 2 Zeichen | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: genau 50 Zeichen | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: Umlaute | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: Akzente | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: andere Schrift | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: Bindestrich zwischen Buchstaben | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: Leerzeichen zwischen Buchstaben | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: Apostroph | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: typografischer Apostroph | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: Leerzeichen außen werden entfernt | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: 51 Zeichen werden abgeschnitten | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: nur Leerzeichen | Meldung „Bitte geben Sie Ihren Nachnamen ein.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: 1 Zeichen | Meldung „Bitte mindestens 2 Zeichen eingeben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: Ziffer | Meldung „Nur Buchstaben, Leerzeichen, Bindestrich und Apostroph sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: Sonderzeichen | Meldung „Nur Buchstaben, Leerzeichen, Bindestrich und Apostroph sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: Bindestrich am Anfang | Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: Bindestrich am Ende | Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: doppelter Bindestrich | Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: doppeltes Leerzeichen innen | Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Nachname: „Nach_name“ wird korrigiert zu „Kunde“ | Falscher Wert wird überschrieben, Meldung und rote Markierung verschwinden. |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: beginnend mit +49 | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: beginnend mit 0 | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: Schrägstrich | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: Bindestrich | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: Vorwahl in Klammern | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: +49 mit (0) | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: genau 6 Ziffern | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: genau 15 Ziffern | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: Leerzeichen außen werden entfernt | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: nur Leerzeichen | Meldung „Bitte geben Sie Ihre Telefonnummer ein.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: Buchstaben | Meldung „Nur Ziffern, Leerzeichen und + - / ( ) sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: Punkt | Meldung „Nur Ziffern, Leerzeichen und + - / ( ) sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: + in der Mitte | Meldung „Das + ist nur ganz am Anfang erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: doppeltes + | Meldung „Das + ist nur ganz am Anfang erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: ohne Vorwahl | Meldung „Bitte mit Vorwahl eingeben (beginnend mit 0 oder +).“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: 5 Ziffern | Meldung „Die Nummer ist zu kurz.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: 16 Ziffern | Meldung „Die Nummer ist zu lang (höchstens 15 Ziffern).“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Telefon: „123456“ wird korrigiert zu „+49 176 12345678“ | Falscher Wert wird überschrieben, Meldung und rote Markierung verschwinden. |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: leer (optionales Feld) | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: einfache Adresse | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: Punkt, Plus und Subdomain | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: kürzeste Endung (2 Zeichen) | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: Großbuchstaben | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: genau 254 Zeichen | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: Leerzeichen außen werden entfernt | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: ohne @ | Meldung „Bitte eine gültige E-Mail-Adresse eingeben, z. B. name@beispiel.de.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: ohne Endung | Meldung „Bitte eine gültige E-Mail-Adresse eingeben, z. B. name@beispiel.de.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: Endung nur 1 Zeichen | Meldung „Bitte eine gültige E-Mail-Adresse eingeben, z. B. name@beispiel.de.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: ohne Namen vor @ | Meldung „Bitte eine gültige E-Mail-Adresse eingeben, z. B. name@beispiel.de.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: doppeltes @ | Meldung „Bitte eine gültige E-Mail-Adresse eingeben, z. B. name@beispiel.de.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: Leerzeichen innen | Meldung „Bitte eine gültige E-Mail-Adresse eingeben, z. B. name@beispiel.de.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mail: „mailadresse.com“ wird korrigiert zu „karlie@beispiel.de“ | Falscher Wert wird überschrieben, Meldung und rote Markierung verschwinden. |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: leer (optionales Feld) | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: nur Leerzeichen werden entfernt | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: Straße mit Hausnummer | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: Abkürzung mit Punkt und Buchstabe an Hausnummer | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: Schrägstrich | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: Bindestriche | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: genau 100 Zeichen | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: 101 Zeichen werden abgeschnitten | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: Leerzeichen außen werden entfernt | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: Komma | Meldung „Nur Buchstaben, Ziffern, Leerzeichen und . - / sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: Raute | Meldung „Nur Buchstaben, Ziffern, Leerzeichen und . - / sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: Klammern | Meldung „Nur Buchstaben, Ziffern, Leerzeichen und . - / sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: Apostroph | Meldung „Nur Buchstaben, Ziffern, Leerzeichen und . - / sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Strasse: „Gebäude #2“ wird korrigiert zu „Musterstraße 1“ | Falscher Wert wird überschrieben, Meldung und rote Markierung verschwinden. |
| damage-form.spec.ts | Schaden-Formular: Validierung › PLZ: leer (optionales Feld) | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › PLZ: 5 Ziffern (Deutschland) | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › PLZ: 4 Ziffern (Österreich, Schweiz) | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › PLZ: führende Null | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › PLZ: 6 Ziffern werden abgeschnitten | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › PLZ: 3 Ziffern | Meldung „Bitte 4 oder 5 Ziffern eingeben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › PLZ: Buchstabe | Meldung „Bitte 4 oder 5 Ziffern eingeben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › PLZ: Leerzeichen dazwischen | Meldung „Bitte 4 oder 5 Ziffern eingeben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › PLZ: Minuszeichen | Meldung „Bitte 4 oder 5 Ziffern eingeben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › PLZ: „1O20“ wird korrigiert zu „12345“ | Falscher Wert wird überschrieben, Meldung und rote Markierung verschwinden. |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: leer (optionales Feld) | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: nur Leerzeichen werden entfernt | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: genau 2 Zeichen | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: Umlaute | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: Bindestrich | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: Klammern | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: Punkt | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: Apostroph | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: typografischer Apostroph | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: genau 50 Zeichen | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: 51 Zeichen werden abgeschnitten | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: Leerzeichen außen werden entfernt | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: 1 Zeichen | Meldung „Bitte mindestens 2 Zeichen eingeben.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: Ziffer | Meldung „Nur Buchstaben, Leerzeichen und . - ' ( ) sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: Schrägstrich | Meldung „Nur Buchstaben, Leerzeichen und . - ' ( ) sind erlaubt.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: Bindestrich am Anfang | Meldung „Der Ort muss mit einem Buchstaben beginnen.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: Klammer am Anfang | Meldung „Der Ort muss mit einem Buchstaben beginnen.“, Feld rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Ort: „0rt“ wird korrigiert zu „Ort“ | Falscher Wert wird überschrieben, Meldung und rote Markierung verschwinden. |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mitteilung: leer (optionales Feld) | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mitteilung: kurzer Text | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mitteilung: mehrere Zeilen | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mitteilung: Sonderzeichen und Emoji | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mitteilung: genau 1000 Zeichen | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mitteilung: 1001 Zeichen werden abgeschnitten | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Mitteilung: Leerzeichen außen werden entfernt | keine Meldung, Feld nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Zeichenzähler Mitteilung › Mitteilung: Zeichenzähler bei kurzer Text | Zähler zeigt vor der Eingabe „0 / 1000“, danach „5 / 1000“ |
| damage-form.spec.ts | Schaden-Formular: Zeichenzähler Mitteilung › Mitteilung: Zeichenzähler bei mehrere Zeilen (Zeilenumbruch zählt als 1 Zeichen) | Zähler zeigt vor der Eingabe „0 / 1000“, danach „15 / 1000“ |
| damage-form.spec.ts | Schaden-Formular: Zeichenzähler Mitteilung › Mitteilung: Zeichenzähler bei genau 1000 Zeichen | Zähler zeigt vor der Eingabe „0 / 1000“, danach „1000 / 1000“ |
| damage-form.spec.ts | Schaden-Formular: Zeichenzähler Mitteilung › Mitteilung: Zeichenzähler bei 1001 Zeichen werden abgeschnitten | Zähler zeigt vor der Eingabe „0 / 1000“, danach „1000 / 1000“ |
| damage-form.spec.ts | Schaden-Formular: Zeichenzähler Mitteilung › Mitteilung: Zeichenzähler nach dem Löschen des Textes | Zähler geht nach dem Löschen zurück auf „0 / 1000“ |
| damage-form.spec.ts | Schaden-Formular: Zeichenzähler Mitteilung › Mitteilung: Zeichenzähler nach dem Entfernen der Leerzeichen außen | Nach dem Verlassen des Feldes zählt der Zähler nur noch den gekürzten Text: „5 / 1000“ |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: ein JPG | keine Meldung, Upload-Bereich nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: ein PNG | keine Meldung, Upload-Bereich nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: ein Video | keine Meldung, Upload-Bereich nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: Bild und Video | keine Meldung, Upload-Bereich nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: genau 10 Dateien | keine Meldung, Upload-Bereich nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: Datei genau 20 MB | keine Meldung, Upload-Bereich nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: zusammen genau 50 MB | keine Meldung, Upload-Bereich nicht rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: 11 Dateien | Meldung „Bitte höchstens 10 Dateien auswählen.“, Upload-Bereich rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: PDF | Meldung „„dokument.pdf“ ist kein Bild oder Video.“, Upload-Bereich rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: Bild und PDF | Meldung „„dokument.pdf“ ist kein Bild oder Video.“, Upload-Bereich rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: Datei 20 MB + 1 Byte | Meldung „„zu-gross.jpg“ ist größer als 20 MB.“, Upload-Bereich rot markiert |
| damage-form.spec.ts | Schaden-Formular: Validierung › Upload: Dateien zusammen 50 MB + 1 Byte | Meldung „Alle Dateien zusammen dürfen höchstens 50 MB groß sein.“, Upload-Bereich rot markiert |
| damage-form.spec.ts | Schaden-Formular: Anzeige der Dateinamen › Upload: Dateinamen – eine Datei | Im Upload-Bereich steht „delle.jpg“ |
| damage-form.spec.ts | Schaden-Formular: Anzeige der Dateinamen › Upload: Dateinamen – mehrere Dateien, mit Komma getrennt | Im Upload-Bereich steht „delle.jpg, kratzer.jpg“ |
| damage-form.spec.ts | Schaden-Formular: Anzeige der Dateinamen › Upload: Dateinamen – neue Auswahl ersetzt die alte | Im Upload-Bereich steht „kratzer.jpg“ |
| damage-form.spec.ts | Schaden-Formular: Anzeige der Dateinamen › Upload: Dateinamen – Auswahl entfernt | Im Upload-Bereich steht kein Dateiname mehr |
| damage-form.spec.ts | Schaden-Formular: Danke-Ansicht schließen und erneut öffnen › „Schließen“ in der Danke-Ansicht schließt das Overlay | Overlay ist geschlossen, Seite ist wieder scrollbar |
| damage-form.spec.ts | Schaden-Formular: Danke-Ansicht schließen und erneut öffnen › Formular ist nach dem Absenden beim erneuten Öffnen leer | Formular statt Danke-Ansicht sichtbar; alle Felder leer, keine Meldungen, Zähler auf „0 / 1000“, kein Dateiname |
| damage-form.spec.ts | Schaden-Formular: Danke-Ansicht schließen und erneut öffnen › Befülltes Formular ist nach dem Schließen beim erneuten Öffnen weiterhin befüllt | Formular sichtbar; alle Felder, Zähler und Dateiname wie vor dem Schließen |
| faq.spec.ts | FAQ: jedes Bild wird nur bei einer Frage verwendet | Kein Bild (data-img) ist bei mehr als einer Frage hinterlegt |
| faq.spec.ts | FAQ (Desktop) › zu jeder Frage gibt es eine Antwort mit mind. 50 Zeichen und ein Bild | Jeder FAQ-Eintrag hat eine Frage, eine Antwort mit mind. 50 Zeichen und ein Bild; nach dem Klick wird das passende Bild eingesetzt |
| faq.spec.ts | FAQ (Desktop) › beim Laden 1 Frage(n) offen, nach jedem Klick nur genau die angeklickte | Beim Laden ist genau eine Frage offen; nach jedem Klick ist nur die angeklickte Frage aktiv |
| faq.spec.ts | FAQ (Desktop) › Antworten sind nur bei der aktiven Frage sichtbar | Beim Laden und nach jedem Klick ist nur die Antwort der aktiven Frage sichtbar, alle anderen sind ausgeblendet |
| faq.spec.ts | FAQ (Desktop) › erneuter Klick auf die offene Frage lässt sie offen | Frage bleibt offen, Antwort bleibt sichtbar, genau eine Frage ist offen |
| faq.spec.ts | FAQ (Desktop) › Fragen lassen sich per Tastatur öffnen | Frage ist fokussierbar und öffnet mit Enter; aria-expanded ist bei der offenen Frage "true", bei der geschlossenen "false" |
| faq.spec.ts | FAQ (Smartphone) › zu jeder Frage gibt es eine Antwort mit mind. 50 Zeichen und ein Bild | Jeder FAQ-Eintrag hat eine Frage, eine Antwort mit mind. 50 Zeichen und ein Bild; nach dem Klick wird das passende Bild eingesetzt |
| faq.spec.ts | FAQ (Smartphone) › beim Laden 0 Frage(n) offen, nach jedem Klick nur genau die angeklickte | Beim Laden ist keine Frage offen; nach jedem Klick ist nur die angeklickte Frage aktiv |
| faq.spec.ts | FAQ (Smartphone) › Antworten sind nur bei der aktiven Frage sichtbar | Beim Laden und nach jedem Klick ist nur die Antwort der aktiven Frage sichtbar, alle anderen sind ausgeblendet |
| faq.spec.ts | FAQ (Smartphone) › erneuter Klick auf die offene Frage klappt sie zu | Frage klappt zu, Antwort ist ausgeblendet, keine Frage ist mehr offen |
| faq.spec.ts | FAQ (Smartphone) › Fragen lassen sich per Tastatur öffnen | Frage ist fokussierbar und öffnet mit Enter; aria-expanded ist bei der offenen Frage "true", bei der geschlossenen "false" |
| faq.spec.ts | FAQ bei 320 px › keine Antwort wird abgeschnitten | Jede geöffnete Antwort passt vollständig in ihre Box, nichts wird abgeschnitten |
| faq.spec.ts | FAQ bei 821 px › keine Antwort wird abgeschnitten | Jede geöffnete Antwort passt vollständig in ihre Box, nichts wird abgeschnitten |
| footer.spec.ts | Footer: Nachhaltigkeit korrekt verlinkt | Link führt auf #nachhaltigkeit; nach dem Klick endet die URL auf #nachhaltigkeit und der Abschnitt ist im sichtbaren Bereich |
| footer.spec.ts | Footer: Galerie korrekt verlinkt | Link führt auf #galerie; nach dem Klick endet die URL auf #galerie und der Abschnitt ist im sichtbaren Bereich |
| footer.spec.ts | Footer: Bewertungen korrekt verlinkt | Link führt auf #bewertungen; nach dem Klick endet die URL auf #bewertungen und der Abschnitt ist im sichtbaren Bereich |
| footer.spec.ts | Footer: Logo führt zum Seitenanfang | Link führt auf #; nach dem Klick endet die URL auf # und die Seite steht wieder ganz oben |
| gallery.spec.ts | Galerie: Pfeile vor/zurück wechseln das Bild | „Weiter“ zeigt ein anderes Bild, „zurück“ wieder das vorherige |
| gallery.spec.ts | Galerie: Endlos-Schleife in beide Richtungen | Jedes Bild erscheint genau einmal, danach wieder das erste; „zurück“ vom ersten Bild zeigt das letzte; der Fortschrittsbalken ist dabei immer passend zur Position des Bildes gefüllt |
| gallery.spec.ts | Galerie: Bildwechsel automatisch im eingestellten Takt | Bild bleibt bis kurz vor Ablauf des im Code eingestellten Takts stehen und wechselt danach automatisch |
| homepage.spec.ts | Startseite: lädt mit richtigem Titel | Seitentitel enthält den Firmennamen „Dellen Company“ |
| homepage.spec.ts | Startseite: lädt ohne JavaScript-Fehler und ohne fehlgeschlagene Anfragen | Beim Laden und Durchscrollen der Seite gibt es keine JavaScript-Fehler, keine Fehler in der Konsole und keine fehlgeschlagenen Anfragen |
| homepage.spec.ts | Startseite: letzter Einblend-Bereich ist nach dem Laden noch ausgeblendet | Der letzte Einblend-Bereich der Seite ist nach dem Laden noch unsichtbar (opacity 0) |
| homepage.spec.ts | Startseite: jeder Einblend-Bereich wird beim Scrollen eingeblendet | Jeder Einblend-Bereich ist vollständig sichtbar (opacity 1), sobald er ins Fenster gescrollt wurde |
| homepage.spec.ts | Startseite bei 821 px › kein horizontales Scrollen | Die Seite ist nicht breiter als das Fenster |
| homepage.spec.ts | Startseite bei 1280 px › kein horizontales Scrollen | Die Seite ist nicht breiter als das Fenster |
| homepage.spec.ts | Startseite bei 1920 px › kein horizontales Scrollen | Die Seite ist nicht breiter als das Fenster |
| images.spec.ts | Bilder: alle &lt;img>-Bilder können geladen werden | Jedes &lt;img> hat ein src; alle Bilder (auch per data-img nachgeladene) werden vom Server als Bild ausgeliefert |
| images.spec.ts | Bilder: alle CSS-Hintergrundbilder können geladen werden | Alle im Quelltext mit url(…) eingebundenen Hintergrundbilder werden vom Server als Bild ausgeliefert |
| images.spec.ts | Bilder: Favicon kann geladen werden | Favicon ist eingebunden und wird vom Server als Bild ausgeliefert |
| images.spec.ts | Bilder bei 1280 px (Desktop) › unterhalb des Heroes mit loading="lazy", darüber ohne | Sichtbare Bilder unterhalb des Heroes haben loading="lazy", Bilder im oder über dem Hero nicht |
| images.spec.ts | Bilder bei 390 px (Smartphone) › unterhalb des Heroes mit loading="lazy", darüber ohne | Sichtbare Bilder unterhalb des Heroes haben loading="lazy", Bilder im oder über dem Hero nicht |
| navbar-socialicons.spec.ts | Navbar: Social-Icon Facebook öffnet in neuem Tab | Link führt auf https://facebook.com (target="_blank", rel="noopener"); Klick öffnet Facebook in neuem Tab |
| navbar-socialicons.spec.ts | Navbar: Social-Icon Instagram öffnet in neuem Tab | Link führt auf https://instagram.com (target="_blank", rel="noopener"); Klick öffnet Instagram in neuem Tab |
| navbar-socialicons.spec.ts | Navbar: Social-Icon TikTok öffnet in neuem Tab | Link führt auf https://tiktok.com (target="_blank", rel="noopener"); Klick öffnet TikTok in neuem Tab |
| navbar.spec.ts | Navbar: Leistungen korrekt verlinkt | Link führt auf #leistungen; nach dem Klick endet die URL auf #leistungen und der Abschnitt ist im sichtbaren Bereich |
| navbar.spec.ts | Navbar: Nachhaltigkeit korrekt verlinkt | Link führt auf #nachhaltigkeit; nach dem Klick endet die URL auf #nachhaltigkeit und der Abschnitt ist im sichtbaren Bereich |
| navbar.spec.ts | Navbar: Galerie korrekt verlinkt | Link führt auf #galerie; nach dem Klick endet die URL auf #galerie und der Abschnitt ist im sichtbaren Bereich |
| navbar.spec.ts | Navbar: Kontakt korrekt verlinkt | Link führt auf #kontakt; nach dem Klick endet die URL auf #kontakt und der Abschnitt ist im sichtbaren Bereich |
| navbar.spec.ts | Navbar: Logo führt zum Seitenanfang | Link führt auf #; nach dem Klick endet die URL auf # und die Seite steht wieder ganz oben |
| reviews.spec.ts | Bewertungen: Zeitangabe 0 Monat(e) nach der Bewertung | Neben den Sternen steht „diesen Monat“ |
| reviews.spec.ts | Bewertungen: Zeitangabe 1 Monat(e) nach der Bewertung | Neben den Sternen steht „vor 1 Monat“ |
| reviews.spec.ts | Bewertungen: Zeitangabe 11 Monat(e) nach der Bewertung | Neben den Sternen steht „vor 11 Monaten“ |
| reviews.spec.ts | Bewertungen: Zeitangabe 12 Monat(e) nach der Bewertung | Neben den Sternen steht „vor 1 Jahr“ |
| reviews.spec.ts | Bewertungen: Zeitangabe 24 Monat(e) nach der Bewertung | Neben den Sternen steht „vor 2 Jahren“ |
| reviews.spec.ts | Bewertungen: Pfeile vor/zurück wechseln die Bewertung | „Weiter“ zeigt eine andere Bewertung, „zurück“ wieder die vorherige |
| reviews.spec.ts | Bewertungen: Endlos-Schleife in beide Richtungen | Jede Bewertung erscheint genau einmal, danach wieder die erste; „zurück“ von der ersten Bewertung zeigt die letzte; dabei ist immer genau der Punkt an der Position der Bewertung aktiv |
| reviews.spec.ts | Bewertungen: Wechsel automatisch im eingestellten Takt | Bewertung bleibt bis kurz vor Ablauf des im Code eingestellten Takts stehen und wechselt danach automatisch |
| reviews.spec.ts | Bewertungen: Inhalt › jede Bewertung hat Name, 1–5 Sterne, Text ab 50 Zeichen und gültiges Datum | Jede Bewertung hat einen Namen, 1–5 Sterne, einen Text ab 50 Zeichen und ein Datum im Format JJJJ-MM, das nicht in der Zukunft liegt |
| reviews.spec.ts | Bewertungen: Inhalt › kein Name kommt doppelt vor | Jeder Name steht nur einmal auf der Seite |
| reviews.spec.ts | Bewertungen bei 320 px (Smartphone klein) › kein Inhalt einer Karte wird abgeschnitten | Name, Sterne und Text jeder Bewertung liegen vollständig innerhalb der Karte |
| reviews.spec.ts | Bewertungen bei 821 px (erste Desktop-Breite) › kein Inhalt einer Karte wird abgeschnitten | Name, Sterne und Text jeder Bewertung liegen vollständig innerhalb der Karte |
| seo.spec.ts | SEO: Meta-Description ist vorhanden und passend lang | Es gibt genau eine Meta-Description mit 50–160 Zeichen |
| seo.spec.ts | SEO: Seitensprache ist Deutsch | Das &lt;html>-Element hat lang="de" |
| seo.spec.ts | SEO: genau eine Hauptüberschrift (h1) | Die Seite hat genau eine h1, sie ist sichtbar und hat Text |
| seo.spec.ts | SEO: Unternehmens-Schema ist vollständig und passt zur Adresse im Footer | SEO-Schema AutoRepair enthält Name, URL, Telefon und vollständige Adresse; Straße, PLZ, Ort und Telefonnummer stehen so auch im Footer |
| seo.spec.ts | SEO: Google Fonts werden mit font-display: swap eingebunden | Jeder Google-Fonts-Link enthält display=swap, jede eigene @font-face-Regel font-display: swap |
| seo.spec.ts | SEO: FAQ-Schema und FAQ auf der Seite sind gleich | Anzahl, Fragen und Antworten der FAQ auf der Seite stimmen mit dem SEO-Schema (FAQPage) überein |
| seo.spec.ts | SEO: alle &lt;img>-Bilder haben einen Alt-Text | Jedes &lt;img> hat ein alt-Attribut; ein leerer Alt-Text steht nur bei dekorativen Bildern (aria-hidden="true") |
| services.spec.ts | Leistungen: Klick auf eine Leistung zeigt ihr Panel mit Text und Hintergrundbild | Nach jedem Klick ist der Tab aktiv und nur sein Panel sichtbar, mit Text und Hintergrundbild |
| services.spec.ts | Leistungen: jede Leistung hat einen eigenen Text | Kein Text steht bei mehr als einer Leistung |
| services.spec.ts | Leistungen: jede Leistung hat ein eigenes Hintergrundbild | Kein Hintergrundbild wird bei mehr als einer Leistung verwendet |
