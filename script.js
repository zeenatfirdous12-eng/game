/* =========================================================
   WONDERKIDS - MAIN JAVASCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const STORAGE_KEY = "wonderkids_player_v2";


/* =========================================================
   DEFAULT PLAYER
   ========================================================= */

const defaultPlayer = {
  name: "Young Explorer",
  avatar: "🧒",
  coins: 420,
  hearts: 5,
  xp: 2680,
  level: 3,
  streak: 4,
  dailyProgress: 0,
  dailyRewardClaimed: false,
  quizQuestions: 0,
  completedActivities: 0,

  badges: {
    firstStep: true,
    onFire: true,
    brainMaster: false,
    wonderKid: false
  }
};

let player = loadPlayer();


/* =========================================================
   LOAD / SAVE PLAYER
   ========================================================= */

function loadPlayer() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return { ...defaultPlayer };
    }

    const parsed = JSON.parse(saved);

    return {
      ...defaultPlayer,
      ...parsed,
      badges: {
        ...defaultPlayer.badges,
        ...(parsed.badges || {})
      }
    };

  } catch (error) {
    console.error("Player loading error:", error);
    return { ...defaultPlayer };
  }
}


function savePlayer() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  } catch (error) {
    console.error("Player saving error:", error);
  }
}


/* =========================================================
   PLAYER UI
   ========================================================= */

function updatePlayerUI() {

  const nameElements = [
    $("#playerName"),
    $("#profileName"),
    $("#heroPlayerName")
  ];

  nameElements.forEach((element) => {
    if (element) {
      element.textContent = player.name;
    }
  });


  const avatarElements = [
    $("#playerAvatar"),
    $("#profileAvatar"),
    $("#heroAvatar")
  ];

  avatarElements.forEach((element) => {
    if (element) {
      element.textContent = player.avatar;
    }
  });


  const coins = $("#coinCount");
  if (coins) {
    coins.textContent = player.coins;
  }


  const hearts = $("#heartCount");
  if (hearts) {
    hearts.textContent = player.hearts;
  }


  const xp = $("#xpCount");
  if (xp) {
    xp.textContent = player.xp;
  }


  const level = $("#levelCount");
  if (level) {
    level.textContent = player.level;
  }


  const streak = $("#streakCount");
  if (streak) {
    streak.textContent = player.streak;
  }


  const progress = $("#dailyProgress");

  if (progress) {
    progress.textContent = `${Math.min(player.dailyProgress, 3)}/3`;
  }


  const progressBar = $("#progressBar");

  if (progressBar) {
    const percentage = Math.min(
      (player.dailyProgress / 3) * 100,
      100
    );

    progressBar.style.width = `${percentage}%`;
  }


  const xpBar = $("#xpBar");

  if (xpBar) {

    const currentLevelXP = player.xp % 1000;
    const percentage = (currentLevelXP / 1000) * 100;

    xpBar.style.width = `${percentage}%`;
  }


  updateChallengeButton();
  updateBadges();
}


/* =========================================================
   CHALLENGE BUTTON
   ========================================================= */

function updateChallengeButton() {

  const button = $("#challengeBtn");

  if (!button) return;


  if (player.dailyProgress >= 3) {

    button.textContent = "✓ Challenge Complete";
    button.classList.add("completed");

  } else {

    button.textContent = "Start Challenge";
    button.classList.remove("completed");
  }
}


/* =========================================================
   BADGES
   ========================================================= */

function updateBadges() {

  const brainBadge = $("#brainMasterBadge");

  if (brainBadge) {
    brainBadge.classList.toggle(
      "unlocked",
      player.badges.brainMaster
    );
  }


  const wonderBadge = $("#wonderKidBadge");

  if (wonderBadge) {
    wonderBadge.classList.toggle(
      "unlocked",
      player.badges.wonderKid
    );
  }
}


/* =========================================================
   COINS
   ========================================================= */

function addCoins(amount) {

  player.coins += amount;

  updatePlayerUI();
  savePlayer();

  showToast(`🪙 +${amount} coins!`);
}


/* =========================================================
   XP
   ========================================================= */

function addXP(amount) {

  player.xp += amount;

  player.level =
    Math.floor(player.xp / 1000) + 1;

  updatePlayerUI();
  savePlayer();

  showToast(`⭐ +${amount} XP!`);
}


/* =========================================================
   COMPLETE ACTIVITY
   ========================================================= */

function completeActivity() {

  player.completedActivities++;

  if (player.dailyProgress < 3) {
    player.dailyProgress++;
  }


  if (player.completedActivities >= 10) {
    player.badges.brainMaster = true;
  }


  if (player.completedActivities >= 25) {
    player.badges.wonderKid = true;
  }


  updatePlayerUI();
  savePlayer();
}


/* =========================================================
   PROFILE MODAL
   ========================================================= */

function openProfile() {

  const modal = $("#profileModal");

  if (!modal) return;

  modal.classList.add("open");


  const nameInput = $("#profileNameInput");

  if (nameInput) {
    nameInput.value = player.name;
  }


  const avatarInput = $("#profileAvatarInput");

  if (avatarInput) {
    avatarInput.value = player.avatar;
  }
}


function closeProfile() {

  const modal = $("#profileModal");

  if (!modal) return;

  modal.classList.remove("open");
}


/* =========================================================
   GAME MODAL
   ========================================================= */

function openGameModal(title, html) {

  const modal = $("#gameModal");
  const content = $("#gameContent");

  if (!modal || !content) return;


  content.innerHTML = `
    <div class="game-modal-header">
      <h2>${title}</h2>

      <button
        class="modal-close"
        id="closeGameModal"
        type="button"
      >
        ✕
      </button>
    </div>

    <div class="game-body">
      ${html}
    </div>
  `;


  modal.classList.add("open");


  const closeButton = $("#closeGameModal");

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeGameModal
    );
  }
}


function closeGameModal() {

  const modal = $("#gameModal");

  if (!modal) return;

  modal.classList.remove("open");
}


/* =========================================================
   QUIZ DATA
   ========================================================= */

const quizData = {

  math: [
    {
      question: "What is 5 + 3?",
      options: ["6", "7", "8", "9"],
      answer: "8"
    },

    {
      question: "What is 10 - 4?",
      options: ["4", "5", "6", "7"],
      answer: "6"
    },

    {
      question: "What is 3 × 4?",
      options: ["7", "10", "12", "14"],
      answer: "12"
    },

    {
      question: "What is 20 ÷ 5?",
      options: ["2", "3", "4", "5"],
      answer: "4"
    },

    {
      question: "Which number is bigger?",
      options: ["12", "18", "9", "7"],
      answer: "18"
    }
  ],


  english: [
    {
      question: "Which word is an animal?",
      options: ["Apple", "Tiger", "Chair", "Book"],
      answer: "Tiger"
    },

    {
      question: "What is the opposite of HOT?",
      options: ["Warm", "Cold", "Big", "Fast"],
      answer: "Cold"
    },

    {
      question: "Which one is a fruit?",
      options: ["Car", "Apple", "Table", "Shoe"],
      answer: "Apple"
    },

    {
      question: "Which word means happy?",
      options: ["Sad", "Angry", "Joyful", "Tired"],
      answer: "Joyful"
    },

    {
      question: "Choose the correct spelling.",
      options: ["Elefant", "Eliphant", "Elephant", "Elfant"],
      answer: "Elephant"
    }
  ],


  science: [
    {
      question: "What do plants need to grow?",
      options: [
        "Sunlight",
        "Television",
        "Shoes",
        "Toys"
      ],
      answer: "Sunlight"
    },

    {
      question: "Which planet do we live on?",
      options: [
        "Mars",
        "Earth",
        "Jupiter",
        "Venus"
      ],
      answer: "Earth"
    },

    {
      question: "What do humans breathe?",
      options: [
        "Water",
        "Air",
        "Sand",
        "Milk"
      ],
      answer: "Air"
    },

    {
      question: "Which animal lays eggs?",
      options: [
        "Cat",
        "Dog",
        "Chicken",
        "Cow"
      ],
      answer: "Chicken"
    },

    {
      question: "What gives Earth light?",
      options: [
        "Moon",
        "Sun",
        "Cloud",
        "Starfish"
      ],
      answer: "Sun"
    }
  ],


  general: [
    {
      question: "How many days are in a week?",
      options: ["5", "6", "7", "8"],
      answer: "7"
    },

    {
      question: "Which color is the sky on a clear day?",
      options: [
        "Blue",
        "Green",
        "Pink",
        "Orange"
      ],
      answer: "Blue"
    },

    {
      question: "How many legs does a dog have?",
      options: ["2", "3", "4", "6"],
      answer: "4"
    },

    {
      question: "Which one can fly?",
      options: [
        "Bird",
        "Fish",
        "Elephant",
        "Cow"
      ],
      answer: "Bird"
    },

    {
      question: "What do we use to tell time?",
      options: [
        "Clock",
        "Spoon",
        "Ball",
        "Pillow"
      ],
      answer: "Clock"
    }
  ]
};


/* =========================================================
   QUIZ VARIABLES
   ========================================================= */

let currentQuiz = [];
let currentQuizIndex = 0;
let currentQuizScore = 0;
let currentQuizCategory = "general";


/* =========================================================
   START QUIZ
   ========================================================= */

function startQuiz(category = "general") {

  if (!quizData[category]) {
    category = "general";
  }


  currentQuizCategory = category;

  currentQuiz = [...quizData[category]];

  currentQuizIndex = 0;
  currentQuizScore = 0;


  renderQuiz();
}


/* =========================================================
   RENDER QUIZ
   ========================================================= */

function renderQuiz() {

  if (
    currentQuizIndex >= currentQuiz.length
  ) {
    showQuizResult();
    return;
  }


  const question =
    currentQuiz[currentQuizIndex];


  const progress =
    ((currentQuizIndex + 1) /
      currentQuiz.length) *
    100;


  const optionsHTML =
    question.options
      .map(
        (option, index) => `
          <button
            class="quiz-option"
            type="button"
            data-answer-index="${index}"
          >
            ${option}
          </button>
        `
      )
      .join("");


  openGameModal(
    `🧠 ${capitalize(currentQuizCategory)} Quiz`,
    `
      <div class="quiz-container">

        <div class="quiz-progress">
          <div
            class="quiz-progress-bar"
            style="width:${progress}%"
          ></div>
        </div>

        <div class="quiz-question-number">
          Question ${currentQuizIndex + 1}
          of ${currentQuiz.length}
        </div>

        <h3 class="quiz-question">
          ${question.question}
        </h3>

        <div class="quiz-options">
          ${optionsHTML}
        </div>

      </div>
    `
  );


  $$(".quiz-option").forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.answerIndex
            );

          checkQuizAnswer(index);
        }
      );

    }
  );
}


/* =========================================================
   CHECK QUIZ
   ========================================================= */

function checkQuizAnswer(index) {

  const question =
    currentQuiz[currentQuizIndex];


  const buttons =
    $$(".quiz-option");


  buttons.forEach(
    (button) => {
      button.disabled = true;
    }
  );


  const selected =
    question.options[index];


  if (selected === question.answer) {

    currentQuizScore++;

    buttons[index]?.classList.add(
      "correct"
    );

    showToast("🎉 Correct answer!");

  } else {

    buttons[index]?.classList.add(
      "wrong"
    );


    const correctIndex =
      question.options.indexOf(
        question.answer
      );


    if (correctIndex >= 0) {
      buttons[correctIndex]?.classList.add(
        "correct"
      );
    }


    showToast(
      `💡 Correct answer: ${question.answer}`
    );
  }


  player.quizQuestions++;

  savePlayer();


  setTimeout(() => {

    currentQuizIndex++;

    renderQuiz();

  }, 850);
}


/* =========================================================
   QUIZ RESULT
   ========================================================= */

function showQuizResult() {

  const total = currentQuiz.length;

  const score = currentQuizScore;

  const percentage =
    Math.round((score / total) * 100);


  let emoji = "💪";
  let message = "Keep practicing!";


  if (percentage >= 80) {

    emoji = "🏆";
    message = "Amazing work!";

  } else if (percentage >= 60) {

    emoji = "🌟";
    message = "Great job!";

  } else if (percentage >= 40) {

    emoji = "😊";
    message = "Good try!";
  }


  const rewardCoins =
    score * 10;

  const rewardXP =
    score * 20;


  addCoins(rewardCoins);
  addXP(rewardXP);

  completeActivity();


  openGameModal(
    "🎉 Quiz Complete!",
    `
      <div class="result-screen">

        <div class="result-emoji">
          ${emoji}
        </div>

        <h2>${message}</h2>

        <p class="result-score">
          You scored
          <strong>${score}/${total}</strong>
        </p>

        <div class="result-rewards">

          <div>
            <span>🪙</span>
            +${rewardCoins}
          </div>

          <div>
            <span>⭐</span>
            +${rewardXP}
          </div>

        </div>

        <button
          class="primary-btn"
          id="quizDoneBtn"
          type="button"
        >
          Continue
        </button>

      </div>
    `
  );


  const doneButton =
    $("#quizDoneBtn");

  if (doneButton) {
    doneButton.addEventListener(
      "click",
      closeGameModal
    );
  }
}


/* =========================================================
   FIND QUIZ CATEGORY
   ========================================================= */

function findCurrentCategory() {

  return currentQuizCategory || "general";
}


/* =========================================================
   MEMORY GAME
   ========================================================= */

const memoryEmojis = [
  "🍎",
  "🍎",
  "🐶",
  "🐶",
  "🚀",
  "🚀",
  "🌈",
  "🌈",
  "⭐",
  "⭐",
  "🦋",
  "🦋"
];


let memoryCards = [];
let memoryFlipped = [];
let memoryMatches = 0;
let memoryLocked = false;


function startMemoryGame() {

  memoryCards =
    [...memoryEmojis]
      .sort(
        () => Math.random() - 0.5
      );


  memoryFlipped = [];
  memoryMatches = 0;
  memoryLocked = false;


  renderMemoryGame();
}


function renderMemoryGame() {

  const cardsHTML =
    memoryCards
      .map(
        (emoji, index) => `
          <button
            class="memory-card"
            type="button"
            data-memory-index="${index}"
          >
            <span class="memory-front">
              ?
            </span>

            <span class="memory-back">
              ${emoji}
            </span>
          </button>
        `
      )
      .join("");


  openGameModal(
    "🧩 Memory Match",
    `
      <div class="memory-game">

        <p>
          Find all matching pairs!
        </p>

        <div class="memory-grid">
          ${cardsHTML}
        </div>

      </div>
    `
  );


  $$(".memory-card").forEach(
    (card) => {

      card.addEventListener(
        "click",
        () => {

          flipMemoryCard(
            Number(
              card.dataset.memoryIndex
            )
          );

        }
      );

    }
  );
}


function flipMemoryCard(index) {

  if (memoryLocked) return;

  if (
    memoryFlipped.includes(index)
  ) {
    return;
  }


  const cards =
    $$(".memory-card");


  const card =
    cards[index];


  if (!card) return;


  card.classList.add("flipped");

  memoryFlipped.push(index);


  if (memoryFlipped.length < 2) {
    return;
  }


  memoryLocked = true;


  const first =
    memoryFlipped[0];

  const second =
    memoryFlipped[1];


  if (
    memoryCards[first] ===
    memoryCards[second]
  ) {

    cards[first]?.classList.add(
      "matched"
    );

    cards[second]?.classList.add(
      "matched"
    );


    memoryMatches++;

    memoryFlipped = [];

    memoryLocked = false;


    if (memoryMatches === 6) {

      setTimeout(() => {

        addCoins(50);
        addXP(100);
        completeActivity();

        openGameModal(
          "🏆 Amazing!",
          `
            <div class="result-screen">

              <div class="result-emoji">
                🧠✨
              </div>

              <h2>All Pairs Found!</h2>

              <p>
                You completed the Memory Match!
              </p>

              <div class="result-rewards">

                <div>
                  🪙 +50
                </div>

                <div>
                  ⭐ +100 XP
                </div>

              </div>

              <button
                class="primary-btn"
                id="memoryDoneBtn"
                type="button"
              >
                Continue
              </button>

            </div>
          `
        );


        $("#memoryDoneBtn")
          ?.addEventListener(
            "click",
            closeGameModal
          );

      }, 400);
    }

  } else {

    setTimeout(() => {

      cards[first]?.classList.remove(
        "flipped"
      );

      cards[second]?.classList.remove(
        "flipped"
      );


      memoryFlipped = [];

      memoryLocked = false;

    }, 700);
  }
}


/* =========================================================
   WORD BUILDER
   ========================================================= */

const wordList = [
  "SUN",
  "MOON",
  "STAR",
  "TREE",
  "BOOK",
  "FISH",
  "BALL",
  "CAKE"
];


let currentWord = "";
let selectedLetters = [];


function startWordGame() {

  currentWord =
    wordList[
      Math.floor(
        Math.random() *
        wordList.length
      )
    ];


  selectedLetters = [];


  renderWordGame();
}


function renderWordGame() {

  const letters =
    [...currentWord]
      .sort(
        () => Math.random() - 0.5
      );


  const lettersHTML =
    letters
      .map(
        (letter, index) => `
          <button
            class="letter-btn"
            type="button"
            data-letter="${letter}"
            data-letter-index="${index}"
          >
            ${letter}
          </button>
        `
      )
      .join("");


  openGameModal(
    "🔤 Word Builder",
    `
      <div class="word-game">

        <p>
          Build the word!
        </p>

        <div
          class="word-answer"
          id="wordAnswer"
        >
          _
        </div>

        <div class="letter-grid">
          ${lettersHTML}
        </div>

        <button
          class="primary-btn"
          id="checkWordBtn"
          type="button"
        >
          Check Word
        </button>

      </div>
    `
  );


  $$(".letter-btn").forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          chooseLetter(
            button
          );

        }
      );

    }
  );


  $("#checkWordBtn")
    ?.addEventListener(
      "click",
      checkWord
    );
}


function chooseLetter(button) {

  if (
    button.classList.contains(
      "selected"
    )
  ) {
    return;
  }


  if (
    selectedLetters.length >=
    currentWord.length
  ) {
    return;
  }


  const letter =
    button.dataset.letter;


  selectedLetters.push(letter);

  button.classList.add("selected");


  const answer =
    $("#wordAnswer");


  if (answer) {

    answer.textContent =
      selectedLetters.join("");
  }
}


function checkWord() {

  const answer =
    selectedLetters.join("");


  if (answer === currentWord) {

    addCoins(25);
    addXP(60);
    completeActivity();


    openGameModal(
      "🎉 Correct!",
      `
        <div class="result-screen">

          <div class="result-emoji">
            🥳
          </div>

          <h2>Great Word!</h2>

          <p>
            You built "${currentWord}" correctly.
          </p>

          <div class="result-rewards">
            🪙 +25 &nbsp;&nbsp; ⭐ +60 XP
          </div>

          <button
            class="primary-btn"
            id="wordDoneBtn"
            type="button"
          >
            Continue
          </button>

        </div>
      `
    );


    $("#wordDoneBtn")
      ?.addEventListener(
        "click",
        closeGameModal
      );

  } else {

    showToast(
      "💡 Not quite! Try again."
    );
  }
}


/* =========================================================
   MATH CHALLENGE
   ========================================================= */

let mathAnswer = 0;


function startMathGame() {

  const a =
    Math.floor(
      Math.random() * 10
    ) + 1;


  const b =
    Math.floor(
      Math.random() * 10
    ) + 1;


  mathAnswer = a + b;


  openGameModal(
    "➕ Math Challenge",
    `
      <div class="simple-game">

        <div class="big-question">
          ${a} + ${b} = ?
        </div>

        <input
          id="mathAnswerInput"
          class="game-input"
          type="number"
          placeholder="Your answer"
          autocomplete="off"
        />

        <button
          class="primary-btn"
          id="mathSubmitBtn"
          type="button"
        >
          Check Answer
        </button>

      </div>
    `
  );


  const input =
    $("#mathAnswerInput");


  $("#mathSubmitBtn")
    ?.addEventListener(
      "click",
      () => {

        const answer =
          Number(input?.value);


        if (answer === mathAnswer) {

          addCoins(20);
          addXP(50);
          completeActivity();


          openGameModal(
            "🎉 Correct!",
            `
              <div class="result-screen">

                <div class="result-emoji">
                  🧮✨
                </div>

                <h2>Perfect!</h2>

                <p>
                  ${a} + ${b} = ${mathAnswer}
                </p>

                <div class="result-rewards">
                  🪙 +20 &nbsp;&nbsp; ⭐ +50 XP
                </div>

                <button
                  class="primary-btn"
                  id="mathDoneBtn"
                  type="button"
                >
                  Continue
                </button>

              </div>
            `
          );


          $("#mathDoneBtn")
            ?.addEventListener(
              "click",
              closeGameModal
            );

        } else {

          showToast(
            "❌ Try again!"
          );
        }

      }
    );
}


/* =========================================================
   COLOR GAME
   ========================================================= */

const colorData = [
  {
    name: "Red",
    emoji: "🔴"
  },

  {
    name: "Blue",
    emoji: "🔵"
  },

  {
    name: "Green",
    emoji: "🟢"
  },

  {
    name: "Yellow",
    emoji: "🟡"
  },

  {
    name: "Purple",
    emoji: "🟣"
  },

  {
    name: "Orange",
    emoji: "🟠"
  }
];


let targetColor = null;


function startColorGame() {

  targetColor =
    colorData[
      Math.floor(
        Math.random() *
        colorData.length
      )
    ];


  const shuffled =
    [...colorData]
      .sort(
        () => Math.random() - 0.5
      );


  const optionsHTML =
    shuffled
      .map(
        (color) => `
          <button
            class="color-choice"
            type="button"
            data-color="${color.name}"
          >
            <span>
              ${color.emoji}
            </span>

            ${color.name}
          </button>
        `
      )
      .join("");


  openGameModal(
    "🎨 Color Game",
    `
      <div class="simple-game">

        <div class="color-target">
          Find:
          <strong>
            ${targetColor.name}
          </strong>
        </div>

        <div class="color-options">
          ${optionsHTML}
        </div>

      </div>
    `
  );


  $$(".color-choice").forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const selected =
            button.dataset.color;


          if (
            selected ===
            targetColor.name
          ) {

            addCoins(15);
            addXP(40);
            completeActivity();


            openGameModal(
              "🎨 Great!",
              `
                <div class="result-screen">

                  <div class="result-emoji">
                    🌈
                  </div>

                  <h2>Correct Color!</h2>

                  <p>
                    You found ${targetColor.name}.
                  </p>

                  <div class="result-rewards">
                    🪙 +15 &nbsp;&nbsp; ⭐ +40 XP
                  </div>

                  <button
                    class="primary-btn"
                    id="colorDoneBtn"
                    type="button"
                  >
                    Continue
                  </button>

                </div>
              `
            );


            $("#colorDoneBtn")
              ?.addEventListener(
                "click",
                closeGameModal
              );

          } else {

            showToast(
              "💡 Try another color!"
            );
          }

        }
      );

    }
  );
}


/* =========================================================
   NUMBER HUNT
   ========================================================= */

let numberTarget = 0;


function startNumberGame() {

  numberTarget =
    Math.floor(
      Math.random() * 10
    ) + 1;


  const numbers = [];


  while (numbers.length < 6) {

    const number =
      Math.floor(
        Math.random() * 10
      ) + 1;


    if (
      !numbers.includes(number)
    ) {
      numbers.push(number);
    }
  }


  if (
    !numbers.includes(numberTarget)
  ) {

    numbers[
      Math.floor(
        Math.random() *
        numbers.length
      )
    ] = numberTarget;
  }


  numbers.sort(
    () => Math.random() - 0.5
  );


  const numbersHTML =
    numbers
      .map(
        (number) => `
          <button
            class="number-choice"
            type="button"
            data-number="${number}"
          >
            ${number}
          </button>
        `
      )
      .join("");


  openGameModal(
    "🔢 Number Hunt",
    `
      <div class="simple-game">

        <div class="big-question">
          Find number
          <strong>${numberTarget}</strong>
        </div>

        <div class="number-grid">
          ${numbersHTML}
        </div>

      </div>
    `
  );


  $$(".number-choice").forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const selected =
            Number(
              button.dataset.number
            );


          if (
            selected ===
            numberTarget
          ) {

            addCoins(15);
            addXP(40);
            completeActivity();


            openGameModal(
              "🏆 You Found It!",
              `
                <div class="result-screen">

                  <div class="result-emoji">
                    🔢🎉
                  </div>

                  <h2>Correct!</h2>

                  <p>
                    You found number
                    ${numberTarget}.
                  </p>

                  <div class="result-rewards">
                    🪙 +15 &nbsp;&nbsp; ⭐ +40 XP
                  </div>

                  <button
                    class="primary-btn"
                    id="numberDoneBtn"
                    type="button"
                  >
                    Continue
                  </button>

                </div>
              `
            );


            $("#numberDoneBtn")
              ?.addEventListener(
                "click",
                closeGameModal
              );

          } else {

            showToast(
              "💡 That's not the number!"
            );
          }

        }
      );

    }
  );
}


/* =========================================================
   DAILY CHALLENGE
   ========================================================= */

function startDailyChallenge() {

  if (player.dailyProgress >= 3) {

    showToast(
      "🏆 Daily challenge complete!"
    );

    return;
  }


  startQuiz("general");
}


/* =========================================================
   CONTINUE LEARNING
   ========================================================= */

function continueLearning() {

  const learnSection =
    $("#learn");


  if (!learnSection) return;


  learnSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

  const links =
    $$("a[href^='#']");


  links.forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const href =
            link.getAttribute("href");


          if (
            !href ||
            href === "#"
          ) {
            return;
          }


          const target =
            $(href);


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });


          links.forEach(
            (item) => {
              item.classList.remove(
                "active"
              );
            }
          );


          link.classList.add(
            "active"
          );

        }
      );

    }
  );
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;


function showToast(message) {

  const toast =
    $("#toast");


  if (!toast) {
    return;
  }


  toast.textContent = message;

  toast.classList.add("show");


  clearTimeout(toastTimer);


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );
}


/* =========================================================
   CONFETTI
   ========================================================= */

function createConfetti() {

  const container =
    $("#confetti");


  if (!container) return;


  container.innerHTML = "";


  const emojis = [
    "🎉",
    "⭐",
    "✨",
    "🎊",
    "🌟"
  ];


  for (
    let i = 0;
    i < 25;
    i++
  ) {

    const piece =
      document.createElement(
        "span"
      );


    piece.className =
      "confetti-piece";


    piece.textContent =
      emojis[
        Math.floor(
          Math.random() *
          emojis.length
        )
      ];


    piece.style.left =
      `${Math.random() * 100}%`;


    piece.style.animationDelay =
      `${Math.random() * 0.5}s`;


    container.appendChild(piece);
  }


  setTimeout(
    () => {
      container.innerHTML = "";
    },
    2500
  );
}


/* =========================================================
   GENERIC GAME HANDLER
   IMPORTANT:
   ALL PLAY BUTTONS ARE HANDLED HERE
   ========================================================= */

function handleGameButton(game) {

  switch (game) {

    case "memory":
      startMemoryGame();
      break;


    case "quiz":
      startQuiz("general");
      break;


    case "word":
      startWordGame();
      break;


    case "mathgame":
      startMathGame();
      break;


    case "color":
      startColorGame();
      break;


    case "number":
      startNumberGame();
      break;


    default:
      console.warn(
        "Unknown game:",
        game
      );

  }
}


/* =========================================================
   SETUP GAME BUTTONS
   ========================================================= */

function setupGameButtons() {

  /*
     IMPORTANT:
     We use ONE delegated click listener.
     This works even if buttons are generated
     or changed later.
  */

  document.addEventListener(
    "click",
    function (event) {

      const button =
        event.target.closest(
          "[data-game]"
        );


      if (!button) {
        return;
      }


      const game =
        button.dataset.game;


      if (!game) {
        return;
      }


      event.preventDefault();
      event.stopPropagation();


      handleGameButton(game);

    }
  );
}


/* =========================================================
   SUBJECT QUIZ BUTTONS
   ========================================================= */

function setupSubjectButtons() {

  document.addEventListener(
    "click",
    function (event) {

      const button =
        event.target.closest(
          "[data-quiz]"
        );


      if (!button) {
        return;
      }


      const category =
        button.dataset.quiz ||
        "general";


      event.preventDefault();
      event.stopPropagation();


      startQuiz(category);

    }
  );
}


/* =========================================================
   PROFILE SETUP
   ========================================================= */

function setupProfile() {

  $("#profileBtn")
    ?.addEventListener(
      "click",
      openProfile
    );


  $("#closeProfile")
    ?.addEventListener(
      "click",
      closeProfile
    );


  $("#saveProfile")
    ?.addEventListener(
      "click",
      () => {

        const nameInput =
          $("#profileNameInput");


        const avatarInput =
          $("#profileAvatarInput");


        if (
          nameInput &&
          nameInput.value.trim()
        ) {

          player.name =
            nameInput.value.trim();
        }


        if (
          avatarInput &&
          avatarInput.value.trim()
        ) {

          player.avatar =
            avatarInput.value.trim();
        }


        savePlayer();

        updatePlayerUI();

        closeProfile();

        showToast(
          "✅ Profile saved!"
        );

      }
    );
}


/* =========================================================
   MODAL OUTSIDE CLICK
   ========================================================= */

function setupModalClosing() {

  const gameModal =
    $("#gameModal");


  if (gameModal) {

    gameModal.addEventListener(
      "click",
      (event) => {

        if (
          event.target ===
          gameModal
        ) {
          closeGameModal();
        }

      }
    );
  }


  const profileModal =
    $("#profileModal");


  if (profileModal) {

    profileModal.addEventListener(
      "click",
      (event) => {

        if (
          event.target ===
          profileModal
        ) {
          closeProfile();
        }

      }
    );
  }


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape"
      ) {

        closeGameModal();
        closeProfile();

      }

    }
  );
}


/* =========================================================
   DAILY CHALLENGE SETUP
   ========================================================= */

function setupChallenge() {

  $("#challengeBtn")
    ?.addEventListener(
      "click",
      () => {

        startDailyChallenge();

      }
    );
}


/* =========================================================
   CONTINUE BUTTON
   ========================================================= */

function setupContinueButton() {

  $("#continueBtn")
    ?.addEventListener(
      "click",
      continueLearning
    );


  $("#startLearningBtn")
    ?.addEventListener(
      "click",
      continueLearning
    );
}


/* =========================================================
   RESET PLAYER
   ========================================================= */

function resetPlayer() {

  const confirmed =
    confirm(
      "Are you sure you want to reset your progress?"
    );


  if (!confirmed) {
    return;
  }


  player = {
    ...defaultPlayer,
    badges: {
      ...defaultPlayer.badges
    }
  };


  savePlayer();

  updatePlayerUI();

  showToast(
    "🔄 Progress reset!"
  );
}


/* =========================================================
   OPTIONAL RESET BUTTON
   ========================================================= */

function setupReset() {

  $("#resetProgress")
    ?.addEventListener(
      "click",
      resetPlayer
    );
}


/* =========================================================
   PAGE LOAD
   ========================================================= */

function initialize() {

  console.log(
    "WonderKids JavaScript loaded successfully."
  );


  updatePlayerUI();

  setupNavigation();

  setupGameButtons();

  setupSubjectButtons();

  setupProfile();

  setupModalClosing();

  setupChallenge();

  setupContinueButton();

  setupReset();

}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );

} else {

  initialize();

}
