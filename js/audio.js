// audio.js - KAIROS Frequency Engine with Envelopes
// ✅ PERF FIX B: Import updatePulseSpeed to cache CSS variable reads
import { updatePulseSpeed } from './visuals.js';

export const FREQUENCY_MAP = {
    174: { speed: 0.5, color: '#1e3a8a', rgb: '30,58,138',   intensity: 0.3, label: 'Foundation', desc: 'Pain relief, grounding, security. The base of the torus.' },
    285: { speed: 0.7, color: '#2563eb', rgb: '37,99,235',   intensity: 0.4, label: 'Healing',    desc: 'Cellular regeneration, restoration, stage reset support.' },
    396: { speed: 0.9, color: '#7c3aed', rgb: '124,58,237',  intensity: 0.5, label: 'Liberation', desc: 'Release from guilt and fear. Opens blocked cycles.' },
    417: { speed: 1.1, color: '#9333ea', rgb: '147,51,234',  intensity: 0.6, label: 'Change',     desc: 'Facilitates transformation and clearing of old patterns.' },
    432: { speed: 1.2, color: '#06b6d4', rgb: '6,182,212',   intensity: 0.6, label: 'Natural',    desc: 'Universal alignment. Nervous system coherence. Crossroads clarity.' },
    528: { speed: 1.6, color: '#22c55e', rgb: '34,197,94',   intensity: 0.8, label: 'Transform',  desc: 'The love frequency. DNA repair, miracles, peak flow activation.' },
    639: { speed: 1.3, color: '#10b981', rgb: '16,185,129',  intensity: 0.7, label: 'Connection', desc: 'Relationships, harmony, coherence between systems.' },
    741: { speed: 1.5, color: '#f59e0b', rgb: '245,158,11',  intensity: 0.8, label: 'Expression', desc: 'Problem solving, creative power, Engine of Expression activation.' },
    852: { speed: 1.8, color: '#f97316', rgb: '249,115,22',  intensity: 0.9, label: 'Order',      desc: 'Return to spiritual alignment. Lens of Distillation support.' },
    963: { speed: 2.2, color: '#ffffff', rgb: '255,255,255', intensity: 1.0, label: 'Guide',      desc: 'Pineal activation. Unity consciousness. Stage 9 resonance.' },
};

let ctx = null, osc = null, gain = null, playing = false, currentFreq = null;

export async function initAudio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') await ctx.resume();
}

export function playFrequency(freq) {
    if (!ctx) return;
    stopFrequency();
    osc = ctx.createOscillator();
    gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.08);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    playing = true;
    currentFreq = freq;
    const cfg = FREQUENCY_MAP[freq] || FREQUENCY_MAP[528];
    // ✅ PERF FIX B: Update cached pulse speed instead of relying on CSS variable reads
    updatePulseSpeed(cfg.speed);
    document.documentElement.style.setProperty('--pulse-speed', cfg.speed);
    document.documentElement.style.setProperty('--pulse-rgb', cfg.rgb);
    document.body.classList.add('pulse-active');
}

export function stopFrequency() {
    if (osc) {
        try { gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.06); osc.stop(ctx.currentTime + 0.1); } catch(e) {}
        osc = null; gain = null;
    }
    playing = false; currentFreq = null;
    document.body.classList.remove('pulse-active');
}

export function isPlaying() { return playing; }
export function getCurrentFreq() { return currentFreq; }
