let currentSha = null;
let currentProducts = [];
let defaultProductsJson = { products: [] };
let selectedProductId = null;
let savedPassword = sessionStorage.getItem('mama_admin_pwd') || '';

let siteConfigSha = null;
let currentSiteConfig = {};
let activeMainTab = 'products'; // 'products' or 'site'

document.addEventListener('DOMContentLoaded', () => {
    if (savedPassword) {
        showDashboard();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
    }
});

function login() {
    const pwd = document.getElementById('admin-password').value;
    if (!pwd) return;
    savedPassword = pwd;
    sessionStorage.setItem('mama_admin_pwd', savedPassword);
    showDashboard();
}

function logout() {
    sessionStorage.removeItem('mama_admin_pwd');
    savedPassword = '';
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

async function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    await loadProducts();
    await loadSiteConfig();
}

// MAIN TABS
function switchMainTab(tab) {
    activeMainTab = tab;
    document.getElementById('mtab-products').style.borderColor = tab === 'products' ? 'var(--neon-teal)' : '#333';
    document.getElementById('mtab-site').style.borderColor = tab === 'site' ? 'var(--neon-teal)' : '#333';
    document.getElementById('mtab-products').style.color = tab === 'products' ? '#fff' : '#888';
    document.getElementById('mtab-site').style.color = tab === 'site' ? '#fff' : '#888';

    if (tab === 'products') {
        document.getElementById('view-products').classList.remove('hidden');
        document.getElementById('view-site').classList.add('hidden');
        document.getElementById('btn-new-product').classList.remove('hidden');
        document.getElementById('btn-save').textContent = 'Salvar Produtos no Site';
        document.getElementById('save-status').textContent = 'Tudo atualizado';
        document.getElementById('save-status').style.color = '#888';
    } else {
        document.getElementById('view-products').classList.add('hidden');
        document.getElementById('view-site').classList.remove('hidden');
        document.getElementById('btn-new-product').classList.add('hidden');
        document.getElementById('btn-save').textContent = 'Salvar Textos no Site';
        document.getElementById('save-status').textContent = 'Tudo atualizado';
        document.getElementById('save-status').style.color = '#888';
    }
}

// ---- UPLOAD LOGIC ----
async function handleImageUpload(event, targetInputId) {
    const file = event.target.files[0];
    if (!file) return;

    const targetInput = document.getElementById(targetInputId);
    const oldVal = targetInput.value;
    targetInput.value = 'Fazendo Upload... Aguarde.';

    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Content = e.target.result.split(',')[1];
        
        try {
            const response = await fetch('/api/admin?type=upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: savedPassword,
                    filename: file.name.replace(/\s+/g, '-').toLowerCase(),
                    content: base64Content
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Erro no upload');
            }

            const data = await response.json();
            
            if (targetInputId === 'p-images') { // Corrected from 'p-extraImages' to 'p-images' based on context
                // If the input already has values, append the new URL
                const currentImages = oldVal === 'Fazendo Upload... Aguarde.' || !oldVal ? [] : oldVal.split(',').map(s => s.trim()).filter(s => s);
                currentImages.push(data.url);
                targetInput.value = currentImages.join(', ');
            } else {
                targetInput.value = data.url;
            }
            updatePreview();
            markUnsaved(); // Assuming markUnsaved is a function that exists
        } catch (error) {
            alert('Falha no upload: ' + error.message);
            targetInput.value = oldVal;
        }
    };
    reader.readAsDataURL(file);
}

// ---- SITE CONFIG LOGIC ----
async function loadSiteConfig() {
    try {
        const response = await fetch('/api/admin?type=site');
        if (!response.ok) throw new Error('Falha ao carregar site.json do GitHub');
        
        const data = await response.json();
        siteConfigSha = data.sha;
        currentSiteConfig = data.content || {};

        document.getElementById('s-heroLogo').value = currentSiteConfig.heroLogo || '';
        document.getElementById('s-heroVideo').value = currentSiteConfig.heroVideo || '';
        document.getElementById('s-homePrefix').value = currentSiteConfig.homeProductsTitlePrefix || '';
        document.getElementById('s-homeHighlight').value = currentSiteConfig.homeProductsTitleHighlight || '';
        document.getElementById('s-homeDesc').value = currentSiteConfig.homeProductsDesc || '';
        
        document.getElementById('s-customPrefix').value = currentSiteConfig.customTitlePrefix || '';
        document.getElementById('s-customHighlight').value = currentSiteConfig.customTitleHighlight || '';
        document.getElementById('s-customText1').value = currentSiteConfig.customText1 || '';
        document.getElementById('s-customText2').value = currentSiteConfig.customText2 || '';
        
        document.getElementById('s-shopLogo').value = currentSiteConfig.shopLogo || '';
        document.getElementById('s-shopDesc').value = currentSiteConfig.shopDesc || '';
    } catch (e) {
        console.error('Site config error:', e);
    }
}

function markSiteUnsaved() {
    if (activeMainTab === 'site') {
        document.getElementById('save-status').textContent = '⚠️ Alterações nos Textos não salvas';
        document.getElementById('save-status').style.color = '#ffaa00';
    }
}

function gatherSiteConfig() {
    return {
        heroLogo: document.getElementById('s-heroLogo').value,
        heroVideo: document.getElementById('s-heroVideo').value,
        homeProductsTitlePrefix: document.getElementById('s-homePrefix').value,
        homeProductsTitleHighlight: document.getElementById('s-homeHighlight').value,
        homeProductsDesc: document.getElementById('s-homeDesc').value,
        customTitlePrefix: document.getElementById('s-customPrefix').value,
        customTitleHighlight: document.getElementById('s-customHighlight').value,
        customText1: document.getElementById('s-customText1').value,
        customText2: document.getElementById('s-customText2').value,
        shopLogo: document.getElementById('s-shopLogo').value,
        shopDesc: document.getElementById('s-shopDesc').value
    };
}

// ---- PRODUCTS LOGIC ----
async function loadProducts() {
    try {
        const response = await fetch('/api/admin?type=products');
        if (!response.ok) throw new Error('Falha ao carregar produtos do GitHub');
        
        const data = await response.json();
        currentSha = data.sha;
        
        if (data.content && Array.isArray(data.content.products)) {
            defaultProductsJson = data.content;
            currentProducts = [...data.content.products];
        } else if (Array.isArray(data.content)) {
            defaultProductsJson = { products: data.content };
            currentProducts = [...data.content];
        }

        populateCategories();
        renderGrid();
    } catch (e) {
        // Suppress alert to prevent double popups, just log. We don't want to break the whole dash if products fail but site loads.
        console.error('Products error:', e);
    }
}

function populateCategories() {
    const categories = new Set();
    currentProducts.forEach(p => {
        if (p.category) categories.add(p.category.trim());
    });
    const datalist = document.getElementById('cat-suggestions');
    if (datalist) {
        datalist.innerHTML = Array.from(categories)
            .filter(Boolean)
            .map(c => `<option value="${c}">`)
            .join('');
    }
}

function renderGrid() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = currentProducts.map((p, index) => `
        <div class="product-card ${p.id === selectedProductId ? 'active' : ''}" 
             data-idx="${index}"
             draggable="true"
             onclick="selectProduct('${p.id}')"
             style="cursor: grab;">
            ${p.image ? `<img src="../${p.image}" class="cover-img">` : '<div class="cover-img">Sem Foto</div>'}
            <div class="card-info">
                <div class="category">${p.category}</div>
                <div class="name">${p.name}</div>
                <div class="price">R$ ${parseFloat(p.price.replace(',', '.')).toFixed(2).replace('.',',')}</div>
            </div>
        </div>
    `).join('');

    // Attach Drag and Drop Listeners
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragenter', handleDragEnter);
        card.addEventListener('dragleave', handleDragLeave);
        card.addEventListener('dragend', () => cards.forEach(c => c.style.opacity = '1'));
    });
}

// Drag & Drop Handlers
let dragSourceIndex = null;

function handleDragStart(e) {
    dragSourceIndex = this.getAttribute('data-idx');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.style.opacity = '0.4';
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
    this.style.border = '2px dashed var(--neon-teal)';
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
    this.style.border = '1px solid var(--border-color)';
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    this.classList.remove('drag-over');
    this.style.border = '1px solid var(--border-color)';
    
    document.querySelectorAll('.product-card').forEach(c => c.style.opacity = '1');
    
    const dragDestIndex = parseInt(this.getAttribute('data-idx'));
    dragSourceIndex = parseInt(dragSourceIndex);

    if (dragSourceIndex !== dragDestIndex && !isNaN(dragSourceIndex)) {
        const draggedItem = currentProducts.splice(dragSourceIndex, 1)[0];
        currentProducts.splice(dragDestIndex, 0, draggedItem);
        
        renderGrid();
        markUnsaved(); // Enable the "Save" button to show unsaved state
    }
    return false;
}

function filterGrid() {
    renderGrid(document.getElementById('search-products').value);
}

function selectProduct(id) {
    selectedProductId = id;
    renderGrid(document.getElementById('search-products').value);
    
    const prod = currentProducts.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('editor-container').classList.remove('hidden');

    document.getElementById('p-id').value = prod.id || '';
    document.getElementById('p-name').value = prod.name || '';
    document.getElementById('p-category').value = prod.category || 'Bags';
    document.getElementById('p-price').value = prod.price || '';
    document.getElementById('p-image').value = prod.image || '';
    document.getElementById('p-images').value = (prod.images || []).join(', ');
    document.getElementById('p-desc').value = prod.description || '';
    document.getElementById('p-link').value = prod.link || '';

    updatePreview();
}

function addNewProduct() {
    const newId = 'novo-produto-' + Date.now();
    const newProd = {
        id: newId,
        name: "Novo Produto",
        category: "Bags",
        price: "0,00",
        image: "",
        images: [],
        description: "Descrição da peça",
        link: ""
    };
    currentProducts.unshift(newProd);
    selectProduct(newId);
    document.getElementById('save-status').textContent = '⚠️ Alterações não salvas';
    document.getElementById('save-status').style.color = '#ffaa00';
}

function deleteCurrentProduct() {
    if(!selectedProductId) return;
    if(!confirm("Atenção! Tem certeza que deseja exluir este produto definitivamente?")) return;
    
    currentProducts = currentProducts.filter(p => p.id !== selectedProductId);
    selectedProductId = null;
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('editor-container').classList.add('hidden');
    renderGrid();
    document.getElementById('save-status').textContent = '⚠️ Alterações não salvas';
    document.getElementById('save-status').style.color = '#ffaa00';
}

function updatePreview() {
    if(!selectedProductId) return;

    const prod = currentProducts.find(p => p.id === selectedProductId);
    if (!prod) return;

    // Apply values from form to array
    prod.id = document.getElementById('p-id').value;
    prod.name = document.getElementById('p-name').value;
    prod.category = document.getElementById('p-category').value;
    prod.price = document.getElementById('p-price').value;
    prod.image = document.getElementById('p-image').value;
    
    const imgsRaw = document.getElementById('p-images').value;
    prod.images = imgsRaw ? imgsRaw.split(',').map(s => s.trim()).filter(s => s) : [];
    
    prod.description = document.getElementById('p-desc').value;
    prod.link = document.getElementById('p-link').value;

    // Update Live Preview UI
    document.getElementById('p-image-preview').src = '../' + prod.image;
    document.getElementById('p-image-preview').style.display = prod.image ? 'block' : 'none';

    document.getElementById('lp-main-img').src = '../' + prod.image;
    document.getElementById('lp-category').textContent = prod.category;
    document.getElementById('lp-name').textContent = prod.name;
    document.getElementById('lp-price').textContent = prod.price.startsWith('R$') ? prod.price : 'R$ ' + prod.price;
    document.getElementById('lp-desc').textContent = prod.description;

    document.getElementById('save-status').textContent = '⚠️ Alterações não salvas';
    document.getElementById('save-status').style.color = '#ffaa00';
    renderGrid(document.getElementById('search-products').value); // Re-render to update names in grid
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    
    if (tab === 'edit') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('tab-edit').classList.remove('hidden');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('tab-preview').classList.remove('hidden');
    }
}

async function saveToGitHub() {
    const btn = document.getElementById('btn-save');
    const originalText = btn.textContent;
    btn.textContent = 'Salvando...';
    btn.disabled = true;

    let payloadContent;
    let targetSha;
    let typeParam;

    if (activeMainTab === 'products') {
        defaultProductsJson.products = currentProducts;
        payloadContent = defaultProductsJson;
        targetSha = currentSha;
        typeParam = 'products';
    } else {
        payloadContent = gatherSiteConfig();
        targetSha = siteConfigSha;
        typeParam = 'site';
    }

    try {
        const response = await fetch(`/api/admin?type=${typeParam}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: savedPassword,
                sha: targetSha,
                content: payloadContent
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro desconhecido');
        }

        // Success
        if (activeMainTab === 'products') {
            currentSha = data.newSha;
        } else {
            siteConfigSha = data.newSha;
        }
        document.getElementById('save-status').textContent = '✓ Tudo atualizado no Site';
        document.getElementById('save-status').style.color = '#25D366';
        alert('Salvo com sucesso! O Vercel atualizará o site em 1 minuto.');
    } catch (e) {
        alert(e.message);
        if (e.message.includes('Senha')) {
            logout();
        }
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
