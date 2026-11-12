"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft, FaApple } from "react-icons/fa";
import {
    GraduationCap,
    Shield,
    UserCheck,
    Briefcase,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Building2,
    CreditCard,
    Users,
    ShieldCheck,
    BarChart3,
    Headphones,
    UserPlus,
    ArrowRight,
    Globe,
    ChevronDown,
} from "lucide-react";

// ============================================================
// CONFIGURATION DATA (Reusable & Dynamic)
// ============================================================

// 4 Feature Highlights
const FEATURES = [
    { title: "Data Security", desc: "Your data is safe with enterprise-grade security", icon: ShieldCheck, bg: "bg-[#D1FAE5]", color: "text-[#059669]" },
    { title: "All-in-One Platform", desc: "Everything you need in one integrated system", icon: BarChart3, bg: "bg-[#E0F2FE]", color: "text-[#0284C7]" },
    { title: "24/7 Support", desc: "We're here to help you anytime", icon: Headphones, bg: "bg-[#FEF3C7]", color: "text-[#D97706]" },
    { title: "Role-based Access", desc: "Secure dashboards for every user", icon: Users, bg: "bg-[#EDE9FE]", color: "text-[#7C3AED]" },
];

// 4 User Roles
const ROLES = [
    { id: "admin", label: "Admin", icon: Shield, iconColor: "text-[#4338CA]", activeStyle: "bg-[#E0E7FF] border-[#6366F1] text-[#3730A3]" },
    { id: "teacher", label: "Teacher", icon: UserCheck, iconColor: "text-[#059669]", activeStyle: "bg-[#D1FAE5] border-[#10B981] text-[#065F46]" },
    { id: "student", label: "Student", icon: GraduationCap, iconColor: "text-[#7C3AED]", activeStyle: "bg-[#EDE9FE] border-[#8B5CF6] text-[#5B21B6]" },
    { id: "alumni", label: "Alumni", icon: Briefcase, iconColor: "text-[#D97706]", activeStyle: "bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]" },
];

// Social Logins
const SOCIAL_LOGINS = [
    { name: "Google", icon: FcGoogle, iconClass: "h-4 w-4" },
    { name: "Microsoft", icon: FaMicrosoft, iconClass: "h-4 w-4 text-[#00A4EF]" },
    { name: "Apple", icon: FaApple, iconClass: "h-4 w-4 text-black" },
];

// ============================================================
// REGISTER PAGE COMPONENT
// ============================================================

const RegisterPage = () => {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState("student");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);

    // Google / Social Auth via Firebase
    const handleSocialRegister = async (providerName) => {
        if (providerName !== "Google") {
            alert(`${providerName} registration will be available soon. Please use Google or complete the form.`);
            return;
        }

        try {
            setSocialLoading(true);
            const { signInWithGoogle } = await import("@/lib/firebase");
            const res = await signInWithGoogle();
            if (!res.success) {
                alert(res.message || "Google registration was cancelled or failed.");
                setSocialLoading(false);
                return;
            }

            // Provision user via backend API in MongoDB Atlas
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

                // Redirect based on role
                const role = apiRes.user.role || selectedRole;
                if (role === "admin") router.push("/dashboard/admin");
                else if (role === "teacher") router.push("/dashboard/teacher");
                else if (role === "alumni") router.push("/dashboard/alumni");
                else router.push("/dashboard/student");
            } else {
                alert(apiRes?.message || "Failed to register via Google.");
            }
        } catch (err) {
            console.error("Firebase Register Error:", err);
            alert("Google Sign-In Error: " + err.message);
        } finally {
            setSocialLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        studentId: "",
        department: "",
        session: "2024-2025",
        semester: "1/1",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Handle form submit
    const handleRegister = async (e) => {
        e.preventDefault();

        // 1. Password Match Validation
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // 2. ID Validation for non-admin
        if (selectedRole !== "admin" && (!formData.studentId || !formData.studentId.trim())) {
            alert("Please enter your Student / Faculty / Alumni ID!");
            return;
        }

        // 3. Department Validation for non-admin
        if (selectedRole !== "admin" && !formData.department) {
            alert("Please select your Department!");
            return;
        }

        // 4. Send to MongoDB Backend API
        const apiRes = await apiRequest("/auth/register", "POST", {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: selectedRole,
            studentId: formData.studentId,
            facultyId: formData.studentId,
            alumniId: formData.studentId,
            department: formData.department,
            session: (selectedRole === "student" || selectedRole === "alumni") ? (formData.session || "2024-2025") : "N/A",
            semester: selectedRole === "student" ? (formData.semester || "1/1") : "N/A",
            phone: formData.phone || "",
        });

        if (apiRes && !apiRes.isOffline && !apiRes.success) {
            alert(apiRes.message || "An account already exists with this email address!");
            return;
        }

        // 5. Save to registered users list in localStorage (sync / fallback)
        const existingUsers = JSON.parse(localStorage.getItem("portal_users") || "[]");
        
        if (existingUsers.some((u) => u.email === formData.email)) {
            alert("This email is already registered! Please login.");
            return;
        }

        const newUser = {
            id: apiRes?.user?.id || apiRes?.user?._id || Date.now().toString(),
            _id: apiRes?.user?._id || apiRes?.user?.id || Date.now().toString(),
            fullName: formData.fullName,
            email: formData.email,
            role: selectedRole,
            studentId: formData.studentId,
            department: formData.department,
            session: (selectedRole === "student" || selectedRole === "alumni") ? (formData.session || "2024-2025") : "N/A",
            semester: selectedRole === "student" ? (formData.semester || "1/1") : "N/A",
            password: formData.password,
            status: selectedRole === "admin" ? "approved" : "pending",
            createdAt: new Date().toLocaleDateString(),
        };

        existingUsers.push(newUser);
        localStorage.setItem("portal_users", JSON.stringify(existingUsers));

        // Show the beautiful Registration Success Celebration Modal
        setShowSuccessModal(true);
    };

    return (
        <main
            style={{
                backgroundImage: "url('/regi-sky.jpg')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
            className="min-h-screen lg:h-screen w-full overflow-y-auto lg:overflow-hidden flex items-center justify-center px-4 sm:px-8 lg:px-12 xl:px-16 py-6 lg:py-0 relative font-sans"
        >
            {/* Grid Container */}
            <div className="w-full min-h-full lg:h-full max-w-[1440px] 2xl:max-w-[1560px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 py-4 lg:py-0">

                {/* Left Section */}
                <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-start self-start pt-6 sm:pt-8 lg:pt-6 xl:pt-8 text-slate-800">
                    
                    {/* University Logo */}
                    <div className="flex items-center gap-3.5 mb-5 lg:mb-6">
                        <div className="h-11 w-11 lg:h-12 lg:w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                            <GraduationCap className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg lg:text-xl font-bold tracking-wider leading-tight text-slate-900">ICE PORTAL</h2>
                            <p className="text-[10px] lg:text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Imperial College of Engineering</p>
                        </div>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.12] tracking-tight text-slate-900 mb-3 sm:mb-4">
                        Create Your <br /> Account
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-base lg:text-lg text-slate-600/90 mb-7 lg:mb-9 max-w-xl leading-relaxed">
                        Join thousands of students, teachers --<br />and alumni on ICE PORTAL.
                    </p>

                    {/* Features List */}
                    <div className="space-y-3.5 sm:space-y-4 max-w-lg">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 bg-white/95 border border-slate-200 rounded-2xl px-5 py-3.5 w-fit shadow-md hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer"
                                >
                                    <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center shadow-sm shrink-0`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                                            {f.title}
                                        </h4>
                                        <p className="text-xs sm:text-[13px] text-slate-600 leading-tight mt-0.5">
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Section: Form Card */}
                <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-center pb-8 lg:pb-0">
                    <div className="w-full max-w-[480px] bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-7 shadow-2xl border border-white/80 lg:scale-[0.88] xl:scale-[0.92] origin-center">

                        {/* Card Header */}
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Fill in the details to get started</p>
                            </div>
                            <button type="button" className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition">
                                <Globe className="h-3.5 w-3.5 text-slate-400" />
                                <span>English</span>
                                <ChevronDown className="h-3 w-3 text-slate-400" />
                            </button>
                        </div>

                        {/* Role Selector */}
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4">
                            {ROLES.map((r) => {
                                const Icon = r.icon;
                                const isSelected = selectedRole === r.id;
                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setSelectedRole(r.id)}
                                        className={`flex items-center justify-center gap-1 py-2 sm:py-2.5 px-1 rounded-xl text-[10.5px] sm:text-xs transition-all border cursor-pointer ${
                                            isSelected ? `${r.activeStyle} font-bold shadow-sm` : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                                        }`}
                                    >
                                        <Icon className={`h-3.5 w-3.5 ${r.iconColor} fill-current shrink-0`} />
                                        <span className="truncate">{r.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleRegister} autoComplete="off" className="space-y-3">

                            {/* Full Name */}
                            <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/60 focus-within:border-[#5243E8] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100/60 transition">
                                <User className="h-4 w-4 text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                                />
                            </div>

                            {/* Email Address */}
                            <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/60 focus-within:border-[#5243E8] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100/60 transition">
                                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                                />
                            </div>

                            {/* Role-Specific Fields (Hidden for Admin) */}
                            {selectedRole !== "admin" && (
                                <>
                                    {/* Student / Faculty / Alumni ID */}
                                    <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/60 focus-within:border-[#5243E8] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100/60 transition">
                                        <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
                                        <input
                                            type="text"
                                            name="studentId"
                                            placeholder={
                                                selectedRole === "student"
                                                    ? "Student ID (required)"
                                                    : selectedRole === "teacher"
                                                        ? "Faculty / Teacher ID"
                                                        : "Alumni ID / Graduation Year"
                                            }
                                            value={formData.studentId}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                                        />
                                    </div>

                                    {/* Department Dropdown */}
                                    <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/60 focus-within:border-[#5243E8] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100/60 transition">
                                        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none cursor-pointer"
                                        >
                                            <option value="" disabled className="text-slate-400">Department</option>
                                            <option value="ICE">Information & Communication Engineering (ICE)</option>
                                            <option value="CSE">Computer Science & Engineering (CSE)</option>
                                            <option value="EEE">Electrical & Electronic Engineering (EEE)</option>
                                            <option value="ME">Mechanical Engineering (ME)</option>
                                            <option value="CE">Civil Engineering (CE)</option>
                                            <option value="OT">Others</option>
                                        </select>
                                    </div>

                                    {/* Academic Session (for Student & Alumni) */}
                                    {(selectedRole === "student" || selectedRole === "alumni") && (
                                        <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/60 focus-within:border-[#5243E8] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100/60 transition">
                                            <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                                            <select
                                                name="session"
                                                value={formData.session}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none cursor-pointer font-medium"
                                            >
                                                <option value="" disabled className="text-slate-400">Select Academic Session</option>
                                                <option value="2024-2025">Session: 2024-2025 (1st Year: 1/1 & 1/2)</option>
                                                <option value="2023-2024">Session: 2023-2024 (2nd Year: 2/1 & 2/2)</option>
                                                <option value="2022-2023">Session: 2022-2023 (3rd Year: 3/1 & 3/2)</option>
                                                <option value="2021-2022">Session: 2021-2022 (4th Year: 4/1 & 4/2 Final)</option>
                                                <option value="2020-2021">Session: 2020-2021 (Graduated / Alumni)</option>
                                                <option value="2019-2020">Session: 2019-2020 (Graduated / Alumni)</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Academic Semester Term (for Student) */}
                                    {selectedRole === "student" && (
                                        <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/60 focus-within:border-[#5243E8] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100/60 transition">
                                            <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                                            <select
                                                name="semester"
                                                value={formData.semester}
                                                onChange={handleChange}
                                                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none cursor-pointer font-medium"
                                            >
                                                <option value="1/1">Term 1/1 (1st Year 1st Sem)</option>
                                                <option value="1/2">Term 1/2 (1st Year 2nd Sem)</option>
                                                <option value="2/1">Term 2/1 (2nd Year 1st Sem)</option>
                                                <option value="2/2">Term 2/2 (2nd Year 2nd Sem)</option>
                                                <option value="3/1">Term 3/1 (3rd Year 1st Sem)</option>
                                                <option value="3/2">Term 3/2 (3rd Year 2nd Sem)</option>
                                                <option value="4/1">Term 4/1 (4th Year 1st Sem)</option>
                                                <option value="4/2">Term 4/2 (4th Year 2nd Sem - Final)</option>
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Password */}
                            <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/60 focus-within:border-[#5243E8] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100/60 transition">
                                <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Confirm Password */}
                            <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/60 focus-within:border-[#5243E8] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100/60 transition">
                                <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-600">
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    required
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span>
                                    I agree to the <a href="#" className="font-semibold text-[#5243E8] hover:underline">Terms of Service</a> and <a href="#" className="font-semibold text-[#5243E8] hover:underline">Privacy Policy</a>
                                </span>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-white flex items-center justify-between px-6 transition active:scale-[0.99] cursor-pointer shadow-[0_10px_25px_-4px_rgba(82,67,232,0.45)] mt-1"
                                style={{ background: "linear-gradient(90deg, #604AEB 0%, #4667EA 100%)" }}
                            >
                                <div className="flex items-center gap-2 mx-auto pl-3">
                                    <UserPlus className="h-4 w-4" />
                                    <span className="font-semibold tracking-wide">Create Account</span>
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
                                        onClick={() => handleSocialRegister(social.name)}
                                        disabled={socialLoading}
                                        className="py-2.5 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                                    >
                                        <Icon className={social.iconClass} />
                                        {isGoogle && socialLoading ? "Wait..." : social.name}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Link to Login */}
                        <p className="text-center text-xs text-slate-500 mt-3 font-medium">
                            Already have an account?{" "}
                            <Link href="/login" className="font-bold text-[#5243E8] hover:underline">
                                Login now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Registration Success Celebration Modal (Design 1) */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-indigo-100 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Glow accent */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="relative z-10">
                            {/* Graduation Cap Celebration Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-4 ring-4 ring-indigo-50 mx-auto">
                                <GraduationCap className="w-8 h-8" />
                            </div>

                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 border border-indigo-200/80 mb-2">
                                🎉 Welcome to ICE Portal!
                            </span>

                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Registration Successful!</h3>
                            <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                                Your account has been created successfully. You can now login using your email or student ID.
                            </p>

                            {/* Summary Card */}
                            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 my-5 text-left text-xs space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Account Status:</span>
                                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active & Ready
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                                    <span className="text-slate-400">Portal Access:</span>
                                    <span className="font-bold text-slate-800 capitalize">{selectedRole} Gate</span>
                                </div>
                            </div>

                            {/* Continue to Login Button */}
                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>Continue to Login</span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default RegisterPage;
