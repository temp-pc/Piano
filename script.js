const projectName = "Piano";
const noteCharList = ["A", "As", "B", "C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs"];
const baseNote = {
  "C": 0,
  "Cs": 1,
  "D": 2,
  "Ds": 3,
  "E": 4,
  "F": 5,
  "Fs": 6,
  "G": 7,
  "Gs": 8,
  "A": 9,
  "As": 10,
  "B": 11
};

const pianoContainer = document.querySelector("#piano-container");
const pianoBackground = document.querySelector('#piano-background');
const numberOfKeysSelector = document.querySelector("#numberOfKeysSelector");
for (let i = 1; i <= 88; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  numberOfKeysSelector.appendChild(option);
}
numberOfKeysSelector.addEventListener("change", (event) => {
  const selectedValue = parseInt(event.target.value);
  createKeys(selectedValue);
})


let octaveShiftStatus = 0;
const initialNumberOfKeys = 24;
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

  // const whiteKeyWidth = 3.2; // 単位はem
  const whiteKeyWidth = numberOfKeys <= 36 ? 3.2 : numberOfKeys <= 60 ? 2.6 : 2.0;
  // const whiteKeyWidth = 80 / numberOfKeys ; // 単位はem
  // const whiteKeyWidthWithBorder = whiteKeyWidth + 0.01;
  const blackKeyWidth = whiteKeyWidth * 0.6;
  const blackKeyWidthhalf = blackKeyWidth / 2;
  const GapOfBlackKey = whiteKeyWidth / 20; //黒鍵の位置を真ん中から少しずらす
  const firstNotePitch = numberOfKeys <= 12 ? "C4" : numberOfKeys <= 24 ? "C3" : numberOfKeys <= 49 ? "C2" : "C1";
  // const firstNotePitch = "C4";
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

    pianoBackground.appendChild(div);
  }
  pianoBackground.style.width = `${pianoBackgroundWidth}em`;

  asignSoundsOnKeys();  //キーに音を割り当て
}


let currentAudio = null; // 再生中の音声を保持する変数

function playNoteAudio(notePitch) {
  const audioPath = `${window.location.origin}/${projectName}/audio/${notePitch}.mp3`;
  console.log("audioPath", audioPath);
  // const audioPath = `./audio/${notePitch}.mp3`;
  currentAudio = new Audio(audioPath);
  // currentAudio.play();
  currentAudio.play().catch(error => {
    console.error("Audio playback failed:", error);
  });
}

function stopNoteAudio() {
  if (currentAudio) {
    currentAudio.pause();  // 再生中の音声を停止
    currentAudio.currentTime = 0;  // 再生位置をリセット
    currentAudio = null;
  }
}


function asignSoundsOnKeys() {
  // イベントリスナー内でplayNoteWithSoundを呼び出すように変更
  document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('mousedown', () => {
      const noteMidiNumber = key.getAttribute('data-note');
      const notePitch = midiToNote(noteMidiNumber);

      playNoteAudio(notePitch);
      key.classList.add('active');
    });

    key.addEventListener('mouseup', () => {
      stopNoteAudio();
      key.classList.remove('active');
    });

    key.addEventListener('mouseleave', () => {
      stopNoteAudio();
      key.classList.remove('active');
    });

    // タッチデバイス向けのイベント
    key.addEventListener('touchstart', () => {
      const noteMidiNumber = key.getAttribute('data-note');
      const notePitch = midiToNote(noteMidiNumber);

      playNoteAudio(notePitch);
      key.classList.add('active');
    });

    key.addEventListener('touchend', () => {
      stopNoteAudio();
      key.classList.remove('active');
    });

  });
}