import Cookie from "js-cookie";

export default function getInitialTheme() {
  const cookieTheme = Cookie.get("chat-theme");
  if (cookieTheme) return cookieTheme;

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}
