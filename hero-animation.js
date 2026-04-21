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
            this.x = x; // Instant formation
            this.y = y;
            this.baseX = x;
            this.baseY = y;
            this.vx = 0;
            this.vy = 0;
            this.size = 0.5 + Math.random() * 1.5;
            this.color = '#fff';
            this.friction = 0.95;
            this.ease = 0.1;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            let dx = this.baseX - this.x;
            let dy = this.baseY - this.y;
            this.vx += dx * this.ease;
            this.vy += dy * this.ease;
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.x += this.vx;
            this.y += this.vy;

            let mdx = mouse.x - this.x;
            let mdy = mouse.y - this.y;
            let mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 100) {
                let force = (100 - mdist) / 100;
                this.x -= mdx * force * 0.1; // Much lighter effect
                this.y -= mdy * force * 0.1;
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
        // ULTRA-PERFORMANCE: Sampling every 6 pixels for a massive font is still very sharp but 4x lighter.
        const step = 6; 
        
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                if (imageData[(y * width + x) * 4 + 3] > 128) {
                    particles.push(new Particle(x, y));
                }
            }
        }
        
        // Lightweight cap
        if (particles.length > 2000) {
            particles = particles.filter((_, i) => i % 2 === 0).slice(0, 2000);
        }
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = canvas.width = window.innerWidth * dpr;
        height = canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        width /= dpr;
        height /= dpr;
        createTextParticles();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Render logo particles when in hero viewport
        if (window.scrollY < window.innerHeight) {
            particles.forEach(p => {
                p.update();
                p.draw();
            });
        }

        // Render sparkles globally
        emitters.forEach((e, i) => {
            e.update();
            e.draw();
            if (e.opacity <= 0) emitters.splice(i, 1);
        });

        animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        if (Math.random() > 0.6) { // Balance between sparse and frequent
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
    document.fonts.ready.then(resize);
})();
