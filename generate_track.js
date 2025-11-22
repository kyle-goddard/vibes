import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleRate = 44100;
const duration = 14.76; // ~15 seconds loop (32 bars at 130 BPM)
const numSamples = Math.floor(sampleRate * duration);
const buffer = new Float32Array(numSamples);

// Frequencies
const notes = {
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50
};

// Waveforms
const square = (t, freq) => (Math.sin(2 * Math.PI * freq * t) > 0 ? 0.5 : -0.5);
const saw = (t, freq) => {
    const period = 1 / freq;
    return 2 * ((t % period) / period) - 1;
};
const triangle = (t, freq) => {
    const period = 1 / freq;
    return 2 * Math.abs(2 * ((t % period) / period) - 1) - 1;
};
const noise = () => Math.random() * 2 - 1;

const tempo = 130; // Faster, Mario Kart style
const secondsPerBeat = 60 / tempo;
const samplesPerBeat = sampleRate * secondsPerBeat;

// Melody Sequence (Simple upbeat tune)
// 16th note steps
const melody = [
    // Bar 1
    { note: 'C5', len: 2 }, { note: 'G4', len: 2 }, { note: 'E4', len: 2 }, { note: 'A4', len: 2 },
    { note: 'B4', len: 2 }, { note: 'A4', len: 2 }, { note: 'G4', len: 4 },
    // Bar 2
    { note: 'F4', len: 2 }, { note: 'G4', len: 2 }, { note: 'A4', len: 2 }, { note: 'B4', len: 2 },
    { note: 'C5', len: 4 }, { note: 'C5', len: 4 },
    // Bar 3
    { note: 'C5', len: 2 }, { note: 'D5', len: 2 }, { note: 'E5', len: 2 }, { note: 'F5', len: 2 },
    { note: 'G5', len: 2 }, { note: 'F5', len: 2 }, { note: 'E5', len: 4 },
    // Bar 4
    { note: 'D5', len: 2 }, { note: 'E5', len: 2 }, { note: 'F5', len: 2 }, { note: 'D5', len: 2 },
    { note: 'C5', len: 8 },
];

// Convert melody to a flat array of notes per 16th step
const melodySteps = [];
let currentStep = 0;
melody.forEach(n => {
    for (let i = 0; i < n.len; i++) {
        melodySteps.push(i === 0 ? n.note : null); // Only trigger on first step
    }
});
// Repeat melody to fill time
while (melodySteps.length < 128) { // 8 bars of 16th notes
    melodySteps.push(...melodySteps.slice(0, 64));
}


for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beat = t / secondsPerBeat;
    const step = Math.floor(beat * 4); // 16th notes
    const bar = Math.floor(beat / 4);

    let sample = 0;

    // --- BASS (Sawtooth, driving) ---
    const bassProgression = ['C2', 'G2', 'A2', 'F2']; // I - V - vi - IV
    const bassNoteName = bassProgression[bar % 4];
    const bassFreq = notes[bassNoteName];

    // Bass rhythm: 8th notes
    const bassStep = Math.floor(beat * 2);
    const bassGate = (beat * 2) % 1 < 0.8; // Staccato
    if (bassGate) {
        sample += saw(t, bassFreq) * 0.2;
        sample += saw(t, bassFreq * 1.01) * 0.1; // Detune for thickness
    }

    // --- CHORDS (Triangle, pulsing) ---
    const chordProgression = [
        ['C4', 'E4', 'G4'], // C
        ['G3', 'B3', 'D4'], // G
        ['A3', 'C4', 'E4'], // Am
        ['F3', 'A3', 'C4']  // F
    ];
    const currentChord = chordProgression[bar % 4];

    // Pulse chords on off-beats (ska/reggae feel or just driving 8ths)
    const chordGate = (beat % 1) > 0.5; // Off-beat
    if (chordGate) {
        const env = Math.max(0, 1 - ((beat % 0.5) * 4)); // Quick decay
        currentChord.forEach(n => {
            sample += triangle(t, notes[n]) * 0.05 * env;
        });
    }

    // --- MELODY (Square, lead) ---
    const melodyNoteName = melodySteps[step % melodySteps.length];
    // Simple envelope state tracking would be better, but for per-sample loop:
    // We need to know when the last note started.
    // Let's just use the current step's note if it exists, and decay it.
    // This is a simplification; a real synth tracks voice state.
    // For this simple script, we'll just play the note if it's the start of a step that has a note.

    // Better approach for this loop: calculate envelope based on time within step
    const stepTime = (beat * 4) % 1; // 0 to 1 within a 16th note

    // We need to find the active note. Look back to find the last non-null note.
    let activeNote = null;
    let stepsBack = 0;
    for (let s = 0; s < 16; s++) { // Look back up to a bar
        const checkStep = step - s;
        if (checkStep < 0) break;
        if (melodySteps[checkStep % melodySteps.length]) {
            activeNote = melodySteps[checkStep % melodySteps.length];
            stepsBack = s;
            break;
        }
    }

    if (activeNote) {
        const noteTime = stepsBack + stepTime; // Time in 16th notes since note start
        const melodyEnv = Math.max(0, 1 - (noteTime * 0.1)); // Long decay

        // Vibrato
        const vib = Math.sin(t * 20) * 2;

        sample += square(t, notes[activeNote] + vib) * 0.15 * melodyEnv;
    }


    // --- DRUMS ---
    // Kick: beats 1, 2, 3, 4 (Four on the floor)
    const kickEnv = Math.max(0, 1 - (beat % 1) * 6);
    sample += Math.sin(2 * Math.PI * 100 * (1 - kickEnv) * t) * kickEnv * 0.4; // Pitch drop kick

    // Snare: beats 2 and 4
    if (Math.floor(beat) % 2 === 1) {
        const snareEnv = Math.max(0, 1 - (beat % 1) * 8);
        sample += noise() * 0.15 * snareEnv;
    }

    // Hi-hat: every 8th note
    if ((beat * 2) % 1 < 0.1) {
        sample += noise() * 0.05; // Click
    }


    buffer[i] = sample;
}

// WAV Encoding
const dataSize = numSamples * 2;
const headerSize = 44;
const wavBuffer = Buffer.alloc(headerSize + dataSize);

wavBuffer.write('RIFF', 0);
wavBuffer.writeUInt32LE(36 + dataSize, 4);
wavBuffer.write('WAVE', 8);
wavBuffer.write('fmt ', 12);
wavBuffer.writeUInt32LE(16, 16);
wavBuffer.writeUInt16LE(1, 20);
wavBuffer.writeUInt16LE(1, 22);
wavBuffer.writeUInt32LE(sampleRate, 24);
wavBuffer.writeUInt32LE(sampleRate * 2, 28);
wavBuffer.writeUInt16LE(2, 32);
wavBuffer.writeUInt16LE(16, 34);
wavBuffer.write('data', 36);
wavBuffer.writeUInt32LE(dataSize, 40);

for (let i = 0; i < numSamples; i++) {
    let s = Math.max(-1, Math.min(1, buffer[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7FFF;
    wavBuffer.writeInt16LE(Math.floor(s), 44 + i * 2);
}

// Ensure public dir exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

fs.writeFileSync(path.join(publicDir, 'retro-tune.wav'), wavBuffer);
console.log('Generated retro-tune.wav');

