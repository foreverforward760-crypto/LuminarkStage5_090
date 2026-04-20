// visuals.js - KAIROS Canvas Frequency Visualizer
// Audit v1.1: smooth speed transitions between frequencies (174Hz→963Hz density shift)

let canvas, ctx, raf = null, currentSpeed = 1.6, targetSpeed = 1.6;

export function initVisualizer() {
    canvas = document.getElementById('visualizerCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
}

function resize() {
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

        // Lerp toward target speed for smooth density shift
        const rawSpeed = parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--pulse-speed')
        ) || 1.6;
        targetSpeed = isFinite(rawSpeed) ? rawSpeed : 1.6;
        currentSpeed += (targetSpeed - currentSpeed) * 0.04; // smooth lerp

        t += 0.016 * currentSpeed;
        const pulse = (Math.sin(t * Math.PI) * 0.5 + 0.5);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2, cy = canvas.height / 2;
        const maxR = Math.min(canvas.width, canvas.height) * 0.45;

        // Main radial gradient — intensity scales with speed (density effect)
        const intensity = Math.min(0.12, 0.04 + (currentSpeed / 2.2) * 0.08);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        g.addColorStop(0,   `rgba(120,180,255,${intensity * pulse})`);
        g.addColorStop(0.5, `rgba(80,140,220,${intensity * 0.5 * pulse})`);
        g.addColorStop(1,   'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Concentric rings — more rings at higher frequencies
        const ringCount = Math.round(2 + (currentSpeed / 2.2) * 5);
        for (let i = 1; i <= ringCount; i++) {
            const r = maxR * (i / ringCount) * (0.7 + pulse * 0.3);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(120,180,255,${(0.03 + (currentSpeed / 2.2) * 0.04) * pulse})`;
            ctx.lineWidth = currentSpeed > 1.8 ? 1.5 : 1;
            ctx.stroke();
        }

        raf = requestAnimationFrame(draw);
    }
    draw();
}

export function stopVisualPulse() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    currentSpeed = 1.6; targetSpeed = 1.6;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}
