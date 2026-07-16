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
    // 3. PHYSICAL RAZOR-THIN HOLOGRAPHIC RING ENGINE
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

    // Drops an absolute razor-thin single-pixel outline ring. Zero center filling.
    function dropRazorThinRing(dx, dy, radius, force) {
        if (dx < radius || dx > width - radius || dy < radius || dy > height - radius) return;
        
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                const dist = Math.hypot(x, y);
                
                // Strict edge check creates a perfect thin line ring instead of a full circle disk
                if (Math.abs(dist - radius) < 1.2) {
                    const index = (dx + x) + (dy + y) * width;
                    buffer1[index] += force;
                }
            }
        }
    }

    // Precise anti-crowding mouse movement trackers
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
            
            // Spaced out triggers prevent overlap loops entirely
            if (distMoved > 50 && currentTime - lastDropTime > 220) {
                dropRazorThinRing(relX, relY, 30, 6); // Lower force prevents high peak explosions
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
        
        // Base Dynamic Background Layouts
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
                
                waveHeight *= 0.968; // Smooth decay profile
                buffer2[idx] = waveHeight;
                
                let pixelPos = idx * 4;
                
                if (Math.abs(waveHeight) > 0.0003) {
                    const slopeX = buffer1[idx + 1] - buffer1[idx - 1];
                    const slopeY = buffer1[idx + width] - buffer1[idx - width];
                    
                    const mag = Math.sqrt(slopeX * slopeX + slopeY * slopeY);
                    
                    // Unified crisp reflection filter mapping
                    const factor = Math.min(mag * 160, 0.85);
                    
                    // Tight linear clamping prevents massive color blobs and heavy pops
                    const blend = Math.min(Math.max(-0.6, waveHeight * 12), 0.6);
                    
                    if (isDark) {
                        // DARK MODE: Thin slate lines & precise accent beige tracking contours
                        const rDarkGrey = 28,  gDarkGrey = 28,  bDarkGrey = 32;   
                        const rBeige    = 214, gBeige    = 199, bBeige    = 183;  
                        
                        let targetR, targetG, targetB;
                        
                        if (blend > 0) {
                            // Gentle positive peaks receive thin elegant beige lining
                            targetR = baseR * (1 - blend) + rBeige * blend;
                            targetG = baseG * (1 - blend) + gBeige * blend;
                            targetB = baseB * (1 - blend) + bBeige * blend;
                        } else {
                            // Negative troughs turn to dark grey contours instead of harsh black bubbles
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
                        // LIGHT MODE: Crystal Fluid Outlines
                        const rHighlight = 255, gHighlight = 253, bHighlight = 250; 
                        const rShadow    = 200, gShadow    = 178, bShadow    = 150; 
                        
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
