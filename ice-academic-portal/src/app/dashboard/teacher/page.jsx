"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
    LayoutDashboard,
    BookOpen,
    FileSpreadsheet,
    FolderKanban,
    Search,
    Bell,
    LogOut,
    CheckCircle2,
    UploadCloud,
    Award,
    Eye,
    Users,
    Calendar,
    Menu,
    X,
    Sparkles,
    Clock,
    Plus,
    Trash2,
    Save,
    FileText,
    Check,
    CheckSquare,
    XSquare,
    AlertCircle,
    ExternalLink,
} from "lucide-react";

// ============================================================
// DEFAULT FALLBACK COURSES (IF ADMIN HASN'T ADDED YET)
// ============================================================
const DEFAULT_FACULTY_COURSES = [
    { id: "c1", code: "CSE-3101", name: "Computer Architecture & Organization", credits: 3.0, department: "CSE", instructor: "Dr. Tariqul Islam", semester: "1/1", schedule: "Sun, Tue (10:00 AM - 11:30 AM)", room: "Room 402" },
    { id: "c2", code: "CSE-3103", name: "Design & Analysis of Algorithms", credits: 3.0, department: "CSE", instructor: "Prof. Farhana Haque", semester: "1/1", schedule: "Mon, Wed (11:30 AM - 01:00 PM)", room: "Lab 3" },
    { id: "c3", code: "ICE-3105", name: "Communication Systems & Telephony", credits: 3.0, department: "ICE", instructor: "Engr. Zahirul Alam", semester: "1/1", schedule: "Sun, Wed (02:00 PM - 03:30 PM)", room: "Room 501" },
    { id: "c4", code: "EEE-2201", name: "Signals and Systems", credits: 3.0, department: "EEE", instructor: "Dr. Kamal Hossain", semester: "2/1", schedule: "Tue, Thu (09:00 AM - 10:30 AM)", room: "Room 304" },
];

// ============================================================
// TEACHER DASHBOARD COMPONENT
// ============================================================
const TeacherDashboard = () => {
    const router = useRouter();

    // UI & Navigation States
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, courses, attendance, marks, materials, invigilation, notices
    const [notificationMsg, setNotificationMsg] = useState("");

    // Dynamic Data States (Loaded safely from localStorage)
    const [currentUser, setCurrentUser] = useState(null);
    const [allCourses, setAllCourses] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [allNotices, setAllNotices] = useState([]);
    const [examRoutines, setExamRoutines] = useState([]);

    // Attendance Manager States
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
    const [attendanceRecords, setAttendanceRecords] = useState({}); // { [studentId]: 'present' | 'absent' | 'late' }
    const [enrollments, setEnrollments] = useState({});
    const [studentViewMode, setStudentViewMode] = useState("auto"); // "auto" | "dept" | "all"

    // Internal Marks States (CT, Midterm, Lab/Assignment)
    const [marksCourseId, setMarksCourseId] = useState("");
    const [studentMarksData, setStudentMarksData] = useState({}); // { [studentId]: { ct1: 12, ct2: 14, midterm: 18, assignment: 9 } }

    // Course Materials States
    const [materials, setMaterials] = useState([
        { id: "m1", courseCode: "CSE-3101", title: "Unit 1: MIPS Instruction Set Architecture (Slides)", type: "Lecture Slides", date: "Nov 02, 2026", link: "https://drive.google.com/sample-slides" },
        { id: "m2", courseCode: "CSE-3101", title: "Lab Manual: Verilog HDL & ALU Simulation", type: "Lab Guide", date: "Nov 05, 2026", link: "https://drive.google.com/sample-lab" },
    ]);
    const [materialForm, setMaterialForm] = useState({
        courseCode: "",
        title: "",
        type: "Lecture Slides",
        link: "",
    });

    // Load data from localStorage on mount
    useEffect(() => {
        try {
            // 1. Load Logged in Teacher
            const storedUser = JSON.parse(localStorage.getItem("portal_current_user") || "null");
            const storedUsers = JSON.parse(localStorage.getItem("portal_users") || "[]");

            const approvedStudentsList = storedUsers.filter((u) => u.role === "student" && u.status !== "rejected");
            setAllStudents(approvedStudentsList);

            if (storedUser && storedUser.role === "teacher") {
                setCurrentUser(storedUser);
            } else {
                const firstTeacher = storedUsers.find((u) => u.role === "teacher" && u.status === "approved") || {
                    fullName: "Dr. Tariqul Islam",
                    name: "Dr. Tariqul Islam",
                    facultyId: "FAC-ICE-10",
                    department: "ICE",
                    email: "tariqul.islam@ice.edu.bd",
                    designation: "Associate Professor",
                };
                setCurrentUser(firstTeacher);
            }

            // 2. Load Courses
            const storedCourses = JSON.parse(localStorage.getItem("portal_courses") || "[]");
            if (storedCourses.length > 0) {
                setAllCourses(storedCourses);
            } else {
                setAllCourses(DEFAULT_FACULTY_COURSES);
            }

            // 3. Load Notices
            const storedNotices = JSON.parse(localStorage.getItem("portal_notices") || "[]");
            setAllNotices(storedNotices);

            // 4. Load Exam Routines
            const storedExams = JSON.parse(localStorage.getItem("portal_exam_routines") || "[]");
            setExamRoutines(storedExams);

            // 5. Load Stored Attendance
            const storedAttendance = JSON.parse(localStorage.getItem("portal_attendance") || "{}");
            setAttendanceRecords(storedAttendance);

            // 6. Load Stored Internal Marks
            const storedMarks = JSON.parse(localStorage.getItem("portal_internal_marks") || "{}");
            setStudentMarksData(storedMarks);

            // 7. Load Stored Materials
            const storedMaterials = JSON.parse(localStorage.getItem("portal_course_materials") || "null");
            if (storedMaterials) setMaterials(storedMaterials);

            // 8. Load Course Enrollments
            const storedEnrollments = JSON.parse(localStorage.getItem("portal_student_enrollments") || "{}");
            setEnrollments(storedEnrollments);
        } catch (e) {
            console.error("Error loading faculty portal data:", e);
        }

        // Live Sync with MongoDB Atlas via Express API
        const syncTeacherData = async () => {
            try {
                // 1. Courses
                const cRes = await apiRequest("/academic/courses");
                if (cRes && cRes.success && cRes.courses && cRes.courses.length > 0) {
                    setAllCourses(cRes.courses);
                    localStorage.setItem("portal_courses", JSON.stringify(cRes.courses));
                }

                // 2. Students
                const uRes = await apiRequest("/auth/users");
                if (uRes && uRes.success && uRes.users) {
                    const stList = uRes.users.filter((u) => u.role === "student" && u.status !== "rejected");
                    if (stList.length > 0) {
                        setAllStudents(stList);
                        localStorage.setItem("portal_users", JSON.stringify(uRes.users));
                    }
                }

                // 3. Notices
                const nRes = await apiRequest("/academic/notices");
                if (nRes && nRes.success && nRes.notices && nRes.notices.length > 0) {
                    setAllNotices(nRes.notices);
                    localStorage.setItem("portal_notices", JSON.stringify(nRes.notices));
                }
            } catch (err) {
                console.warn("Teacher sync fallback to local:", err.message);
            }
        };

        syncTeacherData();
    }, []);

    // Filter courses assigned to this teacher
    const teacherName = (currentUser?.fullName || currentUser?.name || "").toLowerCase();
    const myAssignedCourses = allCourses.filter((c) => {
        const inst = (c.instructor || "").toLowerCase();
        return (
            inst.includes(teacherName) ||
            teacherName.includes(inst) ||
            c.department?.toUpperCase() === currentUser?.department?.toUpperCase() ||
            c.department?.toUpperCase() === "GENERAL"
        );
    });

    // Set initial selected course for attendance if empty
    useEffect(() => {
        if (!selectedCourseId && myAssignedCourses.length > 0) {
            setSelectedCourseId(myAssignedCourses[0].code);
        }
        if (!marksCourseId && myAssignedCourses.length > 0) {
            setMarksCourseId(myAssignedCourses[0].code);
        }
        if (!materialForm.courseCode && myAssignedCourses.length > 0) {
            setMaterialForm((prev) => ({ ...prev, courseCode: myAssignedCourses[0].code }));
        }
    }, [myAssignedCourses, selectedCourseId, marksCourseId, materialForm.courseCode]);

    // Filter notices targeted for Teachers or All
    const facultyNotices = allNotices.filter(
        (n) => n.audience === "All" || n.audience === "Teachers" || !n.audience
    );

    // Filter exam duties for this teacher
    const myExamDuties = examRoutines.filter((ex) => {
        const inv = (ex.invigilator || "").toLowerCase();
        return (
            inv.includes(teacherName) ||
            teacherName.includes(inv) ||
            ex.code?.startsWith(currentUser?.department || "CSE")
        );
    });

    // Active course students
    const activeSelectedCourse = myAssignedCourses.find((c) => c.code === selectedCourseId) || myAssignedCourses[0];
    const deptStudents = allStudents.filter((s) => {
        if (!activeSelectedCourse) return true;
        const cDept = activeSelectedCourse.department?.toUpperCase();
        return (
            !cDept ||
            cDept === "GENERAL" ||
            cDept === "ALL" ||
            s.department?.toUpperCase() === cDept
        );
    });

    // Check course-enrolled students (via portal_student_enrollments)
    const courseEnrolledStudents = allStudents.filter((s) => {
        if (!activeSelectedCourse) return false;
        const stId = s.studentId || s.id;
        const enrolledList = enrollments[stId] || [];
        return enrolledList.includes(activeSelectedCourse.code) || enrolledList.includes(activeSelectedCourse.id);
    });

    // Combined eligible students: explicitly enrolled OR department matched
    const targetedStudents = [
        ...courseEnrolledStudents,
        ...deptStudents.filter((ds) => !courseEnrolledStudents.some((cs) => (cs.studentId || cs.id) === (ds.studentId || ds.id))),
    ];

    // Fallback: If targetedStudents is empty, or teacher selects "all" view mode, show all registered students
    const effectiveStudents = (studentViewMode === "all" || (studentViewMode === "auto" && targetedStudents.length === 0))
        ? allStudents
        : (studentViewMode === "dept" ? targetedStudents : (targetedStudents.length > 0 ? targetedStudents : allStudents));

    const enrolledStudents = effectiveStudents;

    // Handler: Save Attendance
    const handleSetAttendanceStatus = (studentId, status) => {
        const key = `${selectedCourseId}_${attendanceDate}`;
        const currentCourseDateRecords = attendanceRecords[key] || {};
        const updatedCourseRecords = {
            ...currentCourseDateRecords,
            [studentId]: status,
        };

        const updatedAll = {
            ...attendanceRecords,
            [key]: updatedCourseRecords,
        };
        setAttendanceRecords(updatedAll);
        localStorage.setItem("portal_attendance", JSON.stringify(updatedAll));

        // Sync with MongoDB Atlas
        try {
            const recordsArray = Object.keys(updatedCourseRecords).map((id) => {
                const matchedStudent = enrolledStudents.find((s) => (s.studentId || s.id) === id);
                return {
                    studentId: id,
                    studentName: matchedStudent?.fullName || matchedStudent?.name || "Student",
                    department: matchedStudent?.department || "Engineering",
                    status: updatedCourseRecords[id],
                };
            });
            apiRequest("/academic/attendance", "POST", {
                courseCode: selectedCourseId,
                date: attendanceDate,
                records: recordsArray,
                recordedBy: currentUser?.fullName || currentUser?.name || "Faculty",
            }).catch(console.warn);
        } catch (e) {
            console.warn("Attendance sync error:", e);
        }
    };

    const handleMarkAllPresent = () => {
        const key = `${selectedCourseId}_${attendanceDate}`;
        const newRecords = {};
        const recordsArray = [];
        enrolledStudents.forEach((st) => {
            const stId = st.studentId || st.id;
            newRecords[stId] = "present";
            recordsArray.push({
                studentId: stId,
                studentName: st.fullName || st.name || "Student",
                department: st.department || "Engineering",
                status: "present",
            });
        });

        const updatedAll = {
            ...attendanceRecords,
            [key]: newRecords,
        };
        setAttendanceRecords(updatedAll);
        localStorage.setItem("portal_attendance", JSON.stringify(updatedAll));
        setNotificationMsg(`✓ All ${enrolledStudents.length} students marked Present for ${selectedCourseId} on ${attendanceDate}!`);
        setTimeout(() => setNotificationMsg(""), 4000);

        // Sync with MongoDB Atlas
        try {
            apiRequest("/academic/attendance", "POST", {
                courseCode: selectedCourseId,
                date: attendanceDate,
                records: recordsArray,
                recordedBy: currentUser?.fullName || currentUser?.name || "Faculty",
            }).catch(console.warn);
        } catch (e) {
            console.warn("Attendance bulk sync error:", e);
        }
    };

    // Handler: Save Internal Marks
    const handleMarksChange = (studentId, field, val) => {
        const numVal = Math.max(0, Number(val) || 0);
        const studentObj = studentMarksData[studentId] || { ct1: 0, ct2: 0, midterm: 0, assignment: 0 };
        const updatedStudentObj = {
            ...studentObj,
            [field]: numVal,
        };

        const updatedAllMarks = {
            ...studentMarksData,
            [studentId]: updatedStudentObj,
        };
        setStudentMarksData(updatedAllMarks);
        localStorage.setItem("portal_internal_marks", JSON.stringify(updatedAllMarks));
    };

    // Handler: Add Course Material
    const handleAddMaterial = (e) => {
        e.preventDefault();
        if (!materialForm.title.trim() || !materialForm.link.trim()) return;

        const newMat = {
            id: `MAT-${Date.now()}`,
            ...materialForm,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };

        const updated = [newMat, ...materials];
        setMaterials(updated);
        localStorage.setItem("portal_course_materials", JSON.stringify(updated));
        setMaterialForm({
            courseCode: myAssignedCourses[0]?.code || "CSE-3101",
            title: "",
            type: "Lecture Slides",
            link: "",
        });
        setNotificationMsg(`✓ Lecture material "${newMat.title}" shared with students!`);
        setTimeout(() => setNotificationMsg(""), 4000);
    };

    const handleDeleteMaterial = (id) => {
        const updated = materials.filter((m) => m.id !== id);
        setMaterials(updated);
        localStorage.setItem("portal_course_materials", JSON.stringify(updated));
    };

    const handleLogout = () => {
        localStorage.removeItem("portal_current_user");
        router.push("/login");
    };

    // Navigation Items
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "courses", label: "My Courses", icon: BookOpen, count: myAssignedCourses.length },
        { id: "attendance", label: "Attendance Tracker", icon: CheckCircle2 },
        { id: "marks", label: "Internal Marks", icon: Award },
        { id: "materials", label: "Lecture Materials", icon: UploadCloud, count: materials.length },
        { id: "invigilation", label: "Exam Duties", icon: Calendar, count: myExamDuties.length },
        { id: "notices", label: "Faculty Notices", icon: Bell, count: facultyNotices.length },
    ];

    return (
        <div className="w-full min-h-screen bg-[#F3F7F5] flex justify-center items-center">
            <div className="w-full max-w-[1920px] h-screen max-h-[960px] bg-[#F3F7F5] flex font-sans antialiased text-slate-800 overflow-hidden relative shadow-sm">
                {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                />
            )}

            {/* ===================== SIDEBAR ===================== */}
            <aside
                className={`fixed lg:sticky top-0 h-full z-50 w-64 shrink-0 bg-gradient-to-b from-[#064E3B] via-[#046A50] to-[#022C22] text-white flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div>
                    {/* Header */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center shadow-inner">
                                <BookOpen className="w-5 h-5 text-emerald-300" />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-base tracking-wider leading-tight">ICE PORTAL</h2>
                                <p className="text-[10px] text-emerald-200/70 uppercase tracking-widest font-semibold">Faculty Portal</p>
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
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/40"
                                            : "text-emerald-100/80 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-300/70"}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.count !== undefined && (
                                        <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Faculty Profile Card */}
                <div className="p-4 border-t border-white/10 m-3 bg-white/5 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-900 font-black flex items-center justify-center text-xs shadow-md shrink-0">
                        {(currentUser?.fullName || currentUser?.name || "FC").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">{currentUser?.fullName || currentUser?.name || "Faculty Member"}</h4>
                        <p className="text-[10px] text-emerald-200/80 truncate">ID: {currentUser?.facultyId || currentUser?.studentId || "FAC-ICE-10"}</p>
                        <p className="text-[9px] text-teal-200 font-semibold truncate">{currentUser?.department || "ICE"} Dept</p>
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
                                    placeholder="Search courses, student rolls, lecture notes..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Continuous Assessment & Attendance Open</span>
                            </div>

                            <button
                                onClick={() => setActiveTab("notices")}
                                className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                title="Faculty Announcements"
                            >
                                <Bell className="w-4 h-4" />
                                {facultyNotices.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                )}
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
                <div className="bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#022C22] text-white text-xs font-medium py-2 px-4 sm:px-8 border-b border-emerald-900/40 overflow-hidden shadow-xs">
                    <div className="w-full flex items-center">
                        <div className="flex items-center gap-1.5 bg-emerald-500 text-slate-900 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider shrink-0 z-10 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-ping" />
                            <span>Faculty Notice</span>
                        </div>

                        <div className="overflow-hidden whitespace-nowrap w-full ml-4 relative">
                            <div className="inline-block animate-marquee hover:[animation-play-state:paused] cursor-pointer">
                                {facultyNotices.length > 0 ? (
                                    facultyNotices.map((n, idx) => (
                                        <span key={n._id || n.id || `facnotice-${idx}`} className="mx-6 inline-flex items-center gap-2 text-emerald-100 hover:text-white">
                                            <span className="text-amber-300 font-bold">[{n.category}]</span>
                                            <span className="font-semibold text-white">{n.title}:</span>
                                            <span className="text-emerald-200">{n.content.slice(0, 90)}...</span>
                                            <span className="text-emerald-400 text-[10px]">({n.date})</span>
                                            <span className="text-emerald-600 font-black ml-4">•</span>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-emerald-200">
                                        📢 Welcome Faculty • Imperial College of Engineering • Continuous assessment & daily class attendance portal active.
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

                {/* ================= MAIN DASHBOARD BODY ================= */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
                    {/* Welcome Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <span>Welcome, {currentUser?.fullName || currentUser?.name || "Professor"}!</span>
                                <span className="text-2xl">👨‍🏫</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Department of {currentUser?.department || "ICE"} • Faculty ID: {currentUser?.facultyId || currentUser?.studentId || "FAC-ICE-10"} • Academic Year 2026
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs">
                                Term: 1/1 & 2/1 Active
                            </span>
                        </div>
                    </div>

                    {notificationMsg && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>{notificationMsg}</span>
                            </div>
                            <button onClick={() => setNotificationMsg("")} className="text-emerald-600 hover:text-emerald-900">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ================= TAB 1: OVERVIEW DASHBOARD ================= */}
                    {activeTab === "dashboard" && (
                        <>
                            {/* 3 STAT CARDS (CLICKABLE) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <button
                                    onClick={() => setActiveTab("courses")}
                                    className="bg-gradient-to-br from-[#059669] to-[#047857] rounded-3xl p-6 text-white shadow-xl shadow-emerald-700/20 relative overflow-hidden flex flex-col justify-between text-left hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">My Assigned Courses</span>
                                        <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
                                            <BookOpen className="w-5 h-5 text-white" />
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-3xl font-black">{myAssignedCourses.length}</h3>
                                        <p className="text-xs text-emerald-100/90 mt-1">Active theory & laboratory subjects ➔</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab("attendance")}
                                    className="bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-3xl p-6 text-white shadow-xl shadow-teal-700/20 relative overflow-hidden flex flex-col justify-between text-left hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <span className="text-xs font-bold text-teal-100 uppercase tracking-wider">Total Enrolled Students</span>
                                        <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
                                            <Users className="w-5 h-5 text-white" />
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-3xl font-black">{enrolledStudents.length}</h3>
                                        <p className="text-xs text-teal-100/90 mt-1">Manage class attendance & rolls ➔</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab("invigilation")}
                                    className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-6 text-white shadow-xl shadow-slate-700/20 relative overflow-hidden flex flex-col justify-between text-left hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Exam Invigilation Duties</span>
                                        <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-3xl font-black">{myExamDuties.length}</h3>
                                        <p className="text-xs text-slate-300 mt-1">Semester Final examination hall sessions ➔</p>
                                    </div>
                                </button>
                            </div>

                            {/* 4 QUICK ACTION TILES */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <button
                                    onClick={() => setActiveTab("attendance")}
                                    className="p-5 bg-white border border-slate-200/80 rounded-2xl text-left hover:border-emerald-500 hover:shadow-md transition cursor-pointer space-y-2"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900">Class Attendance</h4>
                                    <p className="text-[11px] text-slate-400">Mark daily present / absent</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab("marks")}
                                    className="p-5 bg-white border border-slate-200/80 rounded-2xl text-left hover:border-emerald-500 hover:shadow-md transition cursor-pointer space-y-2"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900">Continuous Assessment</h4>
                                    <p className="text-[11px] text-slate-400">CT, Midterm & Lab Marks</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab("materials")}
                                    className="p-5 bg-white border border-slate-200/80 rounded-2xl text-left hover:border-emerald-500 hover:shadow-md transition cursor-pointer space-y-2"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <UploadCloud className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900">Lecture Notes</h4>
                                    <p className="text-[11px] text-slate-400">Share slides & lab guides</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab("invigilation")}
                                    className="p-5 bg-white border border-slate-200/80 rounded-2xl text-left hover:border-emerald-500 hover:shadow-md transition cursor-pointer space-y-2"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900">Exam Hall Duties</h4>
                                    <p className="text-[11px] text-slate-400">View invigilation schedule</p>
                                </button>
                            </div>

                            {/* ASSIGNED COURSES OVERVIEW TABLE */}
                            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-900">Assigned Courses & Lecture Schedule</h3>
                                        <p className="text-xs text-slate-400">Official course allocations assigned by Department Registrar</p>
                                    </div>
                                    <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs border border-emerald-200">
                                        {myAssignedCourses.length} Courses
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="py-3 px-5">Course Code & Title</th>
                                                <th className="py-3 px-4">Semester</th>
                                                <th className="py-3 px-4">Credits</th>
                                                <th className="py-3 px-4">Classroom & Schedule</th>
                                                <th className="py-3 px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {myAssignedCourses.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="py-10 text-center text-slate-400">
                                                        No courses assigned to your faculty profile yet. Admin will assign courses from Academics manager.
                                                    </td>
                                                </tr>
                                            ) : (
                                                myAssignedCourses.map((c, idx) => (
                                                    <tr key={`tc-course-${c.code || c.id || c._id || idx}-${idx}`} className="hover:bg-slate-50/70 transition">
                                                        <td className="py-4 px-5">
                                                            <div className="font-bold text-slate-900">{c.name}</div>
                                                            <div className="font-mono text-emerald-700 font-bold text-[11px]">{c.code} • {c.department}</div>
                                                        </td>
                                                        <td className="py-4 px-4 font-bold text-indigo-700">{c.semester || "1/1"}</td>
                                                        <td className="py-4 px-4 font-bold text-slate-700">{c.credits} Cr</td>
                                                        <td className="py-4 px-4 text-slate-600">
                                                            <div>{c.schedule || "Sun, Tue (10:00 AM)"}</div>
                                                            <div className="text-[10px] text-slate-400">{c.room || "Room 402"}</div>
                                                        </td>
                                                        <td className="py-4 px-5 text-right space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedCourseId(c.code);
                                                                    setActiveTab("attendance");
                                                                }}
                                                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition cursor-pointer text-[11px]"
                                                            >
                                                                Attendance
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setMarksCourseId(c.code);
                                                                    setActiveTab("marks");
                                                                }}
                                                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg border border-amber-200 transition cursor-pointer text-[11px]"
                                                            >
                                                                Marks
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ================= TAB 2: MY COURSES ================= */}
                    {activeTab === "courses" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Faculty Assigned Course Modules
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Curriculum, syllabus units and lecture schedules assigned to {currentUser?.fullName || "Faculty"}
                                    </p>
                                </div>
                                <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 text-xs w-fit">
                                    {myAssignedCourses.length} Assigned Subjects
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {myAssignedCourses.map((c, idx) => (
                                    <div key={c._id || c.id || c.code || `teachcard-${idx}`} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition">
                                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                            <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                                                {c.code}
                                            </span>
                                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                                Term {c.semester || "1/1"}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="font-extrabold text-base text-slate-900 leading-tight">{c.name}</h3>
                                            <p className="text-xs text-slate-500 mt-1">Department: <strong>{c.department || "General"}</strong> • <strong>{c.credits} Credits</strong></p>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600">
                                            <div><strong>Schedule:</strong> {c.schedule || "Sun, Tue (10:00 AM - 11:30 AM)"}</div>
                                            <div><strong>Room / Lab:</strong> {c.room || "Room 402, Engineering Building"}</div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCourseId(c.code);
                                                    setActiveTab("attendance");
                                                }}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                                            >
                                                Take Attendance
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMaterialForm((prev) => ({ ...prev, courseCode: c.code }));
                                                    setActiveTab("materials");
                                                }}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                                            >
                                                Share Material
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 3: ATTENDANCE TRACKER ================= */}
                    {activeTab === "attendance" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Daily Class Attendance Tracker
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Select course and date to record present, absent, or late student attendance
                                    </p>
                                </div>
                                <button
                                    onClick={handleMarkAllPresent}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 w-fit"
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    <span>Mark All Present</span>
                                </button>
                            </div>

                            {/* Attendance Controls Bar */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Subject</label>
                                        <select
                                            value={selectedCourseId}
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                        >
                                            {myAssignedCourses.map((c, idx) => (
                                                <option key={`attopt-${c.code || c.id || c._id || idx}-${idx}`} value={c.code}>{c.code} - {c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Lecture Date</label>
                                        <input
                                            type="date"
                                            value={attendanceDate}
                                            onChange={(e) => setAttendanceDate(e.target.value)}
                                            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span>Present</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-bold text-rose-600">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                        <span>Absent</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-bold text-amber-600">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                        <span>Late</span>
                                    </div>
                                </div>
                            </div>

                            {/* Multi-Batch Information & View Mode Switcher */}
                            {allStudents.length > 0 && (
                                <div className="bg-amber-50/80 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-amber-600 shrink-0" />
                                        <span>
                                            {targetedStudents.length > 0
                                                ? `Course batch active with ${targetedStudents.length} student(s) enrolled.`
                                                : `Showing all ${allStudents.length} registered university student(s) for cross-batch attendance.`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setStudentViewMode("all")}
                                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                                studentViewMode === "all" || targetedStudents.length === 0
                                                    ? "bg-amber-600 text-white shadow-xs"
                                                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                                            }`}
                                        >
                                            All Registered ({allStudents.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStudentViewMode("dept")}
                                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                                studentViewMode === "dept" && targetedStudents.length > 0
                                                    ? "bg-amber-600 text-white shadow-xs"
                                                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                                            }`}
                                        >
                                            Course Dept ({targetedStudents.length})
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Students Attendance Table */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4">STUDENT ROLL / ID</th>
                                            <th className="py-3 px-4">NAME</th>
                                            <th className="py-3 px-4">DEPARTMENT</th>
                                            <th className="py-3 px-4">SESSION</th>
                                            <th className="py-3 px-4 text-right">STATUS (CLICK TO TOGGLE)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {enrolledStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-10 text-center text-slate-400">
                                                    No registered students found in portal yet. Students who register will appear here.
                                                </td>
                                            </tr>
                                        ) : (
                                            enrolledStudents.map((st, idx) => {
                                                const stId = st.studentId || st._id || st.id || `st-${idx}`;
                                                const key = `${selectedCourseId}_${attendanceDate}`;
                                                const currentStatus = attendanceRecords[key]?.[stId] || "present";
                                                return (
                                                    <tr key={`st-att-row-${stId}-${idx}`} className="hover:bg-slate-50/70 transition">
                                                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">{stId}</td>
                                                        <td className="py-3.5 px-4 font-bold text-slate-900">{st.fullName || st.name}</td>
                                                        <td className="py-3.5 px-4 font-semibold text-slate-600">{st.department || "Engineering"}</td>
                                                        <td className="py-3.5 px-4 text-slate-500">{st.session || "2024-2025"}</td>
                                                        <td className="py-3.5 px-4 text-right">
                                                            <div className="inline-flex items-center gap-1.5">
                                                                <button
                                                                    onClick={() => handleSetAttendanceStatus(stId, "present")}
                                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                                        currentStatus === "present"
                                                                            ? "bg-emerald-600 text-white shadow-xs"
                                                                            : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                                    }`}
                                                                >
                                                                    P
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSetAttendanceStatus(stId, "absent")}
                                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                                        currentStatus === "absent"
                                                                            ? "bg-rose-600 text-white shadow-xs"
                                                                            : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                                                                    }`}
                                                                >
                                                                    A
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSetAttendanceStatus(stId, "late")}
                                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                                        currentStatus === "late"
                                                                            ? "bg-amber-500 text-white shadow-xs"
                                                                            : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                                                                    }`}
                                                                >
                                                                    L
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 4: INTERNAL MARKS ENTRY ================= */}
                    {activeTab === "marks" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Continuous Assessment & Internal Marks
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Input Class Test (CT), Midterm, and Lab/Assignment scores out of 40 marks
                                    </p>
                                </div>
                                <div>
                                    <select
                                        value={marksCourseId}
                                        onChange={(e) => setMarksCourseId(e.target.value)}
                                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                    >
                                        {myAssignedCourses.map((c, idx) => (
                                            <option key={`marksopt-${c.code || c.id || c._id || idx}-${idx}`} value={c.code}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Marks Table */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4">STUDENT ROLL</th>
                                            <th className="py-3 px-4">STUDENT NAME</th>
                                            <th className="py-3 px-3">CT-1 (10)</th>
                                            <th className="py-3 px-3">CT-2 (10)</th>
                                            <th className="py-3 px-3">MIDTERM (20)</th>
                                            <th className="py-3 px-3">TOTAL (40)</th>
                                            <th className="py-3 px-4 text-right">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {enrolledStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="py-10 text-center text-slate-400">
                                                    No students enrolled in this course section.
                                                </td>
                                            </tr>
                                        ) : (
                                            enrolledStudents.map((st, idx) => {
                                                const stId = st.studentId || st._id || st.id || `marksst-${idx}`;
                                                const marks = studentMarksData[stId] || { ct1: 8, ct2: 9, midterm: 16 };
                                                const total = (Number(marks.ct1) || 0) + (Number(marks.ct2) || 0) + (Number(marks.midterm) || 0);
                                                return (
                                                    <tr key={`st-marks-row-${stId}-${idx}`} className="hover:bg-slate-50/70 transition">
                                                        <td className="py-3 px-4 font-mono font-bold text-emerald-800">{stId}</td>
                                                        <td className="py-3 px-4 font-semibold text-slate-900">{st.fullName || st.name}</td>
                                                        <td className="py-3 px-3">
                                                            <input
                                                                type="number"
                                                                max="10"
                                                                min="0"
                                                                value={marks.ct1 ?? 8}
                                                                onChange={(e) => handleMarksChange(stId, "ct1", e.target.value)}
                                                                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <input
                                                                type="number"
                                                                max="10"
                                                                min="0"
                                                                value={marks.ct2 ?? 9}
                                                                onChange={(e) => handleMarksChange(stId, "ct2", e.target.value)}
                                                                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <input
                                                                type="number"
                                                                max="20"
                                                                min="0"
                                                                value={marks.midterm ?? 16}
                                                                onChange={(e) => handleMarksChange(stId, "midterm", e.target.value)}
                                                                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-3 font-black text-emerald-700 text-sm">{total} / 40</td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                                Saved ✓
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 5: LECTURE MATERIALS ================= */}
                    {activeTab === "materials" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Lecture Notes & Course Material Sharer
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Upload presentation slides, lab sheets & drive download links for enrolled students
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Upload Material Form */}
                                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit space-y-4">
                                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                                        <UploadCloud className="w-5 h-5 text-emerald-600" />
                                        <span>Publish New Material</span>
                                    </h3>

                                    <form onSubmit={handleAddMaterial} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Course</label>
                                            <select
                                                value={materialForm.courseCode}
                                                onChange={(e) => setMaterialForm({ ...materialForm, courseCode: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                                            >
                                                {myAssignedCourses.map((c, idx) => (
                                                    <option key={`matopt-${c.code || c.id || c._id || idx}-${idx}`} value={c.code}>{c.code} - {c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title / Unit Description</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Chapter 3: Pipelining & Hazard Resolution"
                                                value={materialForm.title}
                                                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Material Type</label>
                                            <select
                                                value={materialForm.type}
                                                onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                                            >
                                                <option value="Lecture Slides">Lecture Slides (PPT / PDF)</option>
                                                <option value="Lab Guide">Lab Manual / Handout</option>
                                                <option value="Reference Book">Reference Chapter PDF</option>
                                                <option value="Assignment Brief">Assignment Question Sheet</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Drive / Document Link</label>
                                            <input
                                                type="url"
                                                placeholder="https://drive.google.com/your-lecture-pdf"
                                                value={materialForm.link}
                                                onChange={(e) => setMaterialForm({ ...materialForm, link: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Share Material</span>
                                        </button>
                                    </form>
                                </div>

                                {/* Shared Materials List */}
                                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                                    <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
                                        Shared Course Notes & Handouts ({materials.length})
                                    </h3>

                                    <div className="space-y-3">
                                        {materials.length === 0 ? (
                                            <div className="py-10 text-center text-slate-400">
                                                No lecture materials uploaded yet. Use the form to publish notes.
                                            </div>
                                        ) : (
                                            materials.map((m, idx) => (
                                                <div key={m._id || m.id || `mat-${idx}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                                {m.courseCode}
                                                            </span>
                                                            <span className="text-[11px] text-slate-400">{m.type} • {m.date}</span>
                                                        </div>
                                                        <h4 className="font-bold text-xs text-slate-900 mt-1">{m.title}</h4>
                                                        <a
                                                            href={m.link}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 mt-1 font-semibold"
                                                        >
                                                            <span>Open Drive File</span>
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteMaterial(m.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                                        title="Delete Material"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 6: EXAM INVIGILATION DUTIES ================= */}
                    {activeTab === "invigilation" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Semester Examination Invigilation Duty
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Official exam hall supervision schedule issued by the Controller of Examinations
                                    </p>
                                </div>
                                <span className="bg-purple-50 text-purple-700 font-bold px-3 py-1.5 rounded-xl border border-purple-200 text-xs w-fit">
                                    {myExamDuties.length} Assigned Exam Duties
                                </span>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4">EXAM DATE</th>
                                            <th className="py-3 px-4">TIME</th>
                                            <th className="py-3 px-4">COURSE CODE</th>
                                            <th className="py-3 px-4">SUBJECT TITLE</th>
                                            <th className="py-3 px-4">EXAM HALL / ROOM</th>
                                            <th className="py-3 px-4 text-right">DUTY STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {myExamDuties.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-10 text-center text-slate-400">
                                                    No invigilation duties scheduled for your profile in the current term.
                                                </td>
                                            </tr>
                                        ) : (
                                            myExamDuties.map((ex, idx) => (
                                                <tr key={`duty-row-${ex.code || ex.id || ex._id || idx}-${idx}`} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3.5 px-4 font-bold text-slate-900">{ex.date}</td>
                                                    <td className="py-3.5 px-4 font-mono text-slate-600">{ex.time}</td>
                                                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{ex.code}</td>
                                                    <td className="py-3.5 px-4 font-semibold text-slate-800">{ex.name}</td>
                                                    <td className="py-3.5 px-4 font-bold text-slate-700">{ex.room}</td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                                            Confirmed Invigilator
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

                    {/* ================= TAB 7: FACULTY NOTICES ================= */}
                    {activeTab === "notices" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Faculty Notice Board & Circulars
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Official notices, departmental meetings, and circulars published for Faculty members
                                    </p>
                                </div>
                                <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 text-xs w-fit">
                                    {facultyNotices.length} Notices
                                </span>
                            </div>

                            <div className="space-y-4">
                                {facultyNotices.length === 0 ? (
                                    <div className="bg-white p-12 text-center text-slate-400 rounded-3xl border border-slate-200">
                                        <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600" />
                                        <p className="font-bold text-sm text-slate-700">No faculty notices right now</p>
                                        <p className="text-xs text-slate-400 mt-1">Registrar notices will appear here.</p>
                                    </div>
                                ) : (
                                    facultyNotices.map((n, idx) => (
                                        <div key={n._id || n.id || `fnotice-${idx}`} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                                                        {n.category || "General"}
                                                    </span>
                                                    <span className="text-xs text-slate-400">• {n.date}</span>
                                                </div>
                                                <span className="text-[11px] text-slate-400">Target: <strong>{n.audience || "All"}</strong></span>
                                            </div>
                                            <h3 className="font-extrabold text-base text-slate-900">{n.title}</h3>
                                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{n.content}</p>
                                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                                <span>Issued By: <strong>{n.author || "Office of the Registrar"}</strong></span>
                                                <span className="text-emerald-700 font-bold">Imperial College of Engineering</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    {/* Institutional Faculty Dashboard Footer */}
                    <footer className="mt-8 pt-6 pb-2 border-t border-slate-200/80 text-center text-xs text-slate-400 space-y-1">
                        <p className="font-semibold text-slate-600">
                            Imperial College of Engineering (ICE) • Faculty Academic Management System
                        </p>
                        <p className="text-[11px] text-slate-400">
                            Campus: Upper Jessore Road, Khulna - 9000, Bangladesh • Registrar Support: registrar@ice.edu.bd • System Status: Operational
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    </div>
);
};

export default TeacherDashboard;
