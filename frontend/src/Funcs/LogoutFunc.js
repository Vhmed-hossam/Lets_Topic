import { useAuthStore } from "../store/useAuthStore";
import { useSettingStore } from "../store/useSettingsStore";
import { ErrorToast } from "../components/Toast/Toasters";
import { usePopoversStore } from "../store/usePopoversStore";

export default function LogoutFunc() {
  const { Logout, authUser, isloggingout } = useAuthStore();
  const {
    LogoutPopoverState,
    CloseLogoutPopover,
  } = usePopoversStore();

  const Logoutacs = async () => {
    try {
      await Logout();
    } catch (error) {
      console.error(error);
      ErrorToast("Error logging out");
    } finally {
      CloseLogoutPopover();
    }
  };

  return {
    isloggingout,
    authUser,
    isPopoverOpen: LogoutPopoverState,
    Logoutacs,
  };
}
