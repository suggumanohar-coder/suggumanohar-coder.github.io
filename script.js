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
    if (frameCount % 2 !== 0) return; 

    const bounds = heroSection.getBoundingClientRect();
    if (e.clientX >= bounds.left && e.clientX <= bounds.right &&
        e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
        
        const relX = Math.floor(e.clientX - bounds.left);
        const relY = Math.floor(e.clientY - bounds.top);
        
        // Expanded radius to 16 for broad, fluid cursor waves instead of tiny lines
        dropWater(relX, relY, 35, 280); 
    }
});

function processWaterSimulation() {
    const imgData = canvasContext.createImageData(width, height);
    const data = imgData.data;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Smooth grid pre-allocation matching page environments exactly
    for (let i = 0; i < data.length; i += 4) {
        if (isDark) {
            data[i]     = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 0; 
        } else {
            data[i]     = 255; // Pure #FFE4C4 Base R
            data[i + 1] = 228; // Pure #FFE4C4 Base G
            data[i + 2] = 196; // Pure #FFE4C4 Base B
            data[i + 3] = 255;
        }
    }
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = x + y * width;
            
            buffer2[idx] = (
                (buffer1[idx - 1] +
                 buffer1[idx + 1] +
                 buffer1[idx - width] +
                 buffer1[idx + width]) >> 1
            ) - buffer2[idx];
            
            buffer2[idx] -= buffer2[idx] >> 5; 
            
            let refraction = buffer2[idx];
            if (refraction !== 0) {
                let shade = refraction * rippleDensity;
                let pixelPos = idx * 4;
                
                if (isDark) {
                    // DARK MODE: Organic Tuscan Amber (#FAD6A5 shade blends) shifting down into deep near-black
                    // Totally eliminates harsh glass-white tones
                    let factor = Math.min(Math.max(0, 40 + shade * 0.8), 200);
                    
                    data[pixelPos]     = Math.floor(factor * 0.98); // Tuscan Red component
                    data[pixelPos + 1] = Math.floor(factor * 0.84); // Tuscan Green component
                    data[pixelPos + 2] = Math.floor(factor * 0.65); // Tuscan Blue component
                    data[pixelPos + 3] = Math.min(Math.max(0, Math.abs(shade) * 2), 220); 
                } else {
                    // LIGHT MODE: Soft background color bending. Removes all muddy brown shadows.
                    // Creates pure fluid refraction highlights and subtle dark-bisque shifts
                    let r = Math.min(Math.max(0, 255 + shade * 0.25), 255);
                    let g = Math.min(Math.max(0, 228 + shade * 0.23), 255);
                    let b = Math.min(Math.max(0, 196 + shade * 0.18), 255);
                    
                    data[pixelPos]     = r;
                    data[pixelPos + 1] = g;
                    data[pixelPos + 2] = b;
                    data[pixelPos + 3] = 255;
                }
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
