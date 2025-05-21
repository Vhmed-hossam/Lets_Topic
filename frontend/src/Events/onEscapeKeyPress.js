import { useChatStore } from "../store/useChatStore";
export default function onEscapeKeyPress() {
  const { SelectedUser, SetSelectedUser } = useChatStore();
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (SelectedUser?._id) {
        SetSelectedUser(null);
      }
      document.activeElement.blur();
    }
  });
}