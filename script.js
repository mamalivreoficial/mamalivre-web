document.addEventListener('DOMContentLoaded', () => {
    // 1. Glowing Cursor Effect
    const cursorGlow = document.querySelector('.cursor-glow');
    let isMouseMoving = false;
    let mouseTimeout;

    document.addEventListener('mousemove', (e) => {
        isMouseMoving = true;
        
        // Use requestAnimationFrame for smoother performance
        requestAnimationFrame(() => {
            cursorGlow.style.left = `${e.clientX}px`;
            cursorGlow.style.top = `${e.clientY}px`;
        });
        
        // Expand glow when moving
        cursorGlow.style.width = '350px';
        cursorGlow.style.height = '350px';
        cursorGlow.style.opacity = '1';

        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
            cursorGlow.style.width = '200px';
            cursorGlow.style.height = '200px';
            cursorGlow.style.opacity = '0.5';
        }, 150);
    });

    // 1.5 Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Change glow color based on hover target (including dynamic ones)
    document.addEventListener('mouseover', (e) => {
        const el = e.target.closest('a, button, .product-card');
        if (el) {
            cursorGlow.style.background = 'radial-gradient(circle, var(--neon-teal-dim) 0%, rgba(0,0,0,0) 70%)';
        }
    });
    document.addEventListener('mouseout', (e) => {
        const el = e.target.closest('a, button, .product-card');
        if (el) {
            cursorGlow.style.background = 'radial-gradient(circle, var(--neon-magenta-dim) 0%, rgba(0,0,0,0) 70%)';
        }
    });

    // 2. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Reveal Elements on Scroll
    function reveal() {
        const reveals = document.querySelectorAll('.reveal');
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        reveals.forEach((revealEle) => {
            const elementTop = revealEle.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                revealEle.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', reveal);
    reveal(); // Trigger on initial load

    // 4. Parallax Effect for Hero Background
    const heroBg = document.querySelector('.hero-bg');
    window.addEventListener('scroll', () => {
        const scrollValue = window.scrollY;
        if (scrollValue < window.innerHeight) {
            heroBg.style.transform = `scale(1.05) translateY(${scrollValue * 0.4}px)`;
        }
    });

    // 5. 3D Tilt Effect for Product Cards
    const cards = document.querySelectorAll('.card-glass');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element.
            const y = e.clientY - rect.top;  // y position within the element.
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5; // Max rotation 5deg
            const rotateY = ((x - centerX) / centerX) * 5;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });

    // 6. 3D Tilt for Hero Glass
    const heroGlass = document.querySelector('.hero-glass');
    const heroSection = document.getElementById('hero-section');
    
    if (heroSection && heroGlass) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroGlass.getBoundingClientRect();
            // Calculate mouse position relative to center of the screen/section
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            
            // Moderate rotation values for a smooth effect
            const rotateX = (mouseY / centerY) * -10; 
            const rotateY = (mouseX / centerX) * 10;
            
            heroGlass.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        heroSection.addEventListener('mouseleave', () => {
            // Smoothly return to center
            heroGlass.style.transition = 'transform 0.5s ease-out';
            heroGlass.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            
            // Remove transition after it completes so hover works smoothly again
            setTimeout(() => {
                heroGlass.style.transition = 'transform 0.1s ease-out, border-color 0.3s ease';
            }, 500);
        });
    }

    // 7. Interactive Particles in Hero Background
    const canvas = document.getElementById('hero-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let numParticles = 80;

        // Resize canvas
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Mouse position for particle interaction
        let mouse = {
            x: null,
            y: null,
            radius: 150 // Area of influence
        }

        canvas.addEventListener('mousemove', function(event) {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        canvas.addEventListener('mouseout', function() {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        // Particle class
        class Particle {
            constructor(x, y, dx, dy, size, color) {
                this.x = x;
                this.y = y;
                this.dx = dx;
                this.dy = dy;
                this.size = size;
                this.color = color;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // Bounce off edges
                if (this.x + this.size > canvas.width || this.x - this.size < 0) {
                    this.dx = -this.dx;
                }
                if (this.y + this.size > canvas.height || this.y - this.size < 0) {
                    this.dy = -this.dy;
                }

                // Interaction with mouse
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                // Repel particles from mouse
                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    
                    // The closer, the stronger the force
                    let force = (mouse.radius - distance) / mouse.radius;
                    
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;
                    
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Drift slowly back towards base path or drift naturally
                    this.x += this.dx;
                    this.y += this.dy;
                }

                this.draw();
            }
        }

        function initParticles() {
            particles = [];
            // Mix of Neon Magenta and Neon Teal colors
            const colors = ['rgba(255, 0, 255, 0.6)', 'rgba(0, 255, 204, 0.6)', 'rgba(255, 255, 255, 0.3)'];
            
            for (let i = 0; i < numParticles; i++) {
                let size = (Math.random() * 3) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let dx = (Math.random() - 0.5) * 1;
                let dy = (Math.random() - 0.5) * 1;
                let color = colors[Math.floor(Math.random() * colors.length)];
                
                particles.push(new Particle(x, y, dx, dy, size, color));
            }
        }

        // Connecting lines between close particles
        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                    + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                    
                    if (distance < (canvas.width/10) * (canvas.height/10)) {
                        opacityValue = 1 - (distance/10000);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.15})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, innerWidth, innerHeight);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            connect();
        }

        // Only run animation if canvas is visible to save resources
        let observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    initParticles();
                    animate();
                }
            });
        });
        observer.observe(heroSection);
    }

    // 8. Shared Product Rendering Logic
    function createProductCard(product) {
        return `
            <div class="product-card reveal">
                <div class="card-glass">
                    <div class="card-glow"></div>
                    <div class="product-img-wrap">
                        <img src="${product.image}" alt="${product.name}" class="product-img">
                    </div>
                    <div class="product-info">
                        <h3 style="display: flex; justify-content: space-between; align-items: center;">
                            ${product.name}
                            <span style="font-size: 0.9rem; color: var(--neon-teal); font-weight: 400;">
                                ${product.price.startsWith('R$') ? product.price : 'R$ ' + product.price}
                            </span>
                        </h3>
                        <p>${product.description}</p>
                        
                        ${product.images && product.images.length > 0 ? `
                            <div class="gallery-dots">
                                <div class="dot active" data-img="${product.image}"></div>
                                ${product.images.map(img => `<div class="dot" data-img="${img}"></div>`).join('')}
                            </div>
                        ` : ''}

                        <a href="product.html?id=${product.id}" class="btn-outline">
                            VER DETALHES
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14m-7-7 7 7-7 7"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // New: Load product detail on product.html
    async function loadProductDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const root = document.getElementById('product-detail-root');

        if (!productId || !root) return;

        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            const products = data.products || data;
            const product = products.find(p => p.id === productId);

            if (!product) {
                root.innerHTML = `<div class="container" style="padding: 200px 5%; text-align: center;"><h2>Ops! Produto não encontrado.</h2><a href="shop.html" class="btn-outline" style="display:inline-block; margin-top:20px;">Voltar para Loja</a></div>`;
                return;
            }

            // Build detail HTML
            const waLink = `https://wa.me/5511959843718?text=${encodeURIComponent('Olá Priscila! Tenho interesse na peça: ' + product.name)}`;
            
            root.innerHTML = `
                <div class="product-detail-container">
                    <div class="detail-gallery reveal">
                        <div class="detail-main-img-wrap">
                            <img src="${product.image}" alt="${product.name}" class="detail-main-img" id="main-product-img">
                        </div>
                        ${product.images && product.images.length > 0 ? `
                            <div class="detail-thumbs">
                                <div class="thumb-item active" data-img="${product.image}">
                                    <img src="${product.image}" alt="Thumb">
                                </div>
                                ${product.images.map(img => `
                                    <div class="thumb-item" data-img="${img}">
                                        <img src="${img}" alt="Thumb">
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <div class="detail-content reveal">
                        <div class="detail-info-header">
                            <div class="detail-category">${product.category}</div>
                            <h1 class="detail-title">${product.name}</h1>
                            <div class="detail-price">${product.price.startsWith('R$') ? product.price : 'R$ ' + product.price}</div>
                        </div>

                        <div class="detail-full-desc">${product.description}</div>

                        <div class="buy-actions">
                            <a href="${waLink}" target="_blank" class="btn-whatsapp">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.031 6.172c-2.277 0-4.129 1.852-4.129 4.129 0 1.258.558 2.38 1.43 3.125l-.143.513c-.085.305-.285.586-.558.784.004-.002.348-.112.551-.112.235 0 .438.1.58.261.71.808 1.748 1.303 2.91 1.303 2.277 0 4.129-1.852 4.129-4.129 0-2.277-1.852-4.129-4.129-4.129zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.438 5.176l-1.438 5.235 5.35-1.405c1.458.83 3.141 1.309 4.935 1.309 5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.558 0-3.04-.423-4.322-1.163l-.31-.18-3.21.843.86-3.13-.197-.313c-.785-1.246-1.21-2.7-1.21-4.214 0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
                                </svg>
                                COMPRAR VIA WHATSAPP
                            </a>
                            <p style="text-align: center; color: #666; font-size: 0.8rem;">Vendas exclusivas via atendimento personalizado.</p>
                        </div>
                    </div>
                </div>
            `;

            // Reveal after built
            const detailContainer = document.querySelector('.product-detail-container');
            if (detailContainer) detailContainer.style.opacity = '1';

            // Init thumbnail logic
            document.querySelectorAll('.thumb-item').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                    document.getElementById('main-product-img').src = thumb.dataset.img;
                });
            });

            setTimeout(reveal, 100);

        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
        }
    }

    // Add function to handle gallery dots
    function initGalleries() {
        document.querySelectorAll('.gallery-dots').forEach(dots => {
            const card = dots.closest('.card-glass');
            const img = card.querySelector('.product-img');
            dots.querySelectorAll('.dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    img.src = dot.dataset.img;
                    dots.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
                    dot.classList.add('active');
                });
            });
        });

        // Make the whole card clickable for better UX
        document.querySelectorAll('.card-glass').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                // If it's a dot, the dot listener already handles it and stops propagation
                if (e.target.closest('.gallery-dots')) return;
                
                const productId = card.querySelector('.btn-outline').getAttribute('href').split('=')[1];
                if (productId) window.location.href = `product.html?id=${productId}`;
            });
        });
    }

    function applyTiltEffect(cards) {
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
            });
        });
    }

    const shopGrid = document.getElementById('shop-product-grid');
    const indexGrid = document.getElementById('index-product-grid');

    if (shopGrid || indexGrid) {
        fetch('data/products.json')
            .then(response => response.json())
            .then(data => {
                const products = data.products || data;

                if (indexGrid) {
                    indexGrid.innerHTML = products.slice(0, 3).map(createProductCard).join('');
                    applyTiltEffect(indexGrid.querySelectorAll('.card-glass'));
                    initGalleries();
                    setTimeout(reveal, 100);
                }

                if (shopGrid) {
                    const shopFiltersContainer = document.getElementById('dynamic-shop-filters');
                    
                    // Extract unique categories
                    const uniqueCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
                    const categories = ['Tudo', ...uniqueCategories];
                    
                    if (shopFiltersContainer) {
                        shopFiltersContainer.innerHTML = categories.map(cat => 
                            `<button class="btn-outline ${cat === 'Tudo' ? 'active-filter' : ''}">${cat}</button>`
                        ).join('');
                    }

                    const renderShop = (filter = 'Tudo') => {
                        const filtered = filter === 'Tudo' 
                            ? products 
                            : products.filter(p => p.category === filter);
                        
                        shopGrid.innerHTML = filtered.map(createProductCard).join('');
                        applyTiltEffect(shopGrid.querySelectorAll('.card-glass'));
                        initGalleries();
                        setTimeout(reveal, 100);
                    };

                    renderShop();

                    // Filter Logic (reattach listeners to dynamic buttons)
                    if (shopFiltersContainer) {
                        const filterBtns = shopFiltersContainer.querySelectorAll('.btn-outline');
                        filterBtns.forEach(btn => {
                            btn.addEventListener('click', () => {
                                filterBtns.forEach(b => b.classList.remove('active-filter'));
                                btn.classList.add('active-filter');
                                renderShop(btn.textContent.trim());
                            });
                        });
                    }
                }
            })
            .catch(error => console.error("Erro carregando produtos:", error));
    }

    // Initialize Detail Page if root exists
    if (document.getElementById('product-detail-root')) {
        loadProductDetail();
    }
});
