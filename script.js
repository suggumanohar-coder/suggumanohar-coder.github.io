const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

// Apply stored theme on load
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Toggle theme event
themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    
    if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// ==========================================
// 1. THEME INITIALIZATION & TOGGLE SYSTEM
// ==========================================
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

// Apply stored theme on initial viewport load
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Global theme shift click tracker
themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    
    if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// ==========================================
// 2. HIGH-FIDELITY TRUE WATER RIPPLE ENGINE
// ==========================================
const heroSection = document.getElementById('about');
const backgroundCanvas = document.getElementById('hero-canvas');
const canvasContext = backgroundCanvas.getContext('2d');

let width = 0, height = 0;
let rippleDensity = 2.5; // Visual depth configuration of wave gradients

// Double-heightmap buffers tracking physical wave propagation displacement matrices
let buffer1 = [];
let buffer2 = [];

function setupWaveBuffers() {
    width = heroSection.clientWidth;
    height = heroSection.clientHeight;
    backgroundCanvas.width = width;
    backgroundCanvas.height = height;
    
    // Initialize standard heightmaps with absolute zero data states
    buffer1 = new Array(width * height).fill(0);
    buffer2 = new Array(width * height).fill(0);
}
setupWaveBuffers();
window.addEventListener('resize', setupWaveBuffers);

// Induce a displacement wave drop into the physical velocity engine grid matrix
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

// Track mouse positioning variables to trigger drop points safely within hero viewport boundaries
window.addEventListener('mousemove', (e) => {
    const bounds = heroSection.getBoundingClientRect();
    if (e.clientX >= bounds.left && e.clientX <= bounds.right &&
        e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
        
        const relX = Math.floor(e.clientX - bounds.left);
        const relY = Math.floor(e.clientY - bounds.top);
        
        // Trigger a localized wave pool ripple split at accurate canvas coordinate scales
        dropWater(relX, relY, 4, 512);
    }
});

// Core Physics Algorithm & Rendering Loop
function processWaterSimulation() {
    const imgData = canvasContext.createImageData(width, height);
    const data = imgData.data;
    
    // Evaluate if dark mode toggle status is true to correctly tint pixels
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Core Wave Physics Algorithm loop execution processing height variables
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = x + y * width;
            
            // Average surrounding matrix cells to calculate wave dispersion velocity
            buffer2[idx] = (
                (buffer1[idx - 1] +
                 buffer1[idx + 1] +
                 buffer1[idx - width] +
                 buffer1[idx + width]) >> 1
            ) - buffer2[idx];
            
            // Apply subtle resistance damping to let water settle down
            buffer2[idx] -= buffer2[idx] >> 5; 
            
            let refraction = buffer2[idx];
            if (refraction !== 0) {
                // Amplify wave depth curves
                let shade = Math.min(Math.max(refraction * rippleDensity, -100), 100);
                let pixelPos = idx * 4;
                
                if (isDark) {
                    // DARK MODE CONFIGURATION (Background theme color target: #0a0a0c)
                    // Computes a soft shadow signature blend slightly deeper than near-black tone layers
                    data[pixelPos]     = Math.max(4, 8 + (shade * 0.1));  
                    data[pixelPos + 1] = Math.max(4, 8 + (shade * 0.1));
                    data[pixelPos + 2] = Math.max(6, 12 + (shade * 0.15)); 
                    data[pixelPos + 3] = Math.min(Math.max(0, Math.abs(shade) * 1.5), 220); 
                } else {
                    // LIGHT MODE CONFIGURATION (Background theme color target: #fcfcfc)
                    // Generates soft shadows layered dynamically just a step below off-white tones
                    data[pixelPos]     = Math.min(Math.max(180, 230 + shade), 245); 
                    data[pixelPos + 1] = Math.min(Math.max(180, 230 + shade), 245); 
                    data[pixelPos + 2] = Math.min(Math.max(185, 235 + shade), 250); 
                    data[pixelPos + 3] = Math.min(Math.max(0, Math.abs(shade) * 1.2), 180);
                }
            }
        }
    }
    
    // Paint current structural frame image matrix map onto screen grid surface
    canvasContext.putImageData(imgData, 0, 0);
    
    // Pivot and swap standard dynamic matrix array memory references
    let temp = buffer1;
    buffer1 = buffer2;
    buffer2 = temp;
    
    requestAnimationFrame(processWaterSimulation);
}

// Initialize active real-time computational pipeline
requestAnimationFrame(processWaterSimulation);
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();
