<?php
/**
 * Contact form handler – sends messages using PHPMailer over SMTP.
 * Works with the AJAX form in index.html (returns JSON) and also as a
 * plain HTML form fallback (redirects back to index.html?sent=1#contact).
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

define('CONTACT_FORM', true);

require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

$config = require __DIR__ . '/config.php';

session_start();

$isAjax = (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest')
       || strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

/**
 * Send the response (JSON for AJAX, redirect for normal POST) and stop.
 */
function respond(bool $success, string $message, int $code = 200): void
{
    global $isAjax;

    if ($isAjax) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: index.html?sent=' . ($success ? '1' : '0') . '#contact', true, 303);
    }
    exit;
}

/** Remove line breaks (prevents e-mail header injection) and trim. */
function clean_line(string $value): string
{
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', $value));
}

/* ---------- 1. Only POST ---------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Method not allowed.', 405);
}

/* ---------- 2. Anti-spam checks ---------- */

// Honeypot: real people never see this field
if (!empty($_POST['website'])) {
    respond(true, 'Thank you! Your message has been sent.'); // pretend success for bots
}

// Too fast = bot
$formTime = (int) ($_POST['form_time'] ?? 0);
if ($formTime > 0 && (time() - $formTime) < (int) $config['MIN_FILL_SECONDS']) {
    respond(false, 'Please take a moment before sending the form.', 429);
}

// Rate limit per session
$last = $_SESSION['contact_last_sent'] ?? 0;
if ($last && (time() - $last) < (int) $config['RATE_LIMIT_SECONDS']) {
    $wait = (int) $config['RATE_LIMIT_SECONDS'] - (time() - $last);
    respond(false, "You've just sent a message. Please wait {$wait} seconds before sending another one.", 429);
}

/* ---------- 3. Read & validate input ---------- */
$name    = clean_line((string) ($_POST['name'] ?? ''));
$email   = clean_line((string) ($_POST['email'] ?? ''));
$subject = clean_line((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

$errors = [];
if ($name === '' || mb_strlen($name) > 100) {
    $errors[] = 'Please enter your name (max 100 characters).';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
    $errors[] = 'Please enter a valid email address.';
}
if (mb_strlen($subject) > 150) {
    $errors[] = 'The subject is too long (max 150 characters).';
}
if (mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    $errors[] = 'Your message should be between 10 and 5000 characters.';
}

if ($errors) {
    respond(false, implode(' ', $errors), 422);
}

if ($subject === '') {
    $subject = 'New message from your portfolio';
}

/* ---------- 4. Build e-mail ---------- */
$safeName    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeEmail   = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safeSubject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
$sentAt      = date('d.m.Y H:i');
$ip          = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

$htmlBody = <<<HTML
<div style="font-family:Arial,Helvetica,sans-serif;background:#081028;padding:30px;">
  <div style="max-width:600px;margin:0 auto;background:#102038;border:1px solid #1e3a66;border-radius:12px;overflow:hidden;">
    <div style="background:#3882f6;padding:18px 24px;color:#fff;font-size:18px;font-weight:bold;">
      New message from your portfolio
    </div>
    <div style="padding:24px;color:#e2e8f0;font-size:14px;line-height:1.6;">
      <p style="margin:0 0 6px;"><strong style="color:#94a3b8;">Name:</strong> {$safeName}</p>
      <p style="margin:0 0 6px;"><strong style="color:#94a3b8;">Email:</strong> <a href="mailto:{$safeEmail}" style="color:#60a5fa;">{$safeEmail}</a></p>
      <p style="margin:0 0 18px;"><strong style="color:#94a3b8;">Subject:</strong> {$safeSubject}</p>
      <div style="background:#081028;border-radius:8px;padding:16px;color:#fff;">{$safeMessage}</div>
      <p style="margin:18px 0 0;font-size:12px;color:#64748b;">Sent: {$sentAt} &middot; IP: {$ip}</p>
    </div>
  </div>
</div>
HTML;

$textBody = "New message from your portfolio\n\n"
          . "Name: {$name}\nEmail: {$email}\nSubject: {$subject}\n\n"
          . "{$message}\n\n---\nSent: {$sentAt} | IP: {$ip}";

/** Create a PHPMailer instance pre-configured with SMTP settings. */
function make_mailer(array $config): PHPMailer
{
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $config['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['SMTP_USER'];
    $mail->Password   = $config['SMTP_PASS'];
    $mail->SMTPSecure = $config['SMTP_SECURE'] === 'ssl'
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = (int) $config['SMTP_PORT'];
    $mail->CharSet    = PHPMailer::CHARSET_UTF8;
    $mail->setFrom($config['FROM_EMAIL'], $config['FROM_NAME']);
    return $mail;
}

/* ---------- 5. Send ---------- */
try {
    $mail = make_mailer($config);
    $mail->addAddress($config['TO_EMAIL'], $config['TO_NAME']);
    $mail->addReplyTo($email, $name);          // "Reply" answers the visitor directly
    $mail->isHTML(true);
    $mail->Subject = '[Portfolio] ' . $subject;
    $mail->Body    = $htmlBody;
    $mail->AltBody = $textBody;
    $mail->send();

    $_SESSION['contact_last_sent'] = time();

    // Optional auto-reply to the visitor (failure here is not critical)
    if (!empty($config['AUTO_REPLY'])) {
        try {
            $reply = make_mailer($config);
            $reply->setFrom($config['FROM_EMAIL'], $config['TO_NAME']);
            $reply->addAddress($email, $name);
            $reply->isHTML(true);
            $reply->Subject = 'Thanks for reaching out – Uroš Petrović';
            $reply->Body = <<<HTML
<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1e293b;">
  <p>Hi {$safeName},</p>
  <p>Thank you for your message! I've received it and will get back to you within 24 hours.</p>
  <p style="color:#64748b;border-left:3px solid #3882f6;padding-left:12px;">{$safeMessage}</p>
  <p>Best regards,<br><strong>Uroš Petrović</strong><br>Full-Stack Web Developer<br>
  <a href="mailto:{$config['TO_EMAIL']}" style="color:#3882f6;">{$config['TO_EMAIL']}</a> &middot; +381 64 1200 839</p>
</div>
HTML;
            $reply->AltBody = "Hi {$name},\n\nThank you for your message! I've received it and will get back to you within 24 hours.\n\nBest regards,\nUroš Petrović";
            $reply->send();
        } catch (Exception $e) {
            error_log('Contact auto-reply failed: ' . $e->getMessage());
        }
    }

    respond(true, "Thank you, {$name}! Your message has been sent. I'll get back to you within 24 hours.");
} catch (Exception $e) {
    error_log('Contact form error: ' . ($mail->ErrorInfo ?? $e->getMessage()));
    $msg = 'Sorry, your message could not be sent right now. Please try again later or email me at ' . $config['TO_EMAIL'] . '.';
    if (!empty($config['DEBUG'])) {
        $msg .= ' [DEBUG: ' . ($mail->ErrorInfo ?? $e->getMessage()) . ']';
    }
    respond(false, $msg, 500);
}
