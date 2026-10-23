
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

      .nq-answer-slots {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px;
        min-height: 48px;
        margin: 16px 0 8px;
      }

      .nq-answer-slot {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 43px;
        padding: 0;
        border: 2px solid #a8c39f;
        border-bottom-width: 4px;
        border-radius: 7px;
        background: #fff;
        color: #205b35;
        font-size: 19px;
        font-weight: 800;
        cursor: pointer;
      }

      .nq-answer-slot.is-filled {
        background: #e5f1df;
        border-color: #4f8a55;
        animation: nqTilePop .16s ease-out;
      }

      .nq-letter-tile {
        cursor: pointer;
        transition: transform .15s ease, background .15s ease;
      }

      .nq-letter-tile:not(:disabled):hover {
        transform: translateY(-3px);
        background: #d5e9cb;
      }

      .nq-letter-tile:disabled {
        opacity: .35;
        transform: scale(.94);
      }

      .nq-crossword-answer[type="hidden"],
      .nq-interactive-game .game-answer[type="hidden"] {
        display: none !important;
      }

      @keyframes nqTilePop {
        from { transform: scale(.88); }
        to { transform: scale(1); }
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
          <div class="eyebrow">NewsQuest</div>
          <h1>Welcome to NewsQuest</h1>
          <p class="lead">Enter your nickname to begin. Keep using the same nickname if you need to continue an unfinished attempt.</p>
          <form id="nickname-form">
            <div class="form-group">
              <label for="participant-nickname">Nickname</label>
              <input id="participant-nickname" name="nickname" autocomplete="off" maxlength="40" placeholder="Enter your nickname" required>
              <p class="small">Use a nickname you can remember. The same nickname can submit only once.</p>
            </div>
            <div id="nickname-message" aria-live="polite"></div>
            <button class="primary-btn" type="submit">Continue</button>
          </form>
        </div>
        <div class="welcome-art" aria-hidden="true">
          <div class="illustration"><div class="illustration-inner">
            <strong>NEWS</strong><hr><p>Read · Learn · Recall</p><span>+100 points</span>
          </div></div>
        </div>
      </section>
    `;
    document.querySelector("#nickname-form").addEventListener("submit", handleNicknameEntry);
  }

  function nicknameDocumentId(nickname) {
    return encodeURIComponent(normalizeAnswer(nickname));
  }

  async function handleNicknameEntry(event) {
    event.preventDefault();
    const nickname = document.querySelector("#participant-nickname").value.trim();
    const message = document.querySelector("#nickname-message");
    if (!nickname) {
      message.innerHTML = setMessage("Please enter a nickname.");
      return;
    }
    if (normalizeAnswer(nickname) === "aninag") {
      message.innerHTML = setMessage("Opening Test Mode...", "notice");
      renderTestArticleSelection("Aninag");
      return;
    }
    await startRespondent(nickname, message);
  }

  async function renderTestArticleSelection(nickname) {
    const root = getAppRoot();
    root.innerHTML = `
      <section class="card" style="max-width:900px;margin:0 auto;">
        <div class="eyebrow">Test Mode · ${escapeHTML(nickname)}</div>
        <h1>Choose an article</h1>
        <p class="lead">Tap a title tab to preview the story you want to read.</p>
        <div id="test-article-tabs" role="tablist" aria-label="Available articles" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;border-bottom:1px solid #d9e5d4;padding-bottom:10px;">
          <p class="notice">Loading article titles...</p>
        </div>
        <section id="test-article-preview" class="card" style="margin-top:18px;padding:24px;background:#f8fbf6;border:1px solid #d9e5d4;">
          <p class="notice">Loading selected article...</p>
        </section>
        <div id="test-article-message" aria-live="polite"></div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:18px;">
          <button class="secondary-btn" id="back-to-nickname" type="button">Back</button>
          <button class="primary-btn" id="start-selected-article" type="button" disabled>Proceed to article</button>
        </div>
      </section>
    `;

    document.querySelector("#back-to-nickname").addEventListener("click", renderWelcome);
    const tabs = document.querySelector("#test-article-tabs");
    const preview = document.querySelector("#test-article-preview");
    const startButton = document.querySelector("#start-selected-article");
    const availableIds = ["article1", "article2", "article3"];
    const loaded = [];

    for (const articleId of availableIds) {
      try {
        const article = await getArticle(articleId);
        loaded.push({ ...article, articleId: article.articleId || articleId });
      } catch (error) {
        console.warn(`Could not load ${articleId}:`, error);
      }
    }

    if (!document.querySelector("#test-article-tabs")) return;

    if (!loaded.length) {
      tabs.innerHTML = setMessage("No articles could be loaded. Check the articles collection in Firestore.");
      preview.innerHTML = "";
      return;
    }

    let selectedArticle = loaded[0];

    function showSelectedArticle(article) {
      selectedArticle = article;
      tabs.querySelectorAll('[role="tab"]').forEach(tab => {
        const isSelected = tab.dataset.articleId === article.articleId;
        tab.setAttribute("aria-selected", String(isSelected));
        tab.style.background = isSelected ? "#315b3c" : "#ffffff";
        tab.style.color = isSelected ? "#ffffff" : "#315b3c";
        tab.style.borderColor = isSelected ? "#315b3c" : "#d9e5d4";
      });

      const title = String(article.title || article.headline || article.name || "Untitled article");
      const description = String(article.description || article.summary || "Read this story and answer its quiz.");
      preview.innerHTML = `
        <div class="eyebrow">Selected article</div>
        <h2 style="margin:10px 0 12px;">${escapeHTML(title)}</h2>
        <p style="margin:0;line-height:1.65;">${escapeHTML(description)}</p>
        <p class="small" style="margin-top:16px;">You will read this article first, then answer its five-question quiz.</p>
      `;
      startButton.disabled = false;
    }

    tabs.innerHTML = loaded.map((article, index) => {
      const title = String(article.title || article.headline || article.name || `Article ${index + 1}`);
      return `
        <button type="button" role="tab" aria-selected="false" data-article-id="${escapeAttr(article.articleId)}" style="appearance:none;border:1px solid #d9e5d4;border-radius:999px;padding:11px 18px;background:#fff;color:#315b3c;font:inherit;font-weight:600;cursor:pointer;max-width:100%;">
          ${escapeHTML(title)}
        </button>
      `;
    }).join("");

    tabs.querySelectorAll('[role="tab"]').forEach((tab, index) => {
      tab.addEventListener("click", () => showSelectedArticle(loaded[index]));
    });

    showSelectedArticle(selectedArticle);
    startButton.addEventListener("click", () => startTestModeWithArticle(nickname, selectedArticle.articleId));
  }

  async function startTestModeWithArticle(nickname, articleId) {
    const message = document.querySelector("#test-article-message");
    const buttons = document.querySelectorAll("[data-article-id]");
    buttons.forEach(button => button.disabled = true);

    try {
      if (message) message.innerHTML = setMessage("Opening selected article...", "notice");
      const article = await getArticle(articleId);
      if (!Array.isArray(article.questions) || article.questions.length !== 5) {
        if (message) message.innerHTML = setMessage("This article must have exactly five quiz questions before it can be tested.");
        buttons.forEach(button => button.disabled = false);
        return;
      }

      saveSession({
        mode: "test",
          nickname,
        set: "TEST MODE",
        articleId,
        startedAt: new Date().toISOString()
      });
      renderArticle(article);
    } catch (error) {
      console.error("Test Mode article load failed:", error);
      if (message) message.innerHTML = setMessage("Could not open that article. Please try again.");
      buttons.forEach(button => button.disabled = false);
    }
  }

  /* =========================================================
     START RESPONDENT
  ========================================================= */

  async function startRespondent(nickname, message) {
    const nicknameKey = nicknameDocumentId(nickname);
    const participantRef = doc(db, "participants", nicknameKey);
    const responseRef = doc(db, "responses", nicknameKey);
    const messageBox = message || document.querySelector("#nickname-message");

    try {
      messageBox.innerHTML = setMessage("Checking nickname and assigning your article...", "notice");
      let assignment = null;

      await runTransaction(db, async transaction => {
        const participantSnapshot = await transaction.get(participantRef);

        if (participantSnapshot.exists() && participantSnapshot.data().status === "Completed") {
          throw new Error("NICKNAME_ALREADY_USED");
        }

        if (participantSnapshot.exists()) {
          const existing = participantSnapshot.data();
          if (existing.articleId && existing.set) {
            assignment = { articleId: existing.articleId, set: existing.set };
            return;
          }
        }

        const set = Math.floor(Math.random() * 3) + 1;
        const articleId = `article${set}`;
        assignment = { articleId, set };
        transaction.set(participantRef, {
          nickname,
          nicknameKey,
          articleId,
          set,
          status: "In Progress",
          createdAt: participantSnapshot.exists() && participantSnapshot.data().createdAt
            ? participantSnapshot.data().createdAt
            : serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

      const article = await getArticle(assignment.articleId);
      if (!Array.isArray(article.questions) || article.questions.length !== 5) {
        messageBox.innerHTML = setMessage("The assigned article does not have exactly five questions. Please contact the researcher.");
        return;
      }

      saveSession({
        mode: "official",
        nickname,
        nicknameKey,
        set: assignment.set,
        articleId: assignment.articleId,
        startedAt: new Date().toISOString()
      });
      renderArticle(article);
    } catch (error) {
      console.error(error);
      if (error.message === "NICKNAME_ALREADY_USED") {
        messageBox.innerHTML = setMessage("This nickname has already submitted a response. Please use a different nickname.");
        return;
      }
      messageBox.innerHTML = setMessage("Something went wrong while connecting to NewsQuest. Please try again.");
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

        gameContainer.querySelectorAll("input, .nq-letter-tile, .nq-answer-slot").forEach(input => {
          input.disabled = true;
        });

        gameContainer.querySelectorAll(".nq-crossword-status").forEach(status => {
          status.classList.add("is-correct");
        });

        unlockGamePage();
      }

      /* TILE-BASED JUMBLED WORDS AND 4 PICS 1 WORD */

      if (game.type === "jumbled" || game.type === "fourPics") {
        const input = gameContainer.querySelector(".game-answer");
        const slots = Array.from(gameContainer.querySelectorAll(".nq-answer-slot"));
        const tiles = Array.from(gameContainer.querySelectorAll(".nq-letter-tile"));
        if (!input || !slots.length || !tiles.length) return;

        function syncTiles() {
          input.value = slots.map(slot => slot.dataset.letter || "").join("");
          slots.forEach((slot, index) => {
            slot.textContent = slot.dataset.letter || "＿";
            slot.classList.toggle("is-filled", Boolean(slot.dataset.letter));
            slot.setAttribute("aria-label", `Answer letter ${index + 1}: ${slot.dataset.letter || "empty"}`);
          });
        }

        tiles.forEach(tile => tile.addEventListener("click", () => {
          if (tile.disabled) return;
          const emptySlot = slots.find(slot => !slot.dataset.letter);
          if (!emptySlot) return;
          emptySlot.dataset.letter = tile.dataset.letter || tile.textContent.trim();
          emptySlot.dataset.tileId = tile.dataset.tileId;
          tile.disabled = true;
          syncTiles();
          message.textContent = "";
        }));

        slots.forEach(slot => slot.addEventListener("click", () => {
          if (!slot.dataset.letter) return;
          const tile = tiles.find(item => item.dataset.tileId === slot.dataset.tileId);
          if (tile) tile.disabled = false;
          delete slot.dataset.letter;
          delete slot.dataset.tileId;
          syncTiles();
        }));

        button.addEventListener("click", () => {
          const userAnswer = normalizeAnswer(input.value);
          const correctAnswer = normalizeAnswer(game.answer);
          if (!correctAnswer) {
            message.innerHTML = setMessage("This game does not have an answer configured. Please inform the researcher.");
            return;
          }
          if (userAnswer === correctAnswer) {
            markGameCorrect();
          } else {
            playSound("wrong.mp3");
            slots.forEach(slot => {
              const tile = tiles.find(item => item.dataset.tileId === slot.dataset.tileId);
              if (tile) tile.disabled = false;
              delete slot.dataset.letter;
              delete slot.dataset.tileId;
            });
            syncTiles();
            message.innerHTML = setMessage("Not quite. The letters were cleared. Try again.");
          }
        });
        syncTiles();
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
                  ? "Incorrect. The letters were cleared; try again."
                  : "Answer this clue.";
                status.classList.remove("is-correct");
                status.classList.add("is-wrong");
              }
              const wordBox = input.closest(".nq-crossword-word");
              if (wordBox && userAnswer) {
                wordBox.querySelectorAll(".nq-answer-slot").forEach(slot => {
                  const tile = wordBox.querySelector(`[data-tile-id="${slot.dataset.tileId}"]`);
                  if (tile) tile.disabled = false;
                  delete slot.dataset.letter;
                  delete slot.dataset.tileId;
                  slot.textContent = "＿";
                  slot.classList.remove("is-filled");
                });
                input.value = "";
                syncCrosswordGrid();
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

        /* Crossword letter tiles fill the answer boxes and the crossword grid. */
        function syncCrosswordGrid() {
          const grid = gameContainer.querySelector(".nq-crossword-grid");
          if (!grid) return;
          const letterByCell = new Map();
          gameContainer.querySelectorAll(".nq-crossword-word").forEach(wordBox => {
            const startRow = Number(wordBox.dataset.row);
            const startColumn = Number(wordBox.dataset.column);
            const direction = wordBox.dataset.direction;
            wordBox.querySelectorAll(".nq-answer-slot").forEach((slot, index) => {
              if (!slot.dataset.letter) return;
              const row = startRow + (direction === "down" ? index : 0);
              const column = startColumn + (direction === "across" ? index : 0);
              const key = `${row},${column}`;
              if (!letterByCell.has(key)) letterByCell.set(key, slot.dataset.letter);
            });
          });
          grid.querySelectorAll(".nq-crossword-cell[data-row]").forEach(cell => {
            const key = `${cell.dataset.row},${cell.dataset.column}`;
            const letter = letterByCell.get(key) || "";
            const span = cell.querySelector(".nq-crossword-letter");
            if (span) span.textContent = letter || " ";
          });
        }

        gameContainer.querySelectorAll(".nq-crossword-word").forEach(wordBox => {
          const wordIndex = wordBox.dataset.crosswordWord;
          const input = wordBox.querySelector(".nq-crossword-answer");
          const slots = Array.from(wordBox.querySelectorAll(".nq-answer-slot"));
          const tiles = Array.from(wordBox.querySelectorAll(".nq-letter-tile"));
          const status = wordBox.querySelector(".nq-crossword-status");
          const syncWord = () => {
            input.value = slots.map(slot => slot.dataset.letter || "").join("");
            slots.forEach((slot, index) => {
              slot.textContent = slot.dataset.letter || "＿";
              slot.classList.toggle("is-filled", Boolean(slot.dataset.letter));
              slot.setAttribute("aria-label", `Letter ${index + 1}: ${slot.dataset.letter || "empty"}`);
            });
            if (status && !status.classList.contains("is-correct")) {
              status.textContent = "";
              status.classList.remove("is-wrong");
            }
            syncCrosswordGrid();
          };
          tiles.forEach(tile => tile.addEventListener("click", () => {
            if (tile.disabled) return;
            const slot = slots.find(item => !item.dataset.letter);
            if (!slot) return;
            slot.dataset.letter = tile.dataset.letter;
            slot.dataset.tileId = tile.dataset.tileId;
            tile.disabled = true;
            syncWord();
          }));
          slots.forEach(slot => slot.addEventListener("click", () => {
            if (!slot.dataset.letter) return;
            const tile = tiles.find(item => item.dataset.tileId === slot.dataset.tileId);
            if (tile) tile.disabled = false;
            delete slot.dataset.letter;
            delete slot.dataset.tileId;
            syncWord();
          }));
          syncWord();
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

    /* JUMBLED WORDS: tap letters in spelling order */

    if (game.type === "jumbled") {
      const answerLetters = Array.from(String(game.answer || "").replace(/\s/g, ""));
      const letters = game.scrambled
        ? Array.from(String(game.scrambled).replace(/\s/g, ""))
        : answerLetters.slice().sort(() => Math.random() - 0.5);
      const answerLength = answerLetters.length;
      return `
        <div class="game-box nq-tile-puzzle">
          <div class="eyebrow">Interactive Game</div>
          <h3>Jumbled Words</h3>
          <p class="small">Tap the letter tiles in the correct spelling order. Tap an answer box to remove a letter.</p>
          <div class="nq-answer-slots" aria-label="Answer boxes">
            ${Array.from({length: answerLength}, (_, index) => `<button type="button" class="nq-answer-slot" data-slot="${index}" aria-label="Empty answer letter ${index + 1}">＿</button>`).join("")}
          </div>
          <div class="nq-game-letter-bank" aria-label="Letter tiles">
            ${letters.map((character, index) => `<button type="button" class="nq-game-letter nq-letter-tile" data-letter="${escapeAttr(character)}" data-tile-id="tile-${index}">${escapeHTML(character)}</button>`).join("")}
          </div>
          ${game.hint ? `<p class="small"><strong>Hint:</strong> ${escapeHTML(game.hint)}</p>` : ""}
          <input class="game-answer game-input" type="hidden" aria-label="Selected answer">
          <button class="game-submit primary-btn" type="button">Check Answer</button>
          <div class="game-message" aria-live="polite"></div>
        </div>
      `;
    }

    /* 4 PICS 1 WORD */

    if (game.type === "fourPics") {
      const images = Array.isArray(game.images)
        ? game.images.slice(0, 4)
        : [];
      const fourPicsLetters = Array.from(String(game.answer || "").replace(/\s/g, "")).sort(() => Math.random() - 0.5);

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

          <div class="nq-answer-slots" aria-label="Answer boxes">
            ${Array.from({length: Array.from(String(game.answer || "").replace(/\s/g, "")).length}, (_, index) => `<button type="button" class="nq-answer-slot" data-slot="${index}" aria-label="Empty answer letter ${index + 1}">＿</button>`).join("")}
          </div>
          <div class="nq-game-letter-bank" aria-label="Letter tiles">
            ${fourPicsLetters.map((character, index) => `<button type="button" class="nq-game-letter nq-letter-tile" data-letter="${escapeAttr(character)}" data-tile-id="tile-${index}">${escapeHTML(character)}</button>`).join("")}
          </div>
          <input class="game-answer game-input" type="hidden" aria-label="Selected answer">
          <button class="game-submit primary-btn" type="button">Check Answer</button>

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
            gridHTML += `<div class="nq-crossword-cell is-block" data-row="${row}" data-column="${column}"></div>`;
            continue;
          }

          gridHTML += `
            <div class="nq-crossword-cell ${cell.numbers.length ? "is-start" : ""}" data-row="${row}" data-column="${column}">
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
            <div class="nq-crossword-clue nq-crossword-word" data-crossword-word="${word.originalIndex}" data-row="${word.row}" data-column="${word.column}" data-direction="${word.direction}">
              <label>
                ${number}. ${escapeHTML(word.clue)}
                <span class="small">(${answerLength} letters)</span>
              </label>

              <div class="nq-answer-slots" aria-label="Answer boxes for clue ${number}">
                ${Array.from({length: answerLength}, (_, index) => `<button type="button" class="nq-answer-slot" data-slot="${index}" aria-label="Empty letter ${index + 1}">＿</button>`).join("")}
              </div>
              <div class="nq-game-letter-bank" aria-label="Letter tiles for clue ${number}">
                ${Array.from(word.answer.replace(/\s/g, "")).map((character, index, source) => ({character, index, sort: Math.random()})).sort((a,b) => a.sort-b.sort).map(item => `<button type="button" class="nq-game-letter nq-letter-tile" data-letter="${escapeAttr(item.character)}" data-tile-id="cw-${word.originalIndex}-${item.index}">${escapeHTML(item.character)}</button>`).join("")}
              </div>
              <input
                id="crossword-answer-${word.originalIndex}"
                class="nq-crossword-answer"
                data-word-index="${word.originalIndex}"
                type="hidden"
                aria-label="Crossword clue ${number}"
              >
              <div class="nq-crossword-status" data-word-status="${word.originalIndex}" aria-live="polite"></div>
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

    if (!session?.nickname || !session?.articleId || (session.mode !== "test" && !session?.nicknameKey)) {
      const message = document.querySelector("#quiz-message");
      if (message) message.innerHTML = setMessage("Your session is missing. Please return to the start page and enter your nickname.");
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

    // Test Mode must never write to official responses, participants, or leaderboards.
    if (session.mode === "test") {
      const testResult = {
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
      nickname: session.nickname,
      nicknameKey: session.nicknameKey,
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

      const participantRef = doc(db, "participants", session.nicknameKey);
      const responseRef = doc(db, "responses", session.nicknameKey);
      const leaderboardRef = doc(db, "leaderboards", session.articleId, "entries", session.nicknameKey);

      await runTransaction(db, async transaction => {
        const participantSnapshot = await transaction.get(participantRef);

        if (participantSnapshot.exists() && participantSnapshot.data().status === "Completed") {
          throw new Error("NICKNAME_ALREADY_USED");
        }
        if (!participantSnapshot.exists()) throw new Error("PARTICIPANT_NOT_FOUND");

        transaction.set(responseRef, responseData);
        transaction.set(participantRef, {
          nickname: session.nickname,
          nicknameKey: session.nicknameKey,
          articleId: session.articleId,
          set: session.set,
          status: "Completed",
          submittedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        transaction.set(leaderboardRef, {
          articleId: session.articleId,
          set: session.set,
          displayName: session.nickname,
          points: responseData.points,
          score: responseData.score,
          nickname: session.nickname,
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

      if (error.message === "NICKNAME_ALREADY_USED") {
        message.innerHTML = setMessage(
          "This nickname has already submitted a response."
        );
        return;
      }

      if (error.message === "PARTICIPANT_NOT_FOUND") {
        message.innerHTML = setMessage("Your nickname assignment was not found. Please return to the start page and try again.");
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
            : "Thank you. Your response has been recorded. This nickname cannot be used for another attempt."}
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
