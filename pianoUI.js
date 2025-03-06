import { NOTE_CHAR_LIST, BASE_NOTE, MAJOR_SCALE_NOTE_LIST } from './constants.js';

export class PianoUI {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.pianos = [];
    this.numberOfKeys = 24;
    this.pitchShiftValue = 0;
    this.initializeUI();
  }

  initializeUI() {
    this.setupNumberOfKeysSelector();
    this.setupAddPianoButton();
    this.setupVolumeControl();
    this.setupPitchShiftControls();
    if (this.pianos.length === 0) {
      this.addPiano();
    }
  }

  setupNumberOfKeysSelector() {
    const numberOfKeysSelector = document.querySelector("#numberOfKeysSelector");
    for (let i = 1; i <= 88; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      numberOfKeysSelector.appendChild(option);
    }
    numberOfKeysSelector.value = this.numberOfKeys;
    numberOfKeysSelector.addEventListener("change", e => {
      this.numberOfKeys = numberOfKeysSelector.value;
      this.rebuildPianos();
    });
  }

  setupAddPianoButton() {
    document.querySelector("#addPianoButton").addEventListener("click", () => {
      this.addPiano();
    });
  }

  setupVolumeControl() {
    const volumeControl = document.querySelector("#volumeControl");
    volumeControl.type = "range";
    volumeControl.min = "0";
    volumeControl.max = "1";
    volumeControl.step = "0.01";
    volumeControl.value = this.audioManager.masterGainNode.gain.value.toString();
    volumeControl.addEventListener("input", (event) => {
      const volume = parseFloat(event.target.value);
      this.audioManager.setVolume(volume);
    });
  }

  setupPitchShiftControls() {
    const pitchShiftValueEle = document.querySelector("#pitchShift-value");
    pitchShiftValueEle.innerText = this.pitchShiftValue;
    
    document.querySelectorAll("button.pitchShift").forEach(button => {
      button.addEventListener("click", () => {
        if (button.classList.contains("up")) {
          this.pitchShiftValue += 1;
          this.updatePitchShift(1);
        } else if (button.classList.contains("down")) {
          this.pitchShiftValue -= 1;
          this.updatePitchShift(-1);
        }
        pitchShiftValueEle.innerText = this.pitchShiftValue;
      });
    });
  }

  updatePitchShift(shift) {
    document.querySelectorAll(".key").forEach(key => {
      const midiNumber = key.getAttribute("data-note");
      const newMidiNumber = parseInt(midiNumber) + (12 * shift);
      let pitchNote = key.id;
      const match = pitchNote.match(/^([A-Za-z]{1,2})(\d{1,2})$/);
      const newPitchNote = `${match[1]}${parseInt(match[2], 10) + shift}`;
      key.setAttribute("data-note", newMidiNumber);
      key.id = newPitchNote;
    });
  }

  createKeys() {
    const pianoBackground = document.createElement("div");
    pianoBackground.classList.add("piano-background");
    const whiteKeyWidth = Math.min(8, 90 / (this.numberOfKeys / 12 * 7));
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyWidthhalf = blackKeyWidth / 2;
    const GapOfBlackKey = whiteKeyWidth / 20;
    const firstNotePitchNumber = this.numberOfKeys <= 13 ? 4+this.pitchShiftValue : this.numberOfKeys <= 49 ? 3+this.pitchShiftValue : this.numberOfKeys <= 61 ? 2+this.pitchShiftValue : 1+this.pitchShiftValue;
    const firstNotePitch = `C${firstNotePitchNumber}`;
    const firstNoteMidiNumber = this.noteToMidi(firstNotePitch);
    let whiteKeyCount = 0;
    let pianoBackgroundWidth = 0;

    for (let num = 1; num <= this.numberOfKeys; num++) {
      const keyElem = document.createElement("div");
      const noteMidiNumber = firstNoteMidiNumber + num - 1;
      const notePitch = this.midiToNote(noteMidiNumber);
      const match = notePitch.match(/^([A-G][s]?)(\d)$/);
      const [, noteChar, noteOctave] = match;

      keyElem.setAttribute("data-note", noteMidiNumber);
      keyElem.setAttribute("pitch-class", noteChar);
      keyElem.classList.add("key");
      keyElem.id = notePitch;

      if (noteChar.includes("s")) {
        keyElem.classList.add("black-key");
        keyElem.style.width = `${blackKeyWidth}vw`;

        let blackKeyPosition = whiteKeyWidth * whiteKeyCount - blackKeyWidthhalf;

        if (noteChar === "Cs" || noteChar === "Fs") {
          blackKeyPosition -= GapOfBlackKey;
        } else if (noteChar === "Ds" || noteChar === "As") {
          blackKeyPosition += GapOfBlackKey;
        }
        keyElem.style.left = `${blackKeyPosition}vw`;

        if (num == 1 || num == this.numberOfKeys) {
          pianoBackgroundWidth += blackKeyWidth;
        }
      } else {
        keyElem.classList.add("white-key");
        keyElem.style.width = `${whiteKeyWidth}vw`;
        whiteKeyCount += 1;
        pianoBackgroundWidth += whiteKeyWidth;
      }

      const marker = document.createElement("div");
      marker.className = "scale-marker";
      keyElem.appendChild(marker);

      keyElem.addEventListener('mousedown', () => {
        this.audioManager.playNote(notePitch);
        keyElem.classList.add('active');
      });
      keyElem.addEventListener('mouseup', () => {
        this.audioManager.stopNote(notePitch);
        keyElem.classList.remove('active');
      });
      keyElem.addEventListener('mouseleave', () => {
        this.audioManager.stopNote(notePitch);
        keyElem.classList.remove('active');
      });
      keyElem.addEventListener('touchstart', () => {
        this.audioManager.playNote(notePitch);
        keyElem.classList.add('active');
      });
      keyElem.addEventListener('touchend', () => {
        this.audioManager.stopNote(notePitch);
        keyElem.classList.remove('active');
      });

      pianoBackground.appendChild(keyElem);
    }
    pianoBackground.style.width = `${pianoBackgroundWidth}vw`;

    const pianoContainer = document.createElement("div");
    pianoContainer.classList.add("pianoContainer");
    pianoContainer.appendChild(pianoBackground);
    return pianoContainer;
  }

  getNoteFromIndex(index) {
    const octave = Math.floor(index / 12) + 3;
    const noteIndex = index % 12;
    return `${NOTE_CHAR_LIST[noteIndex]}${octave}`;
  }

  noteToMidi(note) {
    const match = note.match(/^([A-G][s]?)(\d)$/);
    if (!match) return null;

    const [, pitch, octave] = match;
    const pitchIndex = NOTE_CHAR_LIST.indexOf(pitch);
    if (pitchIndex === -1) return null;

    return (parseInt(octave) + 1) * 12 + BASE_NOTE[pitch];
  }

  midiToNote(midiNumber) {
    const octave = Math.floor(midiNumber / 12) - 1;
    const pitchIndex = midiNumber % 12;
    const pitch = NOTE_CHAR_LIST.find((n, index) => BASE_NOTE[n] === pitchIndex);
    if (!pitch) return null;
    return `${pitch}${octave}`;
  }

  addPiano() {
    const pianoId = this.pianos.length + 1;
    const newPiano = {
      id: pianoId,
      scale: "C",
      scaleNotes: this.getScaleNotes("C"),
      chordDegree: null,
      chordNotes: null,
      showHighlight: true  // デフォルトでハイライトを表示
    };
    this.pianos.push(newPiano);

    const pianoInstance = this.createPianoInstance(pianoId);
    document.querySelector("#mainContainer").appendChild(pianoInstance);
    this.setKeySelection();
    this.setChordButton(pianoInstance);
    this.highlightScaleAndChord(pianoId);  // 初期表示時にハイライトを適用
  }

  createPianoInstance(pianoId) {
    const pianoInstance = document.createElement("div");
    pianoInstance.classList.add("piano-instance");
    pianoInstance.id = `pianoInstance-${pianoId}`;

    if(pianoId !== 1) {
    pianoInstance.appendChild(document.createElement("hr"));
    }
    // スケールセレクターの追加
    const scaleSelector = this.createScaleSelector(pianoId);
    pianoInstance.appendChild(scaleSelector);

    // 鍵盤の追加
    const pianoContainer = this.createKeys();
    pianoInstance.appendChild(pianoContainer);

    // コードボタンの追加
    const chordButtons = this.createChordButtons();
    pianoInstance.appendChild(chordButtons);

    return pianoInstance;
  }

  createScaleSelector(pianoId) {
    const scaleSelector = document.createElement("div");
    const noteOrder = ["C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs", "A", "As", "B"];
    scaleSelector.innerHTML = `
      <div id="scaleSelectorContainer-${pianoId}" class="selector-container">
        <label for="scaleSelector-${pianoId}" class="selector-label">スケール</label>
        <select id="scaleSelector-${pianoId}" class="scaleSelector custom-select">
          ${noteOrder.map(note => `<option value="${note}">${note}</option>`).join('')}
        </select>
        <button id="highlightToggle-${pianoId}" class="highlight-toggle active">
          <span class="toggle-icon">♪</span>
        </button>
      </div>
    `;

    // トグルボタンのイベントリスナーを追加
    const toggleButton = scaleSelector.querySelector(`#highlightToggle-${pianoId}`);
    toggleButton.addEventListener("click", () => {
      toggleButton.classList.toggle("active");
      const pianoIndex = pianoId - 1;
      if (this.pianos[pianoIndex]) {
        this.pianos[pianoIndex].showHighlight = toggleButton.classList.contains("active");
        this.highlightScaleAndChord(pianoId);
      }
    });

    return scaleSelector;
  }

  createChordButtons() {
    const chordButtons = document.createElement("div");
    chordButtons.innerHTML = `
      <div id="chord-buttons-wrapper" class="chord-wrapper">
        <div class="chord-group">
          <label class="chord-label">ダイアトニックコード</label>
          <div class="chord-buttons diatonic">
            <button data-chord="I" class="tonic">I</button>
            <button data-chord="IIm" class="subdominant">IIm</button>
            <button data-chord="IIIm" class="dominant">IIIm</button>
            <button data-chord="IV" class="subdominant">IV</button>
            <button data-chord="V" class="dominant">V</button>
            <button data-chord="VIm" class="tonic">VIm</button>
            <button data-chord="VIIdim" class="diminish">VIIdim</button>
          </div>
        </div>
        <div class="chord-group">
          <label class="chord-label">パラレルマイナーコード</label>
          <div class="chord-buttons parallel-minor">
            <button data-chord="Im" class="tonic">Im</button>
            <button data-chord="IIdim" class="diminish">IIdim</button>
            <button data-chord="IIIb" class="tonic">IIIb</button>
            <button data-chord="IVm" class="subdominant">IVm</button>
            <button data-chord="Vm" class="dominant">Vm</button>
            <button data-chord="VIb" class="subdominant">VIb</button>
            <button data-chord="VIIb" class="dominant">VIIb</button>
          </div>
        </div>
      </div>
    `;
    return chordButtons;
  }

  rebuildPianos() {
    document.querySelector("#mainContainer").innerHTML = "";
    const pianoNumber = this.pianos.length;
    this.pianos = [];
    for (let i = 0; i < pianoNumber; i++) {
      this.addPiano();
    }
  }

  getScaleNotes(startNote) {
    const startIndex = NOTE_CHAR_LIST.indexOf(startNote);
    return startIndex === -1 ? [] : 
      MAJOR_SCALE_NOTE_LIST.map(i => NOTE_CHAR_LIST[(startIndex + i) % NOTE_CHAR_LIST.length]);
  }

  setKeySelection() {
    document.querySelectorAll(".scaleSelector").forEach(selector => {
      selector.addEventListener("change", (event) => {
        const selectedKey = event.target.value;
        const pianoDiv = event.target.closest("div[id^='pianoInstance-']");
        const pianoId = parseInt(pianoDiv.id.replace("pianoInstance-", ""));
        const pianoIndex = pianoId - 1;
        
        if (this.pianos[pianoIndex]) {
          this.pianos[pianoIndex].scale = selectedKey;
          this.pianos[pianoIndex].scaleNotes = this.getScaleNotes(selectedKey);
          this.highlightScaleAndChord(pianoId);
        }
      });
    });
  }

  highlightScaleAndChord(pianoId) {
    const pianoInfo = this.pianos[pianoId - 1];
    if (!pianoInfo) return;

    const scale = pianoInfo.scale;
    const scaleNotes = pianoInfo.scaleNotes || [];
    const chordDegree = pianoInfo.chordDegree;
    const chordNotes = pianoInfo.chordNotes || [];
    const showHighlight = pianoInfo.showHighlight;

    document.querySelectorAll(`#pianoInstance-${pianoId} .key`).forEach((keyElem) => {
      const note = keyElem.getAttribute("pitch-class");

      // スケールのハイライト
      if (showHighlight && scaleNotes.includes(note)) {
        keyElem.classList.add("scale-highlight");
        keyElem.querySelector(".scale-marker").innerText = parseInt(scaleNotes.indexOf(note)) + 1;
      } else {
        keyElem.classList.remove("scale-highlight");
        keyElem.querySelector(".scale-marker").innerText = "";
      }

      // トニックノートのハイライト
      if (showHighlight && note === scale) {
        keyElem.classList.add("tonic-note");
      } else {
        keyElem.classList.remove("tonic-note");
      }

      // コードのハイライト
      if (chordNotes.includes(note)) {
        keyElem.classList.add("chord-highlight");
      } else {
        keyElem.classList.remove("chord-highlight");
      }

      // ルートノートのハイライト
      if (note === chordNotes[0]) {
        keyElem.classList.add("root-note");
      } else {
        keyElem.classList.remove("root-note");
      }
    });
  }

  setChordButton(pianoInstance) {
    pianoInstance.querySelectorAll(".chord-buttons button").forEach(button => {
      button.addEventListener("click", () => {
        const pianoDiv = button.closest("div[id^='pianoInstance-']");
        const pianoId = parseInt(pianoDiv.id.replace("pianoInstance-", ""));
        const pianoIndex = pianoId - 1;
        const chordDegree = button.dataset.chord;

        if (!this.pianos[pianoIndex]) return;

        if (button.classList.contains("active")) {
          // 同じボタンを再度クリックした場合は選択を解除
          document.querySelectorAll(`#pianoInstance-${pianoId} .chord-buttons button`).forEach(btn => {
            btn.classList.remove("active");
          });
          this.pianos[pianoIndex].chordDegree = null;
          this.pianos[pianoIndex].chordNotes = null;
        } else {
          // 新しいコードを選択
          document.querySelectorAll(`#pianoInstance-${pianoId} .chord-buttons button`).forEach(btn => {
            btn.classList.remove("active");
          });
          button.classList.add("active");
          this.pianos[pianoIndex].chordDegree = chordDegree;
          this.pianos[pianoIndex].chordNotes = this.getChordNotes(this.pianos[pianoIndex].scale, chordDegree);
        }

        this.highlightScaleAndChord(pianoId);
      });
    });
  }

  getChordNotes(scale, chordType) {
    const startIndex = NOTE_CHAR_LIST.indexOf(scale);
    const chordPattern = {
      "I": [0, 4, 7],
      "IIm": [2, 5, 9],
      "IIIm": [4, 7, 11],
      "IV": [5, 9, 0],
      "V": [7, 11, 2],
      "VIm": [9, 0, 4],
      "VIIdim": [11, 2, 5],
      "Im": [0, 3, 7],
      "IIdim": [2, 5, 8],
      "IIIb": [3, 7, 10],
      "IVm": [5, 8, 0],
      "Vm": [7, 10, 2],
      "VIb": [8, 0, 3],
      "VIIb": [10, 2, 5]
    };

    if (!chordPattern[chordType]) return [];
    return chordPattern[chordType].map(index => NOTE_CHAR_LIST[(startIndex + index) % NOTE_CHAR_LIST.length]);
  }
} 