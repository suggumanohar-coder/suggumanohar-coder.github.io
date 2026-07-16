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
// 2. CRISP HIGH-DEFINITION SHARP RIPPLE ENGINE
// ==========================================
const heroSection = document.getElementById('about');
const backgroundCanvas = document.getElementById('hero-canvas');
const canvasContext = backgroundCanvas.getContext('2d');

let width = 0, height = 0;

let buffer1 = [];
let buffer2 = [];
let frameCount = 0;

function setupWaveBuffers() {
    width = heroSection.clientWidth;
    height = heroSection.clientHeight;
    backgroundCanvas.width = width;
    backgroundCanvas.height = height;
    
    buffer1 = new Array(width * height).fill(0);
    buffer2 = new Array(width * height).fill(0);
}
setupWaveBuffers();
window.addEventListener('resize', setupWaveBuffers);

// Broad, sweeping structural radius distribution
function dropWater(dx, dy, radius, force) {
    if (dx < radius || dx > width - radius || dy < radius || dy > height - radius) return;
    
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if (x * x + y * y < radius * radius) {
                const index = (dx + x) + (dy + y) * width;
                const distance = Math.sqrt(x * x + y * y);
                const falloff = 1.0 - (distance / radius);
                buffer1[index] += force * falloff;
            }
        }
    }
}

window.addEventListener('mousemove', (e) => {
    frameCount++;
    // Controls update speed to balance the continuous line width
    if (frameCount % 3 !== 0) return; 

    const bounds = heroSection.getBoundingClientRect();
    if (e.clientX >= bounds.left && e.clientX <= bounds.right &&
        e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
        
        const relX = Math.floor(e.clientX - bounds.left);
        const relY = Math.floor(e.clientY - bounds.top);
        
        // Large structural radius for wide sweeping screen ripples
        dropWater(relX, relY, 40, 280); 
    }
});

function processWaterSimulation() {
    const imgData = canvasContext.createImageData(width, height);
    const data = imgData.data;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Constant definition of theme base color values
    const baseR = isDark ? 0 : 255;
    const baseG = isDark ? 0 : 228;
    const baseB = isDark ? 0 : 196;
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = x + y * width;
            
            // Classical 2D wave equation processing
            buffer2[idx] = (
                (buffer1[idx - 1] +
                 buffer1[idx + 1] +
                 buffer1[idx - width] +
                 buffer1[idx + width]) >> 1
            ) - buffer2[idx];
            
            // Tightened dampening to keep ring lines sharp instead of bleeding into a blur
            buffer2[idx] -= buffer2[idx] >> 5; 
            
            let refraction = buffer2[idx];
            let pixelPos = idx * 4;
            
            if (refraction !== 0) {
                // Calculate directional change vectors
                const slopeX = buffer2[idx + 1] - buffer2[idx - 1];
                const slopeY = buffer2[idx + width] - buffer2[idx - width];
                
                // Amplified contrast calculation to break out of the blur state
                let intensity = (slopeX + slopeY) * 1.8;
                
                if (isDark) {
                    // DARK MODE: Ultra-sharp Tuscan color contours moving into near-black
                    let factor = Math.min(Math.max(0, 35 + intensity * 3), 220);
                    
                    data[pixelPos]     = Math.floor(factor * 0.98); 
                    data[pixelPos + 1] = Math.floor(factor * 0.84); 
                    data[pixelPos + 2] = Math.floor(factor * 0.65); 
                    data[pixelPos + 3] = Math.min(Math.max(20, Math.abs(intensity) * 8), 255);
                } else {
                    // LIGHT MODE: Multiplicative shading factor.
                    // This creates high-contrast, razor-sharp transparent reflections without changing the hue ratio.
                    let lightMultiplier = 1.0 + (intensity * 0.08);
                    
                    // Clamping calculations strictly between 0.75 and 1.1 ensures clean, dark reflections without noise
                    lightMultiplier = Math.min(Math.max(0.72, lightMultiplier), 1.08);
                    
                    data[pixelPos]     = Math.min(Math.max(0, baseR * lightMultiplier), 255);
                    data[pixelPos + 1] = Math.min(Math.max(0, baseG * lightMultiplier), 255);
                    data[pixelPos + 2] = Math.min(Math.max(0, baseB * lightMultiplier), 255);
                    data[pixelPos + 3] = 255;
                }
            } else {
                // Base stationary background placement
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
