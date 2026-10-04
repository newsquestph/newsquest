(async () => {

  const [{ initializeApp }, firebase] = await Promise.all([
    import(
      "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"
    ),
    import(
      "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"
    )
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

  const app =
    initializeApp(firebaseConfig);

  const db =
    getFirestore(app);


  /* =========================================================
     HELPERS
  ========================================================= */

  function setMessage(
    message,
    type = "error"
  ) {

    return `
      <div class="${type}">
        ${message}
      </div>
    `;

  }


  function escapeHTML(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


function escapeAttr(value) {

  return escapeHTML(value);

}


function playSound(file) {
  const audio = new Audio(file);
  audio.volume = 0.7;
  audio.play().catch(() => {});
}


function getSession() {

  return JSON.parse(
    sessionStorage.getItem(
      "newsquest_session"
    ) || "null"
  );

}


  function saveSession(session) {

    sessionStorage.setItem(
      "newsquest_session",
      JSON.stringify(session)
    );

  }


  /* =========================================================
     FIRESTORE ARTICLE
  ========================================================= */

  async function getArticle(articleId) {

    const snapshot =
      await getDoc(
        doc(
          db,
          "articles",
          articleId
        )
      );

    if (!snapshot.exists()) {

      throw new Error(
        "ARTICLE_NOT_FOUND"
      );

    }

    return {
      articleId: snapshot.id,
      ...snapshot.data()
    };

  }
function showConfetti() {
  const container = document.createElement("div");

  container.className = "confetti-container";

  const pieces = 45;

  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement("span");

    piece.className = "confetti-piece";

    piece.style.left = Math.random() * 100 + "%";

    piece.style.animationDelay =
      Math.random() * 0.25 + "s";

    piece.style.transform =
      `rotate(${Math.random() * 360}deg)`;

    piece.style.background =
      [
        "#2e7d32",
        "#66bb6a",
        "#f9c74f",
        "#ffffff",
        "#81c784"
      ][Math.floor(Math.random() * 5)];

    container.appendChild(piece);
  }

  document.body.appendChild(container);

  setTimeout(() => {
    container.remove();
  }, 1600);
}

  /* =========================================================
     WELCOME
  ========================================================= */

  function renderWelcome() {

    document.querySelector("#app").innerHTML = `

      <section class="welcome card">

        <div class="welcome-copy">

          <div class="eyebrow">
            Interactive research reading
          </div>

          <h1>
            Read smarter. Remember more.
          </h1>

          <p class="lead">
            NewsQuest is a gamified news-reading activity.
            Your respondent code automatically assigns you
            one study article and its five-question quiz.
          </p>

          <form id="start-form">

            <div class="form-group">

              <label for="respondent-code">
                Respondent code
              </label>

              <input
                id="respondent-code"
                name="code"
                required
                autocomplete="off"
                placeholder="Example: SET1-001"
              >

              <p class="small">
                Enter the unique code provided by the researcher.
              </p>

            </div>

            <div id="start-message"></div>

            <button
              class="primary-btn"
              type="submit"
            >
              Start NewsQuest
            </button>

          </form>

        </div>

        <div
          class="welcome-art"
          aria-hidden="true"
        >

          <div class="illustration">

            <div class="illustration-inner">

              <strong>NEWS</strong>

              <hr>

              <p>
                Read · Learn · Recall
              </p>

              <span>
                +100 points
              </span>

            </div>

          </div>

        </div>

      </section>

    `;

    document
      .querySelector("#start-form")
      .addEventListener(
        "submit",
        startRespondent
      );

  }


  /* =========================================================
     START RESPONDENT
  ========================================================= */

  async function startRespondent(event) {

    event.preventDefault();

    const code =
      document
        .querySelector(
          "#respondent-code"
        )
        .value
        .trim()
        .toUpperCase();

    const message =
      document.querySelector(
        "#start-message"
      );

    try {

      message.innerHTML =
        setMessage(
          "Checking your respondent code...",
          "notice"
        );


      const codeSnapshot =
        await getDoc(
          doc(
            db,
            "respondentCodes",
            code
          )
        );


      if (!codeSnapshot.exists()) {

        message.innerHTML =
          setMessage(
            "This respondent code is not valid."
          );

        return;

      }


      const record =
        codeSnapshot.data();


      if (
        record.status ===
        "Used"
      ) {

        message.innerHTML =
          setMessage(
            "This respondent code has already been used."
          );

        return;

      }


      if (!record.articleId) {

        message.innerHTML =
          setMessage(
            "This respondent code does not have an assigned article."
          );

        return;

      }


      const article =
        await getArticle(
          record.articleId
        );


      if (
        !Array.isArray(
          article.questions
        ) ||
        article.questions.length !== 5
      ) {

        message.innerHTML =
          setMessage(
            "The assigned article does not have exactly five questions."
          );

        return;

      }


      saveSession({

        code,

        set:
          record.set,

        articleId:
          record.articleId,

        startedAt:
          new Date().toISOString()

      });


      renderArticle(article);

    } catch (error) {

      console.error(error);

      message.innerHTML =
        setMessage(
          "Something went wrong while connecting to NewsQuest."
        );

    }

  }


  /* =========================================================
     ARTICLE ROUTER
  ========================================================= */

  function renderArticle(article) {

    const session =
      getSession();


    /*
      NEW FORMAT

      paragraphs: [...]
      games: [...]

      This is the format we are using now.
    */

    if (
      Array.isArray(
        article.paragraphs
      ) &&
      article.paragraphs.length > 0
    ) {

      renderArticleWithGames(
        article
      );

      return;

    }


    /*
      OLD FORMAT

      Keeps older articles working.
    */

    renderOldArticle(
      article,
      session
    );

  }


  /* =========================================================
     NEW ARTICLE FORMAT
  ========================================================= */

function renderArticleWithGames(article) {

  const session = getSession();

  const paragraphs =
    Array.isArray(article.paragraphs)
      ? article.paragraphs
      : [];

  const games =
    Array.isArray(article.games)
      ? article.games
      : [];

  const totalParagraphs =
    paragraphs.length;


  /*
    ---------------------------------------------------------
    BUILD GAME MAP
    ---------------------------------------------------------
  */

  const gameMap = {};

  games.forEach(game => {

    const position =
      Number(game.position);

    if (
      Number.isInteger(position) &&
      position >= 1 &&
      position <= totalParagraphs
    ) {

      gameMap[position] = game;

    }

  });


  /*
    ---------------------------------------------------------
    BUILD BOOK PAGES
    ---------------------------------------------------------

    Example:

    paragraphs 1-2
    game after 2
    = PAGE 1

    paragraphs 3-4
    game after 4
    = PAGE 2

    paragraphs 5-6
    = PAGE 3

    The article remains ONE continuous story.
  */

  const pages = [];

  let currentParagraphs = [];

  for (
    let i = 1;
    i <= totalParagraphs;
    i++
  ) {

    currentParagraphs.push({
      number: i,
      text: paragraphs[i - 1]
    });


    /*
      If there is a game after this paragraph,
      finish the current book page.
    */

    if (gameMap[i]) {

      pages.push({

        paragraphs:
          currentParagraphs,

        game:
          gameMap[i],

        gamePosition:
          i

      });

      currentParagraphs = [];

    }

  }


  /*
    Add remaining paragraphs as final page.
  */

  if (
    currentParagraphs.length > 0
  ) {

    pages.push({

      paragraphs:
        currentParagraphs,

      game:
        null,

      gamePosition:
        null

    });

  }


  /*
    Safety fallback
  */

  if (
    pages.length === 0
  ) {

    pages.push({

      paragraphs: [],

      game: null,

      gamePosition: null

    });

  }


  /*
    ---------------------------------------------------------
    RENDER BOOK
    ---------------------------------------------------------
  */

  document.querySelector(
    "#app"
  ).innerHTML = `

    <div class="topbar">

      <div class="progress-wrap">

        <div class="progress-label">

          <span>
            NewsQuest
          </span>

          <span id="book-page-label">
            Page 1 / ${pages.length}
          </span>

        </div>

        <div class="progress-track">

          <div
            id="book-progress"
            class="progress-fill"
            style="width: 0%"
          ></div>

        </div>

      </div>

      <div class="points">
        +0 points
      </div>

    </div>


    <article class="newsquest-book">

      <div
        class="book-shell"
        id="newsquest-book"
      >

        <div
          class="book-page-area"
          id="book-page-area"
        >

          ${
            pages
              .map(
                (
                  page,
                  pageIndex
                ) => {

                  const firstParagraph =
                    page.paragraphs[0];

                  const isFirstPage =
                    pageIndex === 0;


                  return `

                    <section
                      class="
                        nq-page
                        ${
                          isFirstPage
                            ? "nq-page-active"
                            : ""
                        }
                      "
                      data-page="${pageIndex}"
                    >

                      <div class="nq-page-inner">

                        <div class="nq-page-header">

                          <div class="nq-publication">
                            NEWSQUEST
                          </div>

                          <div class="nq-page-number">

                            ${
                              String(
                                pageIndex + 1
                              ).padStart(
                                2,
                                "0"
                              )
                            }

                          </div>

                        </div>


                        ${
                          isFirstPage
                            ? `

                              <div class="nq-article-kicker">

                                Set
                                ${escapeHTML(
                                  session?.set || ""
                                )}

                                · Assigned Reading

                              </div>

                              <h1 class="nq-title">

                                ${escapeHTML(
                                  article.title || ""
                                )}

                              </h1>

                              ${
                                article.image
                                  ? `

                                    <img
                                      src="${escapeAttr(
                                        article.image
                                      )}"
                                      alt="${escapeAttr(
                                        article.title ||
                                        "Article image"
                                      )}"
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

                          ${
                            page.paragraphs
                              .map(
                                (
                                  paragraph,
                                  paragraphIndex
                                ) => `

                                  <p
                                    class="
                                      nq-paragraph
                                      ${
                                        paragraphIndex === 0 &&
                                        isFirstPage
                                          ? "nq-dropcap"
                                          : ""
                                      }
                                    "
                                  >

                                    ${escapeHTML(
                                      paragraph.text
                                    )}

                                  </p>

                                `
                              )
                              .join("")
                          }

                        </div>


                        ${
                          page.game
                            ? `

                              <div
                                class="
                                  nq-game-break
                                "
                              >

                                <div class="nq-game-line"></div>

                                <div class="nq-game-label">

                                  READER CHALLENGE

                                </div>

                                <div
                                  class="nq-game-wrapper interactive-game"
                                  data-game-position="${
                                    page.gamePosition
                                  }"
                                >

                                  ${renderReaderGame(
                                    page.game
                                  )}

                                </div>

                              </div>

                            `
                            : ""
                        }


                        ${
                          !page.game &&
                          pageIndex ===
                            pages.length - 1
                            ? `

                              <div
                                id="final-reading-action"
                                class="nq-final-action"
                              >

                                <div class="nq-game-line"></div>

                                <div class="nq-game-label">
                                  ARTICLE COMPLETE
                                </div>

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
                            ${
                              pageIndex === 0
                                ? "THE DAILY STORY"
                                : "STORY CONTINUES"
                            }
                          </span>

                          <span>
                            ${
                              String(
                                pageIndex + 1
                              ).padStart(
                                2,
                                "0"
                              )
                            }
                          </span>

                        </div>

                      </div>

                    </section>

                  `;

                }
              )
              .join("")
          }

        </div>

      </div>


      <div class="nq-book-navigation">

        <button
          id="book-prev"
          class="nq-nav-button"
          type="button"
        >
          ← Previous
        </button>


        <div class="nq-swipe-label">

          ← Swipe to turn the page →

        </div>


        <button
          id="book-next"
          class="nq-nav-button nq-nav-primary"
          type="button"
        >
          Next →

        </button>

      </div>

    </article>

  `;


  /*
    ---------------------------------------------------------
    BOOK STATE
    ---------------------------------------------------------
  */

  let currentPage = 0;

  const pageElements =
    Array.from(
      document.querySelectorAll(
        ".nq-page"
      )
    );

  const pageLabel =
    document.querySelector(
      "#book-page-label"
    );

  const progress =
    document.querySelector(
      "#book-progress"
    );

  const previousButton =
    document.querySelector(
      "#book-prev"
    );

  const nextButton =
    document.querySelector(
      "#book-next"
    );

  const bookArea =
    document.querySelector(
      "#book-page-area"
    );


  /*
    Track which pages have been unlocked.
  */

  const unlockedPages =
    new Set([0]);


  /*
    ---------------------------------------------------------
    RENDER CURRENT PAGE
    ---------------------------------------------------------
  */

  function renderBookPage(
    pageIndex,
    direction = "next"
  ) {

    if (
      pageIndex < 0 ||
      pageIndex >= pageElements.length
    ) {

      return;

    }


    if (
      !unlockedPages.has(
        pageIndex
      )
    ) {

      return;

    }


    currentPage =
      pageIndex;


    pageElements.forEach(
      (
        page,
        index
      ) => {

        page.classList.remove(
          "nq-page-active",
          "nq-page-left",
          "nq-page-right"
        );


        if (
          index === currentPage
        ) {

          page.classList.add(
            "nq-page-active"
          );

        }

        else if (
          index < currentPage
        ) {

          page.classList.add(
            "nq-page-left"
          );

        }

        else {

          page.classList.add(
            "nq-page-right"
          );

        }

      }
    );


    const totalPages =
      pageElements.length;


    pageLabel.textContent =
      `Page ${
        currentPage + 1
      } / ${
        totalPages
      }`;


    progress.style.width =
      `${
        (
          (
            currentPage + 1
          ) /
          totalPages
        ) *
        100
      }%`;


    previousButton.disabled =
      currentPage === 0;


    const isLastPage =
      currentPage ===
      totalPages - 1;


    nextButton.textContent =
      isLastPage
        ? "Finished"
        : "Next →";


    /*
      If next page is locked,
      make the button clearly disabled.
    */

    const nextPage =
      currentPage + 1;


    if (
      !isLastPage &&
      !unlockedPages.has(
        nextPage
      )
    ) {

      nextButton.disabled =
        true;

      nextButton.textContent =
        "Complete challenge →";

    }

    else {

      nextButton.disabled =
        false;

    }

  }


  /*
    ---------------------------------------------------------
    UNLOCK NEXT PAGE
    ---------------------------------------------------------
  */

  function unlockNextPage() {

    const nextPage =
      currentPage + 1;


    if (
      nextPage <
      pageElements.length
    ) {

      unlockedPages.add(
        nextPage
      );


      /*
        Small delay makes the transition
        feel intentional.
      */

      setTimeout(
        () => {

          renderBookPage(
            nextPage,
            "next"
          );

        },
        350
      );

    }

  }


  /*
    ---------------------------------------------------------
    NAVIGATION
    ---------------------------------------------------------
  */

  previousButton.addEventListener(
    "click",
    () => {

      if (
        currentPage > 0
      ) {

        renderBookPage(
          currentPage - 1,
          "previous"
        );

      }

    }
  );


  nextButton.addEventListener(
    "click",
    () => {

      const nextPage =
        currentPage + 1;


      if (
        nextPage <
        pageElements.length &&
        unlockedPages.has(
          nextPage
        )
      ) {

        renderBookPage(
          nextPage,
          "next"
        );

      }

    }
  );


  /*
    ---------------------------------------------------------
    SWIPE SUPPORT
    ---------------------------------------------------------
  */

  let touchStartX =
    0;

  let touchStartY =
    0;


  bookArea.addEventListener(
    "touchstart",
    event => {

      const touch =
        event.changedTouches[0];

      touchStartX =
        touch.clientX;

      touchStartY =
        touch.clientY;

    },
    {
      passive: true
    }
  );


  bookArea.addEventListener(
    "touchend",
    event => {

      const touch =
        event.changedTouches[0];

      const deltaX =
        touch.clientX -
        touchStartX;

      const deltaY =
        touch.clientY -
        touchStartY;


      /*
        Ignore mostly vertical swipes.
      */

      if (
        Math.abs(deltaX) <
        60 ||
        Math.abs(deltaX) <
        Math.abs(deltaY)
      ) {

        return;

      }


      /*
        Swipe LEFT = next page
      */

      if (
        deltaX < 0
      ) {

        const nextPage =
          currentPage + 1;


        if (
          unlockedPages.has(
            nextPage
          )
        ) {

          renderBookPage(
            nextPage,
            "next"
          );

        }

      }


      /*
        Swipe RIGHT = previous page
      */

      else {

        const previousPage =
          currentPage - 1;


        if (
          previousPage >= 0
        ) {

          renderBookPage(
            previousPage,
            "previous"
          );

        }

      }

    },
    {
      passive: true
    }
  );


  /*
    ---------------------------------------------------------
    MOUSE / TRACKPAD SWIPE
    ---------------------------------------------------------
  */

  let pointerStartX =
    0;


  bookArea.addEventListener(
    "pointerdown",
    event => {

      pointerStartX =
        event.clientX;

    }
  );


  bookArea.addEventListener(
    "pointerup",
    event => {

      const deltaX =
        event.clientX -
        pointerStartX;


      if (
        Math.abs(deltaX) <
        70
      ) {

        return;

      }


      if (
        deltaX < 0
      ) {

        const nextPage =
          currentPage + 1;


        if (
          unlockedPages.has(
            nextPage
          )
        ) {

          renderBookPage(
            nextPage,
            "next"
          );

        }

      }

      else {

        const previousPage =
          currentPage - 1;


        if (
          previousPage >= 0
        ) {

          renderBookPage(
            previousPage,
            "previous"
          );

        }

      }

    }
  );


  /*
    ---------------------------------------------------------
    GAME BUTTONS
    ---------------------------------------------------------
  */

  document
    .querySelectorAll(
      ".interactive-game"
    )
    .forEach(
      gameContainer => {

        const position =
          Number(
            gameContainer.dataset
              .gamePosition
          );


        const game =
          gameMap[position];


        if (!game) {

          return;

        }


        const input =
          gameContainer.querySelector(
            ".game-answer"
          );


        const button =
          gameContainer.querySelector(
            ".game-submit"
          );


        const message =
          gameContainer.querySelector(
            ".game-message"
          );


        if (
          !input ||
          !button ||
          !message
        ) {

          return;

        }


        button.addEventListener(
          "click",
          () => {

            const userAnswer =
              input.value
                .trim()
                .toLowerCase();


            const correctAnswer =
              String(
                game.answer || ""
              )
                .trim()
                .toLowerCase();


            if (!userAnswer) {

              message.innerHTML =
                setMessage(
                  "Please enter your answer first."
                );

              return;

            }


            /*
              CORRECT ANSWER
            */

            if (
              userAnswer ===
              correctAnswer
            ) {

              showConfetti();
             playSound("sounds/correct.mp3");

              message.innerHTML =
                setMessage(
                  "Correct! Great job.",
                  "success"
                );


              input.disabled =
                true;

              button.disabled =
                true;


              /*
                Unlock the next book page.
              */

              const pageElement =
                gameContainer.closest(
                  ".nq-page"
                );


              if (pageElement) {

                const pageIndex =
                  Number(
                    pageElement.dataset
                      .page
                  );


                const nextPage =
                  pageIndex + 1;


                if (
                  nextPage <
                  pageElements.length
                ) {

                  unlockedPages.add(
                    nextPage
                  );


                  /*
                    Enable navigation.
                  */

                  if (
                    currentPage ===
                    pageIndex
                  ) {

                    nextButton.disabled =
                      false;

                    nextButton.textContent =
                      "Turn Page →";

                  }

                }

              }

            }

            else {

              message.innerHTML =
                setMessage(
                  "Not quite. Try again."
                );

            }

          }
        );

      }
    );


  /*
    ---------------------------------------------------------
    FINAL QUIZ BUTTON
    ---------------------------------------------------------
  */

  const quizButton =
    document.querySelector(
      "#begin-quiz"
    );


  if (quizButton) {

    quizButton.addEventListener(
      "click",
      () => {

        renderQuiz(
          article
        );

      }
    );

  }


  /*
    ---------------------------------------------------------
    START
    ---------------------------------------------------------
  */

  renderBookPage(
    0
  );

}


  /* =========================================================
     READER GAME
  ========================================================= */

  function renderReaderGame(game) {

    if (
      !game ||
      !game.type
    ) {

      return "";

    }


    /* ---------------------------------------------------------
       JUMBLED WORDS
    --------------------------------------------------------- */

    if (
      game.type ===
      "jumbled"
    ) {

      return `

        <div class="game-box">

          <div class="eyebrow">
            Interactive Game
          </div>

          <h3>
            Jumbled Words
          </h3>

          <p class="small">
            Unscramble the letters to find the correct word.
          </p>

          <div class="game-scrambled">
            ${escapeHTML(
              game.scrambled || ""
            )}
          </div>

          ${
            game.hint
              ? `
                <p class="small">
                  Hint:
                  ${escapeHTML(
                    game.hint
                  )}
                </p>
              `
              : ""
          }

          <input
            class="game-answer game-input"
            type="text"
            autocomplete="off"
            placeholder="Type your answer"
          >

          <button
            class="game-submit primary-btn"
            type="button"
          >
            Check Answer
          </button>

          <div
            class="game-message"
          ></div>

        </div>

      `;

    }


    /* ---------------------------------------------------------
       4 PICS 1 WORD
    --------------------------------------------------------- */

    if (
      game.type ===
      "fourPics"
    ) {

      return `

        <div class="game-box">

          <div class="eyebrow">
            Interactive Game
          </div>

          <h3>
            4 Pics 1 Word
          </h3>

          <div class="four-pics-grid">

            ${
              Array.isArray(
                game.images
              )
                ? game.images
                    .slice(
                      0,
                      4
                    )
                    .map(
                      image => `

                        <img
                          src="${escapeAttr(
                            image
                          )}"
                          alt="Game image"
                          class="game-image"
                        >

                      `
                    )
                    .join("")
                : ""
            }

          </div>

          ${
            game.hint
              ? `
                <p class="small">
                  Hint:
                  ${escapeHTML(
                    game.hint
                  )}
                </p>
              `
              : ""
          }

          <input
            class="game-answer game-input"
            type="text"
            autocomplete="off"
            placeholder="What is the word?"
          >

          <button
            class="game-submit primary-btn"
            type="button"
          >
            Check Answer
          </button>

          <div
            class="game-message"
          ></div>

        </div>

      `;

    }


    /* ---------------------------------------------------------
       MINI CROSSWORD
    --------------------------------------------------------- */

    if (
      game.type ===
      "crossword"
    ) {

      return `

        <div class="game-box">

          <div class="eyebrow">
            Interactive Game
          </div>

          <h3>
            Mini Crossword
          </h3>

          <p class="small">
            Solve the clue below.
          </p>

          <div class="crossword-clue">
            ${escapeHTML(
              game.clue || ""
            )}
          </div>

          <input
            class="game-answer game-input"
            type="text"
            autocomplete="off"
            placeholder="Type your answer"
          >

          <button
            class="game-submit primary-btn"
            type="button"
          >
            Check Answer
          </button>

          <div
            class="game-message"
          ></div>

        </div>

      `;

    }


    return "";

  }


  /* =========================================================
     OLD ARTICLE FORMAT
  ========================================================= */

  function renderOldArticle(
    article,
    session
  ) {

    document.querySelector(
      "#app"
    ).innerHTML = `

      <div class="topbar">

        <div class="progress-wrap">

          <div class="progress-label">

            <span>
              Reading
            </span>

            <span>
              Article
            </span>

          </div>

          <div class="progress-track">

            <div
              class="progress-fill"
              style="width: 100%"
            ></div>

          </div>

        </div>

        <div class="points">
          +0 points
        </div>

      </div>


      <article class="article-card card">

        ${
          article.image
            ? `
              <img
                class="article-image"
                src="${escapeAttr(
                  article.image
                )}"
                alt="Article image"
              >
            `
            : ""
        }


        <div class="article-content">

          <div class="eyebrow">

            Set
            ${escapeHTML(
              session?.set || ""
            )}

            · Assigned reading

          </div>


          <h2>
            ${escapeHTML(
              article.title || ""
            )}
          </h2>


          <p class="article-body">
            ${escapeHTML(
              article.body || ""
            )}
          </p>


          <div class="action-row">

            <button
              id="begin-quiz"
              class="primary-btn"
              type="button"
            >
              I'm ready for the five-question quiz
            </button>

          </div>

        </div>

      </article>

    `;


    document
      .querySelector(
        "#begin-quiz"
      )
      .addEventListener(
        "click",
        () => renderQuiz(
          article
        )
      );

  }


  /* =========================================================
     QUIZ
  ========================================================= */

  function renderQuiz(article) {

    document.querySelector(
      "#app"
    ).innerHTML = `

      <div class="topbar">

        <div class="progress-wrap">

          <div class="progress-label">

            <span>
              Quiz progress
            </span>

            <span>
              5 questions
            </span>

          </div>

          <div class="progress-track">

            <div
              class="progress-fill"
              style="width: 100%"
            ></div>

          </div>

        </div>

        <div class="points">
          Up to 100 points
        </div>

      </div>


      <form
        id="quiz-form"
        class="quiz-card card"
      >

        <div class="eyebrow">
          Knowledge check
        </div>


        <h2>
          ${escapeHTML(
            article.title || ""
          )}
        </h2>


        <p class="small">
          Answer all five questions before submitting.
        </p>


        ${
          Array.isArray(
            article.questions
          )
            ? article.questions
                .map(
                  (
                    question,
                    index
                  ) => `

                    <fieldset
                      class="question"
                    >

                      <legend
                        class="question-title"
                      >

                        ${index + 1}.
                        ${escapeHTML(
                          question.text
                        )}

                      </legend>


                      ${
                        Array.isArray(
                          question.choices
                        )
                          ? question.choices
                              .map(
                                (
                                  choice,
                                  choiceIndex
                                ) => `

                                  <label
                                    class="choice"
                                  >

                                    <input
                                      type="radio"
                                      name="question-${index}"
                                      value="${choiceIndex}"
                                      required
                                    >

                                    <span>
                                      ${escapeHTML(
                                        choice
                                      )}
                                    </span>

                                  </label>

                                `
                              )
                              .join("")
                          : ""
                      }

                    </fieldset>

                  `
                )
                .join("")
            : ""
        }


        <div
          id="quiz-message"
        ></div>


        <button
          class="primary-btn"
          type="submit"
        >
          Submit quiz
        </button>

      </form>

    `;


    document
      .querySelector(
        "#quiz-form"
      )
      .addEventListener(
        "submit",
        event =>
          submitQuiz(
            event,
            article
          )
      );

  }


  /* =========================================================
     SUBMIT QUIZ
  ========================================================= */

  async function submitQuiz(
    event,
    article
  ) {

    event.preventDefault();


    const session =
      getSession();


    const formData =
      new FormData(
        event.target
      );


    const message =
      document.querySelector(
        "#quiz-message"
      );


    const answers =
      article.questions.map(
        (
          _,
          index
        ) =>
          Number(
            formData.get(
              `question-${index}`
            )
          )
      );


    const score =
      article.questions.reduce(
        (
          total,
          question,
          index
        ) => {

          return (
            total +
            (
              answers[index] ===
              question.correct
                ? 1
                : 0
            )
          );

        },
        0
      );


    const responseData = {

      respondentCode:
        session.code,

      set:
        session.set,

      articleId:
        session.articleId,

      answers,

      score,

      totalQuestions:
        5,

      percentage:
        score * 20,

      points:
        score * 20,

      submittedAt:
        serverTimestamp(),

      status:
        "Completed"

    };


    try {

      message.innerHTML =
        setMessage(
          "Submitting your answers...",
          "notice"
        );


      const codeRef =
        doc(
          db,
          "respondentCodes",
          session.code
        );


      const responseRef =
        doc(
          db,
          "responses",
          session.code
        );


      const leaderboardRef =
        doc(
          db,
          "leaderboards",
          session.articleId,
          "entries",
          session.code
        );


      const participantNumber =
        session.code.split("-")[1] ||
        "000";


      await runTransaction(
        db,
        async transaction => {

          const codeSnapshot =
            await transaction.get(
              codeRef
            );


          if (
            !codeSnapshot.exists()
          ) {

            throw new Error(
              "CODE_NOT_FOUND"
            );

          }


          const currentCode =
            codeSnapshot.data();


          if (
            currentCode.status ===
            "Used"
          ) {

            throw new Error(
              "CODE_ALREADY_USED"
            );

          }


          transaction.update(
            codeRef,
            {

              status:
                "Used",

              usedAt:
                serverTimestamp()

            }
          );


          transaction.set(
            responseRef,
            responseData
          );


          transaction.set(
            leaderboardRef,
            {

              articleId:
                session.articleId,

              set:
                session.set,

              displayName:
                `Participant ${participantNumber}`,

              points:
                responseData.points,

              score:
                responseData.score,

              respondentCode:
                session.code,

              createdAt:
                serverTimestamp()

            }
          );

        }
      );


      await renderResult({

        ...responseData,

        submittedAt:
          new Date().toISOString()

      });


    } catch (error) {

      console.error(error);


      if (
        error.message ===
        "CODE_ALREADY_USED"
      ) {

        message.innerHTML =
          setMessage(
            "This respondent code has already been used."
          );

        return;

      }


      if (
        error.message ===
        "CODE_NOT_FOUND"
      ) {

        message.innerHTML =
          setMessage(
            "This respondent code is no longer available."
          );

        return;

      }


      message.innerHTML =
        setMessage(
          "Your response could not be submitted. Please try again."
        );

    }

  }


  /* =========================================================
     RESULT
  ========================================================= */

  async function renderResult(
    response
  ) {

    document.querySelector(
      "#app"
    ).innerHTML = `

      <section class="result-card card">

        <div class="eyebrow">
          Completed
        </div>


        <h2>
          Your NewsQuest result
        </h2>


        <div class="result-score">
          ${response.score}/5
        </div>


        <div class="stat-grid">

          <div class="stat">

            <span class="small">
              Percentage
            </span>

            <strong>
              ${response.percentage}%
            </strong>

          </div>


          <div class="stat">

            <span class="small">
              Points earned
            </span>

            <strong>
              ${response.points}
            </strong>

          </div>


          <div class="stat">

            <span class="small">
              Status
            </span>

            <strong>
              Done
            </strong>

          </div>

        </div>


        <div class="notice">

          Thank you.
          Your response has been recorded.

          This respondent code cannot be used
          for another attempt.

        </div>


        <section
          style="
            margin-top: 30px;
            text-align: left;
          "
        >

          <div class="eyebrow">
            Article leaderboard
          </div>


          <h3>

            Top Participants ·

            ${escapeHTML(
              response.articleId
                .replace(
                  "article",
                  "Article "
                )
            )}

          </h3>


          <div id="leaderboard">

            <div class="notice">
              Loading leaderboard...
            </div>

          </div>

        </section>


        <p
          class="small"
          style="margin-top: 24px;"
        >

          Correct answers are not displayed
          in the respondent interface.

        </p>


      </section>

    `;


    try {

      const leaderboardQuery =
        query(
          collection(
            db,
            "leaderboards",
            response.articleId,
            "entries"
          ),
          orderBy(
            "points",
            "desc"
          ),
          limit(10)
        );


      const snapshot =
        await getDocs(
          leaderboardQuery
        );


      const rows =
        snapshot.docs
          .map(
            (
              item,
              index
            ) => {

              const entry =
                item.data();


              const rank =
                index + 1;


              let medal = "";


              if (
                rank === 1
              ) {

                medal = "🥇";

              }


              if (
                rank === 2
              ) {

                medal = "🥈";

              }


              if (
                rank === 3
              ) {

                medal = "🥉";

              }


              return `

                <div
                  class="stat"
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                  "
                >

                  <span>

                    <strong>

                      ${medal}
                      ${rank}.

                      ${escapeHTML(
                        entry.displayName
                      )}

                    </strong>

                  </span>


                  <span>

                    ${Number(
                      entry.points || 0
                    )}

                    pts

                  </span>

                </div>

              `;

            }
          )
          .join("");


      const leaderboard =
        document.querySelector(
          "#leaderboard"
        );


      if (leaderboard) {

        leaderboard.innerHTML =
          rows ||
          `

            <div class="notice">
              No leaderboard entries yet.
            </div>

          `;

      }


    } catch (error) {

      console.error(
        "Leaderboard error:",
        error
      );


      const leaderboard =
        document.querySelector(
          "#leaderboard"
        );


      if (leaderboard) {

        leaderboard.innerHTML = `

          <div class="error">
            Leaderboard could not be loaded.
          </div>

        `;

      }

    }

  }


  /* =========================================================
     START APP
  ========================================================= */

  renderWelcome();

})();
