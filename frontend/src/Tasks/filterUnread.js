 export default function filterUnreadFromFriends(A, B) {
    const filteredMessages = {};

    for (const userId in A) {
      if (B.includes(userId)) {
        filteredMessages[userId] = A[userId];
      }
    }

    const totalUnreadFromFriends = Object.values(filteredMessages).reduce(
      (sum, count) => sum + count,
      0
    );
    if(totalUnreadFromFriends === 0) return {};
    return {
      filteredMessages,
      totalUnreadFromFriends,
    };
  }