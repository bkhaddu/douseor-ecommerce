// app.js

const state = {
  cart: [],
  currentProduct: null
};

// Auth State & Token Management
let jwtToken = localStorage.getItem('douseor_jwt_token') || null;
let currentUser = null;
let products = [];

// API Request Helper
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }
  
  // Resolve base URL dynamically to ensure we always hit our backend server
  let baseUrl = '';
  if (window.location.origin.startsWith('file://') || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    if (!window.location.origin.includes(':8080')) {
      baseUrl = 'http://localhost:8080';
    }
  }
  
  const response = await fetch(baseUrl + endpoint, {
    ...options,
    headers
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API Request Failed.');
  }
  return data;
}

// Load dynamic data from DB
async function loadProductsFromDB() {
  try {
    products = await apiRequest('/api/products');
    refreshAllGrids();
  } catch (err) {
    console.error('Failed to load products from database:', err);
  }
}

async function loadCurrentUserSession() {
  if (!jwtToken) {
    currentUser = null;
    updateAuthUI();
    return;
  }
  try {
    currentUser = await apiRequest('/api/auth/me');
    updateAuthUI();
  } catch (err) {
    console.error('Session expired or invalid:', err);
    logoutUser();
  }
}

const pdData = {
  id: 101, title: 'OBSIDIAN WOOL TRENCH', price: 1250, cat: 'OUTERWEAR / STRUCTURAL', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5pb_qupVAv6BIrc-162PloKENHcUGvDz2i-A-foC3Sa-8Hj_Sbr9_ZS81wX6V2SfZXwUXgHpzzhk4qnNBRNDswy1n7dMu9h2NE1UtewKKwNaCaeP_dmo8pp8qgfmiAm_QIjcGjzHyjLc6t9ACzK9FGh9d-apeiA37iAqwNXVy-v81aiq7adk94k7-NgpulGpjKaeju2fAy2fYnGrHR1sVgCXWTiZ-PchFCoQ0zb_cTpB-BoIStMSCCsw8CzEYI6kIDGUdIB-2H6k',
  desc: 'A severely structural take on the classic trench. Constructed from heavyweight obsidian wool, this garment forces a rigid silhouette. Features include concealed brutalist snap closures, zero-allowance shoulder padding, and a raw hem. Designed to impose authority over the surrounding environment.',
  thumbs: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD6Lyy2mVR1UyX7JH0b8F6JzFJhv0ANM_MkxDQZ_rQCpFJoNr2XBZjq2qcU2YYuqZPegP3opDhoun2wckJJO-0Lx-a_Suxvs6rPWCn-iRYafPjLjm_ajDDQemSBk5BiUn6A_xG7PaDLQKEfQ5uSs7M4SFx7CC2liLPyycHV8YLg8CunrC-iiVrdkldcVGsjB8U40G3Db5DjZMAW3w3cSYHQDlwBryM5CNFlx5NyiA1C_0j98-pbWO7pTYSDtYgdwGsxZtznbuKJVB0',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDF4Lh-gbs7-RuHTs8-SrfAoQKQd3YZmY9yy02ySR9ipvUHJpgiQJUcxuEv0xfddmMduaKZOTRlFijt8ricN-5nx8-mTgePIDDREZEAisb304il3y-qoJsj8ZgOawxgBsmlqjj2YukPBvmR9l08fO7luz-c-xOH17P7N84xPNUAW4DQe3urR1H--7Z490QiIDQWUFWLg-DKQanBqU0yqj3uRWcSQtNmXvF3BPkYB94WWdj5UrSNqt3BAAkmk3Zluv1fNhBxy0lWDn0',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC3LdH8M2ZSjAGC5aEet8SDgoLXvw8BMlPeP9l77BquE0G1ZTr891r2UXiDeUuBB0L0dSacxRPJySeIuy9jjI7MJ0yNZeYElvHhcBc_UYgxo8Nk6tORdcsfDTiQLXzPyFzgnHXUlf1g35P_r5TkBcNy1yH6r4ob1yHPq8q0vKraIFSQ5npDNxxdAeA2ZB-2thgCa7zs-dftcSzlxJd9nqKuLbjwpAO3P3bYxHDH-VUDrkzTuJRM3o-jiQxWxCwGlptIAC4hAIefkt8'
  ],
  sizes: ['XS', 'S', 'M', 'L'],
  unavailableSizes: ['L']
}

function refreshAllGrids() {
  renderProductGrid('featured-grid', products.slice(0,4));
  renderProductGrid('shop-grid', products);
  renderProductGrid('related-grid', products.slice(4,8));
  
  // Update item count on Shop page
  const countEl = document.querySelector('.item-count');
  if (countEl) {
    countEl.textContent = `${products.length} ITEMS`;
  }
}

async function init() {
  bindNav();
  initAccordions();
  initAdminPage();
  initAuthPage();
  
  // Load data asynchronously from MongoDB backend
  await loadCurrentUserSession();
  await loadProductsFromDB();
  
  // Start on home
  navigateTo('home');
}

function navigateTo(pageId) {
  // Navigation Guard: only admin can access admin portal
  if (pageId === 'admin') {
    if (!currentUser) {
      showToast('ACCESS RESTRICTED. LOGIN REQUIRED.');
      navigateTo('login');
      return;
    }
    if (currentUser.role !== 'admin') {
      showToast('ACCESS RESTRICTED. ADMIN STATUS REQUIRED.');
      navigateTo('home');
      return;
    }
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
  } else {
    document.getElementById('page-home').classList.add('active');
  }
  window.scrollTo(0,0);
  
  if (pageId === 'cart') renderCart();
  if (pageId === 'checkout') renderCheckoutSummary();
  if (pageId === 'admin') renderAdminInventory();
  
  // Close mobile nav if open
  document.getElementById('mobile-nav').classList.remove('open');
}

function bindNav() {
  // Event delegation to capture data-nav clicks dynamically
  document.addEventListener('click', (e) => {
    const navEl = e.target.closest('[data-nav]');
    if (navEl) {
      e.preventDefault();
      const target = navEl.getAttribute('data-nav');
      if (target === 'logout') {
        logoutUser();
      } else {
        navigateTo(target);
      }
    }
  });

  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('mobile-nav').classList.add('open');
  });
  
  document.getElementById('nav-close')?.addEventListener('click', () => {
    document.getElementById('mobile-nav').classList.remove('open');
  });

  document.getElementById('cart-toggle')?.addEventListener('click', () => navigateTo('cart'));
}

function formatPrice(num) {
  return `₹${num.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

function renderProductGrid(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  
  items.forEach(p => {
    const card = document.createElement('a');
    card.href = '#';
    card.className = 'product-card';
    card.onclick = (e) => {
      e.preventDefault();
      showProductDetail(p);
    };
    
    card.innerHTML = `
      <div class="pc-img-container">
        <img src="${p.img}" alt="${p.title}">
      </div>
      <div class="pc-info">
        <div>
          <div class="pc-title">${p.id < 10 ? '0'+p.id : p.id} / ${p.title}</div>
        </div>
        <div class="pc-price">${formatPrice(p.price)}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

function showProductDetail(product, skipNavigate = false) {
  state.currentProduct = { ...product, size: 'S' }; // default size
  
  const titleEl = document.getElementById('pd-title');
  const priceEl = document.getElementById('pd-price');
  const catEl = document.getElementById('pd-cat');
  const descEl = document.getElementById('pd-desc');
  const mainImg = document.getElementById('pd-main-img');
  
  if (titleEl) titleEl.textContent = product.title;
  if (priceEl) priceEl.textContent = formatPrice(product.price);
  if (catEl) catEl.textContent = product.cat;
  
  const customDesc = product.desc || 'CONSTRUCTED FROM BRUTALIST MINIMALIST SHAPES. EXTREME ATTENTION TO SILHOUETTE. DESIGNED TO STAND OUT IN MODERN GEOMETRIC PLAZAS.';
  if (descEl) descEl.innerHTML = `<p>${customDesc}</p>`;
  if (mainImg) mainImg.src = product.img;
  
  const thumbContainer = document.getElementById('pd-thumbs');
  if (thumbContainer) {
    thumbContainer.innerHTML = '';
    const allThumbs = product.thumbs && product.thumbs.length > 0 ? [product.img, ...product.thumbs] : [product.img];
    
    allThumbs.forEach((src, idx) => {
      const div = document.createElement('div');
      div.className = `pd-thumb ${idx === 0 ? 'active' : ''}`;
      div.innerHTML = `<img src="${src}" alt="Thumb">`;
      div.onclick = () => {
        if (mainImg) mainImg.src = src;
        document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
        div.classList.add('active');
      };
      thumbContainer.appendChild(div);
    });
  }
  
  // Sizes
  const sizeGrid = document.getElementById('size-grid');
  if (sizeGrid) {
    sizeGrid.innerHTML = '';
    const sizes = product.sizes || ['XS', 'S', 'M', 'L'];
    const unavailableSizes = product.unavailableSizes || ['L'];
    let selectedSize = 'S';
    state.currentProduct.size = selectedSize;
    
    sizes.forEach(s => {
      const div = document.createElement('div');
      div.className = `size-opt ${s === selectedSize ? 'selected' : ''} ${unavailableSizes.includes(s) ? 'disabled' : ''}`;
      div.textContent = s;
      if (!unavailableSizes.includes(s)) {
        div.onclick = () => {
          document.querySelectorAll('.size-opt').forEach(el => el.classList.remove('selected'));
          div.classList.add('selected');
          selectedSize = s;
          state.currentProduct.size = selectedSize;
        };
      }
      sizeGrid.appendChild(div);
    });
  }
  
  // Re-bind the click add to cart button
  const addBtn = document.getElementById('btn-add-cart');
  if (addBtn) {
    addBtn.onclick = () => {
      const item = { ...state.currentProduct, cartId: Date.now(), qty: 1 };
      
      const existing = state.cart.find(c => c.id === item.id && c.size === item.size);
      if (existing) {
        existing.qty += 1;
      } else {
        state.cart.push(item);
      }
      
      updateCartBadge();
      showToast(`ADDED ${item.title} TO CART`);
    };
  }
  
  if (!skipNavigate) navigateTo('product');
}

function initProductDetail() {
  if (products.length > 0) {
    showProductDetail(products[0], true);
  } else {
    showProductDetail(pdData, true);
  }
}

function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-accordion');
      const acc = document.getElementById(id);
      const isOpen = acc.classList.contains('open');
      
      // Close all
      document.querySelectorAll('.accordion').forEach(a => {
        a.classList.remove('open');
        a.querySelector('.acc-icon').textContent = 'add';
      });
      
      if (!isOpen) {
        acc.classList.add('open');
        acc.querySelector('.acc-icon').textContent = 'remove';
      }
    });
  });
}

function updateCartBadge() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cart-badge').textContent = count;
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const summaryPanel = document.getElementById('cart-summary-panel');
  const emptyCart = document.getElementById('empty-cart');
  
  document.getElementById('cart-title').textContent = `CART (${state.cart.reduce((sum, item) => sum + item.qty, 0)})`;
  
  if (state.cart.length === 0) {
    container.style.display = 'none';
    summaryPanel.style.display = 'none';
    emptyCart.style.display = 'block';
    return;
  }
  
  container.style.display = 'block';
  summaryPanel.style.display = 'block';
  emptyCart.style.display = 'none';
  
  container.innerHTML = '';
  
  let subtotal = 0;
  
  state.cart.forEach((item, index) => {
    subtotal += item.price * item.qty;
    
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="ci-img"><img src="${item.img}" alt="${item.title}"></div>
      <div class="ci-details">
        <div class="ci-top">
          <div>
            <div class="ci-title">${item.title}</div>
            <div class="ci-variant">SIZE: ${item.size}</div>
          </div>
          <div class="ci-price">${formatPrice(item.price)}</div>
        </div>
        <div class="ci-bottom">
          <div class="ci-qty-ctl">
            <button onclick="updateQty(${index}, -1)"><span class="material-symbols-outlined">remove</span></button>
            <span>${item.qty}</span>
            <button onclick="updateQty(${index}, 1)"><span class="material-symbols-outlined">add</span></button>
          </div>
          <button class="ci-remove" onclick="removeFromCart(${index})">REMOVE</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
  
  document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('cart-total').textContent = formatPrice(subtotal);
}

window.updateQty = (index, delta) => {
  if (state.cart[index].qty + delta > 0) {
    state.cart[index].qty += delta;
  } else {
    state.cart.splice(index, 1);
  }
  updateCartBadge();
  renderCart();
};

window.removeFromCart = (index) => {
  state.cart.splice(index, 1);
  updateCartBadge();
  renderCart();
};

function renderCheckoutSummary() {
  const container = document.getElementById('checkout-summary');
  let subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  let html = `<div><div class="flex flex-col gap-8 mb-8 border-b border-outline-variant pb-8">`;
  
  state.cart.forEach(item => {
    html += `
      <div style="display:flex; gap:16px; align-items:flex-start;">
        <div style="width:80px; height:100px; border:1px solid var(--outline-variant); position:relative;">
          <img src="${item.img}" style="width:100%; height:100%; object-fit:cover;">
          <div style="position:absolute; top:-8px; right:-8px; background:var(--primary); color:var(--on-primary); width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:10px;">${item.qty}</div>
        </div>
        <div style="flex-grow:1;">
          <div style="display:flex; justify-content:space-between; font-size:11px; letter-spacing:0.08em; text-transform:uppercase;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <span style="font-weight:700;">${item.title}</span>
              <span style="color:var(--secondary)">SIZE: ${item.size}</span>
            </div>
            <span>${formatPrice(item.price)}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  html += `</div>
    <div style="font-size:11px; letter-spacing:0.08em; text-transform:uppercase;">
      <div style="display:flex; justify-content:space-between; margin-bottom:16px; color:var(--on-surface-variant)">
        <span>SUBTOTAL</span><span>${formatPrice(subtotal)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:24px; color:var(--on-surface-variant)">
        <span>SHIPPING</span><span>FREE</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:baseline; border-top:1px solid var(--outline-variant); padding-top:24px; font-size:16px;">
        <span>TOTAL</span><span>${formatPrice(subtotal)}</span>
      </div>
    </div></div>
  `;
  
  container.innerHTML = html;
  
  // Pre-populate contact & shipping address fields if user is logged in
  if (currentUser) {
    const emailField = document.getElementById('cf-email');
    if (emailField && !emailField.value) {
      emailField.value = currentUser.email;
    }
    
    const addressField = document.getElementById('cf-address');
    if (addressField && !addressField.value) {
      addressField.value = currentUser.address || '';
    }
    
    const firstNameField = document.getElementById('cf-firstname');
    const lastNameField = document.getElementById('cf-lastname');
    if (currentUser.name && firstNameField && !firstNameField.value) {
      const nameParts = currentUser.name.split(' ');
      firstNameField.value = nameParts[0] || '';
      if (lastNameField && !lastNameField.value) {
        lastNameField.value = nameParts.slice(1).join(' ') || '';
      }
    }
  }
}

// Contact form handling
document.getElementById('contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('MESSAGE SENT SUCCESSFULLY');
  e.target.reset();
});

// Checkout form handling
document.getElementById('btn-pay')?.addEventListener('click', (e) => {
  e.preventDefault();
  
  const keyId = 'rzp_test_SqtBM9kBSOpcEg';
  
  let subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (subtotal <= 0) {
    showToast('YOUR CART IS EMPTY.');
    return;
  }
  
  // Ensure Razorpay SDK is loaded
  if (typeof Razorpay === 'undefined') {
    showToast('RAZORPAY GATEWAY ERROR: SDK NOT LOADED.');
    return;
  }
  
  // Validate shipping inputs
  const contactForm = document.getElementById('checkout-form');
  if (contactForm && !contactForm.reportValidity()) {
    return;
  }
  
  const emailInput = document.getElementById('cf-email');
  const email = emailInput ? emailInput.value.trim() : (currentUser ? currentUser.email : '');
  const addressVal = document.getElementById('cf-address')?.value.trim() || '';
  
  const options = {
    "key": keyId,
    "amount": Math.round(subtotal * 100), // in paise
    "currency": "INR",
    "name": "DOUSEOR",
    "description": `Purchase Order: DSR-${Date.now()}`,
    "image": "https://fonts.gstatic.com/s/i/materialsymbolsoutlined/shopping_bag/v16/24px.svg",
    "handler": async function (response) {
      showToast(`PAYMENT SUCCESSFUL. ID: ${response.razorpay_payment_id}`);
      
      // If user is logged in, sync/save address back to MongoDB if altered or new
      if (currentUser && addressVal && addressVal !== currentUser.address) {
        try {
          currentUser = await apiRequest('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify({ address: addressVal })
          });
          console.log('Address successfully saved to MongoDB:', currentUser.address);
        } catch (err) {
          console.error('Failed to sync address to database:', err);
        }
      }
      
      state.cart = [];
      updateCartBadge();
      navigateTo('home');
    },
    "prefill": {
      "email": email,
      "contact": ""
    },
    "theme": {
      "color": "#0d0d0d" // monochromatic brutalist theme
    },
    "modal": {
      "ondismiss": function() {
        showToast('PAYMENT PROCESS CANCELLED.');
      }
    }
  };
  
  try {
    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error(err);
    showToast(`RAZORPAY ERROR: ${err.message}`);
  }
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ADMIN LOGIC IMPLEMENTATION
let adminSelectedImageBase64 = null;
let editingProductId = null;

function renderAdminInventory() {
  const listEl = document.getElementById('admin-inventory-list');
  const countEl = document.getElementById('admin-inventory-count');
  if (!listEl || !countEl) return;
  
  countEl.textContent = products.length;
  listEl.innerHTML = '';
  
  if (products.length === 0) {
    listEl.innerHTML = '<p style="padding: 24px 0; text-align: center; color: var(--secondary); font-size: 11px; letter-spacing: 0.08em;">INVENTORY IS EMPTY</p>';
    return;
  }
  
  products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'admin-inventory-item';
    item.innerHTML = `
      <div class="admin-inv-left">
        <div class="admin-inv-img">
          <img src="${p.img}" alt="${p.title}">
        </div>
        <div class="admin-inv-details">
          <span class="admin-inv-title">${p.title}</span>
          <span class="admin-inv-meta">${p.cat} / ${formatPrice(p.price)}</span>
        </div>
      </div>
      <div class="admin-inv-actions" style="display:flex; gap:8px;">
        <button class="btn-edit-prod" onclick="editProductFromAdmin(${p.id})">EDIT</button>
        <button class="btn-delete-prod" onclick="deleteProductFromAdmin(${p.id})">DELETE</button>
      </div>
    `;
    listEl.appendChild(item);
  });
}

window.deleteProductFromAdmin = async (id) => {
  const p = products.find(prod => prod.id === id);
  if (!p) return;
  if (!confirm(`ARE YOU SURE YOU WANT TO DELETE ${p.title}?`)) return;
  
  try {
    await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
    showToast(`DELETED ${p.title}`);
    await loadProductsFromDB();
  } catch (err) {
    showToast(`DELETE FAILED: ${err.message}`);
  }
};

window.editProductFromAdmin = (id) => {
  const p = products.find(prod => prod.id === id);
  if (!p) return;
  
  editingProductId = p.id;
  
  // Set headers and form button states
  document.getElementById('admin-form-title').textContent = 'EDIT PRODUCT';
  document.getElementById('btn-add-product').textContent = 'SAVE CHANGES';
  document.getElementById('btn-cancel-edit').style.display = 'block';
  
  // Populate standard inputs
  document.getElementById('ap-title').value = p.title;
  document.getElementById('ap-price').value = p.price;
  document.getElementById('ap-cat').value = p.cat;
  document.getElementById('ap-desc').value = p.desc || '';
  
  // Populate image selector
  const toggleFile = document.getElementById('btn-toggle-file');
  const toggleUrl = document.getElementById('btn-toggle-url');
  const fieldFile = document.getElementById('field-file-upload');
  const fieldUrl = document.getElementById('field-url-upload');
  const dropzoneLabel = document.getElementById('file-dropzone-label');
  const previewContainer = document.getElementById('file-preview-container');
  const previewImg = document.getElementById('ap-file-preview');
  const urlInput = document.getElementById('ap-url');
  
  if (p.img && p.img.startsWith('data:image')) {
    // Loaded via file upload
    adminSelectedImageBase64 = p.img;
    previewImg.src = p.img;
    dropzoneLabel.style.display = 'none';
    previewContainer.style.display = 'flex';
    
    toggleFile.click();
  } else {
    // Loaded via URL
    urlInput.value = p.img || '';
    adminSelectedImageBase64 = null;
    dropzoneLabel.style.display = 'flex';
    previewContainer.style.display = 'none';
    
    toggleUrl.click();
  }
  
  // Scroll to form cleanly
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.cancelProductEdit = () => {
  editingProductId = null;
  
  // Reset form headers and buttons
  document.getElementById('admin-form-title').textContent = 'ADD PRODUCT';
  document.getElementById('btn-add-product').textContent = 'ADD PRODUCT TO INVENTORY';
  document.getElementById('btn-cancel-edit').style.display = 'none';
  
  const form = document.getElementById('admin-product-form');
  if (form) form.reset();
  
  adminSelectedImageBase64 = null;
  document.getElementById('file-preview-container').style.display = 'none';
  document.getElementById('file-dropzone-label').style.display = 'flex';
};

function initAdminPage() {
  const form = document.getElementById('admin-product-form');
  if (!form) return;
  
  const toggleFile = document.getElementById('btn-toggle-file');
  const toggleUrl = document.getElementById('btn-toggle-url');
  const fieldFile = document.getElementById('field-file-upload');
  const fieldUrl = document.getElementById('field-url-upload');
  const fileInput = document.getElementById('ap-file');
  const urlInput = document.getElementById('ap-url');
  
  const dropzoneLabel = document.getElementById('file-dropzone-label');
  const previewContainer = document.getElementById('file-preview-container');
  const previewImg = document.getElementById('ap-file-preview');
  const removePreviewBtn = document.getElementById('btn-remove-preview');
  const cancelBtn = document.getElementById('btn-cancel-edit');
  
  let uploadMode = 'file'; // or 'url'
  
  // Toggle buttons
  toggleFile.onclick = () => {
    uploadMode = 'file';
    toggleFile.classList.add('active');
    toggleUrl.classList.remove('active');
    fieldFile.style.display = 'block';
    fieldUrl.style.display = 'none';
    urlInput.removeAttribute('required');
  };
  
  toggleUrl.onclick = () => {
    uploadMode = 'url';
    toggleUrl.classList.add('active');
    toggleFile.classList.remove('active');
    fieldUrl.style.display = 'block';
    fieldFile.style.display = 'none';
    urlInput.setAttribute('required', 'true');
  };
  
  // File change reader
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        adminSelectedImageBase64 = event.target.result;
        previewImg.src = adminSelectedImageBase64;
        dropzoneLabel.style.display = 'none';
        previewContainer.style.display = 'flex';
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove preview
  removePreviewBtn.onclick = () => {
    adminSelectedImageBase64 = null;
    fileInput.value = '';
    previewContainer.style.display = 'none';
    dropzoneLabel.style.display = 'flex';
  };
  
  // Cancel button binding
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      cancelProductEdit();
    };
  }
  
  // Form submission
  form.onsubmit = async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('ap-title').value.trim().toUpperCase();
    const price = parseFloat(document.getElementById('ap-price').value);
    const cat = document.getElementById('ap-cat').value;
    const desc = document.getElementById('ap-desc').value.trim();
    
    let img = null;
    if (uploadMode === 'file') {
      img = adminSelectedImageBase64;
      if (!img) {
        showToast('PLEASE UPLOAD AN IMAGE FILE');
        return;
      }
    } else {
      img = urlInput.value.trim();
      if (!img) {
        showToast('PLEASE ENTER AN IMAGE URL');
        return;
      }
    }
    
    try {
      if (editingProductId !== null) {
        // Editing existing product in DB
        await apiRequest(`/api/products/${editingProductId}`, {
          method: 'PUT',
          body: JSON.stringify({ title, price, cat, img, desc })
        });
        showToast(`UPDATED ${title} SUCCESSFULLY`);
        cancelProductEdit();
      } else {
        // Adding new product to DB
        await apiRequest('/api/products', {
          method: 'POST',
          body: JSON.stringify({ title, price, cat, img, desc })
        });
        showToast(`ADDED ${title} SUCCESSFULLY`);
        
        // Reset form and UI
        form.reset();
        adminSelectedImageBase64 = null;
        previewContainer.style.display = 'none';
        dropzoneLabel.style.display = 'flex';
      }
      
      // Reload products and refresh views
      await loadProductsFromDB();
    } catch (err) {
      showToast(`FAILED: ${err.message}`);
    }
  };
}

// AUTHENTICATION LOGIC & FORM WIRING
function initAuthPage() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const isAdminCheckbox = document.getElementById('rg-is-admin');
  const adminCodeField = document.getElementById('field-admin-code');
  const adminCodeInput = document.getElementById('rg-admin-code');

  // Toggle admin passcode input
  if (isAdminCheckbox && adminCodeField) {
    isAdminCheckbox.onchange = () => {
      if (isAdminCheckbox.checked) {
        adminCodeField.style.display = 'flex';
        adminCodeInput.setAttribute('required', 'true');
      } else {
        adminCodeField.style.display = 'none';
        adminCodeInput.removeAttribute('required');
      }
    };
  }

  // Handle Login submission
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('li-email').value.trim().toLowerCase();
      const password = document.getElementById('li-password').value;

      try {
        const data = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        
        jwtToken = data.token;
        localStorage.setItem('douseor_jwt_token', jwtToken);
        currentUser = data.user;
        
        updateAuthUI();
        showToast(`WELCOME BACK, ${currentUser.name}`);
        
        if (currentUser.role === 'admin') {
          navigateTo('admin');
        } else {
          navigateTo('home');
        }
        loginForm.reset();
      } catch (err) {
        showToast(err.message || 'INVALID EMAIL OR PASSWORD.');
      }
    };
  }

  // Handle Register submission
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('rg-name').value.trim().toUpperCase();
      const email = document.getElementById('rg-email').value.trim().toLowerCase();
      const password = document.getElementById('rg-password').value;
      const address = document.getElementById('rg-address')?.value.trim() || '';
      const isAdmin = isAdminCheckbox ? isAdminCheckbox.checked : false;

      let role = 'user';
      if (isAdmin) {
        const adminPasscode = adminCodeInput ? adminCodeInput.value.trim() : '';
        if (adminPasscode !== 'DOUSEOR2026') {
          showToast('INVALID SYSTEM ADMIN PASSCODE.');
          return;
        }
        role = 'admin';
      }

      try {
        const data = await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, role, address })
        });
        
        jwtToken = data.token;
        localStorage.setItem('douseor_jwt_token', jwtToken);
        currentUser = data.user;
        
        updateAuthUI();
        showToast(`ACCOUNT CREATED. WELCOME ${name}`);
        
        registerForm.reset();
        if (isAdminCheckbox) isAdminCheckbox.checked = false;
        if (adminCodeField) adminCodeField.style.display = 'none';
        if (adminCodeInput) adminCodeInput.removeAttribute('required');

        if (role === 'admin') {
          navigateTo('admin');
        } else {
          navigateTo('home');
        }
      } catch (err) {
        showToast(err.message || 'REGISTRATION FAILED.');
      }
    };
  }
}

function logoutUser() {
  const name = currentUser ? currentUser.name : '';
  currentUser = null;
  jwtToken = null;
  localStorage.removeItem('douseor_jwt_token');
  updateAuthUI();
  if (name) showToast(`LOGGED OUT ${name}`);
  navigateTo('home');
}

function updateAuthUI() {
  const headerBanner = document.getElementById('header-user-banner');
  const authTrigger = document.getElementById('nav-auth-trigger');
  const authIcon = document.getElementById('nav-auth-icon');
  
  const mobAdmin = document.getElementById('mobile-nav-admin');
  const mobAuth = document.getElementById('mobile-nav-auth');
  
  const footAdmin = document.getElementById('footer-nav-admin');
  const footAuth = document.getElementById('footer-nav-auth');
  
  if (currentUser) {
    // Logged In
    if (headerBanner) {
      headerBanner.textContent = `USER: ${currentUser.name} (${currentUser.role.toUpperCase()})`;
      headerBanner.style.display = 'inline-block';
    }
    if (authTrigger) {
      authTrigger.setAttribute('data-nav', 'logout');
      authTrigger.title = 'LOGOUT';
    }
    if (authIcon) {
      authIcon.textContent = 'logout';
    }
    
    // Mobile menu drawer
    if (mobAdmin) {
      mobAdmin.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    }
    if (mobAuth) {
      mobAuth.textContent = 'LOGOUT';
      mobAuth.setAttribute('data-nav', 'logout');
    }
    
    // Footer
    if (footAdmin) {
      footAdmin.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    }
    if (footAuth) {
      footAuth.textContent = 'LOGOUT';
      footAuth.setAttribute('data-nav', 'logout');
    }
  } else {
    // Logged Out
    if (headerBanner) {
      headerBanner.style.display = 'none';
    }
    if (authTrigger) {
      authTrigger.setAttribute('data-nav', 'login');
      authTrigger.title = 'LOGIN';
    }
    if (authIcon) {
      authIcon.textContent = 'person';
    }
    
    // Mobile menu drawer
    if (mobAdmin) mobAdmin.style.display = 'none';
    if (mobAuth) {
      mobAuth.textContent = 'LOGIN';
      mobAuth.setAttribute('data-nav', 'login');
    }
    
    // Footer
    if (footAdmin) footAdmin.style.display = 'none';
    if (footAuth) {
      footAuth.textContent = 'LOGIN';
      footAuth.setAttribute('data-nav', 'login');
    }
  }
}

// Initial populate to show it working
state.cart.push({ ...pdData, size: 'M', cartId: 1, qty: 1 });
state.cart.push({ ...products[1], size: 'L', cartId: 2, qty: 1 });
updateCartBadge();

document.addEventListener('DOMContentLoaded', init);
