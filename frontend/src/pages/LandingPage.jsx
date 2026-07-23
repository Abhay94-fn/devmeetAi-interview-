// frontend/src/pages/LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Brain, Code, Video, BookOpen, FileText, ChevronDown, CheckCircle2,
  ArrowRight, ShieldAlert, Cpu, Award, Zap, Compass, Users, LayoutDashboard, Globe, Trophy
} from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import Particles from "../components/ui/Particles.jsx";
import { PinContainer } from "../components/ui/3DPinCard.jsx";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden flex flex-col"
      style={{ backgroundColor: "#060612" }}
    >
      {/* Ambient orbs */}
      <div className="bg-orb bg-orb-purple" style={{ width: 500, height: 500, top: -100, left: -100, pointerEvents: "none" }} />
      <div className="bg-orb bg-orb-cyan" style={{ width: 400, height: 400, top: -80, right: -80, pointerEvents: "none" }} />
      <div className="bg-orb bg-orb-pink" style={{ width: 450, height: 450, bottom: -100, left: "35%", pointerEvents: "none" }} />

      <Navbar />

      <div className="flex-1 relative z-10">
        {/* SECTION 1: Animated Hero */}
        <section className="min-h-[calc(100vh-54px)] flex flex-col justify-center items-center px-6 py-16 text-center max-w-5xl mx-auto relative select-none">
          <Particles
            className="absolute inset-0 z-0"
            quantity={100}
            ease={80}
            color="#8B5CF6"
            refresh
          />

          <div className="pill bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 py-1.5 px-4 mb-8 font-semibold tracking-wide flex items-center gap-2 select-none animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Powered by Gemini Live Voice AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Master Technical <br />
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Interviews with AI
            </span>
          </h1>

          <p className="text-[#94A3B8] text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-medium">
            Practice with real audio-to-audio conversational AI, execute code in 10 languages locally inside your browser, prevent cheating with integrity filters, and unlock automated report scorecards.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <button
              onClick={() => navigate("/auth")}
              className="btn-primary py-3.5 px-8 text-sm font-bold rounded-full flex items-center gap-2 cursor-pointer shadow-glow transition"
              style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
            >
              <span>Start Free Today</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="btn-ghost py-3.5 px-8 text-sm font-bold rounded-full no-underline hover:bg-white/5 border border-white/10"
            >
              Explore Features
            </a>
          </div>

          {/* Stats count-up wrapper */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-3xl w-full border-t border-white/5 pt-8 select-none">
            <div>
              <h3 className="text-3xl font-black text-white leading-none">12,400+</h3>
              <p className="text-xs text-[#94A3B8] font-bold uppercase mt-2">Active Developers</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white leading-none">94%</h3>
              <p className="text-xs text-[#94A3B8] font-bold uppercase mt-2">Placement Rate</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white leading-none">50+</h3>
              <p className="text-xs text-[#94A3B8] font-bold uppercase mt-2">Partner Firms</p>
            </div>
          </div>
        </section>


        {/* SECTION 3: Bento Grid */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16 select-none">
            <h2 className="text-3xl font-bold text-white mb-2">Designed for the Next Wave</h2>
            <p className="text-sm text-[#94A3B8] max-w-md mx-auto">
              Everything you need to practice, clear pipeline, and evaluate tech capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Live Audio Card */}
            <div className="glass-card md:col-span-7 p-6 border-white/5 space-y-4 hover:border-[#8B5CF6]/30 transition">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-[#8B5CF6]/10 rounded-lg text-[#8B5CF6]">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="pill text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold uppercase">
                  New
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Voice AI Interviewer</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Connect your microphone and speak. DevMeet bridges your voice feed into Gemini Live WebSockets for sub-second, audio-to-audio mock conversations that analyze logic verbalizations.
              </p>
            </div>

            {/* Sandbox Card */}
            <div className="glass-card md:col-span-5 p-6 border-white/5 space-y-4 hover:border-[#06B6D4]/30 transition">
              <div className="p-2 bg-[#06B6D4]/10 rounded-lg text-[#06B6D4] w-fit">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">10 Languages, local WASM compiler</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Write code in Javascript, Python, C++, Go, and more. When Judge0 hits limit constraints, Pyodide compiles python natively inside your browser with 0ms execution latency.
              </p>
            </div>

            {/* Video Call Card */}
            <div className="glass-card md:col-span-4 p-6 border-white/5 space-y-4 hover:border-[#EC4899]/30 transition">
              <div className="p-2 bg-[#EC4899]/10 rounded-lg text-[#EC4899] w-fit">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Seamless Video Sandbox</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                High definition video calling powered by Daily.co. Integrates WebRTC P2P streams with Google/Cloudflare TURN redundancy.
              </p>
            </div>

            {/* Anti Cheat Card */}
            <div className="glass-card md:col-span-8 p-6 border-white/5 space-y-4 hover:border-amber-500/30 transition">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 w-fit">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Anti-Cheat Proctoring</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Tracks tab switching activities and copy-paste events. Generates integrity scores to ensure authentic assessment of candidate problem-solving skills.
              </p>
            </div>
          </div>

          {/* 3D Pin Highlights */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-12 mt-20 pt-10 select-none">
            <PinContainer title="Open Setup" href="/interview/setup" containerClassName="w-64 h-72">
              <div className="flex flex-col p-4 tracking-tight text-slate-100/50 w-56 h-64">
                <Sparkles className="w-8 h-8 text-[#8B5CF6] mb-4" />
                <h3 className="max-w-xs !pb-2 !m-0 font-bold text-sm text-slate-100">
                  AI Practice Sandbox
                </h3>
                <div className="text-xs !m-0 !p-0 font-normal">
                  <span className="text-slate-400">
                    Create customized mock interviews. Upload your resume to tailor topics.
                  </span>
                </div>
              </div>
            </PinContainer>

            <PinContainer title="Questions" href="/questions" containerClassName="w-64 h-72">
              <div className="flex flex-col p-4 tracking-tight text-slate-100/50 w-56 h-64">
                <BookOpen className="w-8 h-8 text-[#06B6D4] mb-4" />
                <h3 className="max-w-xs !pb-2 !m-0 font-bold text-sm text-slate-100">
                  Premium Question Bank
                </h3>
                <div className="text-xs !m-0 !p-0 font-normal">
                  <span className="text-slate-400">
                    20+ seeded industry challenges with full test cases, expected complexity, and starter templates.
                  </span>
                </div>
              </div>
            </PinContainer>

            <PinContainer title="Leaderboard" href="/leaderboard" containerClassName="w-64 h-72">
              <div className="flex flex-col p-4 tracking-tight text-slate-100/50 w-56 h-64">
                <Trophy className="w-8 h-8 text-amber-500 mb-4" />
                <h3 className="max-w-xs !pb-2 !m-0 font-bold text-sm text-slate-100">
                  XP Leaderboard
                </h3>
                <div className="text-xs !m-0 !p-0 font-normal">
                  <span className="text-slate-400">
                    Practice consistently, earn milestone badges, gain XP points, and climb the leaderboard.
                  </span>
                </div>
              </div>
            </PinContainer>
          </div>
        </section>

        {/* SECTION 4: How It Works */}
        <section className="py-20 border-t border-white/5 bg-white/[0.005] select-none">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-2">How It Works</h2>
              <p className="text-sm text-[#94A3B8]">Clear four simple steps to evaluate and practice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Create Account", desc: "Sign up via Google OAuth or standard registration under candidate or interviewer roles." },
                { step: "02", title: "Config Setup", desc: "Upload your resume PDF for Gemini to extract details and synthesize tailored exercises." },
                { step: "03", title: "Conduct Interview", desc: "Code inside Monaco. Toggle audio mode to stream mic chunks and speak directly with Gemini." },
                { step: "04", title: "Review Scorecard", desc: "Get reports mapped async. Review estimated engineering tier and FAANG competency." }
              ].map((item) => (
                <div key={item.step} className="space-y-4 relative">
                  <div className="text-5xl font-black text-white/5 font-mono leading-none">{item.step}</div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: Testimonials */}
        <section className="py-20 max-w-5xl mx-auto px-6 select-none">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Loved by Candidates</h2>
            <p className="text-sm text-[#94A3B8]">See how DevMeet helps engineers land offers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "The Gemini voice mode changed how I practice. Talking out loud while solving Arrays questions helped me pass Google's phone rounds.", name: "Ananya Sharma", role: "Software Engineer", company: "Google" },
              { text: "The anti-proctoring metrics and the async report gave me exactly the feedback I needed. The company fit tiers were incredibly accurate.", name: "Rahul Verma", role: "Frontend Dev", company: "Stripe" },
              { text: "Having local Pyodide compiled python within the editor was amazing. When compiler API slowed down, my sandboxes didn't freeze at all.", name: "Kunal Sen", role: "Backend Architect", company: "Uber" }
            ].map((t, idx) => (
              <div key={idx} className="glass-card p-6 border-white/5 space-y-4">
                <p className="text-xs text-[#94A3B8] leading-relaxed italic">"{t.text}"</p>
                <div>
                  <h5 className="text-xs font-bold text-white leading-tight">{t.name}</h5>
                  <p className="text-[10px] text-[#475569] font-bold mt-1 uppercase">{t.role} @ {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Pricing */}
        <section className="py-20 border-t border-white/5 bg-white/[0.005] select-none">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-2">Flexible Plans</h2>
              <p className="text-sm text-[#94A3B8]">Choose the best practice loop for your goals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Tier 1 */}
              <div className="glass-card p-6 border-white/5 flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Free Starter</h4>
                  <h3 className="text-3xl font-extrabold text-white leading-none">$0</h3>
                  <p className="text-xs text-[#94A3B8]">Practice fundamentals</p>
                  <hr className="border-white/5" />
                  <ul className="text-xs text-[#94A3B8] space-y-2 pl-4 list-disc">
                    <li>Unlimited mock sessions</li>
                    <li>Basic report dashboard</li>
                    <li>Monaco JavaScript IDE</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white border border-white/10 cursor-pointer mt-8 transition"
                >
                  Get Started
                </button>
              </div>

              {/* Tier 2 */}
              <div
                className="glass-card p-6 flex flex-col justify-between relative"
                style={{ border: "2px solid #8B5CF6" }}
              >
                <span className="absolute top-0 right-6 -translate-y-1/2 pill text-[8px] bg-[#8B5CF6] text-white font-bold uppercase py-1 px-3">
                  Most Popular
                </span>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Pro Developer</h4>
                  <h3 className="text-3xl font-extrabold text-white leading-none">$9<span className="text-xs text-[#94A3B8]"> /mo</span></h3>
                  <p className="text-xs text-[#94A3B8]">Accelerate job placement</p>
                  <hr className="border-white/5" />
                  <ul className="text-xs text-[#94A3B8] space-y-2 pl-4 list-disc">
                    <li>Unlimited mock sessions</li>
                    <li>Gemini audio-to-audio Live voice mode</li>
                    <li>10 compiler languages + Pyodide</li>
                    <li>Advanced FAANG company fit reports</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full py-2.5 rounded-lg text-xs font-bold text-white border-0 cursor-pointer mt-8 transition shadow-glow"
                  style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                >
                  Upgrade to Pro
                </button>
              </div>

              {/* Tier 3 */}
              <div className="glass-card p-6 border-white/5 flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Recruiter Enterprise</h4>
                  <h3 className="text-3xl font-extrabold text-white leading-none">Custom</h3>
                  <p className="text-xs text-[#94A3B8]">Conduct official assessments</p>
                  <hr className="border-white/5" />
                  <ul className="text-xs text-[#94A3B8] space-y-2 pl-4 list-disc">
                    <li>Interviewer portal integration</li>
                    <li>Daily.co HD video pipelines</li>
                    <li>Anti-cheat filters and proctor logs</li>
                    <li>Custom question manager & pipeline</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white border border-white/10 cursor-pointer mt-8 transition"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-[#03030b] select-none relative z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center font-bold text-[10px]"
            >
              D
            </div>
            <span className="text-white font-extrabold tracking-tight text-sm">DevMeet</span>
          </div>

          <div className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">
            © 2026 DevMeet Inc. • Made for Modern Engineering Pools
          </div>
        </div>
      </footer>
    </div>
  );
}
