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
    // 3. HIGH-DEFINITION CONCENTRIC WAVE ENGINE
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

    // Dropping with a tighter radius excites beautiful, sharp concentric rings
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

    window.addEventListener('mousemove', (e) => {
        const bounds = heroSection.getBoundingClientRect();
        if (e.clientX >= bounds.left && e.clientX <= bounds.right &&
            e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
            
            const relX = Math.floor(e.clientX - bounds.left);
            const relY = Math.floor(e.clientY - bounds.top);
            
            // Radius of 6 excites high-frequency concentric ripple lines
            dropWater(relX, relY, 6, 24); 
        }
    });

    function processWaterSimulation() {
        const imgData = canvasContext.createImageData(width, height);
        const data = imgData.data;
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Base Backgrounds
        // Light: Classic Bisque | Dark: Deep Premium Greyish-Black
        const baseR = isDark ? 24 : 255;
        const baseG = isDark ? 24 : 228;
        const baseB = isDark ? 27 : 196;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = x + y * width;
                
                // Discrete 2D Wave Propagation math
                let waveHeight = (
                    buffer1[idx - 1] +
                    buffer1[idx + 1] +
                    buffer1[idx - width] +
                    buffer1[idx + width]
                ) * 0.5 - buffer2[idx];
                
                waveHeight *= 0.95; // Balanced decay
                buffer2[idx] = waveHeight;
                
                let pixelPos = idx * 4;
                
                if (Math.abs(waveHeight) > 0.002) {
                    const slopeX = buffer1[idx + 1] - buffer1[idx - 1];
                    const slopeY = buffer1[idx + width] - buffer1[idx - width];
                    
                    // Gradient magnitude (ensures uniform concentric ring illumination)
                    const mag = Math.sqrt(slopeX * slopeX + slopeY * slopeY);
                    
                    if (isDark) {
                        // DARK MODE: Clean Beige and Greyish-White highlights over Greyish-Black base
                        const factor = Math.min(mag * 220, 1.0);
                        
                        // Shimmer transitions: Blend towards Greyish-White/Beige based on wave magnitude
                        const rBeige = 212, gBeige = 197, bBeige = 185; // Beige target
                        const rWhite = 228, gWhite = 228, bWhite = 231; // Greyish-White target
                        
                        // Higher peaks lean closer to glowing greyish-white, troughs lean to beige
                        const mixRatio = Math.min(mag * 150, 1.0);
                        const targetR = rBeige * (1 - mixRatio) + rWhite * mixRatio;
                        const targetG = gBeige * (1 - mixRatio) + gWhite * mixRatio;
                        const targetB = bBeige * (1 - mixRatio) + bWhite * mixRatio;
                        
                        data[pixelPos]     = Math.floor(baseR * (1 - factor) + targetR * factor);
                        data[pixelPos + 1] = Math.floor(baseG * (1 - factor) + targetG * factor);
                        data[pixelPos + 2] = Math.floor(baseB * (1 - factor) + targetB * factor);
                        data[pixelPos + 3] = 255;
                    } else {
                        // LIGHT MODE: Crisp glass refraction boundaries
                        let change = 1.0 + ((slopeX + slopeY) * 12 * 0.005);
                        change = Math.min(Math.max(0.84, change), 1.16); 
                        
                        data[pixelPos]     = Math.min(Math.max(0, baseR * change), 255);
                        data[pixelPos + 1] = Math.min(Math.max(0, baseG * change), 255);
                        data[pixelPos + 2] = Math.min(Math.max(0, baseB * change), 255);
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
