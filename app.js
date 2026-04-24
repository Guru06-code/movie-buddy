const discoveryPool = [
  { id: "rec-1", title: "Decision to Leave", year: "2022", type: "movie", meta: "Mystery, Romance • Park Chan-wook", summary: "A detective investigating a mountain death becomes entangled with the victim's enigmatic widow.", poster: "linear-gradient(135deg, #203239, #607274)", tags: ["mystery", "romance", "thriller", "korean"] },
  { id: "rec-2", title: "Past Lives", year: "2023", type: "movie", meta: "Romance, Drama • Celine Song", summary: "Two childhood friends reconnect across decades and continents in a delicate story about timing and longing.", poster: "linear-gradient(135deg, #b06c49, #2d1e18)", tags: ["romance", "drama", "tender"] },
  { id: "rec-3", title: "Memories of Murder", year: "2003", type: "movie", meta: "Crime, Drama • Bong Joon-ho", summary: "In provincial Korea, detectives chase a serial killer with few clues and little certainty.", poster: "linear-gradient(135deg, #3b2f2f, #0d0a0a)", tags: ["crime", "thriller", "drama", "korean"] },
  { id: "rec-4", title: "Portrait of a Lady on Fire", year: "2019", type: "movie", meta: "Romance, Drama • Celine Sciamma", summary: "A painter and her subject form an intense bond on an isolated island off eighteenth-century France.", poster: "linear-gradient(135deg, #e6a15f, #5a2f1b)", tags: ["romance", "drama", "french", "art"] },
  { id: "rec-5", title: "Shoplifters", year: "2018", type: "movie", meta: "Drama, Crime • Hirokazu Kore-eda", summary: "An unconventional family on the margins survives by petty theft until a fragile arrangement is tested.", poster: "linear-gradient(135deg, #78685d, #2f2a28)", tags: ["drama", "family", "japanese"] },
  { id: "rec-6", title: "Your Name.", year: "2016", type: "movie", meta: "Animation, Fantasy • Makoto Shinkai", summary: "Two teenagers mysteriously swap bodies and form a bond across distance and time.", poster: "linear-gradient(135deg, #5cb7d4, #274156)", tags: ["animation", "fantasy", "romance", "japanese"] },
  { id: "rec-7", title: "The Farewell", year: "2019", type: "movie", meta: "Comedy, Drama • Lulu Wang", summary: "A Chinese-American writer returns to Changchun under the guise of a family wedding to say goodbye to her grandmother.", poster: "linear-gradient(135deg, #f0bf72, #6c4d2c)", tags: ["drama", "comedy", "family"] },
  { id: "rec-8", title: "The Secret in Their Eyes", year: "2009", type: "movie", meta: "Mystery, Drama • Juan Jose Campanella", summary: "A retired legal counselor revisits an unresolved murder case and the feelings it never left behind.", poster: "linear-gradient(135deg, #4f566b, #221f29)", tags: ["mystery", "drama", "crime", "spanish"] },
  { id: "rec-9", title: "RRR", year: "2022", type: "movie", meta: "Action, Drama • S. S. Rajamouli", summary: "Two revolutionaries forge a legendary friendship in a maximalist, high-energy anti-colonial epic.", poster: "linear-gradient(135deg, #c26a38, #4b1f10)", tags: ["action", "drama", "indian", "epic"] },
  { id: "rec-10", title: "Perfect Days", year: "2023", type: "movie", meta: "Drama • Wim Wenders", summary: "A Tokyo toilet cleaner finds deep meaning in routine, music, and moments of quiet observation.", poster: "linear-gradient(135deg, #708c7f, #29352f)", tags: ["drama", "quiet", "japanese"] },
  { id: "rec-11", title: "Burning", year: "2018", type: "movie", meta: "Mystery, Drama • Lee Chang-dong", summary: "A young man becomes obsessed with a wealthy stranger whose stories may hide something sinister.", poster: "linear-gradient(135deg, #d27b52, #281211)", tags: ["mystery", "thriller", "drama", "korean"] },
  { id: "rec-12", title: "The Banshees of Inisherin", year: "2022", type: "movie", meta: "Comedy, Drama • Martin McDonagh", summary: "An abruptly ended friendship spirals into absurd and painful consequences on a remote Irish island.", poster: "linear-gradient(135deg, #a9996a, #2d2617)", tags: ["drama", "comedy", "friendship"] },
  { id: "rec-13", title: "Drive My Car", year: "2021", type: "movie", meta: "Drama • Ryusuke Hamaguchi", summary: "A theater director processes grief and connection while staging Uncle Vanya in Hiroshima.", poster: "linear-gradient(135deg, #b53c35, #241312)", tags: ["drama", "japanese", "quiet"] },
  { id: "rec-14", title: "Minari", year: "2020", type: "movie", meta: "Drama • Lee Isaac Chung", summary: "A Korean-American family pursues a fragile dream while trying to grow roots in rural Arkansas.", poster: "linear-gradient(135deg, #9ea564, #36402c)", tags: ["drama", "family", "korean"] },
  { id: "rec-15", title: "Dil Se..", year: "1998", type: "movie", meta: "Romance, Thriller • Mani Ratnam", summary: "A radio journalist falls for a mysterious woman in a love story shadowed by politics and violence.", poster: "linear-gradient(135deg, #aa3a3a, #290f18)", tags: ["romance", "thriller", "indian"] },
  { id: "rec-16", title: "Amores Perros", year: "2000", type: "movie", meta: "Drama, Thriller • Alejandro Gonzalez Inarritu", summary: "Three stories collide in Mexico City after a brutal car crash changes each life forever.", poster: "linear-gradient(135deg, #6b5047, #14100f)", tags: ["drama", "thriller", "spanish"] },
  { id: "rec-17", title: "Monster", year: "2023", type: "movie", meta: "Drama, Mystery • Hirokazu Kore-eda", summary: "A school incident is retold from different perspectives until a more fragile truth appears.", poster: "linear-gradient(135deg, #7c809b, #252837)", tags: ["drama", "mystery", "japanese"] },
  { id: "rec-18", title: "The Worst Person in the World", year: "2021", type: "movie", meta: "Romance, Comedy • Joachim Trier", summary: "A young woman's relationships and ambitions unfold in sharply observed chapters of uncertainty.", poster: "linear-gradient(135deg, #e1a26c, #493022)", tags: ["romance", "comedy", "drama"] },
];

const popularSearchPool = [
  { id: "pop-1", title: "Interstellar", year: "2014", type: "movie", meta: "Adventure, Drama, Sci-Fi • Christopher Nolan", summary: "A team travels through a wormhole in space in an attempt to ensure humanity's survival.", poster: "linear-gradient(135deg, #7689a9, #161b28)", tags: ["space", "sci-fi", "nolan", "epic"], popularityWeight: 100 },
  { id: "pop-2", title: "Inception", year: "2010", type: "movie", meta: "Action, Sci-Fi, Thriller • Christopher Nolan", summary: "A skilled thief enters dreams to steal secrets and is offered one last job.", poster: "linear-gradient(135deg, #5d6b82, #171d27)", tags: ["dream", "heist", "nolan", "mind-bending"], popularityWeight: 96 },
  { id: "pop-3", title: "The Dark Knight", year: "2008", type: "movie", meta: "Action, Crime, Drama • Christopher Nolan", summary: "Batman faces the Joker as Gotham descends into chaos.", poster: "linear-gradient(135deg, #4f5667, #11151d)", tags: ["batman", "joker", "nolan", "superhero"], popularityWeight: 94 },
  { id: "pop-4", title: "Oppenheimer", year: "2023", type: "movie", meta: "Biography, Drama, History • Christopher Nolan", summary: "The story of J. Robert Oppenheimer and the creation of the atomic bomb.", poster: "linear-gradient(135deg, #c97845, #21120f)", tags: ["history", "biography", "nolan", "drama"], popularityWeight: 91 },
  { id: "pop-5", title: "Dune", year: "2021", type: "movie", meta: "Action, Adventure, Drama • Denis Villeneuve", summary: "Paul Atreides begins a journey that will reshape the fate of Arrakis.", poster: "linear-gradient(135deg, #bb8f5e, #26160f)", tags: ["sci-fi", "desert", "epic", "villeneuve"], popularityWeight: 90 },
  { id: "pop-6", title: "Avatar", year: "2009", type: "movie", meta: "Action, Adventure, Fantasy • James Cameron", summary: "A marine on Pandora is torn between following orders and protecting his new world.", poster: "linear-gradient(135deg, #4f9db7, #102331)", tags: ["sci-fi", "fantasy", "pandora", "epic"], popularityWeight: 88 },
  { id: "pop-7", title: "Avengers: Endgame", year: "2019", type: "movie", meta: "Action, Adventure, Drama • Anthony Russo, Joe Russo", summary: "The Avengers assemble for one final stand to reverse the Blip.", poster: "linear-gradient(135deg, #6c5d8d, #1a1121)", tags: ["marvel", "superhero", "epic", "action"], popularityWeight: 89 },
  { id: "pop-8", title: "Titanic", year: "1997", type: "movie", meta: "Drama, Romance • James Cameron", summary: "A sweeping romance unfolds aboard the ill-fated RMS Titanic.", poster: "linear-gradient(135deg, #5f8fb3, #1a2430)", tags: ["romance", "classic", "disaster", "epic"], popularityWeight: 87 },
  { id: "pop-9", title: "Fight Club", year: "1999", type: "movie", meta: "Drama • David Fincher", summary: "An insomniac office worker forms an underground fight club with a charismatic soap maker.", poster: "linear-gradient(135deg, #c9878d, #2a1113)", tags: ["fincher", "cult", "drama", "psychological"], popularityWeight: 85 },
  { id: "pop-10", title: "Forrest Gump", year: "1994", type: "movie", meta: "Drama, Romance • Robert Zemeckis", summary: "A simple man witnesses and influences extraordinary moments in American history.", poster: "linear-gradient(135deg, #cad0d8, #3e4751)", tags: ["classic", "drama", "romance", "popular"], popularityWeight: 84 },
  { id: "pop-11", title: "The Shawshank Redemption", year: "1994", type: "movie", meta: "Drama • Frank Darabont", summary: "Two imprisoned men bond over decades while hoping for redemption.", poster: "linear-gradient(135deg, #8b6e5d, #1f1713)", tags: ["classic", "prison", "drama", "popular"], popularityWeight: 93 },
  { id: "pop-12", title: "Parasite", year: "2019", type: "movie", meta: "Drama, Thriller • Bong Joon-ho", summary: "A poor family slowly infiltrates a wealthy household in a sharp class satire.", poster: "linear-gradient(135deg, #57756d, #131716)", tags: ["korean", "thriller", "drama", "popular"], popularityWeight: 86 },
  { id: "pop-13", title: "Breaking Bad", year: "2008", type: "series", meta: "Crime, Drama, Thriller • Vince Gilligan", summary: "A chemistry teacher turned meth producer descends deeper into crime.", poster: "linear-gradient(135deg, #6d8a3d, #18210d)", tags: ["crime", "drama", "series", "popular"], popularityWeight: 97 },
  { id: "pop-14", title: "Stranger Things", year: "2016", type: "series", meta: "Drama, Fantasy, Horror • The Duffer Brothers", summary: "A group of kids uncover a supernatural mystery in small-town Indiana.", poster: "linear-gradient(135deg, #913a30, #180d10)", tags: ["series", "horror", "fantasy", "popular"], popularityWeight: 92 },
  { id: "pop-15", title: "Game of Thrones", year: "2011", type: "series", meta: "Action, Adventure, Drama • David Benioff, D. B. Weiss", summary: "Noble families vie for control of the Iron Throne in a brutal fantasy world.", poster: "linear-gradient(135deg, #59606a, #13161b)", tags: ["series", "fantasy", "epic", "popular"], popularityWeight: 95 },
  { id: "pop-16", title: "Dark", year: "2017", type: "series", meta: "Crime, Drama, Mystery • Baran bo Odar, Jantje Friese", summary: "A missing child case unravels a time-travel mystery across generations.", poster: "linear-gradient(135deg, #5f6a60, #121512)", tags: ["series", "mystery", "german", "popular"], popularityWeight: 90 },
  { id: "pop-17", title: "The Office", year: "2005", type: "series", meta: "Comedy • Greg Daniels", summary: "A mockumentary follows the everyday lives of office employees in Scranton.", poster: "linear-gradient(135deg, #c7c3b4, #37404a)", tags: ["series", "comedy", "popular", "sitcom"], popularityWeight: 89 },
  { id: "pop-18", title: "Friends", year: "1994", type: "series", meta: "Comedy, Romance • David Crane, Marta Kauffman", summary: "Six friends navigate love, life, and work in New York City.", poster: "linear-gradient(135deg, #f0bf7f, #6e452b)", tags: ["series", "comedy", "sitcom", "popular"], popularityWeight: 88 },
];

const searchSuggestionPool = dedupeMoviesByNormalizedTitle([...popularSearchPool, ...discoveryPool]);
const posterFallbackCache = new Map();
const posterFallbackRequests = new Map();

function createInitialPushState() {
  const supported = typeof window !== "undefined"
    && "serviceWorker" in navigator
    && "PushManager" in window
    && "Notification" in window;
  return {
    supported,
    permission: supported ? Notification.permission : "unsupported",
    subscribed: false,
    syncing: false,
    publicKey: "",
    statusMessage: supported ? "Browser push is checking availability." : "Browser push is not supported in this browser.",
  };
}

const state = {
  authMode: "welcome",
  resetMethod: "email",
  pendingReset: null,
  profiles: {},
  currentUser: null,
  activeTab: "home",
  query: "",
  searchResults: [],
  friendSearchResults: [],
  userDirectory: {},
  isLoading: false,
  hasSearched: false,
  errorMessage: "",
  searchSource: "live",
  topbarFriendPreviewResults: [],
  requestId: 0,
  reviewTarget: null,
  providerConfig: createEmptyProviderConfig(),
  searchPanelOpen: false,
  homeData: createEmptyHomeData(),
  homeDataLoading: false,
  homeDataRequestId: 0,
  libraryEditor: {
    open: false,
    collection: "wishlist",
  },
  push: createInitialPushState(),
};

const authShell = document.querySelector("#auth-shell");
const appShell = document.querySelector("#app-shell");
const loginToggle = document.querySelector("#show-login");
const signupToggle = document.querySelector("#show-signup");
const loginForm = document.querySelector("#login-form");
const signupForm = document.querySelector("#signup-form");
const resetForm = document.querySelector("#reset-form");
const socialAuth = document.querySelector("#social-auth");
const authMessage = document.querySelector("#auth-message");
const showResetButton = document.querySelector("#show-reset");
const cancelResetButton = document.querySelector("#cancel-reset");
const sendOtpButton = document.querySelector("#send-otp");
const resetViaEmailButton = document.querySelector("#reset-via-email");
const resetViaPhoneButton = document.querySelector("#reset-via-phone");
const resetIdentifierLabel = document.querySelector("#reset-identifier-label");
const resetIdentifierInput = document.querySelector("#reset-identifier");
const socialButtons = Array.from(document.querySelectorAll(".social-button"));

const currentUserName = document.querySelector("#current-user-name");
const currentUserId = document.querySelector("#current-user-id");
const logoutButton = document.querySelector("#logout-button");
const topbarSearchShell = document.querySelector("#topbar-search-shell");
const topbarFriendSearchShell = document.querySelector("#topbar-friend-search-shell");
const topbarFriendSearchInput = document.querySelector("#topbar-friend-search-input");
const topbarFriendResults = document.querySelector("#topbar-friend-results");
const searchStage = document.querySelector("#search-stage");
const closeSearchButton = document.querySelector("#close-search-button");
const friendsCount = document.querySelector("#friends-count");
const notificationsCount = document.querySelector("#notifications-count");
const watchedCount = document.querySelector("#watched-count");
const firstRunGuide = document.querySelector("#first-run-guide");
const dismissFirstRunGuideButton = document.querySelector("#dismiss-first-run-guide");

const onboardingShell = document.querySelector("#onboarding-shell");
const homeShell = document.querySelector("#home-shell");
const movieGrid = document.querySelector("#movie-grid");
const wishlistList = document.querySelector("#wishlist-list");
const searchInput = document.querySelector("#catalog-search-input");
const resultsCount = document.querySelector("#results-count");
const wishlistTotal = document.querySelector("#wishlist-total");
const searchStatus = document.querySelector("#search-status");
const wishlistGuidance = document.querySelector("#wishlist-guidance");
const saveWishlistButton = document.querySelector("#save-wishlist-button");

const homeTabs = document.querySelector("#home-tabs");
const likedGrid = document.querySelector("#liked-grid");
const currentlyWatchingGrid = document.querySelector("#currently-watching-grid");
const currentlyWatchingSeriesGrid = document.querySelector("#currently-watching-series-grid");
const homeWishlistGrid = document.querySelector("#home-wishlist-grid");
const homeAiRecommendationGrid = document.querySelector("#home-ai-recommendation-grid");
const upcomingGrid = document.querySelector("#upcoming-grid");
const upcomingSeriesGrid = document.querySelector("#upcoming-series-grid");
const trendingGrid = document.querySelector("#trending-grid");
const trendingSeriesGrid = document.querySelector("#trending-series-grid");
const anticipatedGrid = document.querySelector("#anticipated-grid");
const homeRequestList = document.querySelector("#home-request-list");
const homeNotificationList = document.querySelector("#home-notification-list");
const aiRecommendationGrid = document.querySelector("#ai-recommendation-grid");
const friendRecommendationGrid = document.querySelector("#friend-recommendation-grid");
const tasteSignalList = document.querySelector("#taste-signal-list");
const refreshAiButton = document.querySelector("#refresh-ai-button");
const openLibraryEditorButton = document.querySelector("#open-library-editor-button");
const homeSaveStarterButton = document.querySelector("#home-save-starter-button");
const pendingRequestBanner = document.querySelector("#pending-request-banner");
const pendingRequestTitle = document.querySelector("#pending-request-title");
const pendingRequestText = document.querySelector("#pending-request-text");
const pendingRequestAcceptButton = document.querySelector("#pending-request-accept-button");
const pendingRequestDeclineButton = document.querySelector("#pending-request-decline-button");
const openReminderSettingsButton = document.querySelector("#open-reminder-settings-button");
const friendSearchInput = document.querySelector("#friend-search-input");
const friendSearchResults = document.querySelector("#friend-search-results");
const friendList = document.querySelector("#friend-list");
const recommendFriendSelect = document.querySelector("#recommend-friend-select");
const recommendMovieSelect = document.querySelector("#recommend-movie-select");
const recommendNoteInput = document.querySelector("#recommend-note-input");
const sendRecommendationButton = document.querySelector("#send-recommendation-button");
const incomingRequestList = document.querySelector("#incoming-request-list");
const notificationList = document.querySelector("#notification-list");

const movieCardTemplate = document.querySelector("#movie-card-template");
const wishlistTemplate = document.querySelector("#wishlist-item-template");
const socialItemTemplate = document.querySelector("#social-item-template");

const reviewModalOverlay = document.querySelector("#review-modal-overlay");
const reviewForm = document.querySelector("#review-form");
const reviewTargetTitle = document.querySelector("#review-target-title");
const closeReviewModalButton = document.querySelector("#close-review-modal");
const skipReviewButton = document.querySelector("#skip-review-button");
const saveRatingButton = document.querySelector("#save-rating-button");
const starRatingGroup = document.querySelector("#star-rating-group");
const reviewTextInput = document.querySelector("#review-text-input");
const libraryEditorOverlay = document.querySelector("#library-editor-overlay");
const closeLibraryEditorButton = document.querySelector("#close-library-editor");
const libraryEditorToolbar = document.querySelector("#library-editor-toolbar");
const libraryEditorSectionTitle = document.querySelector("#library-editor-section-title");
const libraryEditorSectionMeta = document.querySelector("#library-editor-section-meta");
const libraryEditorList = document.querySelector("#library-editor-list");
const reminderPreferencesForm = document.querySelector("#reminder-preferences-form");
const reminderEnabledInput = document.querySelector("#reminder-enabled-input");
const reminderLeadSelect = document.querySelector("#reminder-lead-select");
const reminderHourSelect = document.querySelector("#reminder-hour-select");
const reminderTimezoneInput = document.querySelector("#reminder-timezone-input");
const reminderPreferencesSummary = document.querySelector("#reminder-preferences-summary");
const browserPushStatus = document.querySelector("#browser-push-status");
const browserPushButton = document.querySelector("#browser-push-button");

let pendingProfileSync = Promise.resolve();
let sessionRefreshIntervalId = 0;
let sessionRefreshUserId = "";
let pendingRating = 0;

render();
void bootstrapApplication();

function setAuthMessage(text, type = "error") {
  if (!authMessage) return;
  authMessage.textContent = text;
  authMessage.dataset.type = text ? type : "";
}

const LS_USERS_KEY = "mb_users";
const LS_SESSION_KEY = "mb_session";

function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem(LS_USERS_KEY) || "[]"); } catch { return []; }
}

function saveLocalUsers(users) {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

function findLocalUser(email, password) {
  return getLocalUsers().find(u => u.email === email && u.password === password) || null;
}

function saveLocalUser(user) {
  const users = getLocalUsers().filter(u => u.email !== user.email);
  users.push(user);
  saveLocalUsers(users);
}

function setLocalSession(userId) {
  localStorage.setItem(LS_SESSION_KEY, userId);
}

function getLocalSession() {
  return localStorage.getItem(LS_SESSION_KEY) || null;
}

function clearLocalSession() {
  localStorage.removeItem(LS_SESSION_KEY);
}

function applyLocalSession(user) {
  state.currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    handle: user.handle || `mb-${user.id.slice(-6)}`,
  };
  if (!state.profiles[user.id]) {
    state.profiles[user.id] = createEmptyProfile();
  }
  render();
}

document.addEventListener("click", (event) => {
  const toggle = event.target.closest(".pw-toggle");
  if (!toggle) return;
  const input = document.getElementById(toggle.dataset.target || "");
  if (!input) return;
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  toggle.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
  toggle.querySelector(".pw-show")?.classList.toggle("hidden", !isPassword);
  toggle.querySelector(".pw-hide")?.classList.toggle("hidden", isPassword);
});

searchInput?.addEventListener("input", handleSearchInput);
closeSearchButton?.addEventListener("click", handleCloseSearch);
loginToggle?.addEventListener("click", () => setAuthMode("login"));
signupToggle?.addEventListener("click", () => setAuthMode("signup"));
document.querySelector("#go-to-signin")?.addEventListener("click", () => setAuthMode("login"));
document.querySelector("#go-to-signup")?.addEventListener("click", () => setAuthMode("signup"));
document.querySelector("#signin-back")?.addEventListener("click", () => setAuthMode("welcome"));
document.querySelector("#signup-back")?.addEventListener("click", () => setAuthMode("welcome"));
document.querySelector("#signin-to-signup")?.addEventListener("click", () => setAuthMode("signup"));
document.querySelector("#signup-to-signin")?.addEventListener("click", () => setAuthMode("login"));
loginForm?.addEventListener("submit", handleLoginSubmit);
signupForm?.addEventListener("submit", handleSignupSubmit);
resetForm?.addEventListener("submit", handleResetSubmit);
showResetButton?.addEventListener("click", () => setAuthMode("reset"));
cancelResetButton?.addEventListener("click", handleCancelReset);
sendOtpButton?.addEventListener("click", handleSendOtp);
resetViaEmailButton?.addEventListener("click", () => setResetMethod("email"));
resetViaPhoneButton?.addEventListener("click", () => setResetMethod("phone"));
socialButtons.forEach((button) => {
  button.addEventListener("click", () => handleSocialLogin(button.dataset.provider || "provider"));
});
logoutButton?.addEventListener("click", handleLogout);
saveWishlistButton?.addEventListener("click", handleSaveWishlist);
homeSaveStarterButton?.addEventListener("click", handleSaveWishlist);
homeTabs?.addEventListener("click", handleTabClick);
homeTabs?.addEventListener("keydown", handleTabKeydown);
refreshAiButton?.addEventListener("click", handleRefreshAiRecommendations);
openLibraryEditorButton?.addEventListener("click", () => openLibraryEditor("wishlist"));
openReminderSettingsButton?.addEventListener("click", () => openLibraryEditor("releaseReminders"));
pendingRequestAcceptButton?.addEventListener("click", () => respondToPendingRequest(true));
pendingRequestDeclineButton?.addEventListener("click", () => respondToPendingRequest(false));
friendSearchInput?.addEventListener("input", handleFriendSearchInput);
topbarFriendSearchInput?.addEventListener("input", handleTopbarFriendSearchInput);
sendRecommendationButton?.addEventListener("click", handleSendRecommendation);
reviewForm?.addEventListener("submit", handleReviewSubmit);
skipReviewButton?.addEventListener("click", handleSkipReview);
closeReviewModalButton?.addEventListener("click", closeReviewModal);
starRatingGroup?.addEventListener("click", handleStarClick);
reviewModalOverlay?.addEventListener("click", (event) => {
  if (event.target === reviewModalOverlay) {
    closeReviewModal();
  }
});
closeLibraryEditorButton?.addEventListener("click", closeLibraryEditor);
libraryEditorOverlay?.addEventListener("click", (event) => {
  if (event.target === libraryEditorOverlay) {
    closeLibraryEditor();
  }
});
libraryEditorToolbar?.addEventListener("click", handleLibraryEditorToolbarClick);
reminderPreferencesForm?.addEventListener("submit", handleReminderPreferencesSubmit);
browserPushButton?.addEventListener("click", handleBrowserPushToggle);
dismissFirstRunGuideButton?.addEventListener("click", dismissFirstRunGuide);
document.addEventListener("click", handleDocumentClick);

function render() {
  renderAuthState();
  renderAppState();
}

function createEmptyHomeData() {
  return {
    source: "unavailable",
    message: "Live home data is temporarily unavailable.",
    sections: {
      trending: [],
      anticipated: [],
      upcoming: [],
    },
    library: {
      liked: [],
      currentlyWatching: [],
      wishlist: [],
      releaseReminders: [],
      aiRecommendations: [],
    },
  };
}

function renderAuthState() {
  const isAuthenticated = Boolean(state.currentUser);

  authShell?.classList.toggle("hidden", isAuthenticated);
  appShell?.classList.toggle("hidden", !isAuthenticated);

  document.getElementById("auth-welcome")?.classList.toggle("hidden", state.authMode !== "welcome");
  document.getElementById("auth-signin")?.classList.toggle("hidden", state.authMode !== "login");
  document.getElementById("auth-signup")?.classList.toggle("hidden", state.authMode !== "signup");
  document.getElementById("auth-reset-screen")?.classList.toggle("hidden", state.authMode !== "reset");

  resetViaEmailButton?.classList.toggle("active", state.resetMethod === "email");
  resetViaPhoneButton?.classList.toggle("active", state.resetMethod === "phone");

  if (resetIdentifierLabel) {
    resetIdentifierLabel.textContent = state.resetMethod === "email" ? "Email" : "Phone number";
  }
  if (resetIdentifierInput) {
    resetIdentifierInput.type = state.resetMethod === "email" ? "email" : "tel";
    resetIdentifierInput.autocomplete = state.resetMethod === "email" ? "email" : "tel";
  }

  socialButtons.forEach((button) => {
    const provider = button.dataset.provider || "";
    const providerConfig = getProviderConfig(provider);
    const providerName = provider ? provider[0].toUpperCase() + provider.slice(1) : "Provider";
    button.disabled = false;
    button.classList.toggle("social-button-demo", !providerConfig.configured);
    button.classList.remove("social-button-unavailable");
    button.setAttribute("aria-disabled", "false");
    button.title = providerConfig.configured
      ? `Continue with ${providerName}`
      : `Continue with ${providerName} using demo sign-in until real OAuth is configured.`;
  });
}

function renderAppState() {
  if (!state.currentUser) {
    stopSessionRefreshLoop();
    closeReviewModal();
    closeLibraryEditor();
    return;
  }

  ensureSessionRefreshLoop();

  const profile = getCurrentProfile();
  if (currentUserName) currentUserName.textContent = state.currentUser.name;
  if (currentUserId) currentUserId.textContent = state.currentUser.handle;
  if (friendsCount) friendsCount.textContent = profile.friendIds.length;
  if (notificationsCount) notificationsCount.textContent = profile.notifications.filter((item) => !item.read).length + profile.incomingRequests.length;
  if (watchedCount) watchedCount.textContent = profile.watched.length;
  topbarFriendSearchShell?.classList.remove("hidden");
  homeSaveStarterButton?.classList.add("hidden");
  if (topbarFriendSearchInput && friendSearchInput && topbarFriendSearchInput.value !== friendSearchInput.value) {
    topbarFriendSearchInput.value = friendSearchInput.value;
  }

  onboardingShell?.classList.add("hidden");
  homeShell?.classList.remove("hidden");
  firstRunGuide?.classList.toggle("hidden", !shouldShowFirstRunGuide(profile));

  renderSearchResults();
  renderWishlist();
  renderHomeTabs();
  renderHomeCollections();
  renderAiRecommendations();
  renderFriendRecommendations();
  renderTasteSignals();
  renderFriendSearchResults();
  renderFriendList();
  renderPendingRequestBanner();
  renderRecommendationComposer();
  renderIncomingRequests();
  renderNotifications();
  renderLibraryEditor();

  if (profile.wishlistSaved && !state.homeDataLoading && state.homeDataRequestId === 0) {
    void loadHomeDashboard();
  }
}

function setAuthMode(mode) {
  state.authMode = mode;
  if (mode !== "reset") {
    clearResetFlow();
  }
  setAuthMessage("");
  renderAuthState();
}

function setResetMethod(method) {
  state.resetMethod = method;
  clearResetFlow();
  setAuthMessage("");
  renderAuthState();
}

async function handleSignupSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const name = String(formData.get("name") || "").trim();
  const email = normalizeEmail(formData.get("email"));
  const phone = normalizePhone(formData.get("phone"));
  const password = String(formData.get("password") || "");

  const existing = getLocalUsers().find(u => u.email === email);
  if (existing) {
    setAuthMessage("An account with this email already exists. Try signing in.");
    return;
  }

  const localUser = {
    id: `local-${Date.now()}`,
    name,
    email,
    password,
    handle: `mb-${Math.random().toString(36).slice(2, 8)}`,
  };
  saveLocalUser(localUser);
  setLocalSession(localUser.id);

  try {
    await apiRequest("/api/auth/signup", {
      method: "POST",
      body: { name, email, phone, password },
    });
    const loginPayload = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const serverUser = {
      ...localUser,
      id: loginPayload.user.id,
      handle: loginPayload.user.handle,
    };
    const users = getLocalUsers().filter(u => u.email !== email);
    users.push(serverUser);
    saveLocalUsers(users);
    setLocalSession(serverUser.id);
    signupForm?.reset();
    setAuthMessage("");
    applyServerState(loginPayload);
  } catch {
    signupForm?.reset();
    setAuthMessage("");
    applyLocalSession(localUser);
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");

  const localUser = findLocalUser(email, password);
  if (localUser) {
    loginForm?.reset();
    setAuthMessage("");
    setLocalSession(localUser.id);
    applyLocalSession(localUser);
    return;
  }

  try {
    const payload = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const serverUser = {
      id: payload.user.id,
      name: payload.user.name,
      email,
      password,
      handle: payload.user.handle,
    };
    saveLocalUser(serverUser);
    setLocalSession(serverUser.id);
    loginForm?.reset();
    setAuthMessage("");
    applyServerState(payload);
  } catch (error) {
    setAuthMessage(error.message);
  }
}

function handleSocialLogin(provider) {
  const normalizedProvider = provider.toLowerCase();
  const providerConfig = getProviderConfig(normalizedProvider);

  if (!providerConfig.configured) {
    void startDemoProviderAuth(normalizedProvider);
    return;
  }

  if (normalizedProvider === "google") {
    void startDirectGoogleAuth();
    return;
  }

  if (normalizedProvider === "microsoft") {
    void startDirectMicrosoftAuth();
    return;
  }

  if (normalizedProvider === "apple") {
    void startDirectAppleAuth();
  }
}

async function startDirectGoogleAuth() {
  const providerConfig = getProviderConfig("google");

  if (!providerConfig.clientId) {
    setAuthMessage("Google sign-in is not configured on the server.");
    return;
  }

  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    setAuthMessage("Google Sign-In SDK is not available yet. Refresh and try again.");
    return;
  }

  try {
    setAuthMessage("Waiting for Google authentication...", "info");
    const tokenResponse = await new Promise((resolve, reject) => {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: providerConfig.clientId,
        scope: "openid email profile",
        callback: (response) => {
          if (response?.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          resolve(response);
        },
        error_callback: (error) => {
          reject(error instanceof Error ? error : new Error("Google sign-in failed."));
        },
      });

      tokenClient.requestAccessToken({ prompt: "select_account" });
    });

    const googleUser = await fetchGoogleProfile(tokenResponse.access_token);
    await completeProviderSignIn("google", {
      id: googleUser.sub,
      name: googleUser.name,
      email: normalizeEmail(googleUser.email),
    });
    setAuthMessage("Google authentication completed.", "success");
  } catch (error) {
    setAuthMessage(getAuthErrorMessage(error, "Google"));
  }
}

async function startDirectMicrosoftAuth() {
  const providerConfig = getProviderConfig("microsoft");

  if (!providerConfig.clientId) {
    setAuthMessage("Microsoft sign-in is not configured on the server.");
    return;
  }

  if (!window.msal || !window.msal.PublicClientApplication) {
    setAuthMessage("Microsoft authentication SDK is not available yet. Refresh and try again.");
    return;
  }

  try {
    const msalClient = new window.msal.PublicClientApplication({
      auth: {
        clientId: providerConfig.clientId,
        authority: providerConfig.authority,
        redirectUri: window.location.origin,
      },
      cache: { cacheLocation: "localStorage" },
    });

    if (typeof msalClient.initialize === "function") {
      await msalClient.initialize();
    }

    setAuthMessage("Waiting for Microsoft authentication...", "info");
    const result = await msalClient.loginPopup({
      scopes: ["openid", "profile", "email", "User.Read"],
      prompt: "select_account",
    });

    if (!result?.account) {
      setAuthMessage("Microsoft authentication did not return an account.");
      return;
    }

    completeProviderSignIn("microsoft", {
      id: result.account.homeAccountId || result.account.localAccountId,
      email: normalizeEmail(result.account.username),
      name: result.account.name || result.account.username,
    });
    setAuthMessage("Microsoft authentication completed.", "success");
  } catch (error) {
    setAuthMessage(getAuthErrorMessage(error, "Microsoft"));
  }
}

async function startDirectAppleAuth() {
  const providerConfig = getProviderConfig("apple");

  if (!providerConfig.clientId || !providerConfig.redirectUri) {
    setAuthMessage("Apple sign-in is not configured on the server.");
    return;
  }

  if (!window.AppleID || !window.AppleID.auth) {
    setAuthMessage("Apple authentication SDK is not available yet. Refresh and try again.");
    return;
  }

  try {
    window.AppleID.auth.init({
      clientId: providerConfig.clientId,
      scope: "name email",
      redirectURI: providerConfig.redirectUri,
      state: createRandomState(),
      nonce: createRandomState(),
      usePopup: true,
    });

    setAuthMessage("Waiting for Apple authentication...", "info");
    const response = await window.AppleID.auth.signIn();
    const payload = decodeJwtPayload(response?.authorization?.id_token || "");

    if (!payload) {
      setAuthMessage("Apple authentication did not return usable profile data.");
      return;
    }

    const providedName = response?.user?.name
      ? [response.user.name.firstName, response.user.name.lastName].filter(Boolean).join(" ")
      : payload.email?.split("@")[0] || "Apple User";

    completeProviderSignIn("apple", {
      id: payload.sub,
      name: providedName,
      email: normalizeEmail(payload.email || `apple-${Date.now()}@private.local`),
    });
    setAuthMessage("Apple authentication completed.", "success");
  } catch (error) {
    setAuthMessage(getAuthErrorMessage(error, "Apple"));
  }
}

async function completeProviderSignIn(provider, profile) {
  try {
    const payload = await apiRequest("/api/auth/oauth", {
      method: "POST",
      body: {
        provider,
        providerId: profile.id,
        name: profile.name,
        email: profile.email,
      },
    });
    applyServerState(payload);
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function startDemoProviderAuth(provider) {
  const providerName = formatProviderName(provider);
  const defaultName = `${providerName} User`;
  const defaultEmail = `${provider}-demo@example.com`;
  const name = String(window.prompt(`Enter a name for demo ${providerName} sign-in:`, defaultName) || "").trim();

  if (!name) {
    setAuthMessage(`${providerName} demo sign-in was cancelled.`, "info");
    return;
  }

  const email = normalizeEmail(window.prompt(`Enter an email for demo ${providerName} sign-in:`, defaultEmail));
  if (!email || !email.includes("@")) {
    setAuthMessage(`Enter a valid email to continue with demo ${providerName} sign-in.`);
    return;
  }

  setAuthMessage(`${providerName} demo sign-in is enabled until real OAuth goes live.`, "info");
  await completeProviderSignIn(provider, {
    id: createDemoProviderId(provider, email),
    name,
    email,
  });
}

function createDemoProviderId(provider, email) {
  return `${provider}-demo-${email.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
}

async function fetchGoogleProfile(accessToken) {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.sub || !payload?.email || !payload?.name) {
    throw new Error(payload.error_description || payload.error || "Google authentication did not return a usable profile.");
  }

  return payload;
}

async function handleSendOtp() {
  try {
    const payload = await apiRequest("/api/auth/reset/request", {
      method: "POST",
      body: {
        method: state.resetMethod,
        identifier: getResetIdentifier(),
      },
    });
    state.pendingReset = {
      resetId: payload.resetId,
      otp: payload.previewOtp,
    };
    setAuthMessage(`Dev OTP sent via ${state.resetMethod}: ${payload.previewOtp}. Real delivery can be wired before launch.`, "success");
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function handleResetSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const otp = String(formData.get("otp") || "").trim();
  const nextPassword = String(formData.get("password") || "");

  try {
    const payload = await apiRequest("/api/auth/reset/confirm", {
      method: "POST",
      body: {
        resetId: state.pendingReset?.resetId,
        otp,
        password: nextPassword,
      },
    });
    resetForm?.reset();
    clearResetFlow();
    setAuthMode("login");
    setAuthMessage(payload.message || "Password updated. Sign in with your new password.", "success");
  } catch (error) {
    setAuthMessage(error.message);
  }
}

function handleCancelReset() {
  resetForm?.reset();
  clearResetFlow();
  setAuthMode("login");
}

function signInUser(user) {
  state.currentUser = { id: user.id, name: user.name, email: user.email, handle: user.handle || "mb-user" };
  ensureProfile(user.id);
  state.query = "";
  state.searchResults = [];
  state.friendSearchResults = [];
  state.hasSearched = false;
  state.isLoading = false;
  state.errorMessage = "";
  state.searchSource = "live";
  state.topbarFriendPreviewResults = [];
  state.activeTab = "home";
  state.searchPanelOpen = false;
  state.homeData = createEmptyHomeData();
  state.homeDataLoading = false;
  state.homeDataRequestId = 0;
  if (searchInput) searchInput.value = "";
  render();
}

async function handleLogout() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" }, { allowUnauthorized: true });
  } catch {
    // Ignore logout transport errors and clear the client state anyway.
  }

  state.currentUser = null;
  state.profiles = {};
  state.userDirectory = {};
  state.query = "";
  state.searchResults = [];
  state.friendSearchResults = [];
  state.hasSearched = false;
  state.isLoading = false;
  state.errorMessage = "";
  state.searchSource = "live";
  state.topbarFriendPreviewResults = [];
  state.searchPanelOpen = false;
  state.reviewTarget = null;
  state.homeData = createEmptyHomeData();
  state.homeDataLoading = false;
  state.homeDataRequestId = 0;
  stopSessionRefreshLoop();
  clearLocalSession();
  setAuthMessage("");
  if (friendSearchInput) friendSearchInput.value = "";
  if (topbarFriendSearchInput) {
    topbarFriendSearchInput.value = "";
  }
  if (searchInput) searchInput.value = "";
  setAuthMode("welcome");
  render();
}

function handleSearchInput(event) {
  if (!state.currentUser) {
    return;
  }

  state.query = event.target.value.trim();

  if (state.query.length < 1) {
    debounceSearch.cancel();
    state.requestId += 1;
    state.searchResults = [];
    state.hasSearched = false;
    state.isLoading = false;
    state.errorMessage = "";
    state.searchSource = "live";
    state.searchPanelOpen = false;
    renderSearchResults();
    return;
  }

  state.hasSearched = true;
  state.isLoading = true;
  state.errorMessage = "";
  state.searchSource = "suggested";
  state.searchPanelOpen = true;
  state.searchResults = getInstantSuggestions(state.query);
  renderSearchResults();

  debounceSearch(state.query);
}

function handleCloseSearch() {
  state.query = "";
  state.hasSearched = false;
  state.isLoading = false;
  state.errorMessage = "";
  state.searchSource = "live";
  state.searchResults = [];
  state.searchPanelOpen = false;
  debounceSearch.cancel();
  state.requestId += 1;
  if (searchInput) {
    searchInput.value = "";
  }
  renderSearchResults();
}

function handleSaveWishlist() {
  const profile = getCurrentProfile();

  profile.wishlistSaved = true;
  dismissFirstRunGuide();
  persistProfiles();
  createNotification(state.currentUser.id, {
    type: "system",
    title: "AI recommendations ready",
    message: profile.liked.length > 0
      ? "Your starter wishlist has been saved. Movie Buddy has generated recommendations from the titles you marked as liked."
      : "Your starter wishlist has been saved. Like a few titles to unlock sharper AI recommendations.",
  });
  state.activeTab = "home";
  render();
  void flushProfileSync();
  void loadHomeDashboard(true);
}

function shouldShowFirstRunGuide(profile) {
  return Boolean(state.currentUser && profile && !profile.wishlistSaved && !hasDismissedFirstRunGuide(state.currentUser.id));
}

function getFirstRunGuideStorageKey(userId) {
  return `movie-buddy:first-run-guide:${userId}`;
}

function hasDismissedFirstRunGuide(userId) {
  try {
    return window.localStorage.getItem(getFirstRunGuideStorageKey(userId)) === "1";
  } catch {
    return false;
  }
}

function dismissFirstRunGuide() {
  if (!state.currentUser) {
    return;
  }

  try {
    window.localStorage.setItem(getFirstRunGuideStorageKey(state.currentUser.id), "1");
  } catch {
    // Ignore storage failures and keep the app usable.
  }

  firstRunGuide?.classList.add("hidden");
}

function handleTabClick(event) {
  const button = event.target.closest("[data-tab]");
  if (!button) {
    return;
  }

  state.activeTab = button.dataset.tab;
  renderHomeTabs();

  if (state.activeTab === "activity") {
    void refreshSessionState({ preserveInputs: true });
  }
}

function handleTabKeydown(event) {
  const tabs = Array.from(homeTabs.querySelectorAll(".home-tab"));
  const currentIndex = tabs.findIndex((button) => button.dataset.tab === state.activeTab);
  if (currentIndex === -1) {
    return;
  }

  let nextIndex = currentIndex;
  if (event.key === "ArrowRight") {
    nextIndex = (currentIndex + 1) % tabs.length;
  } else if (event.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = tabs.length - 1;
  } else {
    return;
  }

  event.preventDefault();
  state.activeTab = tabs[nextIndex].dataset.tab;
  renderHomeTabs();
  tabs[nextIndex].focus();
}

function renderHomeTabs() {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const tabs = Array.from(document.querySelectorAll(".home-tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));
  tabs.forEach((button) => {
    const isActive = button.dataset.tab === state.activeTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });
  panels.forEach((panel) => {
    const isActive = panel.id === `tab-${state.activeTab}`;
    panel.classList.toggle("active", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
  });
}

function renderSearchResults() {
  movieGrid.replaceChildren();
  const profile = getCurrentProfile();
  searchStage?.classList.toggle("hidden", !state.searchPanelOpen);

  if (!profile) {
    resultsCount.textContent = "Login required";
    searchStatus.textContent = "Create an account or sign in";
    return;
  }

  if (!state.hasSearched && !state.isLoading) {
    resultsCount.textContent = "No search yet";
    searchStatus.textContent = "Type a movie or series title";
    return;
  }

  if (state.isLoading && state.searchResults.length === 0) {
    resultsCount.textContent = "Searching";
    searchStatus.textContent = `Looking for "${state.query}"`;
    movieGrid.append(createEmptyCard("Searching titles", "Fetching matching titles now."));
    return;
  }

  if (state.errorMessage) {
    resultsCount.textContent = "Search unavailable";
    searchStatus.textContent = "Request failed";
    movieGrid.append(createEmptyCard("Title search is unavailable", state.errorMessage));
    return;
  }

  resultsCount.textContent = `${state.searchResults.length} ${state.searchResults.length === 1 ? "title" : "titles"}`;
  if (state.isLoading) {
    searchStatus.textContent = `Showing quick suggestions for "${state.query}"`;
  } else if (state.searchResults.length > 0) {
    searchStatus.textContent = `${state.searchSource === "live" ? "Popular results" : "Suggestions"} for "${state.query}"`;
  } else {
    searchStatus.textContent = "No matches found";
  }

  state.searchResults.forEach((movie) => {
    movieGrid.append(buildMovieCard(movie, buildLibraryCardOptions(profile, movie, {
      context: movie.releaseLabel || movie.availabilityLabel || "Use wishlist for later, like for AI, and start watching when you are ready.",
      includeWatched: false,
      includeReminder: Boolean(movie.releaseLabel),
    })));
  });

  if (state.searchResults.length === 0) {
    movieGrid.append(createEmptyCard("No matching titles", "Try another title or a more common spelling."));
  }
}

function renderWishlist() {
  wishlistList.replaceChildren();
  const profile = getCurrentProfile();

  if (!profile) {
    wishlistTotal.textContent = "0 saved";
    return;
  }

  wishlistTotal.textContent = `${profile.wishlist.length} saved`;
  wishlistGuidance.textContent = profile.wishlistSaved
    ? "Keep adding freely, but remember: only your liked titles shape AI recommendations now."
    : "Add a few movies while you browse. Once you save the starter shelf, recommendations and social features get more personal.";

  if (profile.wishlist.length === 0) {
    wishlistList.append(createEmptyCard("Wishlist is empty", "Search for a title and add it here when you find something worth saving."));
    return;
  }

  profile.wishlist.forEach((movie) => {
    const node = wishlistTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".wishlist-language").textContent = formatTypeLabel(movie.type);
    node.querySelector(".wishlist-title").textContent = movie.title;
    node.querySelector(".wishlist-meta").textContent = `${movie.year} • ${movie.meta}`;
    node.querySelector(".remove-button").addEventListener("click", () => removeMovieFromWishlist(movie.id));
    wishlistList.append(node);
  });
}

function renderAiRecommendations() {
  aiRecommendationGrid.replaceChildren();
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const AI_THRESHOLD = 3;
  const aiMovies = state.homeData.library.aiRecommendations.length > 0
    ? state.homeData.library.aiRecommendations
    : profile.aiRecommendations;

  if (profile.liked.length < AI_THRESHOLD) {
    aiRecommendationGrid.append(createAiProgressCard(profile.liked.length, AI_THRESHOLD));
    return;
  }

  if (aiMovies.length === 0) {
    aiRecommendationGrid.append(createEmptyCard("No recommendations yet", "Hit Refresh to generate AI picks from your taste anchors."));
    return;
  }

  aiMovies.forEach((movie) => {
    aiRecommendationGrid.append(buildMovieCard(movie, buildLibraryCardOptions(profile, movie, {
      context: "Based only on the genres, moods, and creators inside your liked titles",
      includeWatched: true,
      watchSource: "ai",
    })));
  });
}

function createAiProgressCard(current, needed) {
  const card = document.createElement("div");
  card.className = "ai-progress-card glass-panel";
  const pct = Math.round((current / needed) * 100);
  card.innerHTML = `
    <div class="ai-progress-icon">✦</div>
    <h3 class="ai-progress-title">AI picks unlock at ${needed} taste anchors</h3>
    <p class="ai-progress-body">Rate or like movies to build your taste profile. Start watching a movie and mark it finished to rate it.</p>
    <div class="ai-progress-bar-wrap" role="progressbar" aria-valuenow="${current}" aria-valuemin="0" aria-valuemax="${needed}" aria-label="Taste anchors progress">
      <div class="ai-progress-bar" style="width:${pct}%"></div>
    </div>
    <p class="ai-progress-count">${current} / ${needed} anchors</p>
  `;
  return card;
}

function renderFriendRecommendations() {
  friendRecommendationGrid.replaceChildren();
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const activeRecommendations = profile.friendRecommendationInbox.slice().sort((a, b) => b.createdAt - a.createdAt);

  if (activeRecommendations.length === 0) {
    friendRecommendationGrid.append(createEmptyCard("No friend recommendations yet", "Once your friends accept requests and send picks, they will land here with their names and notes."));
    return;
  }

  activeRecommendations.forEach((item) => {
    const context = `${item.fromUserName} recommended this${item.note ? ` • ${item.note}` : ""}`;
    const statusContext = item.status === "watched" ? `${context} • You marked this as watched` : context;
    friendRecommendationGrid.append(buildMovieCard(item.movie, buildLibraryCardOptions(profile, item.movie, {
      context: statusContext,
      includeWatched: item.status !== "watched",
      onWatched: () => openReviewModal({ source: "friend", movie: item.movie, recommendationId: item.id, fromUserId: item.fromUserId, fromUserName: item.fromUserName }),
    })));
  });
}

function renderTasteSignals() {
  tasteSignalList.replaceChildren();
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const tags = collectTasteSignals(profile);
  if (tags.length === 0) {
    tasteSignalList.append(createSignalItem("Like a few titles to see which genres and moods are driving recommendations."));
    return;
  }

  tags.slice(0, 6).forEach((tag) => {
    tasteSignalList.append(createSignalItem(`${tag.label} • ${tag.count} pick${tag.count === 1 ? "" : "s"}`));
  });
}

function renderHomeCollections() {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const homeData = state.homeData;
  const likedItems = homeData.library.liked.length > 0 ? homeData.library.liked : profile.liked;
  const watchingItems = homeData.library.currentlyWatching.length > 0
    ? homeData.library.currentlyWatching
    : (profile.currentlyWatching.length > 0 ? profile.currentlyWatching : profile.wishlist.slice(0, 10));
  const releaseReminderItems = homeData.library.releaseReminders.length > 0 ? homeData.library.releaseReminders : profile.releaseReminders;
  const releaseRadar = dedupeMovies([...releaseReminderItems, ...(homeData.sections.upcoming || [])]);
  const trendingItems = homeData.sections.trending || [];
  const anticipatedItems = homeData.sections.anticipated || [];
  const splitWatching = splitMoviesByType(watchingItems);
  const splitUpcoming = splitMoviesByType(releaseRadar);
  const splitTrending = splitMoviesByType(trendingItems);
  const splitAnticipated = splitMoviesByType(anticipatedItems);
  const upcomingMovieItems = splitUpcoming.movies.length > 0
    ? splitUpcoming.movies
    : dedupeMovies([...splitAnticipated.movies, ...splitTrending.movies, ...splitMoviesByType(discoveryPool).movies]).slice(0, 6);

  renderMovieCollection(likedGrid, likedItems, (movie) => buildMovieCard(movie, buildLibraryCardOptions(profile, movie, {
    context: "These titles are actively shaping AI recommendations.",
    allowUnlike: true,
    includeReminder: false,
  })), "No liked titles yet", "Mark the titles you truly love with Like for AI so recommendations stop guessing.");

  renderMovieCollection(currentlyWatchingGrid, splitWatching.movies, (movie) => buildMovieCard(movie, buildLibraryCardOptions(profile, movie, {
    context: profile.currentlyWatching.length > 0 ? "Kept in progress until you finish and review it." : "Start from wishlist picks now, then move them into your active watch row.",
    includeWatching: false,
    includeWatched: true,
  })), "No movies yet", "Save or start a movie to keep it visible in your movie row.");

  renderMovieCollection(currentlyWatchingSeriesGrid, splitWatching.series, (movie) => buildMovieCard(movie, buildLibraryCardOptions(profile, movie, {
    context: profile.currentlyWatching.length > 0 ? "Kept in progress until you finish and review it." : "Save a series or start watching it to keep episodes on your radar.",
    includeWatching: false,
    includeWatched: true,
  })), "No series yet", "Your tracked shows will appear here once you add them.");

  renderMovieCollection(upcomingGrid, upcomingMovieItems, (movie) => buildMovieCard(movie, buildLibraryCardOptions(profile, movie, {
    context: movie.releaseLabel || movie.availabilityLabel || "Add a reminder or jump out to OTT search.",
    includeWatched: false,
    includeReminder: true,
  })), "No upcoming movies", state.homeDataLoading ? "Loading upcoming movies now." : "Upcoming movies will appear here.");
  renderMovieCollection(upcomingSeriesGrid, splitUpcoming.series, (movie) => buildMovieCard(movie, buildLibraryCardOptions(profile, movie, {
    context: movie.releaseLabel || movie.availabilityLabel || "Add a reminder or jump out to OTT search.",
    includeWatched: false,
    includeReminder: true,
  })), "No upcoming series", state.homeDataLoading ? "Loading upcoming series now." : "Upcoming series will appear here.");
  renderMovieCollection(trendingGrid, splitTrending.movies, (movie) => buildMovieCard(movie, buildEditorialCardOptions(profile, movie)), "No trending movies", state.homeDataLoading ? "Loading movie trends now." : "Trending movies will appear here.");
  renderMovieCollection(trendingSeriesGrid, splitTrending.series, (movie) => buildMovieCard(movie, buildEditorialCardOptions(profile, movie)), "No trending series", state.homeDataLoading ? "Loading series trends now." : "Trending series will appear here.");
}

function renderPendingRequestBanner() {
  const profile = getCurrentProfile();
  const request = profile?.incomingRequests?.[0] || null;

  pendingRequestBanner?.classList.toggle("hidden", !request);
  if (!request) {
    return;
  }

  if (pendingRequestTitle) {
    pendingRequestTitle.textContent = `${request.fromUserName} wants to connect`;
  }
  if (pendingRequestText) {
    pendingRequestText.textContent = `${request.fromUserHandle} sent you a friend request. Accept it to start sharing movie recommendations.`;
  }
}

function respondToPendingRequest(accept) {
  const profile = getCurrentProfile();
  const request = profile?.incomingRequests?.[0] || null;
  if (!request) {
    return;
  }

  void respondToFriendRequest(request.id, accept);
}

function renderFriendSearchResults() {
  friendSearchResults.replaceChildren();
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  if (!profile.wishlistSaved) {
    friendSearchResults.append(createEmptyCard("Finish one shelf first", "Save your starter wishlist to unlock friend search and recommendation sharing."));
    return;
  }

  const query = friendSearchInput.value.trim().toLowerCase();
  if (!query) {
    friendSearchResults.append(createEmptyCard("Search people", "Use a Movie Buddy user id or display name to find other users and send friend requests."));
    return;
  }

  const results = state.friendSearchResults;

  if (results.length === 0) {
    friendSearchResults.append(createEmptyCard("No users found", "Try another user id or name."));
    return;
  }

  results.forEach((user) => {
    const item = socialItemTemplate.content.firstElementChild.cloneNode(true);
    item.querySelector(".social-kicker").textContent = user.handle;
    item.querySelector(".social-title").textContent = user.name;
    item.querySelector(".social-meta").textContent = getFriendshipStateLabel(profile, user.id);

    const actions = item.querySelector(".social-actions");
    const actionButton = document.createElement("button");
    actionButton.type = "button";
    actionButton.className = profile.friendIds.includes(user.id) ? "secondary-action" : "auth-submit";

    if (profile.friendIds.includes(user.id)) {
      actionButton.textContent = "Already friends";
      actionButton.disabled = true;
    } else if (profile.outgoingRequests.some((request) => request.toUserId === user.id)) {
      actionButton.textContent = "Request sent";
      actionButton.disabled = true;
    } else if (profile.incomingRequests.some((request) => request.fromUserId === user.id)) {
      actionButton.textContent = "Respond in activity";
      actionButton.disabled = true;
    } else {
      actionButton.textContent = "Add friend";
      actionButton.addEventListener("click", () => sendFriendRequest(user.id));
    }

    actions.append(actionButton);
    friendSearchResults.append(item);
  });
}

function renderFriendList() {
  friendList.replaceChildren();
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  if (profile.friendIds.length === 0) {
    friendList.append(createEmptyCard("No friends yet", "Search for another user, send a request, and once they accept you can start recommending movies to each other."));
    return;
  }

  profile.friendIds
    .map(findUserById)
    .filter(Boolean)
    .forEach((user) => {
      const item = socialItemTemplate.content.firstElementChild.cloneNode(true);
      item.querySelector(".social-kicker").textContent = user.handle;
      item.querySelector(".social-title").textContent = user.name;
      item.querySelector(".social-meta").textContent = `${getSentRecommendationCount(user.id)} recommendation${getSentRecommendationCount(user.id) === 1 ? "" : "s"} sent by you`;
      const actions = item.querySelector(".social-actions");
      const status = document.createElement("button");
      status.type = "button";
      status.className = "secondary-action";
      status.textContent = "Connected";
      status.disabled = true;
      actions.append(status);
      friendList.append(item);
    });
}

function renderRecommendationComposer() {
  const profile = getCurrentProfile();
  recommendFriendSelect.replaceChildren();
  recommendMovieSelect.replaceChildren();

  if (!profile) {
    return;
  }

  if (!profile.wishlistSaved) {
    const friendOption = document.createElement("option");
    friendOption.textContent = "Save wishlist to unlock friend sharing";
    recommendFriendSelect.append(friendOption);
    const movieOption = document.createElement("option");
    movieOption.textContent = "Build one shelf first";
    recommendMovieSelect.append(movieOption);
    sendRecommendationButton.disabled = true;
    return;
  }

  if (profile.friendIds.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No accepted friends yet";
    recommendFriendSelect.append(option);
  } else {
    profile.friendIds.map(findUserById).filter(Boolean).forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = `${user.name} • ${user.handle}`;
      recommendFriendSelect.append(option);
    });
  }

  const candidateMovies = dedupeMovies([...profile.wishlist, ...profile.liked, ...profile.currentlyWatching, ...profile.aiRecommendations]);
  if (candidateMovies.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No movies available yet";
    recommendMovieSelect.append(option);
  } else {
    candidateMovies.forEach((movie) => {
      const option = document.createElement("option");
      option.value = movie.id;
      option.textContent = `${movie.title} (${movie.year})`;
      recommendMovieSelect.append(option);
    });
  }

  sendRecommendationButton.disabled = profile.friendIds.length === 0 || candidateMovies.length === 0;
}

function renderIncomingRequests() {
  incomingRequestList.replaceChildren();
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  if (profile.incomingRequests.length === 0) {
    incomingRequestList.append(createEmptyCard("No pending requests", "Friend requests land here. Accepting one unlocks movie recommendations between both users."));
    return;
  }

  profile.incomingRequests.forEach((request) => {
    const item = socialItemTemplate.content.firstElementChild.cloneNode(true);
    item.querySelector(".social-kicker").textContent = "Friend request";
    item.querySelector(".social-title").textContent = request.fromUserName;
    item.querySelector(".social-meta").textContent = `${request.fromUserHandle} wants to connect and start sharing movie recommendations.`;

    const actions = item.querySelector(".social-actions");
    const acceptButton = document.createElement("button");
    acceptButton.type = "button";
    acceptButton.className = "auth-submit";
    acceptButton.textContent = "Accept";
    acceptButton.addEventListener("click", () => respondToFriendRequest(request.id, true));

    const rejectButton = document.createElement("button");
    rejectButton.type = "button";
    rejectButton.className = "secondary-action";
    rejectButton.textContent = "Reject";
    rejectButton.addEventListener("click", () => respondToFriendRequest(request.id, false));

    actions.append(acceptButton, rejectButton);
    incomingRequestList.append(item);
  });
}

function renderNotifications() {
  notificationList.replaceChildren();
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const items = profile.notifications.slice().sort((a, b) => b.createdAt - a.createdAt);
  if (items.length === 0) {
    notificationList.append(createEmptyCard("No notifications yet", "Recommendation updates, request responses, and watched activity will appear here."));
    return;
  }

  items.forEach((notification) => {
    const item = socialItemTemplate.content.firstElementChild.cloneNode(true);
    item.classList.toggle("unread", !notification.read);
    item.querySelector(".social-kicker").textContent = notification.title;
    item.querySelector(".social-title").textContent = formatRelativeTime(notification.createdAt);
    item.querySelector(".social-meta").textContent = notification.message;

    const actions = item.querySelector(".social-actions");
    const readButton = document.createElement("button");
    readButton.type = "button";
    readButton.className = notification.read ? "secondary-action" : "tab-action";
    readButton.textContent = notification.read ? "Read" : "Mark read";
    readButton.disabled = notification.read;
    readButton.addEventListener("click", () => markNotificationRead(notification.id));
    actions.append(readButton);
    notificationList.append(item);
  });
}

function renderIncomingRequestsPreview(container, limit) {
  container.replaceChildren();
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const items = profile.incomingRequests.slice(0, limit);
  if (items.length === 0) {
    container.append(createEmptyCard("No pending requests", "New friend requests will also appear here so they are hard to miss."));
    return;
  }

  items.forEach((request) => {
    const item = socialItemTemplate.content.firstElementChild.cloneNode(true);
    item.querySelector(".social-kicker").textContent = "Friend request";
    item.querySelector(".social-title").textContent = request.fromUserName;
    item.querySelector(".social-meta").textContent = `${request.fromUserHandle} wants to connect and share recommendations.`;

    const actions = item.querySelector(".social-actions");
    const acceptButton = document.createElement("button");
    acceptButton.type = "button";
    acceptButton.className = "auth-submit";
    acceptButton.textContent = "Accept";
    acceptButton.addEventListener("click", () => respondToFriendRequest(request.id, true));

    const rejectButton = document.createElement("button");
    rejectButton.type = "button";
    rejectButton.className = "secondary-action";
    rejectButton.textContent = "Reject";
    rejectButton.addEventListener("click", () => respondToFriendRequest(request.id, false));

    actions.append(acceptButton, rejectButton);
    container.append(item);
  });
}

function renderNotificationsPreview(container, limit) {
  container.replaceChildren();
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const items = profile.notifications.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  if (items.length === 0) {
    container.append(createEmptyCard("No notifications yet", "Accepted requests, watched updates, and reminder saves will appear here."));
    return;
  }

  items.forEach((notification) => {
    const item = socialItemTemplate.content.firstElementChild.cloneNode(true);
    item.classList.toggle("unread", !notification.read);
    item.querySelector(".social-kicker").textContent = notification.title;
    item.querySelector(".social-title").textContent = formatRelativeTime(notification.createdAt);
    item.querySelector(".social-meta").textContent = notification.message;

    const actions = item.querySelector(".social-actions");
    const readButton = document.createElement("button");
    readButton.type = "button";
    readButton.className = notification.read ? "secondary-action" : "tab-action";
    readButton.textContent = notification.read ? "Read" : "Mark read";
    readButton.disabled = notification.read;
    readButton.addEventListener("click", () => markNotificationRead(notification.id));
    actions.append(readButton);
    container.append(item);
  });
}

function renderMovieCollection(container, items, createNode, emptyTitle, emptyMessage) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  if (!items || items.length === 0) {
    container.append(createEmptyCard(emptyTitle, emptyMessage));
    return;
  }

  items.forEach((item) => {
    container.append(createNode(item));
  });
}

function splitMoviesByType(items) {
  return (items || []).reduce((groups, movie) => {
    if (String(movie?.type || "movie").toLowerCase() === "series") {
      groups.series.push(movie);
    } else {
      groups.movies.push(movie);
    }
    return groups;
  }, { movies: [], series: [] });
}

function buildLibraryCardOptions(profile, movie, options = {}) {
  const actions = [];
  const allowUnlike = Boolean(options.allowUnlike);
  const includeWatching = options.includeWatching !== false;
  const includeWatched = options.includeWatched !== false;
  const includeReminder = Boolean(options.includeReminder);
  const watchedSource = options.watchSource || "library";

  actions.push({
    label: isMovieInWishlist(profile, movie.id) ? "In wishlist" : "Wishlist",
    kind: isMovieInWishlist(profile, movie.id) ? "saved" : "primary",
    disabled: isMovieInWishlist(profile, movie.id),
    onClick: () => addMovieToWishlist(movie),
  });

  if (allowUnlike && isMovieLiked(profile, movie.id)) {
    actions.push({
      label: "Unlike",
      kind: "secondary",
      onClick: () => removeMovieFromLiked(movie.id),
    });
  } else {
    actions.push({
      label: isMovieLiked(profile, movie.id) ? "Liked for AI" : "Like for AI",
      kind: isMovieLiked(profile, movie.id) ? "saved" : "secondary",
      disabled: isMovieLiked(profile, movie.id),
      onClick: () => addMovieToLiked(movie),
    });
  }

  if (includeWatching) {
    if (isMovieCurrentlyWatching(profile, movie.id)) {
      actions.push({
        label: "Finished",
        kind: "accent",
        onClick: () => openReviewModal({ source: watchedSource, movie }),
      });
    } else {
      actions.push({
        label: "Start watching",
        kind: "secondary",
        onClick: () => addMovieToCurrentlyWatching(movie),
      });
    }
  }

  if (includeWatched) {
    actions.push({
      label: hasWatchedMovie(profile, movie.id) ? "Watched" : "Mark watched",
      kind: hasWatchedMovie(profile, movie.id) ? "saved" : "secondary",
      disabled: hasWatchedMovie(profile, movie.id),
      onClick: options.onWatched || (() => openReviewModal({ source: watchedSource, movie })),
    });
  }

  if (includeReminder) {
    actions.push({
      label: hasReleaseReminder(profile, movie.id) ? "Reminder saved" : "Remind me",
      kind: hasReleaseReminder(profile, movie.id) ? "saved" : "secondary",
      disabled: hasReleaseReminder(profile, movie.id),
      onClick: () => saveReleaseReminder(movie),
    });
  }

  actions.push({
    label: movie.availabilityLabel || "Find OTT",
    kind: "link",
    href: buildOttSearchUrl(movie),
  });

  return {
    context: options.context || "",
    actions,
  };
}

function buildEditorialCardOptions(profile, movie) {
  return buildLibraryCardOptions(profile, movie, {
    context: movie.releaseLabel || movie.availabilityLabel || "Add a reminder or jump out to OTT search.",
    includeWatched: false,
    includeReminder: Boolean(movie.releaseLabel),
  });
}

function handleRefreshAiRecommendations() {
  if (!state.currentUser) {
    return;
  }

  void refreshServerRecommendations();
}

async function handleSendRecommendation() {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const friendId = recommendFriendSelect.value;
  const movieId = recommendMovieSelect.value;
  const note = recommendNoteInput.value.trim();
  const friend = findUserById(friendId);
  const movie = dedupeMovies([...profile.wishlist, ...profile.aiRecommendations]).find((item) => item.id === movieId);

  if (!friend || !movie) {
    return;
  }

  try {
    const payload = await apiRequest("/api/recommendations/send", {
      method: "POST",
      body: { toUserId: friend.id, note, movie },
    });
    recommendNoteInput.value = "";
    applyServerState(payload, { preserveInputs: true });
  } catch (error) {
    setAuthMessage(error.message);
  }
}

function openReviewModal(target) {
  state.reviewTarget = target;
  pendingRating = 0;
  starRatingGroup?.querySelectorAll(".star-btn").forEach(btn => btn.classList.remove("active"));
  if (saveRatingButton) saveRatingButton.disabled = false;
  const sourceLabel = target.source === "friend"
    ? `Recommended by ${target.fromUserName}`
    : target.source === "ai"
      ? "AI recommendation"
      : "From your library";
  reviewTargetTitle.textContent = target.movie.title;
  reviewModalOverlay.classList.remove("hidden");
}

function closeReviewModal() {
  state.reviewTarget = null;
  reviewModalOverlay.classList.add("hidden");
}

function handleReviewSubmit(event) {
  event.preventDefault();
  completeWatchedFlow("", pendingRating);
}

function handleSkipReview() {
  completeWatchedFlow("", 0);
}

function handleStarClick(event) {
  const btn = event.target.closest(".star-btn");
  if (!btn) return;
  const rating = parseInt(btn.dataset.rating, 10);
  pendingRating = rating;
  starRatingGroup.querySelectorAll(".star-btn").forEach(b => {
    b.classList.toggle("active", parseInt(b.dataset.rating, 10) <= rating);
  });
  const hint = document.querySelector("#rating-hint");
  if (hint) {
    hint.textContent = rating >= 4
      ? "Great pick — this will anchor your AI recommendations."
      : rating === 3
        ? "Decent watch — noted for your history."
        : "Not your thing — we'll keep that in mind.";
  }
}

async function completeWatchedFlow(review, rating = 0) {
  const profile = getCurrentProfile();
  const target = state.reviewTarget;
  if (!profile || !target) {
    return;
  }

  if (hasWatchedMovie(profile, target.movie.id)) {
    closeReviewModal();
    return;
  }

  profile.watched.unshift({
    id: createUniqueId("watched"),
    movieId: target.movie.id,
    title: target.movie.title,
    source: target.source,
    fromUserId: target.fromUserId || null,
    fromUserName: target.fromUserName || null,
    review,
    rating,
    watchedAt: Date.now(),
  });
  removeMovieFromCurrentlyWatching(target.movie.id);

  if (rating >= 4 && !isMovieLiked(profile, target.movie.id)) {
    profile.liked.push(target.movie);
  }

  if (target.source === "friend") {
    try {
      const payload = await apiRequest("/api/recommendations/watched", {
        method: "POST",
        body: { recommendationId: target.recommendationId, review },
      });
      closeReviewModal();
      applyServerState(payload, { preserveInputs: true });
    } catch (error) {
      setAuthMessage(error.message);
    }
    return;
  }

  persistProfiles();
  closeReviewModal();
  renderAppState();

  if (profile.liked.length >= 3 && profile.aiRecommendations.length === 0) {
    void refreshServerRecommendations();
  }

  void flushProfileSync();
}

async function sendFriendRequest(targetUserId) {
  const currentProfile = getCurrentProfile();
  const targetUser = findUserById(targetUserId);
  if (!currentProfile || !targetUser) {
    return;
  }

  try {
    const payload = await apiRequest("/api/friends/request", {
      method: "POST",
      body: { targetUserId },
    });
    applyServerState(payload, { preserveInputs: true });
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function respondToFriendRequest(requestId, accept) {
  const currentProfile = getCurrentProfile();
  if (!currentProfile) {
    return;
  }

  try {
    const payload = await apiRequest("/api/friends/respond", {
      method: "POST",
      body: { requestId, accept },
    });
    applyServerState(payload, { preserveInputs: true });
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function markNotificationRead(notificationId) {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  try {
    const payload = await apiRequest("/api/notifications/read", {
      method: "POST",
      body: { notificationId },
    });
    applyServerState(payload, { preserveInputs: true });
  } catch (error) {
    setAuthMessage(error.message);
  }
}

function addMovieToWishlist(movie) {
  const profile = getCurrentProfile();
  if (!profile || isMovieInWishlist(profile, movie.id)) {
    return;
  }

  profile.wishlist.unshift(movie);
  persistProfiles();
  renderWishlist();
  renderSearchResults();
  renderAiRecommendations();
  renderRecommendationComposer();
  void flushProfileSync();
}

function addMovieToLiked(movie) {
  const profile = getCurrentProfile();
  if (!profile || isMovieLiked(profile, movie.id)) {
    return;
  }

  profile.liked.unshift(movie);
  persistProfiles();
  renderAppState();
  void flushProfileSync();
}

function removeMovieFromLiked(movieId) {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  profile.liked = profile.liked.filter((movie) => movie.id !== movieId);
  persistProfiles();
  renderAppState();
  void flushProfileSync();
}

function addMovieToCurrentlyWatching(movie) {
  const profile = getCurrentProfile();
  if (!profile || isMovieCurrentlyWatching(profile, movie.id)) {
    return;
  }

  profile.currentlyWatching.unshift(movie);
  persistProfiles();
  renderAppState();
  void flushProfileSync();
}

function removeMovieFromCurrentlyWatching(movieId) {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  profile.currentlyWatching = profile.currentlyWatching.filter((movie) => movie.id !== movieId);
  persistProfiles();
}

function saveReleaseReminder(movie) {
  const profile = getCurrentProfile();
  if (!profile || hasReleaseReminder(profile, movie.id)) {
    return;
  }

  profile.releaseReminders.unshift(movie);
  createNotification(state.currentUser.id, {
    type: "release-reminder",
    title: "Release reminder saved",
    message: `${movie.title} was pinned to your release radar with your current reminder timing.`,
  });
  persistProfiles();
  renderAppState();
  void flushProfileSync();
}

function openLibraryEditor(collection = "wishlist") {
  const profile = getCurrentProfile();
  if (!profile?.wishlistSaved) {
    return;
  }

  state.libraryEditor.open = true;
  state.libraryEditor.collection = getNormalizedLibraryCollectionKey(collection);
  renderLibraryEditor();
}

function closeLibraryEditor() {
  state.libraryEditor.open = false;
  libraryEditorOverlay?.classList.add("hidden");
}

function renderLibraryEditor() {
  if (!libraryEditorOverlay || !libraryEditorList || !reminderPreferencesForm) {
    return;
  }

  const profile = getCurrentProfile();
  const isOpen = Boolean(state.libraryEditor.open && profile?.wishlistSaved);
  libraryEditorOverlay.classList.toggle("hidden", !isOpen);
  if (!isOpen || !profile) {
    return;
  }

  const collectionKey = getNormalizedLibraryCollectionKey(state.libraryEditor.collection);
  const collectionConfig = getLibraryCollectionConfig(collectionKey);
  const items = getProfileCollection(profile, collectionKey);
  libraryEditorSectionTitle.textContent = collectionConfig.label;
  libraryEditorSectionMeta.textContent = items.length > 0
    ? `${items.length} title${items.length === 1 ? "" : "s"} in this shelf`
    : collectionConfig.description;

  Array.from(libraryEditorToolbar.querySelectorAll("[data-collection]"))
    .forEach((button) => button.classList.toggle("active", button.dataset.collection === collectionKey));

  libraryEditorList.replaceChildren();
  if (items.length === 0) {
    libraryEditorList.append(createEmptyCard(`No titles in ${collectionConfig.label.toLowerCase()}`, collectionConfig.emptyMessage));
  } else {
    items.forEach((movie, index) => {
      libraryEditorList.append(buildLibraryEditorItem(profile, movie, collectionKey, index, items.length));
    });
  }

  const reminderPreferences = getReminderPreferences(profile);
  reminderEnabledInput.checked = reminderPreferences.enabled;
  reminderLeadSelect.value = String(reminderPreferences.leadDays);
  reminderHourSelect.value = String(reminderPreferences.deliveryHour);
  reminderTimezoneInput.value = reminderPreferences.timezone;
  reminderPreferencesSummary.textContent = buildReminderSummary(reminderPreferences);
  renderBrowserPushState();
}

function handleLibraryEditorToolbarClick(event) {
  const button = event.target.closest("[data-collection]");
  if (!button) {
    return;
  }

  state.libraryEditor.collection = getNormalizedLibraryCollectionKey(button.dataset.collection || "wishlist");
  renderLibraryEditor();
}

async function handleReminderPreferencesSubmit(event) {
  event.preventDefault();
  const profile = getCurrentProfile();
  if (!profile || !state.currentUser) {
    return;
  }

  const leadDays = Number.parseInt(reminderLeadSelect.value, 10);
  const deliveryHour = Number.parseInt(reminderHourSelect.value, 10);
  const timezone = reminderTimezoneInput.value.trim() || getLocalTimeZone();

  profile.reminderPreferences = {
    enabled: reminderEnabledInput.checked,
    leadDays: Number.isFinite(leadDays) ? leadDays : 1,
    deliveryHour: Number.isFinite(deliveryHour) ? deliveryHour : 9,
    timezone,
  };

  createNotification(state.currentUser.id, {
    type: "reminder-settings",
    title: "Reminder settings updated",
    message: profile.reminderPreferences.enabled
      ? buildReminderSummary(profile.reminderPreferences)
      : "Release reminders are paused until you enable them again.",
  });

  persistProfiles();
  renderAppState();
  await flushProfileSync();
}

function renderBrowserPushState() {
  if (!browserPushStatus || !browserPushButton) {
    return;
  }

  const pushState = state.push;
  browserPushStatus.textContent = pushState.statusMessage;
  browserPushButton.disabled = pushState.syncing || !pushState.supported || !state.currentUser;

  if (!pushState.supported) {
    browserPushButton.textContent = "Browser push unavailable";
    return;
  }

  if (pushState.permission === "denied") {
    browserPushButton.textContent = "Push blocked in browser";
    return;
  }

  browserPushButton.textContent = pushState.subscribed ? "Disable browser push" : "Enable browser push";
}

async function handleBrowserPushToggle() {
  if (!state.currentUser || !state.push.supported || state.push.syncing) {
    return;
  }

  state.push.syncing = true;
  renderBrowserPushState();

  try {
    if (state.push.subscribed) {
      await unsubscribeBrowserPush();
    } else {
      await subscribeBrowserPush();
    }
  } catch (error) {
    state.push.statusMessage = error.message || "Unable to update browser push right now.";
  } finally {
    state.push.syncing = false;
    renderBrowserPushState();
  }
}

async function syncBrowserPushState() {
  if (!state.push.supported) {
    renderBrowserPushState();
    return;
  }

  state.push.permission = Notification.permission;
  if (!state.currentUser) {
    state.push.subscribed = false;
    state.push.statusMessage = state.push.permission === "denied"
      ? "Browser push is blocked in this browser."
      : "Sign in to enable background reminder delivery.";
    renderBrowserPushState();
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    const subscription = await registration.pushManager.getSubscription();
    state.push.subscribed = Boolean(subscription);
    if (subscription && state.currentUser) {
      await apiRequest("/api/push/subscribe", {
        method: "POST",
        body: { subscription: subscription.toJSON() },
      });
    }
    if (state.push.permission === "denied") {
      state.push.statusMessage = "Browser push is blocked in this browser. Allow notifications in site settings first.";
    } else if (subscription) {
      state.push.statusMessage = "Browser push is active. Release reminders can arrive even when Movie Buddy is closed.";
    } else {
      state.push.statusMessage = "Enable browser push so the server can deliver reminder notifications in the background.";
    }
  } catch {
    state.push.statusMessage = "Browser push setup failed in this browser session.";
  }

  renderBrowserPushState();
}

async function subscribeBrowserPush() {
  if (!state.push.supported) {
    throw new Error("Browser push is not supported in this browser.");
  }

  const permission = await Notification.requestPermission();
  state.push.permission = permission;
  if (permission !== "granted") {
    throw new Error(permission === "denied"
      ? "Browser notifications were denied. Allow them in site settings to enable push reminders."
      : "Browser notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  const publicKey = await loadPushPublicKey();
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await apiRequest("/api/push/subscribe", {
    method: "POST",
    body: { subscription: subscription.toJSON() },
  });

  state.push.subscribed = true;
  state.push.statusMessage = "Browser push is active. Release reminders can arrive even when Movie Buddy is closed.";
}

async function unsubscribeBrowserPush() {
  if (!state.push.supported) {
    return;
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await apiRequest("/api/push/unsubscribe", {
      method: "POST",
      body: { endpoint: subscription.endpoint },
    });
    await subscription.unsubscribe().catch(() => undefined);
  }

  state.push.subscribed = false;
  state.push.statusMessage = "Browser push is off. Reminder notices will stay inside Movie Buddy only.";
}

async function loadPushPublicKey() {
  if (state.push.publicKey) {
    return state.push.publicKey;
  }

  const payload = await apiRequest("/api/push/public-key", { method: "GET" }, { allowUnauthorized: true });
  state.push.publicKey = String(payload.publicKey || "");
  if (!state.push.publicKey) {
    throw new Error("Push setup is unavailable because the server did not return a VAPID public key.");
  }
  return state.push.publicKey;
}

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

function buildLibraryEditorItem(profile, movie, collectionKey, index, total) {
  const item = document.createElement("article");
  item.className = "library-editor-item";

  const copy = document.createElement("div");
  copy.className = "library-editor-copy";

  const kicker = document.createElement("p");
  kicker.className = "social-kicker";
  kicker.textContent = `${formatTypeLabel(movie.type)} • ${movie.year}`;

  const title = document.createElement("h4");
  title.textContent = movie.title;

  const meta = document.createElement("p");
  meta.className = "social-meta";
  meta.textContent = movie.releaseLabel || movie.meta || movie.summary;

  copy.append(kicker, title, meta);

  const membershipActions = document.createElement("div");
  membershipActions.className = "library-editor-actions";
  getLibraryCollectionDefinitions().forEach((definition) => {
    const active = isMovieInProfileCollection(profile, definition.key, movie.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = active ? "save-button saved" : "secondary-action";
    button.textContent = definition.shortLabel;
    button.setAttribute("aria-label", `${active ? "Remove" : "Add"} ${movie.title} ${active ? "from" : "to"} ${definition.label}`);
    button.addEventListener("click", () => toggleMovieCollectionMembership(definition.key, movie));
    membershipActions.append(button);
  });

  const orderingActions = document.createElement("div");
  orderingActions.className = "library-editor-actions";

  const moveUpButton = document.createElement("button");
  moveUpButton.type = "button";
  moveUpButton.className = "tab-action";
  moveUpButton.textContent = "Move up";
  moveUpButton.disabled = index === 0;
  moveUpButton.setAttribute("aria-label", `Move ${movie.title} up in ${getLibraryCollectionConfig(collectionKey).label}`);
  moveUpButton.addEventListener("click", () => moveMovieWithinCollection(collectionKey, movie.id, -1));

  const moveDownButton = document.createElement("button");
  moveDownButton.type = "button";
  moveDownButton.className = "tab-action";
  moveDownButton.textContent = "Move down";
  moveDownButton.disabled = index === total - 1;
  moveDownButton.setAttribute("aria-label", `Move ${movie.title} down in ${getLibraryCollectionConfig(collectionKey).label}`);
  moveDownButton.addEventListener("click", () => moveMovieWithinCollection(collectionKey, movie.id, 1));

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "secondary-action";
  removeButton.textContent = `Remove from ${getLibraryCollectionConfig(collectionKey).shortLabel}`;
  removeButton.setAttribute("aria-label", `Remove ${movie.title} from ${getLibraryCollectionConfig(collectionKey).label}`);
  removeButton.addEventListener("click", () => removeMovieFromCollection(collectionKey, movie.id));

  orderingActions.append(moveUpButton, moveDownButton, removeButton);
  item.append(copy, membershipActions, orderingActions);
  return item;
}

function toggleMovieCollectionMembership(collectionKey, movie) {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const normalizedKey = getNormalizedLibraryCollectionKey(collectionKey);
  const items = getProfileCollection(profile, normalizedKey);
  const exists = items.some((item) => item.id === movie.id);
  if (exists) {
    profile[normalizedKey] = items.filter((item) => item.id !== movie.id);
  } else {
    profile[normalizedKey] = [movie, ...items];
    if (normalizedKey === "releaseReminders") {
      createNotification(state.currentUser.id, {
        type: "release-reminder",
        title: "Release reminder saved",
        message: `${movie.title} was added to your reminder queue.`,
      });
    }
  }

  persistProfiles();
  renderAppState();
}

function moveMovieWithinCollection(collectionKey, movieId, direction) {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const normalizedKey = getNormalizedLibraryCollectionKey(collectionKey);
  const items = getProfileCollection(profile, normalizedKey).slice();
  const currentIndex = items.findIndex((movie) => movie.id === movieId);
  const nextIndex = currentIndex + direction;
  if (currentIndex === -1 || nextIndex < 0 || nextIndex >= items.length) {
    return;
  }

  const [movie] = items.splice(currentIndex, 1);
  items.splice(nextIndex, 0, movie);
  profile[normalizedKey] = items;
  persistProfiles();
  renderAppState();
}

function removeMovieFromCollection(collectionKey, movieId) {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const normalizedKey = getNormalizedLibraryCollectionKey(collectionKey);
  profile[normalizedKey] = getProfileCollection(profile, normalizedKey).filter((movie) => movie.id !== movieId);
  persistProfiles();
  renderAppState();
}

function removeMovieFromWishlist(movieId) {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  profile.wishlist = profile.wishlist.filter((movie) => movie.id !== movieId);
  persistProfiles();
  renderWishlist();
  renderSearchResults();
  renderRecommendationComposer();
  void flushProfileSync();
}

async function runSearch(query) {
  if (!query || query !== state.query) {
    return;
  }

  const requestId = ++state.requestId;
  state.isLoading = true;
  state.hasSearched = true;
  state.errorMessage = "";
  renderSearchResults();

  try {
    const payload = await apiRequest(`/api/catalog/search?q=${encodeURIComponent(query)}`, { method: "GET" });

    if (query !== state.query) {
      return;
    }

    if (requestId !== state.requestId || query !== state.query) {
      return;
    }

    const liveResults = Array.isArray(payload?.titles) ? payload.titles : [];
    state.searchResults = mergeSearchResults(liveResults, getInstantSuggestions(query), query);
    state.searchSource = liveResults.length > 0 ? "live" : "suggested";
  } catch {
    if (requestId !== state.requestId || query !== state.query) {
      return;
    }

    state.searchResults = getInstantSuggestions(query);
    state.searchSource = "suggested";
    state.errorMessage = state.searchResults.length === 0
      ? "Unable to load live search results right now. Check your connection and try again."
      : "";
  } finally {
    if (requestId === state.requestId && query === state.query) {
      state.isLoading = false;
      renderSearchResults();
    }
  }
}

function getInstantSuggestions(query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return searchSuggestionPool
    .map((movie) => ({
      ...movie,
      matchScore: calculateSuggestionMatchScore(movie, normalizedQuery),
    }))
    .filter((movie) => movie.matchScore > 0)
    .sort(compareSuggestionEntries)
    .slice(0, 8)
    .map(({ matchScore, ...movie }) => movie);
}

function calculateSuggestionMatchScore(movie, query) {
  const normalizedTitle = normalizeSearchText(movie.title);
  const normalizedMeta = normalizeSearchText(movie.meta);
  const titleWords = tokenizeSearchText(movie.title);
  const tagWords = Array.isArray(movie.tags) ? movie.tags.map(normalizeSearchText) : [];
  const shortQuery = query.length <= 3;

  const titleScore = scoreSearchTerm(normalizedTitle, query, 2200);
  const wordScore = Math.max(...titleWords.map((word) => scoreSearchTerm(word, query, 1800)), 0);
  const tagScore = shortQuery ? 0 : Math.max(...tagWords.map((word) => scoreSearchTerm(word, query, 1100)), 0);
  const metaScore = shortQuery ? 0 : scoreSearchTerm(normalizedMeta, query, 600);
  const prefixBonus = normalizedTitle.startsWith(query)
    ? 1200
    : titleWords.some((word) => word.startsWith(query))
      ? 900
      : 0;
  const bestScore = Math.max(titleScore, wordScore, tagScore, metaScore);
  if (bestScore === 0) {
    return 0;
  }
  const popularityBonus = (movie.popularityWeight || 0) * 10;
  return bestScore + prefixBonus + popularityBonus;
}

function compareSuggestionEntries(left, right) {
  const matchDelta = right.matchScore - left.matchScore;
  if (matchDelta !== 0) {
    return matchDelta;
  }

  return compareMoviesByPopularity(left, right);
}

function compareMoviesByPopularity(left, right) {
  const popularityDelta = getMoviePopularityRank(right) - getMoviePopularityRank(left);
  if (popularityDelta !== 0) {
    return popularityDelta;
  }

  const yearDelta = Number.parseInt(String(right.year || "0"), 10) - Number.parseInt(String(left.year || "0"), 10);
  if (!Number.isNaN(yearDelta) && yearDelta !== 0) {
    return yearDelta;
  }

  return String(left.title || "").localeCompare(String(right.title || ""));
}

function calculatePopularityScore(details) {
  if (!details) {
    return 0;
  }

  const voteCount = Number.parseInt(String(details.imdbVotes || "0").replace(/,/g, ""), 10) || 0;
  const imdbRating = Number.parseFloat(String(details.imdbRating || "0")) || 0;
  const metascore = Number.parseInt(String(details.Metascore || "0"), 10) || 0;
  return voteCount + (imdbRating * 100000) + (metascore * 1000);
}

function getMoviePopularityRank(movie) {
  return (movie.popularityScore || 0) + ((movie.popularityWeight || 0) * 1000000);
}

function compareSearchResults(left, right, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery) {
    const matchDelta = calculateSuggestionMatchScore(right, normalizedQuery) - calculateSuggestionMatchScore(left, normalizedQuery);
    if (matchDelta !== 0) {
      return matchDelta;
    }
  }

  return compareMoviesByPopularity(left, right);
}

function mergeSearchResults(primaryResults, fallbackResults, query = state.query) {
  return dedupeMoviesByNormalizedTitle([...(primaryResults || []), ...(fallbackResults || [])])
    .sort((left, right) => compareSearchResults(left, right, query));
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function tokenizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function scoreSearchTerm(candidate, query, baseScore) {
  if (!candidate || !query) {
    return 0;
  }

  if (candidate === query) {
    return baseScore + 400;
  }

  if (candidate.startsWith(query)) {
    return baseScore + 260 - Math.max(0, candidate.length - query.length);
  }

  if (candidate.includes(query)) {
    return baseScore + 160;
  }

  if (isSubsequenceMatch(query, candidate)) {
    return baseScore + 80 + (getLeadingMatchLength(query, candidate) * 18);
  }

  if (query.length >= 4) {
    const candidatePrefix = candidate.slice(0, Math.min(candidate.length, query.length + 2));
    const editDistance = calculateLevenshteinDistance(query, candidatePrefix);
    const tolerance = Math.min(2, Math.floor(query.length / 4) + 1);
    if (editDistance <= tolerance) {
      return baseScore + 40 - (editDistance * 20);
    }
  }

  return 0;
}

function isSubsequenceMatch(query, candidate) {
  let queryIndex = 0;
  for (let candidateIndex = 0; candidateIndex < candidate.length && queryIndex < query.length; candidateIndex += 1) {
    if (candidate[candidateIndex] === query[queryIndex]) {
      queryIndex += 1;
    }
  }
  return queryIndex === query.length;
}

function getLeadingMatchLength(query, candidate) {
  let length = 0;
  while (length < query.length && length < candidate.length && query[length] === candidate[length]) {
    length += 1;
  }
  return length;
}

function calculateLevenshteinDistance(left, right) {
  const previousRow = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previousRow[0];
    previousRow[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const nextDiagonal = previousRow[rightIndex];
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      previousRow[rightIndex] = Math.min(
        previousRow[rightIndex] + 1,
        previousRow[rightIndex - 1] + 1,
        diagonal + substitutionCost
      );
      diagonal = nextDiagonal;
    }
  }
  return previousRow[right.length];
}

function collectTasteSignals(profile) {
  const counts = new Map();
  profile.liked.forEach((movie) => {
    (movie.tags || []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function buildMovieCard(movie, options) {
  const node = movieCardTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.ambientCopy = String(movie.summary || movie.title || "").slice(0, 180);
  const posterNode = node.querySelector(".movie-poster");
  posterNode.style.setProperty("--poster", buildPosterBackground(movie));
  updatePosterFallbackState(movie, posterNode);
  void hydrateMoviePoster(movie, posterNode);
  node.querySelector(".movie-type").textContent = formatTypeLabel(movie.type);
  node.querySelector(".movie-title").textContent = movie.title;
  node.querySelector(".movie-year").textContent = movie.year;
  node.querySelector(".movie-meta").textContent = movie.meta;
  node.querySelector(".movie-summary").textContent = movie.summary;

  const context = node.querySelector(".movie-context");
  if (options.context) {
    context.classList.remove("hidden");
    context.textContent = options.context;
  } else {
    context.classList.add("hidden");
  }

  const actions = node.querySelector(".movie-card-actions");
  const actionItems = Array.isArray(options.actions)
    ? options.actions
    : [
      options.primaryLabel ? {
        label: options.primaryLabel,
        kind: options.primaryDisabled ? "saved" : "primary",
        disabled: Boolean(options.primaryDisabled),
        onClick: options.onPrimary,
      } : null,
      options.secondaryLabel ? {
        label: options.secondaryLabel,
        kind: options.secondaryDisabled ? "saved" : "secondary",
        disabled: Boolean(options.secondaryDisabled),
        onClick: options.onSecondary,
      } : null,
    ].filter(Boolean);

  actionItems.forEach((action) => {
    const button = action.href ? document.createElement("a") : document.createElement("button");
    if (action.href) {
      button.href = action.href;
      button.target = "_blank";
      button.rel = "noreferrer noopener";
      button.className = "card-link";
    } else {
      button.type = "button";
      if (action.kind === "primary") {
        button.className = "save-button";
      } else if (action.kind === "saved") {
        button.className = "save-button saved";
      } else if (action.kind === "accent") {
        button.className = "accent-action";
      } else {
        button.className = "secondary-action";
      }
      button.disabled = Boolean(action.disabled);
      if (action.onClick) {
        button.addEventListener("click", action.onClick);
      }
    }

    button.textContent = action.label;
    actions.append(button);
  });

  return node;
}

function createSignalItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function createEmptyCard(title, message) {
  const empty = document.createElement("div");
  empty.className = "wishlist-empty";
  empty.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
  return empty;
}

function getCurrentProfile() {
  if (!state.currentUser) {
    return null;
  }

  return ensureProfile(state.currentUser.id);
}

function ensureCurrentUserProfile() {
  if (!state.currentUser || !isValidSessionUser(state.currentUser)) {
    state.currentUser = null;
    return;
  }

  ensureProfile(state.currentUser.id);
}

function ensureProfile(userId) {
  if (!state.profiles[userId]) {
    state.profiles[userId] = createEmptyProfile();
    persistProfiles();
  }
  return state.profiles[userId];
}

function createEmptyProfile() {
  return {
    wishlist: [],
    liked: [],
    currentlyWatching: [],
    releaseReminders: [],
    reminderPreferences: createDefaultReminderPreferences(),
    reminderDeliveryLog: [],
    pushSubscriptions: [],
    pushDeliveryLog: [],
    wishlistSaved: true,
    aiRecommendations: [],
    friendRecommendationInbox: [],
    sentRecommendations: [],
    notifications: [],
    incomingRequests: [],
    outgoingRequests: [],
    friendIds: [],
    watched: [],
  };
}

function loadProfiles() {
  return state.profiles;
}

function persistProfiles() {
  void scheduleProfileSync();
}

function createNotification(userId, notification) {
  state.profiles[userId] = state.profiles[userId] || createEmptyProfile();
  state.profiles[userId].notifications.unshift({
    id: createUniqueId("notification"),
    createdAt: Date.now(),
    read: false,
    ...notification,
  });
  persistProfiles();
}

function loadUsers() {
  return Object.values(state.userDirectory).filter((item) => {
    return item && typeof item === "object" && typeof item.id === "string" && typeof item.email === "string";
  });
}

function findUserById(userId) {
  if (state.currentUser?.id === userId) {
    return state.currentUser;
  }
  return state.userDirectory[userId] || null;
}

function isMovieInWishlist(profile, movieId) {
  return profile.wishlist.some((movie) => movie.id === movieId);
}

function isMovieLiked(profile, movieId) {
  return profile.liked.some((movie) => movie.id === movieId);
}

function isMovieCurrentlyWatching(profile, movieId) {
  return profile.currentlyWatching.some((movie) => movie.id === movieId);
}

function hasReleaseReminder(profile, movieId) {
  return profile.releaseReminders.some((movie) => movie.id === movieId);
}

function hasWatchedMovie(profile, movieId) {
  return profile.watched.some((movie) => movie.movieId === movieId);
}

function buildOttSearchUrl(movie) {
  return movie.watchUrl || `https://www.justwatch.com/us/search?q=${encodeURIComponent(movie.title)}`;
}

function createDefaultReminderPreferences() {
  return {
    enabled: true,
    leadDays: 1,
    deliveryHour: 9,
    timezone: getLocalTimeZone(),
  };
}

function getReminderPreferences(profile) {
  const defaults = createDefaultReminderPreferences();
  const preferences = profile?.reminderPreferences && typeof profile.reminderPreferences === "object"
    ? profile.reminderPreferences
    : {};
  return {
    enabled: preferences.enabled !== false,
    leadDays: [0, 1, 3, 7, 14].includes(Number(preferences.leadDays)) ? Number(preferences.leadDays) : defaults.leadDays,
    deliveryHour: [0, 6, 9, 12, 18, 21].includes(Number(preferences.deliveryHour)) ? Number(preferences.deliveryHour) : defaults.deliveryHour,
    timezone: String(preferences.timezone || defaults.timezone),
  };
}

function getLocalTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function buildReminderSummary(preferences) {
  if (!preferences.enabled) {
    return "Release reminders are paused.";
  }

  const leadLabel = preferences.leadDays === 0
    ? "on release day"
    : `${preferences.leadDays} day${preferences.leadDays === 1 ? "" : "s"} before release`;
  return `Movie Buddy will send release reminders ${leadLabel} at ${String(preferences.deliveryHour).padStart(2, "0")}:00 in ${preferences.timezone}.`;
}

function getLibraryCollectionDefinitions() {
  return [
    { key: "wishlist", label: "Wishlist", shortLabel: "Wishlist" },
    { key: "liked", label: "Liked for AI", shortLabel: "Liked" },
    { key: "currentlyWatching", label: "Currently watching", shortLabel: "Watching" },
    { key: "releaseReminders", label: "Release reminders", shortLabel: "Reminders" },
  ];
}

function getLibraryCollectionConfig(collectionKey) {
  const normalizedKey = getNormalizedLibraryCollectionKey(collectionKey);
  const definitions = {
    wishlist: {
      label: "Wishlist",
      shortLabel: "wishlist",
      description: "Saved for later",
      emptyMessage: "Search from the top bar, then pin titles here before they become active watches.",
    },
    liked: {
      label: "Liked for AI",
      shortLabel: "liked",
      description: "Direct recommendation signals",
      emptyMessage: "Only the titles you truly like should live here, because AI reads this shelf first.",
    },
    currentlyWatching: {
      label: "Currently watching",
      shortLabel: "watching",
      description: "In-progress titles",
      emptyMessage: "Use this shelf for anything you are actively working through, episode by episode or scene by scene.",
    },
    releaseReminders: {
      label: "Release reminders",
      shortLabel: "reminders",
      description: "Titles queued for reminder delivery",
      emptyMessage: "Reminder-ready titles with real release dates belong here so the server can notify you on schedule.",
    },
  };
  return definitions[normalizedKey] || definitions.wishlist;
}

function getNormalizedLibraryCollectionKey(collectionKey) {
  return ["wishlist", "liked", "currentlyWatching", "releaseReminders"].includes(collectionKey)
    ? collectionKey
    : "wishlist";
}

function getProfileCollection(profile, collectionKey) {
  const normalizedKey = getNormalizedLibraryCollectionKey(collectionKey);
  return Array.isArray(profile?.[normalizedKey]) ? profile[normalizedKey] : [];
}

function isMovieInProfileCollection(profile, collectionKey, movieId) {
  return getProfileCollection(profile, collectionKey).some((movie) => movie.id === movieId);
}

function getSentRecommendationCount(friendId) {
  const profile = getCurrentProfile();
  if (!profile) {
    return 0;
  }

  return profile.sentRecommendations.filter((item) => item.toUserId === friendId).length;
}

function getFriendshipStateLabel(profile, userId) {
  if (profile.friendIds.includes(userId)) {
    return "Already connected. You can now recommend movies to each other.";
  }
  if (profile.outgoingRequests.some((request) => request.toUserId === userId)) {
    return "Friend request sent. Waiting for them to accept.";
  }
  if (profile.incomingRequests.some((request) => request.fromUserId === userId)) {
    return "This user has already sent you a request. Respond in Requests and activity.";
  }
  return "Search result ready for a friend request.";
}

function dedupeMovies(movies) {
  const seen = new Set();
  return movies.filter((movie) => {
    if (seen.has(movie.id)) {
      return false;
    }
    seen.add(movie.id);
    return true;
  });
}

function dedupeMoviesByNormalizedTitle(movies) {
  const seen = new Set();
  return movies.filter((movie) => {
    const identityKey = createMovieIdentityKey(movie);
    if (seen.has(identityKey)) {
      return false;
    }
    seen.add(identityKey);
    return true;
  });
}

function createMovieIdentityKey(movie) {
  return `${normalizeSearchText(movie.title || movie.id || "")}:${String(movie.year || "")}:${String(movie.type || "")}`;
}

function buildPosterBackground(movie) {
  const posterUrl = normalizePosterUrl(movie.poster);
  if (posterUrl) {
    return `url("${escapeCssUrl(posterUrl)}") center / cover no-repeat`;
  }
  return movie.poster || "linear-gradient(135deg, #9c5329, #2e170b)";
}

function updatePosterFallbackState(movie, posterNode) {
  if (!posterNode) {
    return;
  }

  const hasPoster = Boolean(normalizePosterUrl(movie.poster));
  const fallbackLabel = String(movie.title || "Untitled").trim() || "Untitled";
  posterNode.classList.toggle("no-poster", !hasPoster);
  posterNode.dataset.posterLabel = fallbackLabel;
}

async function hydrateMoviePoster(movie, posterNode) {
  if (!posterNode) {
    return;
  }

  updatePosterFallbackState(movie, posterNode);

  if (normalizePosterUrl(movie.poster)) {
    return;
  }

  const posterUrl = await resolvePosterUrl(movie);
  if (!posterUrl || !posterNode.isConnected) {
    return;
  }

  movie.poster = posterUrl;
  posterNode.style.setProperty("--poster", buildPosterBackground(movie));
  updatePosterFallbackState(movie, posterNode);
}

function normalizePosterUrl(value) {
  const poster = String(value || "").trim();
  if (!poster || !poster.startsWith("http")) {
    return "";
  }

  return poster.replace(/^http:\/\//i, "https://");
}

async function resolvePosterUrl(movie) {
  const directPoster = normalizePosterUrl(movie.poster);
  if (directPoster) {
    return directPoster;
  }

  const cacheKey = createPosterCacheKey(movie.title, movie.year);
  if (posterFallbackCache.has(cacheKey)) {
    return posterFallbackCache.get(cacheKey);
  }

  if (!posterFallbackRequests.has(cacheKey)) {
    posterFallbackRequests.set(cacheKey, fetchDedicatedPoster(movie)
      .then((posterUrl) => {
        const normalizedPoster = normalizePosterUrl(posterUrl);
        posterFallbackCache.set(cacheKey, normalizedPoster);
        posterFallbackRequests.delete(cacheKey);
        return normalizedPoster;
      })
      .catch(() => {
        posterFallbackCache.set(cacheKey, "");
        posterFallbackRequests.delete(cacheKey);
        return "";
      }));
  }

  return posterFallbackRequests.get(cacheKey);
}

function createPosterCacheKey(title, year) {
  return `${normalizeSearchText(title)}:${String(year || "")}`;
}

async function pickFastestPosterSource(loaders) {
  const posterTasks = loaders.map((loadPoster) => Promise.resolve()
    .then(loadPoster)
    .then((posterUrl) => {
      const normalizedPoster = normalizePosterUrl(posterUrl);
      if (!normalizedPoster) {
        throw new Error("Poster unavailable");
      }
      return normalizedPoster;
    }));

  try {
    return await Promise.any(posterTasks);
  } catch {
    return "";
  }
}

async function fetchDedicatedPoster(movie) {
  const preferredType = String(movie.type || "movie").toLowerCase();
  const posterLoaders = preferredType === "series"
    ? [
      () => fetchTvMazePoster(movie.title, movie.year),
      () => fetchItunesPoster(movie.title, movie.year),
    ]
    : [
      () => fetchItunesPoster(movie.title, movie.year),
      () => fetchTvMazePoster(movie.title, movie.year),
    ];

  return pickFastestPosterSource(posterLoaders);
}

async function fetchItunesPoster(title, year) {
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=movie&entity=movie&limit=8`);
    const payload = await response.json();
    if (!response.ok || !Array.isArray(payload.results)) {
      return "";
    }

    const match = pickBestPosterMatch(payload.results.map((item) => ({
      title: item.trackName,
      year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : "",
      poster: item.artworkUrl100 ? item.artworkUrl100.replace(/100x100bb/g, "600x600bb") : "",
    })), title, year);
    return match?.poster || "";
  } catch {
    return "";
  }
}

async function fetchTvMazePoster(title, year) {
  try {
    const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`);
    const payload = await response.json();
    if (!response.ok || !Array.isArray(payload)) {
      return "";
    }

    const match = pickBestPosterMatch(payload.map((item) => ({
      title: item.show?.name,
      year: item.show?.premiered ? new Date(item.show.premiered).getFullYear() : "",
      poster: item.show?.image?.original || item.show?.image?.medium || "",
    })), title, year);
    return match?.poster || "";
  } catch {
    return "";
  }
}

function pickBestPosterMatch(candidates, title, year) {
  const normalizedTitle = normalizeSearchText(title);
  const targetYear = Number.parseInt(String(year || "0"), 10) || 0;
  return candidates
    .filter((candidate) => normalizePosterUrl(candidate.poster))
    .map((candidate) => {
      const candidateTitle = normalizeSearchText(candidate.title);
      const titleScore = scoreSearchTerm(candidateTitle, normalizedTitle, 1000);
      const yearScore = targetYear && Number(candidate.year) === targetYear ? 120 : 0;
      return { ...candidate, score: titleScore + yearScore };
    })
    .sort((left, right) => right.score - left.score)[0] || null;
}

function formatTypeLabel(type) {
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getResetIdentifier() {
  return state.resetMethod === "email" ? normalizeEmail(resetIdentifierInput.value) : normalizePhone(resetIdentifierInput.value);
}

function clearResetFlow() {
  state.pendingReset = null;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || "").replace(/\s+/g, "").trim();
}

function createUniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createRandomState() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getAuthErrorMessage(error, providerName) {
  const message = typeof error?.message === "string" ? error.message : "";
  if (/popup|cancel|closed/i.test(message)) {
    return `${providerName} sign-in was cancelled.`;
  }
  if (/client|origin|redirect/i.test(message)) {
    return `${providerName} sign-in could not start. Check the configured client ID, redirect URI, and authorized origins.`;
  }
  return `${providerName} authentication failed. Check the provider configuration and try again.`;
}

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const debounceSearch = debounce(runSearch, 220);
const debounceTopbarFriendPreview = debounce(runTopbarFriendPreview, 180);

function debounce(callback, wait) {
  let timeoutId;
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
      timeoutId = undefined;
    }, wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  };

  return debounced;
}

function escapeCssUrl(value) {
  return String(value).replace(/(["\\)])/g, "\\$1");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidSessionUser(user) {
  return user && typeof user === "object" && typeof user.id === "string" && typeof user.name === "string";
}

async function bootstrapApplication() {
  await loadProviderConfig();
  void syncBrowserPushState();

  const sessionUserId = getLocalSession();
  if (sessionUserId) {
    const localUser = getLocalUsers().find(u => u.id === sessionUserId);
    if (localUser) {
      applyLocalSession(localUser);
      try {
        const payload = await apiRequest("/api/auth/session", { method: "GET" }, { allowUnauthorized: true });
        if (payload?.user) {
          applyServerState(payload);
        }
      } catch {}
      return;
    }
  }

  try {
    const payload = await apiRequest("/api/auth/session", { method: "GET" }, { allowUnauthorized: true });
    if (payload?.user) {
      applyServerState(payload);
      return;
    }
  } catch {}

  render();
}

async function loadProviderConfig() {
  try {
    const payload = await apiRequest("/api/auth/providers", { method: "GET" }, { allowUnauthorized: true });
    state.providerConfig = normalizeProviderConfig(payload?.providers);
  } catch {
    state.providerConfig = createEmptyProviderConfig();
  }

  renderAuthState();
}

function applyServerState(payload, options = {}) {
  if (!payload?.user) {
    state.currentUser = null;
    state.profiles = {};
    state.userDirectory = {};
    state.push = createInitialPushState();
    render();
    return;
  }

  const preservedQuery = options.preserveInputs ? state.query : "";
  const preservedSearchResults = options.preserveInputs ? state.searchResults : [];
  const preservedHasSearched = options.preserveInputs ? state.hasSearched : false;
  const preservedFriendSearch = options.preserveInputs ? state.friendSearchResults : [];
  const preservedActiveTab = options.preserveInputs ? state.activeTab : "home";
  const preservedSearchPanelOpen = options.preserveInputs ? state.searchPanelOpen : false;

  signInUser(payload.user);
  state.profiles[state.currentUser.id] = payload.profile || createEmptyProfile();
  state.userDirectory = {};
  mergeUsers([payload.user, ...(payload.relatedUsers || []), ...preservedFriendSearch]);
  state.query = preservedQuery;
  state.searchResults = preservedSearchResults;
  state.hasSearched = preservedHasSearched;
  state.friendSearchResults = preservedFriendSearch;
  state.activeTab = preservedActiveTab;
  state.searchPanelOpen = preservedSearchPanelOpen;
  render();
  void syncBrowserPushState();
}

function createEmptyProviderConfig() {
  return {
    google: { configured: false, clientId: "" },
    microsoft: { configured: false, clientId: "", authority: "https://login.microsoftonline.com/common" },
    apple: { configured: false, clientId: "", redirectUri: "" },
  };
}

function normalizeProviderConfig(providers) {
  const emptyConfig = createEmptyProviderConfig();
  const nextConfig = providers && typeof providers === "object" ? providers : {};

  return {
    google: {
      configured: Boolean(nextConfig.google?.configured && nextConfig.google?.clientId),
      clientId: String(nextConfig.google?.clientId || ""),
    },
    microsoft: {
      configured: Boolean(nextConfig.microsoft?.configured && nextConfig.microsoft?.clientId),
      clientId: String(nextConfig.microsoft?.clientId || ""),
      authority: String(nextConfig.microsoft?.authority || emptyConfig.microsoft.authority),
    },
    apple: {
      configured: Boolean(nextConfig.apple?.configured && nextConfig.apple?.clientId && nextConfig.apple?.redirectUri),
      clientId: String(nextConfig.apple?.clientId || ""),
      redirectUri: String(nextConfig.apple?.redirectUri || ""),
    },
  };
}

function getProviderConfig(provider) {
  return state.providerConfig[provider] || { configured: false };
}

function formatProviderName(provider) {
  if (provider === "google") {
    return "Google";
  }
  if (provider === "microsoft") {
    return "Microsoft";
  }
  if (provider === "apple") {
    return "Apple";
  }
  return "Provider";
}

function mergeUsers(users) {
  users.filter(Boolean).forEach((user) => {
    state.userDirectory[user.id] = user;
  });
}

async function handleFriendSearchInput() {
  const query = friendSearchInput.value.trim();
  if (topbarFriendSearchInput && topbarFriendSearchInput.value !== query) {
    topbarFriendSearchInput.value = query;
  }
  if (!query || !state.currentUser) {
    state.friendSearchResults = [];
    state.topbarFriendPreviewResults = [];
    renderTopbarFriendPreview();
    renderFriendSearchResults();
    return;
  }

  try {
    state.friendSearchResults = await searchUsers(query);
    mergeUsers(state.friendSearchResults);
  } catch {
    state.friendSearchResults = [];
  }

  renderFriendSearchResults();
}

async function handleTopbarFriendSearchInput() {
  const query = topbarFriendSearchInput?.value.trim() || "";
  const profile = getCurrentProfile();
  if (!profile?.wishlistSaved) {
    return;
  }

  if (!query) {
    state.topbarFriendPreviewResults = [];
    renderTopbarFriendPreview();
    return;
  }

  debounceTopbarFriendPreview(query);
}

async function runTopbarFriendPreview(query) {
  if (!topbarFriendSearchInput || query !== topbarFriendSearchInput.value.trim()) {
    return;
  }

  try {
    state.topbarFriendPreviewResults = await searchUsers(query);
    mergeUsers(state.topbarFriendPreviewResults);
  } catch {
    state.topbarFriendPreviewResults = [];
  }

  renderTopbarFriendPreview();
}

function renderTopbarFriendPreview() {
  if (!topbarFriendResults) {
    return;
  }

  const query = topbarFriendSearchInput?.value.trim() || "";
  topbarFriendResults.replaceChildren();
  topbarFriendResults.classList.toggle("hidden", !query);

  if (!query) {
    return;
  }

  const profile = getCurrentProfile();
  const results = state.topbarFriendPreviewResults.slice(0, 5);
  if (results.length === 0) {
    const empty = document.createElement("div");
    empty.className = "topbar-friend-empty";
    empty.textContent = "No matching friends found yet.";
    topbarFriendResults.append(empty);
  } else {
    results.forEach((user) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "topbar-friend-result";
      button.innerHTML = `<span class="topbar-friend-handle">${escapeHtml(user.handle)}</span><span class="topbar-friend-name">${escapeHtml(user.name)}</span><span class="topbar-friend-meta">${escapeHtml(getFriendshipStateLabel(profile, user.id))}</span>`;
      button.addEventListener("click", () => openFriendSearchFromTopbar(user.name));
      topbarFriendResults.append(button);
    });
  }

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "topbar-friend-open";
  openButton.textContent = "Open full friend search";
  openButton.addEventListener("click", () => openFriendSearchFromTopbar(query));
  topbarFriendResults.append(openButton);
}

function openFriendSearchFromTopbar(query) {
  friendSearchInput.value = query;
  state.activeTab = "friends";
  renderHomeTabs();
  state.topbarFriendPreviewResults = [];
  if (topbarFriendResults) {
    topbarFriendResults.classList.add("hidden");
  }
  void handleFriendSearchInput();
}

function handleDocumentClick(event) {
  const eventPath = typeof event.composedPath === "function" ? event.composedPath() : [];
  const clickedInsideSearch = topbarSearchShell && (eventPath.includes(topbarSearchShell) || topbarSearchShell.contains(event.target));
  if (topbarSearchShell && searchStage && !clickedInsideSearch) {
    searchStage.classList.add("hidden");
    state.searchPanelOpen = false;
  }

  const clickedInsideFriendSearch = topbarFriendSearchShell
    && (eventPath.includes(topbarFriendSearchShell) || topbarFriendSearchShell.contains(event.target));
  if (!topbarFriendSearchShell || !topbarFriendResults || clickedInsideFriendSearch) {
    return;
  }

  topbarFriendResults.classList.add("hidden");
}

async function searchUsers(query) {
  const payload = await apiRequest(`/api/users/search?q=${encodeURIComponent(query)}`, { method: "GET" });
  return payload.users || [];
}

async function loadHomeDashboard(force = false) {
  const profile = getCurrentProfile();
  if (!state.currentUser || !profile) {
    state.homeData = createEmptyHomeData();
    state.homeDataLoading = false;
    state.homeDataRequestId = 0;
    return;
  }

  if (state.homeDataLoading && !force) {
    return;
  }

  const requestId = force ? state.homeDataRequestId + 1 : state.homeDataRequestId + 1;
  state.homeDataLoading = true;
  state.homeDataRequestId = requestId;

  try {
    const payload = await apiRequest("/api/home/dashboard", { method: "GET" });
    if (requestId !== state.homeDataRequestId) {
      return;
    }
    state.homeData = payload.dashboard || createEmptyHomeData();
  } catch {
    if (requestId !== state.homeDataRequestId) {
      return;
    }
    state.homeData = createEmptyHomeData();
  } finally {
    if (requestId === state.homeDataRequestId) {
      state.homeDataLoading = false;
      renderHomeCollections();
      renderAiRecommendations();
    }
  }
}

async function refreshServerRecommendations() {
  try {
    const payload = await apiRequest("/api/recommendations/refresh", {
      method: "POST",
      body: {},
    });
    applyServerState(payload, { preserveInputs: true });
    await loadHomeDashboard(true);
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function refreshSessionState(options = {}) {
  try {
    const payload = await apiRequest("/api/auth/session", { method: "GET" }, { allowUnauthorized: true });
    if (payload?.user) {
      applyServerState(payload, options);
    }
  } catch {
    // Keep the current UI state if the refresh request fails.
  }
}

function ensureSessionRefreshLoop() {
  if (!state.currentUser) {
    stopSessionRefreshLoop();
    return;
  }

  if (sessionRefreshIntervalId && sessionRefreshUserId === state.currentUser.id) {
    return;
  }

  stopSessionRefreshLoop();
  sessionRefreshUserId = state.currentUser.id;
  sessionRefreshIntervalId = window.setInterval(() => {
    if (!state.currentUser || document.visibilityState === "hidden") {
      return;
    }

    void refreshSessionState({ preserveInputs: true });
  }, 1500);
}

function stopSessionRefreshLoop() {
  if (sessionRefreshIntervalId) {
    window.clearInterval(sessionRefreshIntervalId);
  }

  sessionRefreshIntervalId = 0;
  sessionRefreshUserId = "";
}

function scheduleProfileSync() {
  pendingProfileSync = pendingProfileSync
    .catch(() => undefined)
    .then(() => flushProfileSync());
  return pendingProfileSync;
}

async function flushProfileSync() {
  const profile = getCurrentProfile();
  if (!profile || !state.currentUser) {
    return;
  }

  try {
    const payload = await apiRequest("/api/profile", {
      method: "PUT",
      body: { profile },
    });
    state.profiles[state.currentUser.id] = payload.profile || profile;
    mergeUsers([payload.user, ...(payload.relatedUsers || [])]);
    renderAppState();
    await loadHomeDashboard(true);
  } catch (error) {
    console.error(error);
  }
}

async function apiRequest(path, options, settings = {}) {
  const requestOptions = {
    method: options.method || "GET",
    headers: {},
    credentials: "same-origin",
  };

  if (options.body !== undefined) {
    requestOptions.headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(path, requestOptions);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !settings.allowUnauthorized) {
      state.currentUser = null;
      state.profiles = {};
      state.userDirectory = {};
      setAuthMode("login");
      render();
    }
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

function loadStoredArray(key) {
  try {
    const rawValue = localStorage.getItem(key);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function loadStoredObject(key) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

function persistArray(key, values) {
  localStorage.setItem(key, JSON.stringify(values));
}

function persistObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
