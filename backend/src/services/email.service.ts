import nodemailer from "nodemailer";

// Email configuration for hophopsy.com
// Use SMTP_PASS (from docker-compose) or SMTP_PASSWORD as fallback
const smtpPassword = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.hophopsy.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER || "noreply@hophopsy.com",
    pass: smtpPassword,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

// Log SMTP configuration status
if (!smtpPassword) {
  console.error("⚠️  WARNING: SMTP password not set (neither SMTP_PASS nor SMTP_PASSWORD)!");
} else {
  console.log(`📧 Email service configured: ${process.env.SMTP_USER || 'noreply@hophopsy.com'}@${process.env.SMTP_HOST || 'mail.hophopsy.com'}:${process.env.SMTP_PORT || '587'}`);
}

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email service connection error:", error.message);
  } else {
    console.log("✅ SMTP connection verified successfully");
  }
});

export interface VerificationEmailOptions {
  to: string;
  firstName?: string;
  verificationToken: string;
}

export async function sendVerificationEmail(options: VerificationEmailOptions): Promise<boolean> {
  const { to, firstName, verificationToken } = options;
  
  const verificationUrl = `https://hophopsy.com/verify-email?token=${verificationToken}`;
  const name = firstName || to.split("@")[0];

  const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Mail Verifizierung - HopHop</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🚌 HopHop</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Ihr Reisepartner</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #eee; border-top: none;">
    <h2 style="color: #333; margin-top: 0;">Willkommen bei HopHop, ${name}!</h2>
    
    <p>Vielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Button klicken:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 15px 40px; 
                text-decoration: none; 
                border-radius: 25px; 
                font-weight: bold;
                display: inline-block;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
        ✉️ E-Mail bestätigen
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      Oder kopieren Sie diesen Link in Ihren Browser:<br>
      <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; margin-bottom: 0;">
      Dieser Link ist 24 Stunden gültig.<br>
      Falls Sie sich nicht bei HopHop registriert haben, ignorieren Sie bitte diese E-Mail.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© 2025 HopHop - Ihr Busreise-Service</p>
  </div>
</body>
</html>
`;

  const textContent = `
Willkommen bei HopHop, ${name}!

Vielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie den folgenden Link öffnen:

${verificationUrl}

Dieser Link ist 24 Stunden gültig.

Falls Sie sich nicht bei HopHop registriert haben, ignorieren Sie bitte diese E-Mail.

© 2025 HopHop - Ihr Busreise-Service
`;

  try {
    const info = await transporter.sendMail({
      from: '"HopHop" <noreply@hophopsy.com>',
      to,
      subject: "✉️ Bitte bestätigen Sie Ihre E-Mail-Adresse - HopHop",
      text: textContent,
      html: htmlContent,
    });

    console.log("Verification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(to: string, firstName?: string): Promise<boolean> {
  const name = firstName || to.split("@")[0];

  const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Willkommen bei HopHop!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🚌 HopHop</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Ihr Reisepartner</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #eee; border-top: none;">
    <h2 style="color: #333; margin-top: 0;">🎉 Ihr Konto wurde aktiviert!</h2>
    
    <p>Hallo ${name},</p>
    
    <p>Vielen Dank für die Bestätigung Ihrer E-Mail-Adresse. Ihr HopHop-Konto ist jetzt vollständig aktiviert!</p>
    
    <p>Sie können jetzt:</p>
    <ul style="color: #555;">
      <li>Busverbindungen suchen und buchen</li>
      <li>Ihre Buchungen verwalten</li>
      <li>Favoriten speichern</li>
      <li>Bewertungen abgeben</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://hophopsy.com" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 15px 40px; 
                text-decoration: none; 
                border-radius: 25px; 
                font-weight: bold;
                display: inline-block;">
        Jetzt loslegen →
      </a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© 2025 HopHop - Ihr Busreise-Service</p>
  </div>
</body>
</html>
`;

  try {
    await transporter.sendMail({
      from: '"HopHop" <noreply@hophopsy.com>',
      to,
      subject: "🎉 Willkommen bei HopHop - Ihr Konto ist aktiviert!",
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}

export default transporter;
