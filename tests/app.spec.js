const { test, expect } = require("@playwright/test");

async function signupAndLogin(page, { name, email, password }) {
  await page.goto("/");
  await page.locator("#show-signup").click();
  await page.locator("#signup-name").fill(name);
  await page.locator("#signup-email").fill(email);
  await page.locator("#signup-password").fill(password);
  await page.locator("#signup-form .auth-submit").click();

  await expect(page.locator("#auth-message")).toContainText("Account created");

  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.locator("#login-form .auth-submit").click();
  await expect(page.locator("#app-shell")).toBeVisible();
}

async function seedStarterProfile(page, title = "Interstellar") {
  await page.locator("#catalog-search-input").fill(title);
  const firstCard = page.locator("#movie-grid .movie-card").filter({ hasText: new RegExp(title, "i") }).first();
  await expect(firstCard).toBeVisible();

  const wishlistButton = firstCard.getByRole("button", { name: /Wishlist|In wishlist/i }).first();
  await wishlistButton.click();

  const likeButton = firstCard.getByRole("button", { name: /Like for AI|Liked for AI/i }).first();
  if (await likeButton.isEnabled()) {
    await likeButton.click();
  }

  await page.getByRole("button", { name: "Save starter shelf" }).click();
  await expect(page.locator("#home-shell")).toBeVisible();
}

test("signup, search, like, and reach live dashboard", async ({ page }) => {
  const uniqueToken = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const email = `movie-buddy-${uniqueToken}@example.com`;
  const password = "TestPass123";

  await signupAndLogin(page, { name: "Playwright User", email, password });
  await seedStarterProfile(page);
  await expect(page.locator("#home-shell")).toBeVisible();
  await expect(page.locator("#liked-grid")).toContainText(/Interstellar/i);

  await page.getByRole("tab", { name: "AI Recommendation" }).click();
  await expect(page.locator("#ai-recommendation-grid")).not.toContainText("Like a few titles first");
});

test("friend request accept flow creates visible notification", async ({ browser }) => {
  const uniqueToken = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const sender = {
    name: `Sender ${uniqueToken}`,
    email: `sender-${uniqueToken}@example.com`,
    password: "TestPass123",
  };
  const receiver = {
    name: `Receiver ${uniqueToken}`,
    email: `receiver-${uniqueToken}@example.com`,
    password: "TestPass123",
  };

  const senderContext = await browser.newContext();
  const receiverContext = await browser.newContext();
  const senderPage = await senderContext.newPage();
  const receiverPage = await receiverContext.newPage();

  await signupAndLogin(senderPage, sender);
  await seedStarterProfile(senderPage);

  await signupAndLogin(receiverPage, receiver);
  await seedStarterProfile(receiverPage, "Dark");

  await senderPage.getByRole("tab", { name: "Friends" }).click();
  await senderPage.locator("#friend-search-input").fill(receiver.name);
  const addFriendButton = senderPage.getByRole("button", { name: "Add friend" }).first();
  await expect(addFriendButton).toBeVisible();
  await addFriendButton.click();

  await receiverPage.reload();
  await receiverPage.getByRole("tab", { name: "Requests and activity" }).click();
  const acceptButton = receiverPage.getByRole("button", { name: "Accept" }).first();
  await expect(acceptButton).toBeVisible();
  await acceptButton.click();

  await senderPage.reload();
  await senderPage.getByRole("tab", { name: "Requests and activity" }).click();
  await expect(senderPage.locator("#notification-list")).toContainText(/accepted your friend request/i);

  await senderContext.close();
  await receiverContext.close();
});

test("library editor moves titles and reminder preferences trigger due release notice", async ({ page }) => {
  const uniqueToken = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const email = `editor-${uniqueToken}@example.com`;
  const password = "TestPass123";

  await signupAndLogin(page, { name: "Editor User", email, password });
  await seedStarterProfile(page);

  await page.getByRole("button", { name: "Manage library" }).click();
  await expect(page.locator("#library-editor-overlay")).toBeVisible();

  await page.locator("#library-editor-toolbar").getByRole("button", { name: "Liked", exact: true }).click();
  await page.getByRole("button", { name: /Add Interstellar to Currently watching|Add Interstellar to currently watching/i }).click();
  await page.locator("#close-library-editor").click();
  await expect(page.locator("#currently-watching-grid")).toContainText(/Interstellar/i);

  const upcomingCard = page.locator("#upcoming-grid .movie-card").first();
  await expect(upcomingCard).toBeVisible();
  const reminderButton = upcomingCard.getByRole("button", { name: /Remind me|Reminder saved/i }).first();
  await reminderButton.click();

  await page.getByRole("button", { name: "Reminder settings" }).click();
  await page.locator("#reminder-lead-select").selectOption("7");
  await page.locator("#reminder-hour-select").selectOption("0");
  await page.locator("#reminder-timezone-input").fill("UTC");
  await page.locator("#reminder-preferences-form").evaluate((form) => form.requestSubmit());
  await page.locator("#close-library-editor").click();

  await page.getByRole("tab", { name: "Requests and activity" }).click();
  await expect(page.locator("#notification-list")).toContainText(/Release reminder/i);
});