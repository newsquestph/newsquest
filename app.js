
(async () => {
  const [{ initializeApp }, firebase] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
  ]);

  const {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    orderBy,
    limit,
    runTransaction,
    serverTimestamp
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
      .trim()
      .replace(/\s+/g, " ")
      .toLocaleLowerCase();
  }

  function getSession() {
    try {
      return JSON.parse(
        sessionStorage.getItem("newsquest_session") || "null"
      );
    } catch {
      return null;
    }
  }

  function saveSession(session) {
    sessionStorage.setItem(
      "newsquest_session",
      JSON.stringify(session)
    );
  }

  function getAppRoot() {
    return document.querySelector("#app");
  }

  function injectGameStyles() {
    if (document.querySelector("#newsquest-game-styles")) return;

    const style = document.createElement("style");
    style.id = "newsquest-game-styles";

    style.textContent = `
      .nq-interactive-game {
        width: 100%;
        max-width: 620px;
        margin: 18px auto;
      }

      .nq-interactive-game .game-box {
        box-sizing: border-box;
        padding: 22px;
        border: 1px solid #d9e5d4;
        border-radius: 18px;
        background: #f8fbf5;
        color: #243c2a;
        box-shadow: 0 8px 24px rgba(35, 70, 42, .07);
      }

      .nq-interactive-game .game-box h3 {
        margin: 8px 0;
        color: #205b35;
      }

      .nq-interactive-game .game-input {
        display: block;
        box-sizing: border-box;
        width: 100%;
        min-height: 46px;
        margin: 14px 0 10px;
        padding: 12px 14px;
        border: 1px solid #b9cbb8;
        border-radius: 10px;
        background: #fff;
        color: #203525;
        font-size: 16px;
      }

      .nq-interactive-game .game-submit {
        min-height: 44px;
        margin-top: 5px;
      }

      .nq-interactive-game button:disabled {
        cursor: not-allowed;
        opacity: .65;
      }

      .nq-game-letter-bank {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 7px;
        margin: 18px 0;
      }

      .nq-game-letter {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 39px;
        height: 43px;
        border: 1px solid #b9cdb6;
        border-radius: 8px;
        background: #e8f1e4;
        color: #245433;
        font-size: 18px;
        font-weight: 800;
      }

      .four-pics-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin: 18px 0;
      }

      .four-pics-grid .game-image,
      .four-pics-grid .nq-image-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: 100%;
        aspect-ratio: 1 / 1;
        overflow: hidden;
        border: 1px solid #d5e0d1;
        border-radius: 12px;
        background: #e8eee4;
        color: #526753;
        object-fit: cover;
      }

      .nq-crossword-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 20px;
        margin-top: 18px;
      }

      .nq-crossword-grid-wrap {
        width: 100%;
        overflow-x: auto;
        padding: 5px 0 12px;
      }

      .nq-crossword-grid {
        display: grid;
        width: max-content;
        margin: 0 auto;
        gap: 2px;
      }

      .nq-crossword-cell {
        position: relative;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border: 1px solid #c5d3c0;
        border-radius: 3px;
        background: #fff;
      }

      .nq-crossword-cell.is-block {
        border-color: #24462e;
        background: #24462e;
      }

      .nq-crossword-cell.is-start {
        border-color: #7c9d75;
        background: #eef5e9;
      }

      .nq-crossword-number {
        position: absolute;
        top: 1px;
        left: 2px;
        z-index: 1;
        font-size: 9px;
        line-height: 1;
        color: #48624b;
      }

      .nq-crossword-letter {
        font-size: 16px;
        font-weight: 800;
        color: #245433;
      }

      .nq-crossword-clues {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 15px;
      }

      .nq-crossword-clue-group h4 {
        margin: 0 0 8px;
        color: #205b35;
      }

      .nq-crossword-clue {
        margin: 0 0 12px;
        padding: 12px;
        border: 1px solid #dce6d8;
        border-radius: 10px;
        background: #fff;
      }

      .nq-crossword-clue label {
        display: block;
        margin-bottom: 7px;
        font-weight: 650;
        line-height: 1.45;
      }

      .nq-crossword-clue input {
        box-sizing: border-box;
        width: 100%;
        min-height: 42px;
        padding: 9px 11px;
        border: 1px solid #b9cbb8;
        border-radius: 8px;
        font-size: 16px;
      }

      .nq-crossword-clue input:disabled {
        background: #edf5e9;
        color: #245433;
        font-weight: 700;
      }

      .nq-crossword-status {
        margin-top: 12px;
        font-size: 13px;
        color: #526753;
      }

      .nq-crossword-status.is-correct {
        color: #20723a;
        font-weight: 700;
      }

      .nq-crossword-status.is-wrong {
        color: #a33a2d;
      }

      .nq-crossword-empty {
        padding: 12px;
        border-radius: 8px;
        background: #fff5df;
        color: #76551b;
      }

      .nq-game-message {
        margin-top: 12px;
      }

      @media (min-width: 600px) {
        .nq-crossword-layout {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          align-items: start;
        }

        .nq-crossword-cell {
          width: 36px;
          height: 36px;
        }
      }

      @media (max-width: 420px) {
        .nq-interactive-game .game-box {
          padding: 15px;
        }

        .nq-crossword-cell {
          width: 29px;
          height: 29px;
        }

        .nq-crossword-letter {
          font-size: 13px;
        }

        .nq-game-letter {
          width: 32px;
          height: 37px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     FIRESTORE ARTICLE
  ========================================================= */

  async function getArticle(articleId) {
    const snapshot = await getDoc(
      doc(db, "articles", articleId)
    );

    if (!snapshot.exists()) {
      throw new Error("ARTICLE_NOT_FOUND");
    }

    return {
      articleId: snapshot.id,
      ...snapshot.data()
    };
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
        "#2e7d32",
        "#66bb6a",
        "#f9c74f",
        "#ffffff",
        "#81c784"
      ][Math.floor(Math.random() * 5)];

      container.appendChild(piece);
    }

    document.body.appendChild(container);

    setTimeout(() => container.remove(), 1600);
  }

  function playSound(file) {
    const audio = new Audio(file);
    audio.volume = 1;

    audio.play().catch(error => {
      console.log("Sound blocked:", error);
    });
  }

  /* =========================================================
     WELCOME
  ========================================================= */

  function renderWelcome() {
    getAppRoot().innerHTML = `
      <section class="welcome card">
        <div class="welcome-copy">
          <div class="eyebrow">Interactive research reading</div>
          <h1>Read smarter. Remember more.</h1>
          <p class="lead">
            NewsQuest is a gamified news-reading activity.
            Use your official respondent code for the study, or enter Test Mode
            to preview an article and quiz without saving research results.
          </p>

          <form id="start-form">
            <div class="form-group">
              <label for="respondent-code">Official respondent code</label>
              <input id="respondent-code" name="code" required autocomplete="off" placeholder="Example: SET1-001">
              <p class="small">Use the unique code provided by the researcher.</p>
            </div>
            <div id="start-message"></div>
            <button class="primary-btn" type="submit">Start Official Study</button>
          </form>

          <hr style="margin: 26px 0; border: 0; border-top: 1px solid #d9e5d4;">

          <form id="test-mode-form">
            <div class="eyebrow">Test mode · no research data saved</div>
            <div class="form-group">
              <label for="test-nickname">Nickname</label>
              <input id="test-nickname" name="nickname" autocomplete="off" maxlength="40" placeholder="Enter any nickname" required>
            </div>
            <div class="form-group">
              <label for="test-article">Choose an article</label>
              <select id="test-article" name="articleId" required>
                <option value="article1">Article 1</option>
                <option value="article2">Article 2</option>
                <option value="article3">Article 3</option>
              </select>
            </div>
            <div id="test-mode-message" aria-live="polite"></div>
            <button class="primary-btn" type="submit">Preview Article and Quiz</button>
            <p class="small">You can reuse the same nickname and repeat tests. Test attempts are not saved to official responses or leaderboards.</p>
          </form>
        </div>

        <div class="welcome-art" aria-hidden="true">
          <div class="illustration"><div class="illustration-inner">
            <strong>NEWS</strong><hr><p>Read · Learn · Recall</p><span>+100 points</span>
          </div></div>
        </div>
      </section>
    `;

    document.querySelector("#start-form").addEventListener("submit", startRespondent);
    document.querySelector("#test-mode-form").addEventListener("submit", startTestMode);
  }

  async function startTestMode(event) {
    event.preventDefault();
    const nickname = document.querySelector("#test-nickname").value.trim();
    const articleId = document.querySelector("#test-article").value;
    const message = document.querySelector("#test-mode-message");

    if (!nickname) {
      message.innerHTML = setMessage("Please enter a nickname.");
      return;
    }

    try {
      message.innerHTML = setMessage("Loading selected article...", "notice");
      const article = await getArticle(articleId);
      if (!Array.isArray(article.questions) || article.questions.length !== 5) {
        message.innerHTML = setMessage("This article must have exactly five quiz questions before it can be tested.");
        return;
      }

      saveSession({
        mode: "test",
        code: `TEST-${Date.now()}`,
        nickname,
        set: "TEST MODE",
        articleId,
        startedAt: new Date().toISOString()
      });
      renderArticle(article);
    } catch (error) {
      console.error("Test Mode article load failed:", error);
      message.innerHTML = setMessage("Could not load that article. Check that the article exists in Firestore as article1, article2, or article3.");
    }
  }

  /* =========================================================
     START RESPONDENT
  ========================================================= */

  async function startRespondent(event) {
    event.preventDefault();

    const code = document
      .querySelector("#respondent-code")
      .value
      .trim()
      .toUpperCase();

    const message = document.querySelector("#start-message");

    try {
      message.innerHTML = setMessage(
        "Checking your respondent code...",
        "notice"
      );

      const codeSnapshot = await getDoc(
        doc(db, "respondentCodes", code)
      );

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

      if (
        !Array.isArray(article.questions) ||
        article.questions.length !== 5
      ) {
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

    if (
      Array.isArray(article.paragraphs) &&
      article.paragraphs.length > 0
    ) {
      renderArticleWithGames(article);
      return;
    }

    renderOldArticle(article, session);
  }

  /* =========================================================
     ARTICLE WITH GAMES
  ========================================================= */

  function renderArticleWithGames(article) {
    injectGameStyles();

    const session = getSession();
    const paragraphs = Array.isArray(article.paragraphs)
      ? article.paragraphs
      : [];
    const games = Array.isArray(article.games)
      ? article.games
      : [];
    const totalParagraphs = paragraphs.length;

    /* BUILD GAME MAP */

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

          if (
            match &&
            (
              game[key] === true ||
              game[key] === 1 ||
              game[key] === "1" ||
              game[key] === "true"
            )
          ) {
            position = Number(match[1]);
            break;
          }
        }
      }

      if (
        position === null &&
        game.afterPage !== undefined &&
        game.afterPage !== null &&
        game.afterPage !== "" &&
        Number.isInteger(Number(game.afterPage))
      ) {
        position = Number(game.afterPage);
      }

      if (position === null) {
        position = gameIndex + 1;
      }

      if (
        position >= 1 &&
        position <= totalParagraphs
      ) {
        gameMap[position] = game;
      }
    });

    /* BUILD BOOK PAGES */

    const pages = [];
    let currentParagraphs = [];

    for (let i = 1; i <= totalParagraphs; i++) {
      currentParagraphs.push({
        number: i,
        text: paragraphs[i - 1]
      });

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
      pages.push({
        paragraphs: [],
        game: null,
        gamePosition: null
      });
    }

    getAppRoot().innerHTML = `
      <div class="topbar">
        <div class="progress-wrap">
          <div class="progress-label">
            <span>NewsQuest</span>
            <span id="book-page-label">Page 1 / ${pages.length}</span>
          </div>

          <div class="progress-track">
            <div
              id="book-progress"
              class="progress-fill"
              style="width: 0%"
            ></div>
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
                <section
                  class="nq-page ${isFirstPage ? "nq-page-active" : ""}"
                  data-page="${pageIndex}"
                >
                  <div class="nq-page-inner">
                    <div class="nq-page-header">
                      <div class="nq-publication">NEWSQUEST</div>
                      <div class="nq-page-number">
                        ${String(pageIndex + 1).padStart(2, "0")}
                      </div>
                    </div>

                    ${
                      isFirstPage
                        ? `
                          <div class="nq-article-kicker">
                            Set ${escapeHTML(session?.set || "")}
                            · Assigned Reading
                          </div>

                          <h1 class="nq-title">
                            ${escapeHTML(article.title || "")}
                          </h1>

                          ${
                            article.image
                              ? `
                                <img
                                  src="${escapeAttr(article.image)}"
                                  alt="${escapeAttr(article.title || "Article image")}"
                                  class="nq-hero-image"
                                >
                              `
                              : ""
                          }
                        `
                        : `
                          <div class="nq-continuation">
                            STORY CONTINUES
                          </div>
                        `
                    }

                    <div class="nq-story-content">
                      ${page.paragraphs.map((paragraph, paragraphIndex) => `
                        <p class="nq-paragraph ${
                          paragraphIndex === 0 && isFirstPage
                            ? "nq-dropcap"
                            : ""
                        }">
                          ${escapeHTML(paragraph.text)}
                        </p>
                      `).join("")}
                    </div>

                    ${
                      page.game
                        ? `
                          <div class="nq-game-break">
                            <div class="nq-game-line"></div>
                            <div class="nq-game-label">READER CHALLENGE</div>

                            <div
                              class="nq-game-wrapper interactive-game nq-interactive-game"
                              data-game-position="${page.gamePosition}"
                            >
                              ${renderReaderGame(page.game)}
                            </div>
                          </div>
                        `
                        : ""
                    }

                    ${
                      !page.game && pageIndex === pages.length - 1
                        ? `
                          <div id="final-reading-action" class="nq-final-action">
                            <div class="nq-game-line"></div>
                            <div class="nq-game-label">ARTICLE COMPLETE</div>

                            <button
                              id="begin-quiz"
                              class="primary-btn"
                              type="button"
                            >
                              Proceed to Final Quiz →
                            </button>
                          </div>
                        `
                        : ""
                    }

                    <div class="nq-page-footer">
                      <span>
                        ${pageIndex === 0 ? "THE DAILY STORY" : "STORY CONTINUES"}
                      </span>

                      <span>${String(pageIndex + 1).padStart(2, "0")}</span>
                    </div>
                  </div>
                </section>
              `;
            }).join("")}
          </div>
        </div>

        <div class="nq-book-navigation">
          <button id="book-prev" class="nq-nav-button" type="button">
            ← Previous
          </button>

          <div class="nq-swipe-label">
            ← Swipe to turn the page →
          </div>

          <button id="book-next" class="nq-nav-button nq-nav-primary" type="button">
            Next →
          </button>
        </div>
      </article>
    `;

    /* BOOK STATE */

    let currentPage = 0;

    const pageElements = Array.from(
      document.querySelectorAll(".nq-page")
    );

    const pageLabel = document.querySelector("#book-page-label");
    const progress = document.querySelector("#book-progress");
    const previousButton = document.querySelector("#book-prev");
    const nextButton = document.querySelector("#book-next");
    const bookArea = document.querySelector("#book-page-area");

    const unlockedPages = new Set([0]);

    function renderBookPage(pageIndex) {
      if (
        pageIndex < 0 ||
        pageIndex >= pageElements.length ||
        !unlockedPages.has(pageIndex)
      ) {
        return;
      }

      currentPage = pageIndex;

      pageElements.forEach((page, index) => {
        page.classList.remove(
          "nq-page-active",
          "nq-page-left",
          "nq-page-right"
        );

        if (index === currentPage) {
          page.classList.add("nq-page-active");
        } else if (index < currentPage) {
          page.classList.add("nq-page-left");
        } else {
          page.classList.add("nq-page-right");
        }
      });

      const totalPages = pageElements.length;

      pageLabel.textContent =
        `Page ${currentPage + 1} / ${totalPages}`;

      progress.style.width =
        `${((currentPage + 1) / totalPages) * 100}%`;

      previousButton.disabled = currentPage === 0;

      const isLastPage = currentPage === totalPages - 1;
      const nextPage = currentPage + 1;

      if (isLastPage) {
        nextButton.disabled = true;
        nextButton.textContent = "Finished";
      } else if (!unlockedPages.has(nextPage)) {
        nextButton.disabled = true;
        nextButton.textContent = "Complete challenge →";
      } else {
        nextButton.disabled = false;
        nextButton.textContent = "Next →";
      }
    }

    previousButton.addEventListener("click", () => {
      if (currentPage > 0) {
        renderBookPage(currentPage - 1);
      }
    });

    nextButton.addEventListener("click", () => {
      const nextPage = currentPage + 1;

      if (
        nextPage < pageElements.length &&
        unlockedPages.has(nextPage)
      ) {
        renderBookPage(nextPage);
      }
    });

    /* SWIPE SUPPORT */

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

      if (
        Math.abs(deltaX) < 60 ||
        Math.abs(deltaX) < Math.abs(deltaY)
      ) {
        return;
      }

      if (deltaX < 0) {
        const nextPage = currentPage + 1;

        if (unlockedPages.has(nextPage)) {
          renderBookPage(nextPage);
        }
      } else if (currentPage > 0) {
        renderBookPage(currentPage - 1);
      }
    }, { passive: true });

    /* MOUSE / TRACKPAD SWIPE */

    let pointerStartX = 0;
    let pointerStartY = 0;

    bookArea.addEventListener("pointerdown", event => {
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
    });

    bookArea.addEventListener("pointerup", event => {
      if (event.pointerType === "touch") return;

      const deltaX = event.clientX - pointerStartX;
      const deltaY = event.clientY - pointerStartY;

      if (
        Math.abs(deltaX) < 70 ||
        Math.abs(deltaX) < Math.abs(deltaY)
      ) {
        return;
      }

      if (deltaX < 0) {
        const nextPage = currentPage + 1;

        if (unlockedPages.has(nextPage)) {
          renderBookPage(nextPage);
        }
      } else if (currentPage > 0) {
        renderBookPage(currentPage - 1);
      }
    });

    /* GAME ANSWER HANDLERS */

    document.querySelectorAll(".interactive-game").forEach(gameContainer => {
      const position = Number(gameContainer.dataset.gamePosition);
      const game = gameMap[position];

      if (!game) return;

      const message = gameContainer.querySelector(".game-message");
      const button = gameContainer.querySelector(".game-submit");

      if (!message || !button) return;

      function unlockGamePage() {
        const pageElement = gameContainer.closest(".nq-page");
        if (!pageElement) return;

        const pageIndex = Number(pageElement.dataset.page);
        const nextPage = pageIndex + 1;

        if (nextPage < pageElements.length) {
          unlockedPages.add(nextPage);

          if (currentPage === pageIndex) {
            nextButton.disabled = false;
            nextButton.textContent = "Turn Page →";
          }
        }
      }

      function markGameCorrect() {
        showConfetti();
        playSound("correct.mp3");

        message.innerHTML = setMessage(
          "Correct! Great job. You can now continue reading.",
          "success"
        );

        button.disabled = true;

        gameContainer.querySelectorAll("input").forEach(input => {
          input.disabled = true;
        });

        gameContainer.querySelectorAll(".nq-crossword-status").forEach(status => {
          status.classList.add("is-correct");
        });

        unlockGamePage();
      }

      /* JUMBLED WORDS AND 4 PICS 1 WORD */

      if (
        game.type === "jumbled" ||
        game.type === "fourPics"
      ) {
        const input = gameContainer.querySelector(".game-answer");

        if (!input) return;

        button.addEventListener("click", () => {
          const userAnswer = normalizeAnswer(input.value);
          const correctAnswer = normalizeAnswer(game.answer);

          if (!userAnswer) {
            message.innerHTML = setMessage(
              "Please enter your answer first."
            );
            return;
          }

          if (!correctAnswer) {
            message.innerHTML = setMessage(
              "This game does not have an answer configured. Please inform the researcher."
            );
            return;
          }

          if (userAnswer === correctAnswer) {
            markGameCorrect();
          } else {
            playSound("wrong.mp3");
            message.innerHTML = setMessage(
              "Not quite. Try again."
            );
          }
        });

        input.addEventListener("keydown", event => {
          if (event.key === "Enter") {
            event.preventDefault();
            button.click();
          }
        });
      }

      /* MINI CROSSWORD */

      if (game.type === "crossword") {
        const crosswordInputs = Array.from(
          gameContainer.querySelectorAll(".nq-crossword-answer")
        );

        if (!crosswordInputs.length) {
          message.innerHTML = setMessage(
            "This crossword has no valid words configured."
          );
          button.disabled = true;
          return;
        }

        button.addEventListener("click", () => {
          let allCorrect = true;
          let answeredCount = 0;

          crosswordInputs.forEach(input => {
            const wordIndex = Number(input.dataset.wordIndex);
            const word = game.words?.[wordIndex];
            const status = gameContainer.querySelector(
              `[data-word-status="${wordIndex}"]`
            );

            const userAnswer = normalizeAnswer(input.value);
            const correctAnswer = normalizeAnswer(word?.answer);

            if (userAnswer) answeredCount++;

            if (
              !userAnswer ||
              !correctAnswer ||
              userAnswer !== correctAnswer
            ) {
              allCorrect = false;

              if (status) {
                status.textContent = userAnswer
                  ? "Check this answer and try again."
                  : "Answer this clue.";
                status.classList.remove("is-correct");
                status.classList.add("is-wrong");
              }
            } else if (status) {
              status.textContent = "Correct";
              status.classList.remove("is-wrong");
              status.classList.add("is-correct");
            }
          });

          if (allCorrect && answeredCount === crosswordInputs.length) {
            markGameCorrect();
          } else {
            playSound("wrong.mp3");
            message.innerHTML = setMessage(
              "Some answers are missing or incorrect. Check each clue and try again."
            );
          }
        });

        crosswordInputs.forEach(input => {
          input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
              event.preventDefault();
              button.click();
            }
          });
        });
      }
    });

    /* FINAL QUIZ BUTTON */

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
     READER GAME RENDERER
  ========================================================= */

  function renderReaderGame(game) {
    if (!game || !game.type) return "";

    /* JUMBLED WORDS */

    if (game.type === "jumbled") {
      const answerLetters = Array.from(
        String(game.answer || "")
          .replace(/\s/g, "")
      );

      return `
        <div class="game-box">
          <div class="eyebrow">Interactive Game</div>
          <h3>Jumbled Words</h3>

          <p class="small">
            Unscramble the letters to find the correct word.
          </p>

          <div class="nq-game-letter-bank" aria-label="Jumbled letters">
            ${
              Array.from(String(game.scrambled || ""))
                .filter(character => !/\s/.test(character))
                .map(character => `
                  <span class="nq-game-letter">
                    ${escapeHTML(character)}
                  </span>
                `)
                .join("") ||
              answerLetters.map(character => `
                <span class="nq-game-letter">
                  ${escapeHTML(character)}
                </span>
              `).join("")
            }
          </div>

          ${
            game.hint
              ? `
                <p class="small">
                  <strong>Hint:</strong> ${escapeHTML(game.hint)}
                </p>
              `
              : ""
          }

          <input
            class="game-answer game-input"
            type="text"
            autocomplete="off"
            autocapitalize="none"
            placeholder="Type your answer"
            aria-label="Your jumbled word answer"
          >

          <button class="game-submit primary-btn" type="button">
            Check Answer
          </button>

          <div class="game-message" aria-live="polite"></div>
        </div>
      `;
    }

    /* 4 PICS 1 WORD */

    if (game.type === "fourPics") {
      const images = Array.isArray(game.images)
        ? game.images.slice(0, 4)
        : [];

      return `
        <div class="game-box">
          <div class="eyebrow">Interactive Game</div>
          <h3>4 Pics 1 Word</h3>

          <p class="small">
            Look at the four pictures and find the word they have in common.
          </p>

          <div class="four-pics-grid">
            ${
              images.map((image, index) => {
                const imageUrl = String(image || "").trim();

                if (!imageUrl) {
                  return `
                    <div class="nq-image-placeholder">
                      Image ${index + 1}
                    </div>
                  `;
                }

                return `
                  <img
                    src="${escapeAttr(imageUrl)}"
                    alt="Picture ${index + 1}"
                    class="game-image"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  >
                  <div
                    class="nq-image-placeholder"
                    style="display:none"
                  >
                    Image unavailable
                  </div>
                `;
              }).join("")
            }
          </div>

          ${
            game.hint
              ? `
                <p class="small">
                  <strong>Hint:</strong> ${escapeHTML(game.hint)}
                </p>
              `
              : ""
          }

          <input
            class="game-answer game-input"
            type="text"
            autocomplete="off"
            autocapitalize="none"
            placeholder="What is the word?"
            aria-label="Your four pictures one word answer"
          >

          <button class="game-submit primary-btn" type="button">
            Check Answer
          </button>

          <div class="game-message" aria-live="polite"></div>
        </div>
      `;
    }

    /* MINI CROSSWORD */

    if (game.type === "crossword") {
      const words = Array.isArray(game.words)
        ? game.words
            .map((word, index) => ({
              originalIndex: index,
              answer: String(word.answer || "").trim().toUpperCase(),
              clue: String(word.clue || "").trim(),
              row: Number(word.row),
              column: Number(word.column),
              direction: word.direction === "down" ? "down" : "across"
            }))
            .filter(word =>
              word.answer.length > 0 &&
              word.clue.length > 0 &&
              Number.isInteger(word.row) &&
              Number.isInteger(word.column) &&
              word.row >= 1 &&
              word.column >= 1
            )
        : [];

      const sizeValue = Number(game.size);
      const size = Number.isInteger(sizeValue) && sizeValue > 0
        ? Math.min(sizeValue, 20)
        : 8;

      if (!words.length) {
        return `
          <div class="game-box">
            <div class="eyebrow">Interactive Game</div>
            <h3>Mini Crossword</h3>

            <div class="nq-crossword-empty">
              This crossword has no valid clues yet. Please inform the researcher.
            </div>

            <div class="game-message"></div>
            <button class="game-submit primary-btn" type="button" disabled>
              Crossword unavailable
            </button>
          </div>
        `;
      }

      /*
       * Build a grid from the researcher's word coordinates.
       * Researcher row and column values are treated as 1-based.
       */

      const cells = new Map();
      const starts = new Map();
      const wordNumbers = new Map();
      const acrossWords = [];
      const downWords = [];

      function cellKey(row, column) {
        return `${row},${column}`;
      }

      words.forEach(word => {
        const startKey = cellKey(word.row, word.column);

        if (!starts.has(startKey)) {
          starts.set(startKey, []);
        }

        starts.get(startKey).push(word.originalIndex);
      });

      let clueNumber = 0;
      const numberedStarts = new Map();

      words
        .slice()
        .sort((a, b) =>
          a.row - b.row ||
          a.column - b.column ||
          a.originalIndex - b.originalIndex
        )
        .forEach(word => {
          const key = cellKey(word.row, word.column);

          if (!numberedStarts.has(key)) {
            clueNumber++;
            numberedStarts.set(key, clueNumber);
          }

          wordNumbers.set(word.originalIndex, numberedStarts.get(key));
        });

      words.forEach(word => {
        const answer = word.answer.replace(/\s/g, "");
        const row = word.row;
        const column = word.column;

        if (word.direction === "across") {
          acrossWords.push(word);
        } else {
          downWords.push(word);
        }

        if (
          row > size ||
          column > size ||
          row < 1 ||
          column < 1
        ) {
          return;
        }

        Array.from(answer).forEach((letter, offset) => {
          const targetRow = word.direction === "down"
            ? row + offset
            : row;

          const targetColumn = word.direction === "across"
            ? column + offset
            : column;

          if (
            targetRow < 1 ||
            targetRow > size ||
            targetColumn < 1 ||
            targetColumn > size
          ) {
            return;
          }

          const key = cellKey(targetRow, targetColumn);

          if (!cells.has(key)) {
            cells.set(key, {
              row: targetRow,
              column: targetColumn,
              letter,
              numbers: []
            });
          } else {
            /*
             * Keep the first letter if the researcher has configured
             * conflicting crossing words. The researcher should correct
             * conflicting answers in the editor.
             */
            const existing = cells.get(key);
            if (existing.letter !== letter) {
              existing.conflict = true;
            }
          }

          const cell = cells.get(key);
          const number = wordNumbers.get(word.originalIndex);

          if (
            offset === 0 &&
            number &&
            !cell.numbers.includes(number)
          ) {
            cell.numbers.push(number);
          }
        });
      });

      let gridHTML = "";

      for (let row = 1; row <= size; row++) {
        for (let column = 1; column <= size; column++) {
          const cell = cells.get(cellKey(row, column));

          if (!cell) {
            gridHTML += `<div class="nq-crossword-cell is-block"></div>`;
            continue;
          }

          gridHTML += `
            <div class="nq-crossword-cell ${cell.numbers.length ? "is-start" : ""}">
              ${
                cell.numbers.length
                  ? `<span class="nq-crossword-number">${cell.numbers[0]}</span>`
                  : ""
              }
              <span class="nq-crossword-letter">&nbsp;</span>
            </div>
          `;
        }
      }

      function renderClueList(list) {
        if (!list.length) {
          return `<p class="small">No clues in this direction.</p>`;
        }

        return list.map(word => {
          const number = wordNumbers.get(word.originalIndex) || "?";
          const answerLength = word.answer.replace(/\s/g, "").length;

          return `
            <div class="nq-crossword-clue">
              <label for="crossword-answer-${word.originalIndex}">
                ${number}. ${escapeHTML(word.clue)}
                <span class="small">(${answerLength} letters)</span>
              </label>

              <input
                id="crossword-answer-${word.originalIndex}"
                class="nq-crossword-answer"
                data-word-index="${word.originalIndex}"
                type="text"
                autocomplete="off"
                autocapitalize="characters"
                spellcheck="false"
                placeholder="Enter answer"
                aria-label="Crossword clue ${number}"
              >

              <div
                class="nq-crossword-status"
                data-word-status="${word.originalIndex}"
                aria-live="polite"
              ></div>
            </div>
          `;
        }).join("");
      }

      return `
        <div class="game-box">
          <div class="eyebrow">Interactive Game</div>
          <h3>Mini Crossword</h3>

          <p class="small">
            Solve every clue to unlock the next part of the article.
          </p>

          <div class="nq-crossword-layout">
            <div class="nq-crossword-grid-wrap">
              <div
                class="nq-crossword-grid"
                style="grid-template-columns: repeat(${size}, 34px)"
                aria-label="Crossword grid preview"
              >
                ${gridHTML}
              </div>

              <p class="small">
                Fill in the answers using the clues. The clue list below is the answer input area.
              </p>
            </div>

            <div class="nq-crossword-clues">
              <div class="nq-crossword-clue-group">
                <h4>Across</h4>
                ${renderClueList(acrossWords)}
              </div>

              <div class="nq-crossword-clue-group">
                <h4>Down</h4>
                ${renderClueList(downWords)}
              </div>
            </div>
          </div>

          <button class="game-submit primary-btn" type="button">
            Check Crossword
          </button>

          <div class="game-message" aria-live="polite"></div>
        </div>
      `;
    }

    return "";
  }

  /* =========================================================
     OLD ARTICLE FORMAT
  ========================================================= */

  function renderOldArticle(article, session) {
    getAppRoot().innerHTML = `
      <div class="topbar">
        <div class="progress-wrap">
          <div class="progress-label">
            <span>Reading</span>
            <span>Article</span>
          </div>

          <div class="progress-track">
            <div class="progress-fill" style="width: 100%"></div>
          </div>
        </div>

        <div class="points">+0 points</div>
      </div>

      <article class="article-card card">
        ${
          article.image
            ? `
              <img
                class="article-image"
                src="${escapeAttr(article.image)}"
                alt="Article image"
              >
            `
            : ""
        }

        <div class="article-content">
          <div class="eyebrow">
            Set ${escapeHTML(session?.set || "")} · Assigned reading
          </div>

          <h2>${escapeHTML(article.title || "")}</h2>

          <p class="article-body">
            ${escapeHTML(article.body || "")}
          </p>

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
    getAppRoot().innerHTML = `
      <div class="topbar">
        <div class="progress-wrap">
          <div class="progress-label">
            <span>Quiz progress</span>
            <span>5 questions</span>
          </div>

          <div class="progress-track">
            <div class="progress-fill" style="width: 100%"></div>
          </div>
        </div>

        <div class="points">Up to 100 points</div>
      </div>

      <form id="quiz-form" class="quiz-card card">
        <div class="eyebrow">Knowledge check</div>

        <h2>${escapeHTML(article.title || "")}</h2>

        <p class="small">
          Answer all five questions before submitting.
        </p>

        ${
          Array.isArray(article.questions)
            ? article.questions.map((question, index) => `
              <fieldset class="question">
                <legend class="question-title">
                  ${index + 1}. ${escapeHTML(question.text)}
                </legend>

                ${
                  Array.isArray(question.choices)
                    ? question.choices.map((choice, choiceIndex) => `
                      <label class="choice">
                        <input
                          type="radio"
                          name="question-${index}"
                          value="${choiceIndex}"
                          required
                        >

                        <span>${escapeHTML(choice)}</span>
                      </label>
                    `).join("")
                    : ""
                }
              </fieldset>
            `).join("")
            : ""
        }

        <div id="quiz-message"></div>

        <button class="primary-btn" type="submit">
          Submit quiz
        </button>
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

    if (!session?.code || !session?.articleId) {
      const message = document.querySelector("#quiz-message");

      if (message) {
        message.innerHTML = setMessage(
          "Your session is missing. Please return to the start page and use your respondent code."
        );
      }

      return;
    }

    const formData = new FormData(event.target);
    const message = document.querySelector("#quiz-message");

    const answers = article.questions.map((_, index) =>
      Number(formData.get(`question-${index}`))
    );

    const score = article.questions.reduce((total, question, index) => {
      return total + (answers[index] === question.correct ? 1 : 0);
    }, 0);

    // Test Mode must never write to official responses, respondentCodes, or leaderboards.
    if (session.mode === "test") {
      const testResult = {
        respondentCode: session.code,
        displayName: session.nickname || "Test User",
        set: "TEST MODE",
        articleId: session.articleId,
        answers,
        score,
        totalQuestions: 5,
        percentage: score * 20,
        points: score * 20,
        submittedAt: new Date().toISOString(),
        status: "Test completed",
        testMode: true
      };
      playSound("complete.mp3");
      showConfetti();
      await renderResult(testResult);
      return;
    }

    const responseData = {
      respondentCode: session.code,
      set: session.set,
      articleId: session.articleId,
      answers,
      score,
      totalQuestions: 5,
      percentage: score * 20,
      points: score * 20,
      submittedAt: serverTimestamp(),
      status: "Completed"
    };

    try {
      message.innerHTML = setMessage(
        "Submitting your answers...",
        "notice"
      );

      const submitButton = event.target.querySelector(
        'button[type="submit"]'
      );

      if (submitButton) submitButton.disabled = true;

      const codeRef = doc(db, "respondentCodes", session.code);
      const responseRef = doc(db, "responses", session.code);
      const leaderboardRef = doc(
        db,
        "leaderboards",
        session.articleId,
        "entries",
        session.code
      );

      const participantNumber = session.code.split("-")[1] || "000";

      await runTransaction(db, async transaction => {
        const codeSnapshot = await transaction.get(codeRef);

        if (!codeSnapshot.exists()) {
          throw new Error("CODE_NOT_FOUND");
        }

        const currentCode = codeSnapshot.data();

        if (currentCode.status === "Used") {
          throw new Error("CODE_ALREADY_USED");
        }

        transaction.update(codeRef, {
          status: "Used",
          usedAt: serverTimestamp()
        });

        transaction.set(responseRef, responseData);

        transaction.set(leaderboardRef, {
          articleId: session.articleId,
          set: session.set,
          displayName: `Participant ${participantNumber}`,
          points: responseData.points,
          score: responseData.score,
          respondentCode: session.code,
          createdAt: serverTimestamp()
        });
      });

      playSound("complete.mp3");
      showConfetti();

      await renderResult({
        ...responseData,
        submittedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);

      const submitButton = document.querySelector(
        '#quiz-form button[type="submit"]'
      );

      if (submitButton) submitButton.disabled = false;

      if (error.message === "CODE_ALREADY_USED") {
        message.innerHTML = setMessage(
          "This respondent code has already been used."
        );
        return;
      }

      if (error.message === "CODE_NOT_FOUND") {
        message.innerHTML = setMessage(
          "This respondent code is no longer available."
        );
        return;
      }

      message.innerHTML = setMessage(
        "Your response could not be submitted. Please try again."
      );
    }
  }

  /* =========================================================
     RESULT AND LEADERBOARD
  ========================================================= */

  async function renderResult(response) {
    getAppRoot().innerHTML = `
      <section class="result-card card">
        <div class="eyebrow">Completed</div>

        <h2>Your NewsQuest result</h2>

        <div class="result-score">
          ${response.score}/5
        </div>

        <div class="stat-grid">
          <div class="stat">
            <span class="small">Percentage</span>
            <strong>${response.percentage}%</strong>
          </div>

          <div class="stat">
            <span class="small">Points earned</span>
            <strong>${response.points}</strong>
          </div>

          <div class="stat">
            <span class="small">Status</span>
            <strong>Done</strong>
          </div>
        </div>

        <div class="notice">
          ${response.testMode
            ? `TEST MODE: ${escapeHTML(response.displayName || "Test User")}, your result is only a preview. It was not saved to official research records or the leaderboard. You may test again using the same nickname.`
            : "Thank you. Your response has been recorded. This respondent code cannot be used for another attempt."}
        </div>

        ${response.testMode ? "" : `
          <section style="margin-top: 30px; text-align: left;">
            <div class="eyebrow">Article leaderboard</div>
            <h3>Top Participants · ${escapeHTML(String(response.articleId || "").replace("article", "Article "))}</h3>
            <div id="leaderboard"><div class="notice">Loading leaderboard...</div></div>
          </section>
        `}

        ${response.testMode ? `
          <div class="action-row" style="margin-top: 22px;">
            <button id="test-again-btn" class="primary-btn" type="button">Test another article</button>
            <button id="test-home-btn" class="secondary-btn" type="button">Back to start</button>
          </div>
        ` : ""}

        <p class="small" style="margin-top: 24px;">
          Correct answers are not displayed in the respondent interface.
        </p>
      </section>
    `;

    if (response.testMode) {
      document.querySelector("#test-again-btn")?.addEventListener("click", renderWelcome);
      document.querySelector("#test-home-btn")?.addEventListener("click", renderWelcome);
      return;
    }

    if (!response.testMode) try {
      const leaderboardQuery = query(
        collection(db, "leaderboards", response.articleId, "entries"),
        orderBy("points", "desc"),
        limit(10)
      );

      const snapshot = await getDocs(leaderboardQuery);

      const rows = snapshot.docs.map((item, index) => {
        const entry = item.data();
        const rank = index + 1;

        let medal = "";

        if (rank === 1) medal = "🥇";
        if (rank === 2) medal = "🥈";
        if (rank === 3) medal = "🥉";

        return `
          <div
            class="stat"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 12px;
              margin-bottom: 10px;
            "
          >
            <span>
              <strong>
                ${medal} ${rank}. ${escapeHTML(entry.displayName || "Participant")}
              </strong>
            </span>

            <span>${Number(entry.points || 0)} pts</span>
          </div>
        `;
      }).join("");

      const leaderboard = document.querySelector("#leaderboard");

      if (leaderboard) {
        leaderboard.innerHTML = rows || `
          <div class="notice">No leaderboard entries yet.</div>
        `;
      }
    } catch (error) {
      console.error("Leaderboard error:", error);

      const leaderboard = document.querySelector("#leaderboard");

      if (leaderboard) {
        leaderboard.innerHTML = `
          <div class="error">Leaderboard could not be loaded.</div>
        `;
      }
    }
  }

  /* =========================================================
     START APP
  ========================================================= */

  injectGameStyles();
  renderWelcome();

})();
