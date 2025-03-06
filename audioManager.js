import { NOTE_CHAR_LIST, PROJECT_NAME } from './constants.js';

export class AudioManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.gain.value = 0.3;
    this.masterGainNode.connect(this.audioContext.destination);

    this.audioBuffers = {};
    this.activeSources = {};
    this.gainNodes = {};

    this.initializeAudio();
  }

  initializeAudio() {
    NOTE_CHAR_LIST.forEach(note =>
      Array.from({ length: 6 }, (_, i) => this.loadAudio(`${note}${i + 1}`))
    );
  }

  async loadAudio(notePitch) {
    const audioPath = `./audio/${notePitch}.mp3`;
    try {
      const response = await fetch(audioPath);
      const buffer = await response.arrayBuffer();
      const decodedData = await this.audioContext.decodeAudioData(buffer);
      this.audioBuffers[notePitch] = decodedData;
    } catch (error) {
      console.error(`Failed to load ${notePitch}.mp3:`, error);
    }
  }

  playNote(notePitch) {
    if (!this.audioBuffers[notePitch]) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = this.audioBuffers[notePitch];
    source.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    source.start(0);
    this.activeSources[notePitch] = source;
    this.gainNodes[notePitch] = gainNode;
  }

  stopNote(notePitch) {
    if (this.activeSources[notePitch]) {
      this.activeSources[notePitch].stop();
      delete this.activeSources[notePitch];
      delete this.gainNodes[notePitch];
    }
  }

  setVolume(volume) {
    this.masterGainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
  }
} 