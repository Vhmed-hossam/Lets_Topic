import Cookie from "js-cookie";
export default function DevSpace() {
  console.log("%c STOP!", "color: red; font-size: 50px; font-weight: bold;");
  console.log(
    "%c This application doesn't allow developer tools usage",
    "font-size: 20px;"
  );
  console.log("%c Close DevTools to continue", "font-size: 16px; color: #888;");
  Cookie.set("Message", "please-do-not-change-anything-here!");
}
