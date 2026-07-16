// ==========================================
// 1. THEME INITIALIZATION & TOGGLE SYSTEM
// ==========================================
const themeToggle = document.getElementById('theme-toggle'); 
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
// 2. ULTRA-SHARP 2D WAVE ENGINE
// ==========================================
const heroSection = document.getElementById('about');
const backgroundCanvas = document.getElementById('hero-canvas');
const canvasContext = backgroundCanvas.getContext('2d');

let width = 0, height = 0;

let buffer1 = [];
let buffer2 = [];

function setupWaveBuffers() {
    width = heroSection.clientWidth;
    height = heroSection.clientHeight;
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
        
        // Large structural radius for massive sweeping screen waves
        dropWater(relX, relY, 40, 36); 
    }
});

function processWaterSimulation() {
    const imgData = canvasContext.createImageData(width, height);
    const data = imgData.data;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Solid base colors (Bisque for light mode, pure black for dark mode)
    const baseR = isDark ? 0 : 255;
    const baseG = isDark ? 0 : 228;
    const baseB = isDark ? 0 : 196;
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = x + y * width;
            
            // Classical 2D wave propagation math
            let waveHeight = (
                buffer1[idx - 1] +
                buffer1[idx + 1] +
                buffer1[idx - width] +
                buffer1[idx + width]
            ) * 0.5 - buffer2[idx];
            
            // Tightened dampening (0.94) forces wave peaks to remain thin and razor sharp
            waveHeight *= 0.94; 
            
            buffer2[idx] = waveHeight;
            
            let pixelPos = idx * 4;
            
            if (Math.abs(waveHeight) > 0.005) {
                // Determine geometric surface slope
                const slopeX = buffer1[idx + 1] - buffer1[idx - 1];
                const slopeY = buffer1[idx + width] - buffer1[idx - width];
                
                // Aggressively amplified intensity (28) pushes transitions to create distinct high-contrast edges
                const offset = (slopeX + slopeY) * 28;
                
                if (isDark) {
                    // DARK MODE: Ultra-sharp Greyish-Beige (#D1C7BD mix framework) over absolute black
                    // Positive offsets reflect ambient light, negative offsets drop straight to true black
                    let highlight = Math.min(Math.max(0, offset * 5.5), 210);
                    
                    data[pixelPos]     = Math.floor(baseR + highlight * 0.82); // R channel
                    data[pixelPos + 1] = Math.floor(baseG + highlight * 0.78); // G channel
                    data[pixelPos + 2] = Math.floor(baseB + highlight * 0.74); // B channel
                    data[pixelPos + 3] = Math.min(Math.max(0, Math.abs(offset) * 16), 255);
                } else {
                    // LIGHT MODE: Crystal-clear, sharp glass shadows and high-intensity structural highlights
                    let change = 1.0 + (offset * 0.006);
                    change = Math.min(Math.max(0.78, change), 1.18);
