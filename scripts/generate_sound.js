// Generate a short click sound (sine wave with rapid exponential decay)
const sampleRate = 44100;
const duration = 0.05; // 50ms
const numSamples = Math.floor(sampleRate * duration);

// Create buffer
const buffer = new ArrayBuffer(44 + numSamples * 2);
const view = new DataView(buffer);

// Helper to write string to buffer
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// RIFF chunk descriptor
writeString(view, 0, 'RIFF');
view.setUint32(4, 36 + numSamples * 2, true);
writeString(view, 8, 'WAVE');

// fmt sub-chunk
writeString(view, 12, 'fmt ');
view.setUint32(16, 16, true);
view.setUint16(20, 1, true); // PCM
view.setUint16(22, 1, true); // Mono
view.setUint32(24, sampleRate, true);
view.setUint32(28, sampleRate * 2, true);
view.setUint16(32, 2, true); // Block align
view.setUint16(34, 16, true); // Bits per sample

// data sub-chunk
writeString(view, 36, 'data');
view.setUint32(40, numSamples * 2, true);

// Generate sound data
const frequency = 1000;
for (let i = 0; i < numSamples; i++) {
    // Time in seconds
    const t = i / sampleRate;

    // Sine wave * exponential decay envelope
    // Use a faster decay to make it a click/pop
    const amplitude = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-50 * t);

    // Clamp to -1..1
    const sample = Math.max(-1, Math.min(1, amplitude));

    // Convert to 16-bit PCM (signed)
    // 0x7FFF is max positive value for 16-bit signed integer
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(44 + i * 2, intSample, true);
}

// Convert to base64
// We can use Buffer in Node.js to convert ArrayBuffer to Base64
const base64 = Buffer.from(buffer).toString('base64');
console.log(`data:audio/wav;base64,${base64}`);
