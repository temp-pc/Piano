const projectName = "Piano";
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {}; // 音声ファイルをキャッシュするためのオブジェクト
const activeSources = {}; // 再生中の音を保持するオブジェクト
const gainNodes = {}; // GainNode を管理するオブジェクト

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


function getScaleNotes(startNote) {
  const startIndex = noteCharList.indexOf(startNote);
  const NotesList = startIndex === -1 ? [] : majorScaleNoteList.map(i => noteCharList[(startIndex + i) % noteCharList.length]);
  console.log(NotesList);
  return NotesList;
}
function getChordNotes(scale, chordType) {
  const startIndex = noteCharList.indexOf(CURRENT_SCALE);
  const NotesList = chordPatterns[chordType].map(index => noteCharList[(startIndex + index) % noteCharList.length]);
  return NotesList;
}

let CURRENT_SCALE = document.querySelector("#keySelector").value;
let CURRENT_SCALE_NOTES = getScaleNotes(CURRENT_SCALE);
let CURRENT_CHORD_DEGREE = null;

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
noteCharList.forEach(note => Array.from({ length: 5 }, (_, i) => loadAudio(`${note}${i + 1}`)));


const pianoContainer = document.querySelector("#piano-container");
const pianoBackground = document.querySelector('#piano-background');
const numberOfKeysSelector = document.querySelector("#numberOfKeysSelector");
for (let i = 1; i <= 88; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  numberOfKeysSelector.appendChild(option);
}
numberOfKeysSelector.addEventListener("change", e => createKeys(parseInt(e.target.value)));

let octaveShiftStatus = 0;
const initialNumberOfKeys = 36;
numberOfKeysSelector.value = initialNumberOfKeys;  //キーボードの鍵盤数の初期値を設定。

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


createKeys(initialNumberOfKeys);


function createKeys(numberOfKeys) {
  pianoBackground.innerHTML = ''; //初期化

  const whiteKeyWidth = numberOfKeys <= 36 ? 3.2 : numberOfKeys <= 60 ? 2.6 : 2.0;
  const blackKeyWidth = whiteKeyWidth * 0.6;
  const blackKeyWidthhalf = blackKeyWidth / 2;
  const GapOfBlackKey = whiteKeyWidth / 20; //黒鍵の位置を真ん中から少しずらす
  const firstNotePitch = numberOfKeys <= 12 ? "C4" : numberOfKeys <= 24 ? "C3" : numberOfKeys <= 49 ? "C2" : "C1";
  const firstNoteMidiNumber = noteToMidi(firstNotePitch);
  let whiteKeyCount = 0;
  let pianoBackgroundWidth = 0;

  for (let num = 1; num <= numberOfKeys; num++) {
    const div = document.createElement("div");
    const noteMidiNumber = firstNoteMidiNumber + num - 1;
    const notePitch = midiToNote(noteMidiNumber);
    const match = notePitch.match(/^([A-G][s]?)(\d)$/);
    const [, noteChar, noteOctave] = match;

    div.setAttribute("data-note", noteMidiNumber);
    div.setAttribute("pitch-class", noteChar);
    div.classList.add("key");
    div.id = notePitch;

    keyIndex = num % 12;

    if (noteChar.includes("s")) {

      div.classList.add("black-key");
      div.style.width = `${blackKeyWidth}em`;

      let blackKeyPosition = whiteKeyWidth * whiteKeyCount - blackKeyWidthhalf;

      // ギャップの調整
      if (noteChar === "Cs" || noteChar === "Fs") {
        blackKeyPosition -= GapOfBlackKey;
      } else if (noteChar === "Ds" || noteChar === "As") {
        blackKeyPosition += GapOfBlackKey;
      }
      div.style.left = `${blackKeyPosition}em`;

      //黒鍵で終わってたら、その分piano-containerのサイズを大きくする
      if (num == 1 || num == numberOfKeys) {
        pianoBackgroundWidth += blackKeyWidth;
      }
    } else {
      div.classList.add("white-key");
      div.style.width = `${whiteKeyWidth}em`;
      whiteKeyCount += 1;
      pianoBackgroundWidth += whiteKeyWidth;
    }

    div.appendChild(Object.assign(document.createElement("div"), { className: "scale-marker" }));
    pianoBackground.appendChild(div);

  }
  pianoBackground.style.width = `${pianoBackgroundWidth}em`;

  asignSoundsOnKeys();  //キーに音を割り当て
}


let currentAudio = null; // 再生中の音声を保持する変数

function playNoteAudio(notePitch) {
  if (!audioBuffers[notePitch]) return; // 音声がまだロードされていない場合はスキップ

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers[notePitch];

  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(1, audioContext.currentTime); // 初期音量を1に設定

  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
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
function asignSoundsOnKeys() {
  // イベントリスナー内でplayNoteWithSoundを呼び出すように変更
  document.querySelectorAll('.key').forEach(key => {
    const noteMidiNumber = key.getAttribute('data-note');
    const notePitch = midiToNote(noteMidiNumber);
    key.addEventListener('mousedown', () => {
      playNoteAudio(notePitch);
      key.classList.add('active');
    });
    key.addEventListener('mouseup', () => {
      stopNoteAudio(notePitch);
      key.classList.remove('active');
    });
    key.addEventListener('mouseleave', () => {
      stopNoteAudio(notePitch);
      key.classList.remove('active');
    });

    // タッチデバイス向けのイベント
    key.addEventListener('touchstart', () => {
      playNoteAudio(notePitch);
      key.classList.add('active');
    });
    key.addEventListener('touchend', () => {
      stopNoteAudio(notePitch);
      key.classList.remove('active');
    });

  });
}
if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);
} else {
  console.log("WebMIDI is not supported in this browser.");
}

document.getElementById("midiButton").addEventListener("click", () => {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess()
      .then(onMIDISuccess, onMIDIFailure);
  } else {
    console.log("WebMIDI is not supported in this browser.");
  }
});
function onMIDISuccess(midiAccess) {
  midiAccess.inputs.forEach(function (input) {
    input.onmidimessage = onMIDIMessage;
  });
}

function onMIDIFailure() {
  console.log("Failed to access MIDI devices.");
}

function onMIDIMessage(message) {
  const [status, note, velocity] = message.data;
  const isNoteOn = (status & 0xf0) === 0x90;
  const isNoteOff = (status & 0xf0) === 0x80 || (isNoteOn && velocity === 0);
  const key = document.querySelector(`.key[data-note="${note}"]`);

  const notePitchSymbol = midiToNote(note);

  if (isNoteOn) {
    key.classList.add('active');
    playNoteAudio(notePitchSymbol);
  } else if (isNoteOff) {
    key.classList.remove('active');
    stopNoteAudio(notePitchSymbol);
  }
}



highlightScale(CURRENT_SCALE);

document.getElementById("keySelector").addEventListener("change", (event) => {
  const selectedKey = event.target.value;
  CURRENT_SCALE = selectedKey;
  highlightScale(selectedKey);
  highlightChord();
});

function highlightScale(key) {
  // console.log("scale highligt");
  const scaleNotes = getScaleNotes(key);
  console.log("scaleNotes : " + scaleNotes);

  document.querySelectorAll(".key").forEach((keyElem) => {
    const note = keyElem.getAttribute("pitch-class");

    if (scaleNotes.includes(note)) {
      keyElem.classList.add("scale-highlight");
    } else {
      keyElem.classList.remove("scale-highlight");
    }
    console.log("note : " + note + ", current scale : " + CURRENT_SCALE);
    if (note == CURRENT_SCALE) {
      keyElem.classList.add("tonic-note");
    } else {
      keyElem.classList.remove("tonic-note");
    }
  });
}


const ChordButtonElements = document.querySelectorAll(".chord-buttons button");

ChordButtonElements.forEach(button => {
  button.addEventListener("click", () => {
    CURRENT_CHORD_DEGREE = button.dataset.chord;
    highlightChord();
  });
});

function highlightChord() {
  CURRENT_SCALE = document.querySelector("#keySelector").value;
  CURRENT_SCALE_NOTES = getScaleNotes(CURRENT_SCALE);

  const chordNotes = getChordNotes(CURRENT_SCALE_NOTES, CURRENT_CHORD_DEGREE);

  console.log("chord notes : " + chordNotes + " chordType : " + CURRENT_CHORD_DEGREE);
  // すべてのピアノキーの色をリセット
  document.querySelectorAll(".key").forEach(key => {
    key.classList.remove("chord-highlight");
    key.classList.remove("root-note");
  });

  // 選択されたコードの音をハイライト
  chordNotes.forEach(pitchClass => {
    document.querySelectorAll(`.key[pitch-class="${pitchClass}"]`).forEach(key => {
      key.classList.add("chord-highlight");
      if (pitchClass == chordNotes[0]){
        key.classList.add("root-note");
      }
    });
  });

  ChordButtonElements.forEach(btn => {
    if (btn.dataset.chord == CURRENT_CHORD_DEGREE) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

}