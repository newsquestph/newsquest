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
  const container = document.querySelector("#dashboard-content");

  if (!container) return;

  container.innerHTML = `
    <section class="editor-workspace">

      <div class="editor-intro">
        <div class="editor-eyebrow">Editorial Workspace</div>

        <h2>Article Builder</h2>

        <p>
          Build your article page by page. Each page can contain up to
          <strong>5 paragraphs</strong>.
        </p>

        <div class="editor-rules">
          <span>Minimum 2 pages</span>
          <span>Maximum 5 paragraphs per page</span>
        </div>
      </div>

      <div id="article-editor-list"></div>

    </section>
  `;

  const articleList =
    document.querySelector("#article-editor-list");

  /*
   * =========================================================
   * LOAD ARTICLES
   * =========================================================
   */

  const articlesSnapshot = await getDocs(
    collection(db, "articles")
  );

  const articles = [];

  articlesSnapshot.forEach((docSnap) => {
    articles.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  if (!articles.length) {
    articleList.innerHTML = `
      <div class="empty-editor-state">
        <p>No articles found.</p>
      </div>
    `;

    return;
  }

  /*
   * =========================================================
   * CONVERT OLD ARTICLE DATA TO PAGES
   * =========================================================
   */

  function normalizePages(article) {

    /*
     * New page structure
     */
    if (
      Array.isArray(article.pages) &&
      article.pages.length >= 2
    ) {
      return article.pages.map((page, index) => ({
        pageNumber: index + 1,
        paragraphs: Array.isArray(page.paragraphs)
          ? page.paragraphs
              .map(p => String(p || ""))
              .slice(0, 5)
          : []
      }));
    }

    /*
     * Old paragraph structure
     */
    let oldParagraphs = [];

    if (Array.isArray(article.paragraphs)) {

      oldParagraphs = article.paragraphs
        .map(p => String(p || ""));

    } else if (Array.isArray(article.sections)) {

      oldParagraphs = article.sections.flatMap(section => {

        if (!Array.isArray(section.paragraphs)) {
          return [];
        }

        return section.paragraphs
          .map(p => String(p || ""));
      });
    }

    /*
     * Convert old paragraphs into
     * maximum 5 paragraphs per page.
     */
    const pages = [];

    for (let i = 0; i < oldParagraphs.length; i += 5) {

      pages.push({
        pageNumber: pages.length + 1,
        paragraphs: oldParagraphs.slice(i, i + 5)
      });
    }

    /*
     * Always maintain minimum 2 pages.
     */
    while (pages.length < 2) {

      pages.push({
        pageNumber: pages.length + 1,
        paragraphs: []
      });
    }

    return pages;
  }

  /*
   * =========================================================
   * RENDER EACH ARTICLE
   * =========================================================
   */

  articles.forEach((article) => {

    const pages = normalizePages(article);

    const articleCard =
      document.createElement("article");

    articleCard.className =
      "article-editor-card";

    articleCard.dataset.articleId =
      article.id;

    articleCard.innerHTML = `
      <div class="article-editor-heading">

        <div>
          <span class="editor-label">
            ARTICLE
          </span>

          <h3>
            ${escapeHtml(
              article.title || "Untitled Article"
            )}
          </h3>
        </div>

        <span class="article-page-count">
          ${pages.length} pages
        </span>

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

        <button
          type="button"
          class="save-article-btn"
        >
          Save Article
        </button>

      </div>

      <div class="article-save-status"></div>
    `;

    const pagesContainer =
      articleCard.querySelector(
        ".article-pages"
      );

    const pageCountLabel =
      articleCard.querySelector(
        ".article-page-count"
      );

    const saveStatus =
      articleCard.querySelector(
        ".article-save-status"
      );

    /*
     * =========================================================
     * RENDER PAGES
     * =========================================================
     */

    function renderPages() {

      pagesContainer.innerHTML = "";

      pages.forEach((page, pageIndex) => {

        page.pageNumber =
          pageIndex + 1;

        const pageCard =
          document.createElement("section");

        pageCard.className =
          "article-page-card";

        pageCard.dataset.pageIndex =
          pageIndex;

        pageCard.innerHTML = `
          <div class="page-card-header">

            <div>
              <span class="page-kicker">
                ARTICLE PAGE
              </span>

              <h4>
                Page ${pageIndex + 1}
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

        /*
         * =====================================================
         * RENDER PARAGRAPHS
         * =====================================================
         */

        page.paragraphs.forEach(
          (paragraph, paragraphIndex) => {

            const paragraphRow =
              document.createElement("div");

            paragraphRow.className =
              "article-paragraph";

            paragraphRow.innerHTML = `
              <div class="paragraph-number">
                ${paragraphIndex + 1}
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
                ] = textarea.value;

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

        /*
         * =====================================================
         * ADD PARAGRAPH
         * =====================================================
         */

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

        /*
         * =====================================================
         * REMOVE PAGE
         * =====================================================
         */

        const removePageButton =
          pageCard.querySelector(
            ".remove-page-btn"
          );

        if (removePageButton) {

          removePageButton.addEventListener(
            "click",
            () => {

              if (pages.length <= 2) {

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

              pages.forEach(
                (item, index) => {
                  item.pageNumber =
                    index + 1;
                }
              );

              renderPages();
            }
          );
        }

        pagesContainer.appendChild(
          pageCard
        );
      });

      pageCountLabel.textContent =
        `${pages.length} pages`;
    }

    /*
     * =========================================================
     * ADD PAGE
     * =========================================================
     */

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
        }
      );

    /*
     * =========================================================
     * SAVE ARTICLE
     * =========================================================
     */

    articleCard
      .querySelector(
        ".save-article-btn"
      )
      .addEventListener(
        "click",
        async () => {

          try {

            /*
             * Clean paragraphs but preserve
             * empty pages.
             */
            const cleanedPages =
              pages.map(
                (page, index) => ({

                  pageNumber:
                    index + 1,

                  paragraphs:
                    page.paragraphs
                      .map(
                        paragraph =>
                          String(
                            paragraph || ""
                          ).trim()
                      )
                      .filter(Boolean)

                })
              );

            /*
             * At least one paragraph
             * must exist somewhere.
             */
            const totalParagraphs =
              cleanedPages.reduce(
                (
                  total,
                  page
                ) =>
                  total +
                  page.paragraphs.length,
                0
              );

            if (totalParagraphs === 0) {

              alert(
                "Please add at least one paragraph before saving."
              );

              return;
            }

            /*
             * Flatten pages for compatibility
             * with the existing reader.
             */
            const flattenedParagraphs =
              cleanedPages.flatMap(
                page =>
                  page.paragraphs
              );

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

                updatedAt:
                  serverTimestamp()

              }
            );

            saveStatus.innerHTML = `
              <div class="save-success">
                Article saved successfully.
              </div>
            `;

            setTimeout(
              () => {
                saveStatus.innerHTML = "";
              },
              3000
            );

          } catch (error) {

            console.error(
              "Failed to save article:",
              error
            );

            alert(
              "Failed to save article. Please try again."
            );
          }
        }
      );

    /*
     * Add completed article card
     */
    articleList.appendChild(
      articleCard
    );

    /*
     * Initial render
     */
    renderPages();
  });
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
