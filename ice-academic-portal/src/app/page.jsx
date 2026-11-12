"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  CreditCard,
  Download,
  Building2,
  Cpu,
  Radio,
  Zap,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  Award
} from "lucide-react";

export default function HomePage() {
  const [activePortalTab, setActivePortalTab] = useState("all");

  const portals = [
    {
      id: "student",
      title: "Student Portal",
      role: "Undergraduate Students",
      tag: "Most Active",
      icon: GraduationCap,
      href: "/dashboard/student",
      color: "emerald",
      bgGradient: "from-emerald-500/20 to-teal-500/10",
      borderColor: "border-emerald-500/30 hover:border-emerald-400",
      btnClass: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20",
      description: "Complete academic companion for routine, online fee clearance, exam admit cards, and course lecture notes.",
      features: [
        "Live Class & Exam Routine",
        "bKash / Nagad Fee Payments",
        "Download Course PDFs & Slides",
        "CGPA & Term Marks Analytics"
      ]
    },
    {
      id: "teacher",
      title: "Faculty Portal",
      role: "Professors & Instructors",
      tag: "Academic Staff",
      icon: BookOpen,
      href: "/dashboard/teacher",
      color: "teal",
      bgGradient: "from-teal-500/20 to-cyan-500/10",
      borderColor: "border-teal-500/30 hover:border-teal-400",
      btnClass: "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20",
      description: "Classroom instruction suite for continuous assessment, daily student attendance, and resource distribution.",
      features: [
        "1-Click Daily Attendance",
        "CT, Quiz & Midterm Marks",
        "Upload Lecture Materials & PDFs",
        "Invigilation Duty Schedules"
      ]
    },
    {
      id: "admin",
      title: "Admin Authority",
      role: "Institutional Governance",
      tag: "Authority",
      icon: ShieldCheck,
      href: "/dashboard/admin",
      color: "cyan",
      bgGradient: "from-cyan-500/20 to-blue-500/10",
      borderColor: "border-cyan-500/30 hover:border-cyan-400",
      btnClass: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20",
      description: "Master administrative control for user approvals, fee verification, department rosters, and bulletins.",
      features: [
        "Student & Faculty Verification",
        "Fee Clearing & Financial Ledger",
        "Course & Routine Master Editor",
        "Campus-Wide Bulletins & Ticker"
      ]
    },
    {
      id: "alumni",
      title: "Alumni Association",
      role: "Graduates & Industry",
      tag: "Network",
      icon: Users,
      href: "/dashboard/alumni",
      color: "amber",
      bgGradient: "from-amber-500/20 to-orange-500/10",
      borderColor: "border-amber-500/30 hover:border-amber-400",
      btnClass: "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20",
      description: "Lifelong graduate network for mentorship, industry recruitment, referral jobs, and reunions.",
      features: [
        "Verified Alumni Directory",
        "Exclusive Tech & Engg Jobs",
        "1-on-1 Student Mentorship",
        "Convocation & Event Access"
      ]
    }
  ];

  const filteredPortals = activePortalTab === "all" 
    ? portals 
    : portals.filter(p => p.id === activePortalTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white antialiased flex flex-col">
      
      {/* ================= TOP TICKER / EMERGENCY NOTICE ================= */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-b border-emerald-500/20 text-xs py-2 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between gap-3">
          
          {/* Static Live Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider shrink-0 shadow-sm z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
            <span>Live Notice</span>
          </div>

          {/* Smooth Continuous Scrolling Marquee */}
          <div className="overflow-hidden whitespace-nowrap flex-1 relative mx-2">
            <div className="animate-ticker text-emerald-200 hover:text-white cursor-pointer transition-colors text-xs font-medium">
              <span className="mx-6 inline-flex items-center gap-2">
                <span className="text-amber-300 font-bold">[ADMISSIONS 2026-2027]</span>
                <span>🎓 Admissions Open for 2026-2027 Academic Session! Applications are invited for B.Sc. in ICE, CSE &amp; EEE Engineering programs with up to 50% merit scholarships. Apply online today!</span>
                <span className="text-emerald-500 font-black ml-4">•</span>
              </span>
              <span className="mx-6 inline-flex items-center gap-2">
                <span className="text-cyan-300 font-bold">[EXAM NOTICE]</span>
                <span>📢 Spring 2026 Final Semester Examinations schedule is published. Download your verified Admit Card before Nov 15.</span>
                <span className="text-emerald-500 font-black ml-4">•</span>
              </span>
              <span className="mx-6 inline-flex items-center gap-2">
                <span className="text-teal-300 font-bold">[DIGITAL CAMPUS]</span>
                <span>⚡ 24/7 AI Academic Assistant is now active for fee dues calculation, routine lookup &amp; course lecture notes.</span>
                <span className="text-emerald-500 font-black ml-4">•</span>
              </span>
            </div>
          </div>

          {/* Right Contact Details */}
          <div className="hidden lg:flex items-center gap-4 text-emerald-300 text-xs shrink-0 font-medium z-10 pl-2">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Hotline: +880 2-8878900
            </span>
            <span className="text-emerald-600">•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Khulna - 9000
            </span>
          </div>

        </div>

        <style>{`
          @keyframes tickerScroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-ticker {
            display: inline-block;
            white-space: nowrap;
            animation: tickerScroll 34s linear infinite;
          }
          .animate-ticker:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>

      {/* ================= MAIN NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Crest & Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-xl font-black tracking-tighter bg-gradient-to-tr from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                  ICE
                </span>
              </div>
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg tracking-tight text-white leading-tight">
                IMPERIAL COLLEGE
              </h1>
              <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                OF ENGINEERING &bull; ACADEMIC PORTAL
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#portals" className="hover:text-emerald-400 transition-colors">
              Portals Hub
            </a>
            <a href="#departments" className="hover:text-emerald-400 transition-colors">
              Departments
            </a>
            <a href="#assistant" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              AI Assistant
            </a>
            <a href="#about" className="hover:text-emerald-400 transition-colors">
              Accreditation
            </a>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-900 border border-slate-800 transition"
            >
              Sign In
            </Link>
            <a
              href="#portals"
              className="text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Access Portals</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-[110px] pointer-events-none"></div>

        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Accreditation Honor Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 shadow-sm">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>IEB Accredited &bull; Government Approved UGC Engineering Institution</span>
          </div>

          {/* Hero Headline */}
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Empowering Next-Gen <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Engineers & Tech Innovators
            </span>
          </h2>

          {/* Hero Subtitle */}
          <p className="mt-6 text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            A unified, high-performance academic ecosystem connecting students, distinguished faculty, and alumni. Instant routine tracking, bKash fee clearances, lecture PDF downloads, and 24/7 AI academic assistance.
          </p>

          {/* Primary Call to Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard/student"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Enter Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <a
              href="#portals"
              className="px-7 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm sm:text-base border border-slate-700/80 shadow-md transition-all flex items-center gap-2"
            >
              <span>Explore All 4 Portals</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* University Key Metrics Counter Cards */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-center">
              <div className="text-3xl font-black text-white">2,850+</div>
              <div className="text-xs font-semibold text-slate-400 mt-1">Undergrad Engineers</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-center">
              <div className="text-3xl font-black text-emerald-400">55+</div>
              <div className="text-xs font-semibold text-slate-400 mt-1">PhD & Research Faculty</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-center">
              <div className="text-3xl font-black text-teal-300">100%</div>
              <div className="text-xs font-semibold text-slate-400 mt-1">Paperless Operations</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-center">
              <div className="text-3xl font-black text-cyan-300">94.8%</div>
              <div className="text-xs font-semibold text-slate-400 mt-1">Tech Placement Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4 ROLE PORTALS SHOWCASE ================= */}
      <section id="portals" className="py-20 bg-slate-900/40 border-t border-b border-slate-800/80 relative">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
              Single Sign-On Architecture
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Specialized Portals for Every Member
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Select your role below to jump directly into your tailored campus dashboard with real-time tools.
            </p>
          </div>

          {/* Role Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { id: "all", label: "View All 4 Portals" },
              { id: "student", label: "Student Hub" },
              { id: "teacher", label: "Faculty Hub" },
              { id: "admin", label: "Admin Hub" },
              { id: "alumni", label: "Alumni Hub" }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setActivePortalTab(pill.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePortalTab === pill.id
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* 4 Portals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPortals.map(portal => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.id}
                  className={`group relative rounded-3xl bg-slate-950/90 border ${portal.borderColor} p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl shadow-lg`}
                >
                  {portal.tag && (
                    <div className="absolute top-4 right-4 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {portal.tag}
                    </div>
                  )}

                  <div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.bgGradient} border border-slate-700/60 flex items-center justify-center text-emerald-400 mb-5`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    <h4 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {portal.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                      {portal.role}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {portal.description}
                    </p>

                    <div className="mt-5 space-y-2 border-t border-slate-800/80 pt-4">
                      {portal.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-800">
                    <Link
                      href={portal.href}
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition shadow-md ${portal.btnClass}`}
                    >
                      <span>Enter {portal.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= ACADEMIC DEPARTMENTS SHOWCASE ================= */}
      <section id="departments" className="py-20">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
                Undergraduate Divisions
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
                Core Engineering Disciplines
              </h3>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md">
              Industry-driven curriculums aligned with Washington Accord standards, focusing on high-speed communications, AI software engineering, and smart electronic circuits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Dept 1: ICE */}
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 hover:border-emerald-500/40 transition group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Radio className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-300 rounded-lg">
                  160 Credits &bull; 4 Years
                </span>
              </div>
              <h5 className="text-lg font-bold text-white mt-4 group-hover:text-emerald-300 transition-colors">
                Dept of Information & Communication Eng. (ICE)
              </h5>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Specialized tracks in 5G/6G Wireless Networks, Optical Fiber Systems, Digital Signal Processing, and IoT Embedded Hardware.
              </p>
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Faculty: 18 Professors</span>
                <span className="text-emerald-400 font-semibold">4 Specialized Labs</span>
              </div>
            </div>

            {/* Dept 2: CSE */}
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 hover:border-teal-500/40 transition group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-teal-500/10 text-teal-300 rounded-lg">
                  160 Credits &bull; 4 Years
                </span>
              </div>
              <h5 className="text-lg font-bold text-white mt-4 group-hover:text-teal-300 transition-colors">
                Dept of Computer Science & Engineering (CSE)
              </h5>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Advanced curriculums in Artificial Intelligence, Distributed Cloud Computing, Cyber Security, and Modern Full-Stack Systems.
              </p>
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Faculty: 24 Professors</span>
                <span className="text-teal-400 font-semibold">6 Computing Labs</span>
              </div>
            </div>

            {/* Dept 3: EEE */}
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 hover:border-cyan-500/40 transition group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg">
                  160 Credits &bull; 4 Years
                </span>
              </div>
              <h5 className="text-lg font-bold text-white mt-4 group-hover:text-cyan-300 transition-colors">
                Dept of Electrical & Electronic Eng. (EEE)
              </h5>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Smart Grid Power Transmission, VLSI Microchip Architecture, Renewable Solar Energies, and Precision Robotics.
              </p>
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Faculty: 16 Professors</span>
                <span className="text-cyan-400 font-semibold">5 Heavy Power Labs</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 24/7 AI ASSISTANT SPOTLIGHT ================= */}
      <section id="assistant" className="py-20 bg-gradient-to-b from-slate-950 via-emerald-950/20 to-slate-950 border-t border-slate-800/80">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/60 border border-emerald-500/30 p-8 sm:p-12 relative overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Campus Intelligence</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  24/7 AI Academic Assistant Built Right In
                </h3>
                
                <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                  No more queues at administrative desks or digging through paper notices. Students and teachers can ask natural queries to fetch course materials, exam routines, fee dues, and library book loans.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                    <Download className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="text-xs">
                      <strong className="text-white">"Download Course PDFs & Slides"</strong>
                      <p className="text-slate-400">Fetches teacher-uploaded lecture slides and lab manuals with 1-click download links.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-teal-400 shrink-0" />
                    <div className="text-xs">
                      <strong className="text-white">"Calculate Remaining Fee Dues"</strong>
                      <p className="text-slate-400">Dynamically evaluates paid tuition vs target dues and gives instant bKash payment buttons.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div className="text-xs">
                      <strong className="text-white">"Check Final Exam Routine & Admit"</strong>
                      <p className="text-slate-400">Displays course codes, exact exam dates, exam hall room numbers, and admit verification.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Link
                    href="/dashboard/student"
                    className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-2"
                  >
                    <span>Try AI Assistant in Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Interactive Mockup Preview of Assistant */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 shadow-2xl relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="font-bold text-white">ICE Academic AI Assistant</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                    Online &bull; Real-Time
                  </span>
                </div>

                <div className="space-y-3 mt-4 text-xs font-sans">
                  {/* User Question */}
                  <div className="flex justify-end">
                    <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-xs px-3.5 py-2 max-w-[85%] shadow">
                      What are my unpaid semester fees and how do I pay?
                    </div>
                  </div>

                  {/* AI Answer */}
                  <div className="flex justify-start">
                    <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-2xl rounded-tl-xs p-3.5 max-w-[90%] shadow space-y-2">
                      <p className="text-slate-100 font-semibold">
                        💳 Fee Clearance Status:
                      </p>
                      <p className="text-xs text-slate-300">
                        Target Semester Fee: ৳25,000<br />
                        Total Paid to Date: ৳15,000<br />
                        <span className="text-amber-300 font-bold">Outstanding Due: ৳10,000</span>
                      </p>
                      <div className="pt-1">
                        <Link
                          href="/payments"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] hover:bg-emerald-400 transition"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Pay Due ৳10,000 Online Now</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 flex items-center justify-between">
                    <span>Ask: "Give me CSE-3101 course PDFs"</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ================= INSTITUTIONAL FOOTER ================= */}
      <footer id="about" className="bg-slate-950 border-t border-slate-800 pt-16 pb-12 text-slate-400 text-xs mt-auto">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xs">
                  ICE
                </div>
                <span className="font-bold text-white text-sm">Imperial College of Eng.</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                Pioneering frontier engineering education, research integrity, and human capital transformation in Bangladesh.
              </p>
              <div className="text-[11px] text-emerald-400 font-medium">
                Approved by University Grants Commission (UGC) &amp; IEB Accredited.
              </div>
            </div>

            <div>
              <h6 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Institutional Links</h6>
              <ul className="space-y-2">
                <li><Link href="/dashboard/student" className="hover:text-emerald-400 transition">Student Dashboard</Link></li>
                <li><Link href="/dashboard/teacher" className="hover:text-emerald-400 transition">Faculty Management</Link></li>
                <li><Link href="/dashboard/admin" className="hover:text-emerald-400 transition">Administration Portal</Link></li>
                <li><Link href="/dashboard/alumni" className="hover:text-emerald-400 transition">Alumni Association</Link></li>
                <li><Link href="/login" className="hover:text-emerald-400 transition">Institutional SSO Login</Link></li>
              </ul>
            </div>

            <div>
              <h6 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Academic Divisions</h6>
              <ul className="space-y-2">
                <li><a href="#departments" className="hover:text-emerald-400 transition">Dept of ICE (Communication)</a></li>
                <li><a href="#departments" className="hover:text-emerald-400 transition">Dept of CSE (Computing)</a></li>
                <li><a href="#departments" className="hover:text-emerald-400 transition">Dept of EEE (Electrical)</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Central Engineering Library</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Research &amp; Innovation Cell</a></li>
              </ul>
            </div>

            <div>
              <h6 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Campus Headquarters</h6>
              <p className="leading-relaxed">
                Imperial Academic Campus<br />
                Upper Jessore Road<br />
                Khulna - 9000, Bangladesh
              </p>
              <p className="mt-2 text-slate-300">
                Email: <span className="text-emerald-400">info@ice.edu.bd</span><br />
                Registrar: <span className="text-emerald-400">+880 2-8878901</span>
              </p>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              &copy; 2026 Imperial College of Engineering (ICE). All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition">Terms of Academic Service</a>
              <a href="#" className="hover:text-slate-300 transition">Student Code of Conduct</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
