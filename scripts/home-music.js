const music = document.getElementById("homepageMusic");
let musicEnabled = false;

const startMusic = async () => {
  if (!music) {
    return false;
  }

  try {
    music.volume = 0.28;
    await music.play();
    musicEnabled = true;
    return true;
  } catch (error) {
    musicEnabled = false;
    return false;
  }
};

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

document.addEventListener("DOMContentLoaded", () => {
  startMusic();
});

window.addEventListener("pageshow", () => {
  startMusic();
});

window.addEventListener("load", () => {
  startMusic();
});