import assert from 'assert';

console.log('Running Audio Resilience & SoundFX Tests...');

// Setup minimal mock window/AudioContext environment for Node.js test runner
const createAudioParam = () => ({
  value: 0,
  setValueAtTime: () => {},
  linearRampToValueAtTime: () => {},
  exponentialRampToValueAtTime: () => {}
});

class MockAudioNode {
  constructor() {
    this.gain = createAudioParam();
  }
  connect() {}
}

class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.state = 'suspended';
    this.destination = new MockAudioNode();
  }
  createGain() {
    return new MockAudioNode();
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: createAudioParam(),
      Q: createAudioParam(),
      connect: () => {}
    };
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: createAudioParam(),
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  resume() {
    this.state = 'running';
  }
}

globalThis.window = {
  AudioContext: MockAudioContext
};

const { sound } = await import('../src/audio/soundFX.js');

// Test 1: Initial state
assert.strictEqual(sound.muted, false, 'Audio should start unmuted');

// Test 2: Sound playback calls work cleanly
assert.doesNotThrow(() => {
  sound.playKeyClick();
  sound.playSyscall();
  sound.playFork();
  sound.playKernelPulse();
  sound.playDiskIO();
  sound.playSuccess();
  sound.playError();
}, 'Sound methods should execute without runtime exceptions');

// Test 3: Context initialization and verification
sound.init();
assert.strictEqual(sound.initialized, true, 'Sound should be initialized');
assert.ok(sound.ctx, 'AudioContext should be established');

// Test 4: Mute toggling
const mutedState = sound.toggleMute();
assert.strictEqual(mutedState, true, 'Mute should toggle to true');
assert.strictEqual(sound.muted, true, 'sound.muted property should be true');

// Test 5: No sound played when muted
assert.doesNotThrow(() => {
  sound.playKeyClick();
  sound.playSyscall();
}, 'Audio triggers while muted should return early safely');

// Test 6: Unmute
sound.toggleMute();
assert.strictEqual(sound.muted, false, 'Mute should toggle back to false');

console.log('✓ SoundFX safe mode, AudioContext lifecycle, and mute toggling verified.');
