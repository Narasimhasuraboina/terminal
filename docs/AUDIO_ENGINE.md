# Web Audio API Procedural Sound Engine

The audio engine produces 100% procedural sound effects in real-time without external audio assets.

## Sound Synthesizer Specifications

### 1. Key Click (`playKeyClick`)
- **Oscillator Type**: `sine`
- **Frequency**: Random pitch variation between `1800Hz` and `2200Hz`
- **Envelope**: Instant attack, exponential decay over `18ms`
- **Gain**: `0.04` peak

### 2. Syscall Pulse (`playSyscall`)
- **Oscillator Type**: `sawtooth` routed through low-pass Biquad filter
- **Frequency**: Chirp down from `880Hz` to `220Hz`
- **Duration**: `140ms`
- **Significance**: Represents transition from Ring 3 to Ring 0

### 3. Process Fork (`playFork`)
- **Oscillator Type**: Dual detuned `triangle` oscillators
- **Frequency**: Low resonant `110Hz` base with sub-harmonic overtone
- **Duration**: `220ms`
- **Significance**: Represents thread creation and memory COW (Copy-On-Write) page duplication

### 4. Success Chime (`playSuccess`)
- **Oscillator Type**: Harmonic arpeggio (C5 -> E5 -> G5 -> C6)
- **Frequencies**: `523.25Hz`, `659.25Hz`, `783.99Hz`, `1046.50Hz`
- **Envelope**: Bell-like exponential decay with subtle stereo ping-pong
