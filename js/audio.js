// audio.js - KAIROS Frequency Engine with Envelopes
// ✅ PERF FIX B: Import updatePulseSpeed to cache CSS variable reads
import { updatePulseSpeed } from './visuals.js';

export const FREQUENCY_MAP = {
    174: { speed: 0.5, color: '#1e3a8a', rgb: '30,58,138',   intensity: 0.3, label: 'Foundation', desc: '174 Hz sine tone. The label is an aesthetic association; no specific health effect is established.' },
    285: { speed: 0.7, color: '#2563eb', rgb: '37,99,235',   intensity: 0.4, label: 'Restoration (label only)',    desc: '285 Hz sine tone. No cellular or medical effect is established by this application.' },
    396: { speed: 0.9, color: '#7c3aed', rgb: '124,58,237',  intensity: 0.5, label: 'Liberation', desc: '396 Hz sine tone. No specific psychological effect is established.' },
    417: { speed: 1.1, color: '#9333ea', rgb: '147,51,234',  intensity: 0.6, label: 'Change',     desc: '417 Hz sine tone. No specific psychological effect is established.' },
    432: { speed: 1.2, color: '#06b6d4', rgb: '6,182,212',   intensity: 0.6, label: 'Natural',    desc: '432 Hz sine tone. No nervous-system effect is established.' },
    528: { speed: 1.6, color: '#22c55e', rgb: '34,197,94',   intensity: 0.8, label: 'Transform',  desc: '528 Hz sine tone. Claims about DNA repair, miracles, or biological effects are not established.' },
    639: { speed: 1.3, color: '#10b981', rgb: '16,185,129',  intensity: 0.7, label: 'Connection', desc: '639 Hz sine tone. The label is an aesthetic association, not a measured relational effect.' },
    741: { speed: 1.5, color: '#f59e0b', rgb: '245,158,11',  intensity: 0.8, label: 'Expression', desc: '741 Hz sine tone. No specific cognitive effect is established.' },
    852: { speed: 1.8, color: '#f97316', rgb: '249,115,22',  intensity: 0.9, label: 'Order',      desc: '852 Hz sine tone. The label is an aesthetic association, not a measured spiritual effect.' },
    963: { speed: 2.2, color: '#ffffff', rgb: '255,255,255', intensity: 1.0, label: 'Guide',      desc: '963 Hz sine tone. Pineal activation or altered consciousness is not established.' },
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
