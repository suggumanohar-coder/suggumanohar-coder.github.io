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
    // 3. BALANCED CONCENTRIC WAVE ENGINE
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

    // Gentle mouse move listener to prevent ripple overcrowding
    let lastX = 0, lastY = 0;
    window.addEventListener('mousemove', (e) => {
        const bounds = heroSection.getBoundingClientRect();
        if (e.clientX >= bounds.left && e.clientX <= bounds.right &&
            e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
            
            const relX = Math.floor(e.clientX - bounds.left);
            const relY = Math.floor(e.clientY - bounds.top);
            
            // Calculate distance moved to prevent spawning duplicates when hovering statically
            const distMoved = Math.hypot(relX - lastX, relY - lastY);
            if (distMoved > 6) {
                // Perfect balanced force configuration
                dropWater(relX, relY, 8, 16); 
                lastX = relX;
                lastY = relY;
            }
        }
    });

    function processWaterSimulation() {
        const imgData = canvasContext.createImageData(width, height);
        const data = imgData.data;
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Base Background Colors
        // Light: Classic Bisque | Dark: Smokier, elegant Greyish-Black
        const baseR = isDark ? 17 : 255;
        const baseG = isDark ? 17 : 228;
        const baseB = isDark ? 18 : 196;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = x + y * width;
                
                // 2D Wave Propagation Core
                let waveHeight = (
                    buffer1[idx - 1] +
                    buffer1[idx + 1] +
                    buffer1[idx - width] +
                    buffer1[idx + width]
                ) * 0.5 - buffer2[idx];
                
                // Tightened dampening (0.93) to fade the rings gracefully and prevent visual clutter
                waveHeight *= 0.93; 
                buffer2[idx] = waveHeight;
                
                let pixelPos = idx * 4;
                
                if (Math.abs(waveHeight) > 0.002) {
                    const slopeX = buffer1[idx + 1] - buffer1[idx - 1];
                    const slopeY = buffer1[idx + width] - buffer1[idx - width];
                    
                    // Unified Gradient Magnitude for identical physical behavior
                    const mag = Math.sqrt(slopeX * slopeX + slopeY * slopeY);
                    const factor = Math.min(mag * 240, 1.0);
                    
                    if (isDark) {
                        // DARK MODE: Rich Beige (#c5b5a5), Darker Grey (#55555c) & Greyish-White (#dedee2)
                        const rBeige = 197, gBeige = 181, bBeige = 165; 
                        const rGrey  = 85,  gGrey  = 85,  bGrey  = 92;   
                        const rWhite = 222, gWhite = 222, bWhite = 226; 
                        
                        // Dynamically mix colors depending on the wave's slope intensity
                        let mixRatio = Math.min(mag * 140, 1.0);
                        let targetR, targetG, targetB;
                        
                        if (mixRatio < 0.5) {
                            // Gentle transitions go through smokier grey to rich beige
                            const t = mixRatio * 2;
                            targetR = rGrey * (1 - t) + rBeige * t;
                            targetG = gGrey * (1 - t) + gBeige * t;
                            targetB = bGrey * (1 - t) + bBeige * t;
                        } else {
                            // Intense wave crests pop with greyish-white highlights
                            const t = (mixRatio - 0.5) * 2;
                            targetR = rBeige * (1 - t) + rWhite * t;
                            targetG = gBeige * (1 - t) + gWhite * t;
                            targetB = bBeige * (1 - t) + bWhite * t;
                        }
                        
                        data[pixelPos]     = Math.floor(baseR * (1 - factor) + targetR * factor);
                        data[pixelPos + 1] = Math.floor(baseG * (1 - factor) + targetG * factor);
                        data[pixelPos + 2] = Math.floor(baseB * (1 - factor) + targetB * factor);
                        data[pixelPos + 3] = 255;
                    } else {
                        // LIGHT MODE: Beautiful glass refraction that mimics Dark Mode's size perfectly
                        const rHighlight = 255, gHighlight = 245, bHighlight = 230; // Shimmering light reflection
                        const rShadow    = 210, gShadow    = 185, bShadow    = 155; // Natural warm water shadows
                        
                        // Use raw slope direction to decide between highlight or shadow
                        const slopeDir = slopeX + slopeY;
                        const blend = Math.min(Math.max(-1.0, slopeDir * 60), 1.0);
                        
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
