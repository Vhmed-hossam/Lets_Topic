import { useRef } from "react";

export const scrollToBottom = (behavior) => {
  const scrollRef = useRef(null);
  if (scrollRef) {
    scrollRef.current.scrollIntoView({ behavior });
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
  return scrollRef;
};
