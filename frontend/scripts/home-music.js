const music = document.getElementById("homepageMusic");
const musicToggle = document.getElementById("musicToggle");
const musicStatus = document.getElementById("musicStatus");

let musicEnabled = false;

const updateMusicUi = () => {
  musicToggle.textContent = musicEnabled ? "Pause melody" : "Play melody";
  musicStatus.textContent = musicEnabled
    ? "Soft melody is playing"
    : "Calm melody ready";
};

const startMusic = async () => {
  try {
    music.volume = 0.28;
    await music.play();
    musicEnabled = true;
    updateMusicUi();
    return true;
  } catch (error) {
    musicEnabled = false;
    updateMusicUi();
    return false;
  }
};

const stopMusic = () => {
  music.pause();
  music.currentTime = 0;
  musicEnabled = false;
  updateMusicUi();
};

musicToggle.addEventListener("click", async () => {
  if (musicEnabled) {
    stopMusic();
    return;
  }

  await startMusic();
});

const startOnFirstInteraction = async () => {
  if (musicEnabled) {
    return;
  }

  const started = await startMusic();
  if (started) {
    window.removeEventListener("pointerdown", startOnFirstInteraction);
    window.removeEventListener("keydown", startOnFirstInteraction);
  }
};

window.addEventListener("pointerdown", startOnFirstInteraction, { once: true });
window.addEventListener("keydown", startOnFirstInteraction, { once: true });

updateMusicUi();

document.addEventListener("DOMContentLoaded", () => {
  startMusic();
});

window.addEventListener("pageshow", () => {
  startMusic();
});

window.addEventListener("load", () => {
  startMusic();
});