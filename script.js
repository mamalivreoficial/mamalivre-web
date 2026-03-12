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

    // Change glow color based on hover target
    const interactiveElements = document.querySelectorAll('a, button, .product-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorGlow.style.background = 'radial-gradient(circle, var(--neon-teal-dim) 0%, rgba(0,0,0,0) 70%)';
        });
        el.addEventListener('mouseleave', () => {
            cursorGlow.style.background = 'radial-gradient(circle, var(--neon-magenta-dim) 0%, rgba(0,0,0,0) 70%)';
        });
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
    const reveals = document.querySelectorAll('.reveal');

    function reveal() {
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

    // 8. Shop Dynamic Product Rendering (via JSON Fetch)
    const shopGrid = document.getElementById('shop-product-grid');
    if (shopGrid) {
        fetch('data/products.json')
            .then(response => response.json())
            .then(data => {
                shopGrid.innerHTML = ''; // Clear existing
                const productsArray = data.products || data; // Handle object wrapper or direct array
                
                productsArray.forEach((product, index) => {
                    const cardHTML = `
                        <div class="product-card">
                            <div class="card-glass">
                                <div class="card-glow"></div>
                                <div class="product-img-wrap">
                                    <img src="${product.image}" alt="${product.name}" class="product-img">
                                </div>
                                <div class="product-info">
                                    <h3 style="display: flex; justify-content: space-between; align-items: center;">
                                        ${product.name}
                                        <span style="font-size: 0.9rem; color: var(--neon-teal); font-weight: 400;">${product.price}</span>
                                    </h3>
                                    <p>${product.description}</p>
                                    <a href="${product.link}" target="_blank" class="btn-outline">
                                        EU QUERO
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M5 12h14m-7-7 7 7-7 7"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                    shopGrid.insertAdjacentHTML('beforeend', cardHTML);
                });

                // Re-apply 3D tilt effect for newly injected cards
                const newCards = document.querySelectorAll('.card-glass');
                newCards.forEach(card => {
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
                
                // Re-run the reveal function for the generated reveal elements
                setTimeout(reveal, 100);
            })
            .catch(error => console.error("Erro carregando produtos da loja:", error));
    }
});
