import { useChatStore } from "../store/useChatStore";
import { usePopoversStore } from "../store/usePopoversStore";
export default function onEscapeKeyPress() {
  const { SelectedUser, SetSelectedUser } = useChatStore();
  const { ClosePopoversinChat } = usePopoversStore();
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (SelectedUser?._id) {
        SetSelectedUser(null);
      }
      ClosePopoversinChat();
      document.activeElement.blur();
    }
  });
}
