// ===== Configuration =====
const STRIPE_PUBLIC_KEY = 'your_stripe_public_key_here';
const CURRENCY_API = 'https://api.exchangerate-api.com/v4/latest/USD';

// ===== Product Database =====
const products = [
    {
        id: 'men-briefcase-001',
        name: 'Executive Briefcase',
        category: 'men',
        price: 450,
        currency: 'USD',
        image: 'images/products/men-briefcase-1.jpg',
        description: 'Handcrafted leather briefcase with brass hardware',
        inStock: true
    },
    {
        id: 'women-handbag-001',
        name: 'Heritage Tote',
        category: 'women',
        price: 380,
        currency: 'USD',
        image: 'images/products/women-tote-1.jpg',
        description: 'Elegant tote bag inspired by traditional Nigerian patterns',
        inStock: true
    },
    {
        id: 'pet-collar-001',
        name: 'Luxury Dog Collar',
        category: 'pets',
        price: 75,
        currency: 'USD',
        image: 'images/products/dog-collar-1.jpg',
        description: 'Premium leather collar with adjustable sizing',
        inStock: true
    },
    {
        id: 'accessories-wallet-001',
        name: 'Slim Wallet',
        category: 'accessories',
        price: 120,
        currency: 'USD',
        image: 'images/products/wallet-1.jpg',
        description: 'Minimalist wallet with RFID protection',
        inStock: true
    },
    {
        id: 'accessories-coaster-001',
        name: 'Leather Coaster Set',
        category: 'accessories',
        price: 45,
        currency: 'USD',
        image: 'images/products/accessories-coaster-1.jpg',
        description: 'Set of 4 premium leather coasters with natural edge finish',
        inStock: true
    },
    {
        id: 'men-wallet-001',
        name: 'Classic Leather Wallet',
        category: 'men',
        price: 120,
        currency: 'USD',
        image: 'images/products/men-wallet-1.jpg',
        description: 'Slim bifold wallet crafted from premium full-grain leather with RFID protection',
        inStock: true
    },
    {
        id: 'women-purse-001',
        name: 'Evening Clutch Purse',
        category: 'women',
        price: 180,
        currency: 'USD',
        image: 'images/products/women-purse-1.jpg',
        description: 'Elegant clutch purse perfect for special occasions, hand-stitched details',
        inStock: true
    },
    {
        id: 'women-bag-001',
        name: 'Structured Handbag',
        category: 'women',
        price: 420,
        currency: 'USD',
        image: 'images/products/women-bag-1.jpg',
        description: 'Sophisticated structured handbag with adjustable strap and brass accents',
        inStock: true
    },
    {
        id: 'pet-collar-002',
        name: 'Premium Cat Collar',
        category: 'pets',
        price: 65,
        currency: 'USD',
        image: 'images/products/pets-collar-2.jpg',
        description: 'Soft leather collar designed for cats, breakaway safety buckle included',
        inStock: true
    },
    {
        id: 'pet-collar-003',
        name: 'Studded Dog Collar',
        category: 'pets',
        price: 95,
        currency: 'USD',
        image: 'images/products/pets-collar-3.jpg',
        description: 'Bold leather collar with brass studs for medium to large dogs',
        inStock: true
    },
    {
        id: 'pet-leash-001',
        name: 'Leather Dog Leash',
        category: 'pets',
        price: 85,
        currency: 'USD',
        image: 'images/products/pets-leash-1.jpg',
        description: 'Premium 6-foot leather leash with comfortable padded handle',
        inStock: true
    },
   
];

// ===== State Management =====
let cart = JSON.parse(localStorage.getItem('roothaus_cart')) || [];
let userCurrency = 'USD';
let exchangeRates = {};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initSearch();
    initCart();
    detectUserCurrency();
    loadFeaturedProducts();
    initNewsletter();
    initMobileMenu();
});

// ===== Navbar Functions =====
function initNavbar() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (toggle) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }
}

// ===== Search Functions =====
function initSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchToggle.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
    });
    
    searchClose.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
    });
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        const results = products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
        
        displaySearchResults(results);
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchOverlay.classList.remove('active');
        }
    });
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">No products found</p>';
        return;
    }
    
    searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" onclick="window.location.href='product.html?id=${product.id}'">
            <img src="${product.image}" alt="${product.name}">
            <div>
                <h4>${product.name}</h4>
                <p>${formatPrice(product.price)}</p>
            </div>
        </div>
    `).join('');
}

// ===== Cart Functions =====
function initCart() {
    updateCartCount();
    
    // Listen for storage changes (for multi-tab sync)
    window.addEventListener('storage', (e) => {
        if (e.key === 'roothaus_cart') {
            cart = JSON.parse(e.newValue) || [];
            updateCartCount();
        }
    });
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    localStorage.setItem('roothaus_cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Added to cart!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('roothaus_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('roothaus_cart', JSON.stringify(cart));
            updateCartCount();
        }
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ===== Currency Detection =====
async function detectUserCurrency() {
    try {
        // Get user's location
        const locationResponse = await fetch('https://ipapi.co/json/');
        const locationData = await locationResponse.json();
        const countryCode = locationData.country_code;
        
        // Map country to currency
        const currencyMap = {
            'NG': 'NGN',
            'US': 'USD',
            'GB': 'GBP',
            'EU': 'EUR',
            'CA': 'CAD',
            'AU': 'AUD',
            'ZA': 'ZAR'
        };
        
        userCurrency = currencyMap[countryCode] || 'USD';
        
        // Fetch exchange rates
        const ratesResponse = await fetch(CURRENCY_API);
        const ratesData = await ratesResponse.json();
        exchangeRates = ratesData.rates;
        
        // Update all prices on page
        updatePricesOnPage();
        
    } catch (error) {
        console.error('Currency detection failed:', error);
        userCurrency = 'USD';
    }
}

function convertPrice(priceUSD, targetCurrency) {
    if (targetCurrency === 'USD') return priceUSD;
    const rate = exchangeRates[targetCurrency] || 1;
    return priceUSD * rate;
}

function formatPrice(priceUSD) {
    const convertedPrice = convertPrice(priceUSD, userCurrency);
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: userCurrency
    });
    return formatter.format(convertedPrice);
}

function updatePricesOnPage() {
    document.querySelectorAll('[data-price]').forEach(el => {
        const priceUSD = parseFloat(el.getAttribute('data-price'));
        el.textContent = formatPrice(priceUSD);
    });
}

// ===== Product Display =====
function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    const featuredProducts = products.slice(0, 4);
    
    container.innerHTML = featuredProducts.map(product => `
        <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price" data-price="${product.price}">${formatPrice(product.price)}</p>
            </div>
        </div>
    `).join('');
}

function loadCategoryProducts(category) {
    const container = document.getElementById('categoryProducts');
    if (!container) return;
    
    const categoryProducts = products.filter(p => p.category === category);
    
    if (categoryProducts.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 4rem;">No products found in this category.</p>';
        return;
    }
    
    container.innerHTML = categoryProducts.map(product => `
        <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price" data-price="${product.price}">${formatPrice(product.price)}</p>
            </div>
        </div>
    `).join('');
}

// ===== Product Detail =====
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update page content
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productPrice').textContent = formatPrice(product.price);
    document.getElementById('productPrice').setAttribute('data-price', product.price);
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productImage').src = product.image;
    document.getElementById('productImage').alt = product.name;
    
    // Add to cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantityInput').value);
        addToCart(product.id, quantity);
    });
}

// ===== Newsletter =====
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        
        // Here you would integrate with your email service
        // For now, just show success message
        showNotification('Thank you for subscribing!');
        form.reset();
    });
}

// ===== Notifications =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        background: ${type === 'success' ? '#8f613c' : '#e74c3c'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .search-result-item {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: white;
        border-radius: 10px;
        margin-bottom: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .search-result-item:hover {
        transform: translateX(10px);
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }
    .search-result-item img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
    }
    .search-result-item h4 {
        margin: 0 0 0.5rem 0;
        color: #20110b;
    }
    .search-result-item p {
        margin: 0;
        color: #8f613c;
        font-weight: 600;
    }
    @media (max-width: 768px) {
        .notification {
            right: 1rem;
            left: 1rem;
        }
    }
`;
document.head.appendChild(style);

// ===== Stripe Integration =====
async function initStripe() {
    const stripe = Stripe(STRIPE_PUBLIC_KEY);
    return stripe;
}

async function createCheckoutSession() {
    try {
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cart,
                currency: userCurrency
            })
        });
        
        const session = await response.json();
        const stripe = await initStripe();
        
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });
        
        if (result.error) {
            showNotification(result.error.message, 'error');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Checkout failed. Please try again.', 'error');
    }
}

// ===== Export functions for use in other pages =====
window.RootHaus = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    formatPrice,
    loadCategoryProducts,
    loadProductDetail,
    createCheckoutSession,
    cart,
    products
};