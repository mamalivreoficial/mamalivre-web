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
            this.size = 1 + Math.random() * 2; // Slightly larger for visibility with rectangles
            this.color = '#fff';
            this.friction = 0.8;
            this.ease = 0.1;
        }

        draw() {
            ctx.fillStyle = this.color;
            // fillRect is significantly faster than arc for thousands of particles
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }

        update() {
            let mdx = mouse.x - this.x;
            let mdy = mouse.y - this.y;
            let mdist = Math.sqrt(mdx * mdx + mdy * mdy);

            // ONLY calculate physics if mouse is nearby - saves CPU
            if (mdist < 120) {
                let force = (120 - mdist) / 120;
                this.x -= mdx * force * 0.15;
                this.y -= mdy * force * 0.15;
            }

            // High-performance catch back to base
            let dx = this.baseX - this.x;
            let dy = this.baseY - this.y;
            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                this.vx += dx * this.ease;
                this.vy += dy * this.ease;
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.x += this.vx;
                this.y += this.vy;
            }
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

        // VISIBLE GIGANTIC HEARTS: Positioned to be always on screen
        // Each heart will be 1.2x the text height
        const textWidth = tCtx.measureText('MAMALIVRE').width;
        tCtx.font = `${fontSize * 1.2}px Arial`; 
        // Hearts placed at 10% and 90% of the viewport width respectively
        tCtx.fillText('♥', width * 0.1, height / 2);
        tCtx.fillText('♥', width * 0.9, height / 2);

        const imageData = tCtx.getImageData(0, 0, width, height).data;
        // ORGANIC DENSITY: Step 4 with jitter for a natural star-dust feel
        const step = 4; 
        
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                if (imageData[(y * width + x) * 4 + 3] > 128) {
                    // Add slight random noise to break the grid pattern
                    const jitterX = (Math.random() - 0.5) * 3;
                    const jitterY = (Math.random() - 0.5) * 3;
                    particles.push(new Particle(x + jitterX, y + jitterY));
                }
            }
        }
        
        // Safety cap for high density
        if (particles.length > 2200) {
            particles = particles.filter((_, i) => i % 2 === 0).slice(0, 2200);
        }
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = canvas.width = window.innerWidth * dpr;
        height = canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        width /= dpr;
        height /= dpr;
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

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
        cancelAnimationFrame(animationId);
        resize();
        animate();
    });

    resize();
    animate();
    // No more text particles to wait for
})();
