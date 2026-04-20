// visuals.js - KAIROS Canvas Frequency Visualizer

let canvas, ctx, raf = null;

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

export function startVisualPulse(color = '#22c55e') {
    if (raf) cancelAnimationFrame(raf);
    let t = 0;
    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pulse-speed')) || 1.6;
        t += 0.016 * speed;
        const pulse = (Math.sin(t * Math.PI) * 0.5 + 0.5);
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const r = Math.min(canvas.width, canvas.height) * 0.4;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(120,180,255,${0.06 * pulse})`);
        g.addColorStop(0.5, `rgba(80,140,220,${0.03 * pulse})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Concentric rings
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(cx, cy, r * (i / 3) * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(120,180,255,${0.04 * pulse})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        raf = requestAnimationFrame(draw);
    }
    draw();
}

export function stopVisualPulse() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}
