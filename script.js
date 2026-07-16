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
// 2. FINE-TUNED RIPPLE ENGINE
// ==========================================
const heroSection = document.getElementById('about');
const backgroundCanvas = document.getElementById('hero-canvas');
const canvasContext = backgroundCanvas.getContext('2d');

let width = 0, height = 0;
let rippleDensity = 1.4; // Softened density tracking for cleaner light refractions

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

function dropWater(dx, dy, radius, force) {
    if (dx < radius || dx > width - radius || dy < radius || dy > height - radius) return;
    
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if (x * x + y * y < radius * radius) {
                const index = (dx + x) + (dy + y) * width;
                buffer1[index] = force;
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
        
        dropWater(relX, relY, 4, 250); 
    }
});

function processWaterSimulation() {
    const imgData = canvasContext.createImageData(width, height);
    const data = imgData.data;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Fill background color grids cleanly to match page layout state
    for (let i = 0; i < data.length; i += 4) {
        if (isDark) {
            data[i]     = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 0; 
        } else {
            data[i]     = 255; // #FFE4C4 R
            data[i + 1] = 228; // #FFE4C4 G
            data[i + 2] = 196; // #FFE4C4 B
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
                let shade = Math.min(Math.max(refraction * rippleDensity, -80), 80);
                let pixelPos = idx * 4;
                
                if (isDark) {
                    // DARK MODE: Subdued, darker white ripples instead of high-beams
                    let whiteVal = Math.min(Math.max(0, 140 + shade), 255); 
                    data[pixelPos]     = whiteVal; 
                    data[pixelPos + 1] = whiteVal; 
                    data[pixelPos + 2] = whiteVal; 
                    data[pixelPos + 3] = Math.min(Math.max(20, Math.abs(shade) * 1.5), 180); 
                } else {
                    // LIGHT MODE: Lightened refractions dancing over Bisque color spaces
                    let r = Math.min(Math.max(0, 255 + shade * 0.4), 255);
                    let g = Math.min(Math.max(0, 228 + shade * 0.4), 255);
                    let b = Math.min(Math.max(0, 196 + shade * 0.4), 255);
                    
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
