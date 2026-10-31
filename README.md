# Portfolio – Uroš Petrović

## Struktura
```
index.html          – sajt
contact.php         – obrada kontakt forme (PHPMailer, SMTP)
config.php          – SMTP podešavanja  <-- OVDE UPIŠI LOZINKU
phpmailer/          – PHPMailer 6.9.3 biblioteka (već uključena, Composer nije potreban)
.htaccess           – blokira direktan pristup config.php i phpmailer/
assets/css|js|img|icons
assets/cv/          – ovde ubaci Uros_Petrovic_CV.pdf (dugmad "Download CV" vode na taj fajl)
```

## Podešavanje kontakt forme (Gmail)
1. Uključi 2-Step Verification: https://myaccount.google.com/security
2. Napravi App Password: https://myaccount.google.com/apppasswords
3. U `config.php` upiši tu lozinku (16 karaktera, bez razmaka) u `SMTP_PASS`.
4. Upload-uj sve fajlove na hosting koji ima PHP 7.4+ (preporuka 8.x).

Ako koristiš mejl sa hostinga (npr. kontakt@tvojdomen.rs):
`SMTP_HOST = mail.tvojdomen.rs`, `SMTP_PORT = 465`, `SMTP_SECURE = 'ssl'`,
`SMTP_USER`/`FROM_EMAIL` = taj mejl.

Ako poruka ne stiže, privremeno stavi `'DEBUG' => true` u config.php –
greška SMTP-a će se prikazati ispod forme. Posle vrati na `false`.

**Ne kači config.php sa pravom lozinkom na javni GitHub.**

## Šta forma radi
- AJAX slanje bez osvežavanja stranice + poruka o uspehu/grešci
- Validacija na klijentu i serveru
- Zaštita od spama: honeypot polje, minimalno vreme popunjavanja, limit 1 poruka / 60s
- Reply-To je mejl posetioca (klikneš "Reply" i odgovaraš direktno njemu)
- Automatski odgovor posetiocu (`AUTO_REPLY` u config.php)

## Lokalno testiranje
Forma ne radi ako otvoriš index.html dvoklikom – treba PHP server:
`php -S localhost:8000` u ovom folderu, pa otvori http://localhost:8000

## Veštine
Menjaju se u `assets/js/main.js` (niz `skillsData` na vrhu): naziv, ikonica, procenat, kategorija.
