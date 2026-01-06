import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Search,
  Settings,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";

interface FloatingTopBarProps {
  isCollapsed?: boolean;
}

export const FloatingTopBar = ({
  isCollapsed = false,
}: FloatingTopBarProps) => {
  return (
    <motion.div
      className={`fixed top-4 z-40 right-4 transition-all duration-300`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ right: 16 }}
    >
      <div
        className="glass-card-lg px-4 py-3"
        style={{ width: "max-content", maxWidth: "820px", minWidth: "320px" }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left section - Search */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 flex items-center justify-center rounded-md">
                <Search className="w-4 h-4" />
              </div>

              <input
                type="text"
                placeholder="Search..."
                className="pl-11 pr-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,0.18)] text-sm w-32 sm:w-44 transition-shadow"
              />
            </div>
          </div>

          {/* Center section - Page indicator (optional) */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium shadow-sm">
              Dashboard
            </div>
          </div>

          {/* Right section - Actions and Profile */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 bg-white/10 border border-white/20 rounded-2xl hover:shadow-md transition-shadow"
            >
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 bg-white/10 border border-white/20 rounded-2xl hover:shadow-md transition-shadow"
            >
              <Settings size={18} />
            </Button>

            {/* Profile */}
            <div className="flex items-center gap-2 cursor-pointer bg-white/10 border border-white/20 rounded-2xl px-2 py-1 hover:shadow-md transition-all">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>

              <div className="hidden md:block text-sm">
                <div className="font-medium text-gray-900">Aditya</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>

              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
