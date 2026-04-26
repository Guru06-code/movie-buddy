"use strict";
const { sendJson, readJsonBody } = require("../http");
const { getProfile, upsertProfile, getUserById, sanitizeUser, createNotification, createUniqueId, addActivityEvent, normalizeMovie } = require("../db");
const { buildAppState } = require("../catalog");

async function handleFriendsRoutes(req, res, url, userId) {
  const method = req.method;
  const path = url.pathname;

  if (method === "POST" && path === "/api/friends/request") {
    const body = await readJsonBody(req);
    const targetUserId = String(body?.targetUserId || "").trim();
    const sender = await getUserById(userId);
    const target = await getUserById(targetUserId);
    if (!sender || !target || targetUserId === userId) {
      sendJson(res, 400, { error: "Unable to send that friend request." });
      return true;
    }
    const senderProfile = await getProfile(userId);
    const targetProfile = await getProfile(targetUserId);
    if (senderProfile.friendIds.includes(targetUserId) || senderProfile.outgoingRequests.some((i) => i.toUserId === targetUserId)) {
      sendJson(res, 200, await buildAppState(userId));
      return true;
    }
    const requestItem = { id: createUniqueId("friend-request"), fromUserId: sender.id, fromUserName: sender.name, fromUserHandle: sender.handle, toUserId: target.id, createdAt: Date.now() };
    senderProfile.outgoingRequests.unshift(requestItem);
    targetProfile.incomingRequests.unshift(requestItem);
    createNotification(targetProfile, { type: "friend-request", title: "New friend request", message: `${sender.name} sent you a friend request. Accept it to start exchanging movie recommendations.` });
    await upsertProfile(userId, senderProfile);
    await upsertProfile(targetUserId, targetProfile);
    sendJson(res, 200, await buildAppState(userId));
    return true;
  }

  if (method === "POST" && path === "/api/friends/respond") {
    const body = await readJsonBody(req);
    const requestId = String(body?.requestId || "").trim();
    const accept = Boolean(body?.accept);
    const currentUser = await getUserById(userId);
    const currentProfile = await getProfile(userId);
    const requestItem = currentProfile.incomingRequests.find((i) => i.id === requestId);
    if (!currentUser || !requestItem) { sendJson(res, 400, { error: "Unable to update that friend request." }); return true; }
    currentProfile.incomingRequests = currentProfile.incomingRequests.filter((i) => i.id !== requestId);
    const senderProfile = await getProfile(requestItem.fromUserId);
    senderProfile.outgoingRequests = senderProfile.outgoingRequests.filter((i) => i.id !== requestId);
    if (accept) {
      if (!currentProfile.friendIds.includes(requestItem.fromUserId)) currentProfile.friendIds.unshift(requestItem.fromUserId);
      if (!senderProfile.friendIds.includes(userId)) senderProfile.friendIds.unshift(userId);
      await addActivityEvent(userId, "new_friend", { friendId: requestItem.fromUserId, friendName: requestItem.fromUserName });
      await addActivityEvent(requestItem.fromUserId, "new_friend", { friendId: userId, friendName: currentUser.name });
    }
    createNotification(senderProfile, { type: accept ? "friend-request-accepted" : "friend-request-rejected", title: accept ? "Friend request accepted" : "Friend request declined", message: accept ? `${currentUser.name} accepted your friend request.` : `${currentUser.name} declined your friend request.` });
    await upsertProfile(userId, currentProfile);
    await upsertProfile(requestItem.fromUserId, senderProfile);
    sendJson(res, 200, await buildAppState(userId));
    return true;
  }

  if (method === "POST" && path === "/api/recommendations/send") {
    const body = await readJsonBody(req);
    const recipientId = String(body?.toUserId || "").trim();
    const note = String(body?.note || "").trim();
    const movie = normalizeMovie(body?.movie);
    const sender = await getUserById(userId);
    const recipient = await getUserById(recipientId);
    if (!sender || !recipient || !movie) { sendJson(res, 400, { error: "Unable to send that recommendation." }); return true; }
    const senderProfile = await getProfile(userId);
    const recipientProfile = await getProfile(recipientId);
    const recommendation = { id: createUniqueId("friend-rec"), movie, fromUserId: sender.id, fromUserName: sender.name, fromUserHandle: sender.handle, toUserId: recipient.id, toUserName: recipient.name, note, status: "sent", createdAt: Date.now() };
    recipientProfile.friendRecommendationInbox.unshift(recommendation);
    senderProfile.sentRecommendations.unshift(recommendation);
    createNotification(recipientProfile, { type: "friend-recommendation", title: "New recommendation", message: `${sender.name} recommended ${movie.title} to you${note ? `: ${note}` : "."}` });
    createNotification(senderProfile, { type: "system", title: "Recommendation sent", message: `${movie.title} was sent to ${recipient.name}.` });
    await addActivityEvent(userId, "sent_recommendation", { recipientName: recipient.name, movieTitle: movie.title, moviePoster: movie.poster });
    await upsertProfile(userId, senderProfile);
    await upsertProfile(recipientId, recipientProfile);
    sendJson(res, 200, await buildAppState(userId));
    return true;
  }

  if (method === "POST" && path === "/api/recommendations/watched") {
    const body = await readJsonBody(req);
    const recommendationId = String(body?.recommendationId || "").trim();
    const review = String(body?.review || "").trim();
    const currentUser = await getUserById(userId);
    const currentProfile = await getProfile(userId);
    const recommendation = currentProfile.friendRecommendationInbox.find((i) => i.id === recommendationId);
    if (!currentUser || !recommendation) { sendJson(res, 400, { error: "Unable to update watched status for that recommendation." }); return true; }
    if (!currentProfile.watched.some((i) => i.movieId === recommendation.movie.id)) {
      currentProfile.watched.unshift({ id: createUniqueId("watched"), movieId: recommendation.movie.id, title: recommendation.movie.title, source: "friend", fromUserId: recommendation.fromUserId, fromUserName: recommendation.fromUserName, review, watchedAt: Date.now() });
    }
    recommendation.status = "watched";
    recommendation.review = review;
    recommendation.watchedAt = Date.now();
    const senderProfile = await getProfile(recommendation.fromUserId);
    const senderEntry = senderProfile.sentRecommendations.find((i) => i.id === recommendationId);
    if (senderEntry) { senderEntry.status = "watched"; senderEntry.review = review; senderEntry.watchedAt = recommendation.watchedAt; }
    createNotification(senderProfile, { type: "recommendation-watched", title: "Recommendation update", message: review ? `${currentUser.name} watched ${recommendation.movie.title} and shared a review: "${review}"` : `${currentUser.name} marked ${recommendation.movie.title} as watched.` });
    await upsertProfile(userId, currentProfile);
    await upsertProfile(recommendation.fromUserId, senderProfile);
    sendJson(res, 200, await buildAppState(userId));
    return true;
  }

  if (method === "POST" && path === "/api/recommendations/refresh") {
    const profile = await getProfile(userId);
    createNotification(profile, { type: "system", title: "Recommendations refreshed", message: profile.liked.length > 0 ? "Movie Buddy recalculated your recommendation set." : "AI picks stay empty until you like a few titles." });
    await upsertProfile(userId, profile);
    sendJson(res, 200, await buildAppState(userId));
    return true;
  }

  if (method === "POST" && path === "/api/notifications/read") {
    const body = await readJsonBody(req);
    const notificationId = String(body?.notificationId || "").trim();
    const profile = await getProfile(userId);
    const notification = profile.notifications.find((i) => i.id === notificationId);
    if (notification) { notification.read = true; await upsertProfile(userId, profile); }
    sendJson(res, 200, await buildAppState(userId));
    return true;
  }

  if (method === "GET" && path === "/api/friends/profile") {
    const friendId = String(url.searchParams.get("friendId") || "").trim();
    const friend = await getUserById(friendId);
    if (!friend) { sendJson(res, 404, { error: "User not found." }); return true; }

    const myProfile = await getProfile(userId);
    const isFriend = (myProfile.friendIds || []).includes(friendId);
    const isPending = (myProfile.outgoingRequests || []).some((r) => r.toUserId === friendId)
                   || (myProfile.incomingRequests  || []).some((r) => r.fromUserId === friendId);

    if (!isFriend) {
      sendJson(res, 200, { status: isPending ? "pending" : "not_friends", friend: sanitizeUser(friend) });
      return true;
    }

    const theirProfile = await getProfile(friendId);
    const privacy = theirProfile.friendPrivacy || {};
    sendJson(res, 200, {
      status: "friends",
      friend: sanitizeUser(friend),
      privacy,
      wishlist: privacy.showWishlist !== false ? (theirProfile.wishlist || []).slice(0, 20) : null,
      liked:    privacy.showLiked    !== false ? (theirProfile.liked    || []).slice(0, 20) : null,
    });
    return true;
  }

  if (method === "GET" && path === "/api/friends/overlap") {
    const friendId = String(url.searchParams.get("friendId") || "").trim();
    const friend = await getUserById(friendId);
    if (!friend) { sendJson(res, 404, { error: "User not found." }); return true; }
    const myProfile = await getProfile(userId);
    const theirProfile = await getProfile(friendId);
    const theirLikedIds = new Set((theirProfile.liked || []).map((m) => m.id));
    const theirWatchedIds = new Set((theirProfile.watched || []).map((w) => w.movieId));
    const bothLiked = (myProfile.liked || []).filter((m) => theirLikedIds.has(m.id));
    const bothWatched = (myProfile.watched || [])
      .filter((w) => theirWatchedIds.has(w.movieId))
      .map((w) => ({ id: w.movieId, title: w.title }));
    sendJson(res, 200, { friend: sanitizeUser(friend), bothLiked, bothWatched });
    return true;
  }

  return false;
}

module.exports = { handleFriendsRoutes };
