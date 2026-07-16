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
// 2. ORGANIC NATURAL WATER RIPPLE ENGINE
// ==========================================
const heroSection = document.getElementById('about');
const backgroundCanvas = document.getElementById('hero-canvas');
const canvasContext = backgroundCanvas.getContext('2d');

let width = 0, height = 0;
let rippleDensity = 1.0; 

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

// Increased drop volume and area radius to feel like sweeping natural waves
function dropWater(dx, dy, radius, force) {
    if (dx < radius || dx > width - radius || dy < radius || dy > height - radius) return;
    
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if (x * x + y * y < radius * radius) {
                const index = (dx + x) + (dy + y) * width;
                // Soft Gaussian-like drop shape distribution
                const distance = Math.sqrt(x * x + y * y);
                const falloff = 1.0 - (distance / radius);
                buffer1[index] += force * falloff;
            }
        }
    }
}

window.addEventListener('mousemove', (e) => {
    frameCount++;
    // Only drop a wave every 6 frames to allow broad expansion
    if (frameCount % 6 !== 0) return; 

    const bounds = heroSection.getBoundingClientRect();
    if (e.clientX >= bounds.left && e.clientX <= bounds.right &&
        e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
        
        const relX = Math.floor(e.clientX - bounds.left);
        const relY = Math.floor(e.clientY - bounds.top);
        
        // Broad radius, balanced force so it doesn't clip into bright spots
        dropWater(relX, relY, 45, 380); 
    }
});

// 🛑 REMOVED STRAY "});" FROM HERE

function processWaterSimulation() {
    const imgData = canvasContext.createImageData(width, height);
    const data = imgData.data;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // 1. Establish clean base background states
    const baseR = isDark ? 0 : 255;
    const baseG = isDark ? 0 : 228;
    const baseB = isDark ? 0 : 196;
    const baseA = isDark ? 0 : 255;
    
    for (let i = 0; i < data.length; i += 4) {
        data[i]     = baseR;
        data[i + 1] = baseG;
        data[i + 2] = baseB;
        data[i + 3] = baseA;
    }
    
    // 2. Compute true wave physics and surface slopes
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = x + y * width;
            
            // Traditional 2D wave propagation formula
            buffer2[idx] = (
                (buffer1[idx - 1] +
                 buffer1[idx + 1] +
                 buffer1[idx - width] +
                 buffer1[idx + width]) >> 1
            ) - buffer2[idx];
            
            // Natural energy friction decay dampening
            buffer2[idx] -= buffer2[idx] >> 6; 
            
            const currentWave = buffer2[idx];
            if (currentWave !== 0) {
                // Calculate spatial gradients (slopes of the water surface)
                const slopeX = buffer2[idx + 1] - buffer2[idx - 1];
                const slopeY = buffer2[idx + width] - buffer2[idx - width];
                
                // The refraction intensity amount
                const intensity = (slopeX + slopeY) * 0.4;
                const pixelPos = idx * 4;
                
                if (isDark) {
                    // DARK MODE: Smooth, glowing Tuscan Amber contours that match your font color
                    // Completely zero grain, high-clarity organic curves
                    const factor = Math.min(Math.max(0, 30 + intensity * 2.5), 240);
                    
                    data[pixelPos]     = Math.floor(factor * 0.98); // #FAD6A5 R-Ratio
                    data[pixelPos + 1] = Math.floor(factor * 0.84); // #FAD6A5 G-Ratio
                    data[pixelPos + 2] = Math.floor(factor * 0.65); // #FAD6A5 B-Ratio
                    data[pixelPos + 3] = Math.min(Math.max(20, Math.abs(intensity) * 5), 230);
                } else {
                    // LIGHT MODE: Crisp, pristine glass-like refractions bending the solid Bisque color space
                    // Shifting intensity shifts the colors seamlessly toward clear shadows and pure light reflections
                    const r = Math.min(Math.max(0, baseR + intensity * 1.2), 255);
                    const g = Math.min(Math.max(0, baseG + intensity * 0.9), 255);
                    const b = Math.min(Math.max(0, baseB + intensity * 0.4), 255);
                    
                    data[pixelPos]     = r;
                    data[pixelPos + 1] = g;
                    data[pixelPos + 2] = b;
                    data[pixelPos + 3] = 255;
                }
            }
        }
    }
    
    canvasContext.putImageData(imgData, 0, 0);
    
    // Swap buffers for the next physics tracking frame
    let temp = buffer1;
    buffer1 = buffer2;
    buffer2 = temp;
    
    requestAnimationFrame(processWaterSimulation);
}
requestAnimationFrame(processWaterSimulation);
