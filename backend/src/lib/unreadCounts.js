const unreadCounts = new Map();

export function incrementUnread(receiverId) {
  const count = unreadCounts.get(receiverId) || 0;
  unreadCounts.set(receiverId, count + 1);
  return count + 1;
}

export function resetUnread(userId) {
  unreadCounts.set(userId, 0);
  return 0;
}

export function getUnreadCount(userId) {
  return unreadCounts.get(userId) || 0;
}
