import { Link } from "react-router-dom";
import { Bell, Settings, User } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export default function Navbar() {
  const { authUser } = useAuthStore();

  return (
    <>
      <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-2.5 hover:opacity-80 transition-all"
              >
                <div className="rounded-lg bg-main/25 flex items-center justify-center">
                  <img
                    src="/Let's Topic mlogo.png"
                    alt="Logo"
                    className="h-10"
                  />
                </div>
                <h1 className="text-lg font-bold select-none">Let's Topic</h1>
              </Link>
            </div>
            {authUser && (
              <div className="flex items-center gap-4">
                <Link to="/notifications">
                  <Bell className="size-5 hover:opacity-80 transition-all" />
                </Link>
                <Link to="/profile">
                  <User className="size-5 hover:opacity-80 transition-all" />
                </Link>
                <Link to="/settings">
                  <Settings className="hover:opacity-80 transition-all" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
