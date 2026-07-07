const DEFAULT_WORD = "HELLO";
const STORAGE_KEY = "spelling-game-word";
const EMOJIS = [
  "🎉",
  "🎈",
  "🎊",
  "⭐",
  "✨",
  "💫",
  "🌟",
  "🎯",
  "🎨",
  "🎭",
  "🎡",
  "🎢",
  "🎠",
  "🎮",
  "🎲",
  "🎸",
  "🎺",
  "🎵",
  "🎹",
  "🌈",
  "🦄",
  "🐬",
  "🦋",
  "🌺",
  "🌸",
  "🍭",
  "🍬",
  "🍫",
  "🧁",
  "🍪",
  "🍩",
  "🎂",
  "🍰",
  "🥳",
  "🤩",
  "🌞",
  "💝",
  "💖",
];

const state = {
  word: DEFAULT_WORD,
  currentIndex: 0,
  isProcessingKey: false,
};

const letterBoard = document.querySelector("#letterBoard");
const letter = document.querySelector("#letter");
const rainbowLayer = document.querySelector("#rainbowLayer");
const flashLayer = document.querySelector("#flashLayer");
const settingsButton = document.querySelector("#settingsButton");
const settingsDialog = document.querySelector("#settingsDialog");
const wordInput = document.querySelector("#wordInput");
const cancelButton = document.querySelector("#cancelButton");
const saveButton = document.querySelector("#saveButton");

function loadSavedWord() {
  try {
    const savedWord = localStorage.getItem(STORAGE_KEY);
    if (savedWord) {
      state.word = normalizeWord(savedWord);
    }
  } catch (error) {
    console.error("Failed to load saved word:", error);
  }
}

function normalizeWord(word) {
  return word.replace(/\s+/g, "").toUpperCase();
}

function renderLetter() {
  letter.textContent = state.word[state.currentIndex] || DEFAULT_WORD[0];
}

function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function playSound(type) {
  const url =
    type === "correct"
      ? "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"
      : "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3";
  const audio = new Audio(url);
  audio.volume = 0.7;
  audio.play().catch(() => {});
}

function fireConfetti() {
  if (typeof confetti !== "function") {
    return;
  }

  const bursts = Array.from({ length: 11 }, () => ({
    x: Math.random(),
    y: Math.random() * 0.5 + 0.3,
    angle: Math.random() * 360,
    spread: Math.random() * 60 + 40,
    particleCount: Math.floor(Math.random() * 45) + 45,
  }));

  bursts.push(
    { x: 0.5, y: 0.5, angle: 90, spread: 180, particleCount: 180 },
    { x: 0.25, y: 0.55, angle: 45, spread: 100, particleCount: 90 },
    { x: 0.75, y: 0.55, angle: 135, spread: 100, particleCount: 90 },
  );

  bursts.forEach((burst, index) => {
    window.setTimeout(() => {
      confetti({
        particleCount: burst.particleCount,
        angle: burst.angle,
        spread: burst.spread,
        origin: { x: burst.x, y: burst.y },
        colors: ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#00b4d8"],
        ticks: 280,
        scalar: Math.random() * 0.5 + 0.85,
      });
    }, index * 75);
  });
}

function launchFloatingEmojis() {
  for (let index = 0; index < 20; index += 1) {
    const emoji = document.createElement("div");
    const direction = Math.random() > 0.5 ? 1 : -1;
    const horizontalDistance = (Math.random() * 300 + 100) * direction;
    const verticalDistance = window.innerHeight + 120;
    const rotations = Math.random() * 3 * direction;

    emoji.className = "floating-emoji";
    emoji.textContent = randomEmoji();
    emoji.style.left = `${Math.random() * 100}vw`;
    document.body.append(emoji);

    const animation = emoji.animate(
      [
        {
          transform: "translateY(0) translateX(0) rotate(0deg)",
          opacity: 1,
        },
        {
          transform: `translateY(-${verticalDistance}px) translateX(${horizontalDistance}px) rotate(${360 * rotations}deg)`,
          opacity: 1,
        },
      ],
      {
        duration: 2000 + Math.random() * 1000,
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    );

    animation.onfinish = () => emoji.remove();
  }
}

function triggerCelebration() {
  rainbowLayer.classList.add("active");
  flashLayer.classList.add("active");
  fireConfetti();
  launchFloatingEmojis();
}

function clearFeedback() {
  letterBoard.classList.remove("correct", "wrong");
  rainbowLayer.classList.remove("active");
  flashLayer.classList.remove("active");
}

async function handleCorrectKey() {
  state.isProcessingKey = true;
  letterBoard.classList.add("correct");
  playSound("correct");
  triggerCelebration();

  await wait(1500);
  state.currentIndex = (state.currentIndex + 1) % state.word.length;
  renderLetter();
  clearFeedback();
  state.isProcessingKey = false;
}

async function handleWrongKey() {
  state.isProcessingKey = true;
  letterBoard.classList.add("wrong");
  playSound("wrong");

  await wait(800);
  clearFeedback();
  state.isProcessingKey = false;
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function openSettings() {
  wordInput.value = state.word;
  settingsDialog.showModal();
  wordInput.select();
}

function saveSettings() {
  const nextWord = normalizeWord(wordInput.value);
  if (!nextWord) {
    return;
  }

  state.word = nextWord;
  state.currentIndex = 0;
  renderLetter();

  try {
    localStorage.setItem(STORAGE_KEY, nextWord);
  } catch (error) {
    console.error("Failed to save word:", error);
  }
}

window.addEventListener("keydown", (event) => {
  if (settingsDialog.open || state.isProcessingKey || event.key.length !== 1) {
    return;
  }

  const pressedKey = event.key.toUpperCase();
  const currentLetter = state.word[state.currentIndex];

  if (pressedKey === currentLetter) {
    handleCorrectKey();
  } else {
    handleWrongKey();
  }
});

settingsButton.addEventListener("click", openSettings);

saveButton.addEventListener("click", () => {
  saveSettings();
});

cancelButton.addEventListener("click", () => {
  wordInput.value = state.word;
});

settingsDialog.addEventListener("click", (event) => {
  if (event.target === settingsDialog) {
    settingsDialog.close();
  }
});

loadSavedWord();
renderLetter();
