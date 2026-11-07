import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import { expectedResult } from './helpers/expectedResultInTestcase';

// Tests für Formular im Overlay "Schaden checken"

// ─── Gültige Beispiel-Werte für jedes Eingabefeld ────────────────────────
const GUELTIGE_EINGABEN = {
    vorname: 'Karlie',
    nachname: 'Kunde',
    telefon: '+49 176 12345678',
    mail: 'karlie@beispiel.de',
    strasse: 'Musterstraße 1',
    plz: '82223',
    ort: 'Eichenau',
    mitteilung: 'Delle in der Fahrertür nach einem Parkrempler.',
    upload: { name: 'delle.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('Testbild') },
};

const GUELTIGE_EINGABEN_OVERRIDE = {
    vorname: 'Maxi',
    nachname: 'Muster',
    telefon: '+43 676 987654',
    mail: 'maxi@muster.de',
    strasse: 'Wiener Straße 12a',
    plz: '1234',
    ort: 'Graz',
    mitteilung: 'Kratzer an der Beifahrertür',
    upload: { name: 'schaden.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('Testbild') },
};

// Eingabefeld-IDs im HTML
const EINGABEFELD_ID = {
    vorname: 'sf-vorname',
    nachname: 'sf-name',
    telefon: 'sf-telefon',
    mail: 'sf-mail',
    strasse: 'sf-strasse',
    plz: 'sf-plz',
    ort: 'sf-ort',
    mitteilung: 'sf-mitteilung',
    upload: 'sf-upload',
};

type Eingabefeld = keyof typeof EINGABEFELD_ID;

const PFLICHTFELDER: Eingabefeld[] = ['vorname', 'nachname', 'telefon'];
const ALLE_EINGABEFELDER = Object.keys(EINGABEFELD_ID) as Eingabefeld[];

// ─── Fehlermeldungen (wörtlich aus index.html, RULES) ────────────────────────
const FEHLERMELDUNG = {
    // Vorname und Nachname (gemeinsame Regel nameRule)
    name: {
        vornameLeer: 'Bitte geben Sie Ihren Vornamen ein.',
        nachnameLeer: 'Bitte geben Sie Ihren Nachnamen ein.',
        zuKurz: 'Bitte mindestens 2 Zeichen eingeben.',
        zuLang: 'Bitte höchstens 50 Zeichen eingeben.',
        ungueltigeZeichen: 'Nur Buchstaben, Leerzeichen, Bindestrich und Apostroph sind erlaubt.',
        trennzeichenFalsch: 'Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.',
    },
    telefon: {
        leer: 'Bitte geben Sie Ihre Telefonnummer ein.',
        ungueltigeZeichen: 'Nur Ziffern, Leerzeichen und + - / ( ) sind erlaubt.',
        plusNichtAmAnfang: 'Das + ist nur ganz am Anfang erlaubt.',
        ohneVorwahl: 'Bitte mit Vorwahl eingeben (beginnend mit 0 oder +).',
        zuKurz: 'Die Nummer ist zu kurz.',
        zuLang: 'Die Nummer ist zu lang (höchstens 15 Ziffern).',
    },
    mail: {
        zuLang: 'Bitte höchstens 254 Zeichen eingeben.',
        ungueltig: 'Bitte eine gültige E-Mail-Adresse eingeben, z. B. name@beispiel.de.',
    },
    strasse: {
        ungueltigeZeichen: 'Nur Buchstaben, Ziffern, Leerzeichen und . - / sind erlaubt.',
    },
    plz: {
        ungueltigeLaenge: 'Bitte 4 oder 5 Ziffern eingeben.',
    },
    ort: {
        zuKurz: 'Bitte mindestens 2 Zeichen eingeben.',
        ungueltigeZeichen: "Nur Buchstaben, Leerzeichen und . - ' ( ) sind erlaubt.",
        erstesZeichenKeinBuchstabe: 'Der Ort muss mit einem Buchstaben beginnen.',
    },
    mitteilung: {
        zuLang: 'Bitte höchstens 1000 Zeichen eingeben.',
    },
    upload: {
        zuVieleDateien: 'Bitte höchstens 10 Dateien auswählen.',
        keinBildOderVideo: (dateiname: string) => `„${dateiname}“ ist kein Bild oder Video.`,
        dateiZuGross: (dateiname: string) => `„${dateiname}“ ist größer als 20 MB.`,
        gesamtZuGross: 'Alle Dateien zusammen dürfen höchstens 50 MB groß sein.',
    },
};

// ─── Hilfsfunktionen ────────────────────────────────────────────

const eingabe = (page: Page, feld: Eingabefeld) => page.locator(`#${EINGABEFELD_ID[feld]}`);
const meldung = (page: Page, feld: Eingabefeld) => page.locator(`#${EINGABEFELD_ID[feld]}-error`);

async function oeffneSchadenFormular(page: Page) {
    await page.goto('/');
    await page.locator('.cta-float').getByRole('button', { name: 'Schaden checken' }).click();
    await expect(page.locator('#schadenModal'), 'Schaden-Formular ist sichtbar').toHaveClass(/is-open/);
}

type Eingabewerte = typeof GUELTIGE_EINGABEN;

async function werteEingeben(page: Page, felder: Eingabefeld[], abweichendeWerte: Partial<Eingabewerte> = {}) {
    // Standardwerte mit den abweichenden Werten überschreiben
    const werte = { ...GUELTIGE_EINGABEN, ...abweichendeWerte };

    for (const feld of felder) {
        if (feld === 'upload') {
            await eingabe(page, feld).setInputFiles(werte.upload);
        } else {
            await eingabe(page, feld).fill(werte[feld]);
        }
    }
}

async function absenden(page: Page) {
    await page.getByRole('button', { name: 'Anfrage absenden' }).click();
}

type Testschritt = {
    name: string;
    eingabewerte: Eingabefeld[];
    werte?: Partial<Eingabewerte>;   // abweichende Werte, sonst GUELTIGE_EINGABEN
    cursorIn?: Eingabefeld;
};

async function pruefungFehlerhafteEingaben(page: Page, fehlendePflichtfelder: Eingabefeld[], cursorIn?: Eingabefeld) {
    //Abbruch bei fehlendem Pflichtfeld ohne Cursor-Positions-Angabe
    if (!cursorIn) throw new Error('Testschritt ohne cursorIn, obwohl Pflichtfelder fehlen');
    // Meldung nur bei den leeren Pflichtfeldern, bei allen anderen Feldern kein Hinweis
    await test.step(`Meldungen und Cursor-Position korrekt`, async () => {
        for (const feld of ALLE_EINGABEFELDER) {
            if (fehlendePflichtfelder.includes(feld)) {
                await expect(meldung(page, feld), `Meldung bei "${feld}"`).not.toBeEmpty();
            } else {
                await expect(meldung(page, feld), `keine Meldung bei "${feld}"`).toBeEmpty();
            }
        }
        await expect(eingabe(page, cursorIn), 'Cursor im ersten fehlenden Pflichtfeld').toBeFocused();
    });
    await expect(page.locator('#schadenSuccess'), 'Danke-Ansicht wird nicht angezeigt').toBeHidden();
    await expect(page.locator('#schadenModal'), 'Schaden-Formular bleibt geöffnet').toHaveClass(/is-open/);
}

async function pruefungErfolgreicheEingaben(page: Page, vorname = GUELTIGE_EINGABEN.vorname) {
    const dankeAnsicht = page.locator('#schadenSuccess');
    await expect(dankeAnsicht, 'Anzeige der Danke-Ansicht').toBeVisible();
    await expect(dankeAnsicht.getByRole('heading'), `Vorname in der Danke-Ansicht: "${vorname}"`).toHaveText(`Danke für Ihre Anfrage, ${vorname}!`);
    await expect(page.locator('#schadenForm'), 'Schaden-Formular ist nicht mehr sichtbar').toBeHidden();
}

async function szenarioDurchspielen(page: Page, schritte: Testschritt[]) {
    await oeffneSchadenFormular(page);
    let fehlendePflichtfelder = PFLICHTFELDER;
    let vorname = GUELTIGE_EINGABEN.vorname;

    for (const schritt of schritte) {
        await test.step(`${schritt.name} eingeben`, async () => {
            fehlendePflichtfelder = fehlendePflichtfelder.filter(feld => !schritt.eingabewerte.includes(feld));
            // zuletzt eingegebenen Vornamen merken, er muss in der Danke-Ansicht stehen
            if (schritt.eingabewerte.includes('vorname')) {
                vorname = schritt.werte?.vorname ?? GUELTIGE_EINGABEN.vorname;
            }
            await werteEingeben(page, schritt.eingabewerte, schritt.werte);
        });
        await absenden(page);

        if (fehlendePflichtfelder.length === 0) {
            await pruefungErfolgreicheEingaben(page, vorname);
        } else {
            await pruefungFehlerhafteEingaben(page, fehlendePflichtfelder, schritt.cursorIn);
        }
    }
}

function validierungsTests(testfaelle: Validierungstest[], eingabeFeld: Eingabefeld) {
    for (const testfall of testfaelle) {
        const textErwartetesErgebnis = testfall.fehlermeldung
            ? `Meldung „${testfall.fehlermeldung}“, Feld rot markiert`
            : 'keine Meldung, Feld nicht rot markiert';

        test(`${eingabeFeld}: ${testfall.beschreibung}`,
            { ...expectedResult(textErwartetesErgebnis), tag: testfall.fehlermeldung ? '@negativtest' : '@positivtest' },
            async ({ page }) => {
                await oeffneSchadenFormular(page);
                await eingabe(page, eingabeFeld).fill(testfall.eingabe);
                await eingabe(page, eingabeFeld).blur();   // Feld verlassen, Seite prüft jetzt

                if (testfall.fehlermeldung) {
                    const fehlermeldung = testfall.fehlermeldung;
                    await test.step('Fehlermeldung und rote Markierung', async () => {
                        await expect(meldung(page, eingabeFeld), 'Meldung unter dem Feld').toHaveText(fehlermeldung);
                        await expect(eingabe(page, eingabeFeld), 'Feld rot markiert').toHaveClass(/is-invalid/);
                    });
                } else {
                    await test.step('kein Hinweis und keine rote Markierung', async () => {
                        await expect(meldung(page, eingabeFeld), 'keine Meldung').toBeEmpty();
                        await expect(eingabe(page, eingabeFeld), 'Feld nicht rot markiert').not.toHaveClass(/is-invalid/);
                    });
                }
                if (testfall.erwarteterWert !== undefined) {
                    await expect(eingabe(page, eingabeFeld), 'Wert im Feld korrekt ersetzt').toHaveValue(testfall.erwarteterWert);
                }
            });
    }
}

function validierungsTestsMitKorrektur(testfallNegativ: Validierungstest, testfallPositiv: Validierungstest, eingabeFeld: Eingabefeld) {

test(`${eingabeFeld}: „${testfallNegativ.eingabe}“ korrigiert zu „${testfallPositiv.eingabe}“`,
        expectedResult('Falscher Wert wird überschrieben, Meldung und rote Markierung verschwinden.'), async ({ page }) => {
            const fehlermeldung = testfallNegativ.fehlermeldung;
            if (!fehlermeldung) throw new Error('testfallNegativ braucht eine fehlermeldung');

            await oeffneSchadenFormular(page);
            await eingabe(page, eingabeFeld).fill(testfallNegativ.eingabe);
            await eingabe(page, eingabeFeld).blur();

            await test.step('Fehlermeldung und rote Markierung', async () => {
                await expect(meldung(page, eingabeFeld), 'Meldung unter dem Feld').toHaveText(fehlermeldung);
                await expect(eingabe(page, eingabeFeld), 'Feld rot markiert').toHaveClass(/is-invalid/);
            });
            await eingabe(page, eingabeFeld).fill(testfallPositiv.eingabe);
            await test.step('kein Hinweis und keine rote Markierung', async () => {
                await expect(meldung(page, eingabeFeld), 'keine Meldung').toBeEmpty();
                await expect(eingabe(page, eingabeFeld), 'Feld nicht rot markiert').not.toHaveClass(/is-invalid/);
            });
        });
}

// ─── TestsetA: verschiedene Kombinationen mit Pflichtfeldern ──────────────────────────────
test.describe('Schaden-Formular: verschiedene Kombinationen der Pflichtfelder', () => {
    const testfaelleA: Testschritt[] = [
        { name: 'keine Feld', eingabewerte: [], cursorIn: 'vorname' },
        { name: 'nur Vorname', eingabewerte: ['vorname'], cursorIn: 'nachname' },
        { name: 'nur Nachname', eingabewerte: ['nachname'], cursorIn: 'vorname' },
        { name: 'nur Telefon', eingabewerte: ['telefon'], cursorIn: 'vorname' },
        { name: 'Vorname + Nachname', eingabewerte: ['vorname', 'nachname'], cursorIn: 'telefon' },
        { name: 'Vorname + Telefon', eingabewerte: ['vorname', 'telefon'], cursorIn: 'nachname' },
        { name: 'Nachname + Telefon', eingabewerte: ['nachname', 'telefon'], cursorIn: 'vorname' },
        { name: 'alles außer Pflichtfelder', eingabewerte: ALLE_EINGABEFELDER.filter(feld => !PFLICHTFELDER.includes(feld)), cursorIn: 'vorname' },
        { name: 'alle Pflichtfelder', eingabewerte: PFLICHTFELDER },
        { name: 'alle Eingabefelder', eingabewerte: ALLE_EINGABEFELDER },
    ];
    for (const testfall of testfaelleA) {
        const fehlendePflichtfelder = PFLICHTFELDER.filter(pflichtfeld => !testfall.eingabewerte.includes(pflichtfeld));
        // Erwartetes Ergebnis aus Tabelle zusammensetzen, sind alle Pflichtfelder vorhanden?
        const textErwartetesErgebnis = fehlendePflichtfelder.length === 0
            ? `Anfrage wird abgeschickt, Danke-Ansicht mit Vornamen erscheint`
            : `${fehlendePflichtfelder.length} Meldung(en) bei ${fehlendePflichtfelder.join(', ')}; Cursor im Feld „${testfall.cursorIn}“`;

        test(`${testfall.name} gültig ausgefüllt, dann absenden`, expectedResult(textErwartetesErgebnis), async ({ page }) => {
            await szenarioDurchspielen(page, [testfall]);
        });
    }
});

// ─── TestsetB: fehlende Pflichtfelder ergänzen ──────────────────────────────
test.describe('Schaden-Formular: fehlende Pflichtfelder/andere Eingaben ergänzen', () => {
    // ─── TestsetB1: erst Vorname, dann Nachname, dann Telefon ergänzen ──────────────────────────────
    test(`Vorname gültig, dann absenden, dann gültigen Nachnamen ergänzen, absenden, dann gültiges Telefon ergänzen`, expectedResult(`Nach dem ersten und zweiten Absenden erscheint ein Fehler, Eingaben können ergänzt und beim dritten Mal erfolgreich abgesendet werden`), async ({ page }) => {
        await szenarioDurchspielen(page, [
            { name: 'Vorname', eingabewerte: ['vorname'], cursorIn: 'nachname' },
            { name: 'Nachname', eingabewerte: ['nachname'], cursorIn: 'telefon' },
            { name: 'Telefon', eingabewerte: ['telefon'] },
        ]);
    });

    // ─── TestsetB2: Vorname + Nachname, dann alle anderen Werte ergänzen
    test(`Vorname + Nachname gültig, dann absenden, dann alle anderen Eingaben ergänzen`, expectedResult(`Nach dem ersten Absenden erscheint ein Fehler, Eingaben können dann ergänzt und erfolgreich abgesendet werden`), async ({ page }) => {
        await szenarioDurchspielen(page, [
            { name: 'Vorname + Nachname', eingabewerte: ['vorname', 'nachname'], cursorIn: 'telefon' },
            { name: 'alle weiteren Felder', eingabewerte: ALLE_EINGABEFELDER.filter(feld => feld !== 'vorname' && feld !== 'nachname') },
        ]);
    });

});

// ─── TestsetC: Werte überschreiben  ──────────────────────────────
test.describe('Schaden-Formular: Werte überschreiben', () => {
    // ─── TestsetC1: Werte nach NICHT erfolgreicher Übernahme überschreiben ──────────────────────────────
    test(`Werte nach nicht erfolgreicher Übernahme überschreiben`, expectedResult(`Werte können nach NICHT erfolgreichem Absenden überschrieben werden, neuer Vorname erscheint in der Danke-Ansicht`), async ({ page }) => {
        await szenarioDurchspielen(page, [
            { name: 'Vorname + Nachname', eingabewerte: ['vorname', 'nachname'], cursorIn: 'telefon' },
            { name: 'alle Werte neu', eingabewerte: ALLE_EINGABEFELDER, werte: GUELTIGE_EINGABEN_OVERRIDE },
        ]);
    });

    // ─── TestsetC2: Werte vor Absenden überschreiben ──────────────────────────────
    test(`Werte vor Absenden überschreiben`, expectedResult(`Werte können vor dem Absenden überschrieben werden, neuer Vorname erscheint in der Danke-Ansicht`), async ({ page }) => {
        await oeffneSchadenFormular(page);
        await werteEingeben(page, ALLE_EINGABEFELDER);
        await werteEingeben(page, ALLE_EINGABEFELDER, GUELTIGE_EINGABEN_OVERRIDE);
        await absenden(page);
        await pruefungErfolgreicheEingaben(page, GUELTIGE_EINGABEN_OVERRIDE.vorname);
    });
})

// ─── TestsetD: Validierung Eingabefelder ──────────────────────────────

type Validierungstest = {
    beschreibung: string;
    eingabe: string;
    fehlermeldung?: string;
    erwarteterWert?: string;      // nur angeben, wenn die Seite den Wert verändert
};

// ─── TestsetD1: Vorname ──────────────────────────────
const VORNAME_TESTS: Validierungstest[] = [
    // POSITIVTESTS
    { beschreibung: 'genau 2 Zeichen', eingabe: 'Al' },
    { beschreibung: 'genau 50 Zeichen', eingabe: 'A'.repeat(50) },
    { beschreibung: 'Umlaute', eingabe: 'Jürgen' },
    { beschreibung: 'Akzente', eingabe: 'Zoë' },
    { beschreibung: 'andere Schrift', eingabe: 'Иван' },
    { beschreibung: 'Bindestrich zwischen Buchstaben', eingabe: 'Anne-Marie' },
    { beschreibung: 'Leerzeichen zwischen Buchstaben', eingabe: 'Mary Ann' },
    { beschreibung: 'Apostroph', eingabe: "D'Angelo" },
    { beschreibung: 'typografischer Apostroph', eingabe: 'D’Angelo' },
    { beschreibung: 'Leerzeichen außen werden entfernt', eingabe: '  Anna  ', erwarteterWert: 'Anna' },
    { beschreibung: '51 Zeichen werden abgeschnitten', eingabe: 'A'.repeat(51), erwarteterWert: 'A'.repeat(50) },

    // NEGATIVTESTS
    { beschreibung: 'nur Leerzeichen', eingabe: '   ', fehlermeldung: FEHLERMELDUNG.name.vornameLeer },
    { beschreibung: '1 Zeichen', eingabe: 'A', fehlermeldung: FEHLERMELDUNG.name.zuKurz },
    { beschreibung: 'Ziffer', eingabe: 'Anna1', fehlermeldung: FEHLERMELDUNG.name.ungueltigeZeichen },
    { beschreibung: 'Sonderzeichen', eingabe: 'Anna!', fehlermeldung: FEHLERMELDUNG.name.ungueltigeZeichen },
    { beschreibung: 'Bindestrich am Anfang', eingabe: '-Anna', fehlermeldung: FEHLERMELDUNG.name.trennzeichenFalsch },
    { beschreibung: 'Bindestrich am Ende', eingabe: 'Anna-', fehlermeldung: FEHLERMELDUNG.name.trennzeichenFalsch },
    { beschreibung: 'doppelter Bindestrich', eingabe: 'Anna--Lena', fehlermeldung: FEHLERMELDUNG.name.trennzeichenFalsch },
    { beschreibung: 'doppeltes Leerzeichen innen', eingabe: 'Anna  Lena', fehlermeldung: FEHLERMELDUNG.name.trennzeichenFalsch },
];

test.describe('Schaden-Formular: Validierung Vorname', { tag: '@validierung-vorname' }, () => {
    validierungsTests(VORNAME_TESTS, 'vorname');
    validierungsTestsMitKorrektur(VORNAME_TESTS[13], VORNAME_TESTS[3], 'vorname');
});

// ─── TestsetD2: Nachname ──────────────────────────────
const NACHNAME_TESTS: Validierungstest[] = [
    // POSITIVTESTS
    { beschreibung: 'genau 2 Zeichen', eingabe: 'Li' },
    { beschreibung: 'genau 50 Zeichen', eingabe: 'B'.repeat(50) },
    { beschreibung: 'Umlaute', eingabe: 'Müller' },
    { beschreibung: 'Akzente', eingabe: 'Brontë' },
    { beschreibung: 'andere Schrift', eingabe: 'Иванов' },
    { beschreibung: 'Bindestrich zwischen Buchstaben', eingabe: 'Müller-Lüdenscheidt' },
    { beschreibung: 'Leerzeichen zwischen Buchstaben', eingabe: 'von Bülow' },
    { beschreibung: 'Apostroph', eingabe: "O'Brien" },
    { beschreibung: 'typografischer Apostroph', eingabe: 'O’Brien' },
    { beschreibung: 'Leerzeichen außen werden entfernt', eingabe: '  Kunde  ', erwarteterWert: 'Kunde' },
    { beschreibung: '51 Zeichen werden abgeschnitten', eingabe: 'B'.repeat(51), erwarteterWert: 'B'.repeat(50) },

    // NEGATIVTESTS
    { beschreibung: 'nur Leerzeichen', eingabe: '   ', fehlermeldung: FEHLERMELDUNG.name.nachnameLeer },
    { beschreibung: '1 Zeichen', eingabe: 'B', fehlermeldung: FEHLERMELDUNG.name.zuKurz },
    { beschreibung: 'Ziffer', eingabe: 'Kunde1', fehlermeldung: FEHLERMELDUNG.name.ungueltigeZeichen },
    { beschreibung: 'Sonderzeichen', eingabe: 'Kunde&Co', fehlermeldung: FEHLERMELDUNG.name.ungueltigeZeichen },
    { beschreibung: 'Bindestrich am Anfang', eingabe: '-Kunde', fehlermeldung: FEHLERMELDUNG.name.trennzeichenFalsch },
    { beschreibung: 'Bindestrich am Ende', eingabe: 'Kunde-', fehlermeldung: FEHLERMELDUNG.name.trennzeichenFalsch },
    { beschreibung: 'doppelter Bindestrich', eingabe: 'Müller--Lüdenscheidt', fehlermeldung: FEHLERMELDUNG.name.trennzeichenFalsch },
    { beschreibung: 'doppeltes Leerzeichen innen', eingabe: 'von  Bülow', fehlermeldung: FEHLERMELDUNG.name.trennzeichenFalsch },
];

test.describe('Schaden-Formular: Validierung Nachname', { tag: '@validierung-nachname' }, () => {
    validierungsTests(NACHNAME_TESTS, 'nachname');
});

// ─── TestsetD3: Telefon ──────────────────────────────
const TELEFON_TESTS: Validierungstest[] = [
    // POSITIVTESTS
    { beschreibung: 'Mobilnummer mit +49', eingabe: '+49 176 12345678' },
    { beschreibung: 'Mobilnummer mit 0', eingabe: '0176 12345678' },
    { beschreibung: 'Schrägstrich', eingabe: '089/123456' },
    { beschreibung: 'Bindestrich', eingabe: '0176-12345678' },
    { beschreibung: 'Vorwahl in Klammern', eingabe: '(089) 123456' },
    { beschreibung: '+49 mit (0)', eingabe: '+49 (0)89 123456' },
    { beschreibung: 'genau 6 Ziffern', eingabe: '012345' },
    { beschreibung: 'genau 15 Ziffern', eingabe: '0' + '1'.repeat(14) },
    { beschreibung: 'Leerzeichen außen werden entfernt', eingabe: '  0176 123456  ', erwarteterWert: '0176 123456' },

    // NEGATIVTESTS
    { beschreibung: 'nur Leerzeichen', eingabe: '   ', fehlermeldung: FEHLERMELDUNG.telefon.leer },
    { beschreibung: 'Buchstaben', eingabe: '0176 abc', fehlermeldung: FEHLERMELDUNG.telefon.ungueltigeZeichen },
    { beschreibung: 'Punkt', eingabe: '089.123456', fehlermeldung: FEHLERMELDUNG.telefon.ungueltigeZeichen },
    { beschreibung: '+ in der Mitte', eingabe: '0176+123456', fehlermeldung: FEHLERMELDUNG.telefon.plusNichtAmAnfang },
    { beschreibung: 'doppeltes +', eingabe: '++49 176 123456', fehlermeldung: FEHLERMELDUNG.telefon.plusNichtAmAnfang },
    { beschreibung: 'ohne Vorwahl', eingabe: '176 123456', fehlermeldung: FEHLERMELDUNG.telefon.ohneVorwahl },
    { beschreibung: '5 Ziffern', eingabe: '01234', fehlermeldung: FEHLERMELDUNG.telefon.zuKurz },
    { beschreibung: '16 Ziffern', eingabe: '0' + '1'.repeat(15), fehlermeldung: FEHLERMELDUNG.telefon.zuLang },
];

test.describe('Schaden-Formular: Validierung Telefon', { tag: '@validierung-telefon' }, () => {
    validierungsTests(TELEFON_TESTS, 'telefon');
});

// ─── TestsetD4: E-Mail ──────────────────────────────
const MAIL_TESTS: Validierungstest[] = [
    // POSITIVTESTS
    { beschreibung: 'leer (optionales Feld)', eingabe: '' },
    { beschreibung: 'einfache Adresse', eingabe: 'name@beispiel.de' },
    { beschreibung: 'Punkt, Plus und Subdomain', eingabe: 'vor.name+info@mail.beispiel.de' },
    { beschreibung: 'kürzeste Endung (2 Zeichen)', eingabe: 'a@b.co' },
    { beschreibung: 'Großbuchstaben', eingabe: 'NAME@BEISPIEL.DE' },
    { beschreibung: 'genau 254 Zeichen', eingabe: 'a'.repeat(242) + '@beispiel.de' },
    { beschreibung: 'Leerzeichen außen werden entfernt', eingabe: '  name@beispiel.de  ', erwarteterWert: 'name@beispiel.de' },

    // NEGATIVTESTS
    { beschreibung: 'ohne @', eingabe: 'name', fehlermeldung: FEHLERMELDUNG.mail.ungueltig },
    { beschreibung: 'ohne Endung', eingabe: 'name@beispiel', fehlermeldung: FEHLERMELDUNG.mail.ungueltig },
    { beschreibung: 'Endung nur 1 Zeichen', eingabe: 'name@beispiel.d', fehlermeldung: FEHLERMELDUNG.mail.ungueltig },
    { beschreibung: 'ohne Namen vor @', eingabe: '@beispiel.de', fehlermeldung: FEHLERMELDUNG.mail.ungueltig },
    { beschreibung: 'doppeltes @', eingabe: 'name@@beispiel.de', fehlermeldung: FEHLERMELDUNG.mail.ungueltig },
    { beschreibung: 'Leerzeichen innen', eingabe: 'na me@beispiel.de', fehlermeldung: FEHLERMELDUNG.mail.ungueltig },
];

test.describe('Schaden-Formular: Validierung E-Mail', { tag: '@validierung-mail' }, () => {
    validierungsTests(MAIL_TESTS, 'mail');
});

// ─── TestsetD5: Straße ──────────────────────────────
const STRASSE_TESTS: Validierungstest[] = [
    // POSITIVTESTS
    { beschreibung: 'leer (optionales Feld)', eingabe: '' },
    { beschreibung: 'nur Leerzeichen werden entfernt', eingabe: '   ', erwarteterWert: '' },
    { beschreibung: 'Straße mit Hausnummer', eingabe: 'Musterstraße 1' },
    { beschreibung: 'Abkürzung mit Punkt und Buchstabe an Hausnummer', eingabe: 'Hauptstr. 12a' },
    { beschreibung: 'Schrägstrich', eingabe: 'Am Anger 3/1' },
    { beschreibung: 'Bindestriche', eingabe: 'Karl-Marx-Allee 5' },
    { beschreibung: 'genau 100 Zeichen', eingabe: 'a'.repeat(100) },
    { beschreibung: '101 Zeichen werden abgeschnitten', eingabe: 'a'.repeat(101), erwarteterWert: 'a'.repeat(100) },
    { beschreibung: 'Leerzeichen außen werden entfernt', eingabe: '  Musterstraße 1  ', erwarteterWert: 'Musterstraße 1' },

    // NEGATIVTESTS
    { beschreibung: 'Komma', eingabe: 'Musterstraße 1, 2. OG', fehlermeldung: FEHLERMELDUNG.strasse.ungueltigeZeichen },
    { beschreibung: 'Raute', eingabe: 'Weg #5', fehlermeldung: FEHLERMELDUNG.strasse.ungueltigeZeichen },
    { beschreibung: 'Klammern', eingabe: 'Hauptstr. 1 (Hinterhaus)', fehlermeldung: FEHLERMELDUNG.strasse.ungueltigeZeichen },
    { beschreibung: 'Apostroph', eingabe: "Rue de l'Église 3", fehlermeldung: FEHLERMELDUNG.strasse.ungueltigeZeichen },
];

test.describe('Schaden-Formular: Validierung Straße', { tag: '@validierung-strasse' }, () => {
    validierungsTests(STRASSE_TESTS, 'strasse');
});

// ─── TestsetD6: PLZ ──────────────────────────────
const PLZ_TESTS: Validierungstest[] = [
    // POSITIVTESTS
    { beschreibung: 'leer (optionales Feld)', eingabe: '' },
    { beschreibung: '5 Ziffern (Deutschland)', eingabe: '82223' },
    { beschreibung: '4 Ziffern (Österreich, Schweiz)', eingabe: '1234' },
    { beschreibung: 'führende Null', eingabe: '01067' },
    { beschreibung: '6 Ziffern werden abgeschnitten', eingabe: '822231', erwarteterWert: '82223' },

    // NEGATIVTESTS
    { beschreibung: '3 Ziffern', eingabe: '123', fehlermeldung: FEHLERMELDUNG.plz.ungueltigeLaenge },
    { beschreibung: 'Buchstabe', eingabe: '8222a', fehlermeldung: FEHLERMELDUNG.plz.ungueltigeLaenge },
    { beschreibung: 'Leerzeichen innen', eingabe: '82 23', fehlermeldung: FEHLERMELDUNG.plz.ungueltigeLaenge },
    { beschreibung: 'Minuszeichen', eingabe: '-8222', fehlermeldung: FEHLERMELDUNG.plz.ungueltigeLaenge },
];

test.describe('Schaden-Formular: Validierung PLZ', { tag: '@validierung-plz' }, () => {
    validierungsTests(PLZ_TESTS, 'plz');
});

// ─── TestsetD7: Ort ──────────────────────────────
const ORT_TESTS: Validierungstest[] = [
    // POSITIVTESTS
    { beschreibung: 'leer (optionales Feld)', eingabe: '' },
    { beschreibung: 'nur Leerzeichen werden entfernt', eingabe: '   ', erwarteterWert: '' },
    { beschreibung: 'genau 2 Zeichen', eingabe: 'Ob' },
    { beschreibung: 'Umlaute', eingabe: 'München' },
    { beschreibung: 'Bindestrich', eingabe: 'Garmisch-Partenkirchen' },
    { beschreibung: 'Klammern', eingabe: 'Halle (Salle)' },
    { beschreibung: 'Punkt', eingabe: 'St. Gallen' },
    { beschreibung: 'Apostroph', eingabe: "L'Aquila" },
    { beschreibung: 'typografischer Apostroph', eingabe: 'L’Aquila' },
    { beschreibung: 'genau 50 Zeichen', eingabe: 'O'.repeat(50) },
    { beschreibung: '51 Zeichen werden abgeschnitten', eingabe: 'O'.repeat(51), erwarteterWert: 'O'.repeat(50) },
    { beschreibung: 'Leerzeichen außen werden entfernt', eingabe: '  Graz  ', erwarteterWert: 'Graz' },

    // NEGATIVTESTS
    { beschreibung: '1 Zeichen', eingabe: 'A', fehlermeldung: FEHLERMELDUNG.ort.zuKurz },
    { beschreibung: 'Ziffer', eingabe: 'Eichenau 2', fehlermeldung: FEHLERMELDUNG.ort.ungueltigeZeichen },
    { beschreibung: 'Schrägstrich', eingabe: 'Eichenau/Obb', fehlermeldung: FEHLERMELDUNG.ort.ungueltigeZeichen },
    { beschreibung: 'Bindestrich am Anfang', eingabe: '-Eichenau', fehlermeldung: FEHLERMELDUNG.ort.erstesZeichenKeinBuchstabe },
    { beschreibung: 'Klammer am Anfang', eingabe: '(Oder)', fehlermeldung: FEHLERMELDUNG.ort.erstesZeichenKeinBuchstabe },
];

test.describe('Schaden-Formular: Validierung Ort', { tag: '@validierung-ort' }, () => {
    validierungsTests(ORT_TESTS, 'ort');
});

// ─── TestsetD8: Mitteilung ──────────────────────────────
// Nur Positivtests: Die einzige Regel (höchstens 1000 Zeichen) kann wegen maxlength="1000" nicht verletzt werden
const MITTEILUNG_TESTS: Validierungstest[] = [
    { beschreibung: 'leer (optionales Feld)', eingabe: '' },
    { beschreibung: 'kurzer Text', eingabe: 'Delle in der Fahrertür.' },
    { beschreibung: 'mehrere Zeilen', eingabe: 'Zeile 1\nZeile 2' },
    { beschreibung: 'Sonderzeichen und Emoji', eingabe: 'Delle <links> & rechts 🚗?!..."§$%&/()=' },
    { beschreibung: 'genau 1000 Zeichen', eingabe: 'x'.repeat(1000) },
    { beschreibung: '1001 Zeichen werden abgeschnitten', eingabe: 'x'.repeat(1001), erwarteterWert: 'x'.repeat(1000) },
    { beschreibung: 'Leerzeichen außen werden entfernt', eingabe: '  Delle  ', erwarteterWert: 'Delle' },
];

test.describe('Schaden-Formular: Validierung Mitteilung', { tag: '@validierung-mitteilung' }, () => {
    validierungsTests(MITTEILUNG_TESTS, 'mitteilung');
});

// ─── TestsetD9: Upload ──────────────────────────────
const MB = 1024 * 1024;

type Testdatei = { name: string; groesse?: number };   // Größe in Bytes, Standard 1 KB

type UploadValidierungstest = {
    beschreibung: string;
    dateien: Testdatei[];
    fehlermeldung?: string;
};

// erzeugt eine Liste von Bildern: bild1.jpg, bild2.jpg, …
const bilder = (anzahl: number): Testdatei[] => Array.from({ length: anzahl }, (_, i) => ({ name: `bild${i + 1}.jpg` }));

const UPLOAD_TESTS: UploadValidierungstest[] = [
    // POSITIVTESTS
    { beschreibung: 'ein JPG', dateien: [{ name: 'delle.jpg' }] },
    { beschreibung: 'ein PNG', dateien: [{ name: 'delle.png' }] },
    { beschreibung: 'ein Video', dateien: [{ name: 'delle.mp4' }] },
    { beschreibung: 'Bild und Video', dateien: [{ name: 'delle.jpg' }, { name: 'delle.mp4' }] },
    { beschreibung: 'genau 10 Dateien', dateien: bilder(10) },
    { beschreibung: 'Datei genau 20 MB', dateien: [{ name: 'gross.jpg', groesse: 20 * MB }] },
    { beschreibung: 'zusammen genau 50 MB', dateien: [{ name: 'a.jpg', groesse: 20 * MB }, { name: 'b.jpg', groesse: 20 * MB }, { name: 'c.jpg', groesse: 10 * MB }] },

    // NEGATIVTESTS
    { beschreibung: '11 Dateien', dateien: bilder(11), fehlermeldung: FEHLERMELDUNG.upload.zuVieleDateien },
    { beschreibung: 'PDF', dateien: [{ name: 'dokument.pdf' }], fehlermeldung: FEHLERMELDUNG.upload.keinBildOderVideo('dokument.pdf') },
    { beschreibung: 'Bild und PDF', dateien: [{ name: 'delle.jpg' }, { name: 'dokument.pdf' }], fehlermeldung: FEHLERMELDUNG.upload.keinBildOderVideo('dokument.pdf') },
    { beschreibung: 'Datei 20 MB + 1 Byte', dateien: [{ name: 'zu-gross.jpg', groesse: 20 * MB + 1 }], fehlermeldung: FEHLERMELDUNG.upload.dateiZuGross('zu-gross.jpg') },
    { beschreibung: 'Dateien zusammen 50 MB + 1 Byte', dateien: [{ name: 'a.jpg', groesse: 20 * MB }, { name: 'b.jpg', groesse: 20 * MB }, { name: 'c.jpg', groesse: 10 * MB + 1 }], fehlermeldung: FEHLERMELDUNG.upload.gesamtZuGross },
];

function uploadValidierungsTests(testfaelle: UploadValidierungstest[]) {
    for (const testfall of testfaelle) {
        const textErwartetesErgebnis = testfall.fehlermeldung
            ? `Meldung „${testfall.fehlermeldung}“, Upload-Bereich rot markiert`
            : 'keine Meldung, Upload-Bereich nicht rot markiert';

        test(`upload: ${testfall.beschreibung}`,
            { ...expectedResult(textErwartetesErgebnis), tag: testfall.fehlermeldung ? '@negativtest' : '@positivtest' },
            async ({ page }, testInfo) => {
                await oeffneSchadenFormular(page);

                // Testdateien im Ausgabeordner des Tests anlegen (der Browser erkennt den Typ an der Endung)
                fs.mkdirSync(testInfo.outputDir, { recursive: true });
                const pfade = testfall.dateien.map(datei => {
                    const pfad = testInfo.outputPath(datei.name);
                    fs.writeFileSync(pfad, Buffer.alloc(datei.groesse ?? 1024));
                    return pfad;
                });
                await eingabe(page, 'upload').setInputFiles(pfade);   // Seite prüft sofort nach der Auswahl

                const uploadBereich = page.locator('#sfUploadArea');
                if (testfall.fehlermeldung) {
                    const fehlermeldung = testfall.fehlermeldung;
                    await test.step('Fehlermeldung und rote Markierung', async () => {
                        await expect(meldung(page, 'upload'), 'Meldung unter dem Upload-Bereich').toHaveText(fehlermeldung);
                        await expect(uploadBereich, 'Upload-Bereich rot markiert').toHaveClass(/is-invalid/);
                    });
                } else {
                    await test.step('kein Hinweis und keine rote Markierung', async () => {
                        await expect(meldung(page, 'upload'), 'keine Meldung').toBeEmpty();
                        await expect(uploadBereich, 'Upload-Bereich nicht rot markiert').not.toHaveClass(/is-invalid/);
                    });
                }
            });
    }
}

test.describe('Schaden-Formular: Validierung Upload', { tag: '@validierung-upload' }, () => {
    uploadValidierungsTests(UPLOAD_TESTS);
});