// ==========================================
// 1. SAFE RUN INITIALIZATION wrapper
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById('theme-toggle'); 
    const heroSection = document.getElementById('about');
    const backgroundCanvas = document.getElementById('hero-canvas');
    
    // Safety check: Stop the script from crashing if elements are missing
    if (!themeToggle || !heroSection || !backgroundCanvas) {
        console.error("Missing critical HTML elements! Check your IDs ('theme-toggle', 'about', 'hero-canvas').");
        return;
    }

    const canvasContext = backgroundCanvas.getContext('2d');
    let width = 0, height = 0;
    let buffer1 = [];
    let buffer2 = [];

    // ==========================================
    // 2. THEME SYSTEM (Safely inside block)
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
    // 3. SHARP 2D WAVE ENGINE
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

    window.addEventListener('mousemove', (e) => {
        const bounds = heroSection.getBoundingClientRect();
        if (e.clientX >= bounds.left && e.clientX <= bounds.right &&
            e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
            
            const relX = Math.floor(e.clientX - bounds.left);
            const relY = Math.floor(e.clientY - bounds.top);
            
            dropWater(relX, relY, 40, 36); 
        }
    });

    function processWaterSimulation() {
        const imgData = canvasContext.createImageData(width, height);
        const data = imgData.data;
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        const baseR = isDark ? 0 : 255;
        const baseG = isDark ? 0 : 228;
        const baseB = isDark ? 0 : 196;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = x + y * width;
                
                let waveHeight = (
                    buffer1[idx - 1] +
                    buffer1[idx + 1] +
                    buffer1[idx - width] +
                    buffer1[idx + width]
                ) * 0.5 - buffer2[idx];
                
                waveHeight *= 0.94; 
                buffer2[idx] = waveHeight;
                
                let pixelPos = idx * 4;
                
                if (Math.abs(waveHeight) > 0.005) {
                    const slopeX = buffer1[idx + 1] - buffer1[idx - 1];
                    const slopeY = buffer1[idx + width] - buffer1[idx - width];
                    const offset = (slopeX + slopeY) * 28;
                    
                    if (isDark) {
                        // Sharp greyish-beige details on true obsidian-black canvas base
                        let highlight = Math.min(Math.max(0, offset * 5.5), 210);
                        data[pixelPos]     = Math.floor(baseR + highlight * 0.82); 
                        data[pixelPos + 1] = Math.floor(baseG + highlight * 0.78); 
                        data[pixelPos + 2] = Math.floor(baseB + highlight * 0.74); 
                        data[pixelPos + 3] = Math.min(Math.max(0, Math.abs(offset) * 16), 255);
                    } else {
                        let change = 1.0 + (offset * 0.006);
                        change = Math.min(Math.max(0.78, change), 1.18); 
                        
                        data[pixelPos]     = Math.min(Math.max(0, baseR * change), 255);
                        data[pixelPos + 1] = Math.min(Math.max(0, baseG * change), 255);
                        data[pixelPos + 2] = Math.min(Math.max(0, baseB * change), 255);
                        data[pixelPos + 3] = 255;
                    }
                } else {
                    data[pixelPos]     = baseR;
                    data[pixelPos + 1] = baseG;
                    data[pixelPos + 2] = baseB;
                    data[pixelPos + 3] = isDark ? 0 : 255;
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
