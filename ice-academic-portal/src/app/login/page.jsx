"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft, FaApple } from "react-icons/fa";
import Input from "@/components/ui/Input";
import { Eye, EyeOff } from "lucide-react";
import {
    GraduationCap,
    Shield,
    UserCheck,
    Briefcase,
    Mail,
    Lock,
    BookOpen,
    CreditCard,
    Bot,
    Bell,
    ArrowRight,
    Globe,
    ChevronDown,
    ShieldCheck,
    CheckCircle2,
    Clock,
} from "lucide-react";

// ============================================================
// CONFIGURATION DATA (Reusable & Dynamic)
// ============================================================

// 4 Feature Items on the Left
const LOGIN_FEATURES = [
    { title: "Smart Academic Management", icon: BookOpen, gradient: "from-[#9333EA] to-[#7928CA]", shadow: "shadow-purple-600/40" },
    { title: "Secure Online Payments", icon: CreditCard, gradient: "from-[#10B981] to-[#059669]", shadow: "shadow-emerald-600/40" },
    { title: "AI Academic Assistant", icon: Bot, gradient: "from-[#0EA5E9] to-[#0284C7]", shadow: "shadow-sky-600/40" },
    { title: "Real-time Notifications", icon: Bell, gradient: "from-[#F59E0B] to-[#D97706]", shadow: "shadow-amber-600/40" },
];

// 4 User Roles
const ROLES = [
    {
        id: "admin",
        label: "Admin",
        icon: Shield,
        iconColor: "text-[#8B5CF6]",
        activeStyle: "bg-[#ECEBFE] border-[#C8C2FC] text-[#5243E8] font-bold shadow-sm",
    },
    {
        id: "teacher",
        label: "Teacher",
        icon: UserCheck,
        iconColor: "text-[#059669]",
        activeStyle: "bg-[#E6F8F0] border-[#A7E8CB] text-[#10B981] font-bold shadow-sm",
    },
    {
        id: "student",
        label: "Student",
        icon: GraduationCap,
        iconColor: "text-[#8B5CF6]",
        activeStyle: "bg-[#ECEBFE] border-[#C8C2FC] text-[#5243E8] font-bold shadow-sm",
    },
    {
        id: "alumni",
        label: "Alumni",
        icon: Briefcase,
        iconColor: "text-[#F59E0B]",
        activeStyle: "bg-[#FEF5E7] border-[#FBDCA3] text-[#F59E0B] font-bold shadow-sm",
    },
];

// Social Login Options
const SOCIAL_LOGINS = [
    { name: "Google", icon: FcGoogle, iconClass: "h-4 w-4" },
    { name: "Microsoft", icon: FaMicrosoft, iconClass: "h-4 w-4 text-[#00A4EF]" },
    { name: "Apple", icon: FaApple, iconClass: "h-4 w-4 text-black" },
];

// ============================================================
// LOGIN PAGE COMPONENT
// ============================================================

const LoginPage = () => {
    const router = useRouter();

    const [selectedRole, setSelectedRole] = useState("student");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);

    // Google / Social Auth via Firebase
    const handleSocialLogin = async (providerName) => {
        if (providerName !== "Google") {
            alert(`${providerName} login will be available soon. Please use Google or your ICE Email.`);
            return;
        }

        try {
            setSocialLoading(true);
            const { signInWithGoogle } = await import("@/lib/firebase");
            const res = await signInWithGoogle();
            if (!res.success) {
                alert(res.message || "Google sign-in was cancelled or failed.");
                setSocialLoading(false);
                return;
            }

            // Sync verified Google user with MongoDB Atlas backend
            const apiRes = await apiRequest("/auth/firebase-login", "POST", {
                email: res.user.email,
                fullName: res.user.displayName,
                photoUrl: res.user.photoURL,
                role: selectedRole,
                uid: res.user.uid,
                idToken: res.idToken,
            });

            if (apiRes && apiRes.success) {
                localStorage.setItem("portal_current_user", JSON.stringify(apiRes.user));
                if (apiRes.token) {
                    localStorage.setItem("portal_auth_token", apiRes.token);
                }

                const role = apiRes.user.role || selectedRole;
                if (role === "admin") router.push("/dashboard/admin");
                else if (role === "teacher") router.push("/dashboard/teacher");
                else if (role === "alumni") router.push("/dashboard/alumni");
                else router.push("/dashboard/student");
            } else {
                alert(apiRes?.message || "Failed to link Google account with academic portal.");
            }
        } catch (err) {
            console.error("Firebase Login Error:", err);
            alert("Google Sign-In Error: " + err.message);
        } finally {
            setSocialLoading(false);
        }
    };
    const handleLogin = async (e) => {
        e.preventDefault();

        // 1. Try Backend API first (MongoDB Atlas)
        const apiRes = await apiRequest("/auth/login", "POST", {
            email: identifier,
            password,
            role: selectedRole,
        });

        if (apiRes && !apiRes.isOffline) {
            if (!apiRes.success) {
                if (apiRes.message && apiRes.message.toLowerCase().includes("pending")) {
                    setShowSuccessModal(true);
                    return;
                }
                alert(apiRes.message || "Invalid credentials!");
                return;
            }

            // Save user session & token
            localStorage.setItem("portal_current_user", JSON.stringify(apiRes.user));
            if (apiRes.token) {
                localStorage.setItem("portal_auth_token", apiRes.token);
            }

            // Redirect based on role
            const role = apiRes.user.role || selectedRole;
            if (role === "admin") router.push("/dashboard/admin");
            else if (role === "teacher") router.push("/dashboard/teacher");
            else if (role === "alumni") router.push("/dashboard/alumni");
            else router.push("/dashboard/student");
            return;
        }

        // 2. Fallback to localStorage if server is offline
        const users = JSON.parse(localStorage.getItem("portal_users") || "[]");
        const user = users.find(u => (u.email === identifier || u.studentId === identifier) && u.password === password);
        if (!user) {
            alert("Invalid email or password!");
            return;
        }
        localStorage.setItem("portal_current_user", JSON.stringify(user));
        if (user.role === "admin") {
            router.push("/dashboard/admin");
            return;
        }
        if (user.status === "pending") {
            setShowSuccessModal(true);
            return;
        }
        if (user.status === "rejected") {
            alert("❌ Your registration was REJECTED by college administration. Please contact the campus office.");
            return;
        }
        if (user.status === "approved") {
            if (user.role === "teacher") router.push("/dashboard/teacher");
            else if (user.role === "alumni") router.push("/dashboard/alumni");
            else router.push("/dashboard/student");
        }
    };

    return (
        <main
            style={{
                backgroundImage: "url('/login-bg.jpg')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
            /* Fully responsive: scrollable on mobile, single-screen on desktop */
            className="min-h-screen lg:h-screen w-full overflow-y-auto lg:overflow-hidden flex items-center justify-center px-4 sm:px-8 lg:px-12 xl:px-16 py-6 lg:py-0 relative font-sans"
        >
            {/* Grid Container */}
            <div className="w-full min-h-full lg:h-full max-w-[1440px] 2xl:max-w-[1560px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 py-4 lg:py-0">

                {/* ================= LEFT SECTION: Text & Dynamic Features ================= */}
                <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-start self-start pt-2 lg:pt-8 text-white">
                    <div>
                        {/* Top Logo */}
                        <div className="flex items-center gap-3.5 mb-5 lg:mb-8">
                            <div className="h-11 w-11 lg:h-12 lg:w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner shrink-0">
                                <GraduationCap className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg lg:text-xl font-bold tracking-wider leading-tight text-white">ICE PORTAL</h2>
                                <p className="text-[10px] lg:text-[11px] text-blue-200 uppercase tracking-wider font-semibold">Imperial College of Engineering</p>
                            </div>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.12] tracking-tight text-white drop-shadow-md mb-2.5">
                            One Platform, <br />
                            Infinite <br />
                            Possibilities
                        </h1>

                        <p className="text-xs sm:text-sm lg:text-base text-blue-100/90 leading-relaxed mb-6 lg:mb-8 max-w-lg drop-shadow">
                            Manage academics, payments, resources and more — all in one intelligent platform.
                        </p>

                        {/* 4 Feature Items: Rendered dynamically via .map() */}
                        <div className="space-y-3 lg:space-y-3.5 max-w-md">
                            {LOGIN_FEATURES.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3.5 bg-slate-700/35 hover:bg-[linear-gradient(90deg,#604AEB_0%,#4667EA_100%)] backdrop-blur-md border border-slate-400/20 hover:border-transparent rounded-2xl px-3.5 py-2.5 w-fit transition-all duration-300 cursor-pointer"
                                    >
                                        <div className={`h-9 w-9 lg:h-10 lg:w-10 rounded-xl lg:rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg ${item.shadow} shrink-0`}>
                                            <Icon className="h-4.5 w-4.5 text-white" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold text-white tracking-wide drop-shadow-sm">
                                            {item.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ================= RIGHT SECTION: WHITE FORM CARD ================= */}
                <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-center pb-8 lg:pb-0">
                    <div className="w-full max-w-[480px] bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-7 shadow-2xl border border-white/80 lg:scale-[0.88] xl:scale-[0.92] origin-center">

                        {/* Top Language Dropdown */}
                        <div className="flex justify-end mb-3 sm:mb-4">
                            <button type="button" className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition">
                                <Globe className="h-3.5 w-3.5 text-slate-500" />
                                <span>English</span>
                                <ChevronDown className="h-3 w-3 text-slate-400" />
                            </button>
                        </div>

                        {/* Header Titles */}
                        <div className="mb-4 sm:mb-6">
                            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Welcome Back!
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                                Login to your account
                            </p>
                        </div>

                        {/* 4 Roles Switcher Pills */}
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-5 sm:mb-6">
                            {ROLES.map((r) => {
                                const Icon = r.icon;
                                const isSelected = selectedRole === r.id;
                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setSelectedRole(r.id)}
                                        className={`flex items-center justify-center gap-1 py-2 sm:py-2.5 px-1 rounded-xl text-[10.5px] sm:text-xs xl:text-sm transition-all cursor-pointer border ${
                                            isSelected
                                                ? r.activeStyle
                                                : "bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 font-medium"
                                        }`}
                                    >
                                        <Icon className={`h-3.5 w-3.5 ${r.iconColor} fill-current shrink-0`} />
                                        <span className="truncate">{r.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} autoComplete="off" className="space-y-3.5 sm:space-y-4">

                            {/* Email / ID Input */}
                            <Input
                                placeholder="Email address or ID"
                                icon={Mail}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />

                            {/* Password Input with Eye Toggle */}
                            <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/60 focus-within:border-[#5243E8] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100/60 transition duration-150">
                                <Lock className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4.5 w-4.5" />
                                    ) : (
                                        <Eye className="h-4.5 w-4.5" />
                                    )}
                                </button>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="font-semibold text-[#5243E8] hover:underline">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-white flex items-center justify-between px-6 transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-[0_10px_25px_-4px_rgba(82,67,232,0.45)] mt-1"
                                style={{
                                    background: "linear-gradient(90deg, #604AEB 0%, #4667EA 100%)",
                                }}
                            >
                                <div className="flex items-center gap-2 mx-auto pl-4">
                                    <Lock className="h-4 w-4 stroke-[2.2]" />
                                    <span className="font-semibold tracking-wide">Login</span>
                                </div>
                                <ArrowRight className="h-4 w-4 stroke-[2.2] opacity-90" />
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-3">
                            <div className="flex-1 border-t border-slate-200" />
                            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">or continue with</span>
                            <div className="flex-1 border-t border-slate-200" />
                        </div>

                        {/* Social Logins */}
                        <div className="grid grid-cols-3 gap-2.5">
                            {SOCIAL_LOGINS.map((social) => {
                                const Icon = social.icon;
                                const isGoogle = social.name === "Google";
                                return (
                                    <button
                                        key={social.name}
                                        type="button"
                                        onClick={() => handleSocialLogin(social.name)}
                                        disabled={socialLoading}
                                        className="py-2.5 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                                    >
                                        <Icon className={social.iconClass} />
                                        {isGoogle && socialLoading ? "Wait..." : social.name}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Register Link */}
                        <p className="text-center text-xs sm:text-sm text-slate-500 mt-4 sm:mt-5 font-medium">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="font-bold text-[#5243E8] hover:underline">
                                Register now
                            </Link>
                        </p>

                    </div>
                </div>

            </div>

            {/* Emerald Green Verification Modal on Login Page */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm sm:max-w-md bg-white rounded-[28px] p-6 sm:p-7 shadow-2xl border border-emerald-100 text-center relative animate-in zoom-in-95 duration-200">
                        
                        {/* Shield Icon with glowing ring */}
                        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-3 ring-8 ring-emerald-50 mx-auto">
                            <ShieldCheck className="w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Application Received!</h3>
                        <p className="text-xs text-slate-500 mt-1">Academic credentials under verification</p>

                        {/* Step-by-Step Checklist */}
                        <div className="w-full bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 my-4 text-left space-y-2.5 text-xs sm:text-sm">
                            <div className="flex items-center gap-2.5 text-emerald-900 font-semibold">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>Registration Profile Created</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-emerald-900 font-semibold">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>Institutional ID Submitted</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-amber-800 font-bold bg-amber-100/70 p-2 rounded-xl">
                                <Clock className="h-4 w-4 text-amber-500 shrink-0 animate-spin" />
                                <span>Waiting for Admin Approval</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            type="button"
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition transform active:scale-95 cursor-pointer"
                        >
                            Understood, Close
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default LoginPage;