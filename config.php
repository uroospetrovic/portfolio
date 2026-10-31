<?php
/**
 * Contact form configuration
 * ----------------------------------------------------------
 * Fill in your SMTP details below.
 *
 * GMAIL: you can NOT use your normal Gmail password.
 *   1. Turn on 2-Step Verification: https://myaccount.google.com/security
 *   2. Create an App Password:      https://myaccount.google.com/apppasswords
 *   3. Paste the 16-character app password into SMTP_PASS (without spaces).
 *
 * HOSTING MAIL (cPanel etc.): use the host's SMTP server, e.g.
 *   SMTP_HOST = 'mail.yourdomain.com', SMTP_PORT = 465, SMTP_SECURE = 'ssl'
 *   SMTP_USER = 'contact@yourdomain.com'
 *
 * Do NOT commit this file with real passwords to a public GitHub repo.
 */

if (!defined('CONTACT_FORM')) {
    http_response_code(403);
    exit;
}

return [
    // SMTP server
    'SMTP_HOST'   => 'smtp.gmail.com',
    'SMTP_PORT'   => 587,          // 587 = TLS, 465 = SSL
    'SMTP_SECURE' => 'tls',        // 'tls' or 'ssl'
    'SMTP_USER'   => 'petrovicuros052@gmail.com',
    'SMTP_PASS'   => 'YOUR_APP_PASSWORD_HERE',

    // Who sends / who receives
    'FROM_EMAIL'  => 'petrovicuros052@gmail.com', // must usually be the same as SMTP_USER
    'FROM_NAME'   => 'Portfolio Contact Form',
    'TO_EMAIL'    => 'petrovicuros052@gmail.com', // where messages arrive
    'TO_NAME'     => 'Uroš Petrović',

    // Send an automatic "thanks, I got your message" email to the visitor
    'AUTO_REPLY'  => true,

    // Anti-spam: minimum seconds between two messages from the same visitor
    'RATE_LIMIT_SECONDS' => 60,

    // Anti-spam: form submitted faster than this (seconds after page load) = bot
    'MIN_FILL_SECONDS'   => 3,

    // Set to true only while testing – shows SMTP errors in the response
    'DEBUG'       => false,
];
