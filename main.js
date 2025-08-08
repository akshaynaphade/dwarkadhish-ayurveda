import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// =================================================================================
// === YOUR FIREBASE CONFIGURATION ===
// =================================================================================
// =================================================================================
// === FIREBASE CONFIGURATION (Loaded via Environment Variables) ===
// =================================================================================
const firebaseConfig = {
    apiKey: "__FIREBASE_API_KEY__",
    authDomain: "__FIREBASE_AUTH_DOMAIN__",
    projectId: "__FIREBASE_PROJECT_ID__",
    storageBucket: "__FIREBASE_STORAGE_BUCKET__",
    messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
    appId: "__FIREBASE_APP_ID__",
    measurementId: "__FIREBASE_MEASUREMENT_ID__"
};
// =================================================================================
// =================================================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- DOM Elements ---
const productListContainer = document.getElementById('product-list');
const reviewsContainer = document.getElementById('reviews-container');
const seeMoreReviewsBtn = document.getElementById('see-more-reviews-btn');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const modalContainer = document.getElementById('modal-container');
const cartIcon = document.getElementById('cart-icon');
const cartCountEl = document.getElementById('cart-count');
const footerContainer = document.getElementById('contact');

// --- State ---
let cart = [];
const ownerWhatsAppNumber = '917219319312'; // Replace with owner's number

// --- Templates ---

const footerTemplate = () => `
    <div class="container mx-auto px-6 py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="md:col-span-1"><h3 class="font-serif text-2xl font-bold mb-4">Dwarkadhish<span class="text-warm-taupe"> Ayurveda</span></h3><p class="text-sm text-gray-400">Purity from a Sacred Land. Ancient wisdom for modern well-being.</p><div class="flex space-x-4 mt-6"><a href="https://www.instagram.com" target="_blank" class="text-gray-400 hover:text-white transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/></svg></a></div></div>
            <div class="text-sm"><h4 class="font-serif text-lg font-semibold mb-4 tracking-wider">Support</h4><p class="mt-2 text-gray-400">your.email@dwarkadhish.com</p><a href="https://wa.me/${ownerWhatsAppNumber}?text=Hi%2C%20I%20need%20help%20regarding%20products." target="_blank" class="mt-2 inline-block text-gray-400 hover:text-white transition-colors">Connect on WhatsApp</a></div>
            <div class="text-sm"><h4 class="font-serif text-lg font-semibold mb-4 tracking-wider">Quick Links</h4><a href="#" id="dosha-quiz-link" class="block mt-2 text-gray-400 hover:text-white transition-colors cursor-pointer">Dosha Quiz</a><a href="#" id="faq-link" class="block mt-2 text-gray-400 hover:text-white transition-colors cursor-pointer">FAQ</a><a href="YOUR_SHIPPING_PDF_LINK_HERE" target="_blank" class="block mt-2 text-gray-400 hover:text-white transition-colors">Shipping & Returns</a></div>
        </div>
        <div class="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs space-y-2">
            <p>&copy; 2025 Dwarkadhish Ayurveda. All Rights Reserved.</p>
            <p>Crafted with love ❤️ in Sangamner 📍</p>
        </div>
    </div>
`;

// --- Functions ---

function renderProducts(products) {
    if (!productListContainer) return;
    if (products.length === 0) {
        productListContainer.innerHTML = `<p class="text-center col-span-full text-gray-500">No products have been added yet.</p>`;
        return;
    }
    productListContainer.innerHTML = products.map(product => {
        // Use the first image as the default, or a placeholder if no images exist
        const defaultImage = product.images && product.images.length > 0
            ? product.images[0]
            : 'https://placehold.co/400x400/cccccc/161313?text=Image+Not+Found';

        return `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden group text-center">
            <div class="relative w-full h-80 product-carousel" data-product-id="${product.id}">
                ${product.images && product.images.length > 0
                    ? product.images.map((imgUrl, index) => `
                        <img src="${imgUrl}" alt="${product.name} image ${index + 1}" class="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-300 ease-in-out ${index === 0 ? 'opacity-100 z-10' : 'opacity-0'}" data-index="${index}">
                      `).join('')
                    : `<img src="${defaultImage}" alt="${product.name}" class="w-full h-full object-cover">`
                }

                ${product.images && product.images.length > 1 ? `
                    <button class="carousel-btn absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/50 p-2 rounded-full shadow-md z-20 opacity-0 group-hover:opacity-100 transition-opacity" data-direction="-1">
                        &#10094;
                    </button>
                    <button class="carousel-btn absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/50 p-2 rounded-full shadow-md z-20 opacity-0 group-hover:opacity-100 transition-opacity" data-direction="1">
                        &#10095;
                    </button>
                ` : ''}

                <button class="add-to-bag-btn absolute bottom-4 right-4 bg-white text-deep-charcoal font-bold py-2 px-4 rounded-full transition-all duration-300 z-20 shadow-lg hover:scale-105"
                    data-product-id="${product.id}"
                    data-product-name="${product.name}"
                    data-product-price="${product.price}"
                    data-product-image="${defaultImage}">
                    Add to Bag
                </button>
                 <div class="absolute bottom-4 left-4 bg-white/80 text-deep-charcoal font-bold py-2 px-4 rounded-full z-20">
                    ₹ ${product.price.toLocaleString('en-IN')}
                </div>
            </div>

            <div class="p-4">
                <h3 class="font-serif text-xl font-semibold">${product.name}</h3>
            </div>
        </div>
        `
    }).join('');
}

function renderReviews() {
    if (!reviewsContainer) return;
    reviewsContainer.innerHTML = `
        <div class="review-card bg-off-white p-6 rounded-lg shadow-sm text-left"><div class="flex items-start space-x-4"><img src="https://placehold.co/50x50/A39384/FFFFFF?text=P" alt="Priya S." class="w-12 h-12 rounded-full"><div><h4 class="font-bold font-serif text-lg">Priya S.</h4><p class="text-gray-600 mt-1">"Absolutely in love with the Radiance Serum! My skin has never felt so soft and looked so bright. It feels like a luxurious ritual every time I use it. Highly recommend!"</p></div></div></div>
        <div class="review-card bg-off-white p-6 rounded-lg shadow-sm text-left"><div class="flex items-start space-x-4"><img src="https://placehold.co/50x50/161313/FFFFFF?text=R" alt="Rohan M." class="w-12 h-12 rounded-full"><div><h4 class="font-bold font-serif text-lg">Rohan M.</h4><p class="text-gray-600 mt-1">"The Hydrating Cleanser is fantastic. It's gentle, smells amazing, and doesn't strip my skin. I've noticed a visible difference in my complexion since I started using it."</p></div></div></div>
        <div class="review-card bg-off-white p-6 rounded-lg shadow-sm text-left hidden"><div class="flex items-start space-x-4"><img src="https://placehold.co/50x50/A39384/FFFFFF?text=A" alt="Anjali K." class="w-12 h-12 rounded-full"><div><h4 class="font-bold font-serif text-lg">Anjali K.</h4><p class="text-gray-600 mt-1">"I was looking for authentic Ayurvedic products and I'm so glad I found this brand. The quality is top-notch and you can feel the purity of the ingredients. My skin is glowing!"</p></div></div></div>
        <div class="review-card bg-off-white p-6 rounded-lg shadow-sm text-left hidden"><div class="flex items-start space-x-4"><img src="https://placehold.co/50x50/161313/FFFFFF?text=V" alt="Vikram P." class="w-12 h-12 rounded-full"><div><h4 class="font-bold font-serif text-lg">Vikram P.</h4><p class="text-gray-600 mt-1">"The Nourishing Cream is my new favorite. It's rich without being greasy and has a very calming, natural scent. A perfect end to my day."</p></div></div></div>
        <div class="review-card bg-off-white p-6 rounded-lg shadow-sm text-left hidden"><div class="flex items-start space-x-4"><img src="https://placehold.co/50x50/A39384/FFFFFF?text=S" alt="Sunita D." class="w-12 h-12 rounded-full"><div><h4 class="font-bold font-serif text-lg">Sunita D.</h4><p class="text-gray-600 mt-1">"Finally, a brand that is transparent about its ingredients. The products feel incredibly pure and have worked wonders for my combination skin. I'm a customer for life."</p></div></div></div>
    `;
}

function toggleReviews() {
    const allReviews = reviewsContainer.querySelectorAll('.review-card');
    const isExpanded = seeMoreReviewsBtn.textContent === 'Show Less';

    allReviews.forEach((review, index) => {
        if (index > 1) {
            review.classList.toggle('hidden', isExpanded);
        }
    });
    
    seeMoreReviewsBtn.textContent = isExpanded ? 'See More Reviews' : 'Show Less';
}

function openCart() {
    const cartModalHTML = `
    <div id="cart-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
        <div id="cart-panel" class="w-full max-w-md h-full bg-off-white shadow-2xl flex flex-col transform translate-x-0 transition-transform duration-300 ease-in-out">
            <div class="flex justify-between items-center p-6 border-b"><h2 class="font-serif text-2xl font-semibold">Your Bag</h2><button id="close-cart-btn"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <div id="cart-items" class="flex-grow p-6 overflow-y-auto"></div>
            <div class="p-6 border-t bg-gray-50">
                <div class="flex justify-between items-center mb-4"><span class="font-semibold text-lg">Subtotal</span><span id="cart-subtotal" class="font-bold text-lg">₹ 0</span></div>
                <button class="w-full bg-deep-charcoal text-white py-3 rounded-lg font-bold hover:bg-warm-taupe transition-colors disabled:bg-deep-charcoal/50 disabled:cursor-not-allowed" id="place-order-btn">Place Order on WhatsApp</button>
            </div>
        </div>
    </div>`;
    modalContainer.innerHTML = cartModalHTML;
    updateCartUI();

    document.getElementById('close-cart-btn').addEventListener('click', closeCart);
    document.getElementById('cart-modal').addEventListener('click', (e) => {
        if (e.target.id === 'cart-modal') closeCart();
    });
    document.getElementById('cart-items').addEventListener('click', handleCartAction);
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
}

function closeCart() {
    const cartPanel = document.getElementById('cart-panel');
    if (cartPanel) {
        cartPanel.classList.add('translate-x-full');
        setTimeout(() => {
            modalContainer.innerHTML = '';
        }, 300);
    }
}

function updateCartUI() {
    const cartItemsEl = document.getElementById('cart-items');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const placeOrderBtn = document.getElementById('place-order-btn');

    if (cart.length === 0) {
        if (cartItemsEl) cartItemsEl.innerHTML = '<p class="text-gray-500 text-center py-10">Your bag is empty.</p>';
        if (placeOrderBtn) placeOrderBtn.disabled = true;
    } else {
        if (cartItemsEl) {
            cartItemsEl.innerHTML = cart.map(item => `
                <div class="flex items-center justify-between py-4 border-b" data-product-id="${item.id}">
                    <div class="flex items-center space-x-4">
                        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md" onerror="this.onerror=null;this.src='https://placehold.co/80x80/cccccc/161313?text=Img';">
                        <div>
                            <h4 class="font-semibold">${item.name}</h4>
                            <p class="text-sm text-gray-500">₹ ${item.price.toLocaleString('en-IN')}</p>
                            <div class="flex items-center mt-2 space-x-3">
                                <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
                                <span class="px-2 font-semibold">${item.quantity}</span>
                                <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold">₹ ${(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        <button class="remove-item-btn text-xs text-red-500 hover:underline mt-1" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            `).join('');
        }
        if (placeOrderBtn) placeOrderBtn.disabled = false;
    }
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = totalItems;
    cartCountEl.classList.toggle('scale-0', totalItems === 0);
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartSubtotalEl) cartSubtotalEl.textContent = `₹ ${subtotal.toLocaleString('en-IN')}`;
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
}

function handleCartAction(e) {
    const productId = e.target.dataset.id;
    if (!productId) return;
    const itemInCart = cart.find(item => item.id === productId);
    if (!itemInCart) return;

    if (e.target.matches('.remove-item-btn')) cart = cart.filter(item => item.id !== productId);
    if (e.target.matches('[data-action="increase"]')) itemInCart.quantity++;
    if (e.target.matches('[data-action="decrease"]')) {
        itemInCart.quantity--;
        if (itemInCart.quantity === 0) cart = cart.filter(item => item.id !== productId);
    }
    updateCartUI();
}

function placeOrder() {
    if (cart.length === 0) return '';
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let message = "Hello Dwarkadhish Ayurveda,\n\nI would like to place an order for the following items:\n\n";
    cart.forEach(item => {
        message += `- ${item.name} (Quantity: ${item.quantity})\n`;
    });
    message += `\n*Total: ₹ ${subtotal.toLocaleString('en-IN')}*\n\nPlease confirm my order.`;
    
    const whatsappUrl = `https://wa.me/${ownerWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// --- Event Listeners ---

// --- Carousel Logic ---
function handleCarousel(carousel, direction) {
    const images = carousel.querySelectorAll('img');
    let currentIndex = -1;
    images.forEach((img, index) => {
        if (img.classList.contains('opacity-100')) {
            currentIndex = index;
        }
    });

    const newIndex = (currentIndex + direction + images.length) % images.length;

    images[currentIndex].classList.remove('opacity-100', 'z-10');
    images[currentIndex].classList.add('opacity-0');

    images[newIndex].classList.remove('opacity-0');
    images[newIndex].classList.add('opacity-100', 'z-10');
}

// --- Add to Bag Button Click Effect ---
function handleAddToCartClick(button) {
    // 1. Add product to cart
    const productData = {
        id: button.dataset.productId,
        name: button.dataset.productName,
        price: parseFloat(button.dataset.productPrice),
        image: button.dataset.productImage,
    };
    addToCart(productData);

    // 2. Change button appearance
    button.classList.add('bg-green-500', 'text-white');
    button.textContent = 'Added ✓';
    button.disabled = true;

    // 3. Revert button after 2 seconds
    setTimeout(() => {
        button.classList.remove('bg-green-500', 'text-white');
        button.textContent = 'Add to Bag';
        button.disabled = false;
    }, 2000);
}



document.addEventListener('DOMContentLoaded', () => {
    footerContainer.innerHTML = footerTemplate();
    renderReviews();

    onSnapshot(collection(db, "products"), (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProducts(products);
    });

    seeMoreReviewsBtn.addEventListener('click', toggleReviews);
    
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    cartIcon.addEventListener('click', openCart);

    // Updated Event Listener for Products
    productListContainer.addEventListener('click', (e) => {
        const carouselBtn = e.target.closest('.carousel-btn');
        const addToBagBtn = e.target.closest('.add-to-bag-btn');

        if (carouselBtn) {
            const direction = parseInt(carouselBtn.dataset.direction, 10);
            const carousel = carouselBtn.closest('.product-carousel');
            handleCarousel(carousel, direction);
        }

        if (addToBagBtn) {
            handleAddToCartClick(addToBagBtn);
        }
    });
});
