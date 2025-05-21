// helpers/formatDate.js

export default function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isSameDay) return "Today";
  if (isYesterday) return "Yesterday";

  const diff = Math.abs(now - date);
  const diffDays = diff / (1000 * 60 * 60 * 24);

  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" }); // ex: Saturday
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
