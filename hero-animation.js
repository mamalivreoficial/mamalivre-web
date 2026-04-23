(function() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let emitters = [];
    let mouse = { x: -1000, y: -1000 };
    let animationId;
    
    // COLOR LAB: URL Presets for testing
    const params = new URLSearchParams(window.location.search);
    const colorParam = params.get('color') || 'white';
    
    const COL_PRESETS = {
        white: { main: '#ffffff', glow: '#ffffff', blur: 10 },
        neon_pink: { main: '#ff00ff', glow: '#ff00ff', blur: 20 },
        soft_rose: { main: '#ffb6c1', glow: '#ffb6c1', blur: 5 },
        stellar_purple: { main: '#9400d3', glow: '#9400d3', blur: 15 },
        aurora: { main: 'aurora', glow: '#ffffff', blur: 12 }
    };
    
    const currentPreset = COL_PRESETS[colorParam] || COL_PRESETS.white;

    const emitterItems = ['✦', '✧', '✨', '♥']; // Added Herz back to mouse interaction
    
    class Particle {
        constructor(x, y) {
            this.x = x; 
            this.y = y;
            this.baseX = x;
            this.baseY = y;
            this.vx = 0;
            this.vy = 0;
            this.size = 0.5 + Math.random() * 2.5; 
            
            // Dynamic Color Logic
            if (currentPreset.main === 'aurora') {
                const rand = Math.random();
                this.color = rand > 0.6 ? '#ff00ff' : (rand > 0.3 ? '#9400d3' : '#ffffff');
            } else {
                this.color = currentPreset.main;
            }
            
            this.friction = 0.8;
            this.ease = 0.1;
            // Scroll scatter directions
            this.scatX = (Math.random() - 0.5) * 20;
            this.scatY = (Math.random() - 0.5) * 20;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }

        update() {
            const scroll = window.scrollY;
            const scatterForce = Math.min(scroll / 500, 1.5); // Adjust for speed

            // Target position shifts as you scroll (disintegration)
            let targetX = this.baseX + (this.scatX * scroll * 0.1);
            let targetY = this.baseY - (scroll * 0.5) + (this.scatY * scroll * 0.1); // Also flies up slightly

            let mdx = mouse.x - this.x;
            let mdy = mouse.y - this.y;
            let mdist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mdist < 120) {
                let force = (120 - mdist) / 120;
                this.x -= mdx * force * 0.15;
                this.y -= mdy * force * 0.15;
            }

            let dx = targetX - this.x;
            let dy = targetY - this.y;
            
            this.vx += dx * this.ease;
            this.vy += dy * this.ease;
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.x += this.vx;
            this.y += this.vy;
        }
    }

    class Emitter {
        constructor(x, y) {
            this.x = x + (Math.random() - 0.5) * 20;
            this.y = y + (Math.random() - 0.5) * 20;
            this.content = emitterItems[Math.floor(Math.random() * emitterItems.length)];
            this.vx = (Math.random() - 0.5) * 1.5;
            this.color = currentPreset.main === 'aurora' ? '#ff00ff' : currentPreset.main;
            this.glow = themeParam === 'light' ? 0 : 15; // Only glow in dark mode
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.font = `${this.size}px Arial`;
            ctx.fillStyle = this.color;
            if (this.glow > 0) {
                ctx.shadowColor = this.color;
                ctx.shadowBlur = this.glow;
            }
            ctx.fillText(this.content, this.x, this.y);
            ctx.restore();
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.opacity -= 0.02;
        }
    }

    function createTextParticles() {
        particles = [];
        const tCanvas = document.createElement('canvas');
        const tCtx = tCanvas.getContext('2d');
        tCanvas.width = width;
        tCanvas.height = height;

                // TOTAL IMPACT SCALE: Fitting to viewport width perfectly
        // We want the text 'MAMALIVRE' to take about 70% of the screen
        const maxTextWidth = width * 0.7; // Reverted to elegant original size
        tCtx.font = `bold 100px Syncopate`; // Base for measuring
        const baseWidth = tCtx.measureText('MAMALIVRE').width;
        const fontSize = (maxTextWidth / baseWidth) * 100;
        
        tCtx.font = `bold ${fontSize}px Syncopate`; 
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillStyle = 'white';
        tCtx.fillText('MAMALIVRE', width / 2, height / 2);
        
        // STARDUST HEARTS: Symmetrically placed as pixels
        tCtx.font = `bold ${fontSize * 0.8}px Arial`; 
        tCtx.fillText('♥', width * 0.12, height / 2);
        tCtx.fillText('♥', width * 0.88, height / 2);

        // Save fontSize for ghost rendering
        window.heroFontSize = fontSize;

        const imageData = tCtx.getImageData(0, 0, width, height).data;
        // ULTRA-DENSITY: Step 2.0 for a pure particle finish without solid base
        const step = 2.0; 
        
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                if (imageData[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] > 128) {
                    const jx = (Math.random() - 0.5) * 2;
                    const jy = (Math.random() - 0.5) * 2;
                    particles.push(new Particle(x + jx, y + jy));
                }
            }
        }
        
        if (particles.length > 8000) {
            particles = particles.sort(() => Math.random() - 0.5).slice(0, 8000);
        }
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = canvas.width = window.innerWidth * dpr;
        height = canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        width /= dpr;
        height /= dpr;
        document.fonts.ready.then(() => {
            createTextParticles(); 
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        const scroll = window.scrollY;
        // Fade out as we scroll: fully transparent by 400px
        const opacity = Math.max(1 - scroll / 400, 0);
        const fontSize = window.heroFontSize || 100;

        // Render high-density logo particles when in hero viewport
        if (opacity > 0) {
            ctx.save();
            ctx.globalAlpha = opacity;

            // NO SOLID BACKBONE: Only pixels (particles) as requested
            const scatterY = (window.scrollY * 0.5);
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.update();
                p.draw();
            }
            ctx.restore();
        }

        // Render sparkles globally with high performance
        for (let i = emitters.length - 1; i >= 0; i--) {
            const e = emitters[i];
            e.update();
            e.draw();
            if (e.opacity <= 0) emitters.splice(i, 1);
        }

        animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        
        // Subtle trail effect
        if (Math.random() > 0.4) {
            emitters.push(new Emitter(mouse.x, mouse.y));
        }
    });

    window.addEventListener('resize', () => {
        resize();
    });

    // START SINGLE LOOP
    resize();
    animate();
})();
