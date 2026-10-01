/* =========================================================
   WONDERKIDS
   Main JavaScript
   No Google Apps Script
   No backend
   Uses browser localStorage only
   ========================================================= */

"use strict";


/* =========================================================
   PLAYER DATA
   ========================================================= */

const defaultPlayer = {
  name: "Young Explorer",
  avatar: "🧒",
  coins: 120,
  hearts: 5,
  xp: 680,
  level: 3,
  streak: 4,
  dailyProgress: 0
};

let player = loadPlayer();

function loadPlayer() {
  try {
    const saved = localStorage.getItem("wonderkids_player");

    if (!saved) {
      return { ...defaultPlayer };
    }

    return {
      ...defaultPlayer,
      ...JSON.parse(saved)
    };

  } catch (error) {
    console.error("Could not load player:", error);
    return { ...defaultPlayer };
  }
}

function savePlayer() {
  localStorage.setItem(
    "wonderkids_player",
    JSON.stringify(player)
  );
}


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => {
  return Array.from(document.querySelectorAll(selector));
};


/* =========================================================
   UPDATE PLAYER UI
   ========================================================= */

function updatePlayerUI() {

  $("#coinCount").textContent = player.coins;
  $("#heartCount").textContent = player.hearts;

  $("#heroName").textContent = player.name;

  $("#levelNumber").textContent = player.level;
  $("#levelText").textContent = player.level;

  $("#streakCount").textContent = player.streak;

  const xpIntoLevel = player.xp % 1000;
  const xpPercent = Math.min(
    100,
    (xpIntoLevel / 1000) * 100
  );

  $("#xpFill").style.width = `${xpPercent}%`;

  $("#xpText").textContent =
    `${xpIntoLevel} / 1000 XP`;

  const dailyPercent =
    Math.min(100, (player.dailyProgress / 3) * 100);

  $("#dailyProgressText").textContent =
    `${Math.round(dailyPercent)}%`;

  $("#challengeFill").style.width =
    `${dailyPercent}%`;

  $("#challengeCount").textContent =
    `${Math.min(player.dailyProgress, 3)} / 3`;

  const avatarButton = $("#profileBtn");

  if (avatarButton) {
    avatarButton.textContent = player.avatar;
  }

  const playerNameInput = $("#playerName");

  if (playerNameInput) {
    playerNameInput.value = player.name;
  }

  updateChallengeButton();
}


function updateChallengeButton() {

  const button = $("#challengeBtn");

  if (!button) return;

  if (player.dailyProgress >= 3) {
    button.textContent = "🎉 Completed!";
    button.disabled = true;
    button.style.opacity = "0.65";
  } else {
    button.textContent = "Start Challenge";
    button.disabled = false;
    button.style.opacity = "1";
  }
}


/* =========================================================
   XP & COINS
   ========================================================= */

function addCoins(amount) {

  player.coins += amount;

  savePlayer();
  updatePlayerUI();

  showToast(
    "🪙",
    `+${amount} coins!`
  );
}


function addXP(amount) {

  const oldLevel = player.level;

  player.xp += amount;

  player.level =
    Math.floor(player.xp / 1000) + 1;

  savePlayer();
  updatePlayerUI();

  showToast(
    "⭐",
    `+${amount} XP!`
  );

  if (player.level > oldLevel) {
    setTimeout(() => {
      showToast(
        "🏆",
        `Level ${player.level} unlocked!`
      );

      createConfetti();
    }, 500);
  }
}


function completeActivity() {

  if (player.dailyProgress < 3) {
    player.dailyProgress++;
  }

  savePlayer();
  updatePlayerUI();
}


/* =========================================================
   PROFILE
   ========================================================= */

function openModal(id) {

  const modal = document.getElementById(id);

  if (!modal) return;

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}


function closeModal(id) {

  const modal = document.getElementById(id);

  if (!modal) return;

  modal.classList.remove("show");

  if (!$(".modal-overlay.show")) {
    document.body.style.overflow = "";
  }
}


$("#profileBtn").addEventListener("click", () => {

  $("#playerName").value = player.name;

  $$(".avatar-option").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.avatar === player.avatar
    );
  });

  openModal("profileModal");
});


$$(".avatar-option").forEach(button => {

  button.addEventListener("click", () => {

    $$(".avatar-option").forEach(btn => {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");

    player.avatar = button.dataset.avatar;
  });

});


$("#saveProfile").addEventListener("click", () => {

  const enteredName =
    $("#playerName").value.trim();

  if (enteredName.length > 0) {
    player.name = enteredName;
  }

  savePlayer();
  updatePlayerUI();
  closeModal("profileModal");

  showToast(
    "✨",
    "Profile saved!"
  );
});


$$("[data-close]").forEach(button => {

  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });

});


$$(".modal-overlay").forEach(overlay => {

  overlay.addEventListener("click", (event) => {

    if (event.target === overlay) {
      closeModal(overlay.id);
    }

  });

});


document.addEventListener("keydown", (event) => {

  if (event.key === "Escape") {

    $$(".modal-overlay.show").forEach(modal => {
      closeModal(modal.id);
    });

  }

});


/* =========================================================
   NAVIGATION
   ========================================================= */

$$(".nav-link").forEach(link => {

  link.addEventListener("click", () => {

    $$(".nav-link").forEach(item => {
      item.classList.remove("active");
    });

    link.classList.add("active");

  });

});


/* =========================================================
   QUIZ DATA
   ========================================================= */

const quizData = {

  math: [
    {
      question: "What is 5 + 3?",
      options: ["6", "7", "8", "9"],
      answer: 2
    },

    {
      question: "What is 10 - 4?",
      options: ["4", "5", "6", "7"],
      answer: 2
    },

    {
      question: "Which number is bigger?",
      options: ["3", "7", "5", "2"],
      answer: 1
    },

    {
      question: "What is 2 × 4?",
      options: ["6", "7", "8", "9"],
      answer: 2
    },

    {
      question: "How many sides does a triangle have?",
      options: ["2", "3", "4", "5"],
      answer: 1
    }
  ],


  english: [
    {
      question: "Which word is a color?",
      options: ["Apple", "Blue", "Dog", "Run"],
      answer: 1
    },

    {
      question: "Which one is an animal?",
      options: ["Table", "Tiger", "Chair", "Book"],
      answer: 1
    },

    {
      question: "What is the opposite of BIG?",
      options: ["Tall", "Small", "Fast", "Happy"],
      answer: 1
    },

    {
      question: "Which word rhymes with CAT?",
      options: ["Dog", "Hat", "Sun", "Tree"],
      answer: 1
    },

    {
      question: "Which word starts with B?",
      options: ["Apple", "Banana", "Orange", "Elephant"],
      answer: 1
    }
  ],


  science: [
    {
      question: "Which planet do we live on?",
      options: ["Mars", "Earth", "Jupiter", "Venus"],
      answer: 1
    },

    {
      question: "What gives us light during the day?",
      options: ["Moon", "Stars", "Sun", "Cloud"],
      answer: 2
    },

    {
      question: "Which animal can fly?",
      options: ["Fish", "Bird", "Dog", "Horse"],
      answer: 1
    },

    {
      question: "What do plants need to grow?",
      options: ["Water", "Shoes", "Toys", "Cars"],
      answer: 0
    },

    {
      question: "Which one lives in water?",
      options: ["Fish", "Cat", "Cow", "Lion"],
      answer: 0
    }
  ],


  general: [
    {
      question: "How many days are in a week?",
      options: ["5", "6", "7", "8"],
      answer: 2
    },

    {
      question: "Which shape is round?",
      options: ["Square", "Triangle", "Circle", "Rectangle"],
      answer: 2
    },

    {
      question: "Which one is used for writing?",
      options: ["Pencil", "Spoon", "Ball", "Shoe"],
      answer: 0
    },

    {
      question: "What color is grass usually?",
      options: ["Green", "Purple", "Pink", "Black"],
      answer: 0
    },

    {
      question: "Which one is a fruit?",
      options: ["Carrot", "Apple", "Potato", "Onion"],
      answer: 1
    }
  ]

};


let currentQuiz = [];
let currentQuizIndex = 0;
let quizScore = 0;
let quizAnswered = false;


/* =========================================================
   OPEN SUBJECT QUIZ
   ========================================================= */

$$("[data-quiz]").forEach(button => {

  button.addEventListener("click", () => {

    const category = button.dataset.quiz;

    startQuiz(category);

  });

});


function startQuiz(category) {

  currentQuiz =
    [...(quizData[category] || quizData.general)];

  currentQuizIndex = 0;
  quizScore = 0;
  quizAnswered = false;

  renderQuiz(category);

  openModal("gameModal");

}


function renderQuiz(category) {

  const question =
    currentQuiz[currentQuizIndex];

  if (!question) {
    showQuizResult(category);
    return;
  }

  $("#gameContent").innerHTML = `

    <div class="quiz-top">

      <span class="quiz-category">
        ${category.toUpperCase()} QUIZ
      </span>

      <span class="quiz-progress">
        ${currentQuizIndex + 1} / ${currentQuiz.length}
      </span>

    </div>

    <h2 class="quiz-question">
      ${question.question}
    </h2>

    <div class="quiz-options">

      ${question.options.map((option, index) => `

        <button
          class="quiz-option"
          data-option="${index}"
        >
          ${option}
        </button>

      `).join("")}

    </div>

  `;


  $$(".quiz-option").forEach(button => {

    button.addEventListener("click", () => {

      checkQuizAnswer(
        Number(button.dataset.option),
        category
      );

    });

  });

}


function checkQuizAnswer(selected, category) {

  if (quizAnswered) return;

  quizAnswered = true;

  const question =
    currentQuiz[currentQuizIndex];

  const buttons =
    $$(".quiz-option");

  buttons.forEach(button => {
    button.disabled = true;
  });


  if (selected === question.answer) {

    quizScore++;

    buttons[selected].classList.add("correct");

    showToast(
      "🎉",
      "Correct answer!"
    );

  } else {

    buttons[selected].classList.add("wrong");

    buttons[question.answer].classList.add("correct");

    showToast(
      "💡",
      "Good try!"
    );

  }


  setTimeout(() => {

    currentQuizIndex++;
    quizAnswered = false;

    renderQuiz(category);

  }, 800);

}


function showQuizResult(category) {

  const earnedCoins =
    quizScore * 6;

  const earnedXP =
    quizScore * 15;

  $("#gameContent").innerHTML = `

    <div class="quiz-result">

      <div class="result-emoji">
        ${quizScore >= 4 ? "🏆" : "🌟"}
      </div>

      <h2>Quiz Complete!</h2>

      <div class="result-score">
        ${quizScore}/${currentQuiz.length}
      </div>

      <p class="result-message">
        ${getQuizMessage(quizScore)}
      </p>

      <div style="margin-top:20px; color:#77809c;">
        🪙 +${earnedCoins} coins
        <br>
        ⭐ +${earnedXP} XP
      </div>

      <button
        id="quizDone"
        class="btn btn-primary full-btn"
      >
        Awesome!
      </button>

    </div>

  `;


  addCoins(earnedCoins);
  addXP(earnedXP);
  completeActivity();

  createConfetti();


  $("#quizDone").addEventListener(
    "click",
    () => closeModal("gameModal")
  );

}


function getQuizMessage(score) {

  if (score === 5) {
    return "Amazing! You're a superstar! 🌟";
  }

  if (score >= 4) {
    return "Fantastic work! Keep going! 🚀";
  }

  if (score >= 2) {
    return "Nice try! Practice makes you stronger! 💪";
  }

  return "Great effort! Let's try again! 😊";
}


/* =========================================================
   QUICK QUIZ GAME
   ========================================================= */

$$("[data-game='quiz']").forEach(button => {

  button.addEventListener("click", () => {
    startQuiz("general");
  });

});


/* =========================================================
   MEMORY GAME
   ========================================================= */

let memoryFirst = null;
let memorySecond = null;
let memoryLock = false;
let memoryMatches = 0;

const memorySymbols = [
  "🍎",
  "⭐",
  "🚀",
  "🐼",
  "🌈",
  "🦄"
];


$$("[data-game='memory']").forEach(button => {

  button.addEventListener("click", () => {
    startMemoryGame();
  });

});


function startMemoryGame() {

  const cards =
    [...memorySymbols, ...memorySymbols]
      .sort(() => Math.random() - 0.5);

  memoryFirst = null;
  memorySecond = null;
  memoryLock = false;
  memoryMatches = 0;

  $("#gameContent").innerHTML = `

    <div class="quiz-top">

      <span class="quiz-category">
        MEMORY MATCH
      </span>

      <span class="quiz-progress">
        Find all pairs
      </span>

    </div>

    <h2 class="quiz-question">
      Match the same pictures! 🧠
    </h2>

    <div class="memory-grid">

      ${cards.map((symbol, index) => `

        <button
          class="memory-tile"
          data-index="${index}"
          data-symbol="${symbol}"
        >
          ?
        </button>

      `).join("")}

    </div>

    <div class="memory-info">
      <span>
        Matches: <strong id="memoryMatches">0</strong> / 6
      </span>

      <span>
        🪙 Win 20 coins
      </span>
    </div>

  `;


  $$(".memory-tile").forEach(tile => {

    tile.addEventListener(
      "click",
      () => flipMemoryTile(tile)
    );

  });


  openModal("gameModal");
}


function flipMemoryTile(tile) {

  if (memoryLock) return;

  if (tile.classList.contains("flipped")) return;

  if (tile.classList.contains("matched")) return;


  tile.classList.add("flipped");

  tile.textContent =
    tile.dataset.symbol;


  if (!memoryFirst) {

    memoryFirst = tile;
    return;

  }


  memorySecond = tile;

  memoryLock = true;


  if (
    memoryFirst.dataset.symbol ===
    memorySecond.dataset.symbol
  ) {

    memoryFirst.classList.add("matched");
    memorySecond.classList.add("matched");

    memoryMatches++;

    $("#memoryMatches").textContent =
      memoryMatches;

    memoryFirst = null;
    memorySecond = null;
    memoryLock = false;


    if (memoryMatches === 6) {

      setTimeout(() => {

        addCoins(20);
        addXP(30);
        completeActivity();

        createConfetti();

        $("#gameContent").innerHTML = `

          <div class="quiz-result">

            <div class="result-emoji">
              🧠
            </div>

            <h2>Memory Master!</h2>

            <p class="result-message">
              You matched every pair!
            </p>

            <p style="margin-top:15px;color:#77809c;">
              🪙 +20 coins<br>
              ⭐ +30 XP
            </p>

            <button
              id="memoryDone"
              class="btn btn-primary full-btn"
            >
              Awesome!
            </button>

          </div>

        `;


        $("#memoryDone").addEventListener(
          "click",
          () => closeModal("gameModal")
        );

      }, 500);

    }

    return;

  }


  setTimeout(() => {

    memoryFirst.classList.remove("flipped");
    memorySecond.classList.remove("flipped");

    memoryFirst.textContent = "?";
    memorySecond.textContent = "?";

    memoryFirst = null;
    memorySecond = null;
    memoryLock = false;

  }, 750);

}


/* =========================================================
   WORD BUILDER
   ========================================================= */

const wordList = [
  "STAR",
  "TREE",
  "BOOK",
  "MOON",
  "FISH"
];

let currentWord = "";
let selectedLetters = [];


$$("[data-game='word']").forEach(button => {

  button.addEventListener("click", () => {
    startWordGame();
  });

});


function startWordGame() {

  currentWord =
    wordList[
      Math.floor(
        Math.random() * wordList.length
      )
    ];

  selectedLetters = [];

  const letters =
    currentWord
      .split("")
      .sort(() => Math.random() - 0.5);


  $("#gameContent").innerHTML = `

    <div class="quiz-top">

      <span class="quiz-category">
        WORD BUILDER
      </span>

      <span class="quiz-progress">
        Build the word
      </span>

    </div>

    <h2 class="quiz-question">
      Put the letters in the correct order!
    </h2>

    <div class="word-target">
      <span>
        ${"_".repeat(currentWord.length)}
      </span>
    </div>

    <div class="word-current" id="wordCurrent">
      _
    </div>

    <div class="letter-grid">

      ${letters.map((letter, index) => `

        <button
          class="letter-btn"
          data-letter="${letter}"
          data-letter-id="${index}"
        >
          ${letter}
        </button>

      `).join("")}

    </div>

    <button
      id="clearWord"
      class="btn btn-secondary full-btn"
    >
      Clear
    </button>

  `;


  $$(".letter-btn").forEach(button => {

    button.addEventListener("click", () => {

      if (
        button.disabled ||
        selectedLetters.length >= currentWord.length
      ) {
        return;
      }

      selectedLetters.push(button.dataset.letter);

      button.disabled = true;

      updateCurrentWord();


      if (
        selectedLetters.length ===
        currentWord.length
      ) {

        setTimeout(checkWord, 300);

      }

    });

  });


  $("#clearWord").addEventListener(
    "click",
    () => {

      selectedLetters = [];

      $$(".letter-btn").forEach(button => {
        button.disabled = false;
      });

      updateCurrentWord();

    }
  );


  openModal("gameModal");
}


function updateCurrentWord() {

  const current =
    selectedLetters.length
      ? selectedLetters.join("")
      : "_";

  $("#wordCurrent").textContent = current;
}


function checkWord() {

  const answer =
    selectedLetters.join("");

  if (answer === currentWord) {

    addCoins(25);
    addXP(25);
    completeActivity();

    createConfetti();

    $("#gameContent").innerHTML = `

      <div class="quiz-result">

        <div class="result-emoji">
          🎉
        </div>

        <h2>Great Word!</h2>

        <p style="
          font-size:30px;
          font-weight:800;
          color:#6c63ff;
          margin-top:10px;
        ">
          ${currentWord}
        </p>

        <p class="result-message">
          You built the word correctly!
        </p>

        <p style="margin-top:15px;color:#77809c;">
          🪙 +25 coins<br>
          ⭐ +25 XP
        </p>

        <button
          id="wordDone"
          class="btn btn-primary full-btn"
        >
          Awesome!
        </button>

      </div>

    `;


    $("#wordDone").addEventListener(
      "click",
      () => closeModal("gameModal")
    );

  } else {

    showToast(
      "💡",
      "Almost! Try another word."
    );

    selectedLetters = [];

    $$(".letter-btn").forEach(button => {
      button.disabled = false;
    });

    updateCurrentWord();

  }

}


/* =========================================================
   DAILY CHALLENGE
   ========================================================= */

$("#challengeBtn").addEventListener(
  "click",
  () => {

    if (player.dailyProgress >= 3) {
      return;
    }

    startQuiz("general");

  }
);


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;

function showToast(icon, message) {

  const toast = $("#toast");

  $("#toastIcon").textContent = icon;
  $("#toastMessage").textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2200);
}


/* =========================================================
   CONFETTI
   ========================================================= */

function createConfetti() {

  const pieces = 35;

  for (let i = 0; i < pieces; i++) {

    const piece =
      document.createElement("div");

    piece.className = "confetti";

    piece.style.left =
      `${Math.random() * 100}%`;

    piece.style.animationDelay =
      `${Math.random() * 0.4}s`;

    piece.style.transform =
      `rotate(${Math.random() * 360}deg)`;

    const colors = [
      "#6c63ff",
      "#ff6fae",
      "#ffc928",
      "#39c98a",
      "#48aaf5",
      "#ff8b3d"
    ];

    piece.style.background =
      colors[
        Math.floor(Math.random() * colors.length)
      ];

    document.body.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, 2200);

  }

}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initialize() {

  updatePlayerUI();

  const selectedAvatar =
    $$(".avatar-option").find(
      button =>
        button.dataset.avatar === player.avatar
    );

  if (selectedAvatar) {
    selectedAvatar.classList.add("selected");
  }

}

initialize();
