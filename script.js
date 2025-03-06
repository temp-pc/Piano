import { AudioManager } from './audioManager.js';
import { PianoUI } from './pianoUI.js';

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

// タッチ操作
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

// ヘッダーの表示/非表示トグル
const headerToggle = document.querySelector('.header-toggle');
const headerContainer = document.querySelector('#headerContainer');
const mainContainer = document.querySelector('#mainContainer');

headerToggle.addEventListener('click', () => {
  const isHidden = headerContainer.classList.toggle('hidden');
  headerToggle.classList.toggle('hidden');
  mainContainer.classList.toggle('header-hidden');
}); 