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
  authMode: "login",
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
  trendingLang: "",
  upcomingLang: "",
  authShellVisible: false,
  libraryEditor: {
    open: false,
    collection: "wishlist",
  },
  push: createInitialPushState(),
  wishlistFilter: "all",
  wishlistSort: "newest",
  activeMoodLang: "",
  shareTarget: null,
  sendFriendTarget: null,
  sendFriendSelectedUserId: null,
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
document.querySelector("#signup-back")?.addEventListener("click", () => setAuthMode("login"));
document.querySelector("#signin-to-signup")?.addEventListener("click", () => setAuthMode("signup"));
document.querySelector("#signup-to-signin")?.addEventListener("click", () => setAuthMode("login"));
document.querySelector("#verify-back")?.addEventListener("click", () => setAuthMode("signup"));
document.querySelector("#verify-form")?.addEventListener("submit", handleVerifySubmit);
document.querySelector("#resend-verify-otp")?.addEventListener("click", handleResendVerify);

// Login method tab toggle
document.querySelector("#tab-email")?.addEventListener("click", () => {
  document.querySelector("#login-email-panel")?.classList.remove("hidden");
  document.querySelector("#login-phone-panel")?.classList.add("hidden");
  document.querySelector("#tab-email")?.classList.add("active");
  document.querySelector("#tab-phone")?.classList.remove("active");
  resetPhoneLoginPanel();
});
document.querySelector("#tab-phone")?.addEventListener("click", () => {
  document.querySelector("#login-phone-panel")?.classList.remove("hidden");
  document.querySelector("#login-email-panel")?.classList.add("hidden");
  document.querySelector("#tab-phone")?.classList.add("active");
  document.querySelector("#tab-email")?.classList.remove("active");
});

// Phone login mode sub-tabs
document.querySelector("#phone-mode-otp")?.addEventListener("click", () => {
  document.querySelector("#phone-otp-panel")?.classList.remove("hidden");
  document.querySelector("#phone-password-panel")?.classList.add("hidden");
  document.querySelector("#phone-mode-otp")?.classList.add("active");
  document.querySelector("#phone-mode-password")?.classList.remove("active");
});
document.querySelector("#phone-mode-password")?.addEventListener("click", () => {
  document.querySelector("#phone-password-panel")?.classList.remove("hidden");
  document.querySelector("#phone-otp-panel")?.classList.add("hidden");
  document.querySelector("#phone-mode-password")?.classList.add("active");
  document.querySelector("#phone-mode-otp")?.classList.remove("active");
});

document.querySelector("#send-phone-otp-btn")?.addEventListener("click", handleSendPhoneOtp);

// Handle real-time availability check on signup form
let _handleCheckTimer = null;
document.querySelector("#signup-handle")?.addEventListener("input", (e) => {
  const val = e.target.value.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  e.target.dataset.userEdited = "true";
  const status = document.querySelector("#handle-status");
  if (!status) return;
  status.textContent = "";
  delete status.dataset.available;
  clearTimeout(_handleCheckTimer);
  if (!val || val.length < 3) return;
  _handleCheckTimer = setTimeout(async () => {
    const data = await apiRequest(`/api/auth/check-handle?handle=${encodeURIComponent(val)}`, { method: "GET" }).catch(() => null);
    if (!data) return;
    status.textContent = data.available ? "✓ Available" : "✗ Taken";
    status.dataset.available = String(data.available);
  }, 400);
});
document.querySelector("#signup-name")?.addEventListener("input", (e) => {
  const handleEl = document.querySelector("#signup-handle");
  if (!handleEl || handleEl.dataset.userEdited === "true") return;
  const suggested = e.target.value.trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
  handleEl.value = suggested;
  handleEl.dispatchEvent(new Event("input"));
});

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
document.querySelector("#brand-home-btn")?.addEventListener("click", () => {
  if (!state.currentUser) return;
  state.activeTab = "home";
  renderHomeTabs();
  syncMobileBottomNav();
});
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

  authShell?.classList.toggle("hidden", !state.authShellVisible || isAuthenticated);
  appShell?.classList.toggle("hidden", !isAuthenticated);

  document.getElementById("auth-welcome")?.classList.toggle("hidden", state.authMode !== "welcome");
  document.getElementById("auth-signin")?.classList.toggle("hidden", state.authMode !== "login");
  document.getElementById("auth-signup")?.classList.toggle("hidden", state.authMode !== "signup");
  document.getElementById("auth-verify")?.classList.toggle("hidden", state.authMode !== "verify");
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
  const exampleIdEl = document.getElementById("friend-search-example-id");
  if (exampleIdEl && state.currentUser.handle) exampleIdEl.textContent = state.currentUser.handle;
  if (friendsCount) friendsCount.textContent = profile.friendIds.length;
  if (notificationsCount) notificationsCount.textContent = profile.notifications.filter((item) => !item.read).length + profile.incomingRequests.length;
  if (watchedCount) watchedCount.textContent = profile.watched.length;
  updateAvatarBubble(state.currentUser.name);
  syncMobileBottomNav();
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

  const sectionsEmpty = !state.homeData.sections.trending.length && !state.homeData.sections.upcoming.length;
  console.log("[dashboard] renderAppState check: sectionsEmpty=", sectionsEmpty, "homeDataLoading=", state.homeDataLoading);
  if (!state.homeDataLoading && sectionsEmpty) {
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
  const handle = String(formData.get("handle") || "").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  const email = normalizeEmail(formData.get("email"));
  const phone = normalizePhone(formData.get("phone"));
  const password = String(formData.get("password") || "");

  // Validate handle status indicator
  const handleStatus = document.querySelector("#handle-status");
  if (handleStatus?.dataset.available === "false") {
    setAuthMessage("That username is taken. Please choose another.");
    document.querySelector("#signup-handle")?.focus();
    return;
  }

  try {
    const payload = await apiRequest("/api/auth/signup", {
      method: "POST",
      body: { name, handle, email, phone, password },
    });
    // Save pending signup state so verify step can resend if needed
    state.pendingSignup = { name, handle, email, phone, password, verifyId: payload.verifyId };
    const verifyDesc = document.querySelector("#verify-desc");
    if (verifyDesc) verifyDesc.textContent = `We sent a 6-digit code to ${email}.`;
    if (payload.previewOtp) {
      setAuthMessage(`Dev mode — code: ${payload.previewOtp}`, "success");
    } else {
      setAuthMessage(payload.message || "Check your email for the verification code.", "success");
    }
    setAuthMode("verify");
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function handleVerifySubmit(event) {
  event.preventDefault();
  const otp = String(document.querySelector("#verify-otp")?.value || "").trim();
  if (!otp || !state.pendingSignup?.verifyId) {
    setAuthMessage("Enter the 6-digit code from your email.");
    return;
  }
  try {
    const payload = await apiRequest("/api/auth/signup/verify", {
      method: "POST",
      body: { verifyId: state.pendingSignup.verifyId, otp },
    });
    state.pendingSignup = null;
    document.querySelector("#verify-form")?.reset();
    setAuthMessage("");
    applyServerState(payload);
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function handleResendVerify() {
  if (!state.pendingSignup) return;
  const { name, handle, email, phone, password } = state.pendingSignup;
  try {
    const payload = await apiRequest("/api/auth/signup", {
      method: "POST",
      body: { name, handle, email, phone, password },
    });
    state.pendingSignup.verifyId = payload.verifyId;
    setAuthMessage(payload.previewOtp ? `Dev code: ${payload.previewOtp}` : "New code sent — check your email.", "success");
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  // Detect active login mode
  const isPhoneMode = !document.querySelector("#login-phone-panel")?.classList.contains("hidden");

  if (isPhoneMode) {
    await handlePhoneLoginSubmit();
    return;
  }

  // Email + password
  const email = normalizeEmail(document.querySelector("#login-email")?.value || "");
  const password = String(document.querySelector("#login-password")?.value || "");

  const localUser = findLocalUser(email, password);
  if (localUser) {
    loginForm?.reset();
    setAuthMessage("");
    setLocalSession(localUser.id);
    applyLocalSession(localUser);
    return;
  }

  try {
    const payload = await apiRequest("/api/auth/login", { method: "POST", body: { email, password } });
    saveLocalUser({ id: payload.user.id, name: payload.user.name, email, password, handle: payload.user.handle });
    setLocalSession(payload.user.id);
    loginForm?.reset();
    setAuthMessage("");
    applyServerState(payload);
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function handleSendPhoneOtp() {
  const phone = String(document.querySelector("#login-phone")?.value || "").trim();
  if (!phone) { setAuthMessage("Enter your phone number first."); return; }
  try {
    const payload = await apiRequest("/api/auth/phone-otp", { method: "POST", body: { phone } });
    state.pendingPhoneLogin = { loginId: payload.loginId, phone };
    const otpField = document.querySelector("#phone-otp-field");
    otpField?.classList.remove("hidden");
    document.querySelector("#send-phone-otp-btn")?.classList.add("hidden");
    if (payload.previewOtp) {
      setAuthMessage(`Dev mode — code: ${payload.previewOtp}`, "success");
    } else {
      setAuthMessage(payload.message || "Code sent.", "success");
    }
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function handlePhoneLoginSubmit() {
  const phone = String(document.querySelector("#login-phone")?.value || "").trim();
  const isOtpMode = !document.querySelector("#phone-otp-panel")?.classList.contains("hidden") &&
                    document.querySelector("#phone-mode-otp")?.classList.contains("active");

  if (isOtpMode) {
    const otp = String(document.querySelector("#phone-otp-code")?.value || "").trim();
    const loginId = state.pendingPhoneLogin?.loginId;
    if (!otp) { setAuthMessage("Enter the code sent to your phone."); return; }
    if (!loginId) { setAuthMessage("Send a code first."); return; }
    try {
      const payload = await apiRequest("/api/auth/login", { method: "POST", body: { phone, otp, loginId } });
      loginForm?.reset();
      resetPhoneLoginPanel();
      setAuthMessage("");
      applyServerState(payload);
    } catch (error) {
      setAuthMessage(error.message);
    }
  } else {
    const password = String(document.querySelector("#login-phone-password")?.value || "");
    try {
      const payload = await apiRequest("/api/auth/login", { method: "POST", body: { phone, password } });
      saveLocalUser({ id: payload.user.id, name: payload.user.name, email: payload.user.email, password, handle: payload.user.handle });
      setLocalSession(payload.user.id);
      loginForm?.reset();
      resetPhoneLoginPanel();
      setAuthMessage("");
      applyServerState(payload);
    } catch (error) {
      setAuthMessage(error.message);
    }
  }
}

function resetPhoneLoginPanel() {
  state.pendingPhoneLogin = null;
  document.querySelector("#phone-otp-field")?.classList.add("hidden");
  document.querySelector("#send-phone-otp-btn")?.classList.remove("hidden");
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
  state.currentUser = { id: user.id, name: user.name, email: user.email, handle: user.handle || "mb-user", avatarUrl: user.avatarUrl || "" };
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
  state.trendingLang = "";
  state.upcomingLang = "";
  if (searchInput) searchInput.value = "";
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
  state.trendingLang = "";
  state.upcomingLang = "";
  state.authShellVisible = true;
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
  syncMobileBottomNav();

  if (state.activeTab === "activity") {
    void refreshSessionState({ preserveInputs: true });
    void loadActivityFeed();
  }
  if (state.activeTab === "mood") { renderMoodTab(); void loadMoodPicks(state.activeMood); }
  if (state.activeTab === "lists") { void loadCuratedLists(); void loadUserLists(); }
  if (state.activeTab === "profile") void loadProfilePage();
  if (state.activeTab === "admin") void loadAdminStats();
  if (state.activeTab === "requests") void loadRequestsTab();
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
      context: movie.releaseLabel || movie.availabilityLabel || "Wishlist for later, or like to shape your AI picks.",
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

  let items = [...profile.wishlist];

  // Apply filter
  if (state.wishlistFilter !== "all") {
    items = items.filter((m) => (m.type || "movie") === state.wishlistFilter);
  }

  // Apply sort
  if (state.wishlistSort === "oldest") {
    items = [...items].reverse();
  } else if (state.wishlistSort === "az") {
    items = [...items].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (state.wishlistSort === "year") {
    items = [...items].sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
  }

  if (items.length === 0) {
    wishlistList.append(createEmptyCard("No matches", "Try a different filter."));
    return;
  }

  items.forEach((movie) => {
    const node = wishlistTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".wishlist-language").textContent = formatTypeLabel(movie.type);
    node.querySelector(".wishlist-title").textContent = movie.title;
    node.querySelector(".wishlist-meta").textContent = `${movie.year} • ${movie.meta}`;
    node.querySelector(".remove-button").addEventListener("click", () => removeMovieFromWishlist(movie.id));
    // Quick-watched button on wishlist item
    const quickBtn = document.createElement("button");
    quickBtn.type = "button";
    quickBtn.className = "quick-watched-btn";
    quickBtn.title = "Mark as watched";
    quickBtn.textContent = "✓";
    quickBtn.addEventListener("click", () => {
      state.reviewTarget = { source: "library", movie };
      openReviewModal({ source: "library", movie });
    });
    node.appendChild(quickBtn);
    wishlistList.append(node);
  });
}

// Wire wishlist controls once DOM is ready
document.querySelector("#wishlist-controls")?.addEventListener("click", (e) => {
  const chip = e.target.closest(".filter-chip");
  if (chip) {
    document.querySelectorAll("#wishlist-controls .filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    state.wishlistFilter = chip.dataset.filter || "all";
    renderWishlist();
  }
});
document.querySelector("#wishlist-sort-select")?.addEventListener("change", (e) => {
  state.wishlistSort = e.target.value || "newest";
  renderWishlist();
});

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
    aiRecommendationGrid.append(createEmptyCard("No recommendations yet", "Add TMDB_API_KEY to your server env to power dynamic picks, or hit Refresh to use Claude AI directly."));
    return;
  }

  aiMovies.forEach((movie) => {
    const context = movie.basedOn
      ? `Because you liked ${movie.basedOn}`
      : "Matched to your taste profile";
    aiRecommendationGrid.append(buildMovieCard(movie, buildLibraryCardOptions(profile, movie, {
      context,
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
    <p class="ai-progress-body">Rate or like movies to build your taste profile. Mark a movie as watched to rate it.</p>
    <div class="ai-progress-bar-wrap" role="progressbar" aria-valuenow="${current}" aria-valuemin="0" aria-valuemax="${needed}" aria-label="Taste anchors progress">
      <div class="ai-progress-bar" style="width:${pct}%"></div>
    </div>
    <p class="ai-progress-count">${current} / ${needed} anchors</p>
  `;
  return card;
}

function renderFriendRecommendations() {
  if (!friendRecommendationGrid) return;
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
  const upcomingFiltered = (homeData.sections.upcoming || []).filter((m) => !state.upcomingLang || m.originalLanguage === state.upcomingLang);
  const releaseRadar = dedupeMovies([...releaseReminderItems, ...upcomingFiltered]);
  const trendingItems = (homeData.sections.trending || []).filter((m) => !state.trendingLang || m.originalLanguage === state.trendingLang);
  const anticipatedItems = (homeData.sections.anticipated || []).filter((m) => !state.upcomingLang || m.originalLanguage === state.upcomingLang);
  const splitWatching = splitMoviesByType(watchingItems);
  const splitUpcoming = splitMoviesByType(releaseRadar);
  const splitTrending = splitMoviesByType(trendingItems);
  const splitAnticipated = splitMoviesByType(anticipatedItems);
  const upcomingMovieItems = splitUpcoming.movies.length > 0
    ? splitUpcoming.movies
    : dedupeMovies([...splitAnticipated.movies, ...splitTrending.movies]).slice(0, 6);

  renderMovieCollection(likedGrid, likedItems, (movie) => buildMovieCard(movie, buildLibraryCardOptions(profile, movie, {
    context: "These titles are shaping your AI recommendations.",
    allowUnlike: true,
    includeReminder: false,
  })), "No liked titles yet", "Mark the titles you truly love with Like so recommendations stop guessing.");

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
    context: movie.releaseLabel || "Releasing soon — add to wishlist or set a reminder.",
    includeWatched: false,
    includeLike: false,
    includeReminder: true,
  })), "No upcoming movies", state.homeDataLoading ? "Loading upcoming movies now." : "Upcoming movies will appear here.");
  renderMovieCollection(upcomingSeriesGrid, splitUpcoming.series, (movie) => buildMovieCard(movie, buildLibraryCardOptions(profile, movie, {
    context: movie.releaseLabel || "Releasing soon — add to wishlist or set a reminder.",
    includeWatched: false,
    includeLike: false,
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
      // View profile button for connected users
      const viewBtn = document.createElement("button");
      viewBtn.type = "button";
      viewBtn.className = "save-button";
      viewBtn.style.marginLeft = "6px";
      viewBtn.textContent = "View profile";
      viewBtn.addEventListener("click", () => openFriendProfile(user.id));
      actions.append(viewBtn);
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
      const viewBtn = document.createElement("button");
      viewBtn.type = "button";
      viewBtn.className = "save-button";
      viewBtn.textContent = "View profile";
      viewBtn.addEventListener("click", () => openFriendProfile(user.id));
      actions.append(viewBtn);
      const overlapBtn = document.createElement("button");
      overlapBtn.type = "button";
      overlapBtn.className = "secondary-action";
      overlapBtn.textContent = "Overlap →";
      overlapBtn.addEventListener("click", () => loadFriendOverlap(user.id));
      actions.append(overlapBtn);
      friendList.append(item);
    });
}

async function loadFriendOverlap(friendId) {
  const section = document.getElementById("friend-overlap-section");
  const grid = document.getElementById("friend-overlap-grid");
  if (!section || !grid) return;
  section.classList.remove("hidden");
  grid.innerHTML = buildSkeletonCards(3);
  try {
    const payload = await apiRequest(`/api/friends/overlap?friendId=${encodeURIComponent(friendId)}`, { method: "GET" });
    grid.innerHTML = "";
    const movies = [...(payload.bothLiked || [])];
    if (!movies.length) {
      grid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No movies in common yet.</p>';
      return;
    }
    const profile = getCurrentProfile();
    movies.forEach((m) => grid.appendChild(buildMovieCard(m, buildLibraryCardOptions(profile, m, {}))));
  } catch {
    grid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Could not load overlap.</p>';
  }
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
    acceptButton.className = "friend-accept-btn";
    acceptButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg> Accept`;
    acceptButton.addEventListener("click", () => respondToFriendRequest(request.id, true));

    const rejectButton = document.createElement("button");
    rejectButton.type = "button";
    rejectButton.className = "friend-decline-btn";
    rejectButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Decline`;
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
    acceptButton.className = "friend-accept-btn";
    acceptButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg> Accept`;
    acceptButton.addEventListener("click", () => respondToFriendRequest(request.id, true));

    const rejectButton = document.createElement("button");
    rejectButton.type = "button";
    rejectButton.className = "friend-decline-btn";
    rejectButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Decline`;
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
  const includeLike = options.includeLike !== false;
  const includeReminder = Boolean(options.includeReminder);
  const watchedSource = options.watchSource || "library";

  actions.push({
    label: isMovieInWishlist(profile, movie.id) ? "In wishlist" : "Wishlist",
    kind: isMovieInWishlist(profile, movie.id) ? "saved" : "primary",
    disabled: isMovieInWishlist(profile, movie.id),
    onClick: () => addMovieToWishlist(movie),
  });

  if (includeLike) {
    if (allowUnlike && isMovieLiked(profile, movie.id)) {
      actions.push({
        label: "Unlike",
        kind: "secondary",
        onClick: () => removeMovieFromLiked(movie.id),
      });
    } else {
      actions.push({
        label: isMovieLiked(profile, movie.id) ? "Liked" : "Like",
        kind: isMovieLiked(profile, movie.id) ? "saved" : "secondary",
        disabled: isMovieLiked(profile, movie.id),
        onClick: () => addMovieToLiked(movie),
      });
    }
  }

  if (includeWatching && isMovieCurrentlyWatching(profile, movie.id)) {
    actions.push({
      label: "Finished",
      kind: "accent",
      onClick: () => openReviewModal({ source: watchedSource, movie }),
    });
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

  const includeSend = Boolean(options.includeSend);
  if (includeSend && (profile.friendIds || []).length > 0) {
    actions.push({
      label: "Send to friend",
      kind: "secondary",
      onClick: () => openSendToFriend(movie),
    });
  }

  return {
    context: options.context || "",
    actions,
    ottLabel: movie.availabilityLabel || "Search OTT",
    ottHref: buildOttSearchUrl(movie),
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

  const removed = profile.liked.find((movie) => movie.id === movieId);
  profile.liked = profile.liked.filter((movie) => movie.id !== movieId);
  persistProfiles();
  renderAppState();
  void flushProfileSync();
  if (removed) {
    showToast("Removed from Liked", "info", 4000, () => {
      const p = getCurrentProfile();
      if (p) { p.liked.unshift(removed); persistProfiles(); renderAppState(); void flushProfileSync(); }
    });
  }
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

  const removed = profile.currentlyWatching.find((movie) => movie.id === movieId);
  profile.currentlyWatching = profile.currentlyWatching.filter((movie) => movie.id !== movieId);
  persistProfiles();
  if (removed) {
    showToast("Removed from Watching", "info", 4000, () => {
      const p = getCurrentProfile();
      if (p) { p.currentlyWatching.unshift(removed); persistProfiles(); renderAppState(); }
    });
  }
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

  showToast(`Reminder set for "${movie.title}". Enable push to get notified on release day.`, "success", 5000);
  if (state.push.supported && !state.push.subscribed) {
    setTimeout(() => handleBrowserPushToggle(), 1200);
  }
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

  const searchQuery = (document.getElementById("library-search-input")?.value || "").trim().toLowerCase();
  const filteredItems = searchQuery ? items.filter((m) => m.title.toLowerCase().includes(searchQuery)) : items;

  libraryEditorList.replaceChildren();
  if (filteredItems.length === 0) {
    libraryEditorList.append(createEmptyCard(
      searchQuery ? "No matching titles" : `No titles in ${collectionConfig.label.toLowerCase()}`,
      searchQuery ? "Try a different search term." : collectionConfig.emptyMessage
    ));
  } else {
    let dragSrcIndex = null;
    filteredItems.forEach((movie, index) => {
      const itemEl = buildLibraryEditorItem(profile, movie, collectionKey);
      itemEl.setAttribute("draggable", "true");
      itemEl.addEventListener("dragstart", (e) => {
        dragSrcIndex = index;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
      });
      itemEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        itemEl.classList.add("drag-over");
      });
      itemEl.addEventListener("dragleave", () => itemEl.classList.remove("drag-over"));
      itemEl.addEventListener("dragend", () => itemEl.classList.remove("drag-over"));
      itemEl.addEventListener("drop", (e) => {
        e.preventDefault();
        itemEl.classList.remove("drag-over");
        if (dragSrcIndex === null || dragSrcIndex === index) return;
        const p = getCurrentProfile();
        if (!p) return;
        const normalizedKey = getNormalizedLibraryCollectionKey(state.libraryEditor.collection);
        const arr = getProfileCollection(p, normalizedKey).slice();
        const srcId = filteredItems[dragSrcIndex]?.id;
        const tgtId = filteredItems[index]?.id;
        const srcIdx = arr.findIndex((m) => m.id === srcId);
        const tgtIdx = arr.findIndex((m) => m.id === tgtId);
        if (srcIdx === -1 || tgtIdx === -1) return;
        const [moved] = arr.splice(srcIdx, 1);
        arr.splice(tgtIdx, 0, moved);
        p[normalizedKey] = arr;
        persistProfiles();
        void scheduleProfileSync();
        renderAppState();
        dragSrcIndex = null;
      });
      libraryEditorList.append(itemEl);
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

function buildLibraryEditorItem(profile, movie, collectionKey) {
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

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "secondary-action";
  removeButton.textContent = `Remove from ${getLibraryCollectionConfig(collectionKey).shortLabel}`;
  removeButton.setAttribute("aria-label", `Remove ${movie.title} from ${getLibraryCollectionConfig(collectionKey).label}`);
  removeButton.addEventListener("click", () => removeMovieFromCollection(collectionKey, movie.id));

  const orderingActions = document.createElement("div");
  orderingActions.className = "library-editor-actions";
  orderingActions.append(removeButton);

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
  const removed = getProfileCollection(profile, normalizedKey).find((movie) => movie.id === movieId);
  profile[normalizedKey] = getProfileCollection(profile, normalizedKey).filter((movie) => movie.id !== movieId);
  persistProfiles();
  renderAppState();
  if (removed) {
    const label = getLibraryCollectionConfig(normalizedKey).label;
    showToast(`Removed from ${label}`, "info", 4000, () => {
      const p = getCurrentProfile();
      if (p) { p[normalizedKey].unshift(removed); persistProfiles(); renderAppState(); }
    });
  }
}

function removeMovieFromWishlist(movieId) {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const removed = profile.wishlist.find((movie) => movie.id === movieId);
  profile.wishlist = profile.wishlist.filter((movie) => movie.id !== movieId);
  persistProfiles();
  renderWishlist();
  renderSearchResults();
  renderRecommendationComposer();
  void flushProfileSync();
  if (removed) {
    showToast("Removed from Wishlist", "info", 4000, () => {
      const p = getCurrentProfile();
      if (p) { p.wishlist.unshift(removed); persistProfiles(); renderWishlist(); renderSearchResults(); renderRecommendationComposer(); void flushProfileSync(); }
    });
  }
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
  if (!normalizedQuery || normalizedQuery.length < 2) return [];
  const profile = getCurrentProfile();
  if (!profile) return [];
  const pool = dedupeMoviesByNormalizedTitle([
    ...(profile.liked || []),
    ...(profile.wishlist || []),
    ...(profile.currentlyWatching || []),
  ]);
  return pool
    .map((movie) => ({ ...movie, matchScore: calculateSuggestionMatchScore(movie, normalizedQuery) }))
    .filter((movie) => movie.matchScore > 0)
    .sort(compareSuggestionEntries)
    .slice(0, 6)
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
  node.dataset.movieId = movie.id || "";
  if (movie.ids?.tmdb) node.dataset.tmdbId = String(movie.ids.tmdb);
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

  const ottEl = node.querySelector(".movie-ott");
  if (ottEl && options.ottLabel) {
    const ottLink = document.createElement("a");
    ottLink.href = options.ottHref || "#";
    ottLink.target = "_blank";
    ottLink.rel = "noreferrer noopener";
    ottLink.className = "movie-ott-link";
    ottLink.textContent = options.ottLabel;
    ottEl.classList.remove("hidden");
    ottEl.append(ottLink);
  }

  // Quick-watched overlay button
  if (options.includeQuickWatch) {
    const profile = getCurrentProfile();
    if (!profile || !hasWatchedMovie(profile, movie.id)) {
      const quickBtn = document.createElement("button");
      quickBtn.type = "button";
      quickBtn.className = "quick-watched-btn";
      quickBtn.title = "Mark as watched";
      quickBtn.setAttribute("aria-label", "Quick mark watched");
      quickBtn.textContent = "✓";
      quickBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openReviewModal({ source: "library", movie });
      });
      posterNode.appendChild(quickBtn);
    }
  }

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
      () => fetchServerPoster(movie.title, movie.year, "series"),
      () => fetchTvMazePoster(movie.title, movie.year),
      () => fetchItunesPoster(movie.title, movie.year),
    ]
    : [
      () => fetchServerPoster(movie.title, movie.year, "movie"),
      () => fetchItunesPoster(movie.title, movie.year),
      () => fetchTvMazePoster(movie.title, movie.year),
    ];

  return pickFastestPosterSource(posterLoaders);
}

async function fetchServerPoster(title, year, type) {
  try {
    const params = new URLSearchParams({ title, type });
    if (year) params.set("year", String(year));
    const payload = await apiRequest(`/api/catalog/poster?${params}`, { method: "GET" });
    return payload?.poster || "";
  } catch {
    return "";
  }
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
  return String(value || "")
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
      render(); // show app shell immediately — no flash
      try {
        const payload = await apiRequest("/api/auth/session", { method: "GET" }, { allowUnauthorized: true });
        if (payload?.user) {
          applyServerState(payload, { preserveInputs: true });
        }
      } catch {}
      return;
    }
  }

  try {
    const payload = await apiRequest("/api/auth/session", { method: "GET" }, { allowUnauthorized: true });
    if (payload?.user) {
      applyServerState(payload, { preserveInputs: true });
      return;
    }
  } catch {}

  state.authShellVisible = true;
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
  const preservedHomeData = options.preserveInputs ? state.homeData : null;
  const preservedHomeDataLoading = options.preserveInputs ? state.homeDataLoading : false;
  const preservedHomeDataRequestId = options.preserveInputs ? state.homeDataRequestId : 0;

  signInUser(payload.user);
  setLocalSession(payload.user.id);
  state.profiles[state.currentUser.id] = payload.profile || createEmptyProfile();
  state.userDirectory = {};
  mergeUsers([payload.user, ...(payload.relatedUsers || []), ...preservedFriendSearch]);
  state.query = preservedQuery;
  state.searchResults = preservedSearchResults;
  state.hasSearched = preservedHasSearched;
  state.friendSearchResults = preservedFriendSearch;
  state.activeTab = preservedActiveTab;
  state.searchPanelOpen = preservedSearchPanelOpen;
  if (preservedHomeData) {
    state.homeData = preservedHomeData;
    state.homeDataLoading = preservedHomeDataLoading;
    state.homeDataRequestId = preservedHomeDataRequestId;
  }
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
    console.log("[dashboard] skip: no user/profile");
    state.homeData = createEmptyHomeData();
    state.homeDataLoading = false;
    state.homeDataRequestId = 0;
    return;
  }

  if (state.homeDataLoading && !force) {
    console.log("[dashboard] skip: already loading");
    return;
  }

  const requestId = ++state.homeDataRequestId;
  state.homeDataLoading = true;
  console.log("[dashboard] fetching, requestId=", requestId);

  try {
    const payload = await apiRequest("/api/home/dashboard", { method: "GET" });
    console.log("[dashboard] got payload, requestId=", requestId, "current=", state.homeDataRequestId, "trending=", payload.dashboard?.sections?.trending?.length, "upcoming=", payload.dashboard?.sections?.upcoming?.length);
    if (requestId !== state.homeDataRequestId) { console.log("[dashboard] stale, discarding"); return; }
    state.homeData = payload.dashboard || createEmptyHomeData();
  } catch (err) {
    console.error("[dashboard] error:", err?.message || err);
    if (requestId !== state.homeDataRequestId) return;
    state.homeData = createEmptyHomeData();
    // Reset so the next render can retry
    state.homeDataRequestId = 0;
  } finally {
    if (requestId === state.homeDataRequestId || state.homeDataRequestId === 0) {
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
  }, 30_000);
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

/* ============================================================
   THEME TOGGLE
   ============================================================ */
(function initTheme() {
  const stored = localStorage.getItem("mb_theme") || "dark";
  document.documentElement.dataset.theme = stored === "light" ? "light" : "dark";
})();

document.querySelector("#theme-toggle")?.addEventListener("click", () => {
  const isLight = document.documentElement.dataset.theme === "light";
  const next = isLight ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("mb_theme", next);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.content = next === "light" ? "#f4f4f8" : "#07070d";
});

/* ============================================================
   USER AVATAR BUBBLE
   ============================================================ */
const AVATAR_PRESETS = [
  { id: "p1",  gradient: "135deg, #e8a020, #a05010" },
  { id: "p2",  gradient: "135deg, #3ecf88, #0d6e40" },
  { id: "p3",  gradient: "135deg, #6bb8ff, #1e50a0" },
  { id: "p4",  gradient: "135deg, #ff7f7f, #a02020" },
  { id: "p5",  gradient: "135deg, #c084fc, #6020a0" },
  { id: "p6",  gradient: "135deg, #fb923c, #a04010" },
  { id: "p7",  gradient: "135deg, #34d399, #065f46" },
  { id: "p8",  gradient: "135deg, #818cf8, #3730a3" },
  { id: "p9",  gradient: "135deg, #f472b6, #9d174d" },
  { id: "p10", gradient: "135deg, #fbbf24, #92400e" },
  { id: "p11", gradient: "135deg, #60a5fa, #1e40af" },
  { id: "p12", gradient: "135deg, #a78bfa, #4c1d95" },
];

function updateAvatarBubble(name) {
  const bubble = document.querySelector("#user-avatar-bubble");
  if (!bubble) return;
  const avatarUrl = state.currentUser?.avatarUrl || "";

  if (avatarUrl.startsWith("data:image/")) {
    bubble.style.backgroundImage = `url(${avatarUrl})`;
    bubble.style.backgroundSize = "cover";
    bubble.style.backgroundPosition = "center";
    bubble.style.backgroundRepeat = "no-repeat";
    bubble.style.borderColor = "transparent";
    bubble.style.color = "transparent";
    bubble.style.background = "";
    bubble.textContent = "";
    return;
  }

  if (avatarUrl.startsWith("preset:")) {
    const presetId = avatarUrl.slice(7);
    const preset = AVATAR_PRESETS.find((p) => p.id === presetId);
    bubble.style.backgroundImage = "";
    bubble.style.background = preset ? `linear-gradient(${preset.gradient})` : "";
    bubble.style.borderColor = "transparent";
    bubble.style.color = "transparent";
    bubble.textContent = "";
    return;
  }

  // Initials fallback
  bubble.style.backgroundImage = "";
  bubble.style.background = "";
  const displayName = name || state.currentUser?.name || "MB";
  const initials = displayName.split(" ").map((w) => w[0] || "").join("").slice(0, 2).toUpperCase() || "MB";
  bubble.textContent = initials;
  const colors = ["#e8a020", "#3ecf88", "#6bb8ff", "#ff7f7f", "#c084fc", "#fb923c"];
  const idx = displayName.charCodeAt(0) % colors.length;
  bubble.style.borderColor = colors[idx];
  bubble.style.color = colors[idx];
  bubble.style.background = `${colors[idx]}22`;
}

/* ============================================================
   AVATAR PICKER
   ============================================================ */
let _avatarPickerSelection = null; // { type: "preset"|"upload", value }

function openAvatarPicker() {
  const overlay = document.querySelector("#avatar-picker-overlay");
  if (!overlay) return;
  _avatarPickerSelection = null;

  // Populate presets grid
  const grid = document.querySelector("#avatar-presets-grid");
  if (grid) {
    grid.innerHTML = "";
    const currentAvatar = state.currentUser?.avatarUrl || "";
    AVATAR_PRESETS.forEach((preset) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "avatar-preset-btn";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-label", `Preset ${preset.id}`);
      btn.style.background = `linear-gradient(${preset.gradient})`;
      if (currentAvatar === `preset:${preset.id}`) {
        btn.classList.add("selected");
        btn.setAttribute("aria-checked", "true");
      }
      btn.addEventListener("click", () => {
        grid.querySelectorAll(".avatar-preset-btn").forEach((b) => { b.classList.remove("selected"); b.setAttribute("aria-checked", "false"); });
        btn.classList.add("selected");
        btn.setAttribute("aria-checked", "true");
        _avatarPickerSelection = { type: "preset", value: preset.id };
        document.querySelector("#avatar-upload-preview")?.classList.add("hidden");
      });
      grid.appendChild(btn);
    });
  }

  // Reset upload section
  document.querySelector("#avatar-upload-preview")?.classList.add("hidden");
  document.querySelector("#avatar-file-input") && (document.querySelector("#avatar-file-input").value = "");

  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeAvatarPicker() {
  document.querySelector("#avatar-picker-overlay")?.classList.add("hidden");
  document.body.style.overflow = "";
  _avatarPickerSelection = null;
}

function onAvatarFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { alert("Please choose an image file."); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.querySelector("#avatar-resize-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      canvas.width = 200;
      canvas.height = 200;
      // Center-crop to square
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 200, 200);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      _avatarPickerSelection = { type: "upload", value: dataUrl };

      // Show preview
      const preview = document.querySelector("#avatar-upload-preview");
      const previewImg = document.querySelector("#avatar-preview-img");
      const previewName = document.querySelector("#avatar-upload-filename");
      if (previewImg) previewImg.src = dataUrl;
      if (previewName) previewName.textContent = file.name;
      preview?.classList.remove("hidden");

      // Deselect presets
      document.querySelectorAll(".avatar-preset-btn").forEach((b) => { b.classList.remove("selected"); b.setAttribute("aria-checked", "false"); });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function saveAvatar() {
  if (!_avatarPickerSelection) { closeAvatarPicker(); return; }
  try {
    const data = await apiRequest("/api/profile/avatar", {
      method: "PUT",
      body: { avatarType: _avatarPickerSelection.type, value: _avatarPickerSelection.value },
    });
    if (state.currentUser) state.currentUser.avatarUrl = data.user?.avatarUrl || "";
    updateAvatarBubble(state.currentUser?.name || "");
    closeAvatarPicker();
  } catch (error) {
    alert(`Could not save avatar: ${error.message}`);
  }
}

async function removeAvatar() {
  try {
    await apiRequest("/api/profile/avatar", { method: "PUT", body: { avatarType: "clear" } });
    if (state.currentUser) state.currentUser.avatarUrl = "";
    updateAvatarBubble(state.currentUser?.name || "");
    closeAvatarPicker();
  } catch (error) {
    alert(`Could not remove avatar: ${error.message}`);
  }
}

// Avatar picker event wiring
document.querySelector("#avatar-picker-close")?.addEventListener("click", closeAvatarPicker);
document.querySelector("#avatar-picker-overlay")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeAvatarPicker(); });
document.querySelector("#avatar-save-btn")?.addEventListener("click", saveAvatar);
document.querySelector("#avatar-remove-btn")?.addEventListener("click", removeAvatar);
document.querySelector("#avatar-file-input")?.addEventListener("change", onAvatarFileChange);

/* ============================================================
   ADD TO WATCHING MODAL
   ============================================================ */

let _addWatchingSearchTimer = null;
let _addWatchingRequestId = 0;
let _addWatchingType = null;
let _addWatchingWired = false;

function _wireAddWatchingModal() {
  if (_addWatchingWired) return;
  _addWatchingWired = true;
  document.querySelector("#add-watching-close")?.addEventListener("click", closeAddToWatchingModal);
  document.querySelector("#add-watching-overlay")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeAddToWatchingModal(); });
  document.querySelector("#add-watching-input")?.addEventListener("input", (e) => {
    const q = e.target.value.trim();
    clearTimeout(_addWatchingSearchTimer);
    if (q.length < 2) { renderAddToWatchingResults([], false, q); return; }
    const _awContainer = document.querySelector("#add-watching-results");
    if (_awContainer) _awContainer.innerHTML = '<p class="add-watching-empty">Searching…</p>';
    _addWatchingSearchTimer = setTimeout(() => void runAddWatchingSearch(q), 350);
  });
}

function openAddToWatchingModal(type) {
  _addWatchingType = type || null;
  _wireAddWatchingModal();
  const overlay = document.querySelector("#add-watching-overlay");
  if (!overlay) return;
  const titleEl = document.querySelector("#add-watching-modal-title");
  if (titleEl) titleEl.textContent = type === "movie" ? "Add Movie" : type === "series" ? "Add Series" : "Add to Now Watching";
  const input = document.querySelector("#add-watching-input");
  if (input) input.placeholder = type === "movie" ? "Search movies…" : type === "series" ? "Search series…" : "Search any title…";
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  if (input) { input.value = ""; }
  renderAddToWatchingResults([], false, "");
  requestAnimationFrame(() => { document.querySelector("#add-watching-input")?.focus(); });
}

function closeAddToWatchingModal() {
  document.querySelector("#add-watching-overlay")?.classList.add("hidden");
  document.body.style.overflow = "";
  clearTimeout(_addWatchingSearchTimer);
}

function renderAddToWatchingResults(results, isLoading, query) {
  const container = document.querySelector("#add-watching-results");
  if (!container) return;
  if (isLoading) {
    container.innerHTML = '<p class="add-watching-empty">Searching…</p>';
    return;
  }
  if (!query || query.length < 2) {
    container.innerHTML = '<p class="add-watching-empty">Start typing to find a title to watch.</p>';
    return;
  }
  if (results.length === 0) {
    container.innerHTML = `<p class="add-watching-empty">No results for "${query}".</p>`;
    return;
  }
  const profile = getCurrentProfile();
  container.innerHTML = "";
  const filtered = _addWatchingType ? results.filter((m) => m.type === _addWatchingType) : results;
  if (filtered.length === 0) {
    container.innerHTML = `<p class="add-watching-empty">No ${_addWatchingType || "results"} found for "${query}".</p>`;
    return;
  }
  filtered.slice(0, 12).forEach((movie) => {
    const alreadyWatching = profile ? isMovieCurrentlyWatching(profile, movie.id) : false;
    const item = document.createElement("div");
    item.className = "add-watching-result-item";

    const poster = document.createElement("img");
    poster.className = "add-watching-result-poster";
    poster.alt = movie.title || "";
    poster.src = movie.poster || "";
    poster.onerror = () => { poster.style.visibility = "hidden"; };

    const info = document.createElement("div");
    info.className = "add-watching-result-info";

    const title = document.createElement("div");
    title.className = "add-watching-result-title";
    title.textContent = movie.title || "";

    const meta = document.createElement("div");
    meta.className = "add-watching-result-meta";
    const parts = [];
    if (movie.year) parts.push(movie.year);
    if (movie.type) parts.push(movie.type === "series" ? "Series" : "Movie");
    if (movie.meta && movie.meta.includes("TMDb")) parts.push(movie.meta.match(/TMDb[\s]?[\d.]+/)?.[0] || "");
    meta.textContent = parts.filter(Boolean).join(" · ");

    const desc = document.createElement("div");
    desc.className = "add-watching-result-desc";
    desc.textContent = movie.summary || "";

    info.append(title, meta, desc);

    const addBtn = document.createElement("button");
    addBtn.className = alreadyWatching ? "add-watching-result-add added" : "add-watching-result-add";
    addBtn.textContent = alreadyWatching ? "Watching" : "+ Add";
    addBtn.disabled = alreadyWatching;
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (alreadyWatching) return;
      addMovieToCurrentlyWatching(movie);
      addBtn.textContent = "Watching";
      addBtn.disabled = true;
      addBtn.classList.add("added");
      showToast(`Added "${movie.title}" to Now Watching`, "success");
    });

    item.append(poster, info, addBtn);
    item.addEventListener("click", () => { if (!alreadyWatching) addBtn.click(); });
    container.appendChild(item);
  });
}

async function runAddWatchingSearch(query) {
  const reqId = ++_addWatchingRequestId;
  renderAddToWatchingResults([], true, query);
  try {
    const payload = await apiRequest(`/api/catalog/search?q=${encodeURIComponent(query)}`, { method: "GET" });
    if (reqId !== _addWatchingRequestId) return;
    const results = Array.isArray(payload?.titles) ? payload.titles : [];
    renderAddToWatchingResults(results, false, query);
  } catch {
    if (reqId !== _addWatchingRequestId) return;
    renderAddToWatchingResults([], false, query);
  }
}


document.querySelector("#trending-lang-filter")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".lang-chip");
  if (!btn) return;
  state.trendingLang = btn.dataset.lang || "";
  document.querySelectorAll("#trending-lang-filter .lang-chip").forEach((b) => b.classList.toggle("active", b === btn));
  renderHomeCollections();
});

document.querySelector("#upcoming-lang-filter")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".lang-chip");
  if (!btn) return;
  state.upcomingLang = btn.dataset.lang || "";
  document.querySelectorAll("#upcoming-lang-filter .lang-chip").forEach((b) => b.classList.toggle("active", b === btn));
  renderHomeCollections();
});

/* ============================================================
   MOBILE BOTTOM NAV
   ============================================================ */
document.querySelector("#mobile-bottom-nav")?.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-tab]");
  if (!btn) return;
  state.activeTab = btn.dataset.tab;
  renderHomeTabs();
  syncMobileBottomNav();
  if (state.activeTab === "mood") { renderMoodTab(); void loadMoodPicks(state.activeMood); }
  if (state.activeTab === "lists") { void loadCuratedLists(); void loadUserLists(); }
  if (state.activeTab === "profile") void loadProfilePage();
  if (state.activeTab === "admin") void loadAdminStats();
  if (state.activeTab === "requests") void loadRequestsTab();
  if (state.activeTab === "activity") void loadActivityFeed();
});

function syncMobileBottomNav() {
  document.querySelectorAll("#mobile-bottom-nav .mobile-nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === state.activeTab);
  });
}

/* ============================================================
   TAB CLICK — extend to load new tabs
   ============================================================ */
/* ============================================================
   PROFILE PAGE
   ============================================================ */
document.querySelector("#open-profile-button")?.addEventListener("click", () => {
  state.activeTab = "profile";
  renderHomeTabs();
  syncMobileBottomNav();
  void loadProfilePage();
});

async function handleSaveProfileSettings() {
  const nameInput = document.querySelector("#profile-edit-name");
  const handleInput = document.querySelector("#profile-edit-handle");
  const name = String(nameInput?.value || "").trim();
  const handle = String(handleInput?.value || "").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  if (!name || !handle) return;
  try {
    const payload = await apiRequest("/api/profile/settings", { method: "PUT", body: { name, handle } });
    if (state.currentUser) {
      state.currentUser.name = payload.user?.name || name;
      state.currentUser.handle = payload.user?.handle || handle;
    }
    updateAvatarBubble(state.currentUser?.name || "");
    void loadProfilePage();
  } catch (error) {
    alert(`Could not save: ${error.message}`);
  }
}

async function loadProfilePage() {
  try {
    const payload = await apiRequest("/api/profile/page", { method: "GET" });
    const { user, stats, recentWatched, recentLiked } = payload;

    // Large avatar — click opens avatar picker
    const avatarEl = document.querySelector("#profile-avatar-lg");
    if (avatarEl) {
      const avatarUrl = user?.avatarUrl || "";
      if (avatarUrl.startsWith("data:image/")) {
        avatarEl.style.backgroundImage = `url(${avatarUrl})`;
        avatarEl.style.backgroundSize = "cover";
        avatarEl.style.backgroundPosition = "center";
        avatarEl.textContent = "";
      } else if (avatarUrl.startsWith("preset:")) {
        const presetId = avatarUrl.slice(7);
        const preset = AVATAR_PRESETS.find((p) => p.id === presetId);
        avatarEl.style.background = preset ? `linear-gradient(${preset.gradient})` : "";
        avatarEl.style.backgroundImage = "";
        avatarEl.textContent = "";
      } else {
        avatarEl.style.backgroundImage = "";
        avatarEl.style.background = "";
        const initials = (user?.name || "MB").split(" ").map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
        avatarEl.textContent = initials;
      }
    }

    // Avatar button wires once
    const avatarBtn = document.querySelector("#profile-avatar-btn");
    if (avatarBtn && !avatarBtn.dataset.wired) {
      avatarBtn.dataset.wired = "1";
      avatarBtn.addEventListener("click", openAvatarPicker);
    }

    const nameEl = document.querySelector("#profile-name");
    if (nameEl) nameEl.textContent = user?.name || "—";

    // Handle display with copy
    const handleEl = document.querySelector("#profile-handle");
    if (handleEl) {
      handleEl.innerHTML = "";
      const handleText = document.createElement("span");
      handleText.textContent = `@${user?.handle || ""}`;
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "handle-copy-btn";
      copyBtn.title = "Copy ID";
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(user?.handle || "").then(() => {
          showToast("ID copied!", "success", 1800);
        });
      });
      handleEl.append(handleText, copyBtn);
    }

    // Inline edit wires once — clicking name or handle opens it
    const inlineEdit = document.querySelector("#profile-inline-edit");
    if (inlineEdit && nameEl && !nameEl.dataset.wired) {
      nameEl.dataset.wired = "1";
      nameEl.style.cursor = "pointer";
      nameEl.title = "Click to change your ID";

      const openEdit = () => {
        inlineEdit.classList.remove("hidden");
        const inp = document.querySelector("#profile-edit-handle");
        if (inp) { inp.value = state.currentUser?.handle || ""; inp.focus(); }
      };
      const closeEdit = () => inlineEdit.classList.add("hidden");

      nameEl.addEventListener("click", openEdit);
      handleEl?.addEventListener("click", openEdit);
      document.querySelector("#profile-edit-cancel")?.addEventListener("click", closeEdit);

      // Real-time uniqueness check
      let handleTimer = null;
      document.querySelector("#profile-edit-handle")?.addEventListener("input", (e) => {
        const val = e.target.value.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
        const status = document.querySelector("#profile-handle-status");
        if (!status) return;
        status.textContent = "";
        clearTimeout(handleTimer);
        if (!val || val.length < 3) return;
        handleTimer = setTimeout(async () => {
          const data = await apiRequest(`/api/auth/check-handle?handle=${encodeURIComponent(val)}`, { method: "GET" }).catch(() => null);
          if (!data) return;
          const isCurrent = val === (state.currentUser?.handle || "");
          status.textContent = (data.available || isCurrent) ? "✓ Available" : "✗ Taken";
          status.dataset.available = String(data.available || isCurrent);
        }, 400);
      });

      document.querySelector("#profile-save-settings-btn")?.addEventListener("click", async () => {
        const inp = document.querySelector("#profile-edit-handle");
        const status = document.querySelector("#profile-handle-status");
        const handle = inp?.value.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "") || "";
        if (handle.length < 3) { showToast("ID must be at least 3 characters.", "error"); return; }
        if (status?.dataset.available === "false") { showToast("That ID is already taken — choose another.", "error"); return; }
        try {
          await apiRequest("/api/profile/settings", { method: "PUT", body: { handle, name: state.currentUser?.name || handle } });
          if (state.currentUser) state.currentUser.handle = handle;
          if (document.querySelector("#current-user-id")) document.querySelector("#current-user-id").textContent = handle;
          closeEdit();
          showToast("Your ID has been updated.", "success");
          void loadProfilePage();
        } catch (err) {
          showToast(err.message || "Could not save.", "error");
        }
      });
    } else if (inlineEdit) {
      const inp = document.querySelector("#profile-edit-handle");
      if (inp && inp !== document.activeElement) inp.value = user?.handle || "";
    }

    document.querySelector("#profile-stat-watched").textContent = stats?.watched ?? 0;
    document.querySelector("#profile-stat-liked").textContent = stats?.liked ?? 0;
    document.querySelector("#profile-stat-wishlist").textContent = stats?.wishlist ?? 0;
    document.querySelector("#profile-stat-friends").textContent = stats?.friends ?? 0;

    const watchedGrid = document.querySelector("#profile-watched-grid");
    if (watchedGrid) {
      watchedGrid.innerHTML = "";
      if (recentWatched.length === 0) {
        watchedGrid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:8px 0;">Nothing watched yet.</p>';
      } else {
        recentWatched.forEach((item) => {
          const rating = Number(item.rating) || 0;
          const stars = rating > 0 ? "★".repeat(rating) + "☆".repeat(5 - rating) : "";
          const fakeMovie = { id: item.movieId, title: item.title, year: "", type: "movie", meta: "", summary: "", poster: item.poster || "", tags: [] };
          const context = stars ? `You rated: ${stars}` : "Watched";
          watchedGrid.appendChild(buildMovieCard(fakeMovie, { primaryLabel: "Watched ✓", primaryDisabled: true, context }));
        });
      }
    }

    const likedGrid = document.querySelector("#profile-liked-grid");
    if (likedGrid) {
      likedGrid.innerHTML = "";
      (recentLiked || []).forEach((movie) => {
        likedGrid.appendChild(buildMovieCard(movie, {
          primaryLabel: "Liked ♥",
          primaryDisabled: true,
        }));
      });
    }
    void loadInsights();

    // Wire privacy settings panel once
    const privacySaveBtn = document.getElementById("save-privacy-btn");
    if (privacySaveBtn && !privacySaveBtn.dataset.wired) {
      privacySaveBtn.dataset.wired = "1";
      const fp = getCurrentProfile()?.friendPrivacy || {};
      const wEl  = document.getElementById("privacy-show-wishlist");
      const lEl  = document.getElementById("privacy-show-liked");
      const wdEl = document.getElementById("privacy-show-watched");
      if (wEl)  wEl.checked  = fp.showWishlist !== false;
      if (lEl)  lEl.checked  = fp.showLiked    !== false;
      if (wdEl) wdEl.checked = Boolean(fp.showWatched);
      privacySaveBtn.addEventListener("click", async () => {
        try {
          await apiRequest("/api/profile/privacy", { method: "PUT", body: {
            showWishlist: wEl?.checked ?? true,
            showLiked:    lEl?.checked ?? true,
            showWatched:  wdEl?.checked ?? false,
          }});
          showToast("Privacy settings saved.", "success");
        } catch { showToast("Could not save privacy settings.", "error"); }
      });
    }

    // Load active devices
    void loadActiveSessions();
  } catch (error) {
    console.error("Profile load error", error);
  }
}

async function loadInsights() {
  try {
    const payload = await apiRequest("/api/profile/stats", { method: "GET" });
    const hoursEl = document.getElementById("stat-hours");
    const monthEl = document.getElementById("stat-this-month");
    const genreEl = document.getElementById("stat-top-genre");
    const friendsEl = document.getElementById("stat-friends-count");
    const avgRatingEl = document.getElementById("stat-avg-rating");
    const recsWatchedEl = document.getElementById("stat-recs-watched");
    if (hoursEl) hoursEl.textContent = payload.estimatedHours ?? "—";
    if (monthEl) monthEl.textContent = payload.watchedThisMonth ?? "—";
    if (genreEl) genreEl.textContent = payload.topGenre || "—";
    if (friendsEl) friendsEl.textContent = payload.friendsCount ?? "—";
    if (avgRatingEl) avgRatingEl.textContent = payload.avgRating ? payload.avgRating.toFixed(1) + "★" : "—";
    if (recsWatchedEl) recsWatchedEl.textContent = payload.recsWatched ?? "—";
    renderGenreBars(payload.topGenres || []);
    renderMonthlyChart(payload.byMonth || {});
  } catch { /* silent */ }
}

function renderGenreBars(topGenres) {
  const el = document.getElementById("genre-bars");
  if (!el) return;
  if (!topGenres.length) { el.innerHTML = ""; return; }
  const max = topGenres[0]?.count || 1;
  el.innerHTML = topGenres.map(({ name, count }) => `
    <div class="genre-bar-row">
      <span class="genre-bar-label">${escapeHtml(name)}</span>
      <div class="genre-bar-track"><div class="genre-bar-fill" style="width:${Math.round((count / max) * 100)}%"></div></div>
      <span class="genre-bar-count">${count}</span>
    </div>`).join("");
}

function renderMonthlyChart(byMonth) {
  const el = document.getElementById("monthly-chart");
  if (!el) return;
  const entries = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  if (!entries.length) { el.innerHTML = ""; return; }
  const max = Math.max(...entries.map(([, v]) => v), 1);
  el.innerHTML = entries.map(([month, count]) => `
    <div class="chart-bar-wrap">
      <div class="chart-bar" style="height:${Math.round((count / max) * 60)}px" title="${count} watched"></div>
      <span class="chart-label">${escapeHtml(month.slice(5))}</span>
    </div>`).join("");
}

/* ============================================================
   MOOD DISCOVERY
   ============================================================ */
const MOODS = [
  { id: "excited",     emoji: "⚡", label: "Action & Thrills",  color: "#f59e0b" },
  { id: "romantic",    emoji: "❤️", label: "Romance",           color: "#ec4899" },
  { id: "thoughtful",  emoji: "🌙", label: "Deep & Thoughtful", color: "#6366f1" },
  { id: "thrilled",    emoji: "🔪", label: "Crime & Mystery",   color: "#374151" },
  { id: "nostalgic",   emoji: "✨", label: "Nostalgic",         color: "#10b981" },
  { id: "adventurous", emoji: "🗺️", label: "Adventure",        color: "#3b82f6" },
  { id: "funny",       emoji: "😂", label: "Comedy",            color: "#f97316" },
  { id: "emotional",   emoji: "😢", label: "Emotional",         color: "#8b5cf6" },
  { id: "scary",       emoji: "👻", label: "Horror",            color: "#1f2937" },
  { id: "documentary", emoji: "📽️", label: "Documentary",      color: "#0d9488" },
];

const MOOD_LANGS = [
  { code: "", label: "All" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
];

state.activeMood = "thoughtful";

function renderMoodTab() {
  const grid = document.querySelector("#mood-grid");
  if (!grid || grid.dataset.rendered) return;
  grid.dataset.rendered = "1";
  MOODS.forEach(({ id, emoji, label, color }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mood-btn" + (id === state.activeMood ? " active" : "");
    btn.dataset.mood = id;
    btn.style.background = color + "22";
    btn.style.borderColor = id === state.activeMood ? color : "transparent";
    btn.innerHTML = `<span class="mood-emoji">${emoji}</span><span class="mood-label-text">${escapeHtml(label)}</span>`;
    grid.appendChild(btn);
  });

  const langChips = document.querySelector("#mood-lang-chips");
  const langFilter = document.querySelector("#mood-lang-filter");
  if (langChips) {
    langChips.innerHTML = "";
    MOOD_LANGS.forEach(({ code, label }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-chip" + (code === state.activeMoodLang ? " active" : "");
      btn.dataset.lang = code;
      btn.textContent = label;
      btn.addEventListener("click", () => {
        langChips.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        state.activeMoodLang = code;
        void loadMoodPicks(state.activeMood);
      });
      langChips.appendChild(btn);
    });
    langFilter?.classList.remove("hidden");
  }
}

document.querySelector("#mood-grid")?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-mood]");
  if (!card) return;
  const mood = card.dataset.mood;
  const moodDef = MOODS.find((m) => m.id === mood);
  state.activeMood = mood;
  document.querySelectorAll("#mood-grid .mood-btn").forEach((c) => {
    const def = MOODS.find((m) => m.id === c.dataset.mood);
    c.classList.toggle("active", c.dataset.mood === mood);
    c.style.borderColor = c.dataset.mood === mood ? (def?.color || "transparent") : "transparent";
  });
  const label = document.querySelector("#mood-picks-label");
  if (label) {
    label.classList.remove("hidden");
    label.textContent = moodDef ? `${moodDef.emoji} ${moodDef.label}${state.activeMoodLang ? ` — ${MOOD_LANGS.find((l) => l.code === state.activeMoodLang)?.label || ""}` : ""}` : "";
  }
  void loadMoodPicks(mood);
});

document.querySelector("#surprise-me-btn")?.addEventListener("click", () => {
  const random = MOODS[Math.floor(Math.random() * MOODS.length)];
  const btn = document.querySelector(`#mood-grid [data-mood="${random.id}"]`);
  btn?.click();
});

async function loadMoodPicks(mood) {
  if (!mood) mood = "thoughtful";
  const grid = document.querySelector("#mood-picks-grid");
  if (!grid) return;
  grid.innerHTML = buildSkeletonCards(4);
  const langParam = state.activeMoodLang ? `&lang=${encodeURIComponent(state.activeMoodLang)}` : "";
  try {
    const payload = await apiRequest(`/api/mood/discover?mood=${encodeURIComponent(mood)}${langParam}`, { method: "GET" });
    grid.innerHTML = "";
    const profile = getCurrentProfile();
    const liked = new Set((profile?.liked || []).map((m) => m.id));
    const wishlist = new Set((profile?.wishlist || []).map((m) => m.id));
    (payload.picks || []).forEach((movie) => {
      grid.appendChild(buildMovieCard(movie, {
        includeQuickWatch: true,
        primaryLabel: liked.has(movie.id) ? "Liked ♥" : "Like",
        primaryDisabled: liked.has(movie.id),
        onPrimary: () => handleCardAction(movie, "liked"),
        secondaryLabel: wishlist.has(movie.id) ? "Saved" : "Wishlist",
        secondaryDisabled: wishlist.has(movie.id),
        onSecondary: () => handleCardAction(movie, "wishlist"),
      }));
    });
    if (grid.children.length === 0) {
      grid.append(createEmptyCard("No picks right now", "TMDb API powers mood discovery. Add your TMDB_API_KEY to unlock this section, or like more titles to improve suggestions."));
    }
  } catch {
    grid.append(createEmptyCard("Could not load picks", "Check your connection or TMDb API key and try again."));
  }
}

/* ============================================================
   CURATED LISTS
   ============================================================ */
async function loadCuratedLists() {
  const container = document.querySelector("#curated-lists-grid");
  if (!container) return;
  container.innerHTML = buildSkeletonCards(6);
  try {
    const payload = await apiRequest("/api/lists/curated", { method: "GET" });
    container.innerHTML = "";
    const profile = getCurrentProfile();
    const liked = new Set((profile?.liked || []).map((m) => m.id));
    const wishlist = new Set((profile?.wishlist || []).map((m) => m.id));
    const lists = payload.lists || [];
    const populated = lists.filter((list) => (list.movies || []).length > 0);
    if (populated.length === 0) {
      container.append(createEmptyCard("Curated lists unavailable", "Add your TMDB_API_KEY to unlock curated collections powered by TMDb."));
    } else {
      populated.forEach((list) => {
        const section = document.createElement("div");
        section.innerHTML = `<p class="list-section-title">${escapeHtml(list.name)}</p><p class="list-section-desc">${escapeHtml(list.description)}</p>`;
        const rail = document.createElement("div");
        rail.className = "movie-grid movie-rail";
        (list.movies || []).forEach((movie) => {
          rail.appendChild(buildMovieCard(movie, {
            primaryLabel: liked.has(movie.id) ? "Liked ♥" : "Like",
            primaryDisabled: liked.has(movie.id),
            onPrimary: () => handleCardAction(movie, "liked"),
            secondaryLabel: wishlist.has(movie.id) ? "Saved" : "Wishlist",
            secondaryDisabled: wishlist.has(movie.id),
            onSecondary: () => handleCardAction(movie, "wishlist"),
          }));
        });
        section.appendChild(rail);
        container.appendChild(section);
      });
    }
  } catch {
    container.append(createEmptyCard("Could not load lists", "Check your connection or TMDb API key and try again."));
  }
}

/* ============================================================
   ACTIVE DEVICES
   ============================================================ */
const DEVICE_ICONS = {
  iPhone: "📱", iPad: "📱", Android: "📱",
  Windows: "💻", Mac: "💻", Linux: "💻",
};

function deviceIcon(deviceInfo) {
  for (const [key, icon] of Object.entries(DEVICE_ICONS)) {
    if (deviceInfo.includes(key)) return icon;
  }
  return "🖥️";
}

async function loadActiveSessions() {
  const list = document.querySelector("#active-devices-list");
  if (!list) return;
  list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Loading…</p>';
  try {
    const { sessions } = await apiRequest("/api/auth/sessions", { method: "GET" });
    list.innerHTML = "";

    sessions.forEach((s) => {
      const card = document.createElement("div");
      card.className = "device-card" + (s.isCurrent ? " device-card-current" : "");
      const loginDate = new Date(s.createdAt).toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      const expDate = new Date(s.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
      card.innerHTML = `
        <div class="device-icon">${deviceIcon(s.deviceInfo)}</div>
        <div class="device-info">
          <strong class="device-name">${escapeHtml(s.deviceInfo)}${s.isCurrent ? ' <span class="device-current-badge">This device</span>' : ""}</strong>
          <span class="device-meta">Signed in ${loginDate} · expires ${expDate}</span>
        </div>
        ${!s.isCurrent ? `<button class="device-signout-btn" data-token="${escapeHtml(s.token)}" type="button">Sign out</button>` : ""}
      `;
      list.appendChild(card);
    });

    // Wire individual sign-out buttons
    list.querySelectorAll(".device-signout-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "Signing out…";
        try {
          await apiRequest(`/api/auth/sessions/${encodeURIComponent(btn.dataset.token)}`, { method: "DELETE" });
          void loadActiveSessions();
        } catch {
          btn.disabled = false;
          btn.textContent = "Sign out";
          showToast("Could not sign out that device.", "error");
        }
      });
    });
  } catch {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Could not load devices.</p>';
  }
}

// Wire "Sign out other devices" bulk button
document.querySelector("#signout-all-devices-btn")?.addEventListener("click", async () => {
  const btn = document.querySelector("#signout-all-devices-btn");
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = "Signing out…";
  try {
    await apiRequest("/api/auth/sessions", { method: "DELETE" });
    showToast("All other devices signed out.", "success");
    void loadActiveSessions();
  } catch {
    showToast("Could not sign out other devices.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign out other devices";
  }
});

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
async function loadAdminStats() {
  const grid = document.querySelector("#admin-stats-grid");
  const migrationsList = document.querySelector("#admin-migrations-list");
  if (!grid) return;
  grid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Loading…</p>';
  try {
    const payload = await apiRequest("/api/admin/stats", { method: "GET" });
    const { stats, migrations } = payload;
    grid.innerHTML = `
      <div class="admin-stat-card"><strong>${stats.users}</strong><span>Total users</span></div>
      <div class="admin-stat-card"><strong>${stats.activeSessions}</strong><span>Active sessions</span></div>
      <div class="admin-stat-card"><strong>${stats.profiles}</strong><span>User profiles</span></div>
    `;
    if (migrationsList) {
      migrationsList.innerHTML = migrations.length === 0
        ? '<p style="color:var(--text-muted);font-size:13px;">No migrations recorded.</p>'
        : migrations.map((m) => `<p style="font-size:12px;color:var(--text-secondary);margin-bottom:4px;">v${m.version} — applied ${new Date(m.applied_at).toLocaleString()}</p>`).join("");
    }
    document.querySelector("#tab-button-admin")?.classList.remove("hidden");
    document.querySelector("#tab-button-requests")?.classList.remove("hidden");
    void loadRequestsTab();
  } catch (error) {
    grid.innerHTML = `<p style="color:var(--danger);font-size:13px;">${error.message === "Forbidden." ? "Admin access not configured." : "Could not load admin stats."}</p>`;
  }
}

document.querySelector("#refresh-admin-button")?.addEventListener("click", () => void loadAdminStats());

/* ============================================================
   REQUESTS / FEEDBACK TAB (creator only)
   ============================================================ */
const TYPE_META = {
  bug:          { label: "Bug Report",        color: "#ef4444", bg: "rgba(239,68,68,.12)" },
  feature:      { label: "Feature Request",   color: "#3b82f6", bg: "rgba(59,130,246,.12)" },
  appreciation: { label: "Appreciation",      color: "#22c55e", bg: "rgba(34,197,94,.12)" },
  other:        { label: "Other",             color: "#a855f7", bg: "rgba(168,85,247,.12)" },
};

async function loadRequestsTab() {
  const list = document.querySelector("#requests-list");
  const badge = document.querySelector("#requests-badge");
  if (!list) return;
  list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px 0;">Loading…</p>';
  try {
    const { messages, unread } = await apiRequest("/api/admin/requests", { method: "GET" });

    // Reveal tab if not already
    document.querySelector("#tab-button-requests")?.classList.remove("hidden");

    // Update unread badge
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }

    if (!messages.length) {
      list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px 0;">No messages yet. Share the docs link and messages will show up here.</p>';
      return;
    }

    list.innerHTML = "";
    messages.forEach((msg) => {
      const meta = TYPE_META[msg.type] || TYPE_META.other;
      const card = document.createElement("div");
      card.className = "request-card" + (msg.status === "new" ? " request-card-new" : "");
      card.dataset.id = msg.id;
      card.innerHTML = `
        <div class="request-card-header">
          <span class="request-type-badge" style="color:${meta.color};background:${meta.bg};">${meta.label}</span>
          ${msg.status === "new" ? '<span class="request-new-dot"></span>' : ""}
          <span class="request-date">${new Date(Number(msg.created_at)).toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}</span>
          <div class="request-actions-row">
            ${msg.status === "new" ? `<button class="request-mark-read" data-id="${escapeHtml(msg.id)}" type="button" title="Mark as read">✓ Read</button>` : ""}
            <button class="request-delete-btn" data-id="${escapeHtml(msg.id)}" type="button" title="Delete">✕</button>
          </div>
        </div>
        <p class="request-message">${escapeHtml(msg.message)}</p>
        ${msg.name || msg.email ? `<p class="request-from">From: ${escapeHtml(msg.name || "")}${msg.name && msg.email ? " · " : ""}${msg.email ? `<a href="mailto:${escapeHtml(msg.email)}" style="color:var(--accent);">${escapeHtml(msg.email)}</a>` : ""}</p>` : ""}
      `;
      list.appendChild(card);
    });

    // Wire mark-read buttons
    list.querySelectorAll(".request-mark-read").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        try {
          await apiRequest(`/api/admin/requests/${id}/read`, { method: "PUT" });
          void loadRequestsTab();
        } catch { /* ignore */ }
      });
    });

    // Wire delete buttons
    list.querySelectorAll(".request-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        try {
          await apiRequest(`/api/admin/requests/${id}`, { method: "DELETE" });
          void loadRequestsTab();
        } catch { /* ignore */ }
      });
    });

  } catch (err) {
    if (err.message === "Forbidden.") {
      list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Access denied.</p>';
    } else {
      list.innerHTML = `<p style="color:var(--danger);font-size:13px;">Could not load requests.</p>`;
    }
  }
}

document.querySelector("#refresh-requests-button")?.addEventListener("click", () => void loadRequestsTab());

/* ============================================================
   MOVIE DETAIL DRAWER
   ============================================================ */
const movieDetailOverlay = document.querySelector("#movie-detail-overlay");

function openMovieDetail(movie) {
  if (!movieDetailOverlay) return;
  const posterImg = document.querySelector("#movie-detail-poster-img");
  const titleEl = document.querySelector("#movie-detail-title");
  const metaEl = document.querySelector("#movie-detail-meta");
  const badgesEl = document.querySelector("#movie-detail-badges");
  const summaryEl = document.querySelector("#movie-detail-summary");
  const actionsEl = document.querySelector("#movie-detail-actions");

  if (posterImg) {
    if (movie.poster && movie.poster.startsWith("http")) {
      posterImg.src = movie.poster;
      posterImg.alt = movie.title;
      posterImg.style.display = "block";
    } else {
      posterImg.src = "";
      posterImg.style.display = "none";
      const wrap = document.querySelector("#movie-detail-poster-wrap");
      if (wrap) wrap.style.background = movie.poster || "var(--bg-card)";
    }
  }
  if (titleEl) titleEl.textContent = movie.title;
  if (metaEl) metaEl.textContent = [movie.year, movie.meta].filter(Boolean).join(" • ");
  if (badgesEl) {
    badgesEl.innerHTML = "";
    (movie.tags || []).slice(0, 4).forEach((tag) => {
      const span = document.createElement("span");
      span.className = "movie-detail-badge";
      span.textContent = tag;
      badgesEl.appendChild(span);
    });
  }
  if (summaryEl) summaryEl.textContent = movie.summary || "No description available.";
  if (actionsEl) {
    actionsEl.innerHTML = "";
    const profile = getCurrentProfile();
    const liked = profile?.liked?.some((m) => m.id === movie.id);
    const wishlisted = profile?.wishlist?.some((m) => m.id === movie.id);
    [
      { label: liked ? "Liked ♥" : "Like", disabled: liked, onClick: () => { handleCardAction(movie, "liked"); closeMovieDetail(); } },
      { label: wishlisted ? "Saved" : "Add to Wishlist", disabled: wishlisted, onClick: () => { handleCardAction(movie, "wishlist"); closeMovieDetail(); } },
      { label: "Share", disabled: false, onClick: () => openShareModal(movie) },
      movie.watchUrl ? { label: "Where to Watch →", href: movie.watchUrl } : null,
    ].filter(Boolean).forEach(({ label, disabled, onClick, href }) => {
      const el = href ? document.createElement("a") : document.createElement("button");
      el.textContent = label;
      if (href) {
        el.href = href; el.target = "_blank"; el.rel = "noreferrer noopener";
        el.className = "secondary-action";
      } else {
        el.type = "button"; el.disabled = Boolean(disabled);
        el.className = disabled ? "secondary-action" : "save-button";
        if (onClick) el.addEventListener("click", onClick);
      }
      actionsEl.appendChild(el);
    });
  }

  const providersEl = document.getElementById("movie-detail-providers");
  const castEl = document.getElementById("movie-detail-cast");
  const castListEl = document.getElementById("movie-detail-cast-list");
  if (providersEl) { providersEl.innerHTML = ""; providersEl.classList.add("hidden"); }
  if (castEl) castEl.classList.add("hidden");
  if (castListEl) castListEl.innerHTML = "";

  movieDetailOverlay.classList.add("open");
  document.body.style.overflow = "hidden";

  const tmdbId = movie.ids?.tmdb;
  if (tmdbId) {
    if (actionsEl) {
      apiRequest(`/api/catalog/trailer?tmdb_id=${encodeURIComponent(tmdbId)}`, { method: "GET" })
        .then((payload) => {
          if (payload.url && actionsEl && movieDetailOverlay.classList.contains("open")) {
            const trailerBtn = document.createElement("a");
            trailerBtn.href = payload.url;
            trailerBtn.target = "_blank";
            trailerBtn.rel = "noreferrer noopener";
            trailerBtn.className = "secondary-action";
            trailerBtn.textContent = "Watch Trailer →";
            actionsEl.appendChild(trailerBtn);
          }
        })
        .catch(() => {});
    }

    apiRequest(`/api/catalog/tmdb-detail?tmdb_id=${encodeURIComponent(tmdbId)}&type=${encodeURIComponent(movie.type || "movie")}`, { method: "GET" })
      .then(({ movie: detail }) => {
        if (!detail || !movieDetailOverlay.classList.contains("open")) return;
        if (providersEl && detail.providers?.length > 0) {
          providersEl.innerHTML = detail.providers.map((p) => `<span class="provider-chip">${escapeHtml(p)}</span>`).join("");
          providersEl.classList.remove("hidden");
        }
        if (castListEl && castEl && detail.cast?.length > 0) {
          castListEl.innerHTML = detail.cast.map((name) => `<span class="cast-chip">${escapeHtml(name)}</span>`).join("");
          castEl.classList.remove("hidden");
        }
        if (detail.director && metaEl && !metaEl.textContent.includes(detail.director)) {
          metaEl.textContent += ` • ${detail.director}`;
        }
      })
      .catch(() => {});
  }
}

function closeMovieDetail() {
  movieDetailOverlay?.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelector("#movie-detail-close")?.addEventListener("click", closeMovieDetail);
movieDetailOverlay?.addEventListener("click", (event) => {
  if (event.target === movieDetailOverlay) closeMovieDetail();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && movieDetailOverlay?.classList.contains("open")) closeMovieDetail();
});

document.addEventListener("click", (event) => {
  const card = event.target.closest(".movie-card");
  if (!card) return;
  if (event.target.closest("button, a")) return;
  const title = card.querySelector(".movie-title")?.textContent;
  const year = card.querySelector(".movie-year")?.textContent;
  const meta = card.querySelector(".movie-meta")?.textContent;
  const summary = card.querySelector(".movie-summary")?.textContent;
  const type = card.querySelector(".movie-type")?.textContent?.toLowerCase().includes("series") ? "series" : "movie";
  const posterStyle = card.querySelector(".movie-poster")?.style.getPropertyValue("--poster") || "";
  const posterImg = card.querySelector(".movie-poster img")?.src || "";
  if (!title) return;
  const tmdbId = card.dataset.tmdbId || "";
  openMovieDetail({
    id: card.dataset.movieId || title,
    title,
    year: year || "",
    meta: meta || "",
    summary: summary || "",
    type,
    poster: posterImg || posterStyle,
    tags: [],
    watchUrl: "",
    ids: tmdbId ? { tmdb: tmdbId } : undefined,
  });
});

/* ============================================================
   SKELETON LOADING HELPER
   ============================================================ */
function buildSkeletonCards(count) {
  return Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skeleton-poster"></div>
      <div class="skeleton-body">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line xshort"></div>
      </div>
    </div>
  `).join("") + `<div class="skeleton-quote">${buildSkeletonQuoteHtml()}</div>`;
}

function buildSkeletonQuoteHtml() {
  const q = getRandomQuote();
  return `<span class="skeleton-quote-text">"${escapeHtml(q.text)}"</span><span class="skeleton-quote-src"> — ${escapeHtml(q.source)}</span>`;
}

/* ============================================================
   CARD ACTION HELPER (centralised like/wishlist)
   ============================================================ */
function handleCardAction(movie, collection) {
  const profile = getCurrentProfile();
  if (!profile) return;
  const list = profile[collection] || [];
  const exists = list.some((m) => m.id === movie.id);
  if (!exists) {
    profile[collection] = [movie, ...list];
    persistProfiles();
    render();
    void flushProfileSync();
  }
}

/* ============================================================
   SHARE MODAL
   ============================================================ */
function openShareModal(movie) {
  state.shareTarget = movie;
  const title = document.getElementById("share-movie-title");
  const overlay = document.getElementById("share-overlay");
  const canvas = document.getElementById("share-canvas");
  if (title) title.textContent = movie.title;
  if (canvas) { canvas.style.display = "none"; }
  if (overlay) overlay.classList.remove("hidden");
}

document.getElementById("close-share")?.addEventListener("click", () => {
  document.getElementById("share-overlay")?.classList.add("hidden");
});
document.getElementById("share-overlay")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.add("hidden");
});

document.getElementById("share-text-btn")?.addEventListener("click", async () => {
  const movie = state.shareTarget;
  if (!movie) return;
  const text = `Check out "${movie.title}" on Movie Buddy!`;
  const url = window.location.origin;
  if (navigator.share) {
    try { await navigator.share({ title: movie.title, text, url }); } catch { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
    showToast("Link copied to clipboard!", "success");
  }
  document.getElementById("share-overlay")?.classList.add("hidden");
});

document.getElementById("share-image-btn")?.addEventListener("click", async () => {
  const movie = state.shareTarget;
  if (!movie) return;
  const canvas = document.getElementById("share-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.style.display = "block";

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, 560);
  grad.addColorStop(0, "#0d0d1a");
  grad.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 560);

  // Poster image
  const posterUrl = typeof movie.poster === "string" && movie.poster.startsWith("http") ? movie.poster : null;
  if (posterUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((res) => { img.onload = res; img.onerror = res; img.src = posterUrl; });
      ctx.drawImage(img, 0, 0, 400, 420);
    } catch { /* no poster */ }
  }

  // Gradient overlay
  const overlay = ctx.createLinearGradient(0, 300, 0, 560);
  overlay.addColorStop(0, "rgba(0,0,0,0)");
  overlay.addColorStop(1, "rgba(0,0,0,0.95)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 300, 400, 260);

  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "bold 26px sans-serif";
  const titleText = (movie.title || "").slice(0, 30);
  ctx.fillText(titleText, 20, 460);

  if (movie.year) {
    ctx.fillStyle = "#aaa";
    ctx.font = "16px sans-serif";
    ctx.fillText(String(movie.year), 20, 486);
  }

  // App branding
  ctx.fillStyle = "#e8a020";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("Movie Buddy", 20, 540);
  ctx.fillStyle = "#aaa";
  ctx.font = "12px sans-serif";
  ctx.fillText(window.location.origin, 20, 555);

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], "movie-card.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: movie.title }); } catch { /* cancelled */ }
      document.getElementById("share-overlay")?.classList.add("hidden");
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(movie.title || "movie").replace(/[^a-z0-9]/gi, "-")}-movie-buddy.png`;
      a.click();
      showToast("Image downloaded!", "success");
      document.getElementById("share-overlay")?.classList.add("hidden");
    }
  }, "image/png");
});

/* ============================================================
   FRIEND PROFILE MODAL
   ============================================================ */
async function openFriendProfile(friendId) {
  const overlay  = document.getElementById("friend-profile-overlay");
  const body     = document.getElementById("friend-profile-body");
  const nameEl   = document.getElementById("friend-profile-name");
  const handleEl = document.getElementById("friend-profile-handle");
  const avatarEl = document.getElementById("friend-profile-avatar");
  if (!overlay) return;
  if (body) body.innerHTML = '<p style="color:var(--text-muted);padding:24px 0;text-align:center">Loading…</p>';
  overlay.classList.remove("hidden");
  try {
    const data = await apiRequest(`/api/friends/profile?friendId=${encodeURIComponent(friendId)}`, { method: "GET" });
    const friend = data.friend || {};
    const initials = (friend.name || "?").split(" ").map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
    if (nameEl)   nameEl.textContent   = friend.name   || "—";
    if (handleEl) handleEl.textContent = `@${friend.handle || ""}`;
    if (avatarEl) avatarEl.textContent = initials;
    if (!body) return;
    body.innerHTML = "";
    if (data.status === "not_friends") {
      body.innerHTML = `<div class="friend-profile-gate"><span class="friend-profile-gate-icon">🔒</span><p>Add them as a friend and once they accept you will be able to see their profile.</p></div>`;
    } else if (data.status === "pending") {
      body.innerHTML = `<div class="friend-profile-gate"><span class="friend-profile-gate-icon">⏳</span><p>Your friend request is pending. Once they accept, you'll be able to see their profile.</p></div>`;
    } else {
      renderFriendProfileContent(body, data);
    }
  } catch {
    if (body) body.innerHTML = '<p style="color:var(--text-muted);padding:16px 0;text-align:center">Could not load profile.</p>';
  }
}

function renderFriendProfileContent(container, data) {
  const allHidden = data.wishlist === null && data.liked === null;
  if (allHidden) {
    container.innerHTML = `<div class="friend-profile-gate"><span class="friend-profile-gate-icon">🙈</span><p>${escapeHtml(data.friend?.name || "This user")} has hidden their list from viewing.</p></div>`;
    return;
  }
  if (data.wishlist && data.wishlist.length > 0) {
    const sec = document.createElement("div");
    sec.className = "friend-profile-section";
    sec.innerHTML = `<p class="eyebrow" style="margin-bottom:8px">Wishlist</p>`;
    const rail = document.createElement("div");
    rail.className = "movie-grid movie-rail";
    data.wishlist.forEach((movie) => {
      rail.appendChild(buildMovieCard(movie, {
        primaryLabel: "Like", onPrimary: () => handleCardAction(movie, "liked"),
        secondaryLabel: "Wishlist", onSecondary: () => handleCardAction(movie, "wishlist"),
      }));
    });
    sec.appendChild(rail);
    container.appendChild(sec);
  }
  if (data.liked && data.liked.length > 0) {
    const sec = document.createElement("div");
    sec.className = "friend-profile-section";
    sec.innerHTML = `<p class="eyebrow" style="margin-bottom:8px">Liked movies</p>`;
    const rail = document.createElement("div");
    rail.className = "movie-grid movie-rail";
    data.liked.forEach((movie) => {
      rail.appendChild(buildMovieCard(movie, {
        primaryLabel: "Like", onPrimary: () => handleCardAction(movie, "liked"),
        secondaryLabel: "Wishlist", onSecondary: () => handleCardAction(movie, "wishlist"),
      }));
    });
    sec.appendChild(rail);
    container.appendChild(sec);
  }
  if (!container.children.length) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:8px 0">Nothing to show yet — they haven\'t added any movies.</p>';
  }
}

document.getElementById("close-friend-profile")?.addEventListener("click", () =>
  document.getElementById("friend-profile-overlay")?.classList.add("hidden"));
document.getElementById("friend-profile-overlay")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.add("hidden");
});

/* ============================================================
   SEND TO FRIEND
   ============================================================ */
function openSendToFriend(movie) {
  state.sendFriendTarget = movie;
  state.sendFriendSelectedUserId = null;
  const titleEl = document.getElementById("send-friend-movie-title");
  const noteEl = document.getElementById("send-friend-note");
  const listEl = document.getElementById("send-friend-list");
  const overlay = document.getElementById("send-friend-overlay");
  if (titleEl) titleEl.textContent = movie.title;
  if (noteEl) noteEl.value = "";
  if (listEl) {
    listEl.innerHTML = "";
    const profile = getCurrentProfile();
    const friendIds = profile?.friendIds || [];
    const friends = Object.values(state.userDirectory || {}).filter((u) => friendIds.includes(u.id));
    if (friends.length === 0) {
      listEl.innerHTML = '<p class="empty-msg" style="font-size:13px;color:var(--text-muted)">Add friends first to send recommendations.</p>';
    } else {
      friends.forEach((friend) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "friend-pick-btn";
        btn.textContent = `${friend.name}${friend.handle ? " @" + friend.handle : ""}`;
        btn.dataset.userId = friend.id;
        btn.addEventListener("click", () => {
          listEl.querySelectorAll(".friend-pick-btn").forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
          state.sendFriendSelectedUserId = friend.id;
        });
        listEl.appendChild(btn);
      });
    }
  }
  if (overlay) overlay.classList.remove("hidden");
}

document.getElementById("close-send-friend")?.addEventListener("click", () => {
  document.getElementById("send-friend-overlay")?.classList.add("hidden");
});
document.getElementById("send-friend-overlay")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.add("hidden");
});

document.getElementById("confirm-send-friend")?.addEventListener("click", async () => {
  if (!state.sendFriendTarget || !state.sendFriendSelectedUserId) {
    showToast("Select a friend first.", "error"); return;
  }
  const note = document.getElementById("send-friend-note")?.value.trim() || "";
  try {
    await apiRequest("/api/recommendations/send", {
      method: "POST",
      body: { toUserId: state.sendFriendSelectedUserId, movie: state.sendFriendTarget, note },
    });
    document.getElementById("send-friend-overlay")?.classList.add("hidden");
    showToast("Recommendation sent!", "success");
  } catch (err) {
    showToast(err.message || "Could not send.", "error");
  }
});

/* ============================================================
   SERVICE WORKER REGISTRATION
   ============================================================ */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(message, type = "info", duration = 3000, onUndo = null) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  const text = document.createElement("span");
  text.textContent = message;
  el.appendChild(text);
  if (onUndo) {
    const btn = document.createElement("button");
    btn.className = "toast-undo-btn";
    btn.textContent = "Undo";
    btn.addEventListener("click", () => { el.remove(); onUndo(); });
    el.appendChild(btn);
  }
  container.appendChild(el);
  setTimeout(() => el.classList.add("toast-out"), Math.max(duration - 300, 0));
  setTimeout(() => el.remove(), duration);
}

/* ============================================================
   ACTIVITY FEED
   ============================================================ */
async function loadActivityFeed() {
  const container = document.getElementById("activity-feed-list");
  if (!container) return;
  container.innerHTML = buildSkeletonCards(3);
  try {
    const payload = await apiRequest("/api/activity", { method: "GET" });
    const events = payload.events || [];
    container.innerHTML = "";
    if (events.length === 0) {
      container.innerHTML = '<p class="activity-empty">No activity yet. Add friends to see what they\'re watching.</p>';
      return;
    }
    events.forEach((event) => {
      const item = buildActivityItem(event);
      if (item) container.appendChild(item);
    });
  } catch {
    container.innerHTML = '<p class="activity-empty">Could not load activity.</p>';
  }
}

function buildActivityItem(event) {
  const typeLabels = {
    liked: "liked",
    wishlisted: "added to wishlist",
    watched: "marked as watched",
    sent_recommendation: "recommended",
    new_friendship: "connected with a friend",
    created_list: "created a list",
  };
  const label = typeLabels[event.type] || event.type.replace(/_/g, " ");
  const subject = event.payload?.title || event.payload?.listName || "";
  const initials = (event.userName || "?").split(" ").map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
  const timeAgo = formatTimeAgo(event.createdAt);
  const item = document.createElement("div");
  item.className = "activity-item";
  item.dataset.activityId = event.id;

  // Reaction bar
  const EMOJIS = ["👍", "❤️", "🎬", "😮", "😂"];
  const reactionMap = {};
  (event.reactions || []).forEach((r) => { reactionMap[r.emoji] = r; });

  const reactionBar = document.createElement("div");
  reactionBar.className = "activity-reactions";
  EMOJIS.forEach((emoji) => {
    const r = reactionMap[emoji];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "reaction-btn" + (r?.mine ? " reacted" : "");
    btn.title = emoji;
    btn.textContent = `${emoji}${r?.count ? " " + r.count : ""}`;
    btn.addEventListener("click", async () => {
      try {
        const res = await apiRequest(`/api/activity/${event.id}/react`, { method: "POST", body: { emoji } });
        const newMap = {};
        (res.reactions || []).forEach((rv) => { newMap[rv.emoji] = rv; });
        EMOJIS.forEach((e, i) => {
          const b = reactionBar.children[i];
          if (!b) return;
          const rv = newMap[e];
          b.className = "reaction-btn" + (rv?.mine ? " reacted" : "");
          b.textContent = `${e}${rv?.count ? " " + rv.count : ""}`;
        });
      } catch { /* ignore */ }
    });
    reactionBar.appendChild(btn);
  });

  // Comment toggle
  const commentCount = event.commentCount || 0;
  const commentToggle = document.createElement("button");
  commentToggle.type = "button";
  commentToggle.className = "comment-toggle-btn";
  commentToggle.textContent = `💬 ${commentCount > 0 ? commentCount + " comment" + (commentCount > 1 ? "s" : "") : "Comment"}`;

  const commentSection = document.createElement("div");
  commentSection.className = "comment-thread hidden";
  let commentsLoaded = false;

  commentToggle.addEventListener("click", async () => {
    if (commentSection.classList.contains("hidden")) {
      commentSection.classList.remove("hidden");
      if (!commentsLoaded) {
        commentsLoaded = true;
        commentSection.innerHTML = '<p style="font-size:12px;color:var(--text-muted)">Loading…</p>';
        try {
          const res = await apiRequest(`/api/activity/${event.id}/comments`, { method: "GET" });
          commentSection.innerHTML = "";
          (res.comments || []).forEach((c) => {
            const div = document.createElement("div");
            div.className = "comment-item";
            div.innerHTML = `<span class="comment-author">${escapeHtml(c.userName)}</span>${escapeHtml(c.text)}<span style="color:var(--text-muted);font-size:11px;margin-left:6px">${escapeHtml(formatTimeAgo(c.createdAt))}</span>`;
            commentSection.appendChild(div);
          });
          appendCommentInput(commentSection, event.id, commentToggle);
        } catch { commentSection.innerHTML = ""; appendCommentInput(commentSection, event.id, commentToggle); }
      }
    } else {
      commentSection.classList.add("hidden");
    }
  });

  item.innerHTML = `
    <div class="activity-avatar">${escapeHtml(initials)}</div>
    <div class="activity-body">
      <p class="activity-text"><strong>${escapeHtml(event.userName)}</strong> ${escapeHtml(label)}${subject ? ` <span class="activity-movie">${escapeHtml(subject)}</span>` : ""}</p>
      <p class="activity-time">${escapeHtml(timeAgo)}</p>
    </div>`;
  item.appendChild(reactionBar);
  item.appendChild(commentToggle);
  item.appendChild(commentSection);
  return item;
}

function appendCommentInput(container, activityId, toggleBtn) {
  const row = document.createElement("div");
  row.className = "comment-input-row";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Add a comment…";
  input.maxLength = 280;
  const sendBtn = document.createElement("button");
  sendBtn.type = "button";
  sendBtn.className = "save-button";
  sendBtn.style.padding = "4px 10px";
  sendBtn.textContent = "Post";
  sendBtn.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) return;
    try {
      const res = await apiRequest(`/api/activity/${activityId}/comment`, { method: "POST", body: { text } });
      if (res.comment) {
        const div = document.createElement("div");
        div.className = "comment-item";
        div.innerHTML = `<span class="comment-author">${escapeHtml(res.comment.userName)}</span>${escapeHtml(res.comment.text)}`;
        container.insertBefore(div, row);
        input.value = "";
        // Update toggle button count
        const current = parseInt(toggleBtn.textContent.match(/\d+/)?.[0] || "0", 10);
        const next = current + 1;
        toggleBtn.textContent = `💬 ${next} comment${next > 1 ? "s" : ""}`;
      }
    } catch { showToast("Could not post comment.", "error"); }
  });
  row.append(input, sendBtn);
  container.appendChild(row);
}

function formatTimeAgo(ts) {
  const delta = Date.now() - ts;
  if (delta < 60000) return "just now";
  if (delta < 3600000) return `${Math.floor(delta / 60000)}m ago`;
  if (delta < 86400000) return `${Math.floor(delta / 3600000)}h ago`;
  return `${Math.floor(delta / 86400000)}d ago`;
}

document.getElementById("refresh-activity-button")?.addEventListener("click", () => void loadActivityFeed());

/* ============================================================
   USER LISTS
   ============================================================ */
async function loadUserLists() {
  const container = document.getElementById("my-lists-grid");
  if (!container) return;
  container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Loading…</p>';
  try {
    const payload = await apiRequest("/api/lists", { method: "GET" });
    const lists = payload.lists || [];
    container.innerHTML = "";
    if (lists.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:8px 0;">No lists yet. Create your first collection above.</p>';
      return;
    }
    lists.forEach((list) => {
      const card = document.createElement("div");
      card.className = "user-list-card";
      const posters = (list.previewPosters || []).slice(0, 3);
      const posterHtml = posters.length > 0
        ? posters.map((p) => `<div class="list-preview-poster" style="background-image:url(${escapeHtml(p)})"></div>`).join("")
        : '<div class="list-preview-poster list-preview-empty"></div>';
      card.innerHTML = `
        <div class="list-preview-collage">${posterHtml}</div>
        <div>
          <p class="list-name">${escapeHtml(list.name)}</p>
          <p class="list-count">${list.itemCount} title${list.itemCount !== 1 ? "s" : ""}</p>
        </div>
        <div class="user-list-actions">
          <button class="secondary-action" data-list-id="${escapeHtml(list.id)}" data-action="delete-list" type="button">Delete</button>
        </div>`;
      container.appendChild(card);
    });
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:8px 0;">Could not load your lists.</p>';
  }
}

document.getElementById("create-list-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("new-list-name-input");
  const name = (nameInput?.value || "").trim();
  if (!name) return;
  try {
    await apiRequest("/api/lists", { method: "POST", body: { name } });
    if (nameInput) nameInput.value = "";
    showToast(`List "${name}" created.`, "success");
    void loadUserLists();
  } catch (err) {
    showToast(err.message || "Could not create list.", "error");
  }
});

document.getElementById("my-lists-grid")?.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action='delete-list']");
  if (!btn) return;
  const listId = btn.dataset.listId;
  if (!listId || !confirm("Delete this list?")) return;
  try {
    await apiRequest(`/api/lists/${listId}`, { method: "DELETE" });
    showToast("List deleted.", "info");
    void loadUserLists();
  } catch (err) {
    showToast(err.message || "Could not delete list.", "error");
  }
});

/* ============================================================
   IMPORT
   ============================================================ */
document.getElementById("import-file-input")?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const statusEl = document.getElementById("import-status");
  if (statusEl) statusEl.textContent = "Importing…";
  try {
    const text = await file.text();
    const ext = file.name.split(".").pop().toLowerCase();
    let endpoint = "/api/import/letterboxd";
    let body = {};
    if (ext === "json") {
      endpoint = "/api/import/trakt";
      body = { json: text };
    } else if (file.name.toLowerCase().includes("imdb") || file.name.toLowerCase().includes("ratings")) {
      endpoint = "/api/import/imdb";
      body = { csv: text };
    } else {
      body = { csv: text };
    }
    const payload = await apiRequest(endpoint, { method: "POST", body });
    const msg = `Imported ${payload.imported} title${payload.imported !== 1 ? "s" : ""}${payload.skipped > 0 ? `, skipped ${payload.skipped}` : ""}.`;
    if (statusEl) statusEl.textContent = msg;
    showToast(msg, "success");
    e.target.value = "";
  } catch (err) {
    const msg = err.message || "Import failed.";
    if (statusEl) statusEl.textContent = msg;
    showToast(msg, "error");
  }
});

/* ============================================================
   AI RECOMMENDATIONS — live Claude refresh
   ============================================================ */
document.getElementById("refresh-ai-button")?.addEventListener("click", async () => {
  const grid = document.getElementById("ai-recommendation-grid");
  if (!grid) return;
  grid.innerHTML = buildSkeletonCards(6);
  try {
    const payload = await apiRequest("/api/ai/recommendations", { method: "GET" });
    const recs = payload.recommendations || [];
    grid.innerHTML = "";
    if (recs.length === 0) {
      grid.append(createEmptyCard("No recommendations yet", "Like more movies to improve AI picks."));
      return;
    }
    const profile = getCurrentProfile();
    recs.forEach((rec) => {
      const movie = {
        id: `ai-${(rec.title || "").replace(/\s+/g, "-").toLowerCase()}-${rec.year || ""}`,
        title: rec.title || "",
        year: String(rec.year || ""),
        type: "movie",
        meta: "",
        summary: rec.reason || "",
        poster: "",
        tags: [],
      };
      grid.append(buildMovieCard(movie, buildLibraryCardOptions(profile, movie, {
        context: rec.basedOn ? `Because you liked ${rec.basedOn}` : (rec.reason || "AI-selected for your taste profile"),
        includeWatched: true,
        watchSource: "ai",
      })));
    });
    const src = payload.source === "claude" ? "Fresh Claude AI picks" : "Loaded from cache";
    showToast(src, "info");
  } catch (err) {
    showToast(err.message || "Could not load AI picks.", "error");
    grid.innerHTML = "";
    grid.append(createEmptyCard("AI picks unavailable", "Check that ANTHROPIC_API_KEY is configured."));
  }
});

/* ============================================================
   LIBRARY SEARCH INPUT
   ============================================================ */
(function wireLibrarySearch() {
  let debounceTimer;
  document.getElementById("library-search-input")?.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => renderLibraryEditor(), 200);
  });
})();

/* ============================================================
   PWA INSTALL PROMPT
   ============================================================ */
(function initPwaInstall() {
  let deferred = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    document.getElementById("pwa-install-button")?.classList.remove("hidden");
  });
  document.getElementById("pwa-install-button")?.addEventListener("click", async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    document.getElementById("pwa-install-button")?.classList.add("hidden");
    if (outcome === "accepted") showToast("Movie Buddy installed!", "success");
  });
  window.addEventListener("appinstalled", () => {
    document.getElementById("pwa-install-button")?.classList.add("hidden");
    deferred = null;
  });
})();

/* ============================================================
   CINEMATIC MOVIE QUOTES
   ============================================================ */
const MOVIE_QUOTES = [
  { text: "The world is MINE.", source: "Rocky Bhai — KGF Chapter 2" },
  { text: "Pushpa… I hate tears.", source: "Pushpa Raj — Pushpa: The Rise" },
  { text: "Srivalli!", source: "Pushpa Raj — Pushpa: The Rise" },
  { text: "Jhukega nahi — He will not bow down.", source: "Rocky — KGF Chapter 1" },
  { text: "This is not just a fight for a throne, this is a fight for honour.", source: "Bahubali: The Beginning" },
  { text: "Why are you so afraid of fire? You are the son of fire.", source: "Shivagami — Bahubali" },
  { text: "Where is Kattappa? He killed Bahubali!", source: "Bahubali: The Beginning" },
  { text: "I am going to be a storm. I am going to be a fire.", source: "RRR" },
  { text: "One bullet, one life. And I have many bullets.", source: "Singam" },
  { text: "A lion doesn't ask permission to hunt.", source: "Vikram" },
  { text: "You play with fire, you will get burned.", source: "Singham Returns" },
  { text: "I don't run from problems — problems run from me.", source: "Rajinikanth — Kabali" },
  { text: "Living in the past is a waste of time. Focus on what lies ahead.", source: "2.0" },
  { text: "Style is not something you wear, it's something you are.", source: "Rajinikanth — Enthiran" },
  { text: "A horse runs on four legs yet the rider takes the glory — that's politics.", source: "Nayakan" },
  { text: "A man who has nothing to lose is the most dangerous man in the world.", source: "Gangs of Wasseypur" },
  { text: "Either you are with me or against me — there is no middle ground.", source: "Wanted (2009)" },
  { text: "The biggest revenge is to succeed where they expected you to fail.", source: "Dil Dhadakne Do" },
  { text: "Don't let the noise of others' opinions drown out your inner voice.", source: "3 Idiots" },
  { text: "All is well!", source: "3 Idiots" },
  { text: "Pursue excellence and success will follow — pants down!", source: "3 Idiots" },
  { text: "Fear not the enemy who attacks you, fear the friend who flatters you.", source: "Mughal-E-Azam" },
  { text: "In this jungle of stones called Mumbai, only the fittest survive.", source: "Dharavi" },
  { text: "I may be a small man, but my dreams are very big.", source: "Slumdog Millionaire" },
  { text: "There is no limit to what you can achieve when your heart is pure.", source: "Lagaan" },
  { text: "If you break a mirror you get seven years of bad luck. Break their ego and you're free forever.", source: "Drishyam" },
  { text: "A true hero doesn't wait for the world to be saved — he just does it.", source: "Uri: The Surgical Strike" },
  { text: "How's the josh? — HIGH SIR!", source: "Uri: The Surgical Strike" },
  { text: "Sometimes winning isn't about being the best — it's about being the last one standing.", source: "Bhaag Milkha Bhaag" },
  { text: "The day I stop running is the day I die.", source: "Bhaag Milkha Bhaag" },
];

function getRandomQuote() {
  return MOVIE_QUOTES[Math.floor(Math.random() * MOVIE_QUOTES.length)];
}

let quoteRotateTimer = null;

function startQuoteRotation() {
  const textEl   = document.getElementById("quote-text");
  const sourceEl = document.getElementById("quote-source");
  const strip    = document.getElementById("cinematic-quote-strip");
  if (!textEl || !sourceEl || !strip) return;

  function showQuote() {
    const q = getRandomQuote();
    strip.classList.add("quote-fade-out");
    setTimeout(() => {
      textEl.textContent   = q.text;
      sourceEl.textContent = `— ${q.source}`;
      strip.classList.remove("quote-fade-out");
    }, 400);
  }

  showQuote();
  if (quoteRotateTimer) clearInterval(quoteRotateTimer);
  quoteRotateTimer = setInterval(showQuote, 9000);
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startQuoteRotation);
} else {
  startQuoteRotation();
}
