// visuals.js - KAIROS Canvas Frequency Visualizer
// ✅ PERF FIX B: Cache CSS variable reads
// ✅ PERF FIX C: Pre-generate random pool
// ✅ PERF FIX D: Throttle window resize

let canvas, ctx, raf = null, currentSpeed = 1.6, targetSpeed = 1.6;
let currentStage = 5;
let previousStage = null;
let shatterAnim = 0;

// ✅ PERF FIX B: Cache pulse speed in module variable
let currentPulseSpeed = 1.6;

// ✅ PERF FIX C: Pre-generated random pool (200 values, refreshed every 30 frames)
let randomPool = [];
let randomPoolIndex = 0;
let frameCounter = 0;

function generateRandomPool() {
    randomPool = [];
    for (let i = 0; i < 200; i++) {
        randomPool.push(Math.random());
    }
    randomPoolIndex = 0;
}

function getPooledRandom() {
    if (randomPoolIndex >= randomPool.length) randomPoolIndex = 0;
    return randomPool[randomPoolIndex++];
}

// ✅ PERF FIX B: Update pulse speed from external calls
export function updatePulseSpeed(speed) {
    currentPulseSpeed = speed;
    targetSpeed = speed;
}

export function setVisualDensity(stage) {
    if (previousStage === 8 && stage === 9) {
        shatterAnim = 1.0;
    }
    if (currentStage !== stage) previousStage = currentStage;
    currentStage = stage;
}

export function initVisualizer() {
    canvas = document.getElementById('visualizerCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    generateRandomPool();
    resizeCanvas();
    // ✅ PERF FIX D: Throttled resize listener
    window.addEventListener('resize', throttledResize);
}

// ✅ PERF FIX D: Throttle resize (100ms)
let lastResizeTime = 0;
function throttledResize() {
    const now = Date.now();
    if (now - lastResizeTime > 100) {
        lastResizeTime = now;
        resizeCanvas();
    }
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ✅ AUDIT FIX 4: speed lerp for smooth density transitions between frequencies
export function startVisualPulse(color = '#22c55e') {
    if (raf) cancelAnimationFrame(raf);
    let t = 0;

    function draw() {
        if (!ctx || !canvas) return;

        // ✅ PERF FIX B: Use cached pulse speed directly (no getComputedStyle)
        targetSpeed = currentPulseSpeed;
        currentSpeed += (targetSpeed - currentSpeed) * 0.04; // smooth lerp

        t += 0.016 * currentSpeed;
        const pulse = (Math.sin(t * Math.PI) * 0.5 + 0.5);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2, cy = canvas.height / 2;
        const maxR = Math.min(canvas.width, canvas.height) * 0.45;

        // Main radial gradient — intensity scales with speed and stage density
        const stageDensityMap = {0: 0.2, 1: 0.5, 2: 0.8, 3: 1.2, 4: 2.0, 5: 1.0, 6: 0.6, 7: 1.5, 8: 2.0, 9: 0.1};
        const densityFactor = stageDensityMap[currentStage] !== undefined ? stageDensityMap[currentStage] : 1.0;

        const intensity = Math.min(0.2, 0.04 + (currentSpeed / 2.2) * 0.08) * densityFactor;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        g.addColorStop(0,   `rgba(120,180,255,${intensity * pulse})`);
        g.addColorStop(0.5, `rgba(80,140,220,${intensity * 0.5 * pulse})`);
        g.addColorStop(1,   'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (shatterAnim > 0) {
            shatterAnim -= 0.015;
            if (shatterAnim < 0) shatterAnim = 0;
        }

        const ringRadius = maxR * 0.75;
        
        // Background noise rings (for Stage 4 Crucible density)
        if (densityFactor > 1.2) {
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath();
                // ✅ PERF FIX C: Use pooled random instead of Math.random()
                ctx.arc(cx, cy, ringRadius + (getPooledRandom()*20 - 10), 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(120,180,255,${0.05 * densityFactor})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // The 10-Stage Toroidal Ring
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.1); 

        for(let i=0; i<10; i++) {
            const startAngle = (i / 10) * Math.PI * 2;
            const endAngle = ((i+1) / 10) * Math.PI * 2 - 0.06;
            
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, startAngle, endAngle);
            
            let isActive = i === currentStage;
            ctx.lineWidth = isActive ? 10 + pulse * 4 : 4;
            
            if (isActive) {
                // Glow using the color param if available, else white/blue
                ctx.strokeStyle = (shatterAnim > 0 && i === 9) ? `rgba(255,255,255,${pulse})` : `rgba(255,255,255,${0.6 + 0.4*pulse})`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = color || 'white';
            } else {
                ctx.strokeStyle = `rgba(120,180,255,0.2)`;
                ctx.shadowBlur = 0;
            }
            ctx.stroke();
        }
        ctx.restore();

        // Stage 8 "Cracks" (Illusion of Permanence Rigidity) or Shatter Anim
        if (currentStage === 8 || shatterAnim > 0) {
            const crackAlpha = currentStage === 8 ? (0.3 + 0.3 * getPooledRandom()) : shatterAnim;
            ctx.strokeStyle = `rgba(255, 255, 255, ${crackAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            // Shattered glass geometry
            for(let c=0; c < (currentStage===8 ? 40 : 80 * shatterAnim); c++) {
                const angle1 = getPooledRandom() * Math.PI * 2;
                const r1 = getPooledRandom() * ringRadius * 1.2;
                const angle2 = angle1 + (getPooledRandom() - 0.5) * 0.5;
                const r2 = r1 + (getPooledRandom() * 40 - 20);
                
                ctx.moveTo(cx + Math.cos(angle1)*r1, cy + Math.sin(angle1)*r1);
                ctx.lineTo(cx + Math.cos(angle2)*r2, cy + Math.sin(angle2)*r2);
            }
            ctx.stroke();
        }

        // ✅ PERF FIX C: Refresh random pool every 30 frames
        frameCounter++;
        if (frameCounter >= 30) {
            generateRandomPool();
            frameCounter = 0;
        }

        raf = requestAnimationFrame(draw);
    }
    draw();
}

export function stopVisualPulse() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    currentSpeed = 1.6; targetSpeed = 1.6; currentPulseSpeed = 1.6;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}
