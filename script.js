// Alle fachlichen Kartenpaare. Die pairId verbindet Begriff und Definition.
const cardPairs = [
  {
    id: 1,
    term: "Chemische Reaktion",
    definition: "Vorgang, bei dem aus Stoffen neue Stoffe entstehen."
  },
  {
    id: 2,
    term: "Edukt / Ausgangsstoff",
    definition: "Stoff, der zu Beginn einer chemischen Reaktion vorhanden ist."
  },
  {
    id: 3,
    term: "Glimmspanprobe",
    definition: "Nachweisreaktion, mit der Sauerstoff nachgewiesen werden kann."
  },
  {
    id: 4,
    term: "Kalkwasserprobe",
    definition: "Nachweisreaktion, mit der Kohlenstoffdioxid nachgewiesen wird."
  },
  {
    id: 5,
    term: "Kohlenstoffdioxid",
    definition: "Gas, das bei vielen Verbrennungen entsteht."
  },
  {
    id: 6,
    term: "Nachweisreaktion",
    definition: "Reaktion, mit der ein bestimmter Stoff erkannt wird."
  },
  {
    id: 7,
    term: "Oxidation",
    definition: "Sauerstoff wird durch eine chemische Reaktion aufgenommen."
  },
  {
    id: 8,
    term: "Produkt",
    definition: "Stoff, der bei einer chemischen Reaktion entsteht."
  },
  {
    id: 9,
    term: "Reaktionsgleichung",
    definition: "Darstellung einer chemischen Reaktion mit Formeln."
  },
  {
    id: 10,
    term: "Reaktionspfeil",
    definition: "Zeichen, das „reagiert zu“ bedeutet."
  },
  {
    id: 11,
    term: "Vermutung",
    definition: "Begründete Vorhersage, was bei einem Experiment passieren könnte."
  },
  {
    id: 12,
    term: "Wortgleichung",
    definition: "Einfache Reaktionsgleichung mit Wörtern statt Formeln."
  }
];

const modeLabels = {
  6: "Leicht",
  9: "Mittel",
  12: "Schwer"
};

const startScreen = document.querySelector("#startScreen");
const gameScreen = document.querySelector("#gameScreen");
const modeButtons = document.querySelectorAll(".mode-card");
const gameBoard = document.querySelector("#gameBoard");
const cardTemplate = document.querySelector("#cardTemplate");
const attemptsOutput = document.querySelector("#attempts");
const matchesOutput = document.querySelector("#matches");
const totalPairsOutput = document.querySelector("#totalPairs");
const modeOutput = document.querySelector("#modeOutput");
const message = document.querySelector("#message");
const restartButton = document.querySelector("#restartButton");
const homeButton = document.querySelector("#homeButton");

let firstCard = null;
let secondCard = null;
let attempts = 0;
let matches = 0;
let currentPairCount = 6;
let currentPairs = [];
let isCheckingPair = false;
let mismatchTimeoutId = null;

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const pairCount = Number(button.dataset.pairs);
    startGame(pairCount);
  });
});

restartButton.addEventListener("click", () => startGame(currentPairCount));
homeButton.addEventListener("click", showStartScreen);
showStartScreen();

function showStartScreen() {
  clearMismatchTimeout();
  startScreen.hidden = false;
  gameScreen.hidden = true;
  clearSelectedCards();
  gameBoard.innerHTML = "";
  message.classList.remove("success");
}

function startGame(pairCount) {
  clearMismatchTimeout();
  currentPairCount = pairCount;
  currentPairs = cardPairs.slice(0, currentPairCount);
  const cards = createCardDeck(currentPairs);

  firstCard = null;
  secondCard = null;
  attempts = 0;
  matches = 0;
  isCheckingPair = false;

  startScreen.hidden = true;
  gameScreen.hidden = false;
  modeOutput.textContent = modeLabels[currentPairCount];
  totalPairsOutput.textContent = currentPairCount;
  attemptsOutput.textContent = attempts;
  matchesOutput.textContent = matches;
  message.textContent = "Viel Erfolg! Suche zuerst eine Karte mit Begriff und dann die passende Erklärung.";
  message.classList.remove("success");
  gameBoard.innerHTML = "";

  shuffle(cards).forEach((cardData) => {
    gameBoard.appendChild(createCardElement(cardData));
  });
}

function createCardDeck(pairs) {
  return pairs.flatMap((pair) => [
    {
      pairId: pair.id,
      kind: "term",
      label: "Begriff",
      text: pair.term
    },
    {
      pairId: pair.id,
      kind: "definition",
      label: "Definition",
      text: pair.definition
    }
  ]);
}

function createCardElement(cardData) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  const type = card.querySelector(".card-type");
  const text = card.querySelector(".card-text");

  card.dataset.pairId = cardData.pairId;
  card.dataset.kind = cardData.kind;
  card.setAttribute("aria-label", `Verdeckte Karte: ${cardData.label}`);
  type.textContent = cardData.label;
  text.textContent = cardData.text;
  card.addEventListener("click", () => handleCardClick(card));

  return card;
}

function handleCardClick(card) {
  const clickedSameCard = card === firstCard;

  if (isCheckingPair || clickedSameCard || card.classList.contains("is-matched")) {
    return;
  }

  flipCard(card);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  attempts += 1;
  attemptsOutput.textContent = attempts;
  checkSelectedPair();
}

function flipCard(card) {
  card.classList.add("is-flipped");
  card.setAttribute("aria-label", `${card.querySelector(".card-type").textContent}: ${card.querySelector(".card-text").textContent}`);
}

function checkSelectedPair() {
  isCheckingPair = true;

  const samePair = firstCard.dataset.pairId === secondCard.dataset.pairId;
  const differentKinds = firstCard.dataset.kind !== secondCard.dataset.kind;

  if (samePair && differentKinds) {
    markPairAsFound();
    return;
  }

  message.textContent = "Fast! Diese beiden Karten gehören nicht zusammen.";
  mismatchTimeoutId = setTimeout(hideSelectedCards, 950);
}

function markPairAsFound() {
  firstCard.classList.add("is-matched", "is-locked");
  secondCard.classList.add("is-matched", "is-locked");
  firstCard.disabled = true;
  secondCard.disabled = true;

  matches += 1;
  matchesOutput.textContent = matches;

  if (matches === currentPairs.length) {
    message.textContent = "Super! Du hast alle Paare gefunden!";
    message.classList.add("success");
  } else {
    message.textContent = "Richtig! Das Paar bleibt aufgedeckt.";
  }

  clearSelectedCards();
}

function hideSelectedCards() {
  mismatchTimeoutId = null;

  if (!firstCard || !secondCard) {
    clearSelectedCards();
    return;
  }

  firstCard.classList.remove("is-flipped");
  secondCard.classList.remove("is-flipped");
  firstCard.setAttribute("aria-label", "Verdeckte Karte");
  secondCard.setAttribute("aria-label", "Verdeckte Karte");
  clearSelectedCards();
}

function clearSelectedCards() {
  firstCard = null;
  secondCard = null;
  isCheckingPair = false;
}

function clearMismatchTimeout() {
  if (mismatchTimeoutId) {
    clearTimeout(mismatchTimeoutId);
    mismatchTimeoutId = null;
  }
}

// Fisher-Yates-Mischung: fair, kurz und ohne externe Bibliothek.
function shuffle(cards) {
  const shuffledCards = [...cards];

  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledCards[index], shuffledCards[randomIndex]] = [shuffledCards[randomIndex], shuffledCards[index]];
  }

  return shuffledCards;
}
