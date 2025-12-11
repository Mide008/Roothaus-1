// Test Email Script
// Run this to test your email configuration before deployment
// Usage: node test-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

// Email configuration from .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Test order data
const testOrder = {
  orderId: 'cs_test_123456789',
  orderNumber: 'TEST-ORDER-001',
  customerEmail: process.env.SMTP_USER, // Send test to yourself
  customerName: 'Test Customer',
  customerPhone: '+1 234 567 8900',
  shippingAddress: {
    name: 'Test Customer',
    line1: '123 Test Street',
    line2: 'Apt 4B',
    city: 'Lagos',
    state: 'Lagos',
    postalCode: '100001',
    country: 'Nigeria',
  },
  items: [
    {
      name: 'Executive Briefcase',
      quantity: 1,
      price: '450.00',
      currency: 'USD',
    },
    {
      name: 'Leather Wallet',
      quantity: 2,
      price: '120.00',
      currency: 'USD',
    },
  ],
  subtotal: '690.00',
  total: '690.00',
  currency: 'USD',
  paymentStatus: 'paid',
  orderDate: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }),
};

// Test customer email
async function testCustomerEmail() {
  console.log('🧪 Testing customer email...\n');

  const itemsHTML = testOrder.items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <small style="color: #666;">Quantity: ${item.quantity}</small>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
        ${testOrder.currency} ${item.price}
      </td>
    </tr>
  `).join('');

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Test Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #faf8f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px;">
              
              <tr>
                <td style="background: linear-gradient(135deg, #ebc885 0%, #8f613c 100%); padding: 40px; text-align: center; border-radius: 20px 20px 0 0;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 TEST EMAIL</h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0;">This is a test of your email configuration</p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px;">
                  <p style="color: #666; line-height: 1.6;">
                    Dear ${testOrder.customerName},<br><br>
                    This is a test email to verify your RootHaus email configuration is working correctly.
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #faf8f5; border-radius: 10px; padding: 20px;">
                    <tr>
                      <td>
                        <strong>Order Number:</strong> ${testOrder.orderNumber}<br>
                        <strong>Order Date:</strong> ${testOrder.orderDate}
                      </td>
                    </tr>
                  </table>
                  
                  <h3 style="margin: 30px 0 15px 0;">Test Order Items</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 10px;">
                    ${itemsHTML}
                    <tr>
                      <td style="padding: 15px; background-color: #faf8f5; text-align: right;" colspan="2">
                        <strong>Total: ${testOrder.currency} ${testOrder.total}</strong>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="margin: 30px 0; padding: 20px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 5px;">
                    <p style="margin: 0; color: #155724;">
                      ✅ <strong>Success!</strong> If you're reading this, your email configuration is working correctly.
                    </p>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #20110b; padding: 30px; text-align: center; border-radius: 0 0 20px 20px;">
                  <p style="color: #ffffff; margin: 0;">RootHaus - Email Test</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"RootHaus Test" <${process.env.SMTP_USER}>`,
      to: testOrder.customerEmail,
      subject: '🧪 Test: Customer Order Confirmation',
      html: emailHTML,
    });

    console.log('✅ Customer email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Sent to:', testOrder.customerEmail);
    console.log('\n');
    return true;
  } catch (error) {
    console.error('❌ Error sending customer email:', error.message);
    console.error('\nFull error:', error);
    return false;
  }
}

// Test admin email
async function testAdminEmail() {
  console.log('🧪 Testing admin email...\n');

  const itemsHTML = testOrder.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${testOrder.currency} ${item.price}</td>
    </tr>
  `).join('');

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Test Admin Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px;">
              
              <tr>
                <td style="background-color: #20110b; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: #ffffff; margin: 0;">🧪 TEST: New Order Alert</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 30px;">
                  <h2>Order #${testOrder.orderNumber}</h2>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; background-color: #faf8f5; padding: 15px;">
                    <tr>
                      <td>
                        <strong>Order Date:</strong> ${testOrder.orderDate}<br>
                        <strong>Payment Status:</strong> <span style="color: #4CAF50;">${testOrder.paymentStatus}</span><br>
                        <strong>Total:</strong> ${testOrder.currency} ${testOrder.total}
                      </td>
                    </tr>
                  </table>
                  
                  <h3>Customer Information</h3>
                  <p>
                    <strong>Name:</strong> ${testOrder.customerName}<br>
                    <strong>Email:</strong> ${testOrder.customerEmail}<br>
                    <strong>Phone:</strong> ${testOrder.customerPhone}
                  </p>
                  
                  <h3>Shipping Address</h3>
                  <p>
                    ${testOrder.shippingAddress.name}<br>
                    ${testOrder.shippingAddress.line1}<br>
                    ${testOrder.shippingAddress.line2}<br>
                    ${testOrder.shippingAddress.city}, ${testOrder.shippingAddress.state} ${testOrder.shippingAddress.postalCode}<br>
                    ${testOrder.shippingAddress.country}
                  </p>
                  
                  <h3>Order Items</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #ddd;">
                    <tr style="background-color: #20110b; color: #ffffff;">
                      <th style="padding: 10px; text-align: left;">Product</th>
                      <th style="padding: 10px; text-align: center;">Quantity</th>
                      <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                    ${itemsHTML}
                    <tr>
                      <td colspan="2" style="padding: 15px; text-align: right; background-color: #faf8f5;"><strong>Total:</strong></td>
                      <td style="padding: 15px; text-align: right; background-color: #faf8f5;"><strong>${testOrder.currency} ${testOrder.total}</strong></td>
                    </tr>
                  </table>
                  
                  <div style="margin: 30px 0; padding: 20px; background-color: #d4edda; border-left: 4px solid #28a745;">
                    <p style="margin: 0; color: #155724;">
                      ✅ <strong>Test Successful!</strong> Admin notifications are working.
                    </p>
                  </div>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"RootHaus Order System" <${process.env.SMTP_USER}>`,
      to: process.env.BUSINESS_EMAIL || process.env.SMTP_USER,
      subject: '🧪 Test: New Order Notification',
      html: emailHTML,
    });

    console.log('✅ Admin email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Sent to:', process.env.BUSINESS_EMAIL || process.env.SMTP_USER);
    console.log('\n');
    return true;
  } catch (error) {
    console.error('❌ Error sending admin email:', error.message);
    console.error('\nFull error:', error);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('\n========================================');
  console.log('   RootHaus Email Configuration Test   ');
  console.log('========================================\n');

  console.log('Configuration:');
  console.log('  SMTP Host:', process.env.SMTP_HOST);
  console.log('  SMTP Port:', process.env.SMTP_PORT);
  console.log('  SMTP User:', process.env.SMTP_USER);
  console.log('  Business Email:', process.env.BUSINESS_EMAIL || process.env.SMTP_USER);
  console.log('\n');

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('❌ Missing required environment variables!');
    console.error('Please check your .env file has:');
    console.error('  - SMTP_HOST');
    console.error('  - SMTP_PORT');
    console.error('  - SMTP_USER');
    console.error('  - SMTP_PASSWORD');
    console.error('  - BUSINESS_EMAIL');
    process.exit(1);
  }

  const customerSuccess = await testCustomerEmail();
  const adminSuccess = await testAdminEmail();

  console.log('========================================');
  console.log('               Results                  ');
  console.log('========================================\n');

  if (customerSuccess && adminSuccess) {
    console.log('✅ All tests passed!');
    console.log('📧 Check your inbox for the test emails.');
    console.log('🚀 Your email configuration is ready for production!\n');
  } else {
    console.log('❌ Some tests failed.');
    console.log('Please check the error messages above and fix your configuration.\n');
    console.log('Common issues:');
    console.log('  - Gmail: Use App Password, not regular password');
    console.log('  - Wrong SMTP host or port');
    console.log('  - Incorrect credentials');
    console.log('  - Firewall blocking SMTP port\n');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});