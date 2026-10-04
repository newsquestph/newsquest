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


  console.log("NEWSQUEST ARTICLE:", article);
  console.log("NEWSQUEST GAMES:", games);


  /*
    Convert games into:

    paragraph number -> game

    Example:
    position 2 = game appears after paragraph 2
  */

  const gameMap = {};

  games.forEach(game => {

    const position =
      Number(game.position);

    if (
      Number.isInteger(position) &&
      position >= 1 &&
      position < totalParagraphs
    ) {

      gameMap[position] = game;

    }

  });


  /*
    Determine which paragraph/game
    is the first locked section.
  */

  let firstLockedParagraph =
    totalParagraphs + 1;


  for (
    let i = 1;
    i <= totalParagraphs;
    i++
  ) {

    if (gameMap[i]) {

      firstLockedParagraph =
        i + 1;

      break;

    }

  }


  document.querySelector("#app").innerHTML = `

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

      <div class="article-content">

        <div class="eyebrow">

          Set ${escapeHTML(
            session?.set || ""
          )}

          · Assigned reading

        </div>


        <h2>
          ${escapeHTML(
            article.title || ""
          )}
        </h2>


        ${
          article.image
            ? `
              <img
                src="${escapeAttr(article.image)}"
                alt="${escapeAttr(
                  article.title ||
                  "Article image"
                )}"
                class="article-image"
              >
            `
            : ""
        }


        <div class="article-reading">

          ${paragraphs
            .map((paragraph, index) => {

              const paragraphNumber =
                index + 1;

              const game =
                gameMap[paragraphNumber];


              /*
                Everything after the first locked
                point starts blurred.
              */

              const isLocked =
                paragraphNumber >=
                firstLockedParagraph;


              return `

                <div
                  class="
                    article-step
                    ${isLocked ? "locked-content" : ""}
                  "
                  data-paragraph="${paragraphNumber}"
                  ${
                    isLocked
                      ? 'data-locked="true"'
                      : 'data-locked="false"'
                  }
                >

                  ${
                    isLocked
                      ? `

                        <div class="locked-overlay">

                          <div class="locked-message">

                            <div class="locked-icon">
                              🔒
                            </div>

                            <strong>
                              Paragraph locked
                            </strong>

                            <span>
                              Answer the game above
                              to unlock the next part
                              of the article.
                            </span>

                          </div>

                        </div>

                      `
                      : ""
                  }


                  <div
                    class="${
                      isLocked
                        ? "locked-blur"
                        : ""
                    }"
                  >

                    <p class="article-body">

                      ${escapeHTML(
                        paragraph
                      )}

                    </p>


                    ${
                      game
                        ? `

                          <div
                            class="interactive-game card"
                            data-game-position="${paragraphNumber}"
                          >

                            ${renderReaderGame(game)}

                          </div>

                        `
                        : ""
                    }

                  </div>

                </div>

              `;

            })
            .join("")}

        </div>


        <div
          id="final-reading-action"
          class="action-row"
          style="display:none;"
        >

          <button
            id="begin-quiz"
            class="primary-btn"
            type="button"
          >

            Proceed to Final Quiz

          </button>

        </div>


        <div
          id="article-message"
        ></div>


      </div>

    </article>

  `;


  /*
    GAME BUTTONS
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


            if (
              userAnswer ===
              correctAnswer
            ) {

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
                Unlock the next section.

                IMPORTANT:
                We don't just reveal one paragraph.
                We reveal everything until the next game.
              */

              let nextGamePosition =
                null;


              const gamePositions =
                Object.keys(
                  gameMap
                )
                  .map(Number)
                  .sort(
                    (a, b) => a - b
                  );


              for (
                const gamePosition
                of gamePositions
              ) {

                if (
                  gamePosition >
                  position
                ) {

                  nextGamePosition =
                    gamePosition;

                  break;

                }

              }


              /*
                If there is another game,
                reveal all paragraphs up to
                and including the paragraph
                containing that next game.
              */

              const revealUntil =
                nextGamePosition
                  ? nextGamePosition
                  : totalParagraphs;


              for (
                let paragraphNumber =
                  position + 1;
                paragraphNumber <=
                  revealUntil;
                paragraphNumber++
              ) {

                const paragraph =
                  document.querySelector(
                    `.article-step[data-paragraph="${paragraphNumber}"]`
                  );


                if (!paragraph) {
                  continue;
                }


                paragraph.classList.remove(
                  "locked-content"
                );


                paragraph
                  .removeAttribute(
                    "data-locked"
                  );


                const overlay =
                  paragraph.querySelector(
                    ".locked-overlay"
                  );


                if (overlay) {

                  overlay.remove();

                }


                const blurred =
                  paragraph.querySelector(
                    ".locked-blur"
                  );


                if (blurred) {

                  blurred.classList.remove(
                    "locked-blur"
                  );

                }

              }


              /*
                Scroll to the next unlocked
                content.
              */

              const nextSection =
                document.querySelector(
                  `.article-step[data-paragraph="${position + 1}"]`
                );


              if (nextSection) {

                setTimeout(() => {

                  nextSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                  });

                }, 150);

              }


              /*
                Check whether any unanswered
                games remain.
              */

              const remainingGames =
                Array.from(
                  document.querySelectorAll(
                    ".interactive-game"
                  )
                ).some(
                  container => {

                    const gameInput =
                      container.querySelector(
                        ".game-answer"
                      );


                    return (
                      gameInput &&
                      !gameInput.disabled
                    );

                  }
                );


              /*
                All games completed.
              */

              if (!remainingGames) {

                const finalAction =
                  document.querySelector(
                    "#final-reading-action"
                  );


                if (finalAction) {

                  finalAction.style.display =
                    "flex";

                }

              }

            } else {

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
    FINAL QUIZ BUTTON
  */

  const quizButton =
    document.querySelector(
      "#begin-quiz"
    );


  if (quizButton) {

    quizButton.addEventListener(
      "click",
      () => {

        renderQuiz(article);

      }
    );

  }

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
