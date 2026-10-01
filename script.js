"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     PLAYER DATA
  ========================= */

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

  function loadPlayer() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return structuredClone(defaultPlayer);
      }

      const data = JSON.parse(saved);

      return {
        ...structuredClone(defaultPlayer),
        ...data,
        badges: {
          ...defaultPlayer.badges,
          ...(data.badges || {})
        }
      };
    } catch (error) {
      console.error("Could not load player:", error);
      return structuredClone(defaultPlayer);
    }
  }

  function savePlayer() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  }


  /* =========================
     SAFE DOM HELPERS
  ========================= */

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);


  /* =========================
     PLAYER UI
  ========================= */

  function updatePlayerUI() {

    const coinCount = $("#coinCount");
    const heartCount = $("#heartCount");
    const heroName = $("#heroName");

    const levelNumber = $("#levelNumber");
    const levelText = $("#levelText");

    const xpFill = $("#xpFill");
    const xpText = $("#xpText");

    const streakCount = $("#streakCount");
    const dailyProgressText = $("#dailyProgressText");

    if (coinCount) {
      coinCount.textContent = player.coins;
    }

    if (heartCount) {
      heartCount.textContent = player.hearts;
    }

    if (heroName) {
      heroName.textContent = player.name;
    }

    const calculatedLevel = Math.floor(player.xp / 1000) + 1;
    player.level = Math.max(1, calculatedLevel);

    const currentXP = player.xp % 1000;
    const percentage = Math.min(100, (currentXP / 1000) * 100);

    if (levelNumber) {
      levelNumber.textContent = player.level;
    }

    if (levelText) {
      levelText.textContent = player.level;
    }

    if (xpFill) {
      xpFill.style.width = percentage + "%";
    }

    if (xpText) {
      xpText.textContent = `${currentXP} / 1000 XP`;
    }

    if (streakCount) {
      streakCount.textContent = player.streak;
    }

    if (dailyProgressText) {
      dailyProgressText.textContent =
        Math.round((player.dailyProgress / 3) * 100) + "%";
    }

    updateChallengeUI();
    updateBadges();

    savePlayer();
  }


  /* =========================
     DAILY CHALLENGE
  ========================= */

  function updateChallengeUI() {

    const challengeFill = $("#challengeFill");
    const challengeCount = $("#challengeCount");
    const challengeBtn = $("#challengeBtn");

    const progress = Math.min(player.dailyProgress, 3);
    const percentage = (progress / 3) * 100;

    if (challengeFill) {
      challengeFill.style.width = percentage + "%";
    }

    if (challengeCount) {
      challengeCount.textContent = `${progress} / 3`;
    }

    if (challengeBtn) {
      if (progress >= 3) {
        challengeBtn.textContent = "Mission Complete ✓";
      } else {
        challengeBtn.textContent = "Start Mission";
      }
    }
  }


  /* =========================
     BADGES
  ========================= */

  function updateBadges() {

    if (player.quizQuestions >= 20) {
      player.badges.brainMaster = true;
    }

    if (player.level >= 10) {
      player.badges.wonderKid = true;
    }

    const brainMasterBadge = $("#brainMasterBadge");
    const wonderKidBadge = $("#wonderKidBadge");

    if (brainMasterBadge) {
      brainMasterBadge.classList.toggle(
        "unlocked",
        player.badges.brainMaster
      );
    }

    if (wonderKidBadge) {
      wonderKidBadge.classList.toggle(
        "unlocked",
        player.badges.wonderKid
      );
    }
  }


  /* =========================
     COINS / XP / ACTIVITY
  ========================= */

  function addCoins(amount) {

    player.coins += amount;

    updatePlayerUI();

    showToast(
      "🪙",
      `+${amount} coins!`
    );
  }


  function addXP(amount) {

    player.xp += amount;

    updatePlayerUI();

    showToast(
      "⭐",
      `+${amount} XP!`
    );
  }


  function completeActivity() {

    player.completedActivities++;

    if (player.dailyProgress < 3) {
      player.dailyProgress++;
    }

    if (
      player.dailyProgress >= 3 &&
      !player.dailyRewardClaimed
    ) {
      player.dailyRewardClaimed = true;
      player.coins += 50;

      showToast(
        "🏆",
        "Daily Mission Complete! +50 coins"
      );

      createConfetti();
    }

    savePlayer();
    updatePlayerUI();
  }


  /* =========================
     TOAST
  ========================= */

  let toastTimer = null;

  function showToast(icon, message) {

    const toast = $("#toast");
    const toastIcon = $("#toastIcon");
    const toastMessage = $("#toastMessage");

    if (!toast) return;

    if (toastIcon) {
      toastIcon.textContent = icon || "🎉";
    }

    if (toastMessage) {
      toastMessage.textContent = message;
    }

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }


  /* =========================
     CONFETTI
  ========================= */

  function createConfetti() {

    const container = $("#confettiContainer");

    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < 35; i++) {

      const piece = document.createElement("span");

      piece.textContent = ["🎉", "⭐", "✨", "🎊"][Math.floor(Math.random() * 4)];

      piece.style.position = "fixed";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.top = "-30px";
      piece.style.fontSize = "20px";
      piece.style.zIndex = "99999";
      piece.style.pointerEvents = "none";

      piece.style.animation =
        `confettiFall ${1.5 + Math.random() * 2}s linear forwards`;

      container.appendChild(piece);
    }

    setTimeout(() => {
      container.innerHTML = "";
    }, 4000);
  }


  /* =========================
     MODALS
  ========================= */

  function openModal(id) {

    const modal = document.getElementById(id);

    if (!modal) return;

    modal.classList.add("open");
    document.body.classList.add("modal-open");
  }


  function closeModal(id) {

    const modal = document.getElementById(id);

    if (!modal) return;

    modal.classList.remove("open");

    if (!document.querySelector(".modal-overlay.open")) {
      document.body.classList.remove("modal-open");
    }
  }


  function closeAllModals() {

    $$(".modal-overlay").forEach(modal => {
      modal.classList.remove("open");
    });

    document.body.classList.remove("modal-open");
  }


  /* =========================
     PROFILE
  ========================= */

  function setupProfile() {

    const profileBtn = $("#profileBtn");
    const saveProfile = $("#saveProfile");
    const playerName = $("#playerName");

    if (profileBtn) {
      profileBtn.addEventListener("click", () => {

        if (playerName) {
          playerName.value = player.name;
        }

        $$(".avatar-option").forEach(btn => {
          btn.classList.toggle(
            "selected",
            btn.dataset.avatar === player.avatar
          );
        });

        openModal("profileModal");
      });
    }


    $$(".avatar-option").forEach(button => {

      button.addEventListener("click", () => {

        $$(".avatar-option").forEach(btn => {
          btn.classList.remove("selected");
        });

        button.classList.add("selected");

        player.avatar = button.dataset.avatar || "🧒";
      });

    });


    if (saveProfile) {

      saveProfile.addEventListener("click", () => {

        if (playerName) {

          const newName = playerName.value.trim();

          if (newName) {
            player.name = newName;
          }
        }

        savePlayer();
        updatePlayerUI();

        closeModal("profileModal");

        showToast("💾", "Profile saved!");
      });
    }
  }


  /* =========================
     MODAL CLOSE BUTTONS
  ========================= */

  function setupModalClose() {

    $$("[data-close]").forEach(button => {

      button.addEventListener("click", () => {

        const modalId = button.dataset.close;

        if (modalId) {
          closeModal(modalId);
        }
      });

    });


    $$(".modal-overlay").forEach(modal => {

      modal.addEventListener("click", event => {

        if (event.target === modal) {
          closeModal(modal.id);
        }

      });

    });


    document.addEventListener("keydown", event => {

      if (event.key === "Escape") {
        closeAllModals();
      }

    });
  }


  /* =========================
     GAME MODAL
  ========================= */

  function openGameModal(title, content) {

    const gameContent = $("#gameContent");

    if (!gameContent) return;

    gameContent.innerHTML = `
      <div class="game-title">
        <h2>${title}</h2>
      </div>

      <div class="game-body">
        ${content}
      </div>
    `;

    openModal("gameModal");
  }


  /* =========================
     GAME BUTTONS
  ========================= */

  function setupGameButtons() {

    document.addEventListener("click", event => {

      const button = event.target.closest(
        ".play-button[data-game]"
      );

      if (!button) return;

      event.preventDefault();
      event.stopPropagation();

      const game = button.dataset.game;

      if (game === "memory") {
        startMemoryGame();
      }

      else if (game === "quiz") {
        startQuiz("general");
      }

      else if (game === "word") {
        startWordGame();
      }

      else if (game === "mathgame") {
        startMathGame();
      }

      else if (game === "color") {
        startColorGame();
      }

      else if (game === "number") {
        startNumberGame();
      }

    });
  }


  /* =========================
     QUIZ BUTTONS
  ========================= */

  function setupQuizButtons() {

    document.addEventListener("click", event => {

      const button = event.target.closest("[data-quiz]");

      if (!button) return;

      event.preventDefault();

      const quiz = button.dataset.quiz;

      startQuiz(quiz);
    });
  }


  /* =========================
     QUIZ DATA
  ========================= */

  const quizData = {

    math: [
      {
        question: "What is 5 + 3?",
        options: ["6", "7", "8", "9"],
        answer: "8"
      },
      {
        question: "What is 10 - 4?",
        options: ["5", "6", "7", "8"],
        answer: "6"
      },
      {
        question: "What is 3 × 4?",
        options: ["7", "10", "12", "14"],
        answer: "12"
      }
    ],

    english: [
      {
        question: "Which word is a fruit?",
        options: ["Apple", "Chair", "Book", "Table"],
        answer: "Apple"
      },
      {
        question: "Which one is an animal?",
        options: ["Dog", "Car", "Pencil", "House"],
        answer: "Dog"
      },
      {
        question: "What is the opposite of BIG?",
        options: ["Tall", "Small", "Fast", "Long"],
        answer: "Small"
      }
    ],

    science: [
      {
        question: "Which planet do we live on?",
        options: ["Mars", "Earth", "Venus", "Jupiter"],
        answer: "Earth"
      },
      {
        question: "What do plants need to grow?",
        options: ["Sunlight", "Plastic", "Metal", "Glass"],
        answer: "Sunlight"
      },
      {
        question: "Which animal gives us milk?",
        options: ["Cow", "Lion", "Tiger", "Eagle"],
        answer: "Cow"
      }
    ],

    general: [
      {
        question: "How many days are in a week?",
        options: ["5", "6", "7", "8"],
        answer: "7"
      },
      {
        question: "What color is the sky on a clear day?",
        options: ["Blue", "Green", "Pink", "Black"],
        answer: "Blue"
      },
      {
        question: "How many legs does a spider have?",
        options: ["4", "6", "8", "10"],
        answer: "8"
      }
    ]

  };


  /* =========================
     QUIZ GAME
  ========================= */

  function startQuiz(type = "general") {

    const questions =
      quizData[type] || quizData.general;

    let index = 0;
    let score = 0;

    function renderQuestion() {

      const question = questions[index];

      openGameModal(
        "🧠 Quiz Time!",
        `
          <div class="quiz-question">
            <h3>${question.question}</h3>

            <div class="quiz-options">
              ${question.options.map(option => `
                <button
                  class="quiz-option"
                  data-answer="${escapeHTML(option)}"
                >
                  ${escapeHTML(option)}
                </button>
              `).join("")}
            </div>

            <p class="quiz-progress">
              Question ${index + 1} of ${questions.length}
            </p>
          </div>
        `
      );


      $$(".quiz-option").forEach(button => {

        button.addEventListener("click", () => {

          const selected = button.dataset.answer;

          player.quizQuestions++;

          if (selected === question.answer) {

            score++;

            addCoins(10);
            addXP(30);

            button.classList.add("correct");

            showToast("🎉", "Correct!");

          } else {

            player.hearts = Math.max(
              0,
              player.hearts - 1
            );

            updatePlayerUI();

            showToast(
              "💡",
              `Correct answer: ${question.answer}`
            );
          }

          setTimeout(() => {

            index++;

            if (index < questions.length) {
              renderQuestion();
            } else {
              finishQuiz();
            }

          }, 900);

        });

      });

    }


    function finishQuiz() {

      completeActivity();

      openGameModal(
        "🏆 Quiz Complete!",
        `
          <div class="game-result">
            <div style="font-size:60px;">🎉</div>

            <h2>Great Job!</h2>

            <p>
              You scored
              <strong>${score}</strong>
              out of
              <strong>${questions.length}</strong>
            </p>

            <button
              class="btn btn-primary"
              id="quizDone"
            >
              Done
            </button>
          </div>
        `
      );

      const done = $("#quizDone");

      if (done) {
        done.addEventListener("click", () => {
          closeModal("gameModal");
        });
      }
    }


    renderQuestion();
  }


  /* =========================
     MEMORY GAME
  ========================= */

  function startMemoryGame() {

    const symbols = [
      "🍎", "🍎",
      "🚀", "🚀",
      "⭐", "⭐",
      "🐱", "🐱",
      "🌈", "🌈",
      "🦄", "🦄"
    ];

    symbols.sort(() => Math.random() - 0.5);

    openGameModal(
      "🧩 Memory Match",
      `
        <div
          class="memory-grid"
          id="memoryGrid"
        >
          ${symbols.map((symbol, index) => `
            <button
              class="memory-card"
              data-index="${index}"
              data-symbol="${symbol}"
            >
              ❓
            </button>
          `).join("")}
        </div>

        <p id="memoryStatus">
          Find all matching pairs!
        </p>
      `
    );

    let first = null;
    let second = null;
    let lock = false;
    let matched = 0;

    $$(".memory-card").forEach(card => {

      card.addEventListener("click", () => {

        if (lock || card.classList.contains("matched")) {
          return;
        }

        card.textContent = card.dataset.symbol;
        card.classList.add("flipped");

        if (!first) {
          first = card;
          return;
        }

        second = card;
        lock = true;

        if (
          first.dataset.symbol ===
          second.dataset.symbol
        ) {

          first.classList.add("matched");
          second.classList.add("matched");

          matched++;

          first = null;
          second = null;
          lock = false;

          if (matched === 6) {

            addCoins(30);
            addXP(50);
            completeActivity();

            const status = $("#memoryStatus");

            if (status) {
              status.textContent =
                "🎉 Amazing! You matched everything!";
            }

            createConfetti();
          }

        } else {

          setTimeout(() => {

            first.textContent = "❓";
            second.textContent = "❓";

            first.classList.remove("flipped");
            second.classList.remove("flipped");

            first = null;
            second = null;
            lock = false;

          }, 700);

        }

      });

    });
  }


  /* =========================
     WORD GAME
  ========================= */

  function startWordGame() {

    const words = [
      {
        word: "APPLE",
        hint: "🍎 A fruit"
      },
      {
        word: "HOUSE",
        hint: "🏠 A place to live"
      },
      {
        word: "ROCKET",
        hint: "🚀 It flies into space"
      },
      {
        word: "TIGER",
        hint: "🐯 A wild animal"
      }
    ];

    const item =
      words[Math.floor(Math.random() * words.length)];

    let answer = "";

    openGameModal(
      "🔤 Word Builder",
      `
        <p class="word-hint">
          ${item.hint}
        </p>

        <h2 id="wordDisplay">
          ${"_ ".repeat(item.word.length)}
        </h2>

        <div
          class="letter-buttons"
          id="letterButtons"
        >
          ${shuffleArray([...item.word]).map(letter => `
            <button
              class="letter-btn"
              data-letter="${letter}"
            >
              ${letter}
            </button>
          `).join("")}
        </div>

        <button
          class="btn btn-primary"
          id="wordSubmit"
        >
          Check Word
        </button>
      `
    );

    const display = $("#wordDisplay");

    $$(".letter-btn").forEach(button => {

      button.addEventListener("click", () => {

        if (answer.length >= item.word.length) {
          return;
        }

        answer += button.dataset.letter;

        button.disabled = true;

        if (display) {
          display.textContent =
            answer
              .padEnd(item.word.length, "_")
              .split("")
              .join(" ");
        }

      });

    });


    const submit = $("#wordSubmit");

    if (submit) {

      submit.addEventListener("click", () => {

        if (answer === item.word) {

          addCoins(20);
          addXP(40);
          completeActivity();

          showToast("🎉", "Correct word!");

          createConfetti();

          setTimeout(() => {
            closeModal("gameModal");
          }, 1000);

        } else {

          showToast("💡", "Try again!");
        }

      });

    }
  }


  /* =========================
     MATH CHALLENGE
  ========================= */

  function startMathGame() {

    const first =
      Math.floor(Math.random() * 20) + 1;

    const second =
      Math.floor(Math.random() * 20) + 1;

    const operations = ["+", "-", "×"];

    const operation =
      operations[
        Math.floor(Math.random() * operations.length)
      ];

    let answer;

    if (operation === "+") {
      answer = first + second;
    }

    else if (operation === "-") {

      const big = Math.max(first, second);
      const small = Math.min(first, second);

      answer = big - small;

    }

    else {
      answer = first * second;
    }


    const choices = new Set();

    choices.add(answer);

    while (choices.size < 4) {

      const variation =
        answer +
        Math.floor(Math.random() * 11) -
        5;

      if (variation >= 0) {
        choices.add(variation);
      }
    }

    const options =
      [...choices].sort(() => Math.random() - 0.5);


    openGameModal(
      "➕ Math Challenge",
      `
        <div class="math-question">
          <div style="font-size:42px;font-weight:800;">
            ${first} ${operation} ${second} = ?
          </div>

          <div class="quiz-options">
            ${options.map(number => `
              <button
                class="quiz-option math-answer"
                data-answer="${number}"
              >
                ${number}
              </button>
            `).join("")}
          </div>
        </div>
      `
    );


    $$(".math-answer").forEach(button => {

      button.addEventListener("click", () => {

        const selected =
          Number(button.dataset.answer);

        if (selected === answer) {

          button.classList.add("correct");

          addCoins(15);
          addXP(35);
          completeActivity();

          showToast("🎉", "Correct answer!");

          createConfetti();

          setTimeout(() => {
            closeModal("gameModal");
          }, 1000);

        } else {

          button.classList.add("wrong");

          player.hearts =
            Math.max(0, player.hearts - 1);

          updatePlayerUI();

          showToast(
            "💡",
            `Answer was ${answer}`
          );

        }

      });

    });
  }


  /* =========================
     COLOR GAME
  ========================= */

  function startColorGame() {

    const colors = [
      {
        name: "RED",
        value: "#ef4444"
      },
      {
        name: "BLUE",
        value: "#3b82f6"
      },
      {
        name: "GREEN",
        value: "#22c55e"
      },
      {
        name: "YELLOW",
        value: "#eab308"
      },
      {
        name: "PURPLE",
        value: "#8b5cf6"
      },
      {
        name: "ORANGE",
        value: "#f97316"
      }
    ];


    const target =
      colors[
        Math.floor(Math.random() * colors.length)
      ];


    const options =
      [...colors]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);


    if (!options.some(c => c.name === target.name)) {
      options[0] = target;
    }


    openGameModal(
      "🎨 Color Game",
      `
        <h3>
          Find the
          <strong>${target.name}</strong>
          color!
        </h3>

        <div
          class="color-options"
          style="
            display:grid;
            grid-template-columns:repeat(2,1fr);
            gap:15px;
            margin-top:20px;
          "
        >

          ${options.map(color => `
            <button
              class="color-answer"
              data-color="${color.name}"
              style="
                height:90px;
                border:none;
                border-radius:18px;
                background:${color.value};
                cursor:pointer;
                font-size:0;
              "
            ></button>
          `).join("")}

        </div>
      `
    );


    $$(".color-answer").forEach(button => {

      button.addEventListener("click", () => {

        const selected =
          button.dataset.color;

        if (selected === target.name) {

          button.style.outline =
            "5px solid #22c55e";

          addCoins(15);
          addXP(35);
          completeActivity();

          showToast("🎉", "Great color match!");

          createConfetti();

          setTimeout(() => {
            closeModal("gameModal");
          }, 1000);

        } else {

          button.style.outline =
            "5px solid #ef4444";

          player.hearts =
            Math.max(0, player.hearts - 1);

          updatePlayerUI();

          showToast(
            "💡",
            "Try another color!"
          );

        }

      });

    });
  }


  /* =========================
     NUMBER HUNT
  ========================= */

  function startNumberGame() {

    const target =
      Math.floor(Math.random() * 20) + 1;

    const numbers = new Set();

    numbers.add(target);

    while (numbers.size < 6) {

      numbers.add(
        Math.floor(Math.random() * 20) + 1
      );

    }

    const options =
      [...numbers].sort(() => Math.random() - 0.5);


    openGameModal(
      "🔢 Number Hunt",
      `
        <h3>
          Find number
          <strong>${target}</strong>
        </h3>

        <div
          class="number-options"
          style="
            display:grid;
            grid-template-columns:repeat(3,1fr);
            gap:12px;
            margin-top:20px;
          "
        >

          ${options.map(number => `
            <button
              class="number-answer"
              data-number="${number}"
              style="
                min-height:70px;
                border-radius:16px;
                border:2px solid #ddd;
                background:white;
                cursor:pointer;
                font-size:24px;
                font-weight:800;
              "
            >
              ${number}
            </button>
          `).join("")}

        </div>
      `
    );


    $$(".number-answer").forEach(button => {

      button.addEventListener("click", () => {

        const selected =
          Number(button.dataset.number);

        if (selected === target) {

          button.style.transform = "scale(1.08)";

          addCoins(15);
          addXP(35);
          completeActivity();

          showToast(
            "🎉",
            "You found the number!"
          );

          createConfetti();

          setTimeout(() => {
            closeModal("gameModal");
          }, 1000);

        } else {

          button.style.opacity = "0.4";

          player.hearts =
            Math.max(0, player.hearts - 1);

          updatePlayerUI();

          showToast(
            "🔎",
            "Keep looking!"
          );

        }

      });

    });
  }


  /* =========================
     CONTINUE BUTTON
  ========================= */

  function setupContinueButton() {

    const continueBtn = $("#continueBtn");

    if (!continueBtn) return;

    continueBtn.addEventListener("click", () => {

      const learn =
        $("#learn");

      if (learn) {
        learn.scrollIntoView({
          behavior: "smooth"
        });
      }

    });
  }


  /* =========================
     CHALLENGE BUTTON
  ========================= */

  function setupChallengeButton() {

    const button = $("#challengeBtn");

    if (!button) return;

    button.addEventListener("click", () => {

      if (player.dailyProgress >= 3) {

        showToast(
          "🏆",
          "Daily mission already complete!"
        );

        return;
      }

      startQuiz("general");
    });
  }


  /* =========================
     NAVIGATION
  ========================= */

  function setupNavigation() {

    $$(".nav-link").forEach(link => {

      link.addEventListener("click", () => {

        $$(".nav-link").forEach(item => {
          item.classList.remove("active");
        });

        link.classList.add("active");
      });

    });


    $$('a[href^="#"]').forEach(link => {

      link.addEventListener("click", event => {

        const id =
          link.getAttribute("href");

        if (!id || id === "#") return;

        const target =
          document.querySelector(id);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      });

    });
  }


  /* =========================
     UTILITY FUNCTIONS
  ========================= */

  function shuffleArray(array) {

    return array.sort(
      () => Math.random() - 0.5
    );
  }


  function escapeHTML(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /* =========================
     INITIALIZE
  ========================= */

  setupProfile();
  setupModalClose();
  setupGameButtons();
  setupQuizButtons();
  setupContinueButton();
  setupChallengeButton();
  setupNavigation();

  updatePlayerUI();

});
