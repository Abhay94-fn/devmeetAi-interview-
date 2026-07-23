import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Video, BookOpen, User, Trophy, LogOut, Users } from "lucide-react";
import useAuthStore from "../../store/authStore.js";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const getInitials = (name) => {
    if (!name) return "DM";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const candidateLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "New Interview", path: "/interview/setup", icon: Video },
    { name: "Question Bank", path: "/questions", icon: BookOpen },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const interviewerLinks = [
    { name: "Dashboard", path: "/interviewer/dashboard", icon: LayoutDashboard },
    { name: "Schedule", path: "/interviewer/schedule", icon: Video },
    { name: "Candidates", path: "/interviewer/candidates", icon: Users },
    { name: "Custom Questions", path: "/interviewer/questions", icon: BookOpen },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
  ];

  const navLinks = user?.role === "interviewer" ? interviewerLinks : candidateLinks;

  const handleSignOut = () => {
    logout().then(() => navigate("/"));
  };

  return (
    <aside 
      className="w-[220px] h-[calc(100vh-54px)] flex flex-col justify-between p-4 border-r shrink-0 select-none"
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Top Section: User Profile Badge */}
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.01] border border-white/5">
          {/* Avatar Circle */}
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-12 h-12 rounded-full object-cover border border-[#8B5CF6]/50 mb-2.5 shadow-md"
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white mb-2.5 shadow-md"
              style={{
                backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              }}
            >
              {getInitials(user?.name)}
            </div>
          )}

          {/* Name & Role */}
          <h4 className="text-white text-xs font-bold truncate max-w-[170px] leading-tight mb-1">
            {user?.name || "User"}
          </h4>
          <span 
            className="pill text-[9px] font-semibold select-none capitalize px-2 py-0.5"
            style={{
              background: user?.role === "interviewer" ? "rgba(6, 182, 212, 0.12)" : "rgba(139, 92, 246, 0.12)",
              color: user?.role === "interviewer" ? "#06B6D4" : "#8B5CF6",
              border: user?.role === "interviewer" ? "0.5px solid rgba(6, 182, 212, 0.25)" : "0.5px solid rgba(139, 92, 246, 0.25)",
            }}
          >
            {user?.role || "candidate"}
          </span>
        </div>

        {/* Divider */}
        <hr className="border-white/5 my-4" />

        {/* Nav Links */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.name}
                to={link.path}
                className="sidebar-link no-underline relative"
                style={{
                  background: isActive ? "rgba(139, 92, 246, 0.12)" : "transparent",
                  color: isActive ? "#f8fafc" : "#94a3b8",
                  borderLeft: isActive ? "2px solid #8B5CF6" : "2px solid transparent",
                  paddingLeft: isActive ? "12px" : "14px",
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-xs">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Sign Out */}
      <div>
        <hr className="border-white/5 my-4" />
        <button
          onClick={handleSignOut}
          className="sidebar-link w-full text-left bg-transparent border-0 cursor-pointer no-underline"
          style={{
            borderLeft: "2px solid transparent",
            paddingLeft: "14px"
          }}
        >
          <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="font-semibold text-xs text-rose-400">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
