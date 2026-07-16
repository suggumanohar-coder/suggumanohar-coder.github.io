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
    // 3. PHYSICAL WATER PROPAGATION ENGINE
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

    // High-precision mouse movement filters to prevent overcrowding
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
            
            // Only drop if mouse moved at least 35px AND 180ms have passed
            // This prevents screen-filling clusters and creates spaced, organic rings
            if (distMoved > 35 && currentTime - lastDropTime > 180) {
                dropWater(relX, relY, 24, 25); 
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
        
        // Base Background Colors
        const baseR = isDark ? 13 : 255;
        const baseG = isDark ? 13 : 228;
        const baseB = isDark ? 14 : 196;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = x + y * width;
                
                let waveHeight = (
                    buffer1[idx - 1] +
                    buffer1[idx + 1] +
                    buffer1[idx - width] +
                    buffer1[idx + width]
                ) * 0.5 - buffer2[idx];
                
                // 0.970 decay leaves ripples lingering beautifully without over-accumulating
                waveHeight *= 0.970; 
                buffer2[idx] = waveHeight;
                
                let pixelPos = idx * 4;
                
                if (Math.abs(waveHeight) > 0.001) {
                    const slopeX = buffer1[idx + 1] - buffer1[idx - 1];
                    const slopeY = buffer1[idx + width] - buffer1[idx - width];
                    
                    const mag = Math.sqrt(slopeX * slopeX + slopeY * slopeY);
                    
                    // Unified intensity scaling
                    const factor = Math.min(mag * 180, 1.0);
                    
                    if (isDark) {
                        // DARK MODE: Rich Beige, Dark Charcoal Grey, and true Obsidian Black Shadows
                        const rTrueBlack = 0,   gTrueBlack = 0,   bTrueBlack = 0;    // Absolute Shadow
                        const rDarkGrey  = 30,  gDarkGrey  = 30,  bDarkGrey  = 34;   // Dark Charcoal Grey
                        const rBeige     = 212, gBeige     = 196, bBeige     = 180;  // Premium Accent Beige
                        
                        // Use slope direction to differentiate peak light vs trough shadow
                        const slopeDir = slopeX + slopeY;
                        const blend = Math.min(Math.max(-1.0, slopeDir * 40), 1.0);
                        
                        let targetR, targetG, targetB;
                        if (blend < 0) {
                            // Troughs get cast in deep true obsidian black shadows
                            const t = Math.abs(blend);
                            targetR = baseR * (1 - t) + rTrueBlack * t;
                            targetG = baseG * (1 - t) + gTrueBlack * t;
                            targetB = baseB * (1 - t) + bTrueBlack * t;
                        } else {
                            // Crests smoothly light up transitioning from charcoal to rich beige
                            const t = blend;
                            targetR = rDarkGrey * (1 - t) + rBeige * t;
                            targetG = gDarkGrey * (1 - t) + gBeige * t;
                            targetB = bDarkGrey * (1 - t) + bBeige * t;
                        }
                        
                        data[pixelPos]     = Math.floor(baseR * (1 - factor) + targetR * factor);
                        data[pixelPos + 1] = Math.floor(baseG * (1 - factor) + targetG * factor);
                        data[pixelPos + 2] = Math.floor(baseB * (1 - factor) + targetB * factor);
                        data[pixelPos + 3] = 255;
                    } else {
                        // LIGHT MODE: Balanced glass shadows and bright highlights with smoothed peaks
                        const rHighlight = 255, gHighlight = 252, bHighlight = 247; // Smooth white shimmer
                        const rShadow    = 200, gShadow    = 175, bShadow    = 145; // Soft warm shadows
                        
                        const slopeDir = slopeX + slopeY;
                        
                        // Lowered peak multiplier (from 50 to 25) prevents harsh, pixelated starts
                        const blend = Math.min(Math.max(-1.0, slopeDir * 2
