import { AudioManager } from './audioManager.js';
import { PianoUI } from './pianoUI.js';

const projectName = "Piano";
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const masterGainNode = audioContext.createGain();

const noteCharList = ["A", "As", "B", "C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs"];
const baseNote = { "C": 0, "Cs": 1, "D": 2, "Ds": 3, "E": 4, "F": 5, "Fs": 6, "G": 7, "Gs": 8, "A": 9, "As": 10, "B": 11 };
const majorScaleNoteList = [0, 2, 4, 5, 7, 9, 11];
const minorScaleNoteList = [0, 2, 3, 5, 7, 8, 10];
const chordPatterns = {
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
  "VIIb": [10, 2, 5],
};

const mainContainer = document.querySelector("#mainContainer");

const numberOfKeysSelector = document.querySelector("#numberOfKeysSelector");
let numberOfKeys = 24;
for (let i = 1; i <= 88; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  numberOfKeysSelector.appendChild(option);
}
numberOfKeysSelector.value = numberOfKeys;
numberOfKeysSelector.addEventListener("change", e => {
  numberOfKeys = numberOfKeysSelector.value;
  document.querySelector("#mainContainer").innerHTML = "";
  const PianoNumber = pianos.length;
  pianos.length = 0; //初期化
  for (let i = 0; i < PianoNumber; i++) {
    addPiano();
  }
});



document.querySelector("#addPianoButton").addEventListener("click", () => {
  addPiano();
});

// masterGainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // デフォルト音量を小さめに設定
masterGainNode.gain.value = 0.3
masterGainNode.connect(audioContext.destination);
const audioBuffers = {}; // 音声ファイルをキャッシュするためのオブジェクト
const volumeControl = document.querySelector("#volumeControl");
volumeControl.type = "range";
volumeControl.min = "0";
volumeControl.max = "1";
volumeControl.step = "0.01";
volumeControl.value = masterGainNode.gain.value.toString();
volumeControl.addEventListener("input", (event) => {
  const volume = parseFloat(event.target.value);
  masterGainNode.gain.setValueAtTime(volume, audioContext.currentTime);
});
let activeSources = {}; // 再生中の音を保持するオブジェクト
let gainNodes = {}; // GainNode を管理するオブジェクト


const pitchShiftValueEle = document.querySelector("#pitchShift-value");
let pitchShiftValue = 0;
let pitchShiftingNumber = 0;
pitchShiftValueEle.innerText = pitchShiftValue;
document.querySelectorAll("button.pitchShift").forEach(button => {
  button.addEventListener("click", () => {
    if (button.classList.contains("up")) {
      pitchShiftValue += 1;
      pitchShiftingNumber = 1;
    } else if (button.classList.contains("down")) {
      pitchShiftValue -= 1;
      pitchShiftingNumber = -1;
    }
    pitchShiftValueEle.innerText = pitchShiftValue;

    document.querySelectorAll(".key").forEach(key => {
      const midiNumber = key.getAttribute("data-note");
      const newMidiNumber = parseInt(midiNumber) + (12 * pitchShiftingNumber);
      let pitchNote = key.id;
      const match = pitchNote.match(/^([A-Za-z]{1,2})(\d{1,2})$/);
      const newPitchNote = `${match[1]}${parseInt(match[2], 10) + pitchShiftingNumber}`;
      key.setAttribute("data-note", newMidiNumber);
      key.id = newPitchNote;
    });
  });
});


let pianos = [];

function getScaleNotes(startNote) {
  const startIndex = noteCharList.indexOf(startNote);
  const NotesList = startIndex === -1 ? [] : majorScaleNoteList.map(i => noteCharList[(startIndex + i) % noteCharList.length]);
  console.log(NotesList);
  return NotesList;
}
function getChordNotes(scale, chordType) {
  const startIndex = noteCharList.indexOf(scale);
  const NotesList = chordPatterns[chordType].map(index => noteCharList[(startIndex + index) % noteCharList.length]);
  return NotesList;
}


const audioFiles = "";

// 音声ファイルを事前にロードする関数
function loadAudio(notePitch) {
  // const audioPath = `${window.location.origin}/${projectName}/audio/${notePitch}.mp3`
  const audioPath = `./audio/${notePitch}.mp3`
  return fetch(audioPath)
    .then(response => response.arrayBuffer())
    .then(buffer => audioContext.decodeAudioData(buffer))
    .then(decodedData => {
      audioBuffers[notePitch] = decodedData;
    })
    .catch(error => {
      console.error(`Failed to load ${notePitch}.mp3:`, error);
    });
}
noteCharList.forEach(note => Array.from({ length: 6 }, (_, i) => loadAudio(`${note}${i + 1}`)));



function addPiano() {
  const pianoId = pianos.length + 1
  const newPiano = {
    id: pianoId,  // 新しいIDを自動採番
    scale: "C",
    scaleNotes: getScaleNotes("C"),
    chordDegree: null,
    chordNotes: null
  };
  pianos.push(newPiano);
  console.log(pianos);

  const pianoInstance = document.createElement("div");
  pianoInstance.classList.add("piano-instance");
  pianoInstance.id = `pianoInstance-${pianoId}`;

  pianoInstance.appendChild(document.createElement("hr"));

  const scaleSelector = document.createElement("div");
  scaleSelector.innerHTML = `
    <div id="scaleSelectorContainer-${pianoId}" class="selector-container">
      <label for="scaleSelector-${pianoId}" class="selector-label">スケール</label>
      <select id="scaleSelector-${pianoId}" class="scaleSelector custom-select">
        <option value="C">C</option>
        <option value="Cs">C#</option>
        <option value="D">D</option>
        <option value="Ds">D#</option>
        <option value="E">E</option>
        <option value="F">F</option>
        <option value="Fs">F#</option>
        <option value="G">G</option>
        <option value="Gs">G#</option>
        <option value="A">A</option>
        <option value="As">A#</option>
        <option value="B">B</option>
      </select>
    </div>
  `;
  pianoInstance.appendChild(scaleSelector);

  const pianoContainer = createKeys();
  pianoInstance.appendChild(pianoContainer);

  // コードボタン
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
      <button data-chord="V"  class="dominant">V</button>
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
  `;
  pianoInstance.appendChild(chordButtons);

  // 鍵盤を作る
  const pianoKeys = document.createElement("div");
  pianoKeys.classList.add("piano-background");
  pianoInstance.appendChild(pianoKeys);

  mainContainer.appendChild(pianoInstance);
  setKeySelection();
  setChordButton(pianoInstance);
}





let octaveShiftStatus = 0;


const initialFirstNotePitch = "A3";

function noteToMidi(note) {
  const match = note.match(/^([A-G][s]?)(\d)$/);
  if (!match) return null;

  const [, pitch, octave] = match;
  const pitchIndex = noteCharList.indexOf(pitch);
  if (pitchIndex === -1) return null;

  return (parseInt(octave) + 1) * 12 + baseNote[pitch];
}
function midiToNote(midiNumber) {
  const octave = Math.floor(midiNumber / 12) - 1;
  const pitchIndex = midiNumber % 12;

  const pitch = noteCharList.find((n, index) => baseNote[n] === pitchIndex);
  if (!pitch) return null;

  return `${pitch}${octave}`;
}





function createKeys() {
  const pianoBackground = document.createElement("div");
  pianoBackground.classList.add("piano-background");
  const whiteKeyWidth = Math.min(8, 90 / (numberOfKeys / 12 * 7));
  const blackKeyWidth = whiteKeyWidth * 0.6;
  const blackKeyWidthhalf = blackKeyWidth / 2;
  const GapOfBlackKey = whiteKeyWidth / 20;
  const firstNotePitchNumber = numberOfKeys <= 13 ? 4+pitchShiftValue : numberOfKeys <= 49 ? 3+pitchShiftValue : numberOfKeys <= 61 ? 2+pitchShiftValue : 1+pitchShiftValue;
  const firstNotePitch = `C${firstNotePitchNumber}`;
  const firstNoteMidiNumber = noteToMidi(firstNotePitch);
  let whiteKeyCount = 0;
  let pianoBackgroundWidth = 0;

  for (let num = 1; num <= numberOfKeys; num++) {
    const keyElem = document.createElement("div");
    const noteMidiNumber = firstNoteMidiNumber + num - 1;
    const notePitch = midiToNote(noteMidiNumber);
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

      if (num == 1 || num == numberOfKeys) {
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
      playNoteAudio(notePitch);
      keyElem.classList.add('active');
    });
    keyElem.addEventListener('mouseup', () => {
      stopNoteAudio(notePitch);
      keyElem.classList.remove('active');
    });
    keyElem.addEventListener('mouseleave', () => {
      stopNoteAudio(notePitch);
      keyElem.classList.remove('active');
    });
    keyElem.addEventListener('touchstart', () => {
      playNoteAudio(notePitch);
      keyElem.classList.add('active');
    });
    keyElem.addEventListener('touchend', () => {
      stopNoteAudio(notePitch);
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


let currentAudio = null; // 再生中の音声を保持する変数

function playNoteAudio(notePitch) {
  if (!audioBuffers[notePitch]) return; // 音声がまだロードされていない場合はスキップ

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers[notePitch];

  const gainNode = audioContext.createGain();
  // gainNode.gain.setValueAtTime(1, audioContext.currentTime); // 初期音量を1に設定
  gainNode.gain.value = 1;

  source.connect(gainNode);
  gainNode.connect(masterGainNode);

  source.start(); // 即座に再生
  activeSources[notePitch] = source; // 再生中の音を保存しておく
  gainNodes[notePitch] = gainNode;

}

function stopNoteAudio(notePitch) {
  if (activeSources[notePitch] && gainNodes[notePitch]) {
    const gainNode = gainNodes[notePitch];
    const source = activeSources[notePitch];
    const fadeOutTime = 0.3; // フェードアウトにかける時間（秒）

    // 音量を現在の値から0へフェードアウト
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeOutTime);

    // フェードアウト後に音を停止
    setTimeout(() => {
      source.stop();
      delete activeSources[notePitch];
      delete gainNodes[notePitch];
    }, fadeOutTime * 1000);
  }
}

// アプリケーションの初期化
const audioManager = new AudioManager();
const pianoUI = new PianoUI(audioManager);

// MIDIデバイスのサポート
if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess()
    .then(onMIDISuccess)
    .catch(onMIDIFailure);
}

function onMIDISuccess(midiAccess) {
  midiAccess.inputs.forEach(input => {
    input.onmidimessage = onMIDIMessage;
  });
}

function onMIDIFailure() {
  console.log('MIDIデバイスへのアクセスに失敗しました');
}

function onMIDIMessage(message) {
  const [command, note, velocity] = message.data;
  const notePitch = pianoUI.midiToNote(note);

  if (command === 144 && velocity > 0) { // Note On
    audioManager.playNote(notePitch);
    const key = document.querySelector(`.key[id="${notePitch}"]`);
    if (key) {
      key.classList.add('active');
    }
  } else if (command === 128 || (command === 144 && velocity === 0)) { // Note Off
    audioManager.stopNote(notePitch);
    const key = document.querySelector(`.key[id="${notePitch}"]`);
    if (key) {
      key.classList.remove('active');
    }
  }
}



function highlightScaleAndChord(pianoId) {
  const pianoInfo = pianos[pianoId - 1];
  const scale = pianoInfo.scale;
  const scaleNotes = pianoInfo.scaleNotes || [];;
  const chordDegree = pianoInfo.chordDegree;
  const chordNotes = pianoInfo.chordNotes || [];
  console.log(`piano info : ${JSON.stringify(pianoInfo)}`);
  document.querySelectorAll(`#pianoInstance-${pianoId} .key`).forEach((keyElem) => {
    const note = keyElem.getAttribute("pitch-class");

    if (scaleNotes.includes(note)) {
      keyElem.classList.add("scale-highlight");
      keyElem.querySelector(".scale-marker").innerText = parseInt(scaleNotes.indexOf(note)) + 1;
    } else {
      keyElem.classList.remove("scale-highlight");
      keyElem.querySelector(".scale-marker").innerText = "";
    }

    if (note == scale) {
      keyElem.classList.add("tonic-note");
    } else {
      keyElem.classList.remove("tonic-note");
    }

    if (chordNotes.includes(note)) {
      keyElem.classList.add("chord-highlight");
    } else {
      keyElem.classList.remove("chord-highlight");
    }

    if (note == chordNotes[0]) {
      keyElem.classList.add("root-note");
    } else {
      keyElem.classList.remove("root-note");
    }
  });
}

function setKeySelection() {
  document.querySelectorAll(".scaleSelector").forEach(selector => {
    selector.addEventListener("change", (event) => {
      const selectedKey = event.target.value;
      const pianoDiv = event.target.closest("div[id^='pianoInstance-']");
      const pianoId = pianoDiv.id.replace("pianoInstance-", "");
      pianos[pianoId - 1].scale = selectedKey;
      pianos[pianoId - 1].scaleNotes = getScaleNotes(selectedKey);

      highlightScaleAndChord(pianoId);
    });
  });
}


function setChordButton(pianoInstance) {
  pianoInstance.querySelectorAll(".chord-buttons button").forEach(button => {
    button.addEventListener("click", () => {
      const pianoDiv = button.closest("div[id^='pianoInstance-']");
      const pianoId = pianoDiv.id.replace("pianoInstance-", "");
      const chordDegree = button.dataset.chord;
      if (button.classList.contains("active")) {
        document.querySelectorAll(`#pianoInstance-${pianoId} .chord-buttons button`).forEach(btn => {
          btn.classList.remove("active");
        });

        pianos[pianoId - 1].chordDegree = null;
        pianos[pianoId - 1].chordNotes = null;
      } else {
        pianos[pianoId - 1].chordDegree = chordDegree;
        pianos[pianoId - 1].chordNotes = getChordNotes(pianos[pianoId - 1].scale, chordDegree);

        // すべてのボタンのactiveを解除してから、押したボタンにactiveをつける
        document.querySelectorAll(`#pianoInstance-${pianoId} .chord-buttons button`).forEach(btn => {
          btn.classList.remove("active");
        });
        button.classList.add("active");
        pianos[pianoId - 1].chordDegree = chordDegree;
        pianos[pianoId - 1].chordNotes = getChordNotes(pianos[pianoId - 1].scale, chordDegree);
      }

      highlightScaleAndChord(pianoId);
    });
  });
}


// 画面操作
document.addEventListener("wheel", (event) => {
  if (event.ctrlKey) { // Ctrlキーが押されている時のみズーム
    event.preventDefault();
    const mainContent = document.querySelector("body");
    let scale = Number(mainContent.dataset.scale || 1);
    scale += event.deltaY * -0.001;
    scale = Math.min(Math.max(0.5, scale), 2);
    mainContent.style.transform = `scale(${scale})`;
    mainContent.dataset.scale = scale;
  }
});
let touchStartDistance = 0;
let scale = 1;

document.addEventListener("touchstart", (event) => {
  if (event.touches.length === 2) {
    event.preventDefault();
    touchStartDistance = getDistance(event.touches);
  }
});

document.addEventListener("touchmove", (event) => {
  if (event.touches.length === 2) {
    event.preventDefault();
    const newDistance = getDistance(event.touches);
    const zoomFactor = newDistance / touchStartDistance;
    touchStartDistance = newDistance;
    scale *= zoomFactor;
    scale = Math.min(Math.max(0.5, scale), 3);
    document.querySelector("#mainContainer").style.transform = `scale(${scale})`;
  }
});

function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
