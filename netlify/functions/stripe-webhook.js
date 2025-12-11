// Stripe Webhook Handler - Sends emails after successful payment
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER, // Your business email
    pass: process.env.SMTP_PASSWORD, // Your email password or app password
  },
});

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Webhook signature verification failed' })
    };
  }

  // Handle the checkout.session.completed event
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    try {
      // Retrieve full session details with line items
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'customer']
      });

      // Extract order details
      const orderDetails = {
        orderId: fullSession.id,
        orderNumber: fullSession.id.substring(0, 16).toUpperCase(),
        customerEmail: fullSession.customer_details.email,
        customerName: fullSession.customer_details.name,
        customerPhone: fullSession.customer_details.phone || 'N/A',
        shippingAddress: fullSession.shipping_details ? {
          name: fullSession.shipping_details.name,
          line1: fullSession.shipping_details.address.line1,
          line2: fullSession.shipping_details.address.line2 || '',
          city: fullSession.shipping_details.address.city,
          state: fullSession.shipping_details.address.state,
          postalCode: fullSession.shipping_details.address.postal_code,
          country: fullSession.shipping_details.address.country,
        } : null,
        billingAddress: fullSession.customer_details.address ? {
          line1: fullSession.customer_details.address.line1,
          line2: fullSession.customer_details.address.line2 || '',
          city: fullSession.customer_details.address.city,
          state: fullSession.customer_details.address.state,
          postalCode: fullSession.customer_details.address.postal_code,
          country: fullSession.customer_details.address.country,
        } : null,
        items: fullSession.line_items.data.map(item => ({
          name: item.description,
          quantity: item.quantity,
          price: (item.amount_total / 100).toFixed(2),
          currency: item.currency.toUpperCase(),
        })),
        subtotal: (fullSession.amount_subtotal / 100).toFixed(2),
        total: (fullSession.amount_total / 100).toFixed(2),
        currency: fullSession.currency.toUpperCase(),
        paymentStatus: fullSession.payment_status,
        orderDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };

      // Send email to customer
      await sendCustomerEmail(orderDetails);

      // Send email to business
      await sendAdminEmail(orderDetails);

      return {
        statusCode: 200,
        body: JSON.stringify({ received: true })
      };
    } catch (error) {
      console.error('Error processing webhook:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true })
  };
};

// Send confirmation email to customer
async function sendCustomerEmail(orderDetails) {
  const customerEmailHTML = generateCustomerEmailHTML(orderDetails);

  await transporter.sendMail({
    from: `"RootHaus" <${process.env.SMTP_USER}>`,
    to: orderDetails.customerEmail,
    subject: `Order Confirmation - ${orderDetails.orderNumber}`,
    html: customerEmailHTML,
  });
}

// Send notification email to business
async function sendAdminEmail(orderDetails) {
  const adminEmailHTML = generateAdminEmailHTML(orderDetails);

  await transporter.sendMail({
    from: `"RootHaus Order System" <${process.env.SMTP_USER}>`,
    to: process.env.BUSINESS_EMAIL, // Your business email
    subject: `New Order Received - ${orderDetails.orderNumber}`,
    html: adminEmailHTML,
  });
}

// Generate customer email HTML
function generateCustomerEmailHTML(order) {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <small style="color: #666;">Quantity: ${item.quantity}</small>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
        ${order.currency} ${item.price}
      </td>
    </tr>
  `).join('');

  const shippingAddressHTML = order.shippingAddress ? `
    <p><strong>Shipping Address:</strong><br>
    ${order.shippingAddress.name}<br>
    ${order.shippingAddress.line1}<br>
    ${order.shippingAddress.line2 ? order.shippingAddress.line2 + '<br>' : ''}
    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
    ${order.shippingAddress.country}</p>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #faf8f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(32, 17, 11, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #ebc885 0%, #8f613c 100%); padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-family: 'Cormorant Garamond', Georgia, serif;">Thank You!</h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Your order has been confirmed</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #20110b; margin: 0 0 20px 0; font-size: 24px; font-family: 'Cormorant Garamond', Georgia, serif;">Order Confirmation</h2>
                  
                  <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                    Dear ${order.customerName},<br><br>
                    Thank you for your purchase from RootHaus. We're excited to craft your order with the care and attention our heritage demands.
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #faf8f5; border-radius: 10px; padding: 20px;">
                    <tr>
                      <td style="padding: 10px 0;">
                        <strong style="color: #20110b;">Order Number:</strong><br>
                        <span style="color: #8f613c; font-size: 18px;">${order.orderNumber}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0;">
                        <strong style="color: #20110b;">Order Date:</strong><br>
                        ${order.orderDate}
                      </td>
                    </tr>
                  </table>
                  
                  <h3 style="color: #20110b; margin: 30px 0 15px 0; font-size: 20px; font-family: 'Cormorant Garamond', Georgia, serif;">Order Details</h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    ${itemsHTML}
                    <tr>
                      <td style="padding: 15px; background-color: #faf8f5; text-align: right;" colspan="2">
                        <strong style="color: #20110b; font-size: 18px;">Total: ${order.currency} ${order.total}</strong>
                      </td>
                    </tr>
                  </table>
                  
                  ${shippingAddressHTML}
                  
                  <div style="margin: 30px 0; padding: 20px; background-color: #faf8f5; border-left: 4px solid #8f613c; border-radius: 5px;">
                    <h4 style="margin: 0 0 10px 0; color: #20110b;">What's Next?</h4>
                    <p style="margin: 0; color: #666; line-height: 1.6;">
                      • Our master artisans will begin crafting your order<br>
                      • You'll receive a shipping notification with tracking details<br>
                      • Expected delivery: 5-7 business days<br>
                      • Questions? Reply to this email or contact us
                    </p>
                  </div>
                  
                  <p style="color: #666; line-height: 1.6; margin-top: 30px;">
                    Thank you for choosing RootHaus. Your support helps preserve traditional craftsmanship and Nigerian heritage.
                  </p>
                  
                  <p style="color: #666; line-height: 1.6; margin-top: 20px;">
                    With gratitude,<br>
                    <strong style="color: #20110b;">The RootHaus Team</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #20110b; padding: 30px; text-align: center;">
                  <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px;">RootHaus - Root & Hide Co.</p>
                  <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">Heritage craftsmanship meets modern luxury</p>
                  <p style="color: rgba(255,255,255,0.7); margin: 15px 0 0 0; font-size: 12px;">
                    <a href="${process.env.URL}" style="color: #ebc885; text-decoration: none;">Visit Our Website</a> | 
                    <a href="${process.env.URL}/contact.html" style="color: #ebc885; text-decoration: none;">Contact Us</a>
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
}

// Generate admin notification email HTML
function generateAdminEmailHTML(order) {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${order.currency} ${item.price}</td>
    </tr>
  `).join('');

  const shippingAddressHTML = order.shippingAddress ? `
    <p><strong>Shipping Address:</strong><br>
    ${order.shippingAddress.name}<br>
    ${order.shippingAddress.line1}<br>
    ${order.shippingAddress.line2 ? order.shippingAddress.line2 + '<br>' : ''}
    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
    ${order.shippingAddress.country}</p>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px;">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #20110b; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 New Order Received!</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color: #20110b; margin: 0 0 20px 0;">Order #${order.orderNumber}</h2>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; background-color: #faf8f5; padding: 15px; border-radius: 5px;">
                    <tr>
                      <td>
                        <strong>Order Date:</strong> ${order.orderDate}<br>
                        <strong>Payment Status:</strong> <span style="color: #4CAF50;">${order.paymentStatus}</span><br>
                        <strong>Total:</strong> <span style="font-size: 18px; color: #8f613c;">${order.currency} ${order.total}</span>
                      </td>
                    </tr>
                  </table>
                  
                  <h3 style="color: #20110b; margin: 20px 0 10px 0;">Customer Information</h3>
                  <p style="margin: 0; line-height: 1.6;">
                    <strong>Name:</strong> ${order.customerName}<br>
                    <strong>Email:</strong> <a href="mailto:${order.customerEmail}" style="color: #8f613c;">${order.customerEmail}</a><br>
                    <strong>Phone:</strong> ${order.customerPhone}
                  </p>
                  
                  ${shippingAddressHTML}
                  
                  <h3 style="color: #20110b; margin: 30px 0 10px 0;">Order Items</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #ddd; border-radius: 5px;">
                    <tr style="background-color: #20110b; color: #ffffff;">
                      <th style="padding: 10px; text-align: left;">Product</th>
                      <th style="padding: 10px; text-align: center;">Quantity</th>
                      <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                    ${itemsHTML}
                    <tr>
                      <td colspan="2" style="padding: 15px; text-align: right; background-color: #faf8f5;"><strong>Total:</strong></td>
                      <td style="padding: 15px; text-align: right; background-color: #faf8f5;"><strong>${order.currency} ${order.total}</strong></td>
                    </tr>
                  </table>
                  
                  <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                    <p style="margin: 0; color: #856404;">
                      <strong>Action Required:</strong> Process this order and prepare for shipment.
                    </p>
                  </div>
                  
                  <p style="margin-top: 20px; text-align: center;">
                    <a href="https://dashboard.stripe.com/payments/${order.orderId}" style="display: inline-block; padding: 12px 30px; background-color: #8f613c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Stripe Dashboard</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px; text-align: center; background-color: #f4f4f4; border-radius: 0 0 10px 10px;">
                  <p style="margin: 0; color: #666; font-size: 12px;">RootHaus Order Notification System</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}