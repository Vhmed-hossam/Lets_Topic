export default function renderTextWithLinks(text, color) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.flatMap((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          className="underline px-1 font-semibold"
          style={{ color }}
        >
          {part.trim()}
        </a>
      );
    }

    const lines = part.split("\n").filter((line) => line !== "");
    return lines.flatMap((line, i) => [
      <span key={`${index}-${i}`}>{line}</span>,
      i < lines.length - 1 ? <br key={`br-${index}-${i}`} /> : null,
    ]);
  });
}
