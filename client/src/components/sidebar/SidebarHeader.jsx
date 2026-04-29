import { useState } from "react";
import { MessageSquarePlus, LogOut, MoreVertical } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import Avatar from "../common/Avatar";
import ThemeToggle from "../common/ThemeToggle";

const SidebarHeader = ({ onNewChat }) => {
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8 bg-[#1a1740]">
      <div className="flex items-center gap-3">
        <Avatar src={user?.avatar} name={user?.fullName} size="md" />
        <div>
          <h2 className="font-heading font-semibold text-sm text-white">
            {user?.fullName}
          </h2>
          <p className="text-xs text-indigo-300">@{user?.username}</p>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        <ThemeToggle />
        <button
          onClick={onNewChat}
          className="p-2 rounded-xl hover:bg-white/8 text-indigo-300 hover:text-white transition-colors"
          title="New chat"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl hover:bg-white/8 text-indigo-300 hover:text-white transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 py-1 bg-[#2d2a5e] rounded-xl border border-white/10 shadow-xl">
                <button
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 rounded-lg mx-auto"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
