(function() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let emitters = [];
    let mouse = { x: -1000, y: -1000 };
    let animationId;

    const emitterItems = ['✦', '✧', '✨']; // Finer selection
    
    class Particle {
        constructor(x, y) {
            this.x = x; 
            this.y = y;
            this.baseX = x;
            this.baseY = y;
            this.vx = 0;
            this.vy = 0;
            this.size = 0.5 + Math.random() * 2.5; 
            this.color = '#fff';
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
            this.vy = (Math.random() - 0.5) * 1.5 - 1;
            this.size = 10 + Math.random() * 10;
            this.opacity = 1;
            this.color = '#ffbbf1'; // Soft pink for 'fofo'
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.font = `${this.size}px Arial`;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
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
        const maxTextWidth = width * 0.7;
        tCtx.font = `bold 100px Syncopate`; // Base for measuring
        const baseWidth = tCtx.measureText('MAMALIVRE').width;
        const fontSize = (maxTextWidth / baseWidth) * 100;
        
        tCtx.font = `bold ${fontSize}px Syncopate`; 
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillStyle = 'white';
        tCtx.fillText('MAMALIVRE', width / 2, height / 2);

        // Save fontSize for ghost rendering
        window.heroFontSize = fontSize;

        // VISIBLE GIGANTIC HEARTS: Positioned to be always on screen
        // Each heart will be 1.2x the text height
        const textWidth = tCtx.measureText('MAMALIVRE').width;
        tCtx.font = `${fontSize * 1.2}px Arial`; 
        // Hearts placed at 10% and 90% of the viewport width respectively
        tCtx.fillText('♥', width * 0.1, height / 2);
        tCtx.fillText('♥', width * 0.9, height / 2);

        const imageData = tCtx.getImageData(0, 0, width, height).data;
        // ULTRA-DENSITY: Step 2.5 for a perfect solid-yet-starry finish
        const step = 2.5; 
        
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                if (imageData[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] > 128) {
                    const jx = (Math.random() - 0.5) * 4;
                    const jy = (Math.random() - 0.5) * 4;
                    particles.push(new Particle(x + jx, y + jy));
                }
            }
        }
        
        if (particles.length > 6000) {
            // UNIFORM DISTRIBUTION: Shuffle to avoid 'top-only' cutting
            particles = particles.sort(() => Math.random() - 0.5).slice(0, 6000);
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

            // DRAW GHOST SOLID TEXT (Backbone for total legibility)
            ctx.font = `bold ${fontSize}px Syncopate`; 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; // Softer base for better blending
            
            const scatterY = (window.scrollY * 0.5);
            ctx.fillText('MAMALIVRE', width / 2, (height / 2) - scatterY);
            
            // Hearts Ghost
            ctx.font = `${fontSize * 1.2}px Arial`; 
            ctx.fillText('♥', (width * 0.1), (height / 2) - scatterY);
            ctx.fillText('♥', (width * 0.9), (height / 2) - scatterY);

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
