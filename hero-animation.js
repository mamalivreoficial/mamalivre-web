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
    let emitters = [];
    let mouse = { x: -1000, y: -1000 };
    let animationId;

    const emitterItems = ['❤️', '💖', '💕', 'M', 'm', '✨'];
    
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
            this.x = x;
            this.y = y;
            this.content = emitterItems[Math.floor(Math.random() * emitterItems.length)];
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.size = 6 + Math.random() * 8;
            this.opacity = 1;
            this.rot = Math.random() * Math.PI * 2;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.font = `${this.size}px Arial`;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rot + (1 - this.opacity));
            ctx.fillText(this.content, 0, 0);
            ctx.restore();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.opacity -= 0.015;
            this.vx += Math.sin(Date.now() * 0.001) * 0.05;
        }
    }

    function createTextParticles() {
        particles = [];
        const tCanvas = document.createElement('canvas');
        const tCtx = tCanvas.getContext('2d');
        tCanvas.width = width;
        tCanvas.height = height;

        // 1. Draw The Logo
        const fontSize = Math.min(width * 0.14, 110);
        tCtx.font = `bold ${fontSize}px Orbitron, sans-serif`;
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillStyle = 'white';
        tCtx.fillText('MAMALIVRE', width / 2, height / 2);

        // 2. Draw 2 Large, Thin Hearts on the sides
        tCtx.strokeStyle = 'white';
        tCtx.lineWidth = 2.5; // Thicker line for better particle sampling
        
        function drawThinHeart(ctx, x, y, sizeW, sizeH) {
            ctx.save();
            ctx.translate(x, y);
            ctx.beginPath();
            ctx.moveTo(0, -sizeH / 2);
            ctx.bezierCurveTo(-sizeW / 2, -sizeH, -sizeW, -sizeH / 4, 0, sizeH);
            ctx.bezierCurveTo(sizeW, -sizeH / 4, sizeW / 2, -sizeH, 0, -sizeH / 2);
            ctx.stroke();
            ctx.restore();
        }

        const hW = width * 0.18;
        const hH = height * 0.5;
        drawThinHeart(tCtx, width * 0.1, height / 2, hW, hH);
        drawThinHeart(tCtx, width * 0.9, height / 2, hW, hH);

        const imageData = tCtx.getImageData(0, 0, width, height).data;
        const step = Math.max(2, Math.floor(width / 600)); 
        const textWidth = fontSize * 3; // Wider mapping for gradient

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
        
        createTextParticles();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

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
        if (Math.random() > 0.85) emitters.push(new Emitter(mouse.x, mouse.y));
    });

    window.addEventListener('touchmove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        if (Math.random() > 0.8) emitters.push(new Emitter(mouse.x, mouse.y));
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
