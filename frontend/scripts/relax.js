const timerDisplay = document.getElementById("timerDisplay");
const timerState = document.getElementById("timerState");
const startBtn = document.getElementById("startTimer");
const pauseBtn = document.getElementById("pauseTimer");
const resetBtn = document.getElementById("resetTimer");

let secondsRemaining = 25 * 60;
let timerId = null;
let audioContext = null;
let ambientNodes = [];

const renderTimer = () => {
  const minutes = String(Math.floor(secondsRemaining / 60)).padStart(2, "0");
  const seconds = String(secondsRemaining % 60).padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
};

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

const stopAmbientSound = () => {
  ambientNodes.forEach((node) => {
    if (node && typeof node.stop === "function") {
      try {
        node.stop();
      } catch (error) {
        // Node may already be stopped.
      }
    }
  });

  ambientNodes = [];

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
  }

  audioContext = null;
};

const startAmbientSound = async () => {
  if (!window.AudioContext && !window.webkitAudioContext) {
    return;
  }

  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  stopAmbientSound();

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContextClass();

  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0.014;

  const lowPass = audioContext.createBiquadFilter();
  lowPass.type = "lowpass";
  lowPass.frequency.value = 720;

  const tremolo = audioContext.createOscillator();
  const tremoloGain = audioContext.createGain();
  tremolo.frequency.value = 0.15;
  tremoloGain.gain.value = 0.006;

  tremolo.connect(tremoloGain);
  tremoloGain.connect(masterGain.gain);

  const createTone = (frequency) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(lowPass);
    return oscillator;
  };

  const toneOne = createTone(220);
  const toneTwo = createTone(329.63);
  const toneThree = createTone(440);

  lowPass.connect(masterGain);
  masterGain.connect(audioContext.destination);

  [toneOne, toneTwo, toneThree, tremolo].forEach((node) => {
    node.start();
  });

  ambientNodes = [toneOne, toneTwo, toneThree, tremolo];
};

const finishSession = (message) => {
  stopTimer();
  stopAmbientSound();
  timerState.textContent = message;
};

startBtn.addEventListener("click", () => {
  if (timerId) {
    return;
  }

  timerState.textContent = "Focus session running";

  startAmbientSound().catch(() => {
    timerState.textContent = "Focus session running";
  });

  timerId = setInterval(() => {
    secondsRemaining -= 1;

    if (secondsRemaining <= 0) {
      secondsRemaining = 0;
      renderTimer();
      finishSession("Time for a break");
      return;
    }

    renderTimer();
  }, 1000);
});

pauseBtn.addEventListener("click", () => {
  stopTimer();
  stopAmbientSound();
  timerState.textContent = "Timer paused";
});

resetBtn.addEventListener("click", () => {
  stopTimer();
  stopAmbientSound();
  secondsRemaining = 25 * 60;
  timerState.textContent = "Ready for a new session";
  renderTimer();
});

renderTimer();