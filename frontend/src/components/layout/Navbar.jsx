// frontend/src/components/layout/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
import useAuthStore from "../../store/authStore.js";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  const getInitials = (name) => {
    if (!name) return "DM";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const isDashboardPage = [
    "/dashboard",
    "/questions",
    "/profile",
    "/leaderboard",
    "/interviewer",
    "/interview"
  ].some((path) => location.pathname.startsWith(path));

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav
      className="sticky top-0 w-full h-[54px] z-50 flex items-center justify-between px-6 border-b"
      style={{
        background: "rgba(6, 6, 18, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Left logo */}
      <Link
        to={isAuthenticated ? (user?.role === "interviewer" ? "/interviewer/dashboard" : "/dashboard") : "/"}
        className="flex items-center gap-3.5 no-underline"
      >
        <div
          className="w-8 h-8 flex items-center justify-center font-bold text-white text-base"
          style={{
            backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            borderRadius: "8px",
          }}
        >
          D
        </div>
        <span className="text-white font-black text-lg tracking-tight">DevMeet</span>
      </Link>

      {/* Center navigation */}
      {isAuthenticated && isDashboardPage && (
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/5">
          {user?.role === "interviewer" ? (
            <>
              <Link
                to="/interviewer/dashboard"
                className={`px-4.5 py-1 text-xs font-semibold rounded-full no-underline transition ${
                  location.pathname === "/interviewer/dashboard"
                    ? "bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/25"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/interviewer/schedule"
                className={`px-4.5 py-1 text-xs font-semibold rounded-full no-underline transition ${
                  location.pathname === "/interviewer/schedule"
                    ? "bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/25"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Schedule
              </Link>
              <Link
                to="/interviewer/candidates"
                className={`px-4.5 py-1 text-xs font-semibold rounded-full no-underline transition ${
                  location.pathname === "/interviewer/candidates"
                    ? "bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/25"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Candidates
              </Link>
              <Link
                to="/interviewer/questions"
                className={`px-4.5 py-1 text-xs font-semibold rounded-full no-underline transition ${
                  location.pathname === "/interviewer/questions"
                    ? "bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/25"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Custom Questions
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`px-4.5 py-1 text-xs font-semibold rounded-full no-underline transition ${
                  location.pathname === "/dashboard"
                    ? "bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/25"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/questions"
                className={`px-4.5 py-1 text-xs font-semibold rounded-full no-underline transition ${
                  location.pathname === "/questions"
                    ? "bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/25"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Question Bank
              </Link>
              <Link
                to="/leaderboard"
                className={`px-4.5 py-1 text-xs font-semibold rounded-full no-underline transition ${
                  location.pathname === "/leaderboard"
                    ? "bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/25"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Leaderboard
              </Link>
              <Link
                to="/profile"
                className={`px-4.5 py-1 text-xs font-semibold rounded-full no-underline transition ${
                  location.pathname === "/profile"
                    ? "bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/25"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Profile
              </Link>
            </>
          )}
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => {
                setHasNotifications(false);
              }}
              className="relative p-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 hover:border-white/10 text-white cursor-pointer transition"
            >
              <Bell className="w-4 h-4" />
              {hasNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            {/* User display */}
            <span className="hidden sm:inline text-xs font-semibold text-white">
              {user?.name || "User"}
            </span>

            <Link
              to={user?.role === "interviewer" ? "/interviewer/dashboard" : "/profile"}
              className="no-underline shrink-0"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#8B5CF6]/40"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                  }}
                >
                  {getInitials(user?.name)}
                </div>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="btn-ghost text-xs py-1.5 px-3 border border-white/10 text-white rounded-lg cursor-pointer hover:bg-white/10"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/auth" className="btn-ghost text-xs py-1.5 px-3.5 no-underline">
              Sign In
            </Link>
            <Link
              to="/auth"
              className="btn-primary text-xs py-1.5 px-3.5 no-underline rounded-lg"
              style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
            >
              Get Started
            </Link>
          </div>
        )}

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 text-white cursor-pointer transition"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="absolute top-[54px] left-0 right-0 p-6 flex flex-col gap-4 border-b md:hidden z-50 animate-slide-down"
          style={{
            background: "rgba(6, 6, 18, 0.96)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          {isAuthenticated && (
            <div className="flex flex-col gap-3 font-semibold text-sm">
              {user?.role === "interviewer" ? (
                <>
                  <Link
                    to="/interviewer/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="text-[#94A3B8] hover:text-white no-underline"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/interviewer/schedule"
                    onClick={() => setMobileOpen(false)}
                    className="text-[#94A3B8] hover:text-white no-underline"
                  >
                    Schedule
                  </Link>
                  <Link
                    to="/interviewer/candidates"
                    onClick={() => setMobileOpen(false)}
                    className="text-[#94A3B8] hover:text-white no-underline"
                  >
                    Candidates
                  </Link>
                  <Link
                    to="/interviewer/questions"
                    onClick={() => setMobileOpen(false)}
                    className="text-[#94A3B8] hover:text-white no-underline"
                  >
                    Custom Questions
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="text-[#94A3B8] hover:text-white no-underline"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/questions"
                    onClick={() => setMobileOpen(false)}
                    className="text-[#94A3B8] hover:text-white no-underline"
                  >
                    Question Bank
                  </Link>
                  <Link
                    to="/leaderboard"
                    onClick={() => setMobileOpen(false)}
                    className="text-[#94A3B8] hover:text-white no-underline"
                  >
                    Leaderboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="text-[#94A3B8] hover:text-white no-underline"
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
