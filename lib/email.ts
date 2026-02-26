import nodemailer from "nodemailer";

export async function sendAdminNewReservationEmail(payload: {
  reservationId: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  vehiclePreference: string;
  pickupAt: Date;
  pickupAddress: string;
  destinationAddress: string;
}) {
  // Default email if not set in env
  const to = process.env.ADMIN_EMAIL_TO || "arslankibria98@gmail.com";
  
  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? "no-reply@transportbooking.local";

  if (!host || !user || !pass) {
    console.warn("[Email] ⚠️ SMTP not configured. Missing:", {
      host: !host ? "SMTP_HOST" : null,
      user: !user ? "SMTP_USER" : null,
      pass: !pass ? "SMTP_PASS" : null,
    });
    console.warn("[Email] Add SMTP settings to .env.local to enable email notifications");
    console.warn("[Email] Target email:", to);
    return;
  }
  
  console.log("[Email] SMTP configured. Sending to:", to);

  try {
    // Production environment me better connection settings
    const isProduction = process.env.NODE_ENV === "production";
    
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // SSL for port 465
      auth: { user, pass },
      // Force IPv4 to avoid IPv6 connection issues (Railway network issue)
      family: 4,
      // Connection timeouts
      connectionTimeout: isProduction ? 30000 : 10000, // Longer timeout in production
      greetingTimeout: isProduction ? 30000 : 10000,
      socketTimeout: isProduction ? 30000 : 10000,
      // Retry settings for production
      pool: isProduction, // Use connection pooling in production
      maxConnections: isProduction ? 5 : 1,
      maxMessages: isProduction ? 100 : 1,
      // TLS options for better compatibility
      tls: {
        rejectUnauthorized: false, // Some Railway networks need this
        ciphers: 'SSLv3',
      },
    });

    const subject = `New Reservation: ${payload.name} - ${payload.serviceType}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37;">New Reservation Received</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Reservation ID:</strong> ${payload.reservationId}</p>
          <p><strong>Name:</strong> ${payload.name}</p>
          <p><strong>Email:</strong> ${payload.email}</p>
          <p><strong>Phone:</strong> ${payload.phone}</p>
          <p><strong>Service Type:</strong> ${payload.serviceType}</p>
          <p><strong>Vehicle Preference:</strong> ${payload.vehiclePreference}</p>
          <p><strong>Pickup Date/Time:</strong> ${new Date(payload.pickupAt).toLocaleString()}</p>
          <p><strong>Pickup Address:</strong> ${payload.pickupAddress}</p>
          <p><strong>Destination:</strong> ${payload.destinationAddress}</p>
        </div>
        <p style="color: #666; font-size: 12px;">Please check the admin panel for more details.</p>
      </div>
    `;
    const text = [
      `New reservation received`,
      ``,
      `Reservation ID: ${payload.reservationId}`,
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone}`,
      `Service: ${payload.serviceType}`,
      `Vehicle: ${payload.vehiclePreference}`,
      `Pickup: ${new Date(payload.pickupAt).toLocaleString()}`,
      `Pickup Address: ${payload.pickupAddress}`,
      `Destination: ${payload.destinationAddress}`,
    ].join("\n");

    // Verify connection first (especially important in production)
    if (process.env.NODE_ENV === "production") {
      await transporter.verify();
      console.log("[Email] ✅ SMTP connection verified");
    }
    
    await transporter.sendMail({ 
      from, 
      to, 
      subject, 
      text,
      html 
    });
    console.log(`[Email] ✅ Notification sent to ${to}`);
    return true; // Return success
  } catch (error: any) {
    console.error("[Email] ❌ Failed to send notification:", error?.message || error);
    console.error("[Email] Error code:", error?.code);
    console.error("[Email] Error syscall:", error?.syscall);
    console.error("[Email] Error address:", error?.address);
    
    // Production-specific error messages
    if (process.env.NODE_ENV === "production") {
      if (error?.code === "ENETUNREACH" || error?.code === "ECONNREFUSED") {
        console.error("[Email] ⚠️  Network connection issue. Railway might be blocking SMTP.");
        console.error("[Email] 💡 Solutions:");
        console.error("   1. Try using port 465 with SSL (change SMTP_PORT=465)");
        console.error("   2. Use alternative SMTP service (SendGrid, Mailgun)");
        console.error("   3. Check Railway network/firewall settings");
      }
    }
    
    // Re-throw error so calling code knows it failed
    throw error;
  }
}
