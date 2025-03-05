const projectName = "Piano";
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
// function resumeAudioContext() {
//   if (audioContext.state !== 'running') {
//     audioContext.resume().then(() => {
//       console.log('AudioContext resumed');
//     });
//   }
// }
// document.addEventListener('mousedown', resumeAudioContext, { once: true });
// document.addEventListener('touchstart', resumeAudioContext, { once: true });
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
  createKeys();
});



document.querySelector("#addPianoButton").addEventListener("click", () => {
  addPiano();
});
const pianos = [];
addPiano();


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

// let CURRENT_SCALE = document.querySelector("#keySelector").value;
// let CURRENT_SCALE_NOTES = getScaleNotes(CURRENT_SCALE);
// let CURRENT_CHORD_DEGREE = null;


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
    <div id="keySelectorContainer-${pianoId}" class="selector-container">
      <label for="keySelector-${pianoId}" class="selector-label">スケール</label>
      <select id="keySelector-${pianoId}" class="keySelector custom-select">
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
  setChordButton();
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
  // pianoBackground.innerHTML = ''; //初期化
  const whiteKeyWidth = 90 / (numberOfKeys / 12 * 7); //単位はvw、画面の横幅の90%を、白鍵の数で割った値
  // console.log("whiteKeyWidth : " + whiteKeyWidth + " containerWidth : " + containerWidth + " numberOfKeys : " + numberOfKeys);
  const blackKeyWidth = whiteKeyWidth * 0.6;
  const blackKeyWidthhalf = blackKeyWidth / 2;
  const GapOfBlackKey = whiteKeyWidth / 20; //黒鍵の位置を真ん中から少しずらす
  const firstNotePitch = numberOfKeys <= 12 ? "C4" : numberOfKeys <= 24 ? "C3" : numberOfKeys <= 49 ? "C2" : "C1";
  const firstNoteMidiNumber = noteToMidi(firstNotePitch);
  let whiteKeyCount = 0;
  let pianoBackgroundWidth = 0;

  console.log(numberOfKeys)

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

    keyIndex = num % 12;

    if (noteChar.includes("s")) {

      keyElem.classList.add("black-key");
      // div.style.width = `${blackKeyWidth}em`;
      keyElem.style.width = `${blackKeyWidth}vw`;

      let blackKeyPosition = whiteKeyWidth * whiteKeyCount - blackKeyWidthhalf;

      // ギャップの調整
      if (noteChar === "Cs" || noteChar === "Fs") {
        blackKeyPosition -= GapOfBlackKey;
      } else if (noteChar === "Ds" || noteChar === "As") {
        blackKeyPosition += GapOfBlackKey;
      }
      // div.style.left = `${blackKeyPosition}em`;
      keyElem.style.left = `${blackKeyPosition}vw`;

      //黒鍵で終わってたら、その分piano-containerのサイズを大きくする
      if (num == 1 || num == numberOfKeys) {
        pianoBackgroundWidth += blackKeyWidth;
      }
    } else {
      keyElem.classList.add("white-key");
      // div.style.width = `${whiteKeyWidth}em`;
      keyElem.style.width = `${whiteKeyWidth}vw`;
      whiteKeyCount += 1;
      pianoBackgroundWidth += whiteKeyWidth;
    }

    const marker = document.createElement("div");
    marker.className = "scale-marker";
    keyElem.appendChild(marker);

    // --- イベントリスナーを直接追加 ---
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
    // タッチデバイス向け
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
  // pianoBackground.style.width = `${pianoBackgroundWidth}em`;
  pianoBackground.style.width = `${pianoBackgroundWidth}vw`;

  // assignSoundsOnKeys();  //キーに音を割り当て

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
// function assignSoundsOnKeys() {
//   // イベントリスナー内でplayNoteWithSoundを呼び出すように変更
//   document.querySelectorAll('.key').forEach(key => {
//     const noteMidiNumber = key.getAttribute('data-note');
//     const notePitch = midiToNote(noteMidiNumber);
//     key.addEventListener('mousedown', () => {
//       playNoteAudio(notePitch);
//       key.classList.add('active');
//     });
//     key.addEventListener('mouseup', () => {
//       stopNoteAudio(notePitch);
//       key.classList.remove('active');
//     });
//     key.addEventListener('mouseleave', () => {
//       stopNoteAudio(notePitch);
//       key.classList.remove('active');
//     });

//     // タッチデバイス向けのイベント
//     key.addEventListener('touchstart', () => {
//       playNoteAudio(notePitch);
//       key.classList.add('active');
//     });
//     key.addEventListener('touchend', () => {
//       stopNoteAudio(notePitch);
//       key.classList.remove('active');
//     });

//   });
// }


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
  document.querySelectorAll(".keySelector").forEach(selector => {
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


function setChordButton() {
  document.querySelectorAll(".chord-buttons button").forEach(button => {
    button.addEventListener("click", () => {
      const pianoDiv = button.closest("div[id^='pianoInstance-']");
      const pianoId = pianoDiv.id.replace("pianoInstance-", "");
      const chordDegree = button.dataset.chord;
      console.log("button.classList : " + button.classList);
      if (button.classList.contains("active")) {
        document.querySelectorAll(`#pianoInstance-${pianoId} .chord-buttons button`).forEach(btn => {
          btn.classList.remove("active");
        });

        pianos[pianoId - 1].chordDegree = null;
        pianos[pianoId - 1].chordNotes = null;
        console.log("Chord reset for pianoInstance-" + pianoId);
      } else {
        pianos[pianoId - 1].chordDegree = chordDegree;
        pianos[pianoId - 1].chordNotes = getChordNotes(pianos[pianoId - 1].scale, chordDegree);
        console.log("chord degree : " + chordDegree);

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

// function setChordButton(){
//   document.querySelectorAll(".chord-buttons button").forEach(button => {
//     button.addEventListener("click", () => {
//       const pianoDiv = button.closest("div[id^='pianoInstance-']");
//       const pianoId = pianoDiv.id.replace("pianoInstance-", "");
//       const chordDegree = button.dataset.chord;
//       console.log("chord degree : " + chordDegree);
//       pianos[pianoId - 1].chordDegree = chordDegree;
//       pianos[pianoId - 1].chordNotes = getChordNotes(pianos[pianoId - 1].scale, chordDegree);
//       highlightScaleAndChord(pianoId);
//       document.querySelectorAll(`#pianoInstance-${pianoId} .chord-buttons button`).forEach(btn => {
//         if (btn.dataset.chord == chordDegree) {
//           btn.classList.add("active");
//         } else {
//           btn.classList.remove("active");
//         }
//       });
//     });
//   });
// }
