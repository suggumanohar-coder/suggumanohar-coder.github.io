// ==========================================
// 1. SAFE RUN INITIALIZATION WRAPPER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById('theme-toggle'); 
    const heroSection = document.getElementById('about');
    const backgroundCanvas = document.getElementById('hero-canvas');
    
    if (!themeToggle || !heroSection || !backgroundCanvas) {
        console.error("Missing critical HTML elements! Check your IDs.");
        return;
    }

    const canvasContext = backgroundCanvas.getContext('2d');
    let width = 0, height = 0;
    let buffer1 = [];
    let buffer2 = [];

    // ==========================================
    // 2. THEME SYSTEM
    // ==========================================
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    // ==========================================
    // 3. SMOOTH SMOOTH GAUSSIAN RING PROPAGATION ENGINE
    // ==========================================
    function setupWaveBuffers() {
        width = heroSection.clientWidth || window.innerWidth;
        height = heroSection.clientHeight || window.innerHeight;
        backgroundCanvas.width = width;
        backgroundCanvas.height = height;
        
        const totalPixels = width * height;
        buffer1 = new Float32Array(totalPixels);
        buffer2 = new Float32Array(totalPixels);
    }
    setupWaveBuffers();
    window.addEventListener('resize', setupWaveBuffers);

    // Drops a beautifully smoothed ring with a perfectly customized width profile
    function dropSmoothRing(dx, dy, targetRadius, force) {
        // Broaden the sampling radius slightly to account for the smooth thickness transition
        const scanRadius = Math.ceil(targetRadius + 6);
        if (dx < scanRadius || dx > width - scanRadius || dy < scanRadius || dy > height - scanRadius) return;
        
        // Controlled ring width profile (~0.35x thicker than a raw 1px line)
        const ringThickness = 3.2; 
        
        for (let y = -scanRadius; y <= scanRadius; y++) {
            for (let x = -scanRadius; x <= scanRadius; x++) {
                const dist = Math.hypot(x, y);
                
                // Gaussian falloff centered right on the ring radius prevents hard aliasing pops
                const delta = Math.abs(dist - targetRadius);
                if (delta < ringThickness) {
                    const index = (dx + x) + (dy + y) * width;
                    const factor = Math.exp(-0.5 * Math.pow(delta / (ringThickness * 0.5), 2));
                    buffer1[index] += force * factor;
                }
            }
        }
    }

    // High sensitivity mouse state tracking
    let lastX = 0, lastY = 0;
    let lastDropTime = 0;

    window.addEventListener('mousemove', (e) => {
    const bounds = heroSection.getBoundingClientRect();
    if (e.clientX >= bounds.left && e.clientX <= bounds.right &&
        e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
        
        const relX = Math.floor(e.clientX - bounds.left);
        const relY = Math.floor(e.clientY - bounds.top);
        
        const distMoved = Math.hypot(relX - lastX, relY - lastY);
        const currentTime = performance.now();
        
        // >>> CHANGE THESE TWO NUMBERS TO REDUCE RIPPLES <<<
        if (distMoved > 25 && currentTime - lastDropTime > 120) { 
            
            // Dynamic Point-to-Big expansion simulation loop
            setTimeout(() => dropSmoothRing(relX, relY, 6,  2.5), 0);
            setTimeout(() => dropSmoothRing(relX, relY, 16, 4.0), 16);
            setTimeout(() => dropSmoothRing(relX, relY, 28, 5.5), 32);
            
            lastX = relX;
            lastY = relY;
            lastDropTime = currentTime;
        }
    }
});

    function processWaterSimulation() {
        const imgData = canvasContext.createImageData(width, height);
        const data = imgData.data;
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Dynamic Palette Anchors
        const baseR = isDark ? 9 : 255;
        const baseG = isDark ? 9 : 228;
        const baseB = isDark ? 10 : 196;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = x + y * width;
                
                let waveHeight = (
                    buffer1[idx - 1] +
                    buffer1[idx + 1] +
                    buffer1[idx - width] +
                    buffer1[idx + width]
                ) * 0.5 - buffer2[idx];
                
                waveHeight *= 0.970; // Smooth wave energy conservation profile
                buffer2[idx] = waveHeight;
                
                let pixelPos = idx * 4;
                
                if (Math.abs(waveHeight) > 0.0002) {
                    const slopeX = buffer1[idx + 1] - buffer1[idx - 1];
                    const slopeY = buffer1[idx + width] - buffer1[idx - width];
                    
                    const mag = Math.sqrt(slopeX * slopeX + slopeY * slopeY);
                    const factor = Math.min(mag * 150, 0.85);
                    
                    const blend = Math.min(Math.max(-0.6, waveHeight * 12), 0.6);
                    
                    if (isDark) {
                        // DARK MODE: Refined deep charcoal slate valleys & sleek beige crest boundaries
                        const rDarkGrey = 34,  gDarkGrey = 34,  bDarkGrey = 38;   
                        const rBeige    = 214, gBeige    = 199, bBeige    = 183;  
                        
                        let targetR, targetG, targetB;
                        
                        if (blend > 0) {
                            targetR = baseR * (1 - blend) + rBeige * blend;
                            targetG = baseG * (1 - blend) + gBeige * blend;
                            targetB = baseB * (1 - blend) + bBeige * blend;
                        } else {
                            const absBlend = Math.abs(blend);
                            targetR = baseR * (1 - absBlend) + rDarkGrey * absBlend;
                            targetG = baseG * (1 - absBlend) + gDarkGrey * absBlend;
                            targetB = baseB * (1 - absBlend) + bDarkGrey * absBlend;
                        }
                        
                        data[pixelPos]     = Math.floor(baseR * (1 - factor) + targetR * factor);
                        data[pixelPos + 1] = Math.floor(baseG * (1 - factor) + targetG * factor);
                        data[pixelPos + 2] = Math.floor(baseB * (1 - factor) + targetB * factor);
                        data[pixelPos + 3] = 255;
                    } else {
                        // LIGHT MODE: Crystal Refractive Fluid Outlines
                        const rHighlight = 255, gHighlight = 253, bHighlight = 250; 
                        const rShadow    = 195, gShadow    = 170, bShadow    = 140; 
                        
                        let targetR, targetG, targetB;
                        
                        if (blend > 0) {
                            targetR = baseR * (1 - blend) + rHighlight * blend;
                            targetG = baseG * (1 - blend) + gHighlight * blend;
                            targetB = baseB * (1 - blend) + bHighlight * blend;
                        } else {
                            const absBlend = Math.abs(blend);
                            targetR = baseR * (1 - absBlend) + rShadow * absBlend;
                            targetG = baseG * (1 - absBlend) + gShadow * absBlend;
                            targetB = baseB * (1 - absBlend) + bShadow * absBlend;
                        }
                        
                        data[pixelPos]     = Math.floor(baseR * (1 - factor) + targetR * factor);
                        data[pixelPos + 1] = Math.floor(baseG * (1 - factor) + targetG * factor);
                        data[pixelPos + 2] = Math.floor(baseB * (1 - factor) + targetB * factor);
                        data[pixelPos + 3] = 255;
                    }
                } else {
                    data[pixelPos]     = baseR;
                    data[pixelPos + 1] = baseG;
                    data[pixelPos + 2] = baseB;
                    data[pixelPos + 3] = 255;
                }
            }
        }
        
        canvasContext.putImageData(imgData, 0, 0);
        
        let temp = buffer1;
        buffer1 = buffer2;
        buffer2 = temp;
        
        requestAnimationFrame(processWaterSimulation);
    }

    requestAnimationFrame(processWaterSimulation);
});
