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
// 2. MATHEMATICAL 2D WAVE ENGINE (REAL LIQUID PHYSICS)
// ==========================================
const heroSection = document.getElementById('about');
const backgroundCanvas = document.getElementById('hero-canvas');
const canvasContext = backgroundCanvas.getContext('2d');

let width = 0, height = 0;

// Two 1D arrays storing heights for 2D wave calculation matrices
let buffer1 = [];
let buffer2 = [];

function setupWaveBuffers() {
    width = heroSection.clientWidth;
    height = heroSection.clientHeight;
    backgroundCanvas.width = width;
    backgroundCanvas.height = height;
    
    // Total pixels tracking heights
    const totalPixels = width * height;
    buffer1 = new Float32Array(totalPixels);
    buffer2 = new Float32Array(totalPixels);
}
setupWaveBuffers();
window.addEventListener('resize', setupWaveBuffers);

// Drops smooth energy to spawn expanding water waves
function dropWater(dx, dy, radius, force) {
    if (dx < radius || dx > width - radius || dy < radius || dy > height - radius) return;
    
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if (x * x + y * y < radius * radius) {
                const index = (dx + x) + (dy + y) * width;
                // Soft cosine-based drop distribution creates perfectly round wave fronts
                const dist = Math.sqrt(x * x + y * y);
                const amount = Math.cos((dist / radius) * Math.PI * 0.5);
                buffer1[index] += force * amount;
            }
        }
    }
}

// Track mouse movements smoothly
window.addEventListener('mousemove', (e) => {
    const bounds = heroSection.getBoundingClientRect();
    if (e.clientX >= bounds.left && e.clientX <= bounds.right &&
        e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
        
        const relX = Math.floor(e.clientX - bounds.left);
        const relY = Math.floor(e.clientY - bounds.top);
        
        // Large structural radius (40) for wide, impressive cursor disturbances
        dropWater(relX, relY, 40, 32); 
    }
});

function processWaterSimulation() {
    const imgData = canvasContext.createImageData(width, height);
    const data = imgData.data;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Base Color Constants matching your design rules perfectly
    const baseR = isDark ? 0 : 255;
    const baseG = isDark ? 0 : 228;
    const baseB = isDark ? 0 : 196;
    
    // Core 2D Wave Propagation Loop
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = x + y * width;
            
            // 1. Classical Discrete Wave Equation Engine
            // Averages the 4 adjacent neighbors to pass energy outward naturally
            let waveHeight = (
                buffer1[idx - 1] +
                buffer1[idx + 1] +
                buffer1[idx - width] +
                buffer1[idx + width]
            ) * 0.5 - buffer2[idx];
            
            // 2. Natural Kinetic Energy Decay Dampening
            waveHeight *= 0.96; 
            
            buffer2[idx] = waveHeight;
            
            // 3. Render Pass via Spatial Gradient Displacements
            let pixelPos = idx * 4;
            
            if (Math.abs(waveHeight) > 0.01) {
                // Determine geometric surface slope
                const slopeX = buffer1[idx + 1] - buffer1[idx - 1];
                const slopeY = buffer1[idx + width] - buffer1[idx - width];
                
                // Scale factor for optical depth effect
                const offset = (slopeX + slopeY) * 12;
                
                if (isDark) {
                    // DARK MODE: Velvet Tuscan Amber glowing contours (#FAD6A5 mix transitions)
                    let lightFactor = Math.min(Math.max(0, 30 + offset * 3), 200);
                    
                    data[pixelPos]     = Math.floor(lightFactor * 0.98); 
                    data[pixelPos + 1] = Math.floor(lightFactor * 0.84); 
                    data[pixelPos + 2] = Math.floor(lightFactor * 0.65); 
                    data[pixelPos + 3] = Math.min(Math.max(15, Math.abs(offset) * 12), 245);
                } else {
                    // LIGHT MODE: Crystal-clear, smooth fluid refraction of Bisque background color space
                    // Scales color values smoothly so no blue/brown tints can isolate out
                    let change = 1.0 + (offset * 0.003);
                    change = Math.min(Math.max(0.85, change), 1.15); // Strict clamp keeps gradients pristine
                    
                    data[pixelPos]     = Math.min(Math.max(0, baseR * change), 255);
                    data[pixelPos + 1] = Math.min(Math.max(0, baseG * change), 255);
                    data[pixelPos + 2] = Math.min(Math.max(0, baseB * change), 255);
                    data[pixelPos + 3] = 255;
                }
            } else {
                // Pure stationary background color states
                data[pixelPos]     = baseR;
                data[pixelPos + 1] = baseG;
                data[pixelPos + 2] = baseB;
                data[pixelPos + 3] = isDark ? 0 : 255;
            }
        }
    }
    
    canvasContext.putImageData(imgData, 0, 0);
    
    // Flip buffer references to compute next animation sequence
    let temp = buffer1;
    buffer1 = buffer2;
    buffer2 = temp;
    
    requestAnimationFrame(processWaterSimulation);
}

// Initial engine loop ignition
requestAnimationFrame(processWaterSimulation);
