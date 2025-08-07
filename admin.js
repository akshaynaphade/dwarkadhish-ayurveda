import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM Elements ---
const adminLoginView = document.getElementById('admin-login-view');
const adminDashboardView = document.getElementById('admin-dashboard-view');
const adminProductListContainer = document.getElementById('admin-product-list');
const adminLoginForm = document.getElementById('admin-login-form');
const adminLoginError = document.getElementById('admin-login-error');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const productForm = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productImageInput = document.getElementById('product-image');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// --- State ---
let productToDeleteId = null;

// --- Functions ---

function renderAdminProducts(products) {
    if (!adminProductListContainer) return;
    adminProductListContainer.innerHTML = products.map(product => `
        <div class="flex items-center justify-between p-4 border rounded-md bg-white">
            <div class="flex items-center space-x-4">
                <img src="${product.image || 'https://placehold.co/64x64/cccccc/161313?text=No+Img'}" class="w-16 h-16 object-cover rounded-md">
                <div>
                    <p class="font-bold">${product.name}</p>
                    <p class="text-sm text-gray-600">₹ ${product.price.toLocaleString('en-IN')}</p>
                </div>
            </div>
            <div class="flex space-x-2">
                <button class="edit-product-btn p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" data-id="${product.id}">Edit</button>
                <button class="delete-product-btn p-2 bg-red-500 text-white rounded-md hover:bg-red-600" data-id="${product.id}">Delete</button>
            </div>
        </div>
    `).join('');
}

function resetProductForm() {
    productForm.reset();
    productIdInput.value = '';
    formTitle.textContent = 'Add New Product';
    cancelEditBtn.classList.add('hidden');
}

async function handleProductFormSubmit(e) {
    e.preventDefault();
    const productData = {
        name: productNameInput.value,
        price: parseFloat(productPriceInput.value),
        image: productImageInput.value
    };
    const id = productIdInput.value;

    try {
        if (id) {
            await updateDoc(doc(db, "products", id), productData);
        } else {
            await addDoc(collection(db, "products"), productData);
        }
        resetProductForm();
    } catch (error) {
        console.error("Error saving product: ", error);
        alert("Failed to save product.");
    }
}

async function handleAdminListClick(e) {
    const target = e.target;
    const id = target.dataset.id;
    if (!id) return;

    if (target.matches('.edit-product-btn')) {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const product = docSnap.data();
            productIdInput.value = docSnap.id;
            productNameInput.value = product.name;
            productPriceInput.value = product.price;
            productImageInput.value = product.image || '';
            formTitle.textContent = 'Edit Product';
            cancelEditBtn.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    }
    if (target.matches('.delete-product-btn')) {
        productToDeleteId = id;
        deleteConfirmModal.classList.remove('hidden');
        deleteConfirmModal.classList.add('flex');
    }
}

async function deleteProduct() {
    if (!productToDeleteId) return;
    try {
        await deleteDoc(doc(db, "products", productToDeleteId));
        closeDeleteModal();
    } catch (error) {
        console.error("Error deleting product: ", error);
        alert("Failed to delete product.");
    }
}

function closeDeleteModal() {
    productToDeleteId = null;
    deleteConfirmModal.classList.add('hidden');
    deleteConfirmModal.classList.remove('flex');
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, user => {
        if (user) {
            adminLoginView.style.display = 'none';
            adminDashboardView.style.display = 'block';
            onSnapshot(collection(db, "products"), (snapshot) => {
                const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderAdminProducts(products);
            });
        } else {
            adminLoginView.style.display = 'block';
            adminDashboardView.style.display = 'none';
        }
    });

    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminLoginError.textContent = '';
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Firebase Login Error:", error); 
            adminLoginError.textContent = `Login Failed. Details: ${error.code}`;
        }
    });

    adminLogoutBtn.addEventListener('click', () => signOut(auth));
    productForm.addEventListener('submit', handleProductFormSubmit);
    cancelEditBtn.addEventListener('click', resetProductForm);
    adminProductListContainer.addEventListener('click', handleAdminListClick);
    confirmDeleteBtn.addEventListener('click', deleteProduct);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
});
