/**
 * MAMALIVRE - Interactive Particle Hero Animation
 * Optimized for mamalivre.com
 */

(function() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let bgParticles = [];
    let emitters = [];
    let mouse = { x: -1000, y: -1000 };
    let animationId;

    const emitterItems = ['✦', '✧', '✨', '⭐', '★', 'x', '+', '✨'];
    
    // Smooth Gradient stops
    function getRainbowColor(percent) {
        let h;
        if (percent < 0.33) {
            h = 50 + (200 - 50) * (percent / 0.33); // Yellow to Blue
        } else if (percent < 0.66) {
            h = 200 + (280 - 200) * ((percent - 0.33) / 0.33); // Blue to Purple
        } else {
            h = 280 + (330 - 280) * ((percent - 0.66) / 0.34); // Purple to Pink
        }
        return `hsl(${h}, 90%, 65%)`;
    }

    class BgParticle {
        constructor(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 1.5 + 0.2; // Tiny dust and stars
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.speedY = (Math.random() - 0.5) * 0.2;
            // Cyber/Nebula colors (soft pinks, purples, blues)
            const hue = 250 + Math.random() * 100; // 250 to 350
            this.color = `hsla(${hue}, 80%, 70%, ${Math.random() * 0.4})`;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class Particle {
        constructor(x, y, color) {
            // Spawn closer to target for faster initial visibility
            this.x = x + (Math.random() - 0.5) * 200;
            this.y = y + (Math.random() - 0.5) * 200;
            this.baseX = x;
            this.baseY = y;
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = (Math.random() - 0.5) * 10;
            this.size = 0.7 + Math.random() * 0.9;
            this.color = color;
            this.friction = 0.88; 
            this.ease = 0.25; // Faster assembly
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            if (Math.random() > 0.98) {
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
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

            // Magnetic Subtlety
            let mdx = mouse.x - this.x;
            let mdy = mouse.y - this.y;
            let mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 100) {
                let force = Math.pow((100 - mdist) / 100, 3) * 2.5;
                this.vx -= mdx * force * 0.2;
                this.vy -= mdy * force * 0.2;
            }
        }
    }

    class Emitter {
        constructor(x, y) {
            // Spread them slightly around the cursor
            this.x = x + (Math.random() - 0.5) * 30;
            this.y = y + (Math.random() - 0.5) * 30;
            this.content = emitterItems[Math.floor(Math.random() * emitterItems.length)];
            this.vx = (Math.random() - 0.5) * 2.5;
            this.vy = (Math.random() - 0.5) * 2.5 - 1.5; // Drift upwards
            this.size = 12 + Math.random() * 18; // Bigger sparkles
            this.opacity = 0.8 + Math.random() * 0.2;
            this.rot = Math.random() * Math.PI * 2;
            this.color = getRainbowColor(Math.random());
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.font = `bold ${this.size}px Arial`;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rot + (1 - this.opacity));
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            ctx.fillText(this.content, 0, 0);
            ctx.restore();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.opacity -= 0.015; // Slower fade for longer trail
            this.vx += Math.sin(Date.now() * 0.003) * 0.15; // Cyber erratic movement
            this.rot += 0.03;
        }
    }

    function createTextParticles() {
        particles = [];
        const tCanvas = document.createElement('canvas');
        const tCtx = tCanvas.getContext('2d');
        tCanvas.width = width;
        tCanvas.height = height;

        // 1. Setup Font & Measure
        const fontSize = Math.min(width * 0.14, 110);
        tCtx.font = `bold ${fontSize}px Orbitron, sans-serif`;
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        const textWidth = tCtx.measureText('MAMALIVRE').width;

        // 2. Draw The Logo
        tCtx.fillStyle = 'white';
        tCtx.fillText('MAMALIVRE', width / 2, height / 2);

        // 3. Draw 2 Perfect Hearts (3x Font Size) flanking M and E
        tCtx.strokeStyle = 'white';
        tCtx.lineWidth = 1.2; 
        
        function drawPerfectHeart(ctx, x, y, size) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI); // Orbitron coordinate match
            ctx.beginPath();
            // Parametric heart equation
            for (let t = 0; t <= Math.PI * 2; t += 0.1) {
                const hx = 16 * Math.pow(Math.sin(t), 3);
                const hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
                if (t === 0) ctx.moveTo(hx * size/20, hy * size/20);
                else ctx.lineTo(hx * size/20, hy * size/20);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }

        let heartVisualSize = fontSize * 0.9; 
        let sideGap = fontSize * 0.6;
        let estimatedRadius = heartVisualSize * 0.8;
        
        // Prevent side cut-offs by checking available space
        const maxAvailableSpace = width/2 - textWidth/2;
        if (maxAvailableSpace < sideGap + estimatedRadius) {
            // Dynamically scale down hearts and gaps so they ALWAYS fit inside the canvas
            const allowedForSide = Math.max(10, maxAvailableSpace - 10);
            const totalNeeded = sideGap + estimatedRadius;
            const shrinkRatio = allowedForSide / totalNeeded;
            
            sideGap *= shrinkRatio;
            heartVisualSize *= shrinkRatio;
        }

        // Vertically centering the heart
        const yOffset = (heartVisualSize * 6) / 20;
        
        const safeLeftX = width/2 - textWidth/2 - sideGap;
        const safeRightX = width/2 + textWidth/2 + sideGap;

        // Left Heart (next to M)
        drawPerfectHeart(tCtx, safeLeftX, height/2 + yOffset, heartVisualSize);
        // Right Heart (next to E)
        drawPerfectHeart(tCtx, safeRightX, height/2 + yOffset, heartVisualSize);

        const imageData = tCtx.getImageData(0, 0, width, height).data;
        const step = Math.max(1, Math.floor(width / 800)); // Finer sampling for better definition

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                if (imageData[index + 3] > 100) {
                    const relativeX = (x / width); 
                    const color = getRainbowColor(relativeX);
                    particles.push(new Particle(x, y, color));
                }
            }
        }
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = canvas.width = canvas.parentElement.clientWidth * dpr;
        height = canvas.height = canvas.parentElement.clientHeight * dpr;
        ctx.scale(dpr, dpr);
        width /= dpr;
        height /= dpr;
        
        // Setup initial background starfield
        bgParticles = [];
        let numBg = Math.floor((width * height) / 3000); // Density of space dust
        for(let i = 0; i < numBg; i++) {
            bgParticles.push(new BgParticle(width, height));
        }

        createTextParticles();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw Deep Space background
        bgParticles.forEach(bg => {
            bg.update();
            bg.draw(ctx);
        });

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        emitters.forEach((e, i) => {
            e.update();
            e.draw();
            if (e.opacity <= 0) emitters.splice(i, 1);
        });

        animationId = requestAnimationFrame(animate);
    }

    // Events
    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        // Increase spawn frequency heavily
        if (Math.random() > 0.4) {
            emitters.push(new Emitter(mouse.x, mouse.y));
            if(Math.random() > 0.6) emitters.push(new Emitter(mouse.x, mouse.y)); // Frequent bursts
        }
    });

    window.addEventListener('touchmove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        if (Math.random() > 0.4) {
            emitters.push(new Emitter(mouse.x, mouse.y));
            if(Math.random() > 0.6) emitters.push(new Emitter(mouse.x, mouse.y));
        }
    });

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationId);
        resize();
        animate();
    });

    // Start immediately if possible, then refine when font ready
    resize();
    animate();

    document.fonts.ready.then(() => {
        resize(); // Recalculate with correct font metrics
    });
})();
