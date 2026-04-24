// anubis.js - Spectral Anomaly Detection (Phase 2: Harmonic Drift)
// Monitors frequency peaks in vibration/sensor data for industrial SAP Stage 5 warnings

let analyser = null, dataArray = null, audioContext = null;
let isMonitoring = false;
let previousPeakFreq = null;
let peakFreqHistory = [];
let anomalyListeners = [];

/**
 * Initialize spectral monitoring with Web Audio API
 */
export async function startSpectralMonitoring() {
    if (isMonitoring) return;
    
    try {
        // Request microphone access (or use simulated data)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        isMonitoring = true;
        
        monitorSpectrum();
    } catch (err) {
        console.warn('Microphone access denied, using simulated spectral data:', err);
        // Fallback: simulate spectral data
        startSimulatedSpectralMonitoring();
    }
}

/**
 * Stop spectral monitoring
 */
export function stopSpectralMonitoring() {
    isMonitoring = false;
    if (audioContext) audioContext.close();
    analyser = null;
    dataArray = null;
}

/**
 * Find dominant frequency peak in spectrum
 */
function findDominantPeak(frequencyData) {
    let maxValue = 0, maxIndex = 0;
    for (let i = 0; i < frequencyData.length; i++) {
        if (frequencyData[i] > maxValue) {
            maxValue = frequencyData[i];
            maxIndex = i;
        }
    }
    // Convert bin index to frequency (assuming 44.1kHz sample rate)
    const nyquist = 22050;
    const freq = (maxIndex / frequencyData.length) * nyquist;
    return { freq, magnitude: maxValue };
}

/**
 * Calculate harmonic drift (frequency shift over time)
 */
function calculateHarmonicDrift(currentPeakFreq, previousPeakFreq) {
    if (!previousPeakFreq) return 0;
    const drift = Math.abs(currentPeakFreq - previousPeakFreq) / previousPeakFreq;
    return drift;
}

/**
 * Monitor spectrum in real-time
 */
function monitorSpectrum() {
    if (!isMonitoring || !analyser) return;
    
    analyser.getByteFrequencyData(dataArray);
    const peak = findDominantPeak(dataArray);
    
    peakFreqHistory.push(peak.freq);
    if (peakFreqHistory.length > 100) peakFreqHistory.shift();
    
    // Check for harmonic drift (>2% shift over 0.5s = ~30 frames)
    if (peakFreqHistory.length >= 30) {
        const recentPeaks = peakFreqHistory.slice(-30);
        const oldPeaks = peakFreqHistory.slice(-60, -30);
        
        const avgRecentFreq = recentPeaks.reduce((a, b) => a + b, 0) / recentPeaks.length;
        const avgOldFreq = oldPeaks.reduce((a, b) => a + b, 0) / oldPeaks.length;
        
        const drift = calculateHarmonicDrift(avgRecentFreq, avgOldFreq);
        
        if (drift > 0.02) {
            emitAnomaly({
                type: 'harmonic_drift',
                severity: Math.min(1, drift * 10),
                previousFreq: avgOldFreq,
                currentFreq: avgRecentFreq,
                driftPercent: Math.round(drift * 100),
                magnitude: peak.magnitude,
                timestamp: Date.now(),
                message: `Harmonic drift detected: ${Math.round(drift * 100)}% frequency shift (${Math.round(avgOldFreq)}Hz → ${Math.round(avgRecentFreq)}Hz)`
            });
        }
    }
    
    previousPeakFreq = peak.freq;
    requestAnimationFrame(monitorSpectrum);
}

/**
 * Simulated spectral monitoring (fallback when microphone unavailable)
 */
function startSimulatedSpectralMonitoring() {
    let simTime = 0;
    let baseFreq = 60; // 60Hz baseline (common industrial frequency)
    
    function simulateSpectrum() {
        if (!isMonitoring) return;
        
        simTime += 0.016; // ~60fps
        
        // Simulate slow frequency drift with occasional jumps
        const driftComponent = Math.sin(simTime * 0.5) * 2;
        const jumpComponent = Math.random() > 0.98 ? (Math.random() - 0.5) * 5 : 0;
        const currentFreq = baseFreq + driftComponent + jumpComponent;
        
        peakFreqHistory.push(currentFreq);
        if (peakFreqHistory.length > 100) peakFreqHistory.shift();
        
        // Check for harmonic drift
        if (peakFreqHistory.length >= 30) {
            const recentPeaks = peakFreqHistory.slice(-30);
            const oldPeaks = peakFreqHistory.slice(-60, -30);
            
            const avgRecentFreq = recentPeaks.reduce((a, b) => a + b, 0) / recentPeaks.length;
            const avgOldFreq = oldPeaks.reduce((a, b) => a + b, 0) / oldPeaks.length;
            
            const drift = calculateHarmonicDrift(avgRecentFreq, avgOldFreq);
            
            if (drift > 0.02) {
                emitAnomaly({
                    type: 'harmonic_drift',
                    severity: Math.min(1, drift * 10),
                    previousFreq: avgOldFreq,
                    currentFreq: avgRecentFreq,
                    driftPercent: Math.round(drift * 100),
                    magnitude: 128,
                    timestamp: Date.now(),
                    message: `Harmonic drift detected: ${Math.round(drift * 100)}% frequency shift (${Math.round(avgOldFreq)}Hz → ${Math.round(avgRecentFreq)}Hz)`,
                    simulated: true
                });
            }
        }
        
        previousPeakFreq = currentFreq;
        requestAnimationFrame(simulateSpectrum);
    }
    
    isMonitoring = true;
    simulateSpectrum();
}

/**
 * Emit anomaly event to listeners
 */
function emitAnomaly(anomalyData) {
    anomalyListeners.forEach(listener => listener(anomalyData));
}

/**
 * Subscribe to anomaly events
 */
export function onAnomaly(callback) {
    anomalyListeners.push(callback);
}

/**
 * Get current spectral state
 */
export function getSpectralState() {
    if (peakFreqHistory.length === 0) return null;
    
    const currentFreq = peakFreqHistory[peakFreqHistory.length - 1];
    const avgFreq = peakFreqHistory.reduce((a, b) => a + b, 0) / peakFreqHistory.length;
    const variance = peakFreqHistory.reduce((sum, freq) => sum + Math.pow(freq - avgFreq, 2), 0) / peakFreqHistory.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        currentFreq: Math.round(currentFreq * 10) / 10,
        averageFreq: Math.round(avgFreq * 10) / 10,
        standardDeviation: Math.round(stdDev * 10) / 10,
        peakCount: peakFreqHistory.length,
        isMonitoring
    };
}

/**
 * Export spectral data for visualization
 */
export function getSpectralHistory() {
    return [...peakFreqHistory];
}
