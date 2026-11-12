"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
    LayoutDashboard,
    Briefcase,
    HeartHandshake,
    Calendar,
    Search,
    Bell,
    LogOut,
    Plus,
    Building2,
    MapPin,
    DollarSign,
    Mail,
    MessageSquare,
    ArrowRight,
    Users,
    Menu,
    X,
    Sparkles,
    CheckCircle2,
    Award,
    Printer,
    QrCode,
    Check,
    Send,
    Trash2,
    ExternalLink,
    Filter,
} from "lucide-react";

// Default starter job postings (fallback if localStorage is empty)
const DEFAULT_ALUMNI_JOBS = [
    {
        id: "JOB-1",
        title: "Junior Software Engineer (React / Next.js)",
        company: "Brain Station 23 / Global",
        location: "Dhaka (Hybrid)",
        salary: "৳45,000 - ৳65,000 / mo",
        type: "Full-Time",
        postedBy: "Engr. Tanvir Rahman (Alumni 2021)",
        link: "https://careers.ice.edu.bd/jobs/1",
        date: "Nov 02, 2026",
    },
    {
        id: "JOB-2",
        title: "Graduate Network & Telecom Trainee",
        company: "Banglalink Digital Communications",
        location: "Gulshan, Dhaka",
        salary: "৳35,000 / mo + Benefits",
        type: "Full-Time",
        postedBy: "Sabbir Hasan (Alumni 2020)",
        link: "https://careers.ice.edu.bd/jobs/2",
        date: "Nov 06, 2026",
    },
    {
        id: "JOB-3",
        title: "Frontend Developer Intern",
        company: "Optimizely BD",
        location: "Remote / Banani",
        salary: "৳20,000 Stipend",
        type: "Internship",
        postedBy: "Nadia Islam (Alumni 2022)",
        link: "https://careers.ice.edu.bd/jobs/3",
        date: "Nov 08, 2026",
    },
];

const AlumniDashboard = () => {
    const router = useRouter();

    // UI & Navigation States
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, jobs, mentorship, directory, events
    const [notificationMsg, setNotificationMsg] = useState("");
    const [showAlumniCardModal, setShowAlumniCardModal] = useState(false);
    const [showPostJobModal, setShowPostJobModal] = useState(false);

    // Dynamic Data States
    const [currentUser, setCurrentUser] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [notices, setNotices] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [mentorshipRequests, setMentorshipRequests] = useState([]);
    const [eventRsvps, setEventRsvps] = useState([]);

    // Job Search & Form State
    const [jobSearch, setJobSearch] = useState("");
    const [jobForm, setJobForm] = useState({
        title: "",
        company: "",
        location: "Dhaka (Hybrid)",
        salary: "",
        type: "Full-Time",
        link: "",
    });

    // Mentorship Reply State
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [replyText, setReplyText] = useState("");

    // Alumni Directory Search & Filter
    const [directorySearch, setDirectorySearch] = useState("");
    const [directoryDept, setDirectoryDept] = useState("All");

    // Load data from localStorage on mount
    useEffect(() => {
        try {
            // 1. Load Current Logged In Alumni
            const storedUser = JSON.parse(localStorage.getItem("portal_current_user") || "null");
            const storedUsers = JSON.parse(localStorage.getItem("portal_users") || "[]");
            setAllUsers(storedUsers);

            if (storedUser && (storedUser.role === "alumni" || storedUser.status === "graduated")) {
                setCurrentUser(storedUser);
            } else {
                const firstAlumni = storedUsers.find((u) => u.role === "alumni" && u.status === "approved") || {
                    fullName: "Engr. Tanvir Rahman",
                    name: "Engr. Tanvir Rahman",
                    email: "tanvir.alumni@ice.edu.bd",
                    department: "ICE",
                    session: "2019-2020",
                    alumniId: "ALM-2020-089",
                    designation: "Senior Software Engineer @ TechCorp",
                    phone: "+880 1711-998877",
                    status: "approved",
                };
                setCurrentUser(firstAlumni);
            }

            // 2. Load Notices
            const storedNotices = JSON.parse(localStorage.getItem("portal_notices") || "[]");
            setNotices(storedNotices);

            // 3. Load Alumni Jobs
            const storedJobs = JSON.parse(localStorage.getItem("portal_alumni_jobs") || "null");
            if (storedJobs && storedJobs.length > 0) {
                setJobs(storedJobs);
            } else {
                setJobs(DEFAULT_ALUMNI_JOBS);
                localStorage.setItem("portal_alumni_jobs", JSON.stringify(DEFAULT_ALUMNI_JOBS));
            }

            // 4. Load Mentorship Requests
            const storedRequests = JSON.parse(localStorage.getItem("portal_mentorship_requests") || "[]");
            setMentorshipRequests(storedRequests);

            // 5. Load Event RSVPs
            const storedRsvps = JSON.parse(localStorage.getItem("portal_event_rsvps") || "[]");
            setEventRsvps(storedRsvps);
        } catch (e) {
            console.error("Error loading alumni data:", e);
        }

        // Live Sync with MongoDB Atlas via Express API
        const syncAlumniData = async () => {
            try {
                // 1. Alumni Jobs
                const jRes = await apiRequest("/academic/jobs");
                if (jRes && jRes.success && jRes.jobs && jRes.jobs.length > 0) {
                    setJobs(jRes.jobs);
                    localStorage.setItem("portal_alumni_jobs", JSON.stringify(jRes.jobs));
                }

                // 2. Users (Alumni Directory)
                const uRes = await apiRequest("/auth/users");
                if (uRes && uRes.success && uRes.users) {
                    setAllUsers(uRes.users);
                    localStorage.setItem("portal_users", JSON.stringify(uRes.users));
                }

                // 3. Notices
                const nRes = await apiRequest("/academic/notices");
                if (nRes && nRes.success && nRes.notices && nRes.notices.length > 0) {
                    setNotices(nRes.notices);
                    localStorage.setItem("portal_notices", JSON.stringify(nRes.notices));
                }
            } catch (err) {
                console.warn("Alumni sync fallback to local:", err.message);
            }
        };

        syncAlumniData();
    }, []);

    // Filter notices targeted for All or Alumni
    const alumniNotices = notices.filter(
        (n) => n.audience === "All" || n.audience === "Alumni" || !n.audience
    );

    // Filter fellow graduates from portal_users
    const alumniDirectory = allUsers.filter(
        (u) => (u.role === "alumni" || u.session?.includes("Pass") || u.status === "graduated") && u.status !== "rejected"
    );

    const filteredDirectory = alumniDirectory.filter((al) => {
        const matchesSearch =
            (al.fullName || al.name || "").toLowerCase().includes(directorySearch.toLowerCase()) ||
            (al.department || "").toLowerCase().includes(directorySearch.toLowerCase()) ||
            (al.session || "").toLowerCase().includes(directorySearch.toLowerCase());
        const matchesDept = directoryDept === "All" || al.department?.toUpperCase() === directoryDept.toUpperCase();
        return matchesSearch && matchesDept;
    });

    // Filter jobs by search
    const filteredJobs = jobs.filter((j) =>
        (j.title + " " + j.company + " " + j.location).toLowerCase().includes(jobSearch.toLowerCase())
    );

    // Mentorship requests for this alumni
    const myMentorshipRequests = mentorshipRequests.filter((m) => {
        const myName = (currentUser?.fullName || currentUser?.name || "").toLowerCase();
        const myEmail = (currentUser?.email || "").toLowerCase();
        return (
            (m.alumniName && m.alumniName.toLowerCase().includes(myName)) ||
            (m.alumniEmail && m.alumniEmail.toLowerCase() === myEmail) ||
            !m.alumniId // general requests
        );
    });

    // Handler: Post New Job
    const handleCreateJob = async (e) => {
        e.preventDefault();
        if (!jobForm.title.trim() || !jobForm.company.trim()) return;

        const newJob = {
            id: `JOB-${Date.now()}`,
            ...jobForm,
            postedBy: currentUser?.fullName || currentUser?.name || "Verified Alumni",
            postedByEmail: currentUser?.email,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };

        const updated = [newJob, ...jobs];
        setJobs(updated);
        localStorage.setItem("portal_alumni_jobs", JSON.stringify(updated));

        // Save to MongoDB backend
        try {
            const res = await apiRequest("/academic/jobs", "POST", newJob);
            if (res && res.success && res.job) {
                // optionally update job with mongo _id
                const synced = [res.job, ...jobs];
                setJobs(synced);
            }
        } catch (err) {
            console.warn("MongoDB Job save fallback to local:", err.message);
        }

        setJobForm({
            title: "",
            company: "",
            location: "Dhaka (Hybrid)",
            salary: "",
            type: "Full-Time",
            link: "",
        });
        setShowPostJobModal(false);
        setNotificationMsg(`✓ Successfully posted job referral for ${newJob.title}!`);
        setTimeout(() => setNotificationMsg(""), 3500);
    };

    const handleDeleteJob = (jobId) => {
        if (!confirm("Are you sure you want to remove this job posting?")) return;
        const updated = jobs.filter((j) => j.id !== jobId);
        setJobs(updated);
        localStorage.setItem("portal_alumni_jobs", JSON.stringify(updated));
        setNotificationMsg("Job posting removed.");
        setTimeout(() => setNotificationMsg(""), 3000);
    };

    // Handler: Send Reply to Mentorship Request
    const handleSendMentorshipReply = (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedRequest) return;

        const updated = mentorshipRequests.map((req) => {
            if (req.id === selectedRequest.id) {
                return {
                    ...req,
                    reply: replyText,
                    status: "answered",
                    replyDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    repliedBy: currentUser?.fullName || currentUser?.name,
                };
            }
            return req;
        });

        setMentorshipRequests(updated);
        localStorage.setItem("portal_mentorship_requests", JSON.stringify(updated));
        setReplyText("");
        setSelectedRequest(null);
        setNotificationMsg("✓ Mentorship reply sent to student successfully!");
        setTimeout(() => setNotificationMsg(""), 3500);
    };

    // Handler: RSVP for Campus Reunion Gala
    const isRsvpConfirmed = eventRsvps.some(
        (r) => r.email === currentUser?.email || r.name === (currentUser?.fullName || currentUser?.name)
    );

    const handleToggleRsvp = () => {
        if (isRsvpConfirmed) {
            const updated = eventRsvps.filter(
                (r) => r.email !== currentUser?.email && r.name !== (currentUser?.fullName || currentUser?.name)
            );
            setEventRsvps(updated);
            localStorage.setItem("portal_event_rsvps", JSON.stringify(updated));
            setNotificationMsg("Reunion Gala RSVP cancelled.");
        } else {
            const newRsvp = {
                id: `RSVP-${Date.now()}`,
                name: currentUser?.fullName || currentUser?.name || "Alumni",
                email: currentUser?.email || "alumni@ice.edu.bd",
                department: currentUser?.department || "ICE",
                session: currentUser?.session || "2020",
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            };
            const updated = [newRsvp, ...eventRsvps];
            setEventRsvps(updated);
            localStorage.setItem("portal_event_rsvps", JSON.stringify(updated));
            setNotificationMsg("✓ Congratulations! Your RSVP for ICE Annual Reunion Gala 2026 is confirmed!");
        }
        setTimeout(() => setNotificationMsg(""), 4000);
    };

    const handleLogout = () => {
        localStorage.removeItem("portal_current_user");
        router.push("/login");
    };

    const handlePrintAlumniCard = () => {
        window.print();
    };

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "jobs", label: "Job & Referral Board", icon: Briefcase, count: jobs.length },
        { id: "mentorship", label: "Mentorship Hub", icon: HeartHandshake, count: myMentorshipRequests.length },
        { id: "directory", label: "Alumni Directory", icon: Users, count: alumniDirectory.length },
        { id: "events", label: "Campus Reunions", icon: Calendar },
    ];

    return (
        <div className="w-full min-h-screen bg-[#FDF9F3] flex justify-center items-center">
            <div className="w-full max-w-[1920px] h-screen max-h-[960px] bg-[#FDF9F3] flex font-sans antialiased text-slate-800 overflow-hidden relative shadow-sm">
                {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                />
            )}

            {/* ===================== SIDEBAR (WARM AMBER / GOLD THEME) ===================== */}
            <aside
                className={`fixed lg:sticky top-0 h-full z-50 w-64 shrink-0 bg-gradient-to-b from-[#92400E] via-[#B45309] to-[#451A03] text-white flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div>
                    {/* Sidebar Header */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center shadow-inner">
                                <Briefcase className="w-5 h-5 text-amber-300" />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-base tracking-wider leading-tight">ICE PORTAL</h2>
                                <p className="text-[10px] text-amber-200/70 uppercase tracking-widest font-semibold">Alumni Network</p>
                            </div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-300 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav className="p-4 space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? "bg-amber-600 text-white shadow-lg shadow-amber-950/40"
                                            : "text-amber-100/80 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-amber-300/70"}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.count !== undefined && item.count > 0 && (
                                        <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Alumni Profile Footer */}
                <div className="p-4 border-t border-white/10 m-3 bg-white/5 rounded-2xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-900 font-bold flex items-center justify-center text-xs shadow-md shrink-0">
                        {(currentUser?.fullName || currentUser?.name || "AL").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">{currentUser?.fullName || currentUser?.name || "Alumni"}</h4>
                        <p className="text-[10px] text-amber-200/70 truncate">{currentUser?.department || "ICE"} • Session {currentUser?.session || "2020"}</p>
                    </div>
                </div>
            </aside>

            {/* ===================== MAIN WRAPPER ===================== */}
            <div className="flex-1 h-full overflow-y-auto flex flex-col min-w-0">

                {/* TOP HEADER */}
                <header className="h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 sticky top-0 z-30 shadow-xs flex items-center">
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div className="relative hidden sm:block w-72 md:w-96">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search alumni, jobs, mentorship programs..."
                                    value={jobSearch}
                                    onChange={(e) => setJobSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="hidden md:flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>Annual Alumni Gala Night: Dec 20, 2026</span>
                            </div>

                            <button
                                onClick={() => setShowAlumniCardModal(true)}
                                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <QrCode className="w-3.5 h-3.5 text-amber-600" />
                                <span className="hidden sm:inline">Alumni ID Card</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-xs font-semibold text-slate-700 transition cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* ================= CONTINUOUS RUNNING NOTICE TICKER ================= */}
                <div className="bg-gradient-to-r from-[#451A03] via-[#78350F] to-[#451A03] text-white text-xs font-medium py-2 px-4 sm:px-8 border-b border-amber-900/40 overflow-hidden shadow-xs">
                    <div className="w-full flex items-center">
                        <div className="flex items-center gap-1.5 bg-amber-500 text-slate-900 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider shrink-0 z-10 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-ping" />
                            <span>Alumni Notice</span>
                        </div>

                        <div className="overflow-hidden whitespace-nowrap w-full ml-4 relative">
                            <div className="inline-block animate-marquee hover:[animation-play-state:paused] cursor-pointer">
                                {alumniNotices.length > 0 ? (
                                    alumniNotices.map((n, idx) => (
                                        <span key={n.id || idx} className="mx-6 inline-flex items-center gap-2 text-amber-100 hover:text-white">
                                            <span className="text-amber-300 font-bold">[{n.category}]</span>
                                            <span className="font-semibold text-white">{n.title}:</span>
                                            <span className="text-amber-200">{n.content.slice(0, 85)}...</span>
                                            <span className="text-amber-400 text-[10px]">({n.date})</span>
                                            <span className="text-amber-600 font-black ml-4">•</span>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-amber-200">
                                        🎓 Welcome to the Imperial College of Engineering Official Alumni Association Portal • Stay connected with juniors & alma mater.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes marquee {
                            0% { transform: translateX(100%); }
                            100% { transform: translateX(-100%); }
                        }
                        .animate-marquee {
                            animation: marquee 28s linear infinite;
                        }
                    `}</style>
                </div>

                {/* DASHBOARD BODY */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">

                    {notificationMsg && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>{notificationMsg}</span>
                        </div>
                    )}

                    {/* Page Title & Profile Highlight Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                        <div className="lg:col-span-8">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <span>Welcome Back, {currentUser?.fullName || currentUser?.name || "Graduate"}!</span>
                                <span className="text-2xl">🎓</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Department of {currentUser?.department || "ICE"} • Session {currentUser?.session || "2020-2021"} • Verified Engineering Graduate
                            </p>
                        </div>

                        {/* Top Right Profile Badge */}
                        <div className="lg:col-span-4 bg-white border border-amber-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
                                {(currentUser?.fullName || currentUser?.name || "AL").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser?.fullName || currentUser?.name}</h4>
                                <p className="text-[11px] text-amber-700 font-semibold truncate">{currentUser?.designation || "Senior Engineer"}</p>
                                <span className="inline-block mt-0.5 text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                                    Verified Alumni Member
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ================= TAB 1: MAIN DASHBOARD ================= */}
                    {activeTab === "dashboard" && (
                        <>
                            {/* 3 HERO KPI CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <button
                                    onClick={() => setActiveTab("jobs")}
                                    className="bg-gradient-to-br from-[#B45309] to-[#78350F] rounded-3xl p-6 text-white shadow-xl shadow-amber-900/20 relative overflow-hidden flex flex-col justify-between text-left hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">Active Job Referrals</span>
                                        <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
                                            <Briefcase className="w-5 h-5 text-white" />
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-3xl font-black">{jobs.length}</h3>
                                        <p className="text-xs text-amber-100/90 mt-1">Post openings & refer juniors ➔</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab("mentorship")}
                                    className="bg-gradient-to-br from-[#047857] to-[#065F46] rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden flex flex-col justify-between text-left hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Mentorship Inquiries</span>
                                        <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
                                            <HeartHandshake className="w-5 h-5 text-white" />
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-3xl font-black">{myMentorshipRequests.length}</h3>
                                        <p className="text-xs text-emerald-100/90 mt-1">Guide students with career advice ➔</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab("directory")}
                                    className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden flex flex-col justify-between text-left hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Alumni Directory</span>
                                        <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
                                            <Users className="w-5 h-5 text-white" />
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-3xl font-black">{alumniDirectory.length}</h3>
                                        <p className="text-xs text-slate-300 mt-1">Network with fellow batchmates ➔</p>
                                    </div>
                                </button>
                            </div>

                            {/* JOB BOARD & REUNIONS PREVIEW */}
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                {/* Left: Recent Job Referrals */}
                                <div className="xl:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                        <div>
                                            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-amber-600" />
                                                <span>Campus & Alumni Job Board</span>
                                            </h3>
                                            <p className="text-xs text-slate-400">Exclusive openings referred by ICE graduates</p>
                                        </div>
                                        <button
                                            onClick={() => setShowPostJobModal(true)}
                                            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/25 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Post a Job Opening</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3 pt-1">
                                        {jobs.slice(0, 3).map((job) => (
                                            <div
                                                key={job.id}
                                                className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-amber-200 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                            >
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
                                                            {job.type}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {job.postedBy} • {job.date}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                                                        {job.title}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                            {job.company}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                            {job.location}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="font-bold text-emerald-600">
                                                            {job.salary}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={job.link || "#"}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1 shrink-0"
                                                    >
                                                        <span>Apply Now</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </a>
                                                    {job.postedByEmail === currentUser?.email && (
                                                        <button
                                                            onClick={() => handleDeleteJob(job.id)}
                                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                                            title="Delete Job"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Mentorship & Campus Reunion */}
                                <div className="xl:col-span-4 space-y-5">
                                    {/* Mentorship Requests Card */}
                                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                                                <HeartHandshake className="w-4 h-4 text-amber-600" />
                                                <span>Mentorship Hub</span>
                                            </h3>
                                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                                                {myMentorshipRequests.length} Requests
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Current ICE undergraduates seeking career advice, resume reviews, and internship guidance.
                                        </p>

                                        {myMentorshipRequests.length === 0 ? (
                                            <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                                                No pending student mentorship inquiries at this time.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {myMentorshipRequests.slice(0, 2).map((req) => (
                                                    <div key={req.id} className="p-3 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-1 text-xs">
                                                        <div className="font-bold text-slate-900">{req.studentName} ({req.studentDept})</div>
                                                        <div className="text-slate-600 text-[11px] truncate">&quot;{req.message}&quot;</div>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(req);
                                                                setActiveTab("mentorship");
                                                            }}
                                                            className="text-amber-700 font-bold hover:underline text-[11px] block mt-1"
                                                        >
                                                            Reply to Student ➔
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setActiveTab("mentorship")}
                                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer text-center"
                                        >
                                            Open Mentorship Center
                                        </button>
                                    </div>

                                    {/* Upcoming Reunion Box */}
                                    <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-3xl p-6 shadow-xl shadow-amber-700/20 relative overflow-hidden space-y-3">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-md">
                                            Campus Reunion
                                        </span>
                                        <h4 className="text-lg font-black tracking-tight">ICE Alumni Reunion Gala 2026</h4>
                                        <p className="text-xs text-amber-100 leading-relaxed">
                                            Dec 20, 2026 • ICE Central Campus Auditorium • Keynote talks, dinner & awards.
                                        </p>
                                        <button
                                            onClick={handleToggleRsvp}
                                            className={`mt-2 px-4 py-2 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer inline-flex items-center gap-1.5 ${
                                                isRsvpConfirmed
                                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                    : "bg-white text-slate-900 hover:bg-amber-50"
                                            }`}
                                        >
                                            {isRsvpConfirmed ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>RSVP Confirmed ✓</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Register for Pass</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ================= TAB 2: JOB & REFERRAL BOARD ================= */}
                    {activeTab === "jobs" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Alumni Job & Career Referrals
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Post vacancies from your current organization to refer qualified juniors and fellow ICE graduates
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPostJobModal(true)}
                                    className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/25 transition cursor-pointer flex items-center gap-1.5 w-fit"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Post New Opening</span>
                                </button>
                            </div>

                            {/* Job Search & Filter */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by job title, company, or location..."
                                    value={jobSearch}
                                    onChange={(e) => setJobSearch(e.target.value)}
                                    className="w-full text-xs text-slate-800 outline-none"
                                />
                                <span className="text-xs font-bold text-slate-400 shrink-0">
                                    {filteredJobs.length} Results
                                </span>
                            </div>

                            {/* Job Listings Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {filteredJobs.length === 0 ? (
                                    <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-3xl border border-slate-200">
                                        <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-600" />
                                        <p className="font-bold text-sm text-slate-700">No jobs found matching your criteria</p>
                                        <p className="text-xs text-slate-400 mt-1">Click &quot;Post New Opening&quot; to publish a job opportunity.</p>
                                    </div>
                                ) : (
                                    filteredJobs.map((job) => (
                                        <div
                                            key={job.id}
                                            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md uppercase">
                                                        {job.type}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{job.date}</span>
                                                </div>

                                                <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                                                    {job.title}
                                                </h3>

                                                <div className="text-xs text-slate-500 space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                        <strong>{job.company}</strong>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{job.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                                        <DollarSign className="w-3.5 h-3.5" />
                                                        <span>{job.salary || "Competitive"}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-2 text-[11px] text-slate-400">
                                                    Referred by: <strong>{job.postedBy}</strong>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                <a
                                                    href={job.link || "#"}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                                                >
                                                    <span>View Application</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>

                                                {job.postedByEmail === currentUser?.email && (
                                                    <button
                                                        onClick={() => handleDeleteJob(job.id)}
                                                        className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 3: MENTORSHIP HUB ================= */}
                    {activeTab === "mentorship" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Undergraduate Mentorship Hub
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Review questions sent by current engineering students and share your professional guidance
                                    </p>
                                </div>
                                <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 text-xs w-fit">
                                    {myMentorshipRequests.length} Student Requests
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {myMentorshipRequests.length === 0 ? (
                                    <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-3xl border border-slate-200">
                                        <HeartHandshake className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600" />
                                        <p className="font-bold text-sm text-slate-700">No mentorship inquiries found</p>
                                        <p className="text-xs text-slate-400 mt-1">When students click &quot;Request Mentorship&quot; from their portal, queries will appear here.</p>
                                    </div>
                                ) : (
                                    myMentorshipRequests.map((req) => (
                                        <div
                                            key={req.id}
                                            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                                        {(req.studentName || "ST").slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-slate-900">{req.studentName}</h4>
                                                        <p className="text-[11px] text-slate-400">Dept of {req.studentDept || "Engineering"} • Roll: {req.studentId}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    req.status === "answered"
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-amber-100 text-amber-800"
                                                }`}>
                                                    {req.status === "answered" ? "Replied ✓" : "Pending Reply"}
                                                </span>
                                            </div>

                                            <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-700">
                                                <div className="font-bold text-slate-900">Student Query:</div>
                                                <p className="italic text-slate-600">&quot;{req.message}&quot;</p>
                                                <div className="text-[10px] text-slate-400 pt-1">Received: {req.date}</div>
                                            </div>

                                            {req.reply && (
                                                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1 text-emerald-900">
                                                    <div className="font-bold text-emerald-800">Your Guidance / Reply:</div>
                                                    <p>{req.reply}</p>
                                                    <div className="text-[10px] text-emerald-600 pt-1">Sent: {req.replyDate}</div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setSelectedRequest(req)}
                                                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>{req.reply ? "Update Guidance Reply" : "Send Guidance to Student"}</span>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 4: ALUMNI DIRECTORY ================= */}
                    {activeTab === "directory" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Imperial Alumni Directory & Network
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Browse graduated engineers, connect across corporate industries, and collaborate on projects
                                    </p>
                                </div>
                                <span className="bg-amber-50 text-amber-800 font-bold px-3 py-1.5 rounded-xl border border-amber-200 text-xs w-fit">
                                    {filteredDirectory.length} Alumni Members
                                </span>
                            </div>

                            {/* Search & Department Filters */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="relative w-full sm:w-80">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, department, session..."
                                        value={directorySearch}
                                        onChange={(e) => setDirectorySearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500">Department:</span>
                                    {["All", "CSE", "ICE", "EEE"].map((dept) => (
                                        <button
                                            key={dept}
                                            onClick={() => setDirectoryDept(dept)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                directoryDept === dept
                                                    ? "bg-amber-600 text-white"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {dept}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Directory Table */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4">NAME & TITLE</th>
                                            <th className="py-3 px-4">DEPARTMENT</th>
                                            <th className="py-3 px-4">PASSING SESSION</th>
                                            <th className="py-3 px-4">CONTACT EMAIL</th>
                                            <th className="py-3 px-4 text-right">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredDirectory.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-400">
                                                    No alumni found in directory matching your search.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDirectory.map((al) => (
                                                <tr key={al.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-slate-900">{al.fullName || al.name}</div>
                                                        <div className="text-[11px] text-amber-700">{al.designation || "Engineering Graduate"}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-semibold text-slate-700">{al.department || "ICE"}</td>
                                                    <td className="py-3.5 px-4 text-slate-500">{al.session || "2019-2020"}</td>
                                                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{al.email}</td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                                                            Verified Graduate
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 5: CAMPUS REUNIONS ================= */}
                    {activeTab === "events" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Campus Reunions & Alumni Events
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Attend annual university summits, campus gala dinners, and networking conventions
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                                    <div className="space-y-2">
                                        <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Signature Event 2026
                                        </span>
                                        <h3 className="text-2xl font-black text-slate-900">ICE Annual Alumni Grand Reunion & Gala Night</h3>
                                        <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                                            Revisit memories at our central auditorium! Enjoy keynote addresses from distinguished graduates, industry roundtables, alumni excellence awards, cultural performances, and a grand networking dinner.
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                                <Calendar className="w-4 h-4 text-amber-600" />
                                                <span>Saturday, Dec 20, 2026 (04:00 PM - 10:00 PM)</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-amber-600" />
                                                <span>Central Auditorium, Main Campus, Dhaka</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 p-5 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-3 min-w-[200px]">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registration Status</div>
                                        <div className="text-lg font-black text-slate-900">
                                            {isRsvpConfirmed ? "Pass Reserved ✓" : "Open for Alumni"}
                                        </div>
                                        <button
                                            onClick={handleToggleRsvp}
                                            className={`w-full py-2.5 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                                isRsvpConfirmed
                                                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                                                    : "bg-amber-600 hover:bg-amber-700 text-white"
                                            }`}
                                        >
                                            {isRsvpConfirmed ? "Cancel My Pass" : "Confirm RSVP / Pass"}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm text-slate-800 mb-3">Confirmed Attendees ({eventRsvps.length}):</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {eventRsvps.length === 0 ? (
                                            <p className="text-xs text-slate-400">Be the first to RSVP for this grand event!</p>
                                        ) : (
                                            eventRsvps.map((rsvp, idx) => (
                                                <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200">
                                                    🎓 {rsvp.name} ({rsvp.department})
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Institutional Alumni Dashboard Footer */}
                    <footer className="mt-8 pt-6 pb-2 border-t border-slate-200/80 text-center text-xs text-slate-400 space-y-1">
                        <p className="font-semibold text-slate-600">
                            Imperial College of Engineering (ICE) • Global Alumni & Career Network
                        </p>
                        <p className="text-[11px] text-slate-400">
                            Campus: Upper Jessore Road, Khulna - 9000, Bangladesh • Alumni Affairs: alumni@ice.edu.bd • System Status: Operational
                        </p>
                    </footer>
                </main>
            </div>

            {/* ================= MODAL: POST A JOB OPENING ================= */}
            {showPostJobModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-extrabold text-base text-slate-900">Post Alumni Career Referral</h3>
                                <p className="text-xs text-slate-400">Share an opening from your company with juniors</p>
                            </div>
                            <button onClick={() => setShowPostJobModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Junior Frontend Developer"
                                    value={jobForm.title}
                                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Organization</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Brain Station 23"
                                        value={jobForm.company}
                                        onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Employment Type</label>
                                    <select
                                        value={jobForm.type}
                                        onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white font-medium"
                                    >
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Part-Time">Part-Time</option>
                                        <option value="Contract">Contract / Remote</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location / Mode</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dhaka (Hybrid) or Remote"
                                        value={jobForm.location}
                                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Salary / Stipend</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ৳50,000 / mo"
                                        value={jobForm.salary}
                                        onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Application URL or Email</label>
                                <input
                                    type="text"
                                    placeholder="https://company.com/apply or hr@company.com"
                                    value={jobForm.link}
                                    onChange={(e) => setJobForm({ ...jobForm, link: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPostJobModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                                >
                                    Publish Job Referral
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL: REPLY TO MENTORSHIP REQUEST ================= */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-extrabold text-sm text-slate-900">Reply to Mentorship Request</h3>
                                <p className="text-[10px] text-slate-400">Guiding {selectedRequest.studentName} ({selectedRequest.studentDept})</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Student Question:</span>
                            <p className="text-slate-700 font-medium italic">&quot;{selectedRequest.message}&quot;</p>
                        </div>

                        <form onSubmit={handleSendMentorshipReply} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Guidance Advice / Next Steps</label>
                                <textarea
                                    rows={4}
                                    placeholder="Provide advice, recommended learning roadmaps, or propose a time for Google Meet..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRequest(null)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                                >
                                    Send Reply to Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL: PRINTABLE DIGITAL ALUMNI CARD ================= */}
            {showAlumniCardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-5">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="font-extrabold text-sm text-slate-900">Alumni Membership Card</h3>
                            <button onClick={() => setShowAlumniCardModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Printable Card Area */}
                        <div id="printable-alumni-card" className="bg-gradient-to-br from-[#92400E] via-[#B45309] to-[#451A03] text-white rounded-2xl p-5 shadow-xl space-y-4 border border-amber-400/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-black text-xs uppercase tracking-widest text-amber-200">Imperial College of Engineering</h4>
                                    <p className="text-[9px] text-amber-300/80">Official Alumni Association</p>
                                </div>
                                <Award className="w-5 h-5 text-amber-300" />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 text-white font-bold flex items-center justify-center text-base shadow-inner">
                                    {(currentUser?.fullName || currentUser?.name || "AL").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-white">{currentUser?.fullName || currentUser?.name}</h3>
                                    <p className="text-[11px] text-amber-200 font-semibold">{currentUser?.department || "ICE"} Department</p>
                                    <p className="text-[10px] text-amber-300/90 font-mono">Alumni ID: {currentUser?.alumniId || "ALM-2020-042"}</p>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px]">
                                <div>
                                    <span className="text-amber-300/70 block">Passing Session</span>
                                    <span className="font-bold">{currentUser?.session || "2019-2020"}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-amber-300/70 block">Membership Status</span>
                                    <span className="font-bold text-emerald-300">Lifetime Member ✓</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={handlePrintAlumniCard}
                                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Print Alumni Card</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default AlumniDashboard;
