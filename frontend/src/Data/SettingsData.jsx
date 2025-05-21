import { Palette, ShieldUser, UserCog } from "lucide-react";

export const SettingsData = [
  {
    id: 1,
    name: "Privacy",
    icon: <ShieldUser className="size-8" />,
    title: "settings/privacy",
  },
  {
    id: 2,
    name: "Appearance",
    icon: <Palette className="size-8" />,
    title: "settings/appearance",
  },
  {
    id: 3,
    name: "Account",
    icon: <UserCog className="size-8" />,
    title: "settings/account",
  },
];
