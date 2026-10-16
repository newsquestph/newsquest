(async () => {
  const [{ initializeApp }, firebase] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
  ]);

  const {
    getFirestore, doc, getDoc, getDocs, collection, query,
    orderBy, limit, runTransaction, serverTimestamp
  } = firebase;

  /* =========================================================
     FIREBASE
  ========================================================= */

  const firebaseConfig = {
    apiKey: "AIzaSyBTRwdQi-oi6mPi7SlcwfZr528PWpIKFcI",
    authDomain: "newsquest-a6dbc.firebaseapp.com",
    projectId: "newsquest-a6dbc",
    storageBucket: "newsquest-a6dbc.firebasestorage.app",
    messagingSenderId: "450052536521",
    appId: "1:450052536521:web:39e942bfae4c8b1965f518",
    measurementId: "G-KYXXZ5BEPK"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  /* =========================================================
     HELPERS
  ========================================================= */

  function setMessage(message, type = "error") {
    return `<div class="${type}">${message}</div>`;
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHTML(value);
  }

  function normalizeAnswer(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .replace(/\s+/g, "")
      .trim()
      .toLocaleLowerCase();
  }

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem("newsquest_session") || "null");
    } catch {
      return null;
    }
  }

  function saveSession(session) {
    sessionStorage.setItem("newsquest_session", JSON.stringify(session));
  }

  async function getArticle(articleId) {
    const snapshot = await getDoc(doc(db, "articles", articleId));

    if (!snapshot.exists()) {
      throw new Error("ARTICLE_NOT_FOUND");
    }

    return { articleId: snapshot.id, ...snapshot.data() };
  }

  function showConfetti() {
    const container = document.createElement("div");
    container.className = "confetti-container";

    for (let i = 0; i < 45; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.animationDelay = Math.random() * 0.25 + "s";
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.background = [
        "#2e7d32", "#66bb6a", "#f9c74f", "#ffffff", "#81c784"
      ][Math.floor(Math.random() * 5)];
      container.appendChild(piece);
    }

    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1600);
  }

  function playSound(file) {
    const audio = new Audio(file);
    audio.volume = 1;
    audio.play().catch(error => console.log("Sound blocked:", error));
  }

  /* =========================================================
     GAME STYLES
     Automatically adds the letter-tile animations.
  ========================================================= */

  function injectGameStyles() {
    if (document.querySelector("#newsquest-game-styles")) return;

    const style = document.createElement("style");
    style.id = "newsquest-game-styles";

    style.textContent = `
      .nq-letter-game { margin-top: 16px; }

      .nq-answer-slots, .nq-letter-bank {
        display:flex;
        flex-wrap:wrap;
        justify-content:center;
        align-items:center;
        gap:7px;
        margin:16px 0;
      }

      .nq-answer-slot, .nq-letter-tile {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width:39px;
        height:43px;
        padding:0;
        border:2px solid #b9cdb6;
        border-radius:9px;
        font-size:18px;
        font-weight:800;
        transition:transform .18s ease,background .18s ease,
                   border-color .18s ease,opacity .18s ease;
      }

      .nq-answer-slot {
        background:#fff;
        color:#245433;
        cursor:pointer;
      }

      .nq-answer-slot.filled {
        background:#e7f3df;
        border-color:#43834a;
        animation:nqLetterPop .2s ease-out;
      }

      .nq-letter-tile {
        background:#e8f1e4;
        color:#245433;
        cursor:pointer;
        box-shadow:0 3px 0 #c6d8c0;
      }

      .nq-letter-tile:hover:not(:disabled) {
        transform:translateY(-3px);
        background:#d4e9ca;
      }

      .nq-letter-tile:active:not(:disabled) {
        transform:scale(.92);
      }

      .nq-letter-tile.used {
        opacity:.3;
        transform:scale(.88);
      }

      .nq-letter-tile:disabled,
      .nq-answer-slot:disabled {
        cursor:default;
      }

      .nq-letter-help {
        margin:8px 0;
        color:#617362;
        font-size:13px;
        text-align:center;
      }

      .nq-reset-letters {
        display:block;
        margin:10px auto;
        padding:9px 15px;
        border:1px solid #b9cdb6;
        border-radius:8px;
        background:#fff;
        color:#245433;
        cursor:pointer;
      }

      .nq-reset-letters:hover:not(:disabled) {
        background:#edf5e9;
      }

      .nq-crossword-word {
        margin:14px 0;
        padding:14px;
        border:1px solid #dce6d8;
        border-radius:12px;
        background:#fff;
      }

      .nq-crossword-word h4 {
        margin:0 0 8px;
        color:#205b35;
      }

      .nq-crossword-word .nq-answer-slot {
        width:32px;
        height:37px;
        font-size:15px;
      }

      .nq-crossword-word .nq-letter-tile {
        width:34px;
        height:38px;
        font-size:16px;
      }

      .nq-crossword-status {
        min-height:20px;
        margin-top:8px;
        font-size:13px;
        font-weight:700;
      }

      .nq-crossword-status.is-correct { color:#28743b; }
      .nq-crossword-status.is-wrong { color:#b42318; }

      .nq-game-feedback {
        margin-top:12px;
      }

      @keyframes nqLetterPop {
        0% { transform:scale(.7); }
        70% { transform:scale(1.12); }
        100% { transform:scale(1); }
      }

      @media(max-width:420px) {
        .nq-answer-slot,.nq-letter-tile {
          width:32px;
          height:37px;
          font-size:16px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     WELCOME
  ========================================================= */

  function renderWelcome() {
    document.querySelector("#app").innerHTML = `
      <section class="welcome card">
        <div class="welcome-copy">
          <div class="eyebrow">Interactive research reading</div>
          <h1>Read smarter. Remember more.</h1>
          <p class="lead">
            NewsQuest is a gamified news-reading activity.
            Your respondent code automatically assigns you
            one study article and its five-question quiz.
          </p>

          <form id="start-form">
            <div class="form-group">
              <label for="respondent-code">Respondent code</label>
              <input id="respondent-code" name="code" required
                autocomplete="off" placeholder="Example: SET1-001">
              <p class="small">
                Enter the unique code provided by the researcher.
              </p>
            </div>

            <div id="start-message"></div>

            <button class="primary-btn" type="submit">
              Start NewsQuest
            </button>
          </form>
        </div>

        <div class="welcome-art" aria-hidden="true">
          <div class="illustration">
            <div class="illustration-inner">
              <strong>NEWS</strong>
              <hr>
              <p>Read · Learn · Recall</p>
              <span>+100 points</span>
            </div>
          </div>
        </div>
      </section>
    `;

    document.querySelector("#start-form")
      .addEventListener("submit", startRespondent);
  }

  /* =========================================================
     START RESPONDENT
  ========================================================= */

  async function startRespondent(event) {
    event.preventDefault();

    const code = document.querySelector("#respondent-code")
      .value.trim().toUpperCase();

    const message = document.querySelector("#start-message");

    try {
      message.innerHTML = setMessage(
        "Checking your respondent code...", "notice"
      );

      const codeSnapshot = await getDoc(doc(db, "respondentCodes", code));

      if (!codeSnapshot.exists()) {
        message.innerHTML = setMessage(
          "This respondent code is not valid."
        );
        return;
      }

      const record = codeSnapshot.data();

      if (record.status === "Used") {
        message.innerHTML = setMessage(
          "This respondent code has already been used."
        );
        return;
      }

      if (!record.articleId) {
        message.innerHTML = setMessage(
          "This respondent code does not have an assigned article."
        );
        return;
      }

      const article = await getArticle(record.articleId);

      if (!Array.isArray(article.questions) || article.questions.length !== 5) {
        message.innerHTML = setMessage(
          "The assigned article does not have exactly five questions."
        );
        return;
      }

      saveSession({
        code,
        set: record.set,
        articleId: record.articleId,
        startedAt: new Date().toISOString()
      });

      renderArticle(article);
    } catch (error) {
      console.error(error);
      message.innerHTML = setMessage(
        "Something went wrong while connecting to NewsQuest."
      );
    }
  }

  /* =========================================================
     ARTICLE ROUTER
  ========================================================= */

  function renderArticle(article) {
    const session = getSession();

    if (Array.isArray(article.paragraphs) && article.paragraphs.length > 0) {
      renderArticleWithGames(article);
      return;
    }

    renderOldArticle(article, session);
  }

  /* =========================================================
     NEW ARTICLE FORMAT + BOOK PAGES
  ========================================================= */

  function renderArticleWithGames(article) {
    injectGameStyles();

    const session = getSession();
    const paragraphs = Array.isArray(article.paragraphs)
      ? article.paragraphs : [];
    const games = Array.isArray(article.games) ? article.games : [];
    const totalParagraphs = paragraphs.length;
    const gameMap = {};

    games.forEach((game, gameIndex) => {
      let position = null;

      if (
        game.position !== undefined &&
        game.position !== null &&
        game.position !== "" &&
        Number.isInteger(Number(game.position))
      ) {
        position = Number(game.position);
      }

      if (position === null) {
        for (const key of Object.keys(game)) {
          const match = key.match(/^afterPage(\d+)$/i);

          if (match && (
            game[key] === true ||
            game[key] === 1 ||
            game[key] === "1" ||
            game[key] === "true"
          )) {
            position = Number(match[1]);
            break;
          }
        }
      }

      if (
        position === null &&
        game.afterPage !== undefined &&
        Number.isInteger(Number(game.afterPage))
      ) {
        position = Number(game.afterPage);
      }

      if (position === null) position = gameIndex + 1;

      if (position >= 1 && position <= totalParagraphs) {
        gameMap[position] = game;
      }
    });

    const pages = [];
    let currentParagraphs = [];

    for (let i = 1; i <= totalParagraphs; i++) {
      currentParagraphs.push({ number: i, text: paragraphs[i - 1] });

      if (gameMap[i]) {
        pages.push({
          paragraphs: currentParagraphs,
          game: gameMap[i],
          gamePosition: i
        });
        currentParagraphs = [];
      }
    }

    if (currentParagraphs.length > 0) {
      pages.push({
        paragraphs: currentParagraphs,
        game: null,
        gamePosition: null
      });
    }

    if (pages.length === 0) {
      pages.push({ paragraphs: [], game: null, gamePosition: null });
    }

    document.querySelector("#app").innerHTML = `
      <div class="topbar">
        <div class="progress-wrap">
          <div class="progress-label">
            <span>NewsQuest</span>
            <span id="book-page-label">Page 1 / ${pages.length}</span>
          </div>
          <div class="progress-track">
            <div id="book-progress" class="progress-fill" style="width:0%"></div>
          </div>
        </div>
        <div class="points">+0 points</div>
      </div>

      <article class="newsquest-book">
        <div class="book-shell" id="newsquest-book">
          <div class="book-page-area" id="book-page-area">
            ${pages.map((page, pageIndex) => {
              const isFirstPage = pageIndex === 0;

              return `
                <section class="nq-page ${isFirstPage ? "nq-page-active" : ""}"
                  data-page="${pageIndex}">
                  <div class="nq-page-inner">
                    <div class="nq-page-header">
                      <div class="nq-publication">NEWSQUEST</div>
                      <div class="nq-page-number">
                        ${String(pageIndex + 1).padStart(2, "0")}
                      </div>
                    </div>

                    ${isFirstPage ? `
                      <div class="nq-article-kicker">
                        Set ${escapeHTML(session?.set || "")} · Assigned Reading
                      </div>
                      <h1 class="nq-title">${escapeHTML(article.title || "")}</h1>
                      ${article.image ? `
                        <img src="${escapeAttr(article.image)}"
                          alt="${escapeAttr(article.title || "Article image")}"
                          class="nq-hero-image">
                      ` : ""}
                    ` : `
                      <div class="nq-continuation">STORY CONTINUES</div>
                    `}

                    <div class="nq-story-content">
                      ${page.paragraphs.map((paragraph, paragraphIndex) => `
                        <p class="nq-paragraph ${
                          paragraphIndex === 0 && isFirstPage ? "nq-dropcap" : ""
                        }">${escapeHTML(paragraph.text)}</p>
                      `).join("")}
                    </div>

                    ${page.game ? `
                      <div class="nq-game-break">
                        <div class="nq-game-line"></div>
                        <div class="nq-game-label">READER CHALLENGE</div>
                        <div class="nq-game-wrapper interactive-game"
                          data-game-position="${page.gamePosition}">
                          ${renderReaderGame(page.game)}
                        </div>
                      </div>
                    ` : ""}

                    ${!page.game && pageIndex === pages.length - 1 ? `
                      <div id="final-reading-action" class="nq-final-action">
                        <div class="nq-game-line"></div>
                        <div class="nq-game-label">ARTICLE COMPLETE</div>
                        <button id="begin-quiz" class="primary-btn" type="button">
                          Proceed to Final Quiz →
                        </button>
                      </div>
                    ` : ""}

                    <div class="nq-page-footer">
                      <span>${pageIndex === 0 ? "THE DAILY STORY" : "STORY CONTINUES"}</span>
                      <span>${String(pageIndex + 1).padStart(2, "0")}</span>
                    </div>
                  </div>
                </section>
              `;
            }).join("")}
          </div>
        </div>

        <div class="nq-book-navigation">
          <button id="book-prev" class="nq-nav-button" type="button">← Previous</button>
          <div class="nq-swipe-label">← Swipe to turn the page →</div>
          <button id="book-next" class="nq-nav-button nq-nav-primary" type="button">
            Next →
          </button>
        </div>
      </article>
    `;

    let currentPage = 0;

    const pageElements = Array.from(document.querySelectorAll(".nq-page"));
    const pageLabel = document.querySelector("#book-page-label");
    const progress = document.querySelector("#book-progress");
    const previousButton = document.querySelector("#book-prev");
    const nextButton = document.querySelector("#book-next");
    const bookArea = document.querySelector("#book-page-area");
    const unlockedPages = new Set([0]);

    function renderBookPage(pageIndex) {
      if (pageIndex < 0 || pageIndex >= pageElements.length) return;
      if (!unlockedPages.has(pageIndex)) return;

      currentPage = pageIndex;

      pageElements.forEach((page, index) => {
        page.classList.remove("nq-page-active", "nq-page-left", "nq-page-right");

        if (index === currentPage) {
          page.classList.add("nq-page-active");
        } else if (index < currentPage) {
          page.classList.add("nq-page-left");
        } else {
          page.classList.add("nq-page-right");
        }
      });

      const totalPages = pageElements.length;

      pageLabel.textContent = `Page ${currentPage + 1} / ${totalPages}`;
      progress.style.width = `${((currentPage + 1) / totalPages) * 100}%`;
      previousButton.disabled = currentPage === 0;

      const isLastPage = currentPage === totalPages - 1;
      nextButton.textContent = isLastPage ? "Finished" : "Next →";

      const nextPage = currentPage + 1;

      if (!isLastPage && !unlockedPages.has(nextPage)) {
        nextButton.disabled = true;
        nextButton.textContent = "Complete challenge →";
      } else {
        nextButton.disabled = false;
      }
    }

    previousButton.addEventListener("click", () => {
      if (currentPage > 0) renderBookPage(currentPage - 1);
    });

    nextButton.addEventListener("click", () => {
      const nextPage = currentPage + 1;

      if (nextPage < pageElements.length && unlockedPages.has(nextPage)) {
        renderBookPage(nextPage);
      }
    });

    let touchStartX = 0;
    let touchStartY = 0;

    bookArea.addEventListener("touchstart", event => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    bookArea.addEventListener("touchend", event => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY)) return;

      if (deltaX < 0) {
        const nextPage = currentPage + 1;
        if (unlockedPages.has(nextPage)) renderBookPage(nextPage);
      } else if (currentPage > 0) {
        renderBookPage(currentPage - 1);
      }
    }, { passive: true });

    let pointerStartX = 0;

    bookArea.addEventListener("pointerdown", event => {
      pointerStartX = event.clientX;
    });

    bookArea.addEventListener("pointerup", event => {
      const deltaX = event.clientX - pointerStartX;
      if (Math.abs(deltaX) < 70) return;

      if (deltaX < 0) {
        const nextPage = currentPage + 1;
        if (unlockedPages.has(nextPage)) renderBookPage(nextPage);
      } else if (currentPage > 0) {
        renderBookPage(currentPage - 1);
      }
    });

    /* ---------------------------------------------------------
       GAME BUTTONS
    --------------------------------------------------------- */

    document.querySelectorAll(".interactive-game").forEach(gameContainer => {
      const position = Number(gameContainer.dataset.gamePosition);
      const game = gameMap[position];

      if (!game) return;

      const message = gameContainer.querySelector(".game-message");
      const button = gameContainer.querySelector(".game-submit");
      const letterGame = gameContainer.querySelector("[data-letter-game]");

      if (!message || !button) return;

      function markGameCorrect() {
        showConfetti();
        playSound("correct.mp3");

        message.innerHTML = setMessage(
          "Correct! Great job. You can continue reading.",
          "success"
        );

        button.disabled = true;

        gameContainer.querySelectorAll(
          "input, .nq-letter-tile, .nq-answer-slot, .nq-reset-letters"
        ).forEach(element => {
          element.disabled = true;
        });

        const pageElement = gameContainer.closest(".nq-page");
        if (!pageElement) return;

        const pageIndex = Number(pageElement.dataset.page);
        const nextPageIndex = pageIndex + 1;

        if (nextPageIndex < pageElements.length) {
          unlockedPages.add(nextPageIndex);

          if (currentPage === pageIndex) {
            nextButton.disabled = false;
            nextButton.textContent = "Turn Page →";
          }
        }
      }

      if (letterGame) {
        function setupLetterGroup(group) {
          const bank = group.querySelector("[data-letter-bank]");
          const slotsContainer = group.querySelector("[data-answer-slots]");

          if (!bank || !slotsContainer) return null;

          const tiles = Array.from(bank.querySelectorAll(".nq-letter-tile"));
          const slots = Array.from(slotsContainer.querySelectorAll(".nq-answer-slot"));
          const state = slots.map(() => null);

          tiles.forEach((tile, tileIndex) => {
            tile.dataset.tileIndex = String(tileIndex);

            tile.addEventListener("click", () => {
              if (tile.disabled || tile.classList.contains("used")) return;

              const emptyIndex = state.findIndex(value => value === null);
              if (emptyIndex === -1) return;

              state[emptyIndex] = tileIndex;

              slots[emptyIndex].textContent = tile.dataset.letter;
              slots[emptyIndex].classList.add("filled");
              slots[emptyIndex].dataset.tileIndex = String(tileIndex);

              tile.classList.add("used");
              tile.disabled = true;
            });
          });

          slots.forEach((slot, slotIndex) => {
            slot.addEventListener("click", () => {
              if (slot.disabled) return;

              const tileIndex = state[slotIndex];
              if (tileIndex === null || tileIndex === undefined) return;

              const tile = tiles[tileIndex];

              if (tile) {
                tile.classList.remove("used");
                tile.disabled = false;
              }

              state[slotIndex] = null;
              slot.innerHTML = "&nbsp;";
              slot.classList.remove("filled");
              delete slot.dataset.tileIndex;
            });
          });

          return {
            group,
            tiles,
            slots,
            state,

            getAnswer() {
              return state.map(tileIndex => {
                if (tileIndex === null) return "";
                return tiles[tileIndex]?.dataset.letter || "";
              }).join("");
            },

            clear() {
              state.fill(null);

              slots.forEach(slot => {
                slot.innerHTML = "&nbsp;";
                slot.classList.remove("filled");
                delete slot.dataset.tileIndex;
              });

              tiles.forEach(tile => {
                tile.disabled = false;
                tile.classList.remove("used");
              });
            }
          };
        }

        const letterGroups = [];

        if (game.type === "crossword") {
          letterGame.querySelectorAll("[data-crossword-word]").forEach(group => {
            const setup = setupLetterGroup(group);
            if (setup) letterGroups.push(setup);
          });
        } else {
          const setup = setupLetterGroup(letterGame);
          if (setup) letterGroups.push(setup);
        }

        letterGame.querySelectorAll(".nq-reset-letters").forEach(resetButton => {
          resetButton.addEventListener("click", () => {
            letterGroups.forEach(group => group.clear());

            letterGame.querySelectorAll(".nq-crossword-status").forEach(status => {
              status.textContent = "";
              status.classList.remove("is-correct", "is-wrong");
            });

            message.innerHTML = "";
          });
        });

        button.addEventListener("click", () => {
          if (game.type === "crossword") {
            let allCorrect = true;

            letterGroups.forEach(group => {
              const wordElement = group.group;
              const originalIndex = Number(wordElement.dataset.crosswordWord);
              const word = game.words?.[originalIndex];
              const status = wordElement.querySelector(".nq-crossword-status");

              const userAnswer = normalizeAnswer(group.getAnswer());
              const correctAnswer = normalizeAnswer(word?.answer);

              if (userAnswer && userAnswer === correctAnswer) {
                status.textContent = "Correct!";
                status.classList.remove("is-wrong");
                status.classList.add("is-correct");
              } else {
                allCorrect = false;

                status.textContent = userAnswer
                  ? "Not quite. Try this clue again."
                  : "Fill in the letters for this clue.";

                status.classList.remove("is-correct");
                status.classList.add("is-wrong");
              }
            });

            if (allCorrect && letterGroups.length > 0) {
              markGameCorrect();
            } else {
              playSound("wrong.mp3");
              message.innerHTML = setMessage(
                "Some crossword answers are incomplete or incorrect. Try again."
              );
            }

            return;
          }

          const group = letterGroups[0];
          if (!group) return;

          const userAnswer = normalizeAnswer(group.getAnswer());
          const correctAnswer = normalizeAnswer(game.answer);

          if (!userAnswer) {
            message.innerHTML = setMessage(
              "Tap the letters to fill the answer boxes first."
            );
            return;
          }

          if (userAnswer.length !== group.slots.length) {
            message.innerHTML = setMessage(
              "Fill in every answer box before checking."
            );
            return;
          }

          if (userAnswer === correctAnswer) {
            markGameCorrect();
          } else {
            playSound("wrong.mp3");
            message.innerHTML = setMessage(
              "Not quite. Tap a filled box to remove its letter and try again."
            );
          }
        });
      } else {
        /* Fallback for older game markup using a text input. */
        const input = gameContainer.querySelector(".game-answer");

        if (input) {
          button.addEventListener("click", () => {
            const userAnswer = normalizeAnswer(input.value);
            const correctAnswer = normalizeAnswer(game.answer);

            if (!userAnswer) {
              message.innerHTML = setMessage("Please enter your answer first.");
              return;
            }

            if (userAnswer === correctAnswer) {
              markGameCorrect();
              input.disabled = true;
            } else {
              playSound("wrong.mp3");
              message.innerHTML = setMessage("Not quite. Try again.");
            }
          });
        }
      }
    });

    const quizButton = document.querySelector("#begin-quiz");

    if (quizButton) {
      quizButton.addEventListener("click", () => {
        playSound("proceed.mp3");
        renderQuiz(article);
      });
    }

    renderBookPage(0);
  }

  /* =========================================================
     LETTER TILE HELPERS
  ========================================================= */

  function makeLetterTiles(answer, prefix) {
    const letters = Array.from(String(answer || "").replace(/\s/g, "").toUpperCase());

    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    return letters.map((letter, index) => `
      <button type="button" class="nq-letter-tile"
        data-tile="${prefix}-${index}"
        data-letter="${escapeAttr(letter)}"
        aria-label="Letter ${escapeAttr(letter)}">
        ${escapeHTML(letter)}
      </button>
    `).join("");
  }

  function makeAnswerSlots(answer, prefix) {
    const letters = Array.from(String(answer || "").replace(/\s/g, ""));

    return letters.map((_, index) => `
      <button type="button" class="nq-answer-slot"
        data-slot="${prefix}-${index}"
        aria-label="Answer box ${index + 1}">&nbsp;</button>
    `).join("");
  }

  /* =========================================================
     READER GAME
  ========================================================= */

  function renderReaderGame(game) {
    if (!game || !game.type) return "";

    if (game.type === "jumbled") {
      const answer = String(game.answer || "").replace(/\s/g, "");

      return `
        <div class="game-box nq-letter-game" data-letter-game="jumbled">
          <div class="eyebrow">Interactive Game</div>
          <h3>Jumbled Words</h3>
          <p class="small">Tap the letters in the correct order to form the word.</p>

          ${game.hint ? `
            <p class="small"><strong>Hint:</strong> ${escapeHTML(game.hint)}</p>
          ` : ""}

          <div class="nq-answer-slots" data-answer-slots>
            ${makeAnswerSlots(answer, "jumble")}
          </div>

          <p class="nq-letter-help">
            Tap a letter to place it. Tap a filled box to remove its letter.
          </p>

          <div class="nq-letter-bank" data-letter-bank>
            ${makeLetterTiles(answer, "jumble")}
          </div>

          <button class="game-submit primary-btn" type="button">Check Answer</button>
          <button class="nq-reset-letters" type="button">Clear Answer</button>
          <div class="game-message nq-game-feedback" aria-live="polite"></div>
        </div>
      `;
    }

    if (game.type === "fourPics") {
      const answer = String(game.answer || "").replace(/\s/g, "");
      const images = Array.isArray(game.images) ? game.images.slice(0, 4) : [];

      return `
        <div class="game-box nq-letter-game" data-letter-game="fourPics">
          <div class="eyebrow">Interactive Game</div>
          <h3>4 Pics 1 Word</h3>
          <p class="small">Look at the pictures, then tap letters to build the answer.</p>

          <div class="four-pics-grid">
            ${images.map((image, index) => `
              <img src="${escapeAttr(image)}" alt="Picture ${index + 1}"
                class="game-image" loading="lazy">
            `).join("")}
          </div>

          ${game.hint ? `
            <p class="small"><strong>Hint:</strong> ${escapeHTML(game.hint)}</p>
          ` : ""}

          <div class="nq-answer-slots" data-answer-slots>
            ${makeAnswerSlots(answer, "pics")}
          </div>

          <div class="nq-letter-bank" data-letter-bank>
            ${makeLetterTiles(answer, "pics")}
          </div>

          <button class="game-submit primary-btn" type="button">Check Answer</button>
          <button class="nq-reset-letters" type="button">Clear Answer</button>
          <div class="game-message nq-game-feedback" aria-live="polite"></div>
        </div>
      `;
    }

    if (game.type === "crossword") {
      const words = Array.isArray(game.words)
        ? game.words.map((word, index) => ({
            ...word,
            originalIndex: index,
            answer: String(word.answer || "").replace(/\s/g, ""),
            clue: String(word.clue || ""),
            direction: word.direction === "down" ? "Down" : "Across"
          })).filter(word => word.answer.length > 0 && word.clue.trim())
        : [];

      if (words.length === 0) {
        return `
          <div class="game-box">
            <div class="eyebrow">Interactive Game</div>
            <h3>Mini Crossword</h3>
            <p class="small">
              No crossword words are configured. Please inform the researcher.
            </p>
          </div>
        `;
      }

      return `
        <div class="game-box nq-letter-game" data-letter-game="crossword">
          <div class="eyebrow">Interactive Game</div>
          <h3>Mini Crossword</h3>
          <p class="small">
            Solve every clue. Tap the letters in order to fill each answer.
          </p>

          ${words.map(word => {
            const prefix = `cross-${word.originalIndex}`;

            return `
              <div class="nq-crossword-word"
                data-crossword-word="${word.originalIndex}">
                <h4>${word.direction} ${word.originalIndex + 1}</h4>
                <p>${escapeHTML(word.clue)}</p>

                <div class="nq-answer-slots" data-answer-slots>
                  ${makeAnswerSlots(word.answer, prefix)}
                </div>

                <div class="nq-letter-bank" data-letter-bank>
                  ${makeLetterTiles(word.answer, prefix)}
                </div>

                <p class="nq-letter-help">
                  Tap a letter to fill the next box. Tap a filled box to remove it.
                </p>

                <div class="nq-crossword-status" aria-live="polite"></div>
              </div>
            `;
          }).join("")}

          <button class="game-submit primary-btn" type="button">
            Check Crossword
          </button>
          <button class="nq-reset-letters" type="button">Clear All Answers</button>
          <div class="game-message nq-game-feedback" aria-live="polite"></div>
        </div>
      `;
    }

    return "";
  }

  /* =========================================================
     OLD ARTICLE FORMAT
  ========================================================= */

  function renderOldArticle(article, session) {
    document.querySelector("#app").innerHTML = `
      <div class="topbar">
        <div class="progress-wrap">
          <div class="progress-label">
            <span>Reading</span>
            <span>Article</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:100%"></div>
          </div>
        </div>
        <div class="points">+0 points</div>
      </div>

      <article class="article-card card">
        ${article.image ? `
          <img class="article-image" src="${escapeAttr(article.image)}"
            alt="Article image">
        ` : ""}

        <div class="article-content">
          <div class="eyebrow">
            Set ${escapeHTML(session?.set || "")} · Assigned reading
          </div>

          <h2>${escapeHTML(article.title || "")}</h2>
          <p class="article-body">${escapeHTML(article.body || "")}</p>

          <div class="action-row">
            <button id="begin-quiz" class="primary-btn" type="button">
              I'm ready for the five-question quiz
            </button>
          </div>
        </div>
      </article>
    `;

    document.querySelector("#begin-quiz").addEventListener("click", () => {
      playSound("proceed.mp3");
      renderQuiz(article);
    });
  }

  /* =========================================================
     QUIZ
  ========================================================= */

  function renderQuiz(article) {
    document.querySelector("#app").innerHTML = `
      <div class="topbar">
        <div class="progress-wrap">
          <div class="progress-label">
            <span>Quiz progress</span>
            <span>5 questions</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:100%"></div>
          </div>
        </div>
        <div class="points">Up to 100 points</div>
      </div>

      <form id="quiz-form" class="quiz-card card">
        <div class="eyebrow">Knowledge check</div>
        <h2>${escapeHTML(article.title || "")}</h2>
        <p class="small">Answer all five questions before submitting.</p>

        ${Array.isArray(article.questions) ? article.questions.map((question, index) => `
          <fieldset class="question">
            <legend class="question-title">
              ${index + 1}. ${escapeHTML(question.text)}
            </legend>

            ${Array.isArray(question.choices) ? question.choices.map((choice, choiceIndex) => `
              <label class="choice">
                <input type="radio" name="question-${index}"
                  value="${choiceIndex}" required>
                <span>${escapeHTML(choice)}</span>
              </label>
            `).join("") : ""}
          </fieldset>
        `).join("") : ""}

        <div id="quiz-message"></div>

        <button class="primary-btn" type="submit">Submit quiz</button>
      </form>
    `;

    document.querySelector("#quiz-form").addEventListener("submit", event => {
      submitQuiz(event, article);
    });
  }

  /* =========================================================
     SUBMIT QUIZ
  ========================================================= */

  async function submitQuiz(event, article) {
    event.preventDefault();

    const session = getSession();
    const formData = new FormData(event.target);
    const message = document.querySelector("#quiz-message");

    if (!session?.code || !session?.articleId) {
      message.innerHTML = setMessage(
        "Your session has expired.
