(() => {
  const root = document.documentElement;
  const body = document.body;

  if (!body) {
    return;
  }

  const trailLayer = document.createElement("div");
  trailLayer.className = "flower-cursor-layer";
  body.appendChild(trailLayer);

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let easedX = pointerX;
  let easedY = pointerY;
  let lastPetalAt = 0;

  const spawnPetal = (x, y) => {
    const petal = document.createElement("span");
    petal.className = "cursor-petal";
    petal.style.left = `${x}px`;
    petal.style.top = `${y}px`;
    petal.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 70}px`);
    petal.style.setProperty("--drift-y", `${24 + Math.random() * 36}px`);
    petal.style.setProperty("--petal-rot", `${Math.random() * 360}deg`);

    trailLayer.appendChild(petal);
    window.setTimeout(() => {
      petal.remove();
    }, 1300);
  };

  const updateSway = () => {
    const nx = (easedX / window.innerWidth - 0.5) * 2;
    const ny = (easedY / window.innerHeight - 0.5) * 2;

    root.style.setProperty("--cursor-x", `${easedX}px`);
    root.style.setProperty("--cursor-y", `${easedY}px`);
    root.style.setProperty("--cursor-nx", nx.toFixed(3));
    root.style.setProperty("--cursor-ny", ny.toFixed(3));
  };

  const tick = () => {
    easedX += (pointerX - easedX) * 0.16;
    easedY += (pointerY - easedY) * 0.16;
    updateSway();
    requestAnimationFrame(tick);
  };

  const onMove = (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    body.classList.add("cursor-active");

    const now = performance.now();
    if (now - lastPetalAt > 45) {
      spawnPetal(pointerX, pointerY);
      lastPetalAt = now;
    }
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerdown", onMove);

  tick();
})();
