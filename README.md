# RootHaus - Luxury Nigerian-Inspired Leather Goods

A modern, SEO-optimized e-commerce website built with vanilla HTML, CSS, and JavaScript, integrated with Stripe for payments and deployed on Netlify.

## Features

✅ **Fully Responsive Design** - Works seamlessly on all devices
✅ **SEO Optimized** - Meta tags, semantic HTML, fast loading
✅ **Sticky Navigation** - Hunter.io-style curved navbar
✅ **Working Shopping Cart** - Real-time updates with localStorage
✅ **Multi-Currency Support** - Automatic currency detection based on location
✅ **Stripe Integration** - Secure payment processing
✅ **Search Functionality** - Search across all products
✅ **Product Categories** - Men, Women, Pets, Accessories & Homewares
✅ **Modern 2025 Design** - Clean, minimal, luxury aesthetic

## Project Structure

```
roothaus/
├── index.html                  # Homepage
├── men.html                    # Men's collection
├── women.html                  # Women's collection
├── pets.html                   # Pets collection
├── accessories.html            # Accessories & Homewares
├── cart.html                   # Shopping cart
├── product.html                # Product detail page
├── heritage.html               # Brand story
├── contact.html                # Contact form
├── styles.css                  # Main stylesheet
├── app.js                      # Main JavaScript
├── logo.svg                    # Your logo file
├── package.json                # Dependencies
├── netlify.toml                # Netlify configuration
├── .env.example                # Environment variables template
└── netlify/
    └── functions/
        └── create-checkout-session.js  # Stripe checkout function
```

## Setup Instructions

### 1. Clone to VSCode

```bash
# Create a new folder and open in VSCode
mkdir roothaus
cd roothaus
code .
```

### 2. Create All Files

Copy and paste each generated file into your VSCode project following the structure above.

### 3. Add Your Logo

- Create or add your `logo.svg` file in the root directory
- The logo should work on both light and dark backgrounds

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from https://dashboard.stripe.com/apikeys
3. Copy `.env.example` to `.env` and add your keys:

```bash
cp .env.example .env
```

Edit `.env`:
```
STRIPE_PUBLIC_KEY=pk_test_your_actual_public_key
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
```

### 6. Set Up GitHub Repository

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - RootHaus website"

# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/roothaus.git
git branch -M main
git push -u origin main
```

### 7. Deploy to Netlify

#### Option A: Through Netlify UI
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Add environment variables in Netlify dashboard:
   - `STRIPE_PUBLIC_KEY`
   - `STRIPE_SECRET_KEY`
5. Deploy!

#### Option B: Through Netlify CLI
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### 8. Add Environment Variables in Netlify

1. Go to your site dashboard on Netlify
2. Navigate to Site settings → Environment variables
3. Add:
   - `STRIPE_PUBLIC_KEY`: Your Stripe publishable key
   - `STRIPE_SECRET_KEY`: Your Stripe secret key

### 9. Update Stripe Webhook (Production)

Once deployed, update your Stripe webhook URL:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-site.netlify.app/.netlify/functions/create-checkout-session`
3. Select events: `checkout.session.completed`

## Adding Products

Edit the `products` array in `app.js`:

```javascript
const products = [
    {
        id: 'unique-product-id',
        name: 'Product Name',
        category: 'men', // or 'women', 'pets', 'accessories'
        price: 450, // in USD
        currency: 'USD',
        image: 'images/products/your-image.jpg',
        description: 'Product description',
        inStock: true
    },
    // Add more products...
];
```

## Adding Product Images

1. Create an `images` folder in your root directory
2. Add subfolders:
   ```
   images/
   ├── products/          # Product images
   ├── category-men.jpg
   ├── category-women.jpg
   ├── category-pets.jpg
   ├── category-accessories.jpg
   └── iroko-tree.jpg
   ```

3. Optimize images before uploading:
   - Use WebP format when possible
   - Compress images (aim for <200KB per image)
   - Recommended size: 1200x1200px for products

## Testing Locally

```bash
# Run Netlify dev server
netlify dev
```

Visit http://localhost:8888

### Test Stripe Integration

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date, any CVC

## SEO Optimization

The site includes:
- ✅ Semantic HTML5 elements
- ✅ Meta descriptions on all pages
- ✅ Open Graph tags for social sharing
- ✅ Structured data (can be enhanced)
- ✅ Fast loading times
- ✅ Mobile-first responsive design
- ✅ Accessible navigation

### Adding Google Analytics

Add to `<head>` section of all HTML files:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary: #ebc885;    /* Golden/Sand */
    --secondary: #8f613c;  /* Rich Brown */
    --dark: #20110b;       /* Deep Brown/Black */
    --light: #faf8f5;      /* Off-white */
    --grey: #6b6b6b;       /* Grey */
}
```

### Fonts

Current fonts:
- Headings: Cormorant Garamond (serif)
- Body: Inter (sans-serif)

To change, update Google Fonts link in all HTML files.

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Performance

Target metrics:
- Lighthouse Score: 90+
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Largest Contentful Paint: <2.5s

## Security

- ✅ HTTPS enforced
- ✅ Stripe PCI compliance
- ✅ No sensitive data in localStorage
- ✅ Environment variables for secrets
- ✅ XSS protection headers

## Maintenance

### Regular Updates
- Update product inventory in `app.js`
- Add new product images to `images/products/`
- Monitor Stripe dashboard for orders
- Check Netlify analytics for traffic

### Backup
- Regular GitHub commits
- Netlify automatic deployments create backups

## Troubleshooting

### Cart not updating
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`

### Stripe checkout fails
- Verify environment variables in Netlify
- Check Stripe API keys are correct
- Ensure test mode is enabled for testing

### Currency not converting
- Check IP geolocation API is accessible
- Verify exchange rate API is responding
- Default fallback is USD

## Support

For issues or questions:
- Email: support@roothaus.com
- Documentation: This README
- Stripe Docs: https://stripe.com/docs

## License

© 2025 RootHaus - Root & Hide Co. All rights reserved.

---

Built with ❤️ using modern web technologies