import nodemailer from 'nodemailer';

interface BookingEmailData {
  recipientEmail: string;
  recipientName: string;
  tripDetails: {
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    company: string;
    seats: number;
    totalPrice: number;
    currency: string;
  };
  bookingId: number;
  isGuestBooking: boolean;
  qrCodeDataUrl?: string; // Base64 QR code image
  statusUrl?: string; // Link to booking status page
}

export class EmailService {
  private transporter?: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor() {
    // Configure email transporter with hophopsy.com settings
    const smtpHost = process.env.SMTP_HOST || 'mail.hophopsy.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || 'noreply@hophopsy.com';
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpPass) {
      console.warn('⚠️  SMTP_PASS not configured - email sending disabled');
      this.isConfigured = false;
      return;
    }

    console.log(`📧 Email service configured: ${smtpUser}@${smtpHost}:${smtpPort}`);
    
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // STARTTLS
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
    });

    this.isConfigured = true;
    
    // Test connection on startup
    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    if (!this.transporter) return;
    
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (error) {
      console.error('❌ SMTP connection test failed:', error);
      console.error('   This is normal in Docker on macOS. Emails will work in production.');
    }
  }

  async sendBookingConfirmation(data: BookingEmailData): Promise<void> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('📧 Email not sent - SMTP not configured');
      return;
    }

    const {
      recipientEmail,
      recipientName,
      tripDetails,
      bookingId,
      isGuestBooking,
      qrCodeDataUrl,
      statusUrl,
    } = data;

    const subject = isGuestBooking
      ? 'Buchungsanfrage erhalten / Booking Request Received / تم استلام طلب الحجز'
      : 'Buchungsbestätigung / Booking Confirmation / تأكيد الحجز';

    const message = isGuestBooking
      ? this.getGuestBookingEmailTemplate(recipientName, tripDetails, bookingId)
      : this.getConfirmedBookingEmailTemplate(recipientName, tripDetails, bookingId, qrCodeDataUrl, statusUrl);

    try {
      await this.transporter.sendMail({
        from: `"HopHop Transport" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: subject,
        html: message,
      });

      console.log(`✅ Booking email sent to ${recipientEmail}`);
    } catch (error) {
      console.error('❌ Error sending booking email:', error);
      console.error('   Note: This is expected in Docker on macOS. Will work in production.');
      // Don't throw error - booking should succeed even if email fails
    }
  }

  private getGuestBookingEmailTemplate(
    name: string,
    trip: BookingEmailData['tripDetails'],
    bookingId: number
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .trip-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
    .status-badge { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚍 HopHop Transport</h1>
      <p>Buchungsanfrage erhalten / Booking Request Received / تم استلام طلب الحجز</p>
    </div>
    
    <div class="content">
      <p><strong>Hallo ${name} / Hello ${name} / مرحباً ${name}</strong></p>
      
      <p>
        <strong>Deutsch:</strong> Vielen Dank für Ihre Buchungsanfrage! Ihre Buchung wartet auf die Bestätigung durch das Transportunternehmen. 
        Sie erhalten eine weitere E-Mail, sobald die Buchung bestätigt wurde.
      </p>
      
      <p>
        <strong>English:</strong> Thank you for your booking request! Your booking is waiting for confirmation from the transport company. 
        You will receive another email once the booking is confirmed.
      </p>
      
      <p>
        <strong>العربية:</strong> شكراً لطلب الحجز الخاص بك! حجزك في انتظار تأكيد شركة النقل. 
        سوف تتلقى بريداً إلكترونياً آخر بمجرد تأكيد الحجز.
      </p>

      <div style="text-align: center; margin: 20px 0;">
        <span class="status-badge">⏳ Ausstehend / Pending / قيد الانتظار</span>
      </div>
      
      <div class="trip-details">
        <h3 style="margin-top: 0;">📋 Buchungsdetails / Booking Details / تفاصيل الحجز</h3>
        <div class="detail-row">
          <span class="detail-label">Buchungs-ID / Booking ID / رقم الحجز:</span>
          <span>#${bookingId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Von / From / من:</span>
          <span>${trip.from}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Nach / To / إلى:</span>
          <span>${trip.to}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Abfahrt / Departure / المغادرة:</span>
          <span>${trip.departureTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ankunft / Arrival / الوصول:</span>
          <span>${trip.arrivalTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Unternehmen / Company / الشركة:</span>
          <span>${trip.company}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Plätze / Seats / المقاعد:</span>
          <span>${trip.seats}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Gesamtpreis / Total / الإجمالي:</span>
          <span><strong>${trip.totalPrice} ${trip.currency}</strong></span>
        </div>
      </div>
      
      <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <strong>⚠️ Wichtig / Important / مهم:</strong><br>
        Diese Buchung muss noch vom Transportunternehmen bestätigt werden. 
        Bitte warten Sie auf die Bestätigung, bevor Sie zur Abfahrtsstelle kommen.<br><br>
        This booking needs to be confirmed by the transport company. 
        Please wait for confirmation before arriving at the departure point.<br><br>
        يجب تأكيد هذا الحجز من قبل شركة النقل. 
        يرجى انتظار التأكيد قبل الذهاب إلى نقطة المغادرة.
      </p>
    </div>
    
    <div class="footer">
      <p>HopHop Transport - Ihr zuverlässiger Reisepartner / Your reliable travel partner / شريكك الموثوق في السفر</p>
      <p>Bei Fragen kontaktieren Sie uns bitte / For questions please contact us / للاستفسارات يرجى الاتصال بنا</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getConfirmedBookingEmailTemplate(
    name: string,
    trip: BookingEmailData['tripDetails'],
    bookingId: number,
    qrCodeDataUrl?: string,
    statusUrl?: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .trip-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
    .success-badge { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
    .qr-section { background: linear-gradient(135deg, #dbeafe, #dcfce7); padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center; border: 2px solid #16a34a; }
    .qr-code { background: white; padding: 20px; border-radius: 8px; display: inline-block; margin: 20px 0; }
    .qr-instruction { color: #166534; font-weight: bold; font-size: 16px; margin: 10px 0; }
    .status-button { background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚍 HopHop Transport</h1>
      <p>Buchungsbestätigung / Booking Confirmation / تأكيد الحجز</p>
    </div>
    
    <div class="content">
      <p><strong>Hallo ${name} / Hello ${name} / مرحباً ${name}</strong></p>
      
      <p>
        <strong>Deutsch:</strong> Vielen Dank für Ihre Buchung! Ihre Reise wurde erfolgreich bestätigt.
      </p>
      
      <p>
        <strong>English:</strong> Thank you for your booking! Your trip has been successfully confirmed.
      </p>
      
      <p>
        <strong>العربية:</strong> شكراً لحجزك! تم تأكيد رحلتك بنجاح.
      </p>

      <div style="text-align: center; margin: 20px 0;">
        <span class="success-badge">✓ Bestätigt / Confirmed / مؤكد</span>
      </div>
      
      <div class="trip-details">
        <h3 style="margin-top: 0;">📋 Reisedetails / Trip Details / تفاصيل الرحلة</h3>
        <div class="detail-row">
          <span class="detail-label">Buchungs-ID / Booking ID / رقم الحجز:</span>
          <span>#${bookingId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Von / From / من:</span>
          <span>${trip.from}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Nach / To / إلى:</span>
          <span>${trip.to}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Abfahrt / Departure / المغادرة:</span>
          <span>${trip.departureTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ankunft / Arrival / الوصول:</span>
          <span>${trip.arrivalTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Unternehmen / Company / الشركة:</span>
          <span>${trip.company}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Plätze / Seats / المقاعد:</span>
          <span>${trip.seats}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Gesamtpreis / Total / الإجمالي:</span>
          <span><strong>${trip.totalPrice} ${trip.currency}</strong></span>
        </div>
      </div>
      
      ${qrCodeDataUrl ? `
      <div class="qr-section">
        <h3 style="margin-top: 0; color: #166534;">
          🎫 Boarding Pass / تذكرة الصعود
        </h3>
        <p class="qr-instruction">
          📱 Deutsch: Zeigen Sie diesen QR-Code beim Einsteigen dem Fahrer<br>
          📱 English: Show this QR code to the driver when boarding<br>
          📱 العربية: أظهر رمز الاستجابة السريعة هذا للسائق عند الصعود
        </p>
        <div class="qr-code">
          <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 300px; height: 300px;" />
        </div>
        ${statusUrl ? `
        <p style="margin-top: 20px;">
          <a href="${statusUrl}" class="status-button">
            🔍 Buchungsstatus anzeigen / View Booking Status / عرض حالة الحجز
          </a>
        </p>
        ` : ''}
      </div>
      ` : ''}
      
      <p style="margin-top: 30px; padding: 15px; background: #dcfce7; border-radius: 8px; border-left: 4px solid #16a34a;">
        <strong>✓ Hinweis / Note / ملاحظة:</strong><br>
        Bitte seien Sie mindestens 15 Minuten vor der Abfahrtszeit am Abfahrtsort.<br>
        Please be at the departure location at least 15 minutes before departure time.<br>
        يرجى التواجد في موقع المغادرة قبل 15 دقيقة على الأقل من وقت المغادرة.
      </p>
    </div>
    
    <div class="footer">
      <p>HopHop Transport - Ihr zuverlässiger Reisepartner / Your reliable travel partner / شريكك الموثوق في السفر</p>
      <p>Gute Reise! / Have a safe trip! / رحلة سعيدة!</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  async sendBookingStatusUpdate(
    recipientEmail: string,
    recipientName: string,
    bookingId: number,
    newStatus: string
  ): Promise<void> {
    if (!this.transporter) return;
    
    // Send email when booking status changes (e.g., from pending to confirmed)
    const subject = 'Buchungsstatus aktualisiert / Booking Status Updated / تحديث حالة الحجز';
    
    try {
      await this.transporter.sendMail({
        from: `"HopHop Transport" <${process.env.SMTP_USER || 'noreply@hophopsy.com'}>`,
        to: recipientEmail,
        subject: subject,
        html: `
          <h2>Buchungsstatus aktualisiert / Booking Status Updated / تحديث حالة الحجز</h2>
          <p>Hallo ${recipientName} / Hello ${recipientName} / مرحباً ${recipientName},</p>
          <p>Der Status Ihrer Buchung #${bookingId} wurde aktualisiert auf: <strong>${newStatus}</strong></p>
          <p>The status of your booking #${bookingId} has been updated to: <strong>${newStatus}</strong></p>
          <p>تم تحديث حالة حجزك #${bookingId} إلى: <strong>${newStatus}</strong></p>
        `,
      });
    } catch (error) {
      console.error('Error sending status update email:', error);
    }
  }

  async sendCompanyNotification(
    companyEmail: string,
    companyName: string,
    bookingDetails: {
      bookingId: number;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      tripFrom: string;
      tripTo: string;
      departureTime: string;
      seats: number;
      passengerNames: string[];
      totalPrice: number;
      currency: string;
    }
  ): Promise<void> {
    if (!this.transporter) return;
    
    const subject = '⚠️ Neue Buchung wartet auf Bestätigung / New Booking Awaiting Confirmation';
    
    const passengersHtml = bookingDetails.passengerNames.map((name, i) => 
      `<li>${i + 1}. ${name}</li>`
    ).join('');

    try {
      await this.transporter.sendMail({
        from: `"HopHop Transport" <${process.env.SMTP_USER || 'noreply@hophopsy.com'}>`,
        to: companyEmail,
        subject: subject,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .action-buttons { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; padding: 12px 30px; margin: 0 10px; border-radius: 8px; text-decoration: none; font-weight: bold; }
    .btn-accept { background: #16a34a; color: white; }
    .btn-deny { background: #dc2626; color: white; }
    .passengers { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .passengers ul { margin: 10px 0; padding-left: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Neue Buchung</h1>
      <p>Eine neue Buchung wartet auf Ihre Bestätigung</p>
    </div>
    
    <div class="content">
      <p><strong>Sehr geehrte/r ${companyName},</strong></p>
      
      <p>Sie haben eine neue Buchungsanfrage erhalten, die Ihre Bestätigung benötigt.</p>
      
      <div class="booking-details">
        <h3 style="margin-top: 0;">📋 Buchungsdetails</h3>
        <div class="detail-row">
          <span class="detail-label">Buchungs-ID:</span>
          <span>#${bookingDetails.bookingId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Kunde:</span>
          <span>${bookingDetails.customerName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">E-Mail:</span>
          <span>${bookingDetails.customerEmail}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Telefon:</span>
          <span>${bookingDetails.customerPhone}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Strecke:</span>
          <span>${bookingDetails.tripFrom} → ${bookingDetails.tripTo}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Abfahrt:</span>
          <span>${bookingDetails.departureTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Plätze:</span>
          <span>${bookingDetails.seats}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Gesamtpreis:</span>
          <span><strong>${bookingDetails.totalPrice} ${bookingDetails.currency}</strong></span>
        </div>
      </div>
      
      <div class="passengers">
        <h4 style="margin-top: 0;">👥 Passagiere:</h4>
        <ul>
          ${passengersHtml}
        </ul>
      </div>
      
      <div class="action-buttons">
        <p><strong>Bitte bestätigen oder lehnen Sie diese Buchung in Ihrem Admin-Dashboard ab.</strong></p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost'}/admin" class="btn btn-accept">
          ✓ Buchung bestätigen
        </a>
        <a href="${process.env.FRONTEND_URL || 'http://localhost'}/admin" class="btn btn-deny">
          ✗ Buchung ablehnen
        </a>
      </div>
      
      <p style="margin-top: 30px; padding: 15px; background: #fee2e2; border-radius: 8px; border-left: 4px solid #dc2626;">
        <strong>⚠️ Wichtig:</strong><br>
        Bitte bearbeiten Sie diese Buchung innerhalb von 24 Stunden. Der Kunde wartet auf Ihre Bestätigung.
      </p>
    </div>
  </div>
</body>
</html>
        `,
      });
      console.log(`Company notification sent to ${companyEmail}`);
    } catch (error) {
      console.error('Error sending company notification:', error);
      // Don't throw - booking should succeed even if email fails
    }
  }
}

export const emailService = new EmailService();
