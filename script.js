"use strict";

/* =========================================================
   WONDERKIDS — MAIN APP
========================================================= */

const STORAGE_KEY = "wonderkids_player_v2";

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

let selectedAvatar = player.avatar;

let currentQuiz = null;
let currentQuizIndex = 0;
let currentQuizScore = 0;

let memoryCards = [];
let memoryFirst = null;
let memorySecond = null;
let memoryLocked = false;
let memoryMatches = 0;

let currentWord = "";
let selectedLetters = [];


/* =========================================================
   HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];


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

    console.warn("Could not load player:", error);

    return { ...defaultPlayer };
  }
}


function savePlayer() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(player)
  );
}


/* =========================================================
   PLAYER UI
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
    Math.round((xpIntoLevel / 1000) * 100)
  );

  $("#xpFill").style.width = `${xpPercent}%`;

  $("#xpText").textContent =
    `${xpIntoLevel} / 1000 XP`;

  const dailyPercent =
    Math.min(100, Math.round((player.dailyProgress / 3) * 100));

  $("#dailyProgressText").textContent =
    `${dailyPercent}%`;

  $("#challengeFill").style.width =
    `${dailyPercent}%`;

  $("#challengeCount").textContent =
    `${Math.min(player.dailyProgress, 3)} / 3`;

  $("#profileBtn").textContent =
    player.avatar;

  updateChallengeButton();
  updateBadges();

  savePlayer();
}


function updateChallengeButton() {

  const button = $("#challengeBtn");

  if (player.dailyProgress >= 3) {

    button.textContent = "🎉 Completed!";

    button.disabled = true;

    button.style.opacity = ".7";

  } else {

    button.textContent = "Start Mission";

    button.disabled = false;

    button.style.opacity = "1";
  }
}


function updateBadges() {

  const brainBadge = $("#brainMasterBadge");
  const wonderBadge = $("#wonderKidBadge");

  if (player.quizQuestions >= 20) {

    player.badges.brainMaster = true;

    brainBadge.classList.add("unlocked");

    brainBadge.querySelector("span").textContent =
      "✓ Unlocked";

  }

  if (player.level >= 10) {

    player.badges.wonderKid = true;

    wonderBadge.classList.add("unlocked");

    wonderBadge.querySelector("span").textContent =
      "✓ Unlocked";
  }
}


/* =========================================================
   REWARDS
========================================================= */

function addCoins(amount) {

  player.coins += amount;

  showToast(
    "🪙",
    `+${amount} coins!`
  );

  updatePlayerUI();
}


function addXP(amount) {

  player.xp += amount;

  const calculatedLevel =
    Math.floor(player.xp / 1000) + 1;

  if (calculatedLevel > player.level) {

    player.level = calculatedLevel;

    showToast(
      "🎊",
      `LEVEL UP! You are now Level ${player.level}!`
    );

    createConfetti();
  }

  updatePlayerUI();
}


function completeActivity() {

  player.completedActivities++;

  if (player.dailyProgress < 3) {

    player.dailyProgress++;

    if (player.dailyProgress === 3 &&
        !player.dailyRewardClaimed) {

      player.dailyRewardClaimed = true;

      player.coins += 50;

      setTimeout(() => {

        showToast(
          "🎯",
          "Daily Mission Complete! +50 coins!"
        );

        createConfetti();

      }, 400);
    }
  }

  updatePlayerUI();
}


/* =========================================================
   PROFILE
========================================================= */

function openProfile() {

  $("#playerName").value =
    player.name;

  selectedAvatar =
    player.avatar;

  $$(".avatar-option").forEach(button => {

    button.classList.toggle(
      "selected",
      button.dataset.avatar === selectedAvatar
    );

  });

  openModal("profileModal");
}


function saveProfile() {

  const name =
    $("#playerName").value.trim();

  player.name =
    name || "Young Explorer";

  player.avatar =
    selectedAvatar;

  savePlayer();

  updatePlayerUI();

  closeModal("profileModal");

  showToast(
    "💖",
    "Profile saved!"
  );
}


$("#profileBtn").addEventListener(
  "click",
  openProfile
);


$$(".avatar-option").forEach(button => {

  button.addEventListener("click", () => {

    selectedAvatar =
      button.dataset.avatar;

    $$(".avatar-option").forEach(item => {

      item.classList.remove("selected");

    });

    button.classList.add("selected");
  });

});


$("#saveProfile").addEventListener(
  "click",
  saveProfile
);


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

  const modal = $(`#${id}`);

  if (!modal) return;

  modal.classList.add("open");

  document.body.style.overflow = "hidden";
}


function closeModal(id) {

  const modal = $(`#${id}`);

  if (!modal) return;

  modal.classList.remove("open");

  document.body.style.overflow = "";
}


$$("[data-close]").forEach(button => {

  button.addEventListener("click", () => {

    closeModal(
      button.dataset.close
    );

  });

});


$$(".modal-overlay").forEach(overlay => {

  overlay.addEventListener("click", event => {

    if (event.target === overlay) {

      closeModal(overlay.id);
    }

  });

});


document.addEventListener("keydown", event => {

  if (event.key === "Escape") {

    $$(".modal-overlay.open").forEach(modal => {

      closeModal(modal.id);

    });

  }

});


/* =========================================================
   NAVIGATION
========================================================= */

$$(".nav-link").forEach(link => {

  link.addEventListener("click", () => {

    $$(".nav-link").forEach(item =>
      item.classList.remove("active")
    );

    link.classList.add("active");

  });

});


/* =========================================================
   QUIZ DATA
========================================================= */

const quizData = {

  math: [

    {
      q: "What is 5 + 3?",
      options: ["6", "7", "8", "9"],
      answer: 2
    },

    {
      q: "What is 10 - 4?",
      options: ["5", "6", "7", "8"],
      answer: 1
    },

    {
      q: "What is 3 × 4?",
      options: ["7", "10", "12", "14"],
      answer: 2
    },

    {
      q: "What is 20 ÷ 5?",
      options: ["2", "3", "4", "5"],
      answer: 2
    },

    {
      q: "Which number is bigger?",
      options: ["12", "21", "15", "18"],
      answer: 1
    }

  ],


  english: [

    {
      q: "Which word is an animal?",
      options: ["Apple", "Tiger", "Chair", "Blue"],
      answer: 1
    },

    {
      q: "Which letter comes after C?",
      options: ["A", "B", "D", "E"],
      answer: 2
    },

    {
      q: "What is the opposite of HOT?",
      options: ["Warm", "Cold", "Big", "Fast"],
      answer: 1
    },

    {
      q: "Which word is spelled correctly?",
      options: ["Appl", "Aple", "Apple", "Appel"],
      answer: 2
    },

    {
      q: "Which one is a color?",
      options: ["Jump", "Purple", "Run", "Book"],
      answer: 1
    }

  ],


  science: [

    {
      q: "Which animal says 'Moo'?",
      options: ["Cat", "Cow", "Dog", "Lion"],
      answer: 1
    },

    {
      q: "Which planet do we live on?",
      options: ["Mars", "Earth", "Jupiter", "Venus"],
      answer: 1
    },

    {
      q: "What do plants need to grow?",
      options: ["Sunlight", "Shoes", "Toys", "Books"],
      answer: 0
    },

    {
      q: "How many legs does a spider have?",
      options: ["4", "6", "8", "10"],
      answer: 2
    },

    {
      q: "Which one is a star?",
      options: ["Moon", "Sun", "Earth", "Mars"],
      answer: 1
    }

  ],


  general: [

    {
      q: "How many days are in a week?",
      options: ["5", "6", "7", "8"],
      answer: 2
    },

    {
      q: "Which animal is known as the king of the jungle?",
      options: ["Lion", "Rabbit", "Horse", "Duck"],
      answer: 0
    },

    {
      q: "What color is the sky on a clear day?",
      options: ["Green", "Blue", "Pink", "Orange"],
      answer: 1
    },

    {
      q: "Which fruit is usually yellow?",
      options: ["Banana", "Apple", "Grape", "Blueberry"],
      answer: 0
    },

    {
      q: "How many wheels does a bicycle have?",
      options: ["1", "2", "3", "4"],
      answer: 1
    }

  ]

};


/* =========================================================
   QUIZ
========================================================= */

function startQuiz(category) {

  currentQuiz =
    quizData[category] || quizData.general;

  currentQuizIndex = 0;
  currentQuizScore = 0;

  renderQuiz(category);

  openModal("gameModal");
}


function renderQuiz(category) {

  const question =
    currentQuiz[currentQuizIndex];

  const progress =
    ((currentQuizIndex + 1) /
    currentQuiz.length) * 100;

  $("#gameContent").innerHTML = `

    <div class="quiz-header">

      <div class="game-emoji">🧠</div>

      <h2>${capitalize(category)} Quiz</h2>

      <div class="quiz-progress">
        <div
          class="quiz-progress-fill"
          style="width:${progress}%">
        </div>
      </div>

      <small>
        Question ${currentQuizIndex + 1}
        of ${currentQuiz.length}
      </small>

    </div>

    <div class="quiz-question">
      ${question.q}
    </div>

    <div class="quiz-options">

      ${question.options.map((option,index) => `

        <button
          class="quiz-option"
          data-index="${index}">

          ${option}

        </button>

      `).join("")}

    </div>
  `;


  $$(".quiz-option").forEach(button => {

    button.addEventListener(
      "click",
      () => checkQuizAnswer(
        Number(button.dataset.index)
      )
    );

  });
}


function checkQuizAnswer(index) {

  const question =
    currentQuiz[currentQuizIndex];

  const buttons =
    $$(".quiz-option");

  buttons.forEach(button =>
    button.disabled = true
  );


  if (index === question.answer) {

    buttons[index].classList.add("correct");

    currentQuizScore++;

    showToast(
      "🎉",
      "Amazing! Correct answer!"
    );

  } else {

    buttons[index].classList.add("wrong");

    buttons[question.answer]
      .classList.add("correct");

    showToast(
      "💡",
      "Almost! Keep trying!"
    );
  }


  setTimeout(() => {

    currentQuizIndex++;

    if (
      currentQuizIndex >=
      currentQuiz.length
    ) {

      showQuizResult();

    } else {

      renderQuiz(
        findCurrentCategory()
      );

    }

  }, 750);
}


function findCurrentCategory() {

  for (const category in quizData) {

    if (quizData[category] === currentQuiz) {
      return category;
    }

  }

  return "general";
}


function showQuizResult() {

  const total =
    currentQuiz.length;

  const score =
    currentQuizScore;

  const coins =
    score * 6;

  const xp =
    score * 12;

  player.quizQuestions += total;

  addCoins(coins);
  addXP(xp);

  completeActivity();

  const percentage =
    Math.round((score / total) * 100);

  let emoji = "🌟";
  let message = "Great effort!";

  if (percentage >= 80) {

    emoji = "🏆";
    message = "AMAZING! You are a WonderKid!";

  } else if (percentage >= 50) {

    emoji = "🎉";
    message = "Great job! Keep learning!";

  } else {

    emoji = "💡";
    message = "Keep trying! You are learning!";
  }


  $("#gameContent").innerHTML = `

    <div class="quiz-result">

      <div class="result-emoji">
        ${emoji}
      </div>

      <h2>${message}</h2>

      <div class="result-score">
        ${score}/${total}
      </div>

      <p>
        You got ${percentage}% correct!
      </p>

      <div class="result-rewards">

        <span class="reward-pill">
          🪙 +${coins} Coins
        </span>

        <span class="reward-pill">
          ⭐ +${xp} XP
        </span>

      </div>

      <button
        class="btn btn-primary full-btn"
        id="quizDone">

        Continue 🚀

      </button>

    </div>
  `;


  $("#quizDone").addEventListener(
    "click",
    () => closeModal("gameModal")
  );

  createConfetti();
}


function getQuizMessage(score,total) {

  const percentage =
    (score / total) * 100;

  if (percentage >= 80)
    return "Amazing!";

  if (percentage >= 50)
    return "Great job!";

  return "Keep trying!";
}


function capitalize(value) {

  return value.charAt(0).toUpperCase() +
    value.slice(1);
}


/* =========================================================
   SUBJECT BUTTONS
========================================================= */

$$("[data-quiz]").forEach(button => {

  button.addEventListener("click", () => {

    startQuiz(
      button.dataset.quiz
    );

  });

});


/* =========================================================
   QUICK QUIZ
========================================================= */

$$("[data-game='quiz']").forEach(button => {

  button.addEventListener("click", () => {

    startQuiz("general");

  });

});


/* =========================================================
   MEMORY MATCH
========================================================= */

function startMemoryGame() {

  const symbols = [
    "🍎",
    "⭐",
    "🚀",
    "🐼",
    "🌈",
    "🦄"
  ];

  memoryCards =
    [...symbols,...symbols]
      .sort(() => Math.random() - .5);

  memoryFirst = null;
  memorySecond = null;
  memoryLocked = false;
  memoryMatches = 0;

  renderMemoryGame();

  openModal("gameModal");
}


function renderMemoryGame() {

  $("#gameContent").innerHTML = `

    <div class="memory-title">

      <div class="game-emoji">🧠</div>

      <h2>Memory Match</h2>

      <p>
        Find all matching pairs!
      </p>

    </div>

    <div class="memory-board">

      ${memoryCards.map((symbol,index) => `

        <button
          class="memory-card"
          data-index="${index}">

          <span class="back">?</span>

          <span class="front">
            ${symbol}
          </span>

        </button>

      `).join("")}

    </div>

  `;


  $$(".memory-card").forEach(card => {

    card.addEventListener(
      "click",
      () => flipMemoryCard(
        Number(card.dataset.index)
      )
    );

  });
}


function flipMemoryCard(index) {

  if (memoryLocked) return;

  const card =
    $(`.memory-card[data-index="${index}"]`);

  if (!card) return;

  if (
    card.classList.contains("flipped") ||
    card.classList.contains("matched")
  ) {
    return;
  }


  card.classList.add("flipped");

  if (memoryFirst === null) {

    memoryFirst = index;
    return;
  }


  memorySecond = index;

  memoryLocked = true;

  const firstCard =
    $(`.memory-card[data-index="${memoryFirst}"]`);

  const secondCard =
    $(`.memory-card[data-index="${memorySecond}"]`);


  if (
    memoryCards[memoryFirst] ===
    memoryCards[memorySecond]
  ) {

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    memoryMatches++;

    memoryFirst = null;
    memorySecond = null;
    memoryLocked = false;


    if (memoryMatches === 6) {

      setTimeout(() => {

        addCoins(20);
        addXP(30);
        completeActivity();

        $("#gameContent").innerHTML = `

          <div class="quiz-result">

            <div class="result-emoji">
              🏆
            </div>

            <h2>Memory Master!</h2>

            <p>
              You found every pair!
            </p>

            <div class="result-rewards">

              <span class="reward-pill">
                🪙 +20 Coins
              </span>

              <span class="reward-pill">
                ⭐ +30 XP
              </span>

            </div>

            <button
              class="btn btn-primary full-btn"
              id="memoryDone">

              Awesome! 🎉

            </button>

          </div>

        `;

        $("#memoryDone").onclick =
          () => closeModal("gameModal");

        createConfetti();

      },500);
    }

  } else {

    setTimeout(() => {

      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");

      memoryFirst = null;
      memorySecond = null;
      memoryLocked = false;

    },700);
  }
}


$("[data-game='memory']")
  .addEventListener(
    "click",
    startMemoryGame
  );


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

  openModal("gameModal");
}


function renderWordGame() {

  const letters =
    currentWord
      .split("")
      .sort(() => Math.random() - .5);


  $("#gameContent").innerHTML = `

    <div class="word-game">

      <div class="game-emoji">
        🔤
      </div>

      <h2>Word Builder</h2>

      <p class="word-target">
        Build this word:
        <strong>${currentWord}</strong>
      </p>

      <div class="word-slots">

        ${currentWord
          .split("")
          .map(() => `
            <div class="word-slot"></div>
          `)
          .join("")}

      </div>

      <div class="letter-bank">

        ${letters.map((letter,index) => `

          <button
            class="letter-button"
            data-letter="${letter}"
            data-letter-id="${index}">

            ${letter}

          </button>

        `).join("")}

      </div>

    </div>
  `;


  $$(".letter-button").forEach(button => {

    button.addEventListener(
      "click",
      () => chooseLetter(button)
    );

  });

}


function chooseLetter(button) {

  if (
    button.classList.contains("used")
  ) return;

  selectedLetters.push(
    button.dataset.letter
  );

  button.classList.add("used");

  const slots =
    $$(".word-slot");

  const index =
    selectedLetters.length - 1;

  slots[index].textContent =
    button.dataset.letter;


  if (
    selectedLetters.join("") ===
    currentWord
  ) {

    setTimeout(() => {

      addCoins(25);
      addXP(25);
      completeActivity();

      $("#gameContent").innerHTML = `

        <div class="quiz-result">

          <div class="result-emoji">
            🎉
          </div>

          <h2>Awesome Word!</h2>

          <p>
            You built
            <strong>${currentWord}</strong>
            correctly!
          </p>

          <div class="result-rewards">

            <span class="reward-pill">
              🪙 +25 Coins
            </span>

            <span class="reward-pill">
              ⭐ +25 XP
            </span>

          </div>

          <button
            class="btn btn-primary full-btn"
            id="wordDone">

            Great! 🌟

          </button>

        </div>

      `;

      $("#wordDone").onclick =
        () => closeModal("gameModal");

      createConfetti();

    },400);
  }
}


$("[data-game='word']")
  .addEventListener(
    "click",
    startWordGame
  );


/* =========================================================
   MATH CHALLENGE
========================================================= */

function startMathGame() {

  const a =
    Math.floor(Math.random() * 10) + 1;

  const b =
    Math.floor(Math.random() * 10) + 1;

  const answer = a + b;

  const options = [
    answer,
    answer + 1,
    Math.max(1, answer - 2),
    answer + 3
  ].sort(() => Math.random() - .5);


  $("#gameContent").innerHTML = `

    <div class="simple-game">

      <div class="game-emoji">
        ➕
      </div>

      <h2>Math Challenge</h2>

      <p>Solve the problem!</p>

      <div class="simple-question">
        ${a} + ${b} = ?
      </div>

      <div class="simple-options">

        ${options.map(option => `

          <button
            class="simple-option"
            data-answer="${option}">

            ${option}

          </button>

        `).join("")}

      </div>

    </div>
  `;


  $$(".simple-option").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const selected =
          Number(button.dataset.answer);

        if (selected === answer) {

          addCoins(30);
          addXP(25);
          completeActivity();

          showSimpleSuccess(
            "Math Star! 🎉",
            "+30 Coins • +25 XP"
          );

        } else {

          showToast(
            "💡",
            "Almost! Try another one!"
          );

          button.disabled = true;
          button.style.opacity = ".5";
        }

      }
    );

  });

}


function showSimpleSuccess(title,reward) {

  $("#gameContent").innerHTML = `

    <div class="quiz-result">

      <div class="result-emoji">
        🌟
      </div>

      <h2>${title}</h2>

      <p>Correct answer!</p>

      <div class="result-rewards">

        <span class="reward-pill">
          ${reward}
        </span>

      </div>

      <button
        class="btn btn-primary full-btn"
        id="simpleDone">

        Continue 🚀

      </button>

    </div>

  `;

  $("#simpleDone").onclick =
    () => closeModal("gameModal");

  createConfetti();
}


$("[data-game='mathgame']")
  .addEventListener(
    "click",
    startMathGame
  );


/* =========================================================
   COLOR GAME
========================================================= */

function startColorGame() {

  const colors = [
    {
      name: "Red",
      emoji: "🔴"
    },
    {
      name: "Green",
      emoji: "🟢"
    },
    {
      name: "Blue",
      emoji: "🔵"
    },
    {
      name: "Yellow",
      emoji: "🟡"
    }
  ];


  const target =
    colors[
      Math.floor(
        Math.random() *
        colors.length
      )
    ];


  const options =
    [...colors]
      .sort(() => Math.random() - .5);


  $("#gameContent").innerHTML = `

    <div class="simple-game">

      <div class="game-emoji">
        🎨
      </div>

      <h2>Color Game</h2>

      <p>
        Find the
        <strong>${target.name}</strong>
        color!
      </p>

      <div class="simple-question">
        ${target.emoji}
      </div>

      <div class="simple-options">

        ${options.map(color => `

          <button
            class="simple-option"
            data-color="${color.name}">

            ${color.emoji}
            ${color.name}

          </button>

        `).join("")}

      </div>

    </div>

  `;


  $$(".simple-option").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        if (
          button.dataset.color ===
          target.name
        ) {

          addCoins(20);
          addXP(20);
          completeActivity();

          showSimpleSuccess(
            "Color Champion! 🌈",
            "+20 Coins • +20 XP"
          );

        } else {

          button.disabled = true;

          showToast(
            "💡",
            "Try again!"
          );

        }

      }
    );

  });

}


$("[data-game='color']")
  .addEventListener(
    "click",
    startColorGame
  );


/* =========================================================
   NUMBER HUNT
========================================================= */

function startNumberGame() {

  const answer =
    Math.floor(Math.random() * 9) + 1;

  const options = [
    answer,
    Math.floor(Math.random() * 9) + 1,
    Math.floor(Math.random() * 9) + 1,
    Math.floor(Math.random() * 9) + 1
  ];


  $("#gameContent").innerHTML = `

    <div class="simple-game">

      <div class="game-emoji">
        🔢
      </div>

      <h2>Number Hunt</h2>

      <p>
        Find number
        <strong>${answer}</strong>
      </p>

      <div class="simple-options">

        ${options.map(option => `

          <button
            class="simple-option"
            data-number="${option}">

            ${option}

          </button>

        `).join("")}

      </div>

    </div>
  `;


  $$(".simple-option").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        if (
          Number(button.dataset.number) ===
          answer
        ) {

          addCoins(20);
          addXP(20);
          completeActivity();

          showSimpleSuccess(
            "Number Ninja! 🔢",
            "+20 Coins • +20 XP"
          );

        } else {

          button.disabled = true;

          showToast(
            "💡",
            "Not that one. Try again!"
          );

        }

      }
    );

  });

}


$("[data-game='number']")
  .addEventListener(
    "click",
    startNumberGame
  );


/* =========================================================
   DAILY CHALLENGE
========================================================= */

$("#challengeBtn").addEventListener(
  "click",
  () => {

    if (player.dailyProgress >= 3) {

      showToast(
        "🎉",
        "Today's mission is complete!"
      );

      return;
    }

    startQuiz("general");

  }
);


/* =========================================================
   CONTINUE LEARNING
========================================================= */

$("#continueBtn").addEventListener(
  "click",
  () => {

    document
      .querySelector("#learn")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(icon,message) {

  const toast =
    $("#toast");

  $("#toastIcon").textContent =
    icon;

  $("#toastMessage").textContent =
    message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    },2200);
}


/* =========================================================
   CONFETTI
========================================================= */

function createConfetti() {

  const container =
    $("#confettiContainer");

  const pieces = 55;

  for (let i = 0; i < pieces; i++) {

    const piece =
      document.createElement("div");

    piece.className =
      "confetti-piece";

    piece.style.left =
      `${Math.random() * 100}%`;

    piece.style.animationDelay =
      `${Math.random() * .5}s`;

    piece.style.background =
      randomConfettiColor();

    piece.style.transform =
      `rotate(${Math.random() * 360}deg)`;

    container.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    },2300);

  }
}


function randomConfettiColor() {

  const colors = [
    "#6c63ff",
    "#ffc928",
    "#ff6fae",
    "#39c98a",
    "#48aaf5",
    "#ff8b3d"
  ];

  return colors[
    Math.floor(
      Math.random() *
      colors.length
    )
  ];
}


/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {

  updatePlayerUI();

  $("#playerName").value =
    player.name;

  selectedAvatar =
    player.avatar;

  $$(".avatar-option").forEach(button => {

    button.classList.toggle(
      "selected",
      button.dataset.avatar ===
      player.avatar
    );

  });

}


initialize();
