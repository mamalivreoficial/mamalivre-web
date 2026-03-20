let currentSha = null;
let currentProducts = [];
let defaultProductsJson = { products: [] };
let selectedProductId = null;
let savedPassword = sessionStorage.getItem('mama_admin_pwd') || '';

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
}

async function loadProducts() {
    try {
        const response = await fetch('/api/admin');
        if (!response.ok) throw new Error('Falha ao carregar dados do GitHub');
        
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
        alert(e.message);
        console.error(e);
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

function renderGrid(filterText = '') {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    let toShow = currentProducts;
    if (filterText) {
        toShow = currentProducts.filter(p => 
            p.name.toLowerCase().includes(filterText.toLowerCase()) || 
            p.category.toLowerCase().includes(filterText.toLowerCase())
        );
    }

    if (toShow.length === 0) {
        grid.innerHTML = '<p style="color:#888;">Nenhum produto encontrado.</p>';
        return;
    }

    toShow.forEach(p => {
        const card = document.createElement('div');
        card.className = `p-card ${p.id === selectedProductId ? 'active' : ''}`;
        card.onclick = () => selectProduct(p.id);
        
        // Show R$ cleanly
        const priceFmt = p.price.startsWith('R$') ? p.price : `R$ ${p.price}`;
        
        card.innerHTML = `
            <div class="p-card-img" style="background-image: url('../${p.image}')"></div>
            <div class="p-card-info">
                <span class="p-cat">${p.category}</span>
                <span class="p-name">${p.name}</span>
                <span class="p-price">${priceFmt}</span>
            </div>
        `;
        grid.appendChild(card);
    });
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

    // Repackage exactly as before
    defaultProductsJson.products = currentProducts;

    try {
        const response = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: savedPassword,
                sha: currentSha,
                content: defaultProductsJson
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro desconhecido');
        }

        // Success
        currentSha = data.newSha;
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
