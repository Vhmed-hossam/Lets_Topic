import { create } from "zustand";

export const usePopoversStore = create((set, get) => ({
  BlockPopoverState: false,
  DeletePopoverState: false,
  DisablePopoverState: false,
  EditMessagePopoverState: false,
  LogoutPopoverState: false,
  ReportPopoverState: false,
  RestorePopoverState: false,
  UnfriendPopoverState: false,
  UsernamePopoverState: false,
  DeleteMessagePopoverState: false,
  WipePopoverState: false,

  OpenLogoutPopover: () => set({ LogoutPopoverState: true }),
  CloseLogoutPopover: () => set({ LogoutPopoverState: false }),

  OpenUsernamePopover: () => set({ UsernamePopoverState: true }),
  CloseUsernamePopover: () => set({ UsernamePopoverState: false }),

  OpenDisablePopover: () => set({ DisablePopoverState: true }),
  CloseDisablePopover: () => set({ DisablePopoverState: false }),

  OpenDeletePopover: () => set({ DeletePopoverState: true }),
  CloseDeletePopover: () => set({ DeletePopoverState: false }),

  OpenRestorePopover: () => set({ RestorePopoverState: true }),
  CloseRestorePopover: () => set({ RestorePopoverState: false }),

  OpenReportPopover: () => set({ ReportPopoverState: true }),
  CloseReportPopover: () => set({ ReportPopoverState: false }),

  OpenUnfriendPopover: () => set({ UnfriendPopoverState: true }),
  CloseUnfriendPopover: () => set({ UnfriendPopoverState: false }),

  OpenWipePopover: () => set({ WipePopoverState: true }),
  CloseWipePopover: () => set({ WipePopoverState: false }),

  OpenBlockPopover: () => set({ BlockPopoverState: true }),
  CloseBlockPopover: () => set({ BlockPopoverState: false }),

  OpenEditMessagePopover: () => set({ EditMessagePopoverState: true }),
  CloseEditMessagePopover: () => set({ EditMessagePopoverState: false }),

  OpenDeleteMessagePopover: () => set({ DeleteMessagePopoverState: true }),
  CloseDeleteMessagePopover: () => set({ DeleteMessagePopoverState: false }),

  ClosePopoversinChat: () => {
    get().CloseReportPopover();
    get().CloseUnfriendPopover();
    get().CloseWipePopover();
    get().CloseBlockPopover();
    get().CloseEditMessagePopover();
    get().CloseDeleteMessagePopover();
  },
}));
