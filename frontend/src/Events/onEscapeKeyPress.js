import { useChatStore } from "../store/useChatStore";
import { usePopoversStore } from "../store/usePopoversStore";
export default function onEscapeKeyPress() {
  const { SelectedUser, SetSelectedUser } = useChatStore();
  const {
    CloseReportPopover,
    CloseUnfriendPopover,
    CloseWipePopover,
    CloseBlockPopover,
    CloseEditMessagePopover,
    CloseDeleteMessagePopover,
  } = usePopoversStore();
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (SelectedUser?._id) {
        SetSelectedUser(null);
      }
      CloseReportPopover();
      CloseUnfriendPopover();
      CloseWipePopover();
      CloseBlockPopover();
      CloseEditMessagePopover();
      CloseDeleteMessagePopover();
      document.activeElement.blur();
    }
  });
}
