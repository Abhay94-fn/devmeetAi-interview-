import React, { useState, useEffect } from "react";
import { User as UserIcon, Github, Linkedin, Briefcase, Save, Star } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import useAuthStore from "../../store/authStore";

export default function ProfilePage() {
  const { user: authUser } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [company, setCompany] = useState("");
  const [tier, setTier] = useState("pro");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me");
        setProfile(res.data.profile);
        setUser(res.data.user);

        // Prepopulate form fields
        setName(res.data.user.name || "");
        setBio(res.data.profile.bio || "");
        setGithub(res.data.profile.github || "");
        setLinkedIn(res.data.profile.linkedIn || "");
        setCompany(res.data.profile.company || "");
        setTier(res.data.user.tier || "free");
      } catch (err) {
        console.error("Get profile error:", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch("/profile/me", {
        name,
        bio,
        github,
        linkedIn,
        company,
        tier
      });
      setProfile(res.data.profile);
      setUser(res.data.user);
      
      // Update name in local authStore state
      useAuthStore.setState({ user: res.data.user });
      
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile info");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 select-none text-white">
      {/* Header Info banner */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 border-white/5 relative overflow-hidden">
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-16 h-16 rounded-full object-cover border border-[#8B5CF6]/40"
          />
        ) : (
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md shrink-0 animate-pulse"
            style={{
              backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            }}
          >
            {getInitials(user?.name)}
          </div>
        )}

        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-xl font-black text-white leading-tight">{user?.name}</h2>
          <p className="text-xs text-[#94A3B8] font-mono leading-none">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
            <span className="pill text-[9px] bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 py-0.5 px-2 select-none capitalize">
              {user?.role || "candidate"}
            </span>
            <span className="pill text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 py-0.5 px-2 select-none">
              {profile?.xpPoints || 0} XP
            </span>
          </div>
        </div>
      </div>

      {/* Subscription & Plans Card */}
      <div className="glass-card p-6 border-white/5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
          <Star className="w-4 h-4 text-amber-400" />
          <span>Active Subscription Plan</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
          {/* Free plan */}
          <div 
            onClick={() => setTier("free")}
            className={`p-4 rounded-xl cursor-pointer transition border ${tier === "free" ? "border-cyan-400 bg-cyan-400/5 shadow-glow" : "border-white/5 hover:border-white/10 bg-white/[0.01]"}`}
          >
            <h4 className="text-xs font-bold text-white">Free Starter</h4>
            <div className="text-sm font-black text-white mt-1">$0</div>
            <p className="text-[10px] text-[#94A3B8] mt-2 font-semibold font-semibold">Unlimited mocks • JS Only</p>
          </div>

          {/* Pro plan */}
          <div 
            onClick={() => setTier("pro")}
            className={`p-4 rounded-xl cursor-pointer transition border relative ${tier === "pro" ? "border-[#8B5CF6] bg-[#8B5CF6]/5 shadow-glow" : "border-white/5 hover:border-white/10 bg-white/[0.01]"}`}
          >
            {tier === "pro" && (
              <span className="absolute top-0 right-4 -translate-y-1/2 text-[7px] bg-[#8B5CF6] text-white font-extrabold px-1.5 py-0.5 rounded shadow">ACTIVE</span>
            )}
            <h4 className="text-xs font-bold text-white">Pro Developer</h4>
            <div className="text-sm font-black text-white mt-1">$9/mo</div>
            <p className="text-[10px] text-[#94A3B8] mt-2 font-semibold font-semibold">Unlimited mocks • All 10 languages • AI audio mode</p>
          </div>

          {/* Enterprise plan */}
          <div 
            onClick={() => setTier("enterprise")}
            className={`p-4 rounded-xl cursor-pointer transition border relative ${tier === "enterprise" ? "border-purple-400 bg-purple-400/5 shadow-glow" : "border-white/5 hover:border-white/10 bg-white/[0.01]"}`}
          >
            {tier === "enterprise" && (
              <span className="absolute top-0 right-4 -translate-y-1/2 text-[7px] bg-purple-500 text-white font-extrabold px-1.5 py-0.5 rounded shadow">ACTIVE</span>
            )}
            <h4 className="text-xs font-bold text-white">Recruiter Enterprise</h4>
            <div className="text-sm font-black text-white mt-1">Custom</div>
            <p className="text-[10px] text-[#94A3B8] mt-2 font-semibold">Video rooms • Custom pipelines • Proctor logs</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
          <UserIcon className="w-4 h-4 text-[#8B5CF6]" />
          <span>Edit Profile Details</span>
        </h3>

        <form onSubmit={handleUpdate} className="space-y-4 select-text">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "12px 16px",
                color: "#fff",
                width: "100%",
                outline: "none",
                fontSize: 14,
              }}
              className="focus:border-[#8B5CF6] transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Short Professional Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your developer experience and primary stack..."
              rows={3}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "12px 16px",
                color: "#fff",
                width: "100%",
                outline: "none",
                fontSize: 14,
              }}
              maxLength={160}
              className="focus:border-[#8B5CF6] transition-colors"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Current Company / Organization
            </label>
            <div className="relative">
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google / Freelance / Student"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "12px 16px 12px 40px",
                  color: "#fff",
                  width: "100%",
                  outline: "none",
                  fontSize: 14,
                }}
                className="focus:border-[#8B5CF6] transition-colors"
              />
              <Briefcase className="w-4 h-4 absolute left-3.5 top-3.5 text-[#475569]" />
            </div>
          </div>

          {/* GitHub Profile */}
          <div>
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              GitHub Profile Link
            </label>
            <div className="relative">
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/your-username"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "12px 16px 12px 40px",
                  color: "#fff",
                  width: "100%",
                  outline: "none",
                  fontSize: 14,
                }}
                className="focus:border-[#8B5CF6] transition-colors"
              />
              <Github className="w-4 h-4 absolute left-3.5 top-3.5 text-[#475569]" />
            </div>
          </div>

          {/* LinkedIn Profile */}
          <div>
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              LinkedIn Profile Link
            </label>
            <div className="relative">
              <input
                type="url"
                value={linkedIn}
                onChange={(e) => setLinkedIn(e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "12px 16px 12px 40px",
                  color: "#fff",
                  width: "100%",
                  outline: "none",
                  fontSize: 14,
                }}
                className="focus:border-[#8B5CF6] transition-colors"
              />
              <Linkedin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#475569]" />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3 text-xs justify-center rounded-xl mt-6 shadow-glow shadow-purple/10 cursor-pointer flex items-center justify-center gap-2"
            style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
