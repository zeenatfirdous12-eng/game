/* =========================================
   WONDERKIDS
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   PLAYER DATA
========================================= */

let player = {
  name: "Young Explorer",
  avatar: "🧒",
  coins: 120,
  hearts: 5,
  xp: 680,
  level: 3,
  streak: 4,
  dailyProgress: 0
};


/* =========================================
   LOAD PLAYER
========================================= */

function loadPlayer() {

  const saved = localStorage.getItem("wonderKidsPlayer");

  if (saved) {
    try {
      player = {
        ...player,
        ...JSON.parse(saved)
      };
    } catch (error) {
      console.log("Player data reset.");
    }
  }

  updateUI();
}


function savePlayer() {
  localStorage.setItem(
    "wonderKidsPlayer",
    JSON.stringify(player)
  );
}


/* =========================================
   UPDATE UI
========================================= */

function updateUI() {

  document.getElementById("coinCount").textContent =
    player.coins;

  document.getElementById("rewardCoins").textContent =
    player.coins;

  document.getElementById("heartCount").textContent =
    player.hearts;

  document.getElementById("profileAvatar").textContent =
    player.avatar;

  document.getElementById("bigAvatar").textContent =
    player.avatar;

  document.getElementById("playerNameDisplay").textContent =
    player.name;

  document.getElementById("levelNumber").textContent =
    player.level;

  document.getElementById("xpCurrent").textContent =
    player.xp;

  document.getElementById("streakCount").textContent =
    player.streak + " Day";

  const xpPercentage =
    Math.min((player.xp / 1000) * 100, 100);

  document.getElementById("xpFill").style.width =
    xpPercentage + "%";

  const dailyPercentage =
    Math.min((player.dailyProgress / 5) * 100, 100);

  document.getElementById("challengeFill").style.width =
    dailyPercentage + "%";

  document.getElementById("challengeText").textContent =
    player.dailyProgress + " / 5";
}


/* =========================================
   PROFILE
========================================= */

let selectedAvatar = "🧒";


document
  .getElementById("profileButton")
  .addEventListener("click", function () {

    document.getElementById("playerNameInput").value =
      player.name === "Young Explorer"
        ? ""
        : player.name;

    selectedAvatar = player.avatar;

    document.getElementById("profileModal")
      .classList.add("show");
  });


function selectAvatar(avatar) {

  selectedAvatar = avatar;

  document
    .querySelectorAll(".avatar-options button")
    .forEach(button => {
      button.classList.remove("selected");

      if (button.textContent === avatar) {
        button.classList.add("selected");
      }
    });
}


function saveProfile() {

  const input =
    document.getElementById("playerNameInput");

  const name =
    input.value.trim();

  if (name.length > 0) {
    player.name = name;
  }

  player.avatar = selectedAvatar;

  savePlayer();
  updateUI();

  closeModal("profileModal");

  showToast(
    "🎉",
    "Profile saved! Let's learn!"
  );
}


/* =========================================
   MODAL
========================================= */

function closeModal(id) {

  document
    .getElementById(id)
    .classList.remove("show");
}


document.querySelectorAll(".modal-overlay")
  .forEach(overlay => {

    overlay.addEventListener("click", function(event) {

      if (event.target === overlay) {
        overlay.classList.remove("show");
      }

    });

  });


/* =========================================
   NAVIGATION
========================================= */

function scrollToSection(id) {

  const section =
    document.getElementById(id);

  if (!section) return;

  section.scrollIntoView({
    behavior: "smooth"
  });
}


document.querySelectorAll(".nav-link")
  .forEach(link => {

    link.addEventListener("click", function() {

      document
        .querySelectorAll(".nav-link")
        .forEach(item =>
          item.classList.remove("active")
        );

      this.classList.add("active");

    });

  });


/* =========================================
   QUIZ DATA
========================================= */

const quizData = {

  math: [

    {
      q: "What is 5 + 3?",
      options: ["6", "7", "8", "9"],
      answer: "8"
    },

    {
      q: "What is 10 - 4?",
      options: ["4", "5", "6", "7"],
      answer: "6"
    },

    {
      q: "What is 3 × 2?",
      options: ["5", "6", "7", "8"],
      answer: "6"
    },

    {
      q: "Which number is the biggest?",
      options: ["12", "21", "15", "18"],
      answer: "21"
    },

    {
      q: "How many sides does a square have?",
      options: ["3", "4", "5", "6"],
      answer: "4"
    }

  ],


  english: [

    {
      q: "Which word is a color?",
      options: ["Apple", "Blue", "Chair", "Dog"],
      answer: "Blue"
    },

    {
      q: "Which one is an animal?",
      options: ["Table", "Tiger", "Pencil", "Book"],
      answer: "Tiger"
    },

    {
      q: "Complete: C _ T",
      options: ["A", "E", "I", "O"],
      answer: "A"
    },

    {
      q: "Which word means the opposite of BIG?",
      options: ["Tall", "Small", "Long", "Wide"],
      answer: "Small"
    },

    {
      q: "Which word rhymes with CAT?",
      options: ["Dog", "Hat", "Sun", "Tree"],
      answer: "Hat"
    }

  ],


  science: [

    {
      q: "Which planet do we live on?",
      options: ["Mars", "Earth", "Jupiter", "Venus"],
      answer: "Earth"
    },

    {
      q: "Which animal gives us milk?",
      options: ["Cow", "Lion", "Tiger", "Eagle"],
      answer: "Cow"
    },

    {
      q: "What do plants need to grow?",
      options: [
        "Sunlight",
        "Plastic",
        "Toys",
        "Shoes"
      ],
      answer: "Sunlight"
    },

    {
      q: "How many legs does a spider have?",
      options: ["4", "6", "8", "10"],
      answer: "8"
    },

    {
      q: "What do humans breathe?",
      options: ["Water", "Air", "Sand", "Milk"],
      answer: "Air"
    }

  ],


  general: [

    {
      q: "How many days are in a week?",
      options: ["5", "6", "7", "8"],
      answer: "7"
    },

    {
      q: "Which animal is known as the king of the jungle?",
      options: ["Tiger", "Lion", "Elephant", "Bear"],
      answer: "Lion"
    },

    {
      q: "What color do you get by mixing red and yellow?",
      options: ["Green", "Purple", "Orange", "Blue"],
      answer: "Orange"
    },

    {
      q: "Which shape has three sides?",
      options: ["Circle", "Square", "Triangle", "Rectangle"],
      answer: "Triangle"
    },

    {
      q: "Which is the fastest?",
      options: ["Turtle", "Cheetah", "Snail", "Cat"],
      answer: "Cheetah"
    }

  ]

};


/* =========================================
   QUIZ VARIABLES
========================================= */

let currentQuiz = [];
let currentQuestion = 0;
let quizScore = 0;
let currentQuizType = "general";
let isDailyChallenge = false;


/* =========================================
   START QUIZ
========================================= */

function startQuiz(type = "general") {

  isDailyChallenge =
    type === "daily";

  currentQuizType =
    isDailyChallenge
      ? "general"
      : type;

  currentQuiz =
    [...quizData[currentQuizType]];

  shuffleArray(currentQuiz);

  currentQuestion = 0;
  quizScore = 0;

  document
    .getElementById("gameModal")
    .classList.add("show");

  renderQuestion();
}


/* =========================================
   RENDER QUESTION
========================================= */

function renderQuestion() {

  const gameContent =
    document.getElementById("gameContent");

  if (currentQuestion >= currentQuiz.length) {

    showQuizResult();

    return;
  }

  const question =
    currentQuiz[currentQuestion];

  const percentage =
    (currentQuestion / currentQuiz.length) * 100;

  gameContent.innerHTML = `

    <div class="quiz-header">

      <div class="game-big-icon">
        ${getQuizIcon(currentQuizType)}
      </div>

      <h2>
        ${getQuizTitle(currentQuizType)}
      </h2>

      <div class="quiz-progress">
        <div
          class="quiz-progress-fill"
          style="width:${percentage}%"
        ></div>
      </div>

    </div>


    <div class="question-number">
      QUESTION ${currentQuestion + 1}
      OF ${currentQuiz.length}
    </div>


    <div class="question-text">
      ${question.q}
    </div>


    <div class="answers">

      ${question.options.map(option => `

        <button
          class="answer-btn"
          onclick="checkAnswer(this, '${escapeQuotes(option)}')"
        >
          ${option}
        </button>

      `).join("")}

    </div>

  `;
}


/* =========================================
   CHECK ANSWER
========================================= */

function checkAnswer(button, selected) {

  const question =
    currentQuiz[currentQuestion];

  const allButtons =
    document.querySelectorAll(".answer-btn");

  allButtons.forEach(btn => {
    btn.disabled = true;
  });


  if (selected === question.answer) {

    button.classList.add("correct");

    quizScore++;

    addXP(30);

    addCoins(10);

    if (isDailyChallenge) {
      player.dailyProgress =
        Math.min(player.dailyProgress + 1, 5);
    }

    showToast(
      "🎉",
      "Correct! Great job!"
    );

    createConfetti();

  } else {

    button.classList.add("wrong");

    allButtons.forEach(btn => {

      if (
        btn.textContent.trim() ===
        question.answer
      ) {
        btn.classList.add("correct");
      }

    });

    player.hearts =
      Math.max(player.hearts - 1, 0);

    updateUI();
    savePlayer();

    showToast(
      "💡",
      "Almost! Keep trying!"
    );
  }


  setTimeout(() => {

    currentQuestion++;

    renderQuestion();

  }, 1000);
}


/* =========================================
   QUIZ RESULT
========================================= */

function showQuizResult() {

  const total =
    currentQuiz.length;

  const percentage =
    Math.round((quizScore / total) * 100);


  let emoji = "🌱";
  let message =
    "Keep practicing and you will get even better!";


  if (percentage === 100) {

    emoji = "🏆";
    message =
      "Perfect score! You are a WonderKids superstar!";

    addCoins(50);

  } else if (percentage >= 60) {

    emoji = "🌟";
    message =
      "Amazing work! Your brain is getting stronger!";

    addCoins(25);

  } else {

    emoji = "💪";
    message =
      "Good try! Every question helps you learn!";

    addCoins(10);
  }


  if (
    isDailyChallenge &&
    player.dailyProgress >= 5
  ) {

    addCoins(100);

    addXP(100);

    showToast(
      "🏆",
      "Daily challenge completed!"
    );
  }


  updateUI();
  savePlayer();


  document.getElementById("gameContent").innerHTML = `

    <div class="quiz-result">

      <div class="result-emoji">
        ${emoji}
      </div>

      <h2>Quiz Complete!</h2>

      <div class="result-score">
        ${quizScore} / ${total}
      </div>

      <p class="result-message">
        ${message}
      </p>

      <div class="result-reward">
        🪙 Coins earned • ⭐ XP earned
      </div>

      <button
        class="primary-btn full-btn"
        onclick="closeModal('gameModal')"
      >
        Continue Adventure 🚀
      </button>

    </div>

  `;
}


/* =========================================
   QUIZ HELPERS
========================================= */

function getQuizIcon(type) {

  const icons = {
    math: "🔢",
    english: "📚",
    science: "🔬",
    general: "🧠"
  };

  return icons[type] || "🧠";
}


function getQuizTitle(type) {

  const titles = {
    math: "Math Mountain",
    english: "Word Jungle",
    science: "Science Lab",
    general: "Brain Boost"
  };

  return titles[type] || "Brain Boost";
}


/* =========================================
   MEMORY GAME
========================================= */

const memoryEmojis = [
  "🍎",
  "🚀",
  "🐶",
  "🌈",
  "⭐",
  "🦄",
  "🍕",
  "🐼"
];

let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let memoryMoves = 0;
let memoryLocked = false;


function startMemoryGame() {

  memoryCards =
    [...memoryEmojis, ...memoryEmojis];

  shuffleArray(memoryCards);

  flippedCards = [];
  matchedPairs = 0;
  memoryMoves = 0;
  memoryLocked = false;

  document
    .getElementById("gameModal")
    .classList.add("show");

  renderMemoryGame();
}


function renderMemoryGame() {

  document.getElementById("gameContent").innerHTML = `

    <div class="memory-title">

      <div class="game-big-icon">
        🧩
      </div>

      <h2>Memory Match</h2>

      <p>
        Find all the matching pairs!
      </p>

    </div>


    <div class="memory-info">

      <span>
        🎯 Pairs:
        <strong id="memoryPairs">
          0 / ${memoryEmojis.length}
        </strong>
      </span>

      <span>
        🔄 Moves:
        <strong id="memoryMoves">
          0
        </strong>
      </span>

    </div>


    <div class="memory-grid">

      ${memoryCards.map((emoji, index) => `

        <div
          class="memory-card"
          data-index="${index}"
          onclick="flipMemoryCard(${index})"
        >

          <div class="memory-card-inner">

            <div class="memory-front">
              ?
            </div>

            <div class="memory-back">
              ${emoji}
            </div>

          </div>

        </div>

      `).join("")}

    </div>

  `;
}


function flipMemoryCard(index) {

  if (memoryLocked) return;

  const card =
    document.querySelector(
      `.memory-card[data-index="${index}"]`
    );

  if (!card) return;

  if (
    card.classList.contains("flipped") ||
    card.classList.contains("matched")
  ) {
    return;
  }

  card.classList.add("flipped");

  flippedCards.push(index);

  if (flippedCards.length < 2) return;

  memoryMoves++;

  document.getElementById("memoryMoves")
    .textContent = memoryMoves;

  const first =
    flippedCards[0];

  const second =
    flippedCards[1];


  if (
    memoryCards[first] ===
    memoryCards[second]
  ) {

    const firstCard =
      document.querySelector(
        `.memory-card[data-index="${first}"]`
      );

    const secondCard =
      document.querySelector(
        `.memory-card[data-index="${second}"]`
      );

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    matchedPairs++;

    flippedCards = [];

    document.getElementById("memoryPairs")
      .textContent =
      `${matchedPairs} / ${memoryEmojis.length}`;

    addCoins(8);
    addXP(20);

    if (
      matchedPairs === memoryEmojis.length
    ) {

      setTimeout(() => {

        createConfetti();

        document.getElementById("gameContent")
          .innerHTML = `

            <div class="quiz-result">

              <div class="result-emoji">
                🏆
              </div>

              <h2>Memory Master!</h2>

              <div class="result-score">
                ${memoryMoves} Moves
              </div>

              <p class="result-message">
                You found every pair!
                Your memory is super strong.
              </p>

              <div class="result-reward">
                🪙 +64 Coins &nbsp; ⭐ +160 XP
              </div>

              <button
                class="primary-btn full-btn"
                onclick="closeModal('gameModal')"
              >
                Awesome! 🎉
              </button>

            </div>

          `;

      }, 500);
    }

  } else {

    memoryLocked = true;

    setTimeout(() => {

      const firstCard =
        document.querySelector(
          `.memory-card[data-index="${first}"]`
        );

      const secondCard =
        document.querySelector(
          `.memory-card[data-index="${second}"]`
        );

      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");

      flippedCards = [];

      memoryLocked = false;

    }, 700);
  }
}


/* =========================================
   WORD BUILDER
========================================= */

const wordData = [
  {
    word: "APPLE",
    hint: "🍎 A fruit that can be red or green."
  },

  {
    word: "TIGER",
    hint: "🐯 A big striped animal."
  },

  {
    word: "SPACE",
    hint: "🚀 Where astronauts travel."
  },

  {
    word: "HOUSE",
    hint: "🏠 A place where people live."
  },

  {
    word: "WATER",
    hint: "💧 We drink this to stay healthy."
  }
];


let currentWordIndex = 0;
let wordScore = 0;


function startWordGame() {

  currentWordIndex = 0;
  wordScore = 0;

  shuffleArray(wordData);

  document
    .getElementById("gameModal")
    .classList.add("show");

  renderWordGame();
}


function renderWordGame() {

  if (
    currentWordIndex >= wordData.length
  ) {

    finishWordGame();

    return;
  }

  const item =
    wordData[currentWordIndex];

  const scrambled =
    scrambleWord(item.word);


  document.getElementById("gameContent").innerHTML = `

    <div class="word-game-container">

      <div class="word-game-icon">
        🔤
      </div>

      <h2>Word Builder</h2>

      <p>
        Unscramble the letters!
      </p>

      <div class="scrambled-word">
        ${scrambled}
      </div>

      <div class="word-hint">
        💡 ${item.hint}
      </div>

      <input
        id="wordAnswer"
        class="word-input"
        type="text"
        autocomplete="off"
        placeholder="Type the word..."
      >

      <button
        class="word-submit"
        onclick="checkWord()"
      >
        Check Answer ✓
      </button>

      <p
        style="
          margin-top:12px;
          font-size:11px;
          color:#929bb0;
        "
      >
        Word ${currentWordIndex + 1}
        of ${wordData.length}
      </p>

    </div>

  `;


  const input =
    document.getElementById("wordAnswer");

  input.focus();

  input.addEventListener(
    "keydown",
    function(event) {

      if (event.key === "Enter") {
        checkWord();
      }

    }
  );
}


function checkWord() {

  const input =
    document.getElementById("wordAnswer");

  const answer =
    input.value.trim().toUpperCase();

  const correct =
    wordData[currentWordIndex].word;


  if (answer === correct) {

    wordScore++;

    addCoins(15);
    addXP(30);

    showToast(
      "🎉",
      "Correct word!"
    );

    createConfetti();

    currentWordIndex++;

    setTimeout(
      renderWordGame,
      700
    );

  } else {

    input.style.borderColor =
      "var(--pink)";

    showToast(
      "💡",
      "Try again!"
    );

    setTimeout(() => {
      input.style.borderColor =
        "";
    }, 700);
  }
}


function finishWordGame() {

  const total =
    wordData.length;


  document.getElementById("gameContent")
    .innerHTML = `

      <div class="quiz-result">

        <div class="result-emoji">
          🔤
        </div>

        <h2>Word Champion!</h2>

        <div class="result-score">
          ${wordScore} / ${total}
        </div>

        <p class="result-message">
          Fantastic! You built some amazing words.
        </p>

        <div class="result-reward">
          🪙 Great job! Keep learning!
        </div>

        <button
          class="primary-btn full-btn"
          onclick="closeModal('gameModal')"
        >
          Finish 🎉
        </button>

      </div>

    `;

  createConfetti();
}


/* =========================================
   XP & COINS
========================================= */

function addCoins(amount) {

  player.coins += amount;

  updateUI();
  savePlayer();
}


function addXP(amount) {

  player.xp += amount;

  if (player.xp >= 1000) {

    player.xp -= 1000;

    player.level++;

    showToast(
      "🚀",
      "Level Up! You are amazing!"
    );

    createConfetti();
  }

  updateUI();
  savePlayer();
}


/* =========================================
   REWARD MESSAGE
========================================= */

function showRewardMessage() {

  showToast(
    "🪙",
    "Play games and complete lessons to earn coins!"
  );
}


/* =========================================
   VIEW ALL SUBJECTS
========================================= */

function showAllSubjects() {

  showToast(
    "🚀",
    "More learning adventures are coming soon!"
  );
}


/* =========================================
   SCRAMBLE WORD
========================================= */

function scrambleWord(word) {

  let letters =
    word.split("");

  let scrambled =
    word;


  while (
    scrambled === word &&
    word.length > 1
  ) {

    shuffleArray(letters);

    scrambled =
      letters.join("");
  }

  return scrambled;
}


/* =========================================
   SHUFFLE ARRAY
========================================= */

function shuffleArray(array) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      array[i],
      array[j]
    ] =
    [
      array[j],
      array[i]
    ];
  }

  return array;
}


/* =========================================
   ESCAPE
========================================= */

function escapeQuotes(value) {

  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(icon, message) {

  const toast =
    document.getElementById("toast");

  document.getElementById("toastIcon")
    .textContent = icon;

  document.getElementById("toastText")
    .textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 2500);
}


/* =========================================
   CONFETTI
========================================= */

function createConfetti() {

  const symbols = [
    "⭐",
    "✨",
    "🎉",
    "💫",
    "🌟"
  ];

  for (let i = 0; i < 22; i++) {

    const piece =
      document.createElement("div");

    piece.className =
      "confetti";

    piece.textContent =
      symbols[
        Math.floor(
          Math.random() * symbols.length
        )
      ];

    piece.style.left =
      Math.random() * 100 + "vw";

    piece.style.animationDelay =
      Math.random() * 0.4 + "s";

    piece.style.fontSize =
      10 + Math.random() * 12 + "px";

    document.body.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, 3000);
  }
}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadPlayer();

    selectAvatar(player.avatar);

  }
);
