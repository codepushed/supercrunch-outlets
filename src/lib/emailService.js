import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  recipients: [
    process.env.ORDER_EMAIL_1 || 'admin1@supercrunch.com',
    process.env.ORDER_EMAIL_2 || 'admin2@supercrunch.com'
  ],
  from: process.env.EMAIL_FROM || 'Super Crunch <orders@supercrunch.com>',
};

// Create transporter based on email service
const createTransporter = () => {
  // Option 1: Gmail (Free)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    });
  }
  
  // Option 2: Custom SMTP (e.g., SendGrid, Mailgun, etc.)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Fallback: Log to console if no email service configured
  console.warn('No email service configured. Emails will be logged to console.');
  return null;
};

// Generate HTML email template
const generateOrderEmailHTML = (order) => {
  const itemsHTML = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${item.total}</td>
        </tr>
      `
    )
    .join('');

  const deliveryInstructionsHTML = order.delivery_instructions && order.delivery_instructions.length > 0
    ? `
      <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">📋 Delivery Instructions:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #856404;">
          ${order.delivery_instructions.map(inst => `<li>${inst}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const cookingInstructionsHTML = order.cooking_instructions
    ? `
      <div style="margin: 20px 0; padding: 15px; background-color: #d1ecf1; border-left: 4px solid #17a2b8; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: #0c5460; font-size: 16px;">👨‍🍳 Cooking Instructions:</h3>
        <p style="margin: 0; color: #0c5460;">${order.cooking_instructions}</p>
      </div>
    `
    : '';

  const couponHTML = order.coupon_code
    ? `
      <tr>
        <td colspan="3" style="padding: 10px; text-align: right; color: #28a745; font-weight: bold;">
          Coupon (${order.coupon_code}):
        </td>
        <td style="padding: 10px; text-align: right; color: #28a745; font-weight: bold;">
          -₹${order.discount}
        </td>
      </tr>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - ${order.order_number}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(90deg, #FFC700 0%, #FF8A00 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: bold;">🔔 New Order!</h1>
                  <p style="margin: 10px 0 0 0; color: #000; font-size: 18px; font-weight: bold;">${order.order_number}</p>
                </td>
              </tr>

              <!-- Customer Info -->
              <tr>
                <td style="padding: 30px;">
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">👤 Customer Details</h2>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr>
                        <td style="color: #666; font-weight: bold; width: 120px;">Name:</td>
                        <td style="color: #333;">${order.customer_name}</td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-weight: bold;">Phone:</td>
                        <td style="color: #333;"><a href="tel:${order.customer_phone}" style="color: #007bff; text-decoration: none;">${order.customer_phone}</a></td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-weight: bold;">Address:</td>
                        <td style="color: #333;">${order.customer_address}</td>
                      </tr>
                    </table>
                  </div>

                  ${deliveryInstructionsHTML}
                  ${cookingInstructionsHTML}

                  <!-- Order Items -->
                  <h2 style="margin: 20px 0 15px 0; color: #333; font-size: 20px;">🍽️ Order Items</h2>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #f8f9fa;">
                        <th style="padding: 12px; text-align: left; color: #666; font-weight: bold; border-bottom: 2px solid #dee2e6;">Item</th>
                        <th style="padding: 12px; text-align: center; color: #666; font-weight: bold; border-bottom: 2px solid #dee2e6;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #666; font-weight: bold; border-bottom: 2px solid #dee2e6;">Price</th>
                        <th style="padding: 12px; text-align: right; color: #666; font-weight: bold; border-bottom: 2px solid #dee2e6;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHTML}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #dee2e6;">
                          Subtotal:
                        </td>
                        <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #dee2e6;">
                          ₹${order.subtotal}
                        </td>
                      </tr>
                      ${couponHTML}
                      <tr>
                        <td colspan="3" style="padding: 15px; text-align: right; font-size: 18px; font-weight: bold; background-color: #f8f9fa;">
                          Total Amount:
                        </td>
                        <td style="padding: 15px; text-align: right; font-size: 18px; font-weight: bold; color: #28a745; background-color: #f8f9fa;">
                          ₹${order.total}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  <!-- Order Status -->
                  <div style="margin: 30px 0; padding: 20px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
                    <p style="margin: 0; color: #155724; font-size: 16px;">
                      <strong>Status:</strong> <span style="text-transform: uppercase;">${order.status}</span>
                    </p>
                    <p style="margin: 10px 0 0 0; color: #155724; font-size: 14px;">
                      Order placed at: ${new Date(order.created_at).toLocaleString('en-IN', { 
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>

                  <!-- Action Button -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="tel:${order.customer_phone}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(90deg, #FFC700 0%, #FF8A00 100%); color: #000; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                      📞 Call Customer
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #000; padding: 30px; text-align: center; border-top: 1px solid #dee2e6;">
                  <h2 style="margin: 0 0 10px 0; color: #FFC700; font-size: 32px; font-weight: bold; letter-spacing: 2px;">
                    SUPERCRUNCH
                  </h2>
                  <p style="margin: 0 0 5px 0; color: #fff; font-size: 14px;">
                    Order Management System
                  </p>
                  <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">
                    This is an automated notification. Please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Generate plain text email (fallback)
const generateOrderEmailText = (order) => {
  const items = order.items
    .map((item) => `${item.quantity}x ${item.name} - ₹${item.price} each = ₹${item.total}`)
    .join('\n');

  const deliveryInstructions = order.delivery_instructions && order.delivery_instructions.length > 0
    ? `\nDelivery Instructions:\n${order.delivery_instructions.map(inst => `- ${inst}`).join('\n')}`
    : '';

  const cookingInstructions = order.cooking_instructions
    ? `\nCooking Instructions:\n${order.cooking_instructions}`
    : '';

  const coupon = order.coupon_code
    ? `\nCoupon (${order.coupon_code}): -₹${order.discount}`
    : '';

  return `
🔔 NEW ORDER RECEIVED!

Order Number: ${order.order_number}
Status: ${order.status.toUpperCase()}
Time: ${new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

-----------------------------------
CUSTOMER DETAILS
-----------------------------------
Name: ${order.customer_name}
Phone: ${order.customer_phone}
Address: ${order.customer_address}
${deliveryInstructions}
${cookingInstructions}

-----------------------------------
ORDER ITEMS
-----------------------------------
${items}

-----------------------------------
PAYMENT SUMMARY
-----------------------------------
Subtotal: ₹${order.subtotal}${coupon}
TOTAL: ₹${order.total}

-----------------------------------
Please call the customer to confirm the order.
  `.trim();
};

// Send order email
export const sendOrderEmail = async (order) => {
  try {
    const transporter = createTransporter();

    // If no transporter configured, log to console
    if (!transporter) {
      console.log('\n========================================');
      console.log('📧 ORDER EMAIL (Console Mode)');
      console.log('========================================');
      console.log(`To: ${EMAIL_CONFIG.recipients.join(', ')}`);
      console.log(`Subject: 🔔 New Order ${order.order_number}`);
      console.log('========================================');
      console.log(generateOrderEmailText(order));
      console.log('========================================\n');
      return { success: true, mode: 'console' };
    }

    // Send email to both recipients
    const mailOptions = {
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.recipients.join(', '),
      subject: `🔔 New Order ${order.order_number} - ₹${order.total}`,
      text: generateOrderEmailText(order),
      html: generateOrderEmailHTML(order),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Order email sent successfully:', info.messageId);
    console.log(`📧 Sent to: ${EMAIL_CONFIG.recipients.join(', ')}`);

    return {
      success: true,
      messageId: info.messageId,
      recipients: EMAIL_CONFIG.recipients,
    };
  } catch (error) {
    console.error('❌ Error sending order email:', error);
    
    // Don't fail the order if email fails
    return {
      success: false,
      error: error.message,
    };
  }
};

export default sendOrderEmail;
