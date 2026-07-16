// ==========================================
// 1. SAFE RUN INITIALIZATION WRAPPER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById('theme-toggle'); 
    const heroSection = document.getElementById('about');
    const backgroundCanvas = document.getElementById('hero-canvas');
    
    if (!themeToggle || !heroSection || !backgroundCanvas) {
        console.error("Missing critical HTML elements! Check your IDs ('theme-toggle', 'about', 'hero-canvas').");
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
    // 3. HD BIG & LONG-LASTING CONCENTRIC WAVE ENGINE
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

    function dropWater(dx, dy, radius, force) {
        if (dx < radius || dx > width - radius || dy < radius || dy > height - radius) return;
        
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                if (x * x + y * y < radius * radius) {
                    const index = (dx + x) + (dy + y) * width;
                    const dist = Math.sqrt(x * x + y * y);
                    const amount = Math.cos((dist / radius) * Math.PI * 0.5);
                    buffer1[index] += force * amount;
                }
            }
        }
    }

    // Time throttling controls the exact number of ripples allowed to spawn
    let lastDropTime = 0;
    window.addEventListener('mousemove', (e) => {
        const bounds = heroSection.getBoundingClientRect();
        if (e.clientX >= bounds.left && e.clientX <= bounds.right &&
            e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
            
            const currentTime = performance.now();
            // Limits wave drops to once every 60ms to eliminate visual crowding completely
            if (currentTime - lastDropTime > 60) {
                const relX = Math.floor(e.clientX - bounds.left);
                const relY = Math.floor(e.clientY - bounds.top);
                
                // Larger radius creates wider, sweeping physical rings
                dropWater(relX, relY, 24, 28); 
                lastDropTime = currentTime;
            }
        }
    });

    function processWaterSimulation() {
        const imgData = canvasContext.createImageData(width, height);
        const data = imgData.data;
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Base Background Colors
        // Light: Classic Bisque | Dark: Extra Deep Charcoal Greyish-Black
        const baseR = isDark ? 11 : 255;
        const baseG = isDark ? 11 : 228;
        const baseB = isDark ? 12 : 196;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = x + y * width;
                
                let waveHeight = (
                    buffer1[idx - 1] +
                    buffer1[idx + 1] +
                    buffer1[idx - width] +
                    buffer1[idx + width]
                ) * 0.5 - buffer2[idx];
                
                // Retaining 97.5% energy per frame makes the rings big, clear, and long-lasting
                waveHeight *= 0.975; 
                buffer2[idx] = waveHeight;
                
                let pixelPos = idx * 4;
                
                if (Math.abs(waveHeight) > 0.001) {
                    const slopeX = buffer1[idx + 1] - buffer1[idx - 1];
                    const slopeY = buffer1[idx + width] - buffer1[idx - width];
                    
                    const mag = Math.sqrt(slopeX * slopeX + slopeY * slopeY);
                    const factor = Math.min(mag * 200, 1.0);
                    
                    if (isDark) {
                        // DARK MODE: Very dark grey base transitioning to rich structural beige
                        const rDarkGrey = 42,  gDarkGrey = 42,  bDarkGrey = 48;   // Dark Slate Grey
                        const rBeige    = 220, gBeige    = 209, bBeige    = 196;  // Premium Beige
                        
                        let mixRatio = Math.min(mag * 120, 1.0);
                        
                        // Blend from dark grey highlights to deep beige peaks
                        const targetR = rDarkGrey * (1 - mixRatio) + rBeige * mixRatio;
                        const targetG = gDarkGrey * (1 - mixRatio) + gBeige * mixRatio;
                        const targetB = bDarkGrey * (1 - mixRatio) + bBeige * mixRatio;
                        
                        data[pixelPos]     = Math.floor(baseR * (1 - factor) + targetR * factor);
                        data[pixelPos + 1] = Math.floor(baseG * (1 - factor) + targetG * factor);
                        data[pixelPos + 2] = Math.floor(baseB * (1 - factor) + targetB * factor);
                        data[pixelPos + 3] = 255;
                    } else {
                        // LIGHT MODE: Identical matching ripple dimensions using glass refraction
                        const rHighlight = 255, gHighlight = 248, bHighlight = 240; 
                        const rShadow    = 205, gShadow    = 180, bShadow    = 150; 
                        
                        const slopeDir = slopeX + slopeY;
                        const blend = Math.min(Math.max(-1.0, slopeDir * 50), 1.0);
                        
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
