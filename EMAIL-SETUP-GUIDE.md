# Email Notification Setup Guide

This guide will help you set up automatic email notifications for RootHaus orders.

## What Gets Sent

### Customer Email (Sent to buyer)
✅ Order confirmation  
✅ Order number and date  
✅ Product details and quantities  
✅ Total amount paid  
✅ Shipping address  
✅ What happens next  
✅ Branded RootHaus design  

### Admin Email (Sent to your business)
✅ New order alert  
✅ Customer information (name, email, phone)  
✅ Shipping address  
✅ Product details  
✅ Order total  
✅ Link to Stripe dashboard  

---

## Setup Options

### Option 1: Gmail (Easiest - Recommended for Getting Started)

**Step 1: Create a Gmail App Password**

1. Go to your Google Account: https://myaccount.google.com
2. Click on "Security" (left sidebar)
3. Enable 2-Step Verification (if not already enabled)
4. Go back to Security → Search for "App passwords"
5. Click "App passwords"
6. Select "Mail" and "Other (Custom name)"
7. Name it "RootHaus Website"
8. Click "Generate"
9. **Copy the 16-character password** (you'll need this)

**Step 2: Configure Environment Variables**

In your `.env` file:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASSWORD=your-16-char-app-password
BUSINESS_EMAIL=youremail@gmail.com
```

In Netlify Dashboard:
1. Go to Site settings → Environment variables
2. Add each variable above
3. Deploy your site

**Pros:**
- Free
- Easy to set up
- Reliable

**Cons:**
- Limited to 500 emails per day
- Gmail branding in email headers

---

### Option 2: SendGrid (Best for Professional Use)

**Step 1: Create SendGrid Account**

1. Go to https://sendgrid.com
2. Sign up for free account (100 emails/day free forever)
3. Verify your email
4. Go to Settings → API Keys
5. Click "Create API Key"
6. Name it "RootHaus" and select "Full Access"
7. Copy the API key

**Step 2: Configure Environment Variables**

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
BUSINESS_EMAIL=orders@yourdomain.com
```

**Step 3: Verify Sender Email**

1. In SendGrid dashboard, go to Settings → Sender Authentication
2. Verify your email address or domain
3. Follow the verification steps

**Pros:**
- Professional
- Great deliverability
- Detailed analytics
- 100 emails/day free

**Cons:**
- Requires domain verification for production

---

### Option 3: Mailgun (Good Alternative)

**Step 1: Create Mailgun Account**

1. Go to https://mailgun.com
2. Sign up for free account (5,000 emails/month free for 3 months)
3. Go to Sending → Domain Settings → SMTP credentials
4. Copy your SMTP credentials

**Step 2: Configure Environment Variables**

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
BUSINESS_EMAIL=orders@yourdomain.com
```

**Pros:**
- 5,000 emails/month free trial
- Good deliverability
- Simple API

**Cons:**
- Requires credit card for free tier

---

### Option 4: Custom Domain Email (Most Professional)

If you have a business email like `info@roothaus.com`:

**Step 1: Get SMTP Settings from Your Email Provider**

Common providers:
- **cPanel/Hostinger**: Usually `mail.yourdomain.com` on port 587
- **Microsoft 365**: `smtp.office365.com` on port 587
- **Zoho Mail**: `smtp.zoho.com` on port 587

**Step 2: Configure Environment Variables**

```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@roothaus.com
SMTP_PASSWORD=your-email-password
BUSINESS_EMAIL=orders@roothaus.com
```

**Pros:**
- Most professional
- Your own domain
- No third-party branding

**Cons:**
- May have sending limits
- Depends on email host

---

## Netlify Setup

### 1. Add Environment Variables in Netlify

1. Go to your site in Netlify Dashboard
2. Click **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add each variable:

```
STRIPE_PUBLIC_KEY = pk_test_...
STRIPE_SECRET_KEY = sk_test_...
STRIPE_WEBHOOK_SECRET = whsec_...
SMTP_HOST = smtp.gmail.com (or your choice)
SMTP_PORT = 587
SMTP_USER = youremail@gmail.com
SMTP_PASSWORD = your-password
BUSINESS_EMAIL = orders@roothaus.com
URL = https://your-site.netlify.app
```

5. Click **Save**
6. **Redeploy your site** (important!)

---

## Stripe Webhook Setup

### 1. Create Webhook in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your endpoint URL:
   ```
   https://your-site.netlify.app/.netlify/functions/stripe-webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed` ✅
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### 2. Add Webhook Secret to Netlify

1. Go to Netlify → Environment variables
2. Add new variable:
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_your_secret_here`
3. Save and redeploy

---

## Testing the Email System

### Test in Development

1. Run locally:
   ```bash
   netlify dev
   ```

2. Use Stripe CLI to test webhooks:
   ```bash
   stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
   ```

3. Make a test purchase with test card: `4242 4242 4242 4242`

### Test in Production

1. Deploy your site to Netlify
2. Make a test purchase on your live site
3. Check your email (both customer and admin emails should arrive)
4. Check Netlify Functions logs:
   - Go to Netlify Dashboard → Functions → stripe-webhook
   - Check for any errors

---

## Customizing Email Content

### Edit Customer Email

Open `netlify/functions/stripe-webhook.js` and find the `generateCustomerEmailHTML()` function.

**Change greeting:**
```javascript
// Line ~152
Dear ${order.customerName},<br><br>
Thank you for your purchase from RootHaus.
```

**Change footer:**
```javascript
// Line ~195
With gratitude,<br>
<strong style="color: #20110b;">The RootHaus Team</strong>
```

**Add your logo:**
```javascript
// Add this in the header section
<img src="https://your-site.com/logo.svg" alt="RootHaus" style="width: 150px; margin-bottom: 20px;">
```

### Edit Admin Email

Find the `generateAdminEmailHTML()` function.

**Change notification style:**
```javascript
// Line ~240
<h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 New Order Received!</h1>
```

---

## Troubleshooting

### Emails Not Sending

**Check 1: Environment Variables**
- Are they set in Netlify Dashboard?
- Did you redeploy after adding them?

**Check 2: Webhook Configuration**
- Is the webhook URL correct?
- Is the signing secret correct?
- Is the webhook enabled in Stripe?

**Check 3: Email Credentials**
- Gmail: Did you use App Password (not regular password)?
- SendGrid: Is your sender email verified?
- Custom: Are SMTP settings correct?

**Check 4: Netlify Function Logs**
1. Go to Netlify Dashboard
2. Functions → stripe-webhook
3. Check recent invocations
4. Look for error messages

### Emails Going to Spam

**Solutions:**
1. Use a professional email service (SendGrid/Mailgun)
2. Verify your domain with SPF/DKIM records
3. Ask customers to whitelist your email
4. Avoid spam trigger words in subject lines

### Gmail "Less Secure App" Error

**Solution:**
- Don't use your regular Gmail password
- Use an App Password instead (see Option 1 above)
- Make sure 2-Step Verification is enabled

---

## Email Design Customization

### Colors

Change brand colors in the email HTML:
```javascript
// Primary color (gold)
background: linear-gradient(135deg, #ebc885 0%, #8f613c 100%);

// Accent color (brown)
color: #8f613c;

// Dark color
background-color: #20110b;
```

### Logo

Add your logo at the top of customer email:
```javascript
<tr>
  <td style="padding: 20px; text-align: center;">
    <img src="https://your-site.netlify.app/logo.svg" 
         alt="RootHaus" 
         style="width: 180px; height: auto;">
  </td>
</tr>
```

### Custom Footer

Edit the footer section:
```javascript
<p style="color: rgba(255,255,255,0.7); margin: 15px 0 0 0; font-size: 12px;">
  123 Heritage Lane, Lagos, Nigeria<br>
  <a href="tel:+2341234567890" style="color: #ebc885;">+234 123 456 7890</a> | 
  <a href="mailto:info@roothaus.com" style="color: #ebc885;">info@roothaus.com</a>
</p>
```

---

## Production Checklist

Before going live:

- [ ] Choose email service (Gmail/SendGrid/Mailgun/Custom)
- [ ] Set up SMTP credentials
- [ ] Add all environment variables to Netlify
- [ ] Configure Stripe webhook
- [ ] Test with a real purchase
- [ ] Check both customer and admin emails arrive
- [ ] Verify email design looks good on mobile
- [ ] Set up email monitoring (check spam folder)
- [ ] Add unsubscribe link (if sending marketing emails)
- [ ] Update business email address
- [ ] Customize email content and branding

---

## Support

**Email not sending?**
1. Check Netlify function logs
2. Verify environment variables
3. Test SMTP credentials manually
4. Check Stripe webhook logs

**Need help?**
- Stripe Docs: https://stripe.com/docs/webhooks
- Nodemailer Docs: https://nodemailer.com
- SendGrid Docs: https://docs.sendgrid.com

---

## Upgrading Email Service

As you grow, you may want to upgrade:

**100-1,000 orders/month:**
- SendGrid Free (100/day) or Starter ($19.95/month for 50k emails)

**1,000-10,000 orders/month:**
- Mailgun ($35/month for 50k emails)
- SendGrid Essentials ($19.95/month)

**10,000+ orders/month:**
- AWS SES ($0.10 per 1,000 emails)
- Enterprise email provider

---

Remember: **Start with Gmail for testing, then upgrade to SendGrid or a custom domain email for production!**