"use strict";

/* =========================================================
   WONDERKIDS
   COMPLETE SCRIPT.JS
   Games + Quiz + Piano Sounds + Timed Challenge
   + Extra Games + Kids Poems + Mobile
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     PLAYER
  ======================================================= */

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
        return JSON.parse(JSON.stringify(defaultPlayer));
      }

      const data = JSON.parse(saved);

      return {
        ...defaultPlayer,
        ...data,
        badges: {
          ...defaultPlayer.badges,
          ...(data.badges || {})
        }
      };

    } catch (error) {
      console.error("Player loading error:", error);
      return JSON.parse(JSON.stringify(defaultPlayer));
    }
  }

  function savePlayer() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(player)
      );
    } catch (error) {
      console.error("Player saving error:", error);
    }
  }


  /* =======================================================
     HELPERS
  ======================================================= */

  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function shuffle(array) {
    return [...array].sort(
      () => Math.random() - 0.5
    );
  }


  /* =======================================================
     🎹 AUDIO / PIANO SYSTEM
  ======================================================= */

  let audioContext = null;

  function getAudioContext() {

    try {

      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) return null;

      if (!audioContext) {
        audioContext = new AudioContext();
      }

      if (
        audioContext.state === "suspended"
      ) {
        audioContext.resume();
      }

      return audioContext;

    } catch (error) {

      console.log(
        "Audio unavailable"
      );

      return null;
    }
  }


  /* Generic tone */

  function playTone(
    frequency,
    duration,
    type = "sine",
    volume = 0.07
  ) {

    try {

      const ctx =
        getAudioContext();

      if (!ctx) return;

      const oscillator =
        ctx.createOscillator();

      const gain =
        ctx.createGain();

      oscillator.type = type;

      oscillator.frequency.value =
        frequency;

      gain.gain.setValueAtTime(
        0.0001,
        ctx.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        volume,
        ctx.currentTime + 0.01
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration
      );

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();

      oscillator.stop(
        ctx.currentTime + duration
      );

    } catch (error) {
      console.log("Sound unavailable");
    }
  }


  /* Piano note */

  function playPianoNote(
    frequency,
    duration = 0.55,
    volume = 0.055
  ) {

    try {

      const ctx =
        getAudioContext();

      if (!ctx) return;

      const now =
        ctx.currentTime;

      const oscillator =
        ctx.createOscillator();

      const harmonic =
        ctx.createOscillator();

      const gain =
        ctx.createGain();

      const filter =
        ctx.createBiquadFilter();

      oscillator.type =
        "triangle";

      harmonic.type =
        "sine";

      oscillator.frequency.value =
        frequency;

      harmonic.frequency.value =
        frequency * 2;

      filter.type =
        "lowpass";

      filter.frequency.value =
        2600;

      filter.Q.value =
        0.7;

      gain.gain.setValueAtTime(
        0.0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        volume,
        now + 0.015
      );

      gain.gain.exponentialRampToValueAtTime(
        volume * 0.45,
        now + 0.10
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + duration
      );

      oscillator.connect(filter);
      harmonic.connect(filter);

      filter.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(now);
      harmonic.start(now);

      oscillator.stop(
        now + duration
      );

      harmonic.stop(
        now + duration
      );

    } catch (error) {

      console.log(
        "Piano sound unavailable"
      );

    }
  }


  /* Piano frequencies */

  const pianoNotes = {

    C3: 130.81,
    D3: 146.83,
    E3: 164.81,
    F3: 174.61,
    G3: 196.00,
    A3: 220.00,
    B3: 246.94,

    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88,

    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
    A5: 880.00

  };


  /* Correct piano */

  function correctSound() {

    playPianoNote(
      pianoNotes.C4,
      0.45,
      0.055
    );

    setTimeout(() => {

      playPianoNote(
        pianoNotes.E4,
        0.45,
        0.055
      );

    }, 100);

    setTimeout(() => {

      playPianoNote(
        pianoNotes.G4,
        0.55,
        0.06
      );

    }, 200);
  }


  /* Wrong piano */

  function wrongSound() {

    playPianoNote(
      pianoNotes.G3,
      0.35,
      0.045
    );

    setTimeout(() => {

      playPianoNote(
        pianoNotes.E3,
        0.45,
        0.045
      );

    }, 150);
  }


  /* Reward piano */

  function rewardSound() {

    const melody = [
      "C4",
      "E4",
      "G4",
      "C5",
      "E5"
    ];

    melody.forEach(
      (note, index) => {

        setTimeout(() => {

          playPianoNote(
            pianoNotes[note],
            0.45,
            0.06
          );

        }, index * 100);

      }
    );
  }


  /* =======================================================
     PLAYER UI
  ======================================================= */

  function updatePlayerUI() {

    const coinCount =
      $("#coinCount");

    const heartCount =
      $("#heartCount");

    const heroName =
      $("#heroName");

    const levelNumber =
      $("#levelNumber");

    const levelText =
      $("#levelText");

    const xpFill =
      $("#xpFill");

    const xpText =
      $("#xpText");

    const streakCount =
      $("#streakCount");

    const dailyProgressText =
      $("#dailyProgressText");

    if (coinCount) {
      coinCount.textContent =
        player.coins;
    }

    if (heartCount) {
      heartCount.textContent =
        player.hearts;
    }

    if (heroName) {
      heroName.textContent =
        player.name;
    }

    player.level =
      Math.floor(
        player.xp / 1000
      ) + 1;

    const currentXP =
      player.xp % 1000;

    const percentage =
      Math.min(
        100,
        (currentXP / 1000) * 100
      );

    if (levelNumber) {
      levelNumber.textContent =
        player.level;
    }

    if (levelText) {
      levelText.textContent =
        player.level;
    }

    if (xpFill) {
      xpFill.style.width =
        percentage + "%";
    }

    if (xpText) {
      xpText.textContent =
        `${currentXP} / 1000 XP`;
    }

    if (streakCount) {
      streakCount.textContent =
        player.streak;
    }

    if (dailyProgressText) {

      dailyProgressText.textContent =
        Math.round(
          (player.dailyProgress / 3) * 100
        ) + "%";

    }

    updateChallengeUI();

    updateBadges();

    savePlayer();
  }


  /* =======================================================
     DAILY CHALLENGE
  ======================================================= */

  function updateChallengeUI() {

    const fill =
      $("#challengeFill");

    const count =
      $("#challengeCount");

    const button =
      $("#challengeBtn");

    const progress =
      Math.min(
        player.dailyProgress,
        3
      );

    const percentage =
      (progress / 3) * 100;

    if (fill) {
      fill.style.width =
        percentage + "%";
    }

    if (count) {
      count.textContent =
        `${progress} / 3`;
    }

    if (button) {

      button.textContent =
        progress >= 3
          ? "Mission Complete ✓"
          : "Start Mission";

    }
  }


  /* =======================================================
     BADGES
  ======================================================= */

  function updateBadges() {

    if (
      player.quizQuestions >= 20
    ) {
      player.badges.brainMaster =
        true;
    }

    if (
      player.level >= 10
    ) {
      player.badges.wonderKid =
        true;
    }

    const brainMaster =
      $("#brainMasterBadge");

    const wonderKid =
      $("#wonderKidBadge");

    if (brainMaster) {

      brainMaster.classList.toggle(
        "unlocked",
        player.badges.brainMaster
      );

    }

    if (wonderKid) {

      wonderKid.classList.toggle(
        "unlocked",
        player.badges.wonderKid
      );

    }
  }


  /* =======================================================
     COINS / XP
  ======================================================= */

  function addCoins(
    amount,
    sound = true
  ) {

    player.coins +=
      amount;

    updatePlayerUI();

    if (sound) {
      rewardSound();
    }

    showToast(
      "🪙",
      `+${amount} coins!`
    );
  }


  function addXP(
    amount,
    sound = false
  ) {

    player.xp +=
      amount;

    updatePlayerUI();

    if (sound) {
      correctSound();
    }

    showToast(
      "⭐",
      `+${amount} XP!`
    );
  }


  /* =======================================================
     COMPLETE ACTIVITY
  ======================================================= */

  function completeActivity() {

    player.completedActivities++;

    if (
      player.dailyProgress < 3
    ) {
      player.dailyProgress++;
    }

    if (
      player.dailyProgress >= 3 &&
      !player.dailyRewardClaimed
    ) {

      player.dailyRewardClaimed =
        true;

      player.coins += 50;

      rewardSound();

      showToast(
        "🏆",
        "Daily Mission Complete! +50 coins"
      );

      createConfetti();
    }

    savePlayer();

    updatePlayerUI();
  }


  /* =======================================================
     TOAST
  ======================================================= */

  let toastTimer = null;

  function showToast(
    icon,
    message
  ) {

    const toast =
      $("#toast");

    const toastIcon =
      $("#toastIcon");

    const toastMessage =
      $("#toastMessage");

    if (!toast) return;

    if (toastIcon) {
      toastIcon.textContent =
        icon || "🎉";
    }

    if (toastMessage) {
      toastMessage.textContent =
        message;
    }

    toast.classList.add(
      "show"
    );

    clearTimeout(
      toastTimer
    );

    toastTimer =
      setTimeout(() => {

        toast.classList.remove(
          "show"
        );

      }, 2200);
  }


  /* =======================================================
     CONFETTI
  ======================================================= */

  function createConfetti() {

    const container =
      $("#confettiContainer");

    if (!container) return;

    container.innerHTML =
      "";

    const icons = [
      "🎉",
      "⭐",
      "✨",
      "🎊"
    ];

    for (
      let i = 0;
      i < 35;
      i++
    ) {

      const piece =
        document.createElement(
          "span"
        );

      piece.textContent =
        icons[
          Math.floor(
            Math.random() *
            icons.length
          )
        ];

      piece.style.position =
        "fixed";

      piece.style.left =
        Math.random() * 100 +
        "%";

      piece.style.top =
        "-30px";

      piece.style.fontSize =
        "20px";

      piece.style.zIndex =
        "99999";

      piece.style.pointerEvents =
        "none";

      piece.style.animation =
        `confettiFall ${
          1.5 +
          Math.random() * 2
        }s linear forwards`;

      container.appendChild(
        piece
      );
    }

    setTimeout(() => {

      container.innerHTML =
        "";

    }, 4000);
  }


  /* =======================================================
     MODALS
  ======================================================= */

  function openModal(id) {

    const modal =
      document.getElementById(id);

    if (!modal) return;

    modal.classList.add(
      "open"
    );

    document.body.classList.add(
      "modal-open"
    );
  }


  function closeModal(id) {

    const modal =
      document.getElementById(id);

    if (!modal) return;

    modal.classList.remove(
      "open"
    );

    if (
      !document.querySelector(
        ".modal-overlay.open"
      )
    ) {

      document.body.classList.remove(
        "modal-open"
      );

    }
  }


  function closeAllModals() {

    clearInterval(
      timedInterval
    );

    stopPoemAudio();

    $$(
      ".modal-overlay"
    ).forEach(
      modal =>
        modal.classList.remove(
          "open"
        )
    );

    document.body.classList.remove(
      "modal-open"
    );
  }


  /* =======================================================
     PROFILE
  ======================================================= */

  function setupProfile() {

    const profileBtn =
      $("#profileBtn");

    const saveProfile =
      $("#saveProfile");

    const playerName =
      $("#playerName");

    if (profileBtn) {

      profileBtn.addEventListener(
        "click",
        () => {

          if (playerName) {

            playerName.value =
              player.name;

          }

          $$(".avatar-option")
            .forEach(button => {

              button.classList.toggle(
                "selected",
                button.dataset.avatar ===
                  player.avatar
              );

            });

          openModal(
            "profileModal"
          );

        }
      );
    }


    $$(".avatar-option")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            $$(".avatar-option")
              .forEach(btn =>
                btn.classList.remove(
                  "selected"
                )
              );

            button.classList.add(
              "selected"
            );

            player.avatar =
              button.dataset.avatar ||
              "🧒";

          }
        );

      });


    if (saveProfile) {

      saveProfile.addEventListener(
        "click",
        () => {

          if (playerName) {

            const name =
              playerName.value.trim();

            if (name) {
              player.name =
                name;
            }

          }

          savePlayer();

          updatePlayerUI();

          closeModal(
            "profileModal"
          );

          showToast(
            "💾",
            "Profile saved!"
          );

        }
      );
    }
  }


  /* =======================================================
     MODAL CLOSE
  ======================================================= */

  function setupModalClose() {

    $$("[data-close]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset.close;

            if (id) {
              closeModal(id);
            }

          }
        );

      });


    $$(".modal-overlay")
      .forEach(modal => {

        modal.addEventListener(
          "click",
          event => {

            if (
              event.target === modal
            ) {

              closeModal(
                modal.id
              );

            }

          }
        );

      });


    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape"
        ) {

          closeAllModals();

        }

      }
    );
  }


  /* =======================================================
     GAME MODAL
  ======================================================= */

  function openGameModal(
    title,
    content
  ) {

    const gameContent =
      $("#gameContent");

    if (!gameContent) return;

    gameContent.innerHTML = `

      <div class="game-title">
        <h2>${title}</h2>
      </div>

      <div class="game-body">
        ${content}
      </div>

    `;

    openModal(
      "gameModal"
    );
  }


  /* =======================================================
     QUIZ DATA
  ======================================================= */

  const quizData = {

    math: [

      {
        question:
          "What is 5 + 3?",
        options:
          ["6", "7", "8", "9"],
        answer:
          "8"
      },

      {
        question:
          "What is 10 - 4?",
        options:
          ["5", "6", "7", "8"],
        answer:
          "6"
      },

      {
        question:
          "What is 3 × 4?",
        options:
          ["7", "10", "12", "14"],
        answer:
          "12"
      }

    ],

    english: [

      {
        question:
          "Which word is a fruit?",
        options:
          [
            "Apple",
            "Chair",
            "Book",
            "Table"
          ],
        answer:
          "Apple"
      },

      {
        question:
          "Which one is an animal?",
        options:
          [
            "Dog",
            "Car",
            "Pencil",
            "House"
          ],
        answer:
          "Dog"
      },

      {
        question:
          "What is the opposite of BIG?",
        options:
          [
            "Tall",
            "Small",
            "Fast",
            "Long"
          ],
        answer:
          "Small"
      }

    ],

    science: [

      {
        question:
          "Which planet do we live on?",
        options:
          [
            "Mars",
            "Earth",
            "Venus",
            "Jupiter"
          ],
        answer:
          "Earth"
      },

      {
        question:
          "What do plants need to grow?",
        options:
          [
            "Sunlight",
            "Plastic",
            "Metal",
            "Glass"
          ],
        answer:
          "Sunlight"
      },

      {
        question:
          "Which animal gives us milk?",
        options:
          [
            "Cow",
            "Lion",
            "Tiger",
            "Eagle"
          ],
        answer:
          "Cow"
      }

    ],

    general: [

      {
        question:
          "How many days are in a week?",
        options:
          ["5", "6", "7", "8"],
        answer:
          "7"
      },

      {
        question:
          "What color is the sky on a clear day?",
        options:
          [
            "Blue",
            "Green",
            "Pink",
            "Black"
          ],
        answer:
          "Blue"
      },

      {
        question:
          "How many legs does a spider have?",
        options:
          [
            "4",
            "6",
            "8",
            "10"
          ],
        answer:
          "8"
      }

    ]

  };


  /* =======================================================
     QUIZ
  ======================================================= */

  function startQuiz(
    type = "general"
  ) {

    const questions =
      quizData[type] ||
      quizData.general;

    let index = 0;
    let score = 0;

    function renderQuestion() {

      const question =
        questions[index];

      openGameModal(

        "🧠 Quiz Time!",

        `

          <div class="quiz-question">

            <h3>
              ${question.question}
            </h3>

            <div class="quiz-options">

              ${question.options
                .map(option => `

                  <button
                    class="quiz-option"
                    data-answer="${escapeHTML(option)}"
                  >
                    ${escapeHTML(option)}
                  </button>

                `)
                .join("")}

            </div>

            <p class="quiz-progress">
              Question
              ${index + 1}
              of
              ${questions.length}
            </p>

          </div>

        `
      );


      $$(".quiz-option")
        .forEach(button => {

          button.addEventListener(
            "click",
            () => {

              const selected =
                button.dataset.answer;

              player.quizQuestions++;


              if (
                selected ===
                question.answer
              ) {

                score++;

                correctSound();

                addCoins(
                  10,
                  false
                );

                addXP(
                  30,
                  false
                );

                button.classList.add(
                  "correct"
                );

                showToast(
                  "🎉",
                  "Correct!"
                );

              } else {

                wrongSound();

                player.hearts =
                  Math.max(
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

                if (
                  index <
                  questions.length
                ) {

                  renderQuestion();

                } else {

                  finishQuiz();

                }

              }, 900);

            }
          );

        });

    }


    function finishQuiz() {

      completeActivity();

      openGameModal(

        "🏆 Quiz Complete!",

        `

          <div class="game-result">

            <div
              style="font-size:60px;"
            >
              🎉
            </div>

            <h2>
              Great Job!
            </h2>

            <p>
              You scored
              <strong>
                ${score}
              </strong>
              out of
              <strong>
                ${questions.length}
              </strong>
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


      const done =
        $("#quizDone");

      if (done) {

        done.addEventListener(
          "click",
          () =>
            closeModal(
              "gameModal"
            )
        );

      }
    }


    renderQuestion();
  }


  /* =======================================================
     MEMORY GAME
  ======================================================= */

  function startMemoryGame() {

    const symbols = [

      "🍎",
      "🍎",

      "🚀",
      "🚀",

      "⭐",
      "⭐",

      "🐱",
      "🐱",

      "🌈",
      "🌈",

      "🦄",
      "🦄"

    ];

    const cards =
      shuffle(symbols);


    openGameModal(

      "🧩 Memory Match",

      `

        <div
          class="memory-grid"
          id="memoryGrid"
        >

          ${cards.map(
            (symbol, index) => `

              <button
                class="memory-card"
                data-index="${index}"
                data-symbol="${symbol}"
              >
                ❓
              </button>

            `
          ).join("")}

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


    $$(".memory-card")
      .forEach(card => {

        card.addEventListener(
          "click",
          () => {

            if (
              lock ||
              card.classList.contains(
                "matched"
              )
            ) {
              return;
            }


            card.textContent =
              card.dataset.symbol;

            card.classList.add(
              "flipped"
            );


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

              correctSound();

              first.classList.add(
                "matched"
              );

              second.classList.add(
                "matched"
              );

              matched++;

              first = null;
              second = null;
              lock = false;


              if (matched === 6) {

                addCoins(
                  30,
                  false
                );

                addXP(
                  50,
                  false
                );

                completeActivity();

                rewardSound();

                createConfetti();


                const status =
                  $("#memoryStatus");

                if (status) {

                  status.textContent =
                    "🎉 Amazing! You matched everything!";

                }

              }

            } else {

              wrongSound();

              setTimeout(() => {

                if (first) {

                  first.textContent =
                    "❓";

                  first.classList.remove(
                    "flipped"
                  );

                }

                if (second) {

                  second.textContent =
                    "❓";

                  second.classList.remove(
                    "flipped"
                  );

                }

                first = null;
                second = null;
                lock = false;

              }, 700);

            }

          }
        );

      });

  }


  /* =======================================================
     WORD GAME
  ======================================================= */

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
      words[
        Math.floor(
          Math.random() *
          words.length
        )
      ];

    let answer = "";


    openGameModal(

      "🔤 Word Builder",

      `

        <p class="word-hint">
          ${item.hint}
        </p>

        <h2 id="wordDisplay">
          ${"_ ".repeat(
            item.word.length
          )}
        </h2>

        <div
          class="letter-buttons"
          id="letterButtons"
        >

          ${shuffle(
            item.word.split("")
          )
            .map(letter => `

              <button
                class="letter-btn"
                data-letter="${letter}"
              >
                ${letter}
              </button>

            `)
            .join("")}

        </div>

        <button
          class="btn btn-primary"
          id="wordSubmit"
        >
          Check Word
        </button>

      `
    );


    const display =
      $("#wordDisplay");


    $$(".letter-btn")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            if (
              answer.length >=
              item.word.length
            ) {
              return;
            }

            answer +=
              button.dataset.letter;

            button.disabled =
              true;


            if (display) {

              display.textContent =
                answer
                  .padEnd(
                    item.word.length,
                    "_"
                  )
                  .split("")
                  .join(" ");

            }

          }
        );

      });


    const submit =
      $("#wordSubmit");


    if (submit) {

      submit.addEventListener(
        "click",
        () => {

          if (
            answer === item.word
          ) {

            correctSound();

            addCoins(
              20,
              false
            );

            addXP(
              40,
              false
            );

            completeActivity();

            showToast(
              "🎉",
              "Correct word!"
            );

            createConfetti();


            setTimeout(
              () =>
                closeModal(
                  "gameModal"
                ),
              1000
            );

          } else {

            wrongSound();

            showToast(
              "💡",
              "Try again!"
            );

          }

        }
      );

    }
  }


  /* =======================================================
     MATH GAME
  ======================================================= */

  function startMathGame() {

    const first =
      Math.floor(
        Math.random() * 20
      ) + 1;

    const second =
      Math.floor(
        Math.random() * 20
      ) + 1;

    const operations = [
      "+",
      "-",
      "×"
    ];

    const operation =
      operations[
        Math.floor(
          Math.random() *
          operations.length
        )
      ];

    let answer;


    if (operation === "+") {

      answer =
        first + second;

    } else if (
      operation === "-"
    ) {

      const big =
        Math.max(
          first,
          second
        );

      const small =
        Math.min(
          first,
          second
        );

      answer =
        big - small;

    } else {

      answer =
        first * second;

    }


    const options =
      new Set();

    options.add(
      answer
    );


    while (
      options.size < 4
    ) {

      const variation =
        answer +
        Math.floor(
          Math.random() * 11
        ) -
        5;

      if (
        variation >= 0
      ) {
        options.add(
          variation
        );
      }

    }


    openGameModal(

      "➕ Math Challenge",

      `

        <div class="math-question">

          <div
            style="
              font-size:42px;
              font-weight:800;
            "
          >
            ${first}
            ${operation}
            ${second}
            = ?
          </div>

          <div
            class="quiz-options"
          >

            ${shuffle([...options])
              .map(number => `

                <button
                  class="quiz-option math-answer"
                  data-answer="${number}"
                >
                  ${number}
                </button>

              `)
              .join("")}

          </div>

        </div>

      `
    );


    $$(".math-answer")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const selected =
              Number(
                button.dataset.answer
              );


            if (
              selected === answer
            ) {

              correctSound();

              button.classList.add(
                "correct"
              );

              addCoins(
                15,
                false
              );

              addXP(
                35,
                false
              );

              completeActivity();

              showToast(
                "🎉",
                "Correct answer!"
              );

              createConfetti();


              setTimeout(
                () =>
                  closeModal(
                    "gameModal"
                  ),
                1000
              );

            } else {

              wrongSound();

              button.classList.add(
                "wrong"
              );

              player.hearts =
                Math.max(
                  0,
                  player.hearts - 1
                );

              updatePlayerUI();

              showToast(
                "💡",
                `Answer was ${answer}`
              );

            }

          }
        );

      });

  }


  /* =======================================================
     COLOR GAME
  ======================================================= */

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
        Math.floor(
          Math.random() *
          colors.length
        )
      ];


    let options =
      shuffle(colors)
        .slice(0, 4);


    if (
      !options.some(
        item =>
          item.name ===
          target.name
      )
    ) {

      options[0] =
        target;

    }


    options =
      shuffle(options);


    openGameModal(

      "🎨 Color Game",

      `

        <h3>
          Find the
          <strong>
            ${target.name}
          </strong>
          color!
        </h3>

        <div
          class="color-options"
          style="
            display:grid;
            grid-template-columns:
              repeat(2,1fr);
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


    $$(".color-answer")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const selected =
              button.dataset.color;


            if (
              selected ===
              target.name
            ) {

              correctSound();

              button.style.outline =
                "5px solid #22c55e";

              addCoins(
                15,
                false
              );

              addXP(
                35,
                false
              );

              completeActivity();

              showToast(
                "🎉",
                "Great color match!"
              );

              createConfetti();


              setTimeout(
                () =>
                  closeModal(
                    "gameModal"
                  ),
                1000
              );

            } else {

              wrongSound();

              button.style.outline =
                "5px solid #ef4444";

              player.hearts =
                Math.max(
                  0,
                  player.hearts - 1
                );

              updatePlayerUI();

              showToast(
                "💡",
                "Try another color!"
              );

            }

          }
        );

      });

  }


  /* =======================================================
     NUMBER HUNT
  ======================================================= */

  function startNumberGame() {

    const target =
      Math.floor(
        Math.random() * 20
      ) + 1;

    const numbers =
      new Set();

    numbers.add(
      target
    );


    while (
      numbers.size < 6
    ) {

      numbers.add(
        Math.floor(
          Math.random() * 20
        ) + 1
      );

    }


    openGameModal(

      "🔢 Number Hunt",

      `

        <h3>
          Find number
          <strong>
            ${target}
          </strong>
        </h3>

        <div
          class="number-options"
          style="
            display:grid;
            grid-template-columns:
              repeat(3,1fr);
            gap:12px;
            margin-top:20px;
          "
        >

          ${shuffle([...numbers])
            .map(number => `

              <button
                class="number-answer"
                data-number="${number}"
                style="
                  min-height:70px;
                  border-radius:16px;
                  border:
                    2px solid #ddd;
                  background:white;
                  cursor:pointer;
                  font-size:24px;
                  font-weight:800;
                "
              >
                ${number}
              </button>

            `)
            .join("")}

        </div>

      `
    );


    $$(".number-answer")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const selected =
              Number(
                button.dataset.number
              );


            if (
              selected === target
            ) {

              correctSound();

              button.style.transform =
                "scale(1.08)";

              addCoins(
                15,
                false
              );

              addXP(
                35,
                false
              );

              completeActivity();

              showToast(
                "🎉",
                "You found the number!"
              );

              createConfetti();


              setTimeout(
                () =>
                  closeModal(
                    "gameModal"
                  ),
                1000
              );

            } else {

              wrongSound();

              button.style.opacity =
                "0.4";

              player.hearts =
                Math.max(
                  0,
                  player.hearts - 1
                );

              updatePlayerUI();

              showToast(
                "🔎",
                "Keep looking!"
              );

            }

          }
        );

      });

  }


  /* =======================================================
     EXTRA GAMES
  ======================================================= */

  function addExtraGames() {

    const gamesSection =
      $("#games");

    if (!gamesSection) return;


    const container =
      gamesSection.querySelector(
        ".games-grid"
      ) ||
      gamesSection.querySelector(
        ".games-container"
      ) ||
      gamesSection.querySelector(
        ".cards-grid"
      );


    if (!container) return;


    const games = [

      {
        game: "spelling",
        icon: "🔤",
        title: "Spelling Star",
        text:
          "Build words and improve spelling!"
      },

      {
        game: "counting",
        icon: "🔢",
        title: "Counting Fun",
        text:
          "Count objects and find the answer!"
      },

      {
        game: "shapes",
        icon: "🔷",
        title: "Shape Match",
        text:
          "Learn different shapes!"
      },

      {
        game: "animals",
        icon: "🐾",
        title: "Animal World",
        text:
          "Test your animal knowledge!"
      },

      {
        game: "capitals",
        icon: "🌎",
        title: "World Capitals",
        text:
          "Match countries and capitals!"
      },

      {
        game: "puzzle",
        icon: "🧩",
        title: "Brain Puzzle",
        text:
          "Solve quick brain challenges!"
      },

      {
        game: "timed",
        icon: "⏱️",
        title: "60 Sec Challenge",
        text:
          "How many can you solve?"
      }

    ];


    games.forEach(game => {

      if (
        container.querySelector(
          `[data-game="${game.game}"]`
        )
      ) {
        return;
      }


      const card =
        document.createElement(
          "article"
        );

      card.className =
        "game-card extra-game-card";

      /* Important for CSS colors */

      card.dataset.game =
        game.game;


      card.innerHTML = `

        <div class="game-icon">
          ${game.icon}
        </div>

        <h3>
          ${game.title}
        </h3>

        <p>
          ${game.text}
        </p>

        <button
          class="play-button"
          data-game="${game.game}"
        >
          Play
        </button>

      `;


      container.appendChild(
        card
      );

    });

  }


  /* =======================================================
     EXTRA GAME MODAL
  ======================================================= */

  function extraModal(
    title,
    content
  ) {

    const gameContent =
      $("#gameContent");

    if (!gameContent) return;


    gameContent.innerHTML = `

      <div class="game-title">
        <h2>${title}</h2>
      </div>

      <div class="game-body">
        ${content}
      </div>

    `;


    openModal(
      "gameModal"
    );
  }


  /* =======================================================
     SPELLING
  ======================================================= */

  function startSpellingGame() {

    const words = [

      {
        word: "APPLE",
        emoji: "🍎"
      },

      {
        word: "HOUSE",
        emoji: "🏠"
      },

      {
        word: "TIGER",
        emoji: "🐯"
      },

      {
        word: "ROCKET",
        emoji: "🚀"
      },

      {
        word: "PENCIL",
        emoji: "✏️"
      }

    ];


    const item =
      words[
        Math.floor(
          Math.random() *
          words.length
        )
      ];


    const scrambled =
      shuffle(
        item.word.split("")
      ).join(" ");


    extraModal(

      "🔤 Spelling Star",

      `

        <div
          style="text-align:center;"
        >

          <div
            style="
              font-size:64px;
              margin:15px;
            "
          >
            ${item.emoji}
          </div>

          <p>
            Unscramble this word:
          </p>

          <h2
            style="
              letter-spacing:7px;
            "
          >
            ${scrambled}
          </h2>

          <input
            id="spellingInput"
            class="text-input"
            placeholder="Type the word"
            autocomplete="off"
          >

          <button
            id="spellingCheck"
            class="btn btn-primary"
          >
            Check Answer
          </button>

        </div>

      `
    );


    const input =
      $("#spellingInput");

    const check =
      $("#spellingCheck");


    if (!check) return;


    check.addEventListener(
      "click",
      () => {

        const answer =
          input.value
            .trim()
            .toUpperCase();


        if (
          answer === item.word
        ) {

          correctSound();

          addCoins(
            15,
            false
          );

          addXP(
            35,
            false
          );

          completeActivity();

          showToast(
            "🎉",
            "Perfect spelling!"
          );

          createConfetti();


          setTimeout(
            () =>
              closeModal(
                "gameModal"
              ),
            1000
          );

        } else {

          wrongSound();

          showToast(
            "💡",
            "Try again!"
          );

        }

      }
    );

  }


  /* =======================================================
     COUNTING
  ======================================================= */

  function startCountingGame() {

    const count =
      Math.floor(
        Math.random() * 8
      ) + 3;


    const emojis = [
      "🍎",
      "⭐",
      "🐟",
      "🌸",
      "🍭",
      "🚀"
    ];


    const emoji =
      emojis[
        Math.floor(
          Math.random() *
          emojis.length
        )
      ];


    const options =
      new Set();

    options.add(
      count
    );


    while (
      options.size < 4
    ) {

      const value =
        count +
        Math.floor(
          Math.random() * 7
        ) -
        3;

      if (value > 0) {
        options.add(
          value
        );
      }

    }


    extraModal(

      "🔢 Counting Fun",

      `

        <div
          style="text-align:center;"
        >

          <p>
            How many do you see?
          </p>

          <div
            class="counting-items"
          >
            ${emoji.repeat(
              count
            )}
          </div>

          <div
            style="
              display:grid;
              grid-template-columns:
                repeat(2,1fr);
              gap:12px;
              margin-top:20px;
            "
          >

            ${shuffle([...options])
              .map(number => `

                <button
                  class="
                    quiz-option
                    count-answer
                  "
                  data-answer="${number}"
                >
                  ${number}
                </button>

              `)
              .join("")}

          </div>

        </div>

      `
    );


    $$(".count-answer")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            if (
              Number(
                button.dataset.answer
              ) === count
            ) {

              correctSound();

              addCoins(
                15,
                false
              );

              addXP(
                30,
                false
              );

              completeActivity();

              showToast(
                "🎉",
                "Great counting!"
              );

              createConfetti();


              setTimeout(
                () =>
                  closeModal(
                    "gameModal"
                  ),
                1000
              );

            } else {

              wrongSound();

              showToast(
                "💡",
                "Count again!"
              );

            }

          }
        );

      });

  }


  /* =======================================================
     SHAPES
  ======================================================= */

  function startShapesGame() {

    const shapes = [

      {
        name: "Circle",
        symbol: "●"
      },

      {
        name: "Square",
        symbol: "■"
      },

      {
        name: "Triangle",
        symbol: "▲"
      },

      {
        name: "Diamond",
        symbol: "◆"
      }

    ];


    const target =
      shapes[
        Math.floor(
          Math.random() *
          shapes.length
        )
      ];


    extraModal(

      "🔷 Shape Match",

      `

        <div
          style="text-align:center;"
        >

          <p>
            Find the:
          </p>

          <h2>
            ${target.name}
          </h2>

          <div
            style="
              display:grid;
              grid-template-columns:
                repeat(2,1fr);
              gap:15px;
              margin-top:20px;
            "
          >

            ${shuffle(shapes)
              .map(shape => `

                <button
                  class="shape-answer"
                  data-shape="${shape.name}"
                  style="
                    min-height:90px;
                    border:
                      2px solid #ddd;
                    border-radius:20px;
                    background:white;
                    font-size:50px;
                    cursor:pointer;
                  "
                >
                  ${shape.symbol}
                </button>

              `)
              .join("")}

          </div>

        </div>

      `
    );


    $$(".shape-answer")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            if (
              button.dataset.shape ===
              target.name
            ) {

              correctSound();

              addCoins(
                15,
                false
              );

              addXP(
                30,
                false
              );

              completeActivity();

              showToast(
                "🎉",
                "Amazing shape!"
              );

              createConfetti();


              setTimeout(
                () =>
                  closeModal(
                    "gameModal"
                  ),
                1000
              );

            } else {

              wrongSound();

              showToast(
                "💡",
                "Try another shape!"
              );

            }

          }
        );

      });

  }


  /* =======================================================
     ANIMALS
  ======================================================= */

  function startAnimalsGame() {

    const questions = [

      {
        question:
          "Which animal says Meow?",
        answer:
          "Cat",
        options:
          [
            "Cat",
            "Dog",
            "Cow",
            "Horse"
          ]
      },

      {
        question:
          "Which animal has a long trunk?",
        answer:
          "Elephant",
        options:
          [
            "Lion",
            "Elephant",
            "Rabbit",
            "Fish"
          ]
      },

      {
        question:
          "Which animal gives us milk?",
        answer:
          "Cow",
        options:
          [
            "Tiger",
            "Cow",
            "Eagle",
            "Snake"
          ]
      },

      {
        question:
          "Which animal can fly?",
        answer:
          "Bird",
        options:
          [
            "Bird",
            "Cow",
            "Dog",
            "Horse"
          ]
      }

    ];


    const item =
      questions[
        Math.floor(
          Math.random() *
          questions.length
        )
      ];


    extraModal(

      "🐾 Animal World",

      `

        <div
          style="text-align:center;"
        >

          <h3>
            ${item.question}
          </h3>

          <div
            style="
              display:grid;
              grid-template-columns:
                repeat(2,1fr);
              gap:12px;
              margin-top:20px;
            "
          >

            ${item.options
              .map(option => `

                <button
                  class="
                    quiz-option
                    animal-answer
                  "
                  data-answer="${option}"
                >
                  ${option}
                </button>

              `)
              .join("")}

          </div>

        </div>

      `
    );


    $$(".animal-answer")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            if (
              button.dataset.answer ===
              item.answer
            ) {

              correctSound();

              addCoins(
                15,
                false
              );

              addXP(
                35,
                false
              );

              completeActivity();

              showToast(
                "🎉",
                "Great animal knowledge!"
              );

              createConfetti();


              setTimeout(
                () =>
                  closeModal(
                    "gameModal"
                  ),
                1000
              );

            } else {

              wrongSound();

              showToast(
                "💡",
                "Not quite!"
              );

            }

          }
        );

      });

  }


  /* =======================================================
     CAPITALS
  ======================================================= */

  function startCapitalsGame() {

    const countries = [

      {
        country: "Pakistan",
        capital: "Islamabad"
      },

      {
        country: "France",
        capital: "Paris"
      },

      {
        country: "Japan",
        capital: "Tokyo"
      },

      {
        country: "Turkey",
        capital: "Ankara"
      },

      {
        country: "United Kingdom",
        capital: "London"
      },

      {
        country: "Egypt",
        capital: "Cairo"
      }

    ];


    const item =
      countries[
        Math.floor(
          Math.random() *
          countries.length
        )
      ];


    let options =
      shuffle(
        countries.map(
          item =>
            item.capital
        )
      ).slice(0, 4);


    if (
      !options.includes(
        item.capital
      )
    ) {

      options[0] =
        item.capital;

    }


    extraModal(

      "🌎 World Capitals",

      `

        <div
          style="text-align:center;"
        >

          <h3>
            What is the capital of
            <strong>
              ${item.country}
            </strong>?
          </h3>

          <div
            style="
              display:grid;
              grid-template-columns:
                repeat(2,1fr);
              gap:12px;
              margin-top:20px;
            "
          >

            ${shuffle(options)
              .map(capital => `

                <button
                  class="
                    quiz-option
                    capital-answer
                  "
                  data-answer="${capital}"
                >
                  ${capital}
                </button>

              `)
              .join("")}

          </div>

        </div>

      `
    );


    $$(".capital-answer")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            if (
              button.dataset.answer ===
              item.capital
            ) {

              correctSound();

              addCoins(
                20,
                false
              );

              addXP(
                40,
                false
              );

              completeActivity();

              showToast(
                "🌎",
                "Excellent!"
              );

              createConfetti();


              setTimeout(
                () =>
                  closeModal(
                    "gameModal"
                  ),
                1000
              );

            } else {

              wrongSound();

              showToast(
                "💡",
                `Answer: ${item.capital}`
              );

            }

          }
        );

      });

  }


  /* =======================================================
     PUZZLE
  ======================================================= */

  function startPuzzleGame() {

    const puzzles = [

      {
        question:
          "I have hands but cannot clap. What am I?",
        answer:
          "Clock",
        options:
          [
            "Clock",
            "Chair",
            "Book",
            "Ball"
          ]
      },

      {
        question:
          "I am yellow and shine in the sky. What am I?",
        answer:
          "Sun",
        options:
          [
            "Moon",
            "Sun",
            "Cloud",
            "Star"
          ]
      },

      {
        question:
          "I have four legs and a seat. What am I?",
        answer:
          "Chair",
        options:
          [
            "Table",
            "Chair",
            "Window",
            "Door"
          ]
      }

    ];


    const item =
      puzzles[
        Math.floor(
          Math.random() *
          puzzles.length
        )
      ];


    extraModal(

      "🧩 Brain Puzzle",

      `

        <div
          style="text-align:center;"
        >

          <div
            style="font-size:60px;"
          >
            🧠
          </div>

          <h3>
            ${item.question}
          </h3>

          <div
            style="
              display:grid;
              grid-template-columns:
                repeat(2,1fr);
              gap:12px;
              margin-top:20px;
            "
          >

            ${item.options
              .map(option => `

                <button
                  class="
                    quiz-option
                    puzzle-answer
                  "
                  data-answer="${option}"
                >
                  ${option}
                </button>

              `)
              .join("")}

          </div>

        </div>

      `
    );


    $$(".puzzle-answer")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            if (
              button.dataset.answer ===
              item.answer
            ) {

              correctSound();

              addCoins(
                20,
                false
              );

              addXP(
                40,
                false
              );

              completeActivity();

              showToast(
                "🧠",
                "Brain power!"
              );

              createConfetti();


              setTimeout(
                () =>
                  closeModal(
                    "gameModal"
                  ),
                1000
              );

            } else {

              wrongSound();

              showToast(
                "💡",
                "Think again!"
              );

            }

          }
        );

      });

  }


  /* =======================================================
     TIMED GAME
  ======================================================= */

  let timedInterval = null;


  function startTimedGame() {

    clearInterval(
      timedInterval
    );

    let timeLeft = 60;
    let score = 0;
    let currentAnswer = 0;


    function renderTimedQuestion() {

      const a =
        Math.floor(
          Math.random() * 10
        ) + 1;

      const b =
        Math.floor(
          Math.random() * 10
        ) + 1;

      currentAnswer =
        a + b;


      const options =
        new Set();

      options.add(
        currentAnswer
      );


      while (
        options.size < 4
      ) {

        options.add(

          Math.max(

            1,

            currentAnswer +

            Math.floor(
              Math.random() * 9
            ) -

            4

          )

        );

      }


      extraModal(

        "⏱️ 60 Second Challenge",

        `

          <div
            style="text-align:center;"
          >

            <div
              style="
                font-size:35px;
                font-weight:800;
              "
            >
              ⏱️
              <span id="timedTimer">
                ${timeLeft}
              </span>
            </div>

            <p>
              Score:
              <strong id="timedScore">
                ${score}
              </strong>
            </p>

            <h2>
              ${a} + ${b} = ?
            </h2>

            <div
              style="
                display:grid;
                grid-template-columns:
                  repeat(2,1fr);
                gap:12px;
              "
            >

              ${shuffle([...options])
                .map(option => `

                  <button
                    class="
                      quiz-option
                      timed-answer
                    "
                    data-answer="${option}"
                  >
                    ${option}
                  </button>

                `)
                .join("")}

            </div>

          </div>

        `
      );


      $$(".timed-answer")
        .forEach(button => {

          button.addEventListener(
            "click",
            () => {

              const selected =
                Number(
                  button.dataset.answer
                );


              if (
                selected ===
                currentAnswer
              ) {

                correctSound();

                score++;

                showToast(
                  "⚡",
                  "+1"
                );

              } else {

                wrongSound();

                showToast(
                  "💡",
                  "Wrong!"
                );

              }


              renderTimedQuestion();

            }
          );

        });

    }


    renderTimedQuestion();


    timedInterval =
      setInterval(() => {

        timeLeft--;


        const timer =
          $("#timedTimer");

        if (timer) {

          timer.textContent =
            timeLeft;

        }


        if (
          timeLeft <= 0
        ) {

          clearInterval(
            timedInterval
          );

          finishTimedGame(
            score
          );

        }

      }, 1000);

  }


  function finishTimedGame(
    score
  ) {

    clearInterval(
      timedInterval
    );

    timedInterval = null;


    const coins =
      Math.min(
        score * 3,
        50
      );

    const xp =
      Math.min(
        score * 5,
        100
      );


    if (score > 0) {

      player.coins +=
        coins;

      player.xp +=
        xp;

      completeActivity();

      rewardSound();

      updatePlayerUI();

    }


    extraModal(

      "🏆 Time's Up!",

      `

        <div
          style="text-align:center;"
        >

          <div
            style="font-size:65px;"
          >
            ⏰
          </div>

          <h2>
            Great effort!
          </h2>

          <p>
            Your score:
            <strong>
              ${score}
            </strong>
          </p>

          <p>
            🪙 Coins earned:
            ${coins}
          </p>

          <button
            class="btn btn-primary"
            id="timedDone"
          >
            Done
          </button>

        </div>

      `
    );


    const done =
      $("#timedDone");


    if (done) {

      done.addEventListener(
        "click",
        () =>
          closeModal(
            "gameModal"
          )
      );

    }

  }


  /* =======================================================
     🎵 KIDS POEMS / RHYMES
  ======================================================= */

  const wonderKidsPoems = [

    {
      title:
        "🌈 Rainbow Adventure",

      emoji:
        "🌈",

      color:
        "rainbow",

      lines: [

        "Rainbow bright up in the sky,",

        "Seven colors way up high.",

        "Red and orange, yellow too,",

        "Green and blue and purple hue.",

        "Smile and wave, come dance with me,",

        "Rainbow friends for all to see!"

      ]
    },


    {
      title:
        "🐱 Little Kitty",

      emoji:
        "🐱",

      color:
        "kitty",

      lines: [

        "Little kitty soft and small,",

        "Chasing shadows on the wall.",

        "Jumping here and running there,",

        "Playing with a ball of hair.",

        "When the day is nearly through,",

        "Kitty dreams of stars so blue."

      ]
    },


    {
      title:
        "🔢 Counting Fun",

      emoji:
        "🔢",

      color:
        "numbers",

      lines: [

        "One little star shines bright,",

        "Two little birds take flight.",

        "Three red apples in a row,",

        "Four green leaves begin to grow.",

        "Five small fingers wave hello,",

        "Counting numbers — off we go!"

      ]
    },


    {
      title:
        "🐻 Animal Friends",

      emoji:
        "🐻",

      color:
        "animals",

      lines: [

        "Bear says hello with a happy cheer,",

        "Rabbit hops and comes so near.",

        "Little birds sing in the tree,",

        "Butterflies dance happily.",

        "Every animal, big or small,",

        "Has a special place for all."

      ]
    },


    {
      title:
        "⭐ Good Morning",

      emoji:
        "☀️",

      color:
        "morning",

      lines: [

        "Good morning, sunshine bright,",

        "Wake up happy, feel the light.",

        "Brush your teeth and comb your hair,",

        "Put your clothes on with great care.",

        "Smile and say, Today I'll grow!",

        "There are wonderful things to know!"

      ]
    },


    {
      title:
        "🌙 Sleepy Little Star",

      emoji:
        "🌙",

      color:
        "bedtime",

      lines: [

        "Sleepy little star above,",

        "Shining with a gentle love.",

        "Close your eyes and rest your head,",

        "Dream of flowers, blue and red.",

        "Moon is watching from afar,",

        "Good night, my little star."

      ]
    }

  ];


  let currentPoemIndex = 0;

  let poemSpeaking = false;

  let poemCompleted = false;

  let poemSpeech = null;

  let poemPianoTimer = null;

  let poemPianoPlaying = false;


  /* =======================================================
     POEM CSS
  ======================================================= */

  function addPoemCSS() {

    if (
      $("#wonderKidsPoemCSS")
    ) {
      return;
    }


    const style =
      document.createElement(
        "style"
      );

    style.id =
      "wonderKidsPoemCSS";


    style.textContent = `

      .poems-section {
        padding: 80px 0;
        background:
          linear-gradient(
            180deg,
            #fffaff 0%,
            #f7fbff 50%,
            #fffdf4 100%
          );
        position: relative;
        overflow: hidden;
      }

      .poems-section::before {
        content: "🎵";
        position: absolute;
        top: 30px;
        left: 5%;
        font-size: 55px;
        opacity: .12;
        transform: rotate(-12deg);
      }

      .poems-section::after {
        content: "⭐";
        position: absolute;
        right: 7%;
        bottom: 35px;
        font-size: 60px;
        opacity: .12;
        transform: rotate(12deg);
      }

      .poems-grid {
        display: grid;
        grid-template-columns:
          repeat(3, minmax(0, 1fr));
        gap: 22px;
        margin-top: 35px;
      }

      .poem-card {
        position: relative;
        min-height: 300px;
        border-radius: 26px;
        padding: 25px;
        overflow: hidden;
        border: 2px solid rgba(255,255,255,.8);
        box-shadow:
          0 14px 35px rgba(70,75,120,.10);
        transition:
          transform .25s ease,
          box-shadow .25s ease;
      }

      .poem-card:hover {
        transform: translateY(-7px);
        box-shadow:
          0 20px 45px rgba(70,75,120,.16);
      }

      .poem-card::before {
        content: "";
        position: absolute;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: rgba(255,255,255,.35);
        right: -35px;
        top: -35px;
      }

      .poem-card.rainbow {
        background:
          linear-gradient(
            135deg,
            #fff0f7,
            #eef5ff
          );
      }

      .poem-card.kitty {
        background:
          linear-gradient(
            135deg,
            #fff5e9,
            #fff0f8
          );
      }

      .poem-card.numbers {
        background:
          linear-gradient(
            135deg,
            #eefaff,
            #eef4ff
          );
      }

      .poem-card.animals {
        background:
          linear-gradient(
            135deg,
            #effff5,
            #fff9df
          );
      }

      .poem-card.morning {
        background:
          linear-gradient(
            135deg,
            #fff9d9,
            #fff0dc
          );
      }

      .poem-card.bedtime {
        background:
          linear-gradient(
            135deg,
            #eeeaff,
            #eaf2ff
          );
      }

      .poem-emoji {
        width: 75px;
        height: 75px;
        border-radius: 22px;
        background: rgba(255,255,255,.8);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 43px;
        margin-bottom: 17px;
        box-shadow:
          0 8px 20px rgba(50,50,90,.08);
      }

      .poem-card h3 {
        margin: 0 0 8px;
        font-size: 23px;
        font-weight: 800;
        color: #29314d;
      }

      .poem-card p {
        margin: 0 0 20px;
        color: #77809c;
        line-height: 1.55;
        font-size: 14px;
      }

      .poem-play-btn {
        width: 100%;
        border: 0;
        min-height: 46px;
        border-radius: 15px;
        background: #6c63ff;
        color: white;
        font-family: inherit;
        font-size: 16px;
        font-weight: 800;
        cursor: pointer;
        transition: .2s ease;
      }

      .poem-play-btn:hover {
        transform: translateY(-2px);
        background: #5148d8;
      }

      .poem-modal-content {
        text-align: center;
      }

      .poem-big-emoji {
        font-size: 70px;
        margin-bottom: 5px;
        animation:
          poemBounce 1.5s
          infinite
          ease-in-out;
      }

      @keyframes poemBounce {

        0%,100% {
          transform:
            translateY(0);
        }

        50% {
          transform:
            translateY(-8px);
        }

      }

      .poem-text-box {
        background: #f7f8ff;
        border-radius: 22px;
        padding: 22px;
        margin: 15px 0 22px;
        text-align: center;
        border:
          2px solid #e7e9f5;
      }

      .poem-line {
        font-size: 19px;
        line-height: 1.65;
        font-weight: 600;
        color: #29314d;
        margin: 4px 0;
        transition: .25s ease;
      }

      .poem-progress {
        height: 8px;
        background: #e7e9f5;
        border-radius: 20px;
        overflow: hidden;
        margin: 20px 0 8px;
      }

      .poem-progress-fill {
        height: 100%;
        width: 0%;
        background:
          linear-gradient(
            90deg,
            #6c63ff,
            #ff6fae,
            #ffc928
          );
        border-radius: inherit;
        transition:
          width .3s ease;
      }

      .poem-status {
        color: #77809c;
        font-size: 13px;
        font-weight: 700;
      }

      .poem-controls {
        display: grid;
        grid-template-columns:
          repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin-top: 15px;
      }

      .poem-control {
        border: 0;
        min-height: 45px;
        border-radius: 14px;
        background: #f0f1ff;
        color: #29314d;
        font-family: inherit;
        font-weight: 800;
        cursor: pointer;
        transition: .2s ease;
      }

      .poem-control:hover {
        transform:
          translateY(-2px);
        background: #e3e4ff;
      }

      .poem-control.primary {
        background: #6c63ff;
        color: white;
      }

      @media (max-width: 900px) {

        .poems-grid {
          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );
        }

      }

      @media (max-width: 560px) {

        .poems-section {
          padding: 55px 0;
        }

        .poems-grid {
          grid-template-columns: 1fr;
        }

        .poem-card {
          min-height: auto;
        }

        .poem-controls {
          grid-template-columns: 1fr;
        }

        .poem-line {
          font-size: 17px;
        }

      }

    `;


    document.head.appendChild(
      style
    );
  }


  /* =======================================================
     CREATE POEMS SECTION
  ======================================================= */

  function createPoemsSection() {

    if ($("#poems")) {
      return;
    }


    const gamesSection =
      $("#games");

    if (!gamesSection) {
      return;
    }


    const section =
      document.createElement(
        "section"
      );

    section.id =
      "poems";

    section.className =
      "content-section poems-section";


    section.innerHTML = `

      <div class="container">

        <div class="section-heading">

          <div>

            <span class="section-kicker">
              🎵 READ • SING • LEARN
            </span>

            <h2>
              Kids Poems & Rhymes
            </h2>

          </div>

          <p>
            Read, listen and sing along
            with fun little poems!
          </p>

        </div>


        <div class="poems-grid">

          ${wonderKidsPoems
            .map(
              (poem, index) => {

                const preview =
                  poem.lines
                    .slice(0, 2)
                    .join(" ");

                return `

                  <article
                    class="
                      poem-card
                      ${poem.color}
                    "
                  >

                    <div
                      class="poem-emoji"
                    >
                      ${poem.emoji}
                    </div>

                    <h3>
                      ${poem.title}
                    </h3>

                    <p>
                      ${preview}
                    </p>

                    <button
                      class="poem-play-btn"
                      data-poem-index="${index}"
                    >
                      ▶️ Play Poem
                    </button>

                  </article>

                `;

              }
            )
            .join("")}

        </div>

      </div>

    `;


    gamesSection.parentNode.insertBefore(
      section,
      gamesSection
    );

  }


  /* =======================================================
     OPEN POEM
  ======================================================= */

  function openPoem(index) {

    currentPoemIndex =
      index;

    const poem =
      wonderKidsPoems[
        currentPoemIndex
      ];

    if (!poem) return;


    stopPoemAudio();

    poemCompleted =
      false;


    const linesHTML =
      poem.lines
        .map(
          line => `

            <div
              class="poem-line"
            >
              ${line}
            </div>

          `
        )
        .join("");


    const content = `

      <div
        class="poem-modal-content"
      >

        <div
          class="poem-big-emoji"
        >
          ${poem.emoji}
        </div>

        <h2>
          ${poem.title}
        </h2>

        <div
          class="poem-text-box"
        >
          ${linesHTML}
        </div>

        <div
          class="poem-progress"
        >
          <div
            id="poemProgressFill"
            class="poem-progress-fill"
          ></div>
        </div>

        <div
          id="poemStatus"
          class="poem-status"
        >
          Ready to sing! 🎵
        </div>

        <div
          class="poem-controls"
        >

          <button
            id="poemReadBtn"
            class="
              poem-control
              primary
            "
          >
            🔊 Read Aloud
          </button>

          <button
            id="poemMusicBtn"
            class="poem-control"
          >
            🎹 Piano
          </button>

          <button
            id="poemNextBtn"
            class="poem-control"
          >
            ⏭️ Next
          </button>

        </div>

      </div>

    `;


    openGameModal(
      poem.title,
      content
    );


    setupPoemControls();
  }


  /* =======================================================
     POEM CONTROLS
  ======================================================= */

  function setupPoemControls() {

    const readBtn =
      $("#poemReadBtn");

    const musicBtn =
      $("#poemMusicBtn");

    const nextBtn =
      $("#poemNextBtn");


    if (readBtn) {

      readBtn.addEventListener(
        "click",
        togglePoemSpeech
      );

    }


    if (musicBtn) {

      musicBtn.addEventListener(
        "click",
        togglePoemPiano
      );

    }


    if (nextBtn) {

      nextBtn.addEventListener(
        "click",
        nextPoem
      );

    }

  }


  /* =======================================================
     READ ALOUD
  ======================================================= */

  function togglePoemSpeech() {

    if (
      !(
        "speechSynthesis"
        in window
      )
    ) {

      showToast(
        "🔊",
        "Voice reading is not supported."
      );

      return;
    }


    if (poemSpeaking) {

      window.speechSynthesis.cancel();

      poemSpeaking =
        false;


      const btn =
        $("#poemReadBtn");

      if (btn) {

        btn.textContent =
          "🔊 Read Aloud";

      }

      return;
    }


    const poem =
      wonderKidsPoems[
        currentPoemIndex
      ];

    if (!poem) return;


    window.speechSynthesis.cancel();


    poemSpeech =
      new SpeechSynthesisUtterance(
        poem.lines.join(" ")
      );


    poemSpeech.rate =
      0.82;

    poemSpeech.pitch =
      1.15;

    poemSpeech.volume =
      1;


    poemSpeech.onstart =
      () => {

        poemSpeaking =
          true;


        const btn =
          $("#poemReadBtn");

        if (btn) {

          btn.textContent =
            "⏸️ Stop Reading";

        }


        showToast(
          "🔊",
          "Poem is reading..."
        );

      };


    poemSpeech.onend =
      () => {

        poemSpeaking =
          false;


        const btn =
          $("#poemReadBtn");

        if (btn) {

          btn.textContent =
            "🔊 Read Aloud";

        }


        completePoem();

      };


    window.speechSynthesis.speak(
      poemSpeech
    );

  }


  /* =======================================================
     POEM PIANO
  ======================================================= */

  function togglePoemPiano() {

    if (
      poemPianoPlaying
    ) {

      stopPoemPiano();

    } else {

      startPoemPiano();

    }

  }


  function startPoemPiano() {

    stopPoemPiano();

    poemPianoPlaying =
      true;


    const musicBtn =
      $("#poemMusicBtn");

    if (musicBtn) {

      musicBtn.textContent =
        "⏹️ Stop Piano";

    }


    const melody = [

      "C4",
      "E4",
      "G4",
      "E4",

      "F4",
      "A4",
      "G4",
      "E4",

      "C4",
      "D4",
      "E4",
      "G4",

      "C5",
      "G4",
      "E4",
      "C4"

    ];


    let index = 0;


    function playNextNote() {

      if (
        !poemPianoPlaying
      ) {
        return;
      }


      const note =
        pianoNotes[
          melody[index]
        ];


      if (note) {

        playPianoNote(
          note,
          0.58,
          0.045
        );

      }


      index++;


      if (
        index >=
        melody.length
      ) {

        index = 0;

      }


      poemPianoTimer =
        setTimeout(
          playNextNote,
          620
        );

    }


    playNextNote();


    showToast(
      "🎹",
      "Piano music started!"
    );

  }


  function stopPoemPiano() {

    poemPianoPlaying =
      false;


    clearTimeout(
      poemPianoTimer
    );


    poemPianoTimer =
      null;


    const musicBtn =
      $("#poemMusicBtn");


    if (musicBtn) {

      musicBtn.textContent =
        "🎹 Piano";

    }

  }


  function stopPoemAudio() {

    stopPoemPiano();


    if (
      "speechSynthesis"
      in window
    ) {

      window.speechSynthesis.cancel();

    }


    poemSpeaking =
      false;

  }


  function nextPoem() {

    stopPoemAudio();


    currentPoemIndex++;


    if (
      currentPoemIndex >=
      wonderKidsPoems.length
    ) {

      currentPoemIndex =
        0;

    }


    openPoem(
      currentPoemIndex
    );

  }


  function completePoem() {

    if (
      poemCompleted
    ) {
      return;
    }


    poemCompleted =
      true;


    addCoins(
      10,
      false
    );

    addXP(
      20,
      false
    );

    completeActivity();

    createConfetti();


    showToast(
      "🎵",
      "Wonderful! +10 coins +20 XP"
    );

  }


  /* =======================================================
     POEM BUTTON ROUTER
  ======================================================= */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          ".poem-play-btn"
        );

      if (!button) return;


      const index =
        Number(
          button.dataset.poemIndex
        );


      openPoem(index);

    }
  );


  /* =======================================================
     INITIALIZE POEMS
  ======================================================= */

  function initializePoems() {

    addPoemCSS();

    createPoemsSection();

  }


  /* =======================================================
     GAME BUTTON ROUTER
  ======================================================= */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          ".play-button[data-game]"
        );

      if (!button) return;


      const game =
        button.dataset.game;


      if (
        game === "memory"
      ) {

        event.preventDefault();

        startMemoryGame();

      }

      else if (
        game === "quiz"
      ) {

        event.preventDefault();

        startQuiz(
          "general"
        );

      }

      else if (
        game === "word"
      ) {

        event.preventDefault();

        startWordGame();

      }

      else if (
        game === "mathgame"
      ) {

        event.preventDefault();

        startMathGame();

      }

      else if (
        game === "color"
      ) {

        event.preventDefault();

        startColorGame();

      }

      else if (
        game === "number"
      ) {

        event.preventDefault();

        startNumberGame();

      }

      else if (
        game === "spelling"
      ) {

        event.preventDefault();

        startSpellingGame();

      }

      else if (
        game === "counting"
      ) {

        event.preventDefault();

        startCountingGame();

      }

      else if (
        game === "shapes"
      ) {

        event.preventDefault();

        startShapesGame();

      }

      else if (
        game === "animals"
      ) {

        event.preventDefault();

        startAnimalsGame();

      }

      else if (
        game === "capitals"
      ) {

        event.preventDefault();

        startCapitalsGame();

      }

      else if (
        game === "puzzle"
      ) {

        event.preventDefault();

        startPuzzleGame();

      }

      else if (
        game === "timed"
      ) {

        event.preventDefault();

        startTimedGame();

      }

    }
  );


  /* =======================================================
     QUIZ BUTTONS
  ======================================================= */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-quiz]"
        );

      if (!button) return;


      event.preventDefault();

      startQuiz(
        button.dataset.quiz
      );

    }
  );


  /* =======================================================
     CONTINUE BUTTON
  ======================================================= */

  const continueBtn =
    $("#continueBtn");


  if (continueBtn) {

    continueBtn.addEventListener(
      "click",
      () => {

        const learn =
          $("#learn");

        if (learn) {

          learn.scrollIntoView({
            behavior:
              "smooth"
          });

        }

      }
    );

  }


  /* =======================================================
     DAILY MISSION
  ======================================================= */

  const challengeBtn =
    $("#challengeBtn");


  if (challengeBtn) {

    challengeBtn.addEventListener(
      "click",
      () => {

        if (
          player.dailyProgress >= 3
        ) {

          showToast(
            "🏆",
            "Daily mission complete!"
          );

          return;

        }


        startQuiz(
          "general"
        );

      }
    );

  }


  /* =======================================================
     NAVIGATION
  ======================================================= */

  $$(".nav-link")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          $$(".nav-link")
            .forEach(item =>
              item.classList.remove(
                "active"
              )
            );

          link.classList.add(
            "active"
          );

        }
      );

    });


  $$('a[href^="#"]')
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const id =
            link.getAttribute(
              "href"
            );

          if (
            !id ||
            id === "#"
          ) {
            return;
          }


          const target =
            document.querySelector(
              id
            );

          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior:
              "smooth",
            block:
              "start"
          });

        }
      );

    });


  /* =======================================================
     PROFILE
  ======================================================= */

  setupProfile();


  /* =======================================================
     MODAL CLOSE
  ======================================================= */

  setupModalClose();


  /* =======================================================
     MOBILE CSS
  ======================================================= */

  function addMobileCSS() {

    if (
      $("#wonderKidsMobileCSS")
    ) {
      return;
    }


    const style =
      document.createElement(
        "style"
      );

    style.id =
      "wonderKidsMobileCSS";


    style.textContent = `

      .extra-game-card {
        min-height: 240px;
      }

      .game-body {
        max-width: 100%;
      }

      .game-icon {
        font-size: 52px;
        margin-bottom: 12px;
      }

      @media (max-width: 768px) {

        .games-grid {
          grid-template-columns:
            repeat(2,minmax(0,1fr))
            !important;

          gap: 14px !important;
        }

        .game-card {
          min-width: 0;
          padding: 16px !important;
        }

        .game-card h3 {
          font-size: 17px !important;
        }

        .game-card p {
          font-size: 13px !important;
        }

        .play-button {
          width: 100%;
          min-height: 44px;
        }

        .modal-card {
          width:
            calc(100% - 24px)
            !important;

          max-height: 90vh;

          overflow-y: auto;
        }

        .quiz-options {
          grid-template-columns:
            1fr 1fr
            !important;
        }

      }


      @media (max-width: 480px) {

        .games-grid {
          grid-template-columns:
            1fr
            !important;
        }

        .quiz-options {
          grid-template-columns:
            1fr
            !important;
        }

        .modal-card {
          width:
            calc(100% - 16px)
            !important;

          padding:
            16px !important;
        }

        .game-title h2 {
          font-size: 22px;
        }

        .game-body {
          font-size: 15px;
        }

        .play-button {
          min-height: 46px;
        }

      }


      .counting-items {
        font-size: 34px;
        line-height: 1.5;
        word-break: break-word;
        margin: 20px auto;
        text-align: center;
      }


      .shape-answer {
        transition:
          transform .2s,
          box-shadow .2s;
      }


      .shape-answer:hover {
        transform:
          scale(1.04);
      }


      #timedTimer {
        display: inline-block;
        min-width: 35px;
      }


      #spellingInput {
        margin: 15px auto;
        display: block;
        max-width: 320px;
        box-sizing: border-box;
      }

    `;


    document.head.appendChild(
      style
    );

  }


  /* =======================================================
     INITIALIZE
  ======================================================= */

  addMobileCSS();

  initializePoems();

  setTimeout(
    addExtraGames,
    500
  );

  updatePlayerUI();

});
