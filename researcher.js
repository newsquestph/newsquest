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
      updateDoc,
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
        noticeBox("Signing in...");

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
      .querySelector("#logout")
      .addEventListener(
        "click",
        () => signOut(auth)
      );

    document
      .querySelectorAll("[data-tab]")
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
  // ARTICLE BUILDER
  // =========================================================

 async function renderEditor() {

  const container =
    document.querySelector(
      "#dashboard-content"
    );

  if (!container) {
    return;
  }

  container.innerHTML = `
    <section class="editor-workspace">

      <div class="editor-intro">

        <div class="editor-eyebrow">
          Editorial Workspace
        </div>

        <h2>
          Article / Game / Quiz Editor
        </h2>

        <p>
          Build the article page by page,
          add interactive games, and create
          the five-question quiz.
        </p>

        <div class="editor-rules">

          <span>
            Minimum 2 pages
          </span>

          <span>
            Maximum 5 paragraphs per page
          </span>

          <span>
            5 quiz questions
          </span>

          <span>
            4 choices per question
          </span>

        </div>

      </div>

      <div id="article-editor-list">

        <div class="notice">
          Loading articles...
        </div>

      </div>

    </section>
  `;

  const articleList =
    document.querySelector(
      "#article-editor-list"
    );

  try {

    // =====================================================
    // LOAD ARTICLES
    // =====================================================

    const articlesSnapshot =
      await getDocs(
        collection(
          db,
          "articles"
        )
      );

    const articles = [];

    articlesSnapshot.forEach(
      docSnap => {

        articles.push({
          id: docSnap.id,
          ...docSnap.data()
        });

      }
    );

    articles.sort(
      (a, b) =>
        String(a.id).localeCompare(
          String(b.id)
        )
    );

    if (!articles.length) {

      articleList.innerHTML = `
        <div class="empty-editor-state">
          <p>No articles found.</p>
        </div>
      `;

      return;
    }

    // =====================================================
    // NORMALIZE PAGES
    // =====================================================

    function normalizePages(article) {

      if (
        Array.isArray(article.pages) &&
        article.pages.length >= 2
      ) {

        return article.pages.map(
          (page, index) => ({

            pageNumber:
              index + 1,

            paragraphs:
              Array.isArray(
                page.paragraphs
              )
                ? page.paragraphs
                    .map(
                      paragraph =>
                        String(
                          paragraph ?? ""
                        )
                    )
                    .slice(0, 5)

                : []

          })
        );

      }

      let oldParagraphs = [];

      if (
        Array.isArray(
          article.paragraphs
        )
      ) {

        oldParagraphs =
          article.paragraphs.map(
            paragraph =>
              String(
                paragraph ?? ""
              )
          );

      } else if (
        Array.isArray(
          article.sections
        )
      ) {

        oldParagraphs =
          article.sections.flatMap(
            section => {

              if (
                !Array.isArray(
                  section.paragraphs
                )
              ) {
                return [];
              }

              return section.paragraphs.map(
                paragraph =>
                  String(
                    paragraph ?? ""
                  )
              );

            }
          );

      } else if (
        article.body
      ) {

        oldParagraphs =
          String(
            article.body
          )
            .split(/\n\s*\n/)
            .map(
              paragraph =>
                paragraph.trim()
            )
            .filter(Boolean);

      }

      const pages = [];

      for (
        let i = 0;
        i < oldParagraphs.length;
        i += 5
      ) {

        pages.push({

          pageNumber:
            pages.length + 1,

          paragraphs:
            oldParagraphs.slice(
              i,
              i + 5
            )

        });

      }

      while (
        pages.length < 2
      ) {

        pages.push({

          pageNumber:
            pages.length + 1,

          paragraphs: []

        });

      }

      return pages;
    }

    // =====================================================
    // NORMALIZE GAMES
    // =====================================================

    function normalizeGames(article) {

      if (
        !Array.isArray(
          article.games
        )
      ) {
        return [];
      }

      return article.games.map(
        game => {

          const normalized = {
            type:
              game.type ||
              "jumbled",

            afterPage:
              Number(
                game.afterPage || 1
              )
          };

          if (
            normalized.type ===
            "jumbled"
          ) {

            normalized.answer =
              String(
                game.answer || ""
              );

            normalized.scrambled =
              String(
                game.scrambled || ""
              );

          }

          if (
            normalized.type ===
            "fourPics"
          ) {

            normalized.images =
              Array.isArray(
                game.images
              )
                ? [
                    String(
                      game.images[0] || ""
                    ),
                    String(
                      game.images[1] || ""
                    ),
                    String(
                      game.images[2] || ""
                    ),
                    String(
                      game.images[3] || ""
                    )
                  ]
                : ["", "", "", ""];

            normalized.answer =
              String(
                game.answer || ""
              );

          }

          if (
            normalized.type ===
            "crossword"
          ) {

            normalized.size =
              Number(
                game.size || 8
              );

            normalized.words =
              Array.isArray(
                game.words
              )
                ? game.words.map(
                    word => ({
                      answer:
                        String(
                          word.answer || ""
                        ),

                      clue:
                        String(
                          word.clue || ""
                        ),

                      row:
                        Number(
                          word.row || 1
                        ),

                      column:
                        Number(
                          word.column || 1
                        ),

                      direction:
                        word.direction ===
                        "down"
                          ? "down"
                          : "across"
                    })
                  )
                : [];

          }

          return normalized;

        }
      );
    }

    // =====================================================
    // NORMALIZE QUIZ
    // =====================================================

    function normalizeQuestions(article) {

      const source =
        Array.isArray(
          article.questions
        )
          ? article.questions
          : [];

      const questions =
        Array.from(
          { length: 5 },
          (_, index) => {

            const existing =
              source[index] || {};

            const choices =
              Array.isArray(
                existing.choices
              )
                ? existing.choices
                    .slice(0, 4)
                    .map(
                      choice =>
                        String(
                          choice ?? ""
                        )
                    )
                : [];

            while (
              choices.length < 4
            ) {
              choices.push("");
            }

            return {

              text:
                String(
                  existing.text || ""
                ),

              choices,

              correct:
                Number.isInteger(
                  existing.correct
                )
                  ? Math.min(
                      Math.max(
                        existing.correct,
                        0
                      ),
                      3
                    )
                  : 0

            };

          }
        );

      return questions;
    }

    // =====================================================
    // RENDER ARTICLE CARDS
    // =====================================================

    articles.forEach(
      article => {

        const pages =
          normalizePages(
            article
          );

        const games =
          normalizeGames(
            article
          );

        const questions =
          normalizeQuestions(
            article
          );

        const articleCard =
          document.createElement(
            "article"
          );

        articleCard.className =
          "article-editor-card";

        articleCard.dataset.articleId =
          article.id;

        articleCard.innerHTML = `

          <div class="article-editor-heading">

            <div>

              <span class="editor-label">
                ${escapeHTML(
                  articleName(
                    article.id
                  )
                )}
              </span>

              <h3>
                ${escapeHTML(
                  article.title ||
                  "Untitled Article"
                )}
              </h3>

            </div>

            <span class="article-page-count">
              ${pages.length} pages
            </span>

          </div>


          <!-- =================================================
               ARTICLE BUILDER
          ================================================== -->

          <section class="editor-subsection">

            <div class="editor-subsection-heading">

              <div>

                <span class="editor-label">
                  01
                </span>

                <h3>
                  Article Builder
                </h3>

                <p class="small">
                  Build your article page by page.
                  Each page can contain up to 5 paragraphs.
                </p>

              </div>

            </div>

            <div class="article-pages"></div>

            <div class="article-card-footer">

              <button
                type="button"
                class="add-page-btn article-add-page-btn"
              >
                <span>＋</span>
                Add Page
              </button>

            </div>

          </section>


          <!-- =================================================
               GAME EDITOR
          ================================================== -->

          <section class="editor-subsection game-editor-section">

            <div class="editor-subsection-heading">

              <div>

                <span class="editor-label">
                  02
                </span>

                <h3>
                  Game Editor
                </h3>

                <p class="small">
                  Add interactive games that appear
                  after a selected article page.
                </p>

              </div>

            </div>

            <div class="game-list"></div>

            <button
              type="button"
              class="secondary-btn add-game-btn"
            >
              ＋ Add Game
            </button>

          </section>


          <!-- =================================================
               QUIZ EDITOR
          ================================================== -->

          <section class="editor-subsection quiz-editor-section">

            <div class="editor-subsection-heading">

              <div>

                <span class="editor-label">
                  03
                </span>

                <h3>
                  Quiz Editor
                </h3>

                <p class="small">
                  Each article must have exactly
                  5 questions with 4 choices each.
                </p>

              </div>

            </div>

            <div class="quiz-list"></div>

          </section>


          <!-- =================================================
               SAVE
          ================================================== -->

          <section class="editor-save-section">

            <button
              type="button"
              class="save-article-btn primary-btn"
            >
              Save Article
            </button>

            <div class="article-save-status"></div>

          </section>

        `;

        const pagesContainer =
          articleCard.querySelector(
            ".article-pages"
          );

        const gameList =
          articleCard.querySelector(
            ".game-list"
          );

        const quizList =
          articleCard.querySelector(
            ".quiz-list"
          );

        const pageCountLabel =
          articleCard.querySelector(
            ".article-page-count"
          );

        const saveStatus =
          articleCard.querySelector(
            ".article-save-status"
          );


        // =====================================================
        // PAGE OPTIONS
        // =====================================================

        function pageOptions(
          selectedPage
        ) {

          return pages
            .map(
              (
                page,
                index
              ) => {

                const number =
                  index + 1;

                return `
                  <option
                    value="${number}"
                    ${
                      Number(
                        selectedPage
                      ) === number
                        ? "selected"
                        : ""
                    }
                  >
                    Page ${number}
                  </option>
                `;

              }
            )
            .join("");

        }


        // =====================================================
        // RENDER PAGES
        // =====================================================

        function renderPages() {

          pagesContainer.innerHTML =
            "";

          pages.forEach(
            (
              page,
              pageIndex
            ) => {

              page.pageNumber =
                pageIndex + 1;

              const pageCard =
                document.createElement(
                  "section"
                );

              pageCard.className =
                "article-page-card";

              pageCard.innerHTML = `

                <div class="page-card-header">

                  <div>

                    <span class="page-kicker">
                      ARTICLE PAGE
                    </span>

                    <h4>
                      Page ${
                        pageIndex + 1
                      }
                    </h4>

                  </div>

                  ${
                    pages.length > 2
                      ? `
                        <button
                          type="button"
                          class="remove-page-btn"
                        >
                          Remove Page
                        </button>
                      `
                      : ""
                  }

                </div>

                <div class="page-paragraphs"></div>

                <div class="page-card-footer">

                  <button
                    type="button"
                    class="add-paragraph-btn"
                    ${
                      page.paragraphs.length >= 5
                        ? "disabled"
                        : ""
                    }
                  >
                    <span>＋</span>
                    Add Paragraph
                  </button>

                  ${
                    page.paragraphs.length >= 5
                      ? `
                        <small class="paragraph-limit">
                          Maximum of 5 paragraphs on this page.
                        </small>
                      `
                      : ""
                  }

                </div>

              `;

              const paragraphContainer =
                pageCard.querySelector(
                  ".page-paragraphs"
                );


              // ===========================================
              // PARAGRAPHS
              // ===========================================

              page.paragraphs.forEach(
                (
                  paragraph,
                  paragraphIndex
                ) => {

                  const paragraphRow =
                    document.createElement(
                      "div"
                    );

                  paragraphRow.className =
                    "article-paragraph";

                  paragraphRow.innerHTML = `

                    <div class="paragraph-number">
                      ${
                        paragraphIndex + 1
                      }
                    </div>

                    <textarea
                      class="paragraph-input"
                      rows="5"
                      placeholder="Write paragraph ${
                        paragraphIndex + 1
                      }..."
                    ></textarea>

                    <button
                      type="button"
                      class="remove-paragraph-btn"
                      title="Remove paragraph"
                    >
                      ×
                    </button>

                  `;

                  const textarea =
                    paragraphRow.querySelector(
                      ".paragraph-input"
                    );

                  textarea.value =
                    paragraph;

                  textarea.addEventListener(
                    "input",
                    () => {

                      page.paragraphs[
                        paragraphIndex
                      ] =
                        textarea.value;

                    }
                  );

                  paragraphRow
                    .querySelector(
                      ".remove-paragraph-btn"
                    )
                    .addEventListener(
                      "click",
                      () => {

                        page.paragraphs.splice(
                          paragraphIndex,
                          1
                        );

                        renderPages();

                      }
                    );

                  paragraphContainer.appendChild(
                    paragraphRow
                  );

                }
              );


              // ===========================================
              // ADD PARAGRAPH
              // ===========================================

              const addParagraphButton =
                pageCard.querySelector(
                  ".add-paragraph-btn"
                );

              addParagraphButton.addEventListener(
                "click",
                () => {

                  if (
                    page.paragraphs.length >= 5
                  ) {
                    return;
                  }

                  page.paragraphs.push("");

                  renderPages();

                }
              );


              // ===========================================
              // REMOVE PAGE
              // ===========================================

              const removePageButton =
                pageCard.querySelector(
                  ".remove-page-btn"
                );

              if (
                removePageButton
              ) {

                removePageButton.addEventListener(
                  "click",
                  () => {

                    if (
                      pages.length <= 2
                    ) {

                      alert(
                        "An article must have at least 2 pages."
                      );

                      return;
                    }

                    const confirmed =
                      confirm(
                        `Remove Page ${
                          pageIndex + 1
                        }?`
                      );

                    if (!confirmed) {
                      return;
                    }

                    pages.splice(
                      pageIndex,
                      1
                    );

                    // Fix games that were attached
                    // to the removed page.
                    games.forEach(
                      game => {

                        if (
                          Number(
                            game.afterPage
                          ) ===
                          pageIndex + 1
                        ) {

                          game.afterPage =
                            Math.max(
                              1,
                              Math.min(
                                pageIndex,
                                pages.length
                              )
                            );

                        } else if (
                          Number(
                            game.afterPage
                          ) >
                          pageIndex + 1
                        ) {

                          game.afterPage =
                            Number(
                              game.afterPage
                            ) - 1;

                        }

                      }
                    );

                    renderPages();
                    renderGames();

                  }
                );

              }

              pagesContainer.appendChild(
                pageCard
              );

            }
          );

          pageCountLabel.textContent =
            `${pages.length} pages`;

        }


        // =====================================================
        // GAME HELPERS
        // =====================================================

        function gameTypeLabel(
          type
        ) {

          if (
            type ===
            "fourPics"
          ) {
            return "4 Pics 1 Word";
          }

          if (
            type ===
            "crossword"
          ) {
            return "Crossword";
          }

          return "Jumbled Words";

        }


        function renderCrosswordWords(
          game,
          wordsContainer
        ) {

          wordsContainer.innerHTML =
            "";

          if (
            !Array.isArray(
              game.words
            )
          ) {
            game.words = [];
          }

          game.words.forEach(
            (
              word,
              wordIndex
            ) => {

              const row =
                document.createElement(
                  "div"
                );

              row.className =
                "crossword-word-item";

              row.innerHTML = `

                <div class="editor-item-heading">

                  <strong>
                    Word ${
                      wordIndex + 1
                    }
                  </strong>

                  <button
                    type="button"
                    class="remove-crossword-word-btn secondary-btn"
                  >
                    Remove
                  </button>

                </div>

                <div class="editor-question-grid">

                  <div class="form-group">

                    <label>
                      Answer
                    </label>

                    <input
                      type="text"
                      class="crossword-answer"
                      placeholder="Example: MEDIA"
                    >

                  </div>

                  <div class="form-group">

                    <label>
                      Clue
                    </label>

                    <input
                      type="text"
                      class="crossword-clue"
                      placeholder="Clue for this word"
                    >

                  </div>

                </div>

                <div class="editor-question-grid">

                  <div class="form-group">

                    <label>
                      Starting Row
                    </label>

                    <input
                      type="number"
                      min="1"
                      class="crossword-row"
                    >

                  </div>

                  <div class="form-group">

                    <label>
                      Starting Column
                    </label>

                    <input
                      type="number"
                      min="1"
                      class="crossword-column"
                    >

                  </div>

                  <div class="form-group">

                    <label>
                      Direction
                    </label>

                    <select class="crossword-direction">

                      <option value="across">
                        Across
                      </option>

                      <option value="down">
                        Down
                      </option>

                    </select>

                  </div>

                </div>

              `;

              const answerInput =
                row.querySelector(
                  ".crossword-answer"
                );

              const clueInput =
                row.querySelector(
                  ".crossword-clue"
                );

              const rowInput =
                row.querySelector(
                  ".crossword-row"
                );

              const columnInput =
                row.querySelector(
                  ".crossword-column"
                );

              const directionInput =
                row.querySelector(
                  ".crossword-direction"
                );

              answerInput.value =
                word.answer || "";

              clueInput.value =
                word.clue || "";

              rowInput.value =
                word.row || 1;

              columnInput.value =
                word.column || 1;

              directionInput.value =
                word.direction ===
                "down"
                  ? "down"
                  : "across";


              answerInput.addEventListener(
                "input",
                () => {
                  word.answer =
                    answerInput.value;
                }
              );

              clueInput.addEventListener(
                "input",
                () => {
                  word.clue =
                    clueInput.value;
                }
              );

              rowInput.addEventListener(
                "input",
                () => {
                  word.row =
                    Number(
                      rowInput.value
                    );
                }
              );

              columnInput.addEventListener(
                "input",
                () => {
                  word.column =
                    Number(
                      columnInput.value
                    );
                }
              );

              directionInput.addEventListener(
                "change",
                () => {
                  word.direction =
                    directionInput.value;
                }
              );


              row.querySelector(
                ".remove-crossword-word-btn"
              ).addEventListener(
                "click",
                () => {

                  game.words.splice(
                    wordIndex,
                    1
                  );

                  renderGames();

                }
              );


              wordsContainer.appendChild(
                row
              );

            }
          );

        }


        // =====================================================
        // RENDER GAMES
        // =====================================================

        function renderGames() {

          gameList.innerHTML =
            "";

          if (
            games.length === 0
          ) {

            gameList.innerHTML = `
              <div class="notice">
                No games added yet.
                Click "Add Game" to add an interactive game.
              </div>
            `;

            return;
          }

          games.forEach(
            (
              game,
              gameIndex
            ) => {

              const gameCard =
                document.createElement(
                  "div"
                );

              gameCard.className =
                "game-editor-card";

              gameCard.innerHTML = `

                <div class="editor-item-heading">

                  <div>

                    <span class="editor-label">
                      GAME ${
                        gameIndex + 1
                      }
                    </span>

                    <h4>
                      ${escapeHTML(
                        gameTypeLabel(
                          game.type
                        )
                      )}
                    </h4>

                  </div>

                  <button
                    type="button"
                    class="remove-game-btn secondary-btn"
                  >
                    Remove Game
                  </button>

                </div>


                <div class="editor-question-grid">

                  <div class="form-group">

                    <label>
                      Game Type
                    </label>

                    <select
                      class="game-type-select"
                    >

                      <option
                        value="jumbled"
                        ${
                          game.type ===
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
                          game.type ===
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
                          game.type ===
                          "crossword"
                            ? "selected"
                            : ""
                        }
                      >
                        Crossword
                      </option>

                    </select>

                  </div>

                  <div class="form-group">

                    <label>
                      Show After
                    </label>

                    <select
                      class="game-after-page"
                    >
                      ${pageOptions(
                        game.afterPage
                      )}
                    </select>

                  </div>

                </div>

                <div class="game-specific-editor"></div>

              `;

              const specificEditor =
                gameCard.querySelector(
                  ".game-specific-editor"
                );


              // =============================================
              // GAME TYPE CHANGE
              // =============================================

              gameCard
                .querySelector(
                  ".game-type-select"
                )
                .addEventListener(
                  "change",
                  event => {

                    game.type =
                      event.target.value;

                    if (
                      game.type ===
                      "jumbled"
                    ) {

                      game.answer =
                        game.answer || "";

                      game.scrambled =
                        game.scrambled || "";

                    }

                    if (
                      game.type ===
                      "fourPics"
                    ) {

                      game.answer =
                        game.answer || "";

                      game.images =
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

                      while (
                        game.images.length <
                        4
                      ) {
                        game.images.push("");
                      }

                    }

                    if (
                      game.type ===
                      "crossword"
                    ) {

                      game.size =
                        Number(
                          game.size || 8
                        );

                      game.words =
                        Array.isArray(
                          game.words
                        )
                          ? game.words
                          : [];

                    }

                    renderGames();

                  }
                );


              // =============================================
              // AFTER PAGE CHANGE
              // =============================================

              gameCard
                .querySelector(
                  ".game-after-page"
                )
                .addEventListener(
                  "change",
                  event => {

                    game.afterPage =
                      Number(
                        event.target.value
                      );

                  }
                );


              // =============================================
              // REMOVE GAME
              // =============================================

              gameCard
                .querySelector(
                  ".remove-game-btn"
                )
                .addEventListener(
                  "click",
                  () => {

                    const confirmed =
                      confirm(
                        "Remove this game?"
                      );

                    if (!confirmed) {
                      return;
                    }

                    games.splice(
                      gameIndex,
                      1
                    );

                    renderGames();

                  }
                );


              // =============================================
              // JUMBLED WORDS
              // =============================================

              if (
                game.type ===
                "jumbled"
              ) {

                specificEditor.innerHTML = `

                  <div class="game-specific-box">

                    <h4>
                      Jumbled Words Settings
                    </h4>

                    <div class="editor-question-grid">

                      <div class="form-group">

                        <label>
                          Correct Answer
                        </label>

                        <input
                          type="text"
                          class="jumbled-answer"
                          placeholder="Example: COMMUNICATION"
                        >

                      </div>

                      <div class="form-group">

                        <label>
                          Scrambled Letters
                        </label>

                        <input
                          type="text"
                          class="jumbled-scrambled"
                          placeholder="Example: N I O C A M M T U C O N I"
                        >

                      </div>

                    </div>

                  </div>

                `;

                const answer =
                  specificEditor.querySelector(
                    ".jumbled-answer"
                  );

                const scrambled =
                  specificEditor.querySelector(
                    ".jumbled-scrambled"
                  );

                answer.value =
                  game.answer || "";

                scrambled.value =
                  game.scrambled || "";

                answer.addEventListener(
                  "input",
                  () => {
                    game.answer =
                      answer.value;
                  }
                );

                scrambled.addEventListener(
                  "input",
                  () => {
                    game.scrambled =
                      scrambled.value;
                  }
                );

              }


              // =============================================
              // 4 PICS 1 WORD
              // =============================================

              if (
                game.type ===
                "fourPics"
              ) {

                if (
                  !Array.isArray(
                    game.images
                  )
                ) {
                  game.images =
                    ["", "", "", ""];
                }

                while (
                  game.images.length <
                  4
                ) {
                  game.images.push("");
                }

                specificEditor.innerHTML = `

                  <div class="game-specific-box">

                    <h4>
                      4 Pics 1 Word Settings
                    </h4>

                    <div class="editor-question-grid">

                      <div class="form-group">

                        <label>
                          Image 1 URL
                        </label>

                        <input
                          type="url"
                          class="four-pics-image"
                          data-index="0"
                          placeholder="https://..."
                        >

                      </div>

                      <div class="form-group">

                        <label>
                          Image 2 URL
                        </label>

                        <input
                          type="url"
                          class="four-pics-image"
                          data-index="1"
                          placeholder="https://..."
                        >

                      </div>

                      <div class="form-group">

                        <label>
                          Image 3 URL
                        </label>

                        <input
                          type="url"
                          class="four-pics-image"
                          data-index="2"
                          placeholder="https://..."
                        >

                      </div>

                      <div class="form-group">

                        <label>
                          Image 4 URL
                        </label>

                        <input
                          type="url"
                          class="four-pics-image"
                          data-index="3"
                          placeholder="https://..."
                        >

                      </div>

                    </div>

                    <div class="form-group">

                      <label>
                        Correct Answer
                      </label>

                      <input
                        type="text"
                        class="four-pics-answer"
                        placeholder="Example: JOURNALISM"
                      >

                    </div>

                  </div>

                `;

                specificEditor
                  .querySelectorAll(
                    ".four-pics-image"
                  )
                  .forEach(
                    input => {

                      const index =
                        Number(
                          input.dataset.index
                        );

                      input.value =
                        game.images[
                          index
                        ] || "";

                      input.addEventListener(
                        "input",
                        () => {

                          game.images[
                            index
                          ] =
                            input.value;

                        }
                      );

                    }
                  );

                const answer =
                  specificEditor.querySelector(
                    ".four-pics-answer"
                  );

                answer.value =
                  game.answer || "";

                answer.addEventListener(
                  "input",
                  () => {

                    game.answer =
                      answer.value;

                  }
                );

              }


              // =============================================
              // CROSSWORD
              // =============================================

              if (
                game.type ===
                "crossword"
              ) {

                if (
                  !game.size
                ) {
                  game.size = 8;
                }

                if (
                  !Array.isArray(
                    game.words
                  )
                ) {
                  game.words = [];
                }

                specificEditor.innerHTML = `

                  <div class="game-specific-box">

                    <h4>
                      Crossword Settings
                    </h4>

                    <p class="small">
                      Create the crossword by adding
                      words, clues, starting positions,
                      and directions.
                    </p>

                    <div class="form-group">

                      <label>
                        Grid Size
                      </label>

                      <input
                        type="number"
                        class="crossword-size"
                        min="3"
                        max="20"
                        value="${escapeAttr(
                          game.size
                        )}"
                      >

                      <small class="small">
                        Recommended: 8 × 8
                      </small>

                    </div>

                    <div class="crossword-words">

                    </div>

                    <button
                      type="button"
                      class="secondary-btn add-crossword-word-btn"
                    >
                      ＋ Add Crossword Word
                    </button>

                  </div>

                `;

                const sizeInput =
                  specificEditor.querySelector(
                    ".crossword-size"
                  );

                sizeInput.addEventListener(
                  "input",
                  () => {

                    let value =
                      Number(
                        sizeInput.value
                      );

                    if (
                      !Number.isFinite(
                        value
                      )
                    ) {
                      value = 8;
                    }

                    value =
                      Math.max(
                        3,
                        Math.min(
                          20,
                          value
                        )
                      );

                    game.size =
                      value;

                  }
                );

                const wordsContainer =
                  specificEditor.querySelector(
                    ".crossword-words"
                  );

                renderCrosswordWords(
                  game,
                  wordsContainer
                );

                specificEditor
                  .querySelector(
                    ".add-crossword-word-btn"
                  )
                  .addEventListener(
                    "click",
                    () => {

                      game.words.push({

                        answer:
                          "",

                        clue:
                          "",

                        row:
                          1,

                        column:
                          1,

                        direction:
                          "across"

                      });

                      renderGames();

                    }
                  );

              }

              gameList.appendChild(
                gameCard
              );

            }
          );

        }


        // =====================================================
        // ADD PAGE
        // =====================================================

        articleCard
          .querySelector(
            ".article-add-page-btn"
          )
          .addEventListener(
            "click",
            () => {

              pages.push({

                pageNumber:
                  pages.length + 1,

                paragraphs: []

              });

              renderPages();

              renderGames();

            }
          );


        // =====================================================
        // ADD GAME
        // =====================================================

        articleCard
          .querySelector(
            ".add-game-btn"
          )
          .addEventListener(
            "click",
            () => {

              games.push({

                type:
                  "jumbled",

                afterPage:
                  1,

                answer:
                  "",

                scrambled:
                  ""

              });

              renderGames();

            }
          );


        // =====================================================
        // RENDER QUIZ
        // =====================================================

        function renderQuiz() {

          quizList.innerHTML =
            "";

          questions.forEach(
            (
              question,
              questionIndex
            ) => {

              const questionCard =
                document.createElement(
                  "div"
                );

              questionCard.className =
                "quiz-question-card";

              questionCard.innerHTML = `

                <div class="editor-item-heading">

                  <div>

                    <span class="editor-label">
                      QUESTION ${
                        questionIndex + 1
                      }
                    </span>

                    <h4>
                      Quiz Question ${
                        questionIndex + 1
                      }
                    </h4>

                  </div>

                </div>

                <div class="form-group">

                  <label>
                    Question
                  </label>

                  <textarea
                    class="quiz-question-input"
                    rows="3"
                    placeholder="Write the question here..."
                  ></textarea>

                </div>

                <div class="quiz-choices-grid">

                  <div class="form-group">

                    <label>
                      Choice A
                    </label>

                    <input
                      type="text"
                      class="quiz-choice"
                      data-choice="0"
                    >

                  </div>

                  <div class="form-group">

                    <label>
                      Choice B
                    </label>

                    <input
                      type="text"
                      class="quiz-choice"
                      data-choice="1"
                    >

                  </div>

                  <div class="form-group">

                    <label>
                      Choice C
                    </label>

                    <input
                      type="text"
                      class="quiz-choice"
                      data-choice="2"
                    >

                  </div>

                  <div class="form-group">

                    <label>
                      Choice D
                    </label>

                    <input
                      type="text"
                      class="quiz-choice"
                      data-choice="3"
                    >

                  </div>

                </div>

                <div class="form-group">

                  <label>
                    Correct Answer
                  </label>

                  <select
                    class="quiz-correct-answer"
                  >

                    <option value="0">
                      Choice A
                    </option>

                    <option value="1">
                      Choice B
                    </option>

                    <option value="2">
                      Choice C
                    </option>

                    <option value="3">
                      Choice D
                    </option>

                  </select>

                </div>

              `;


              const questionInput =
                questionCard.querySelector(
                  ".quiz-question-input"
                );

              questionInput.value =
                question.text || "";

              questionInput.addEventListener(
                "input",
                () => {

                  question.text =
                    questionInput.value;

                }
              );


              questionCard
                .querySelectorAll(
                  ".quiz-choice"
                )
                .forEach(
                  input => {

                    const index =
                      Number(
                        input.dataset.choice
                      );

                    input.value =
                      question.choices[
                        index
                      ] || "";

                    input.addEventListener(
                      "input",
                      () => {

                        question.choices[
                          index
                        ] =
                          input.value;

                      }
                    );

                  }
                );


              const correctSelect =
                questionCard.querySelector(
                  ".quiz-correct-answer"
                );

              correctSelect.value =
                String(
                  question.correct
                );

              correctSelect.addEventListener(
                "change",
                () => {

                  question.correct =
                    Number(
                      correctSelect.value
                    );

                }
              );


              quizList.appendChild(
                questionCard
              );

            }
          );

        }


        // =====================================================
        // SAVE EVERYTHING
        // =====================================================

        articleCard
          .querySelector(
            ".save-article-btn"
          )
          .addEventListener(
            "click",
            async () => {

              try {

                saveStatus.innerHTML = `
                  <div class="notice">
                    Saving article, games, and quiz...
                  </div>
                `;


                // =========================================
                // CLEAN PAGES
                // =========================================

                const cleanedPages =
                  pages.map(
                    (
                      page,
                      index
                    ) => ({

                      pageNumber:
                        index + 1,

                      paragraphs:
                        page.paragraphs
                          .map(
                            paragraph =>
                              String(
                                paragraph ?? ""
                              ).trim()
                          )

                    })
                  );


                // =========================================
                // VALIDATE ARTICLE
                // =========================================

                const totalParagraphs =
                  cleanedPages.reduce(
                    (
                      total,
                      page
                    ) =>
                      total +
                      page.paragraphs.filter(
                        paragraph =>
                          paragraph.length >
                          0
                      ).length,
                    0
                  );

                if (
                  totalParagraphs ===
                  0
                ) {

                  saveStatus.innerHTML =
                    errorBox(
                      "Please add at least one paragraph before saving."
                    );

                  return;
                }


                // =========================================
                // CLEAN GAMES
                // =========================================

                const cleanedGames =
                  games.map(
                    game => {

                      const afterPage =
                        Math.max(
                          1,
                          Math.min(
                            pages.length,
                            Number(
                              game.afterPage ||
                              1
                            )
                          )
                        );


                      // -------------------------------
                      // JUMBLED
                      // -------------------------------

                      if (
                        game.type ===
                        "jumbled"
                      ) {

                        const answer =
                          String(
                            game.answer ||
                            ""
                          ).trim();

                        const scrambled =
                          String(
                            game.scrambled ||
                            ""
                          ).trim();

                        if (
                          !answer
                        ) {

                          throw new Error(
                            `Game ${
                              games.indexOf(
                                game
                              ) + 1
                            }: Jumbled Words needs a correct answer.`
                          );

                        }

                        if (
                          !scrambled
                        ) {

                          throw new Error(
                            `Game ${
                              games.indexOf(
                                game
                              ) + 1
                            }: Jumbled Words needs scrambled letters.`
                          );

                        }

                        return {

                          type:
                            "jumbled",

                          afterPage,

                          answer,

                          scrambled

                        };

                      }


                      // -------------------------------
                      // 4 PICS
                      // -------------------------------

                      if (
                        game.type ===
                        "fourPics"
                      ) {

                        const images =
                          Array.isArray(
                            game.images
                          )
                            ? game.images
                                .slice(
                                  0,
                                  4
                                )
                                .map(
                                  image =>
                                    String(
                                      image ||
                                      ""
                                    ).trim()
                                )
                            : [];

                        while (
                          images.length <
                          4
                        ) {
                          images.push("");
                        }

                        if (
                          images.some(
                            image =>
                              !image
                          )
                        ) {

                          throw new Error(
                            `Game ${
                              games.indexOf(
                                game
                              ) + 1
                            }: 4 Pics 1 Word needs four image URLs.`
                          );

                        }

                        const answer =
                          String(
                            game.answer ||
                            ""
                          ).trim();

                        if (
                          !answer
                        ) {

                          throw new Error(
                            `Game ${
                              games.indexOf(
                                game
                              ) + 1
                            }: 4 Pics 1 Word needs a correct answer.`
                          );

                        }

                        return {

                          type:
                            "fourPics",

                          afterPage,

                          images,

                          answer

                        };

                      }


                      // -------------------------------
                      // CROSSWORD
                      // -------------------------------

                      if (
                        game.type ===
                        "crossword"
                      ) {

                        const size =
                          Math.max(
                            3,
                            Math.min(
                              20,
                              Number(
                                game.size ||
                                8
                              )
                            )
                          );

                        if (
                          !Array.isArray(
                            game.words
                          ) ||
                          game.words.length ===
                          0
                        ) {

                          throw new Error(
                            `Game ${
                              games.indexOf(
                                game
                              ) + 1
                            }: Crossword needs at least one word.`
                          );

                        }

                        const words =
                          game.words.map(
                            word => {

                              const answer =
                                String(
                                  word.answer ||
                                  ""
                                )
                                  .trim()
                                  .toUpperCase();

                              const clue =
                                String(
                                  word.clue ||
                                  ""
                                ).trim();

                              const row =
                                Number(
                                  word.row ||
                                  1
                                );

                              const column =
                                Number(
                                  word.column ||
                                  1
                                );

                              const direction =
                                word.direction ===
                                "down"
                                  ? "down"
                                  : "across";


                              if (
                                !answer
                              ) {

                                throw new Error(
                                  "Every Crossword word needs an answer."
                                );

                              }

                              if (
                                !clue
                              ) {

                                throw new Error(
                                  `Crossword word "${answer}" needs a clue.`
                                );

                              }


                              if (
                                !Number.isFinite(
                                  row
                                ) ||
                                !Number.isFinite(
                                  column
                                ) ||
                                row < 1 ||
                                column < 1
                              ) {

                                throw new Error(
                                  `Crossword word "${answer}" has an invalid starting position.`
                                );

                              }


                              // Make sure the word
                              // fits inside the grid.
                              if (
                                direction ===
                                "across"
                              ) {

                                if (
                                  column +
                                    answer.length -
                                    1 >
                                  size
                                ) {

                                  throw new Error(
                                    `Crossword word "${answer}" does not fit across the ${size}×${size} grid.`
                                  );

                                }

                              } else {

                                if (
                                  row +
                                    answer.length -
                                    1 >
                                  size
                                ) {

                                  throw new Error(
                                    `Crossword word "${answer}" does not fit down the ${size}×${size} grid.`
                                  );

                                }

                              }


                              return {

                                answer,

                                clue,

                                row,

                                column,

                                direction

                              };

                            }
                          );


                        return {

                          type:
                            "crossword",

                          afterPage,

                          size,

                          words

                        };

                      }


                      throw new Error(
                        "Unknown game type."
                      );

                    }
                  );


                // =========================================
                // CLEAN QUIZ
                // =========================================

                const cleanedQuestions =
                  questions.map(
                    (
                      question,
                      questionIndex
                    ) => {

                      const text =
                        String(
                          question.text ||
                          ""
                        ).trim();

                      const choices =
                        question.choices
                          .map(
                            choice =>
                              String(
                                choice ||
                                ""
                              ).trim()
                          );


                      if (
                        !text
                      ) {

                        throw new Error(
                          `Quiz Question ${
                            questionIndex + 1
                          } needs a question.`
                        );

                      }


                      if (
                        choices.length !==
                        4 ||
                        choices.some(
                          choice =>
                            !choice
                        )
                      ) {

                        throw new Error(
                          `Quiz Question ${
                            questionIndex + 1
                          } must have four choices.`
                        );

                      }


                      const correct =
                        Number(
                          question.correct
                        );


                      if (
                        ![
                          0,
                          1,
                          2,
                          3
                        ].includes(
                          correct
                        )
                      ) {

                        throw new Error(
                          `Quiz Question ${
                            questionIndex + 1
                          } has an invalid correct answer.`
                        );

                      }


                      return {

                        text,

                        choices,

                        correct

                      };

                    }
                  );


                // =========================================
                // FLATTEN ARTICLE
                // =========================================

                const flattenedParagraphs =
                  cleanedPages.flatMap(
                    page =>
                      page.paragraphs.filter(
                        paragraph =>
                          paragraph.length >
                          0
                      )
                  );


                // =========================================
                // FIRESTORE SAVE
                // =========================================

                await updateDoc(
                  doc(
                    db,
                    "articles",
                    article.id
                  ),
                  {

                    pages:
                      cleanedPages,

                    paragraphs:
                      flattenedParagraphs,

                    body:
                      flattenedParagraphs.join(
                        "\n\n"
                      ),

                    games:
                      cleanedGames,

                    questions:
                      cleanedQuestions,

                    updatedAt:
                      serverTimestamp()

                  }
                );


                // =========================================
                // SUCCESS
                // =========================================

                saveStatus.innerHTML = `
                  <div class="save-success">
                    ✓ Article, games, and quiz saved successfully.
                  </div>
                `;

                setTimeout(
                  () => {

                    saveStatus.innerHTML =
                      "";

                  },
                  4000
                );

              } catch (error) {

                console.error(
                  "Failed to save article:",
                  error
                );

                saveStatus.innerHTML =
                  errorBox(
                    error.message ||
                    "Failed to save article. Please try again."
                  );

              }

            }
          );


        // =====================================================
        // INITIAL RENDER
        // =====================================================

        articleList.appendChild(
          articleCard
        );

        renderPages();
        renderGames();
        renderQuiz();

      }
    );

  } catch (error) {

    console.error(
      "Article / Game / Quiz Editor error:",
      error
    );

    articleList.innerHTML = `
      <div class="error">
        Unable to load the articles.
        Please check your Firestore connection.
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

      if (
        existing.exists()
      ) {

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
          .sort(
            (a, b) =>
              String(
                a.code
              ).localeCompare(
                String(
                  b.code
                )
              )
          )
          .map(
            code => `
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
            `
          )
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

      link.href =
        url;

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
