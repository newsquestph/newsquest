(async () => {
  const [
    { initializeApp },
    {
      getAuth,
      signInWithEmailAndPassword,
      signOut,
      onAuthStateChanged
    },
    {
      getFirestore,
      doc,
      getDoc,
      getDocs,
      collection,
      query,
      orderBy,
      limit,
      setDoc,
      serverTimestamp,
      writeBatch
    }
  ] = await Promise.all([
    import(
      "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"
    ),
    import(
      "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
    ),
    import(
      "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"
    )
  ]);

  // =========================================================
  // FIREBASE
  // =========================================================

  const firebaseConfig = {
    apiKey: "AIzaSyBTRwdQi-oi6mPi7SlcwfZr528PWpIKFcI",
    authDomain: "newsquest-a6dbc.firebaseapp.com",
    projectId: "newsquest-a6dbc",
    storageBucket: "newsquest-a6dbc.firebasestorage.app",
    messagingSenderId: "450052536521",
    appId: "1:450052536521:web:39e942bfae4c8b1965f518",
    measurementId: "G-KYXXZ5BEPK"
  };

  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  // =========================================================
  // DEFAULT ARTICLES
  // =========================================================

  const DEFAULT_ARTICLES = {
    article1: {
      articleId: "article1",
      title: "Sample News Article 1",
      image:
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=80",
      body:
        "This is placeholder news content for Article 1. Researchers can replace this text with the approved article used in the study.",
      questions: [
        {
          text: "What is the main purpose of this sample article?",
          choices: [
            "Entertainment",
            "Research reading",
            "Advertising",
            "Sports training"
          ],
          correct: 1
        },
        {
          text: "Who is the intended audience for the NewsQuest study?",
          choices: [
            "Senior high school students",
            "Toddlers",
            "Professional athletes",
            "Tourists"
          ],
          correct: 0
        },
        {
          text: "What should researchers do before using final article content?",
          choices: [
            "Remove all questions",
            "Approve and edit the content",
            "Hide the article",
            "Change every answer"
          ],
          correct: 1
        },
        {
          text: "How many questions belong to each article?",
          choices: [
            "Two",
            "Three",
            "Five",
            "Fifteen"
          ],
          correct: 2
        },
        {
          text: "What does the respondent answer after reading?",
          choices: [
            "A five-question quiz",
            "Three different articles",
            "A researcher password",
            "A code-management form"
          ],
          correct: 0
        }
      ]
    },

    article2: {
      articleId: "article2",
      title: "Sample News Article 2",
      image:
        "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80",
      body:
        "This is placeholder news content for Article 2. Researchers can replace this text with the approved second reading material.",
      questions: [
        {
          text: "Which article is represented by this content?",
          choices: [
            "Article 1",
            "Article 2",
            "Article 3",
            "No article"
          ],
          correct: 1
        },
        {
          text: "What determines which article a respondent sees?",
          choices: [
            "A dropdown menu",
            "The respondent code",
            "The respondent's score",
            "The time of day"
          ],
          correct: 1
        },
        {
          text: "How many choices should each quiz question have?",
          choices: [
            "Two",
            "Three",
            "Four",
            "Six"
          ],
          correct: 2
        },
        {
          text: "What happens after a code is successfully submitted?",
          choices: [
            "It becomes used",
            "It changes sets",
            "It is deleted",
            "It answers another quiz"
          ],
          correct: 0
        },
        {
          text: "What is the maximum score for one article quiz?",
          choices: [
            "3",
            "5",
            "10",
            "15"
          ],
          correct: 1
        }
      ]
    },

    article3: {
      articleId: "article3",
      title: "Sample News Article 3",
      image:
        "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=1400&q=80",
      body:
        "This is placeholder news content for Article 3. Researchers can replace this text with the approved third reading material.",
      questions: [
        {
          text: "Which set is connected to Article 3?",
          choices: [
            "Set 1",
            "Set 2",
            "Set 3",
            "All sets simultaneously"
          ],
          correct: 2
        },
        {
          text: "What is the respondent allowed to read?",
          choices: [
            "Only the assigned article",
            "All articles",
            "Any article they choose",
            "No article"
          ],
          correct: 0
        },
        {
          text: "What is displayed on the result page?",
          choices: [
            "Score and percentage",
            "Other respondents' answers",
            "Correct answers by default",
            "Researcher password"
          ],
          correct: 0
        },
        {
          text: "What should the researcher editor always preserve?",
          choices: [
            "Exactly five questions",
            "Fifteen questions per respondent",
            "No answer choices",
            "A public dashboard"
          ],
          correct: 0
        },
        {
          text: "What is the purpose of points in NewsQuest?",
          choices: [
            "Gamification feedback",
            "Changing the assignment",
            "Unlocking Article 2",
            "Logging in as researcher"
          ],
          correct: 0
        }
      ]
    }
  };

  const SET_ARTICLES = {
    1: "article1",
    2: "article2",
    3: "article3"
  };

  // =========================================================
  // HELPERS
  // =========================================================

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

  function articleName(articleId) {
    return String(articleId).replace(
      "article",
      "Article "
    );
  }

  function errorBox(message) {
    return `<div class="error">${escapeHTML(message)}</div>`;
  }

  function noticeBox(message) {
    return `<div class="notice">${escapeHTML(message)}</div>`;
  }

  // =========================================================
  // LOGIN
  // =========================================================

  function renderLogin(message = "") {
    document.querySelector("#researcher-app").innerHTML = `
      <section class="login-card card">

        <div class="eyebrow">
          Restricted researcher area
        </div>

        <h2>
          Researcher login
        </h2>

        <p class="small">
          Sign in using your NewsQuest researcher account.
        </p>

        <form id="login-form">

          <div class="form-group">

            <label for="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              required
              autocomplete="email"
              placeholder="researcher@example.com"
            >

          </div>

          <div class="form-group">

            <label for="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              required
              autocomplete="current-password"
            >

          </div>

          <div id="login-message">
            ${message}
          </div>

          <button
            class="primary-btn"
            type="submit"
          >
            Log in
          </button>

        </form>

      </section>
    `;

    document
      .querySelector("#login-form")
      .addEventListener(
        "submit",
        handleLogin
      );
  }

  async function handleLogin(event) {
    event.preventDefault();

    const email =
      document
        .querySelector("#login-email")
        .value
        .trim();

    const password =
      document.querySelector(
        "#login-password"
      ).value;

    const message =
      document.querySelector(
        "#login-message"
      );

    try {
      message.innerHTML =
        noticeBox(
          "Signing in..."
        );

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    } catch (error) {
      console.error(error);

      message.innerHTML =
        errorBox(
          "Login failed. Check your email and password."
        );
    }
  }

  // =========================================================
  // RESEARCHER VERIFICATION
  // =========================================================

  async function isResearcher(user) {
    if (!user) {
      return false;
    }

    const researcherRef =
      doc(
        db,
        "researchers",
        user.uid
      );

    const snapshot =
      await getDoc(
        researcherRef
      );

    return (
      snapshot.exists() &&
      snapshot.data().role === "researcher"
    );
  }

  // =========================================================
  // INITIAL FIRESTORE DATA
  // =========================================================

  async function seedInitialData() {
    const articleSnapshot =
      await getDocs(
        collection(
          db,
          "articles"
        )
      );

    const codeSnapshot =
      await getDocs(
        collection(
          db,
          "respondentCodes"
        )
      );

    const batch =
      writeBatch(db);

    let changed = false;

    if (articleSnapshot.empty) {
      Object.values(
        DEFAULT_ARTICLES
      ).forEach(article => {

        batch.set(
          doc(
            db,
            "articles",
            article.articleId
          ),
          article
        );

        changed = true;
      });
    }

    if (codeSnapshot.empty) {
      const defaults = [
        ["SET1-001", 1, "article1"],
        ["SET1-002", 1, "article1"],
        ["SET1-003", 1, "article1"],
        ["SET2-001", 2, "article2"],
        ["SET2-002", 2, "article2"],
        ["SET2-003", 2, "article2"],
        ["SET3-001", 3, "article3"],
        ["SET3-002", 3, "article3"],
        ["SET3-003", 3, "article3"]
      ];

      defaults.forEach(
        ([code, set, articleId]) => {

          batch.set(
            doc(
              db,
              "respondentCodes",
              code
            ),
            {
              code,
              set,
              articleId,
              status: "Available",
              usedAt: null,
              createdAt:
                serverTimestamp()
            }
          );

          changed = true;
        }
      );
    }

    if (changed) {
      await batch.commit();
    }
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  async function renderDashboard(
    activeTab = "records"
  ) {
    const user =
      auth.currentUser;

    if (!user) {
      renderLogin();
      return;
    }

    let researcher = false;

    try {
      researcher =
        await isResearcher(
          user
        );
    } catch (error) {
      console.error(error);
    }

    if (!researcher) {
      document.querySelector(
        "#researcher-app"
      ).innerHTML = `
        <section class="login-card card">

          <div class="eyebrow">
            Researcher access
          </div>

          <h2>
            Access not configured
          </h2>

          <p class="small">
            Your Firebase account is authenticated,
            but it has not yet been registered as
            a NewsQuest researcher.
          </p>

          <div class="notice">
            Your Firebase user ID needs to be added
            to the <strong>researchers</strong>
            collection.
          </div>

          <button
            id="logout-unconfigured"
            class="secondary-btn"
          >
            Log out
          </button>

        </section>
      `;

      document
        .querySelector(
          "#logout-unconfigured"
        )
        .addEventListener(
          "click",
          () => signOut(auth)
        );

      return;
    }

    try {
      await seedInitialData();

    } catch (error) {
      console.error(error);

      document.querySelector(
        "#researcher-app"
      ).innerHTML = `
        <section class="login-card card">

          <h2>
            Database access error
          </h2>

          <p class="small">
            Authentication worked, but Firestore
            did not allow this researcher to access
            the database yet.
          </p>

          <div class="error">
            Please check the Firestore security rules.
          </div>

          <button
            id="logout-db-error"
            class="secondary-btn"
          >
            Log out
          </button>

        </section>
      `;

      document
        .querySelector(
          "#logout-db-error"
        )
        .addEventListener(
          "click",
          () => signOut(auth)
        );

      return;
    }

    document.querySelector(
      "#researcher-app"
    ).innerHTML = `
      <div class="dashboard-header">

        <div>

          <div class="eyebrow">
            Authenticated researcher area
          </div>

          <h2>
            Research dashboard
          </h2>

          <p class="small">
            ${escapeHTML(
              user.email || ""
            )}
          </p>

        </div>

        <button
          id="logout"
          class="secondary-btn"
        >
          Log out
        </button>

      </div>

      <nav class="dashboard-nav">

        <button data-tab="records">
          Respondent Records
        </button>

        <button data-tab="editor">
          Article/Quiz Editor
        </button>

        <button data-tab="codes">
          Respondent Codes
        </button>

        <button data-tab="leaderboards">
          Leaderboards
        </button>

        <button data-tab="export">
          Export Data
        </button>

      </nav>

      <section id="dashboard-content"></section>
    `;

    document
      .querySelector(
        "#logout"
      )
      .addEventListener(
        "click",
        () => signOut(auth)
      );

    document
      .querySelectorAll(
        "[data-tab]"
      )
      .forEach(button => {

        button.classList.toggle(
          "active",
          button.dataset.tab ===
            activeTab
        );

        button.addEventListener(
          "click",
          () => {
            renderDashboard(
              button.dataset.tab
            );
          }
        );

      });

    if (
      activeTab === "records"
    ) {
      renderRecords();
    }

    if (
      activeTab === "editor"
    ) {
      renderEditor();
    }

    if (
      activeTab === "codes"
    ) {
      renderCodeManager();
    }

    if (
      activeTab === "leaderboards"
    ) {
      renderLeaderboards();
    }

    if (
      activeTab === "export"
    ) {
      renderExport();
    }
  }

  // =========================================================
  // RECORDS
  // =========================================================

  async function renderRecords() {
    const container =
      document.querySelector(
        "#dashboard-content"
      );

    container.innerHTML = `
      <section class="card editor-section">

        <h3>
          Respondent records
        </h3>

        <p class="small">
          Completed respondents are stored in Firestore.
        </p>

        <div class="notice">
          Loading records...
        </div>

      </section>
    `;

    try {
      const snapshot =
        await getDocs(
          collection(
            db,
            "responses"
          )
        );

      const records =
        snapshot.docs
          .map(item => ({
            id: item.id,
            ...item.data()
          }))
          .sort((a, b) => {

            const aTime =
              a.submittedAt?.toMillis?.() ||
              0;

            const bTime =
              b.submittedAt?.toMillis?.() ||
              0;

            return bTime - aTime;
          });

      const rows =
        records
          .map(response => {

            const date =
              response.submittedAt?.toDate
                ? response.submittedAt.toDate()
                : null;

            return `
              <tr>

                <td>
                  ${escapeHTML(
                    response.respondentCode || ""
                  )}
                </td>

                <td>
                  Set ${escapeHTML(
                    response.set || ""
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    articleName(
                      response.articleId || ""
                    )
                  )}
                </td>

                <td>
                  ${Number(
                    response.score || 0
                  )}/5
                </td>

                <td>
                  ${Number(
                    response.percentage || 0
                  )}%
                </td>

                <td>
                  ${Number(
                    response.points || 0
                  )}
                </td>

                <td>
                  ${
                    date
                      ? date.toLocaleDateString()
                      : ""
                  }
                </td>

                <td>
                  ${
                    date
                      ? date.toLocaleTimeString()
                      : ""
                  }
                </td>

                <td>

                  <span class="status used">
                    ${escapeHTML(
                      response.status ||
                        "Completed"
                    )}
                  </span>

                </td>

              </tr>
            `;
          })
          .join("");

      container.innerHTML = `
        <section class="card editor-section">

          <h3>
            Respondent records
          </h3>

          <p class="small">
            All completed respondents are shown in one place.
          </p>

          <div class="table-wrap">

            <table>

              <thead>

                <tr>
                  <th>Respondent Code</th>
                  <th>Set</th>
                  <th>Article</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Points</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                ${
                  rows ||
                  `
                    <tr>
                      <td colspan="9">
                        No responses yet.
                      </td>
                    </tr>
                  `
                }

              </tbody>

            </table>

          </div>

        </section>
      `;

    } catch (error) {
      console.error(error);

      container.innerHTML = `
        <section class="card editor-section">

          <h3>
            Respondent records
          </h3>

          <div class="error">
            Unable to load respondent records.
          </div>

        </section>
      `;
    }
  }

// =========================================================
// ARTICLE EDITOR
// =========================================================

async function renderEditor() {

  const container =
    document.querySelector(
      "#dashboard-content"
    );

  container.innerHTML = `
    <section class="card editor-section">

      <div class="eyebrow">
        Editorial workspace
      </div>

      <h3>
        Article Builder
      </h3>

      <p class="small">
        Build your article page by page.
        Each page can contain up to 5 paragraphs.
      </p>

      <div class="notice">
        Minimum 2 pages · Maximum 5 paragraphs per page
      </div>

    </section>
  `;

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "articles"
        )
      );

    const data = {};

    snapshot.docs.forEach(
      item => {

        data[item.id] = {
          articleId: item.id,
          ...item.data()
        };

      }
    );


    const editors =
      Object.keys(
        SET_ARTICLES
      )
        .map(
          setNumber => {

            const articleId =
              SET_ARTICLES[
                setNumber
              ];

            const article =
              data[articleId] ||
              DEFAULT_ARTICLES[
                articleId
              ];


            /*
             * BUILD PAGES
             *
             * New articles use article.pages.
             *
             * Old articles are converted into
             * pages automatically.
             */

            let pages =
              buildArticlePages(
                article
              );


            /*
             * GAMES
             *
             * New system:
             *
             * afterPage
             *
             * Old system:
             *
             * position
             *
             * is converted automatically.
             */

            let games =
              Array.isArray(
                article.games
              )
                ? article.games.map(
                    game => {

                      let afterPage =
                        Number(
                          game.afterPage
                        );


                      /*
                       * Convert old paragraph
                       * position to page.
                       */

                      if (
                        !Number.isInteger(
                          afterPage
                        )
                      ) {

                        const position =
                          Number(
                            game.position
                          ) || 1;

                        afterPage =
                          getPageForParagraph(
                            pages,
                            position
                          );

                      }


                      return {

                        afterPage,

                        type:
                          game.type ||
                          "jumbled",

                        answer:
                          game.answer ||
                          "",

                        scrambled:
                          game.scrambled ||
                          "",

                        hint:
                          game.hint ||
                          "",

                        images:
                          Array.isArray(
                            game.images
                          )
                            ? game.images
                            : [
                                "",
                                "",
                                "",
                                ""
                              ],

                        clues:
                          Array.isArray(
                            game.clues
                          )
                            ? game.clues
                            : [],

                        crosswordAnswers:
                          Array.isArray(
                            game.crosswordAnswers
                          )
                            ? game.crosswordAnswers
                            : []

                      };

                    }
                  )
                : [];


            /*
             * Keep games inside valid
             * page range.
             */

            games =
              games.map(
                game => ({

                  ...game,

                  afterPage:
                    Math.min(
                      Math.max(
                        Number(
                          game.afterPage
                        ) || 1,
                        1
                      ),
                      pages.length
                    )

                })
              );


            return `

              <form
                class="card editor-section article-editor"
                data-article-id="${escapeAttr(
                  articleId
                )}"
              >

                <!-- =====================================
                     ARTICLE HEADER
                ====================================== -->

                <div class="article-editor-heading">

                  <div>

                    <div class="eyebrow">
                      Set ${escapeHTML(
                        setNumber
                      )}
                    </div>

                    <h3>
                      ${escapeHTML(
                        articleName(
                          articleId
                        )
                      )}
                    </h3>

                  </div>

                  <div class="editor-status">
                    ${pages.length} pages
                  </div>

                </div>


                <!-- =====================================
                     ARTICLE INFORMATION
                ====================================== -->

                <section class="builder-section">

                  <div class="builder-section-heading">

                    <div>

                      <div class="builder-label">
                        STORY INFORMATION
                      </div>

                      <p class="small">
                        Basic information for this article.
                      </p>

                    </div>

                  </div>


                  <div class="form-group">

                    <label>
                      Article title
                    </label>

                    <input
                      name="title"
                      required
                      value="${escapeAttr(
                        article.title || ""
                      )}"
                      placeholder="Enter the article title"
                    >

                  </div>


                  <div class="form-group">

                    <label>
                      Cover image URL
                    </label>

                    <input
                      name="image"
                      value="${escapeAttr(
                        article.image || ""
                      )}"
                      placeholder="Paste image URL"
                    >

                  </div>

                </section>


                <!-- =====================================
                     ARTICLE PAGES
                ====================================== -->

                <section class="builder-section">

                  <div class="builder-section-heading">

                    <div>

                      <div class="builder-label">
                        ARTICLE PAGES
                      </div>

                      <h3>
                        Build the story
                      </h3>

                      <p class="small">
                        Each page can contain up to
                        5 paragraphs. There is no minimum
                        number of paragraphs per page.
                      </p>

                    </div>

                  </div>


                  <div
                    class="page-builder"
                    data-pages
                  >

                    ${pages
                      .map(
                        (
                          page,
                          pageIndex
                        ) =>
                          renderArticlePage(
                            page,
                            pageIndex
                          )
                      )
                      .join("")}

                  </div>


                  <!-- ONE ADD PAGE BUTTON -->

                  <div class="add-page-area">

                    <button
                      type="button"
                      class="add-page-button"
                      data-add-page
                    >

                      <span class="add-page-icon">
                        +
                      </span>

                      <span>
                        NEW STORY PAGE
                      </span>

                    </button>

                    <p class="small">
                      Add another page to continue
                      your article.
                    </p>

                  </div>

                </section>


                <!-- =====================================
                     READER CHALLENGES
                ====================================== -->

                <section class="builder-section">

                  <div class="builder-section-heading">

                    <div>

                      <div class="builder-label">
                        READER CHALLENGES
                      </div>

                      <h3>
                        Interactive moments
                      </h3>

                      <p class="small">
                        Challenges are separate from
                        article pages. Choose the page
                        after which each challenge appears.
                      </p>

                    </div>

                  </div>


                  <div
                    class="challenge-builder"
                    data-games
                  >

                    ${
                      games.length
                        ? games
                            .map(
                              (
                                game,
                                gameIndex
                              ) =>
                                renderGameEditor(
                                  game,
                                  gameIndex,
                                  pages.length
                                )
                            )
                            .join("")
                        : `
                          <div
                            class="empty-challenge"
                            data-no-games
                          >

                            <div class="empty-challenge-mark">
                              +
                            </div>

                            <div>

                              <strong>
                                No challenges yet
                              </strong>

                              <p>
                                Add a game when you want
                                an interactive break in
                                the reading experience.
                              </p>

                            </div>

                          </div>
                        `
                    }

                  </div>


                  <button
                    type="button"
                    class="add-challenge-button"
                    data-add-game
                  >

                    + ADD READER CHALLENGE

                  </button>

                </section>


                <!-- =====================================
                     FINAL QUIZ
                ====================================== -->

                <section class="builder-section">

                  <div class="builder-section-heading">

                    <div>

                      <div class="builder-label">
                        FINAL EDITION
                      </div>

                      <h3>
                        Final Quiz
                      </h3>

                      <p class="small">
                        Every article must contain
                        exactly 5 final quiz questions.
                      </p>

                    </div>

                  </div>


                  ${Array.from(
                    { length: 5 },
                    (_, index) => {

                      const question =
                        article.questions?.[
                          index
                        ] || {

                          text: "",

                          choices: [
                            "",
                            "",
                            "",
                            ""
                          ],

                          correct: 0

                        };


                      return `

                        <div class="editor-question">

                          <div class="question-number">
                            0${index + 1}
                          </div>

                          <div class="question-content">

                            <strong>
                              Question ${
                                index + 1
                              }
                            </strong>


                            <div class="form-group">

                              <label>
                                Question text
                              </label>

                              <input
                                name="q${index}_text"
                                required
                                value="${escapeAttr(
                                  question.text ||
                                  ""
                                )}"
                                placeholder="Write the question"
                              >

                            </div>


                            <div
                              class="editor-question-grid"
                            >

                              ${Array.from(
                                { length: 4 },
                                (
                                  _,
                                  choiceIndex
                                ) => `

                                  <div class="form-group">

                                    <label>
                                      Choice ${
                                        choiceIndex + 1
                                      }
                                    </label>

                                    <input
                                      name="q${index}_choice${choiceIndex}"
                                      required
                                      value="${escapeAttr(
                                        question
                                          .choices?.[
                                            choiceIndex
                                          ] || ""
                                      )}"
                                      placeholder="Answer choice"
                                    >

                                  </div>

                                `
                              ).join("")}

                            </div>


                            <div class="form-group">

                              <label>
                                Correct answer
                              </label>

                              <select
                                name="q${index}_correct"
                              >

                                ${Array.from(
                                  { length: 4 },
                                  (
                                    _,
                                    choiceIndex
                                  ) => `

                                    <option
                                      value="${choiceIndex}"
                                      ${
                                        choiceIndex ===
                                        Number(
                                          question.correct
                                        )
                                          ? "selected"
                                          : ""
                                      }
                                    >
                                      Choice ${
                                        choiceIndex + 1
                                      }
                                    </option>

                                  `
                                ).join("")}

                              </select>

                            </div>

                          </div>

                        </div>

                      `;

                    }
                  ).join("")}

                </section>


                <!-- =====================================
                     SAVE
                ====================================== -->

                <div class="builder-save-area">

                  <button
                    class="save-article-button"
                    type="submit"
                  >

                    SAVE ARTICLE

                  </button>

                  <div
                    class="save-message"
                    aria-live="polite"
                  ></div>

                </div>

              </form>

            `;

          }
        )
        .join("");


    /*
     * ===============================================
     * FORM EVENTS
     * ===============================================
     */

    document
      .querySelectorAll(
        ".article-editor"
      )
      .forEach(
        form => {


          /*
           * SAVE
           */

          form.addEventListener(
            "submit",
            event => {

              saveArticle(
                event,
                form
              );

            }
          );


          /*
           * ADD PAGE
           */

          form
            .querySelector(
              "[data-add-page]"
            )
            .addEventListener(
              "click",
              () => {

                const pagesContainer =
                  form.querySelector(
                    "[data-pages]"
                  );

                const pageIndex =
                  pagesContainer.querySelectorAll(
                    ".article-page"
                  ).length;


                pagesContainer.insertAdjacentHTML(
                  "beforeend",
                  renderArticlePage(
                    {
                      paragraphs: []
                    },
                    pageIndex
                  )
                );


                updatePageNumbers(
                  form
                );


                updateChallengePageOptions(
                  form
                );

              }
            );


          /*
           * PAGE ACTIONS
           *
           * Event delegation means
           * dynamically created buttons
           * also work.
           */

          form
            .querySelector(
              "[data-pages]"
            )
            .addEventListener(
              "click",
              event => {

                /*
                 * ADD PARAGRAPH
                 */

                const addParagraph =
                  event.target.closest(
                    "[data-add-paragraph]"
                  );


                if (
                  addParagraph
                ) {

                  const page =
                    addParagraph.closest(
                      ".article-page"
                    );


                  if (!page) {
                    return;
                  }


                  const paragraphs =
                    page.querySelector(
                      "[data-paragraphs]"
                    );


                  const count =
                    paragraphs.querySelectorAll(
                      ".page-paragraph"
                    ).length;


                  if (
                    count >= 5
                  ) {

                    alert(
                      "This page already has the maximum of 5 paragraphs."
                    );

                    return;

                  }


                  paragraphs.insertAdjacentHTML(
                    "beforeend",
                    renderParagraph(
                      "",
                      count
                    )
                  );


                  updatePageParagraphLabels(
                    page
                  );

                  return;

                }


                /*
                 * REMOVE PARAGRAPH
                 */

                const removeParagraph =
                  event.target.closest(
                    "[data-remove-paragraph]"
                  );


                if (
                  removeParagraph
                ) {

                  const page =
                    removeParagraph.closest(
                      ".article-page"
                    );


                  if (!page) {
                    return;
                  }


                  removeParagraph
                    .closest(
                      ".page-paragraph"
                    )
                    .remove();


                  updatePageParagraphLabels(
                    page
                  );

                  return;

                }


                /*
                 * REMOVE PAGE
                 */

                const removePage =
                  event.target.closest(
                    "[data-remove-page]"
                  );


                if (
                  removePage
                ) {

                  const pages =
                    form.querySelectorAll(
                      ".article-page"
                    );


                  if (
                    pages.length <= 2
                  ) {

                    alert(
                      "NewsQuest requires at least 2 article pages."
                    );

                    return;

                  }


                  const page =
                    removePage.closest(
                      ".article-page"
                    );


                  page.remove();


                  updatePageNumbers(
                    form
                  );

                  updateChallengePageOptions(
                    form
                  );

                }

              }
            );


          /*
           * ADD GAME
           */

          form
            .querySelector(
              "[data-add-game]"
            )
            .addEventListener(
              "click",
              () => {

                const gamesContainer =
                  form.querySelector(
                    "[data-games]"
                  );


                const noGames =
                  gamesContainer.querySelector(
                    "[data-no-games]"
                  );


                if (noGames) {
                  noGames.remove();
                }


                const gameIndex =
                  gamesContainer.querySelectorAll(
                    ".game-item"
                  ).length;


                const game = {

                  afterPage: 1,

                  type: "jumbled",

                  answer: "",

                  scrambled: "",

                  hint: "",

                  images: [
                    "",
                    "",
                    "",
                    ""
                  ],

                  clues: [],

                  crosswordAnswers: []

                };


                gamesContainer.insertAdjacentHTML(
                  "beforeend",
                  renderGameEditor(
                    game,
                    gameIndex,
                    form.querySelectorAll(
                      ".article-page"
                    ).length
                  )
                );

              }
            );


          /*
           * GAME ACTIONS
           */

          form
            .querySelector(
              "[data-games]"
            )
            .addEventListener(
              "click",
              event => {

                const removeGame =
                  event.target.closest(
                    "[data-remove-game]"
                  );


                if (
                  !removeGame
                ) {

                  return;

                }


                removeGame
                  .closest(
                    ".game-item"
                  )
                  .remove();


                updateGameNumbers(
                  form
                );


                const gamesContainer =
                  form.querySelector(
                    "[data-games]"
                  );


                if (
                  !gamesContainer.querySelector(
                    ".game-item"
                  )
                ) {

                  gamesContainer.innerHTML = `

                    <div
                      class="empty-challenge"
                      data-no-games
                    >

                      <div class="empty-challenge-mark">
                        +
                      </div>

                      <div>

                        <strong>
                          No challenges yet
                        </strong>

                        <p>
                          Add a game when you want
                          an interactive break in
                          the reading experience.
                        </p>

                      </div>

                    </div>

                  `;

                }

              }
            );


          /*
           * GAME TYPE CHANGE
           */

          form
            .querySelector(
              "[data-games]"
            )
            .addEventListener(
              "change",
              event => {

                if (
                  !event.target.matches(
                    "[data-game-type]"
                  )
                ) {

                  return;

                }


                const gameItem =
                  event.target.closest(
                    ".game-item"
                  );


                const currentGame =
                  readGameItem(
                    gameItem
                  );


                currentGame.type =
                  event.target.value;


                const gameIndex =
                  Number(
                    gameItem.dataset.gameIndex
                  );


                gameItem.outerHTML =
                  renderGameEditor(
                    currentGame,
                    gameIndex,
                    form.querySelectorAll(
                      ".article-page"
                    ).length
                  );

              }
            );


          /*
           * PAGE DROPDOWN CHANGE
           */

          form
            .querySelector(
              "[data-games]"
            )
            .addEventListener(
              "change",
              event => {

                if (
                  !event.target.matches(
                    "[data-game-page]"
                  )
                ) {

                  return;

                }

                /*
                 * Nothing else needed here.
                 * The selected page is read
                 * when the article is saved.
                 */

              }
            );

        }
      );


  } catch (error) {

    console.error(
      "Article editor error:",
      error
    );

    container.innerHTML = `

      <section class="card editor-section">

        <div class="error">
          Unable to load the article editor.
        </div>

      </section>

    `;

  }

}


/* =========================================================
   BUILD ARTICLE PAGES
   ========================================================= */

function buildArticlePages(
  article
) {

  /*
   * New page structure
   */

  if (
    Array.isArray(
      article.pages
    ) &&
    article.pages.length >= 2
  ) {

    return article.pages.map(
      page => ({

        paragraphs:
          Array.isArray(
            page.paragraphs
          )
            ? page.paragraphs
                .slice(0, 5)
                .map(
                  paragraph =>
                    String(
                      paragraph
                    )
                )
            : []

      })
    );

  }


  /*
   * Old paragraphs
   */

  let paragraphs =
    Array.isArray(
      article.paragraphs
    )
      ? [
          ...article.paragraphs
        ]
      : [];


  /*
   * Old sections
   */

  if (
    paragraphs.length === 0 &&
    Array.isArray(
      article.sections
    )
  ) {

    article.sections.forEach(
      section => {

        if (
          Array.isArray(
            section.paragraphs
          )
        ) {

          section.paragraphs
            .forEach(
              paragraph => {

                if (
                  String(
                    paragraph
                  ).trim()
                ) {

                  paragraphs.push(
                    paragraph
                  );

                }

              }
            );

        }

      }
    );

  }


  /*
   * Old body
   */

  if (
    paragraphs.length === 0 &&
    article.body
  ) {

    paragraphs =
      String(
        article.body
      )
        .split(
          /\n\s*\n/
        )
        .map(
          paragraph =>
            paragraph.trim()
        )
        .filter(Boolean);

  }


  /*
   * Create pages with maximum
   * 5 paragraphs.
   */

  const pages = [];

  for (
    let i = 0;
    i < paragraphs.length;
    i += 5
  ) {

    pages.push({

      paragraphs:
        paragraphs
          .slice(
            i,
            i + 5
          )

    });

  }


  /*
   * Always guarantee minimum
   * 2 pages.
   */

  while (
    pages.length < 2
  ) {

    pages.push({

      paragraphs: []

    });

  }


  return pages;

}


/* =========================================================
   FIND PAGE FOR OLD PARAGRAPH POSITION
   ========================================================= */

function getPageForParagraph(
  pages,
  paragraphPosition
) {

  let count = 0;


  for (
    let index = 0;
    index < pages.length;
    index++
  ) {

    count +=
      pages[index]
        .paragraphs
        .length;


    if (
      paragraphPosition <=
      count
    ) {

      return index + 1;

    }

  }


  return pages.length;

}


/* =========================================================
   RENDER ARTICLE PAGE
   ========================================================= */

function renderArticlePage(
  page,
  pageIndex
) {

  const paragraphs =
    Array.isArray(
      page.paragraphs
    )
      ? page.paragraphs.slice(
          0,
          5
        )
      : [];


  return `

    <article
      class="article-page"
      data-page-index="${pageIndex}"
    >

      <div class="article-page-top">

        <div>

          <span class="page-label">
            PAGE
          </span>

          <strong
            data-page-number
          >
            ${String(
              pageIndex + 1
            ).padStart(
              2,
              "0"
            )}
          </strong>

        </div>


        ${
          pageIndex >= 2
            ? `
              <button
                type="button"
                class="page-remove-button"
                data-remove-page
              >
                Remove page
              </button>
            `
            : ""
        }

      </div>


      <div
        class="page-paragraphs"
        data-paragraphs
      >

        ${
          paragraphs.length
            ? paragraphs
                .map(
                  (
                    paragraph,
                    index
                  ) =>
                    renderParagraph(
                      paragraph,
                      index
                    )
                )
                .join("")
            : `
              <div
                class="empty-page-message"
              >
                This page is empty.
                Add a paragraph when ready.
              </div>
            `
        }

      </div>


      <div class="page-actions">

        ${
          paragraphs.length >= 5
            ? `
              <span class="page-limit">
                5 / 5 paragraphs
              </span>
            `
            : `
              <button
                type="button"
                class="continue-story-button"
                data-add-paragraph
              >
                + CONTINUE STORY
              </button>

              <span class="page-limit">
                ${
                  paragraphs.length
                } / 5
              </span>
            `
        }

      </div>

    </article>

  `;

}


/* =========================================================
   RENDER PARAGRAPH
   ========================================================= */

function renderParagraph(
  paragraph = "",
  index = 0
) {

  return `

    <div
      class="page-paragraph"
      data-paragraph-index="${index}"
    >

      <div class="paragraph-heading">

        <span>
          Paragraph ${
            index + 1
          }
        </span>

        <button
          type="button"
          class="paragraph-remove-button"
          data-remove-paragraph
        >
          Remove
        </button>

      </div>


      <textarea
        name="paragraph"
        rows="6"
        placeholder="Continue the story here..."
      >${escapeHTML(
        paragraph
      )}</textarea>

    </div>

  `;

}


/* =========================================================
   UPDATE PAGE NUMBERS
   ========================================================= */

function updatePageNumbers(
  form
) {

  form
    .querySelectorAll(
      ".article-page"
    )
    .forEach(
      (
        page,
        index
      ) => {

        page.dataset.pageIndex =
          index;


        const number =
          page.querySelector(
            "[data-page-number]"
          );


        if (number) {

          number.textContent =
            String(
              index + 1
            ).padStart(
              2,
              "0"
            );

        }


        /*
         * First 2 pages cannot
         * be removed.
         */

        const top =
          page.querySelector(
            ".article-page-top"
          );


        if (
          top &&
          index < 2
        ) {

          const remove =
            top.querySelector(
              "[data-remove-page]"
            );

          if (remove) {
            remove.remove();
          }

        }


        if (
          top &&
          index >= 2 &&
          !top.querySelector(
            "[data-remove-page]"
          )
        ) {

          top.insertAdjacentHTML(
            "beforeend",
            `
              <button
                type="button"
                class="page-remove-button"
                data-remove-page
              >
                Remove page
              </button>
            `
          );

        }


        updatePageParagraphLabels(
          page
        );

      }
    );

}


/* =========================================================
   UPDATE PARAGRAPH LABELS
   ========================================================= */

function updatePageParagraphLabels(
  page
) {

  const paragraphs =
    page.querySelectorAll(
      ".page-paragraph"
    );


  paragraphs.forEach(
    (
      paragraph,
      index
    ) => {

      paragraph.dataset.paragraphIndex =
        index;


      const label =
        paragraph.querySelector(
          ".paragraph-heading span"
        );


      if (label) {

        label.textContent =
          `Paragraph ${
            index + 1
          }`;

      }

    }
  );


  /*
   * Remove empty-page message
   * if a paragraph exists.
   */

  const emptyMessage =
    page.querySelector(
      ".empty-page-message"
    );


  if (
    paragraphs.length &&
    emptyMessage
  ) {

    emptyMessage.remove();

  }


  /*
   * Update page count.
   */

  const pageActions =
    page.querySelector(
      ".page-actions"
    );


  if (!pageActions) {
    return;
  }


  const count =
    paragraphs.length;


  if (
    count >= 5
  ) {

    pageActions.innerHTML = `

      <span class="page-limit">
        5 / 5 paragraphs
      </span>

    `;

  } else {

    pageActions.innerHTML = `

      <button
        type="button"
        class="continue-story-button"
        data-add-paragraph
      >
        + CONTINUE STORY
      </button>

      <span class="page-limit">
        ${count} / 5
      </span>

    `;

  }

}


/* =========================================================
   UPDATE CHALLENGE PAGE OPTIONS
   ========================================================= */

function updateChallengePageOptions(
  form
) {

  const pageCount =
    form.querySelectorAll(
      ".article-page"
    ).length;


  form
    .querySelectorAll(
      "[data-game-page]"
    )
    .forEach(
      select => {

        const current =
          Number(
            select.value
          ) || 1;


        select.innerHTML =
          Array.from(
            {
              length:
                pageCount
            },
            (
              _,
              index
            ) => {

              const page =
                index + 1;


              return `

                <option
                  value="${page}"
                  ${
                    page ===
                    Math.min(
                      current,
                      pageCount
                    )
                      ? "selected"
                      : ""
                  }
                >
                  After Page ${page}
                </option>

              `;

            }
          ).join("");

      }
    );

}


/* =========================================================
   RENDER GAME EDITOR
   ========================================================= */

function renderGameEditor(
  game,
  gameIndex,
  pageCount
) {

  const type =
    game.type ||
    "jumbled";


  const afterPage =
    Math.min(
      Math.max(
        Number(
          game.afterPage
        ) || 1,
        1
      ),
      pageCount
    );


  const pageOptions =
    Array.from(
      {
        length:
          pageCount
      },
      (
        _,
        index
      ) => {

        const page =
          index + 1;


        return `

          <option
            value="${page}"
            ${
              page ===
              afterPage
                ? "selected"
                : ""
            }
          >
            After Page ${page}
          </option>

        `;

      }
    ).join("");


  let content = "";


  /*
   * JUMBLED
   */

  if (
    type === "jumbled"
  ) {

    content = `

      <div class="form-group">

        <label>
          Correct answer
        </label>

        <input
          data-game-answer
          value="${escapeAttr(
            game.answer || ""
          )}"
          placeholder="Example: MEDIA"
        >

      </div>


      <div class="form-group">

        <label>
          Scrambled letters
        </label>

        <input
          data-game-scrambled
          value="${escapeAttr(
            game.scrambled || ""
          )}"
          placeholder="Example: DAEMI"
        >

      </div>


      <div class="form-group">

        <label>
          Hint
        </label>

        <input
          data-game-hint
          value="${escapeAttr(
            game.hint || ""
          )}"
          placeholder="Optional hint"
        >

      </div>

    `;

  }


  /*
   * FOUR PICS
   */

  if (
    type === "fourPics"
  ) {

    const images =
      Array.isArray(
        game.images
      )
        ? game.images
        : [
            "",
            "",
            "",
            ""
          ];


    content = `

      <div class="form-group">

        <label>
          Image 1 URL
        </label>

        <input
          data-game-image="0"
          value="${escapeAttr(
            images[0] || ""
          )}"
          placeholder="Paste image URL"
        >

      </div>


      <div class="form-group">

        <label>
          Image 2 URL
        </label>

        <input
          data-game-image="1"
          value="${escapeAttr(
            images[1] || ""
          )}"
          placeholder="Paste image URL"
        >

      </div>


      <div class="form-group">

        <label>
          Image 3 URL
        </label>

        <input
          data-game-image="2"
          value="${escapeAttr(
            images[2] || ""
          )}"
          placeholder="Paste image URL"
        >

      </div>


      <div class="form-group">

        <label>
          Image 4 URL
        </label>

        <input
          data-game-image="3"
          value="${escapeAttr(
            images[3] || ""
          )}"
          placeholder="Paste image URL"
        >

      </div>


      <div class="form-group">

        <label>
          Correct answer
        </label>

        <input
          data-game-answer
          value="${escapeAttr(
            game.answer || ""
          )}"
          placeholder="Example: NEWS"
        >

      </div>


      <div class="form-group">

        <label>
          Hint
        </label>

        <input
          data-game-hint
          value="${escapeAttr(
            game.hint || ""
          )}"
          placeholder="Optional hint"
        >

      </div>

    `;

  }


  /*
   * CROSSWORD
   *
   * Leave the existing basic editor
   * for now. We will rebuild this later.
   */

  if (
    type === "crossword"
  ) {

    content = `

      <div class="notice">

        Crossword setup will be upgraded
        after the new page system is finished.

      </div>


      <div class="form-group">

        <label>
          Crossword clue
        </label>

        <input
          data-crossword-clue
          value="${escapeAttr(
            game.clues?.[0] || ""
          )}"
          placeholder="Enter clue"
        >

      </div>


      <div class="form-group">

        <label>
          Answer
        </label>

        <input
          data-crossword-answer
          value="${escapeAttr(
            game.crosswordAnswers?.[0] || ""
          )}"
          placeholder="Enter answer"
        >

      </div>

    `;

  }


  return `

    <article
      class="game-item"
      data-game-index="${gameIndex}"
    >

      <div class="game-item-header">

        <div>

          <span class="game-number">
            CHALLENGE ${
              String(
                gameIndex + 1
              ).padStart(
                2,
                "0"
              )
            }
          </span>

          <h4>
            ${
              type === "jumbled"
                ? "Jumbled Words"
                : type === "fourPics"
                  ? "4 Pics 1 Word"
                  : "Mini Crossword"
            }
          </h4>

        </div>


        <button
          type="button"
          class="game-remove-button"
          data-remove-game
        >
          Remove
        </button>

      </div>


      <div class="form-group">

        <label>
          Appears after
        </label>

        <select
          data-game-page
        >

          ${pageOptions}

        </select>

      </div>


      <div class="form-group">

        <label>
          Challenge type
        </label>

        <select
          data-game-type
        >

          <option
            value="jumbled"
            ${
              type ===
              "jumbled"
                ? "selected"
                : ""
            }
          >
            Jumbled Words
          </option>


          <option
            value="fourPics"
            ${
              type ===
              "fourPics"
                ? "selected"
                : ""
            }
          >
            4 Pics 1 Word
          </option>


          <option
            value="crossword"
            ${
              type ===
              "crossword"
                ? "selected"
                : ""
            }
          >
            Mini Crossword
          </option>

        </select>

      </div>


      <div class="game-content">

        ${content}

      </div>

    </article>

  `;

}


/* =========================================================
   READ GAME ITEM
   ========================================================= */

function readGameItem(
  gameItem
) {

  const type =
    gameItem.querySelector(
      "[data-game-type]"
    )?.value ||
    "jumbled";


  const afterPage =
    Number(
      gameItem.querySelector(
        "[data-game-page]"
      )?.value ||
      1
    );


  const images =
    Array.from(
      {
        length: 4
      },
      (
        _,
        index
      ) =>
        gameItem.querySelector(
          `[data-game-image="${index}"]`
        )?.value?.trim() ||
        ""
    );


  const clues = [
    gameItem.querySelector(
      "[data-crossword-clue]"
    )?.value?.trim() ||
    ""
  ];


  const crosswordAnswers = [
    gameItem.querySelector(
      "[data-crossword-answer]"
    )?.value?.trim() ||
    ""
  ];


  return {

    afterPage,

    type,

    answer:
      gameItem.querySelector(
        "[data-game-answer]"
      )?.value?.trim() ||
      "",

    scrambled:
      gameItem.querySelector(
        "[data-game-scrambled]"
      )?.value?.trim() ||
      "",

    hint:
      gameItem.querySelector(
        "[data-game-hint]"
      )?.value?.trim() ||
      "",

    images,

    clues,

    crosswordAnswers

  };

}


/* =========================================================
   UPDATE GAME NUMBERS
   ========================================================= */

function updateGameNumbers(
  form
) {

  form
    .querySelectorAll(
      ".game-item"
    )
    .forEach(
      (
        gameItem,
        index
      ) => {

        gameItem.dataset.gameIndex =
          index;


        const number =
          gameItem.querySelector(
            ".game-number"
          );


        if (number) {

          number.textContent =
            `CHALLENGE ${
              String(
                index + 1
              ).padStart(
                2,
                "0"
              )
            }`;

        }

      }
    );

}


/* =========================================================
   SAVE ARTICLE
   ========================================================= */

async function saveArticle(
  event,
  form
) {

  event.preventDefault();


  const message =
    form.querySelector(
      ".save-message"
    );


  try {

    message.innerHTML = `
      <div class="notice">
        Saving article...
      </div>
    `;


    const articleId =
      form.dataset.articleId;


    const title =
      form.querySelector(
        '[name="title"]'
      ).value.trim();


    const image =
      form.querySelector(
        '[name="image"]'
      ).value.trim();


    /*
     * ===============================================
     * READ PAGES
     * ===============================================
     */

    const pageElements =
      form.querySelectorAll(
        ".article-page"
      );


    if (
      pageElements.length < 2
    ) {

      throw new Error(
        "NewsQuest requires at least 2 article pages."
      );

    }


    const pages =
      Array.from(
        pageElements
      ).map(
        page => {

          const paragraphElements =
            page.querySelectorAll(
              ".page-paragraph textarea"
            );


          if (
            paragraphElements.length > 5
          ) {

            throw new Error(
              "A page cannot contain more than 5 paragraphs."
            );

          }


          const paragraphs =
            Array.from(
              paragraphElements
            ).map(
              textarea =>
                textarea.value.trim()
            );


          if (
            paragraphs.some(
              paragraph =>
                !paragraph
            )
          ) {

            throw new Error(
              "Please complete or remove every empty paragraph."
            );

          }


          return {

            paragraphs

          };

        }
      );


    /*
     * ===============================================
     * FLATTEN PARAGRAPHS
     *
     * Kept for compatibility with
     * existing reader code.
     * ===============================================
     */

    const paragraphs =
      pages
        .flatMap(
          page =>
            page.paragraphs
        );


    /*
     * ===============================================
     * READ GAMES
     * ===============================================
     */

    const gameElements =
      form.querySelectorAll(
        ".game-item"
      );


    const games =
      Array.from(
        gameElements
      ).map(
        gameItem =>
          readGameItem(
            gameItem
          )
      );


    /*
     * ===============================================
     * VALIDATE GAME POSITIONS
     * ===============================================
     */

    games.forEach(
      game => {

        if (
          game.afterPage < 1 ||
          game.afterPage >
            pages.length
        ) {

          throw new Error(
            "Every challenge must be placed after a valid article page."
          );

        }


        /*
         * JUMBLED
         */

        if (
          game.type ===
          "jumbled"
        ) {

          if (
            !game.answer
          ) {

            throw new Error(
              "Jumbled Words needs a correct answer."
            );

          }


          if (
            !game.scrambled
          ) {

            throw new Error(
              "Jumbled Words needs scrambled letters."
            );

          }

        }


        /*
         * FOUR PICS
         */

        if (
          game.type ===
          "fourPics"
        ) {

          if (
            game.images.some(
              image =>
                !image
            )
          ) {

            throw new Error(
              "4 Pics 1 Word needs all 4 image URLs."
            );

          }


          if (
            !game.answer
          ) {

            throw new Error(
              "4 Pics 1 Word needs a correct answer."
            );

          }

        }


        /*
         * CROSSWORD
         *
         * Temporary validation.
         */

        if (
          game.type ===
          "crossword"
        ) {

          if (
            !game.clues[0]
          ) {

            throw new Error(
              "Mini Crossword needs a clue."
            );

          }


          if (
            !game.crosswordAnswers[0]
          ) {

            throw new Error(
              "Mini Crossword needs an answer."
            );

          }

        }

      }
    );


    /*
     * ===============================================
     * FINAL QUIZ
     * ===============================================
     */

    const questions =
      Array.from(
        { length: 5 },
        (_, index) => {

          const text =
            form.querySelector(
              `[name="q${index}_text"]`
            ).value.trim();


          const choices =
            Array.from(
              { length: 4 },
              (
                _,
                choiceIndex
              ) =>
                form.querySelector(
                  `[name="q${index}_choice${choiceIndex}"]`
                ).value.trim()
            );


          const correct =
            Number(
              form.querySelector(
                `[name="q${index}_correct"]`
              ).value
            );


          return {

            text,

            choices,

            correct

          };

        }
      );


    questions.forEach(
      (
        question,
        index
      ) => {

        if (
          !question.text
        ) {

          throw new Error(
            `Question ${
              index + 1
            } is empty.`
          );

        }


        if (
          question.choices.some(
            choice =>
              !choice
          )
        ) {

          throw new Error(
            `Please complete all choices for Question ${
              index + 1
            }.`
          );

        }

      }
    );


    /*
     * ===============================================
     * LEGACY BODY
     * ===============================================
     */

    const body =
      paragraphs.join(
        "\n\n"
      );


    /*
     * ===============================================
     * SAVE
     * ===============================================
     */

    await setDoc(
      doc(
        db,
        "articles",
        articleId
      ),
      {

        articleId,

        title,

        image,

        /*
         * NEW STRUCTURE
         */

        pages,

        games,

        /*
         * OLD STRUCTURE KEPT FOR
         * COMPATIBILITY
         */

        paragraphs,

        body,

        questions,

        updatedAt:
          serverTimestamp()

      }
    );


    message.innerHTML = `
      <div class="save-success">
        ✓ ${escapeHTML(
          articleName(
            articleId
          )
        )} saved successfully.
      </div>
    `;


    /*
     * Update small page counter
     */

    const status =
      form.querySelector(
        ".editor-status"
      );


    if (status) {

      status.textContent =
        `${pages.length} pages`;

    }


  } catch (error) {

    console.error(
      "Save article error:",
      error
    );


    message.innerHTML = `
      <div class="error">
        ${escapeHTML(
          error.message ||
          "Unable to save article."
        )}
      </div>
    `;

  }

}
  // =========================================================
  // CODE MANAGER
  // =========================================================

  async function renderCodeManager() {

    const container =
      document.querySelector(
        "#dashboard-content"
      );

    container.innerHTML = `
      <section class="card editor-section">

        <h3>
          Respondent code management
        </h3>

        <p class="small">
          Codes determine the assigned set
          and article.
        </p>

        <form id="add-code-form">

          <div class="editor-question-grid">

            <div class="form-group">

              <label>
                New respondent code
              </label>

              <input
                id="new-code"
                required
                placeholder="SET1-004"
              >

            </div>

            <div class="form-group">

              <label>
                Assigned set
              </label>

              <select id="new-set">

                <option value="1">
                  Set 1 / Article 1
                </option>

                <option value="2">
                  Set 2 / Article 2
                </option>

                <option value="3">
                  Set 3 / Article 3
                </option>

              </select>

            </div>

          </div>

          <div id="code-message"></div>

          <button
            class="primary-btn"
            type="submit"
          >
            Add respondent code
          </button>

        </form>

      </section>

      <section class="card editor-section">

        <h3>
          Existing respondent codes
        </h3>

        <div class="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Code</th>
                <th>Set</th>
                <th>Article</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody id="code-table">

              <tr>
                <td colspan="4">
                  Loading codes...
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </section>
    `;

    document
      .querySelector(
        "#add-code-form"
      )
      .addEventListener(
        "submit",
        addCode
      );

    await drawCodeTable();
  }

  async function addCode(event) {
    event.preventDefault();

    const message =
      document.querySelector(
        "#code-message"
      );

    const code =
      document
        .querySelector(
          "#new-code"
        )
        .value
        .trim()
        .toUpperCase();

    const set =
      Number(
        document.querySelector(
          "#new-set"
        ).value
      );

    if (
      !/^SET[1-3]-[A-Z0-9]+$/.test(
        code
      )
    ) {
      message.innerHTML =
        errorBox(
          "Use a format like SET1-004."
        );

      return;
    }

    const ref =
      doc(
        db,
        "respondentCodes",
        code
      );

    try {

      const existing =
        await getDoc(ref);

      if (existing.exists()) {
        message.innerHTML =
          errorBox(
            "That respondent code already exists."
          );

        return;
      }

      await setDoc(
        ref,
        {
          code,
          set,

          articleId:
            SET_ARTICLES[
              set
            ],

          status:
            "Available",

          usedAt:
            null,

          createdAt:
            serverTimestamp()
        }
      );

      message.innerHTML =
        noticeBox(
          "Respondent code added."
        );

      event.target.reset();

      await drawCodeTable();

    } catch (error) {

      console.error(error);

      message.innerHTML =
        errorBox(
          "The respondent code could not be added."
        );
    }
  }

  async function drawCodeTable() {

    const table =
      document.querySelector(
        "#code-table"
      );

    if (!table) {
      return;
    }

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            "respondentCodes"
          )
        );

      const rows =
        snapshot.docs
          .map(item => ({
            id: item.id,
            ...item.data()
          }))
          .sort((a, b) =>
            String(
              a.code
            ).localeCompare(
              String(
                b.code
              )
            )
          )
          .map(code => `
            <tr>

              <td>
                ${escapeHTML(
                  code.code || ""
                )}
              </td>

              <td>
                Set ${escapeHTML(
                  code.set || ""
                )}
              </td>

              <td>
                ${escapeHTML(
                  articleName(
                    code.articleId || ""
                  )
                )}
              </td>

              <td>

                <span
                  class="status ${
                    code.status ===
                    "Used"
                      ? "used"
                      : "available"
                  }"
                >
                  ${escapeHTML(
                    code.status || ""
                  )}
                </span>

              </td>

            </tr>
          `)
          .join("");

      table.innerHTML =
        rows ||
        `
          <tr>
            <td colspan="4">
              No respondent codes yet.
            </td>
          </tr>
        `;

    } catch (error) {

      console.error(error);

      table.innerHTML = `
        <tr>
          <td colspan="4">
            Unable to load respondent codes.
          </td>
        </tr>
      `;
    }
  }

  // =========================================================
  // LEADERBOARDS
  // =========================================================

  async function renderLeaderboards() {

    const container =
      document.querySelector(
        "#dashboard-content"
      );

    if (!container) {
      return;
    }

    container.innerHTML = `
      <section class="card editor-section">

        <div class="eyebrow">
          Performance
        </div>

        <h3>
          Article Leaderboards
        </h3>

        <p class="small">
          Top 10 participants for each article,
          ranked by points.
        </p>

        <div id="leaderboard-container">

          <div class="notice">
            Loading leaderboards...
          </div>

        </div>

      </section>
    `;

    const articles = [
      {
        id: "article1",
        title: "Article 1"
      },
      {
        id: "article2",
        title: "Article 2"
      },
      {
        id: "article3",
        title: "Article 3"
      }
    ];

    try {

      const sections = [];

      for (
        const article of articles
      ) {

        const leaderboardQuery =
          query(
            collection(
              db,
              "leaderboards",
              article.id,
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
              (item, index) => {

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
                          entry.displayName ||
                            "Participant"
                        )}
                      </strong>

                    </span>

                    <span>
                      ${Number(
                        entry.points || 0
                      )} pts
                    </span>

                  </div>
                `;
              }
            )
            .join("");

        sections.push(`
          <div
            class="card editor-section"
            style="
              margin-top: 20px;
            "
          >

            <div class="eyebrow">
              ${escapeHTML(
                article.title
              )}
            </div>

            <h3>
              Top 10 Participants
            </h3>

            ${
              rows ||
              `
                <div class="notice">
                  No completed participants yet.
                </div>
              `
            }

          </div>
        `);
      }

      document.querySelector(
        "#leaderboard-container"
      ).innerHTML =
        sections.join("");

    } catch (error) {

      console.error(
        "Researcher leaderboard error:",
        error
      );

      document.querySelector(
        "#leaderboard-container"
      ).innerHTML = `
        <div class="error">
          Unable to load the leaderboards.
        </div>
      `;
    }
  }

  // =========================================================
  // EXPORT
  // =========================================================

  async function renderExport() {

    document.querySelector(
      "#dashboard-content"
    ).innerHTML = `
      <section class="card editor-section">

        <h3>
          Export research data
        </h3>

        <p class="small">
          Export completed respondent records
          as a CSV file for analysis.
        </p>

        <button
          id="export-csv"
          class="primary-btn"
        >
          Export CSV
        </button>

      </section>
    `;

    document
      .querySelector(
        "#export-csv"
      )
      .addEventListener(
        "click",
        exportCSV
      );
  }

  async function exportCSV() {

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            "responses"
          )
        );

      const headers = [
        "Respondent Code",
        "Set",
        "Article",
        "Score",
        "Total Questions",
        "Percentage",
        "Points",
        "Date",
        "Time",
        "Status"
      ];

      const lines = [
        headers
      ];

      snapshot.docs.forEach(
        item => {

          const response =
            item.data();

          const date =
            response.submittedAt?.toDate
              ? response.submittedAt.toDate()
              : new Date();

          lines.push([
            response.respondentCode || "",
            `Set ${response.set || ""}`,
            articleName(
              response.articleId || ""
            ),
            response.score ?? "",
            response.totalQuestions ?? 5,
            `${response.percentage ?? 0}%`,
            response.points ?? 0,
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            response.status ||
              "Completed"
          ]);
        }
      );

      const csv =
        lines
          .map(
            row =>
              row
                .map(
                  value =>
                    `"${String(
                      value
                    ).replaceAll(
                      '"',
                      '""'
                    )}"`
                )
                .join(",")
          )
          .join("\n");

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8"
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "newsquest-responses.csv";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(
        url
      );

    } catch (error) {

      console.error(error);

      alert(
        "Unable to export the research data."
      );
    }
  }

  // =========================================================
  // AUTH STATE
  // =========================================================

  onAuthStateChanged(
    auth,
    async user => {

      if (!user) {
        renderLogin();
        return;
      }

      await renderDashboard(
        "records"
      );
    }
  );

})();
