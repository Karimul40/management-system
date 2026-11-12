"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    DollarSign,
    Bell,
    Settings,
    Search,
    LogOut,
    CheckCircle2,
    Clock,
    Shield,
    Menu,
    X,
    Trash2,
    CreditCard,
    Download,
    Save,
    Building2,
    Check,
    Printer,
    FileText,
    Award,
    UploadCloud,
    FileSpreadsheet,
    FileUp,
    Calendar,
    Sparkles,
    Plus,
    BookOpen,
} from "lucide-react";

// ============================================================
// CONFIGURATION DATA (Top Level Definitions)
// ============================================================
const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Mgmt", icon: Users },
    { id: "academics", label: "Academics", icon: GraduationCap },
    { id: "exams", label: "Exams & Results", icon: Award },
    { id: "library", label: "Central Library", icon: BookOpen },
    { id: "finance", label: "Finance", icon: DollarSign },
    { id: "notices", label: "Notice Board", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
];

const SEMESTERS = [
    { id: "1/1", label: "1/1 (1st Year 1st Sem)", year: "1st Year" },
    { id: "1/2", label: "1/2 (1st Year 2nd Sem)", year: "1st Year" },
    { id: "2/1", label: "2/1 (2nd Year 1st Sem)", year: "2nd Year" },
    { id: "2/2", label: "2/2 (2nd Year 2nd Sem)", year: "2nd Year" },
    { id: "3/1", label: "3/1 (3rd Year 1st Sem)", year: "3rd Year" },
    { id: "3/2", label: "3/2 (3rd Year 2nd Sem)", year: "3rd Year" },
    { id: "4/1", label: "4/1 (4th Year 1st Sem)", year: "4th Year" },
    { id: "4/2", label: "4/2 (4th Year 2nd Sem - Final)", year: "4th Year" },
];

const DEFAULT_EXAM_ROUTINES = [
    { id: "ex-1", date: "Dec 05, 2026", time: "10:00 AM - 01:00 PM", code: "CSE-3101", name: "Computer Architecture", room: "Exam Hall 1", invigilator: "Dr. Tariqul Islam", semester: "1/1" },
    { id: "ex-2", date: "Dec 08, 2026", time: "10:00 AM - 01:00 PM", code: "CSE-3103", name: "Design & Analysis of Algorithms", room: "Exam Hall 2", invigilator: "Prof. Farhana Haque", semester: "1/1" },
    { id: "ex-3", date: "Dec 12, 2026", time: "02:00 PM - 05:00 PM", code: "GEN-2101", name: "Technical Communication & Ethics", room: "Exam Hall 1", invigilator: "Ms. Nusrat Jahan", semester: "1/1" },
    { id: "ex-4", date: "Dec 16, 2026", time: "10:00 AM - 01:00 PM", code: "ICE-3105", name: "Communication Systems", room: "Room 402", invigilator: "Engr. Zahirul Alam", semester: "1/1" },
];

const DEFAULT_LIBRARY_BOOKS = [
    { id: "b1", title: "Modern Digital Electronics", author: "R. P. Jain", category: "Electronics", copies: 8, isbn: "978-0070669116" },
    { id: "b2", title: "Introduction to Algorithms (CLRS)", author: "Cormen, Leiserson, Rivest, Stein", category: "Computer Science", copies: 5, isbn: "978-0262033848" },
    { id: "b3", title: "Data Communications and Networking", author: "Behrouz A. Forouzan", category: "Networking", copies: 6, isbn: "978-0073376226" },
    { id: "b4", title: "Engineering Circuit Analysis", author: "William H. Hayt", category: "Electrical", copies: 4, isbn: "978-0073529578" },
    { id: "b5", title: "Database System Concepts", author: "Silberschatz, Korth, Sudarshan", category: "Computer Science", copies: 7, isbn: "978-0073523323" },
    { id: "b6", title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell, Peter Norvig", category: "AI & ML", copies: 3, isbn: "978-0136042594" },
];

const DEPARTMENTS = [
    { id: "CSE", name: "CSE (Computer Science)", color: "bg-emerald-500" },
    { id: "ICE", name: "ICE (Information & Comm.)", color: "bg-blue-600" },
    { id: "EEE", name: "EEE (Electrical)", color: "bg-amber-500" },
    { id: "ME", name: "ME & CE (Mechanical/Civil)", color: "bg-purple-500" },
];

// ============================================================
// ADMIN DASHBOARD COMPONENT
// ============================================================
const AdminDashboard = () => {
    const router = useRouter();

    // UI & Navigation States
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [settingsSaved, setSettingsSaved] = useState(false);
    
    // Receipt Modal State (For printing money receipt slip)
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    // Dynamic Data States (Loaded safely from localStorage)
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [notices, setNotices] = useState([]);
    const [courses, setCourses] = useState([]);

    // Forms States
    const [noticeForm, setNoticeForm] = useState({
        title: "",
        category: "Academic",
        audience: "All",
        content: "",
    });

    const [courseForm, setCourseForm] = useState({
        code: "",
        name: "",
        credits: "3.0",
        department: "CSE",
        instructor: "Unassigned",
        semester: "1/1",
    });

    // Exam Routine & Result States
    const [examRoutines, setExamRoutines] = useState([]);
    const [examForm, setExamForm] = useState({
        date: "Dec 05, 2026",
        time: "10:00 AM - 01:00 PM",
        code: "",
        name: "",
        room: "Exam Hall 1",
        invigilator: "",
        semester: "1/1",
    });

    const [results, setResults] = useState([]);
    const [resultSearch, setResultSearch] = useState("");
    const [resultFilterSemester, setResultFilterSemester] = useState("All");
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadNotice, setUploadNotice] = useState("");

    // Central Library States
    const [libraryBooks, setLibraryBooks] = useState([]);
    const [bookForm, setBookForm] = useState({
        title: "",
        author: "",
        category: "Computer Science",
        isbn: "",
        copies: "5",
    });
    const [librarySearch, setLibrarySearch] = useState("");
    const [libraryCategoryFilter, setLibraryCategoryFilter] = useState("All");
    const [borrowedStudentBooks, setBorrowedStudentBooks] = useState([]);

    // Settings State
    const [settings, setSettings] = useState({
        universityName: "Imperial College of Engineering (ICE)",
        currentSemester: "Fall 2026",
        session: "2025-2026",
        supportEmail: "registrar@ice.edu.bd",
        hotline: "+880 1700-123456",
        allowStudentReg: true,
        allowTeacherReg: true,
        manualVerification: true,
        semesterFee: "25000",
        gatewayMode: "sandbox",
    });

    // Load data from localStorage on mount & sync live with MongoDB Atlas
    useEffect(() => {
        try {
            const storedUsers = JSON.parse(localStorage.getItem("portal_users") || "[]");
            setUsers(storedUsers);

            const storedPayments = JSON.parse(localStorage.getItem("portal_payments") || "[]");
            setTransactions(storedPayments);

            const storedNotices = JSON.parse(localStorage.getItem("portal_notices") || "[]");
            setNotices(storedNotices);

            const storedCourses = JSON.parse(localStorage.getItem("portal_courses") || "[]");
            setCourses(storedCourses);

            const storedExams = JSON.parse(localStorage.getItem("portal_exam_routines") || "null");
            if (storedExams && storedExams.length > 0) {
                setExamRoutines(storedExams);
            } else {
                setExamRoutines(DEFAULT_EXAM_ROUTINES);
            }

            const storedResults = JSON.parse(localStorage.getItem("portal_results") || "[]");
            setResults(storedResults);

            const storedBooks = JSON.parse(localStorage.getItem("portal_library_books") || "null");
            if (storedBooks && storedBooks.length > 0) {
                setLibraryBooks(storedBooks);
            } else {
                setLibraryBooks(DEFAULT_LIBRARY_BOOKS);
                localStorage.setItem("portal_library_books", JSON.stringify(DEFAULT_LIBRARY_BOOKS));
            }

            const storedBorrowed = JSON.parse(localStorage.getItem("portal_student_books") || "[]");
            setBorrowedStudentBooks(storedBorrowed);

            const storedSettings = JSON.parse(localStorage.getItem("portal_settings") || "null");
            if (storedSettings) setSettings(storedSettings);
        } catch (e) {
            console.error("Storage parse error", e);
        }

        // Live Sync with MongoDB Atlas via Express API
        const syncMongoDB = async () => {
            try {
                // 1. Users
                const uRes = await apiRequest("/auth/users");
                if (uRes && uRes.success && uRes.users && uRes.users.length > 0) {
                    setUsers(uRes.users);
                    localStorage.setItem("portal_users", JSON.stringify(uRes.users));
                }

                // 2. Courses
                const cRes = await apiRequest("/academic/courses");
                if (cRes && cRes.success && cRes.courses && cRes.courses.length > 0) {
                    setCourses(cRes.courses);
                    localStorage.setItem("portal_courses", JSON.stringify(cRes.courses));
                }

                // 3. Results
                const rRes = await apiRequest("/academic/results");
                if (rRes && rRes.success && rRes.results && rRes.results.length > 0) {
                    setResults(rRes.results);
                    localStorage.setItem("portal_results", JSON.stringify(rRes.results));
                }

                // 4. Library Books
                const bRes = await apiRequest("/academic/library");
                if (bRes && bRes.success && bRes.books && bRes.books.length > 0) {
                    setLibraryBooks(bRes.books);
                    localStorage.setItem("portal_library_books", JSON.stringify(bRes.books));
                }

                // 5. Payments
                const pRes = await apiRequest("/academic/payments");
                if (pRes && pRes.success && pRes.payments && pRes.payments.length > 0) {
                    setTransactions(pRes.payments);
                    localStorage.setItem("portal_payments", JSON.stringify(pRes.payments));
                }

                // 6. Notices
                const nRes = await apiRequest("/academic/notices");
                if (nRes && nRes.success && nRes.notices && nRes.notices.length > 0) {
                    setNotices(nRes.notices);
                    localStorage.setItem("portal_notices", JSON.stringify(nRes.notices));
                }
            } catch (err) {
                console.warn("MongoDB sync fallback to local:", err.message);
            }
        };

        syncMongoDB();
    }, []);

    // Filter dynamic counts (100% real data starting from 0)
    const approvedStudents = users.filter((u) => u.role === "student" && u.status === "approved");
    const approvedTeachers = users.filter((u) => u.role === "teacher" && u.status === "approved");
    const pendingUsers = users.filter((u) => u.status === "pending");
    const totalFeesCollected = transactions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // Calculate real department enrollment dynamically
    const dynamicDeptStats = DEPARTMENTS.map((dept) => {
        const count = approvedStudents.filter(
            (s) => s.department?.toUpperCase() === dept.id || s.department?.toUpperCase().includes(dept.id)
        ).length;
        const pct = approvedStudents.length > 0 ? Math.round((count / approvedStudents.length) * 100) : 0;
        return {
            name: dept.name,
            count: `${count} Students`,
            pct: `${pct}%`,
            color: dept.color,
        };
    });

    // Verification Rate
    const verificationRate = users.length > 0
        ? Math.round(((approvedStudents.length + approvedTeachers.length) / users.length) * 100)
        : 0;

    // User Status Updater
    const updateUserStatus = async (userId, status) => {
        if (!userId) {
            console.error("updateUserStatus error: userId is undefined or missing");
            return;
        }

        const updated = users.map((u) => {
            const currentId = u._id || u.id;
            if (currentId && String(currentId) === String(userId)) {
                return { ...u, status };
            }
            return u;
        });
        setUsers(updated);
        localStorage.setItem("portal_users", JSON.stringify(updated));

        // Sync with MongoDB Atlas
        try {
            await apiRequest(`/auth/users/${userId}/status`, "PATCH", { status });
        } catch (e) {
            console.warn("Could not sync user status to backend:", e);
        }
    };

    const handleDeleteUser = (userId) => {
        if (!userId) return;
        if (!confirm("Are you sure you want to remove this user?")) return;
        const updated = users.filter((u) => {
            const currentId = u._id || u.id;
            return String(currentId) !== String(userId);
        });
        setUsers(updated);
        localStorage.setItem("portal_users", JSON.stringify(updated));
    };

    // Notice Publisher Handlers
    const handlePublishNotice = async (e) => {
        e.preventDefault();
        if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;

        const newNotice = {
            id: `NOT-${Date.now()}`,
            ...noticeForm,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            author: "Admin Authority",
        };

        const updated = [newNotice, ...notices];
        setNotices(updated);
        localStorage.setItem("portal_notices", JSON.stringify(updated));
        setNoticeForm({ title: "", category: "Academic", audience: "All", content: "" });

        try {
            await apiRequest("/academic/notices", "POST", newNotice);
        } catch (err) {
            console.warn("Notice sync error:", err);
        }
    };

    const handleDeleteNotice = (id) => {
        if (!confirm("Are you sure you want to remove this notice?")) return;
        const updated = notices.filter((n) => n.id !== id);
        setNotices(updated);
        localStorage.setItem("portal_notices", JSON.stringify(updated));
    };


    // Exam Routine Handlers
    const handleCreateExamRoutine = (e) => {
        e.preventDefault();
        if (!examForm.code.trim() || !examForm.name.trim()) return;

        const newExam = {
            id: `EXM-${Date.now()}`,
            ...examForm,
            code: examForm.code.toUpperCase(),
            createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };

        const updated = [...examRoutines, newExam];
        setExamRoutines(updated);
        localStorage.setItem("portal_exam_routines", JSON.stringify(updated));

        // Automatically publish an official exam notice
        const examNotice = {
            id: `NOT-EXM-${Date.now()}`,
            title: `Exam Routine: ${newExam.code} (${newExam.semester})`,
            category: "Exam",
            audience: "Students",
            content: `Semester Final Examination for ${newExam.name} (${newExam.code}, ${newExam.semester}) is scheduled on ${newExam.date} from ${newExam.time} at ${newExam.room}. Invigilator: ${newExam.invigilator || "Course Faculty"}. All candidates must collect and bring their official Admit Card.`,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            author: "Office of the Controller of Examinations",
        };
        const updatedNotices = [examNotice, ...notices];
        setNotices(updatedNotices);
        localStorage.setItem("portal_notices", JSON.stringify(updatedNotices));

        setExamForm({
            date: "Dec 05, 2026",
            time: "10:00 AM - 01:00 PM",
            code: "",
            name: "",
            room: "Exam Hall 1",
            invigilator: "",
            semester: "1/1",
        });
    };

    const handleDeleteExamRoutine = (id) => {
        if (!confirm("Are you sure you want to remove this examination routine?")) return;
        const updated = examRoutines.filter((e) => e.id !== id);
        setExamRoutines(updated);
        localStorage.setItem("portal_exam_routines", JSON.stringify(updated));
    };

    // UGC Standard Grading Scale Calculator
    const calculateGrade = (marks) => {
        const num = Number(marks) || 0;
        if (num >= 80) return { grade: "A+", gradePoint: 4.00, remarks: "Outstanding" };
        if (num >= 75) return { grade: "A", gradePoint: 3.75, remarks: "Excellent" };
        if (num >= 70) return { grade: "A-", gradePoint: 3.50, remarks: "Very Good" };
        if (num >= 65) return { grade: "B+", gradePoint: 3.25, remarks: "Good" };
        if (num >= 60) return { grade: "B", gradePoint: 3.00, remarks: "Satisfactory" };
        if (num >= 55) return { grade: "B-", gradePoint: 2.75, remarks: "Above Average" };
        if (num >= 50) return { grade: "C+", gradePoint: 2.50, remarks: "Average" };
        if (num >= 45) return { grade: "C", gradePoint: 2.25, remarks: "Pass" };
        if (num >= 40) return { grade: "D", gradePoint: 2.00, remarks: "Conditional Pass" };
        return { grade: "F", gradePoint: 0.00, remarks: "Fail" };
    };

    // Result Drag & Drop File Upload Parser (CSV / JSON)
    const handleFileUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const text = evt.target.result;
                let parsedItems = [];
                if (file.name.endsWith(".json")) {
                    parsedItems = JSON.parse(text);
                } else {
                    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
                    const startIndex = lines[0].toLowerCase().includes("roll") || lines[0].toLowerCase().includes("student") ? 1 : 0;
                    for (let i = startIndex; i < lines.length; i++) {
                        const parts = lines[i].split(",").map((s) => s.trim().replace(/^[\"']|[\"']$/g, ""));
                        if (parts.length >= 4) {
                            const roll = parts[0];
                            const name = parts[1] || "Student";
                            const courseCode = parts[2] || "CSE-3101";
                            const subjectTitle = parts[3] || "Engineering Course";
                            const sem = parts[4] || "1/1";
                            const cr = Number(parts[5]) || 3.0;
                            const marks = Number(parts[6]) || 80;
                            const { grade, gradePoint, remarks } = calculateGrade(marks);
                            parsedItems.push({
                                id: `RES-${Date.now()}-${i}`,
                                studentId: roll,
                                studentName: name,
                                courseCode,
                                subjectTitle,
                                semester: sem,
                                credits: cr,
                                marks,
                                grade,
                                gradePoint,
                                remarks,
                                publishedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                            });
                        }
                    }
                }

                if (parsedItems.length > 0) {
                    const combined = [...results, ...parsedItems];
                    setResults(combined);
                    localStorage.setItem("portal_results", JSON.stringify(combined));
                    setUploadNotice(`✓ Successfully published ${parsedItems.length} student grade records!`);
                    setTimeout(() => setUploadNotice(""), 4500);
                } else {
                    alert("Could not parse result records. Please check the CSV format.");
                }
            } catch (err) {
                console.error("Result upload error:", err);
                alert("Error parsing file. Please provide a valid CSV or JSON result sheet.");
            }
        };
        reader.readAsText(file);
    };

    // One-Click Sample Result Generator for existing students
    const handleLoadSampleResults = () => {
        const studentList = users.filter((u) => u.role === "student" && u.status === "approved");
        const targetStudents = studentList.length > 0 ? studentList : [
            { studentId: "2024-ICE-042", fullName: "Tanvir Ahmed", department: "ICE" },
            { studentId: "20117", fullName: "Linkon Islam", department: "CSE" },
            { studentId: "128877", fullName: "Zen Chowdhury", department: "CSE" },
        ];

        const sampleCourses = [
            { code: "CSE-3101", title: "Computer Architecture", sem: "1/1", cr: 3.0, marks: 84 },
            { code: "CSE-3103", title: "Design & Analysis of Algorithms", sem: "1/1", cr: 3.0, marks: 78 },
            { code: "EEE-2201", title: "Signals and Systems", sem: "1/1", cr: 3.0, marks: 88 },
            { code: "GEN-2101", title: "Technical Communication & Ethics", sem: "1/1", cr: 2.0, marks: 91 },
        ];

        const generated = [];
        targetStudents.forEach((st, sIdx) => {
            sampleCourses.forEach((c, cIdx) => {
                const marks = Math.min(95, Math.max(55, c.marks - (sIdx * 4) + (cIdx * 2)));
                const { grade, gradePoint, remarks } = calculateGrade(marks);
                generated.push({
                    id: `RES-${st.studentId || sIdx}-${c.code}`,
                    studentId: st.studentId || `2024-ICE-00${sIdx + 1}`,
                    studentName: st.fullName || st.name || "Student",
                    courseCode: c.code,
                    subjectTitle: c.title,
                    semester: c.sem,
                    credits: c.cr,
                    marks,
                    grade,
                    gradePoint,
                    remarks,
                    publishedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                });
            });
        });

        const combined = [...results.filter(r => !generated.some(g => g.id === r.id)), ...generated];
        setResults(combined);
        localStorage.setItem("portal_results", JSON.stringify(combined));
        setUploadNotice(`⚡ Generated official results for ${targetStudents.length} students (${generated.length} total grade rows) across 1/1 semester!`);
        setTimeout(() => setUploadNotice(""), 4500);

        // Sync to MongoDB Atlas
        try {
            apiRequest("/academic/results/batch", "POST", { results: generated }).catch(console.warn);
        } catch (e) {
            console.warn("Result sync error:", e);
        }
    };

    const handleDeleteResult = (id) => {
        const updated = results.filter((r) => r.id !== id);
        setResults(updated);
        localStorage.setItem("portal_results", JSON.stringify(updated));
    };

    const handleClearAllResults = () => {
        if (!confirm("Are you sure you want to clear all published results?")) return;
        setResults([]);
        localStorage.setItem("portal_results", JSON.stringify([]));
    };

    // Central Library Handlers
    const handleAddBook = async (e) => {
        e.preventDefault();
        if (!bookForm.title.trim() || !bookForm.author.trim()) return;

        const newBook = {
            id: `BK-${Date.now()}`,
            title: bookForm.title,
            author: bookForm.author,
            category: bookForm.category,
            isbn: bookForm.isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            copies: Math.max(1, Number(bookForm.copies) || 1),
        };

        const updated = [newBook, ...libraryBooks];
        setLibraryBooks(updated);
        localStorage.setItem("portal_library_books", JSON.stringify(updated));

        try {
            const apiRes = await apiRequest("/academic/library", "POST", newBook);
            if (apiRes && apiRes.book && apiRes.book._id) {
                newBook._id = apiRes.book._id;
            }
        } catch (err) {
            console.warn("Library book sync error:", err);
        }

        setBookForm({
            title: "",
            author: "",
            category: "Computer Science",
            isbn: "",
            copies: "5",
        });
    };

    const handleDeleteBook = (id) => {
        if (!confirm("Are you sure you want to remove this book from Central Library?")) return;
        const updated = libraryBooks.filter((b) => b.id !== id);
        setLibraryBooks(updated);
        localStorage.setItem("portal_library_books", JSON.stringify(updated));
    };

    const handleAdjustCopies = async (id, delta) => {
        const targetBook = libraryBooks.find((b) => b.id === id || b._id === id);
        const updated = libraryBooks.map((b) => {
            if (b.id === id || b._id === id) {
                const newCopies = Math.max(0, (Number(b.copies) || 0) + delta);
                return { ...b, copies: newCopies };
            }
            return b;
        });
        setLibraryBooks(updated);
        localStorage.setItem("portal_library_books", JSON.stringify(updated));

        if (targetBook && targetBook._id) {
            try {
                await apiRequest(`/academic/library/${targetBook._id}/stock`, "PATCH", { delta });
            } catch (err) {
                console.warn("Book stock sync error:", err);
            }
        }
    };
    // Academic Course Handlers
    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!courseForm.code.trim() || !courseForm.name.trim()) return;

        const newCourse = {
            id: `CRS-${Date.now()}`,
            ...courseForm,
            code: courseForm.code.toUpperCase(),
            createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };

        const updated = [newCourse, ...courses];
        setCourses(updated);
        localStorage.setItem("portal_courses", JSON.stringify(updated));

        try {
            const apiRes = await apiRequest("/academic/courses", "POST", newCourse);
            if (apiRes && apiRes.course && apiRes.course._id) {
                newCourse._id = apiRes.course._id;
            }
        } catch (err) {
            console.warn("Course sync error:", err);
        }

        setCourseForm({
            code: "",
            name: "",
            credits: "3.0",
            department: "CSE",
            instructor: "Unassigned",
            semester: "1/1",
        });
    };

    const handleDeleteCourse = async (id) => {
        if (!confirm("Are you sure you want to remove this academic course?")) return;
        const targetCourse = courses.find((c) => c.id === id || c._id === id);
        const updated = courses.filter((c) => c.id !== id && c._id !== id);
        setCourses(updated);
        localStorage.setItem("portal_courses", JSON.stringify(updated));

        if (targetCourse && targetCourse._id) {
            try {
                await apiRequest(`/academic/courses/${targetCourse._id}`, "DELETE");
            } catch (err) {
                console.warn("Course delete sync error:", err);
            }
        }
    };

    // Settings Handlers
    const handleSaveSettings = (e) => {
        e.preventDefault();
        localStorage.setItem("portal_settings", JSON.stringify(settings));
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
    };

    // One-Click JSON Backup Exporter
    const handleExportBackup = () => {
        const backupData = {
            university: settings.universityName,
            backupDate: new Date().toISOString(),
            users,
            transactions,
            notices,
            courses,
            settings,
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ICE_Portal_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Print Receipt Function
    const handlePrintReceipt = () => {
        window.print();
    };

    // Dynamic 4 KPI Stat Cards with Taka sign (৳)
    const STAT_CARDS = [
        {
            title: "Total Students",
            value: approvedStudents.length,
            sub: `${approvedStudents.length} active enrolled`,
            icon: Users,
            gradient: "from-[#1E52E8] to-[#1239A8]",
            action: () => setActiveTab("students"),
        },
        {
            title: "Active Teachers",
            value: approvedTeachers.length,
            sub: `${approvedTeachers.length} verified faculty`,
            icon: GraduationCap,
            gradient: "from-[#0284C7] to-[#0369A1]",
            action: () => setActiveTab("teachers"),
        },
        {
            title: "Fees Collected",
            value: `৳${totalFeesCollected.toLocaleString()}`,
            sub: `${transactions.length} payments recorded`,
            icon: DollarSign,
            gradient: "from-[#059669] to-[#047857]",
            action: () => setActiveTab("finance"),
        },
        {
            title: "Pending Requests",
            value: pendingUsers.length,
            sub: "Review ➔",
            icon: Clock,
            gradient: "from-[#4F46E5] to-[#3730A3]",
            action: () => setShowPendingModal(true),
            highlight: true,
        },
    ];

    // Reusable Table Renderer for Users and Modal
        // Reusable Table Renderer with SESSION column beside DEPT
    const renderTable = (list, isModal = false) => {
        if (list.length === 0) {
            return (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                    <p className="font-bold text-slate-700">No applicants found</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/60">
                        <tr>
                            <th className="py-3 px-4">Applicant</th>
                            <th className="py-3 px-3">Role</th>
                            <th className="py-3 px-3">ID</th>
                            <th className="py-3 px-3">Dept</th>
                            <th className="py-3 px-3 text-blue-600">Session</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {list.map((u) => {
                            const targetId = u._id || u.id;
                            return (
                                <tr key={targetId || u.email} className="hover:bg-slate-50/70 transition">
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-slate-800">{u.fullName || u.name}</div>
                                        <div className="text-[11px] text-slate-400">{u.email}</div>
                                    </td>
                                    <td className="py-3 px-3 capitalize">
                                        <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md text-[11px]">{u.role}</span>
                                    </td>
                                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{u.studentId || u.facultyId || "N/A"}</td>
                                    <td className="py-3 px-3 text-slate-600 font-medium">{u.department || "General"}</td>
                                    <td className="py-3 px-3">
                                        {u.role === "student" || u.role === "alumni" ? (
                                            <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                                                {u.session || "N/A"}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 font-mono text-[11px]">N/A</span>
                                        )}
                                    </td>

                                    <td className="py-3 px-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            u.status === "approved"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : u.status === "rejected"
                                                ? "bg-rose-100 text-rose-800"
                                                : "bg-amber-100 text-amber-800"
                                        }`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right space-x-1.5">
                                        {u.status === "pending" && (
                                            <>
                                                <button onClick={() => updateUserStatus(targetId, "approved")} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition cursor-pointer">
                                                    Approve
                                                </button>
                                                <button onClick={() => updateUserStatus(targetId, "rejected")} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] transition cursor-pointer">
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {!isModal && (
                                            <button onClick={() => handleDeleteUser(targetId)} className="p-1 text-slate-400 hover:text-rose-600 transition">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-[#F4F7FB] flex justify-center items-center">
            <div className="w-full max-w-[1920px] h-screen max-h-[960px] bg-[#F4F7FB] flex font-sans antialiased text-slate-800 overflow-hidden relative shadow-sm">
                {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" />}

            {/* ===================== SIDEBAR ===================== */}
            <aside className={`fixed lg:sticky top-0 h-full z-50 w-64 shrink-0 bg-gradient-to-b from-[#0F1E36] via-[#122748] to-[#0A1629] text-white flex flex-col justify-between overflow-y-auto transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
                <div>
                    <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-base tracking-wider leading-tight">ICE PORTAL</h2>
                                <p className="text-[10px] text-blue-300/70 uppercase tracking-widest font-semibold">Admin Panel</p>
                            </div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>

                    <nav className="p-4 space-y-1.5">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            const badge = item.id === "users" && pendingUsers.length > 0 ? pendingUsers.length : null;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition cursor-pointer ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {badge && <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-white/10 m-3 bg-white/5 rounded-2xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center text-xs">AD</div>
                    <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">Administrator</h4>
                        <p className="text-[10px] text-blue-200/60 truncate">super.admin@ice.edu</p>
                    </div>
                </div>
            </aside>

            {/* ===================== MAIN WRAPPER ===================== */}
            <div className="flex-1 h-full overflow-y-auto flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 sticky top-0 z-30 shadow-xs flex items-center">
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"><Menu className="w-5 h-5" /></button>
                            <div className="relative hidden sm:block w-72 md:w-96">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search portal records..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <button onClick={() => setShowPendingModal(true)} className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">
                                <Bell className="w-4 h-4" />
                                {pendingUsers.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />}
                            </button>
                            <button onClick={() => router.push("/login")} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold text-slate-700 transition cursor-pointer">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* ================= CONTINUOUS RUNNING NOTICE TICKER ================= */}
                <div className="bg-gradient-to-r from-[#0F1E36] via-[#122748] to-[#0F1E36] text-white text-xs font-medium py-2 px-4 sm:px-8 border-b border-blue-900/40 overflow-hidden shadow-xs">
                    <div className="w-full flex items-center">
                        <div className="flex items-center gap-1.5 bg-rose-600 text-white font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider shrink-0 z-10 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            <span>Notice</span>
                        </div>

                        <div className="overflow-hidden whitespace-nowrap w-full ml-4 relative">
                            <div className="inline-block animate-marquee hover:[animation-play-state:paused] cursor-pointer">
                                {notices.length > 0 ? (
                                    notices.map((n, idx) => (
                                        <span key={n.id || idx} className="mx-6 inline-flex items-center gap-2 text-slate-200 hover:text-white">
                                            <span className="text-amber-400 font-bold">[{n.category}]</span>
                                            <span className="font-semibold text-white">{n.title}:</span>
                                            <span className="text-slate-300">{n.content.slice(0, 100)}...</span>
                                            <span className="text-blue-400 text-[10px]">({n.date})</span>
                                            <span className="text-slate-600 font-black ml-4">•</span>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-300">
                                        📢 Welcome to Imperial College of Engineering (ICE) Academic Portal • Official notice board is active • Verified credentials required for portal access.
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

                {/* Dashboard Body */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
                        {/* Header Banner */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 capitalize">{activeTab} View</h1>
                            <p className="text-xs text-slate-500">Imperial College of Engineering Control Center</p>
                        </div>
                    </div>

                    {/* VIEW: MAIN DASHBOARD */}
                    {activeTab === "dashboard" && (
                        <>
                            {/* 4 Stat Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                                {STAT_CARDS.map((c, i) => {
                                    const Icon = c.icon;
                                    return (
                                        <div
                                            key={i}
                                            onClick={c.action}
                                            className={`bg-gradient-to-br ${c.gradient} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">{c.title}</span>
                                                <span className="p-2 rounded-xl bg-white/10"><Icon className="w-4 h-4 text-white" /></span>
                                            </div>
                                            <h3 className="text-3xl font-extrabold mt-3">{c.value}</h3>
                                            <p className="text-xs text-white/80 mt-1 flex items-center justify-between">
                                                <span>{c.sub}</span>
                                                {c.highlight && <span className="font-bold underline">Review ➔</span>}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Charts & Department Section */}
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                                {/* SVG Line Chart */}
                                <div className="xl:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                                    <h3 className="font-extrabold text-base text-slate-800">Student Enrollment Trends</h3>
                                    <div className="w-full h-56 pt-2">
                                        <svg viewBox="0 0 600 200" className="w-full h-full">
                                            {[40, 90, 140, 190].map((y) => (
                                                <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#f1f5f9" strokeWidth="1.5" />
                                            ))}
                                            <path d="M 20 160 Q 120 70, 220 120 T 420 70 T 580 90" fill="none" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
                                            <path d="M 20 130 Q 120 150, 220 90 T 420 120 T 580 40" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="5,5" strokeLinecap="round" />
                                            <circle cx="420" cy="70" r="5" fill="#2563EB" stroke="#fff" strokeWidth="2" />
                                            <circle cx="580" cy="40" r="5" fill="#10B981" stroke="#fff" strokeWidth="2" />
                                        </svg>
                                        <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-2">
                                            {["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((m) => <span key={m}>{m}</span>)}
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Department Breakdown from Real Approved Students */}
                                <div className="xl:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-800 mb-4">Enrollment by Dept</h3>
                                        <div className="space-y-3">
                                            {dynamicDeptStats.map((d, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                                        <span>{d.name}</span>
                                                        <span className="text-slate-500">{d.count}</span>
                                                    </div>
                                                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                                        <div className={`h-full rounded-full ${d.color} transition-all duration-500`} style={{ width: d.pct }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Real Verification Rate */}
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-3.5 rounded-xl">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800">Verification Rate</h4>
                                            <p className="text-[11px] text-slate-500">{verificationRate}% accounts approved</p>
                                        </div>
                                        <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                                            {verificationRate}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* VIEW: USER MANAGEMENT */}
                    {activeTab === "users" && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-2">
                            {renderTable(
                                users.filter(
                                    (u) =>
                                        (u.fullName || u.name)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (u.studentId || u.facultyId)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        u.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        u.session?.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                            )}
                        </div>
                    )}

                    {/* VIEW: ONLY STUDENTS DIRECTORY */}
                    {activeTab === "students" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Enrolled Students Directory
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Total Verified Students: <strong className="text-blue-600">{approvedStudents.length}</strong>
                                    </p>
                                </div>
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200 w-fit">
                                    Role: Student Only
                                </span>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-2">
                                {renderTable(
                                    users
                                        .filter((u) => u.role === "student" && u.status === "approved")
                                        .filter(
                                            (u) =>
                                                (u.fullName || u.name)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                u.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                u.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                u.session?.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                )}
                            </div>
                        </div>
                    )}

                    {/* VIEW: ONLY TEACHERS DIRECTORY */}
                    {activeTab === "teachers" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Faculty & Teachers Directory
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Total Verified Faculty: <strong className="text-sky-600">{approvedTeachers.length}</strong>
                                    </p>
                                </div>
                                <span className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-sky-200 w-fit">
                                    Role: Faculty / Teacher Only
                                </span>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-2">
                                {renderTable(
                                    users
                                        .filter((u) => u.role === "teacher" && u.status === "approved")
                                        .filter(
                                            (u) =>
                                                (u.fullName || u.name)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                u.facultyId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                u.department?.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                )}
                            </div>
                        </div>
                    )}

                    {/* VIEW: FINANCE & FEES (IN BDT ৳) WITH RECEIPT ACTION */}
                    {activeTab === "finance" && (
                        <div className="space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Fees Collection & Transactions
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Verified SSLCommerz Payment Gateway Records & Money Receipts
                                    </p>
                                </div>
                                <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 w-fit flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    SSLCommerz Production Gateway
                                </span>
                            </div>

                            {/* 3 Quick Financial Metric Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Received</p>
                                    <h3 className="text-2xl font-bold text-slate-900">৳{totalFeesCollected.toLocaleString()}</h3>
                                    <p className="text-xs text-emerald-600 font-medium mt-1">✓ Live synced</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Standard Semester Fee</p>
                                    <h3 className="text-2xl font-bold text-slate-900">৳{Number(settings.semesterFee || 25000).toLocaleString()}</h3>
                                    <p className="text-xs text-slate-500 mt-1">Set in settings</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Transactions</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{transactions.length}</h3>
                                    <p className="text-xs text-blue-600 mt-1">Recorded</p>
                                </div>
                            </div>

                            {/* Live Payment Transactions Table with Receipt Button */}
                            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/80 p-4">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <th className="py-3 px-4">Transaction ID</th>
                                            <th className="py-3 px-4">Student</th>
                                            <th className="py-3 px-4">Fee Category</th>
                                            <th className="py-3 px-4">Method</th>
                                            <th className="py-3 px-4">Date & Time</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Amount</th>
                                            <th className="py-3 px-4 text-right">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="py-12 text-center text-slate-400">
                                                    <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                                    <p className="text-sm font-medium">No fee transactions recorded yet.</p>
                                                    <p className="text-xs text-slate-400 mt-1">Student payments will appear here in real-time.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            transactions.map((p, idx) => (
                                                <tr key={p.trxId || idx} className="hover:bg-slate-50/50">
                                                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{p.trxId || `#TRX-${idx + 101}`}</td>
                                                    <td className="py-3 px-4 text-sm font-medium text-slate-800">
                                                        <div>{p.studentName || p.studentId || "Student"}</div>
                                                        <div className="text-[11px] text-slate-400">{p.studentId || "ID: N/A"} • {p.department || "Dept: General"}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs font-bold text-slate-800">
                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                                                            {p.feeCategory || "Semester Tuition Fee"}
                                                        </span>
                                                        {p.semester && <span className="text-[10px] text-slate-400 block font-normal">Term: {p.semester}</span>}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-slate-600 capitalize">{p.method || "bKash / Nagad / Card"}</td>
                                                    <td className="py-3 px-4 text-xs text-slate-500">{p.date || "Just now"}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                            Paid
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-bold text-emerald-600">
                                                        +৳{Number(p.amount || 0).toLocaleString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            onClick={() => setSelectedReceipt(p)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition cursor-pointer"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                            <span>Slip</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ================= VIEW: DYNAMIC NOTICE BOARD ================= */}
                    {activeTab === "notices" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Notice Management & Publisher
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Publish official announcements for students and teachers (syncs to top ticker)
                                    </p>
                                </div>
                                <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200 w-fit">
                                    {notices.length} Active Notices
                                </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Notice Creator Form */}
                                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
                                    <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-blue-600" />
                                        Publish New Notice
                                    </h3>

                                    <form onSubmit={handlePublishNotice} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notice Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Fall 2026 Semester Final Exam Routine"
                                                value={noticeForm.title}
                                                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                                                <select
                                                    value={noticeForm.category}
                                                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                >
                                                    <option value="Academic">Academic</option>
                                                    <option value="Exam">Exam Routine</option>
                                                    <option value="Fee Deadline">Fee Deadline</option>
                                                    <option value="Holiday">Holiday & Event</option>
                                                    <option value="Urgent">Urgent Notice</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Audience</label>
                                                <select
                                                    value={noticeForm.audience}
                                                    onChange={(e) => setNoticeForm({ ...noticeForm, audience: e.target.value })}
                                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                >
                                                    <option value="All">All Users</option>
                                                    <option value="Students">Students Only</option>
                                                    <option value="Teachers">Teachers Only</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notice Description</label>
                                            <textarea
                                                rows="4"
                                                placeholder="Write notice details here..."
                                                value={noticeForm.content}
                                                onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                                required
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                                        >
                                            Publish Notice Now
                                        </button>
                                    </form>
                                </div>

                                {/* List of Published Notices */}
                                <div className="lg:col-span-7 space-y-3">
                                    <h3 className="font-extrabold text-base text-slate-900 mb-2">Live Published Notices</h3>

                                    {notices.length === 0 ? (
                                        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-400">
                                            <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                                            <p className="text-sm font-bold text-slate-600">No notices posted yet</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Fill out the form on the left to broadcast official notices.
                                            </p>
                                        </div>
                                    ) : (
                                        notices.map((n) => (
                                            <div
                                                key={n.id}
                                                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-2 relative"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                            {n.category}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-slate-400">
                                                            For: <strong className="text-slate-700">{n.audience}</strong>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] text-slate-400">{n.date}</span>
                                                        <button
                                                            onClick={() => handleDeleteNotice(n.id)}
                                                            className="text-slate-300 hover:text-rose-600 transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                                                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{n.content}</p>
                                                <div className="pt-2 text-[10px] font-medium text-slate-400 border-t border-slate-50">
                                                    Broadcasted by: {n.author}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= VIEW: DYNAMIC ACADEMICS & COURSES ================= */}
                    {activeTab === "academics" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Academic Curriculum & Course Manager
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Create courses, assign faculty instructors, and manage credits
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200">
                                        {courses.length} Active Courses
                                    </span>
                                    <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
                                        Fall 2026 Active
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Course Creator Form */}
                                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
                                    <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-blue-600" />
                                        Add Academic Course
                                    </h3>

                                    <form onSubmit={handleCreateCourse} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Code</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. CSE-201"
                                                    value={courseForm.code}
                                                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Credits</label>
                                                <select
                                                    value={courseForm.credits}
                                                    onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                                >
                                                    <option value="1.5">1.5 Credits (Lab)</option>
                                                    <option value="2.0">2.0 Credits</option>
                                                    <option value="3.0">3.0 Credits (Theory)</option>
                                                    <option value="4.0">4.0 Credits (Core)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Data Structures & Algorithms"
                                                value={courseForm.name}
                                                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                                                <select
                                                    value={courseForm.department}
                                                    onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                                >
                                                    <option value="CSE">CSE</option>
                                                    <option value="ICE">ICE</option>
                                                    <option value="EEE">EEE</option>
                                                    <option value="ME">ME</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semester</label>
                                                <select
                                                    value={courseForm.semester}
                                                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                                >
                                                    {SEMESTERS.map((s) => (
                                                        <option key={s.id} value={s.id}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Dynamic Faculty Selection */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                                Assign Faculty Instructor
                                            </label>
                                            <select
                                                value={courseForm.instructor}
                                                onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                            >
                                                <option value="Unassigned">Unassigned (Assign Later)</option>
                                                {approvedTeachers.map((t) => (
                                                    <option key={t.id || t._id || t.email} value={t.fullName || t.name}>
                                                        👨‍🏫 {t.fullName || t.name} ({t.department || "Faculty"})
                                                    </option>
                                                ))}
                                            </select>
                                            {approvedTeachers.length === 0 && (
                                                <p className="text-[11px] text-amber-600 mt-1">
                                                    ℹ️ No verified teachers yet. You can assign faculty once approved.
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                                        >
                                            Create Academic Course
                                        </button>
                                    </form>
                                </div>

                                {/* List of Courses */}
                                <div className="lg:col-span-7 space-y-3">
                                    <h3 className="font-extrabold text-base text-slate-900 mb-2">Live Course Catalog</h3>

                                    {courses.length === 0 ? (
                                        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-400">
                                            <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                                            <p className="text-sm font-bold text-slate-600">No courses created yet</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Create your first course using the form on the left.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                                        <tr>
                                                            <th className="py-3 px-4">Code & Title</th>
                                                            <th className="py-3 px-3">Dept</th>
                                                            <th className="py-3 px-3">Semester</th>
                                                            <th className="py-3 px-3">Credits</th>
                                                            <th className="py-3 px-3">Instructor</th>
                                                            <th className="py-3 px-4 text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {courses.map((c) => (
                                                            <tr key={c.id} className="hover:bg-slate-50/70 transition">
                                                                <td className="py-3 px-4">
                                                                    <div className="font-mono font-bold text-blue-700">{c.code}</div>
                                                                    <div className="font-semibold text-slate-800">{c.name}</div>
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                                                                        {c.department}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-3 text-slate-600 font-medium">{c.semester}</td>
                                                                <td className="py-3 px-3 font-bold text-slate-700">{c.credits} Cr</td>
                                                                <td className="py-3 px-3">
                                                                    <span className={`text-[11px] font-semibold ${c.instructor === "Unassigned" ? "text-amber-600 italic" : "text-emerald-700"}`}>
                                                                        {c.instructor}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-right">
                                                                    <button
                                                                        onClick={() => handleDeleteCourse(c.id)}
                                                                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                                        {/* ================= VIEW: EXAM ROUTINE & RESULTS MANAGER ================= */}
                    {activeTab === "exams" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Exams & Result Controller
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Publish exam schedules, drag & drop result sheets, and manage 1/1 to 4/2 semester records
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200 text-xs">
                                        {examRoutines.length} Scheduled Exams
                                    </span>
                                    <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
                                        {results.length} Grade Records
                                    </span>
                                </div>
                            </div>

                            {uploadNotice && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl animate-in fade-in flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                                        <span>{uploadNotice}</span>
                                    </div>
                                    <button onClick={() => setUploadNotice("")} className="text-emerald-600 hover:text-emerald-900">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* SECTION 1: EXAM ROUTINE PUBLISHER & TABLE (MATCHING USER SCREENSHOT) */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            <span>Semester Final Examination Routine</span>
                                        </h3>
                                        <p className="text-xs text-slate-400">Published routines immediately sync to Student Portal & Notice Board</p>
                                    </div>
                                </div>

                                {/* Create Exam Routine Form */}
                                <form onSubmit={handleCreateExamRoutine} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 items-end">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Exam Date</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Dec 05, 2026"
                                            value={examForm.date}
                                            onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                                            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Time</label>
                                        <input
                                            type="text"
                                            placeholder="10:00 AM - 01:00 PM"
                                            value={examForm.time}
                                            onChange={(e) => setExamForm({ ...examForm, time: e.target.value })}
                                            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Course Code</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. CSE-3101"
                                            value={examForm.code}
                                            onChange={(e) => setExamForm({ ...examForm, code: e.target.value })}
                                            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Subject Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Computer Architecture"
                                            value={examForm.name}
                                            onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Room / Hall</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Exam Hall 1"
                                            value={examForm.room}
                                            onChange={(e) => setExamForm({ ...examForm, room: e.target.value })}
                                            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Invigilator</label>
                                        <input
                                            type="text"
                                            placeholder="Faculty Name"
                                            value={examForm.invigilator}
                                            onChange={(e) => setExamForm({ ...examForm, invigilator: e.target.value })}
                                            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Publish</span>
                                        </button>
                                    </div>
                                </form>

                                {/* Official Exam Table Matching Screenshot */}
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="py-3 px-4">EXAM DATE</th>
                                                <th className="py-3 px-4">TIME</th>
                                                <th className="py-3 px-4">COURSE CODE</th>
                                                <th className="py-3 px-4">SUBJECT TITLE</th>
                                                <th className="py-3 px-4">ROOM / HALL</th>
                                                <th className="py-3 px-4">INVIGILATOR</th>
                                                <th className="py-3 px-4 text-right">ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {examRoutines.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="py-10 text-center text-slate-400">
                                                        No examination routine published yet. Use the form above to schedule exams.
                                                    </td>
                                                </tr>
                                            ) : (
                                                examRoutines.map((ex) => (
                                                    <tr key={ex.id} className="hover:bg-slate-50/70 transition">
                                                        <td className="py-3 px-4 font-bold text-slate-800">{ex.date}</td>
                                                        <td className="py-3 px-4 font-mono text-slate-600">{ex.time}</td>
                                                        <td className="py-3 px-4 font-mono font-bold text-blue-700">{ex.code}</td>
                                                        <td className="py-3 px-4 font-semibold text-slate-800">{ex.name}</td>
                                                        <td className="py-3 px-4 text-slate-700 font-medium">{ex.room}</td>
                                                        <td className="py-3 px-4 text-slate-500">{ex.invigilator}</td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button
                                                                onClick={() => handleDeleteExamRoutine(ex.id)}
                                                                className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                                                title="Delete Exam Routine"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* SECTION 2: AUTOMATED RESULT SHEET UPLOADER (DRAG & DROP) */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                                            <UploadCloud className="w-5 h-5 text-indigo-600" />
                                            <span>Automated Result Sheet Uploader (Roll-Wise Mapping)</span>
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Upload official PDF/CSV marksheet. System auto-calculates letter grades (A+ to F) and maps to students roll-wise.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleLoadSampleResults}
                                            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                            <span>⚡ One-Click Load Batch Results</span>
                                        </button>
                                        {results.length > 0 && (
                                            <button
                                                onClick={handleClearAllResults}
                                                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Drag & Drop Dropzone Box */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                    onDragLeave={() => setIsDragOver(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragOver(false);
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                            handleFileUpload(e.dataTransfer.files[0]);
                                        }
                                    }}
                                    className={`border-2 border-dashed rounded-3xl p-8 text-center transition cursor-pointer ${
                                        isDragOver
                                            ? "border-blue-600 bg-blue-50/50"
                                            : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
                                    }`}
                                >
                                    <input
                                        type="file"
                                        id="result-file-input"
                                        accept=".csv, .json, .txt"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleFileUpload(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <label htmlFor="result-file-input" className="cursor-pointer space-y-3 block">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
                                            <FileSpreadsheet className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-sm text-slate-800">
                                                Drag and drop official result sheet here, or <span className="text-blue-600 underline">Browse File</span>
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Supports CSV / Text / JSON format (Roll, Name, CourseCode, Subject, Semester, Credits, Marks)
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-500 font-semibold shadow-2xs">
                                            <span>Fixed UGC Grading Policy: 80%+ = A+ (4.00) • 75%-79% = A (3.75) • 70%-74% = A- (3.50)</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Results Table with Search & Semester Filter */}
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-extrabold text-sm text-slate-900">
                                                Published Grade Records ({results.length})
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={resultFilterSemester}
                                                onChange={(e) => setResultFilterSemester(e.target.value)}
                                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                                            >
                                                <option value="All">All Semesters</option>
                                                {SEMESTERS.map((s) => (
                                                    <option key={s.id} value={s.id}>{s.label}</option>
                                                ))}
                                            </select>
                                            <div className="relative w-48">
                                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    placeholder="Search Roll / ID..."
                                                    value={resultSearch}
                                                    onChange={(e) => setResultSearch(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="py-3 px-4">STUDENT ROLL / ID</th>
                                                    <th className="py-3 px-3">STUDENT NAME</th>
                                                    <th className="py-3 px-3">COURSE</th>
                                                    <th className="py-3 px-3">SEM</th>
                                                    <th className="py-3 px-3">CREDITS</th>
                                                    <th className="py-3 px-3">MARKS</th>
                                                    <th className="py-3 px-3">GRADE</th>
                                                    <th className="py-3 px-3">POINT</th>
                                                    <th className="py-3 px-4 text-right">ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {results.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="9" className="py-10 text-center text-slate-400">
                                                            No student results uploaded yet. Drag & drop a sheet or click &quot;One-Click Load Batch Results&quot; above.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    results
                                                        .filter((r) => {
                                                            const matchSem = resultFilterSemester === "All" || r.semester === resultFilterSemester;
                                                            const matchSearch =
                                                                !resultSearch ||
                                                                r.studentId?.toLowerCase().includes(resultSearch.toLowerCase()) ||
                                                                r.studentName?.toLowerCase().includes(resultSearch.toLowerCase()) ||
                                                                r.courseCode?.toLowerCase().includes(resultSearch.toLowerCase());
                                                            return matchSem && matchSearch;
                                                        })
                                                        .map((r) => (
                                                            <tr key={r.id} className="hover:bg-slate-50/70 transition">
                                                                <td className="py-3 px-4 font-mono font-bold text-blue-700">{r.studentId}</td>
                                                                <td className="py-3 px-3 font-semibold text-slate-800">{r.studentName}</td>
                                                                <td className="py-3 px-3">
                                                                    <div className="font-mono font-bold text-slate-700">{r.courseCode}</div>
                                                                    <div className="text-[10px] text-slate-400">{r.subjectTitle}</div>
                                                                </td>
                                                                <td className="py-3 px-3 font-bold text-indigo-700">{r.semester}</td>
                                                                <td className="py-3 px-3 font-bold text-slate-600">{r.credits} Cr</td>
                                                                <td className="py-3 px-3 font-mono font-bold text-slate-800">{r.marks}</td>
                                                                <td className="py-3 px-3 font-black text-slate-900">
                                                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                                                                        {r.grade}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-3 font-mono font-bold text-emerald-600">{Number(r.gradePoint).toFixed(2)}</td>
                                                                <td className="py-3 px-4 text-right">
                                                                    <button
                                                                        onClick={() => handleDeleteResult(r.id)}
                                                                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                                        {/* ================= VIEW: CENTRAL LIBRARY CONTROLLER ================= */}
                    {activeTab === "library" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Central Library & Inventory Controller
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Manage textbook titles, physical copies in stock, and monitor student active book loans
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-purple-50 text-purple-700 font-bold px-3 py-1.5 rounded-xl border border-purple-200 text-xs">
                                        {libraryBooks.length} Book Titles
                                    </span>
                                    <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
                                        {libraryBooks.reduce((sum, b) => sum + (Number(b.copies) || 0), 0)} Total Copies
                                    </span>
                                </div>
                            </div>

                            {/* 4 Library Summary KPI Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Book Titles</span>
                                    <h4 className="text-2xl font-black text-slate-900 mt-2">{libraryBooks.length}</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Catalogued Academic Titles</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Total Physical Copies</span>
                                    <h4 className="text-2xl font-black text-slate-900 mt-2">
                                        {libraryBooks.reduce((sum, b) => sum + (Number(b.copies) || 0), 0)}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Total Institutional Volume</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Currently Borrowed</span>
                                    <h4 className="text-2xl font-black text-amber-600 mt-2">{borrowedStudentBooks.length}</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Issued to Students</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Available On Shelves</span>
                                    <h4 className="text-2xl font-black text-emerald-600 mt-2">
                                        {Math.max(0, libraryBooks.reduce((sum, b) => sum + (Number(b.copies) || 0), 0) - borrowedStudentBooks.length)}
                                    </h4>
                                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Ready for Borrowing</p>
                                </div>
                            </div>

                            {/* Section: Add Book & Inventory Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Book Add Form */}
                                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit space-y-4">
                                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                        <BookOpen className="w-5 h-5 text-indigo-600" />
                                        <h3 className="font-extrabold text-base text-slate-900">Add Book to Central Library</h3>
                                    </div>

                                    <form onSubmit={handleAddBook} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Book Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Modern Digital Electronics"
                                                value={bookForm.title}
                                                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Author(s)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. R. P. Jain / Cormen et al."
                                                value={bookForm.author}
                                                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                                                <select
                                                    value={bookForm.category}
                                                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                                >
                                                    <option value="Computer Science">Computer Science</option>
                                                    <option value="Electronics">Electronics</option>
                                                    <option value="Electrical">Electrical</option>
                                                    <option value="Networking">Networking</option>
                                                    <option value="AI & ML">AI & Machine Learning</option>
                                                    <option value="Mathematics">Mathematics</option>
                                                    <option value="General Science">General Science</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Copies</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="500"
                                                    value={bookForm.copies}
                                                    onChange={(e) => setBookForm({ ...bookForm, copies: e.target.value })}
                                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ISBN Code (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 978-0070669116"
                                                value={bookForm.isbn}
                                                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Add Book to Catalog</span>
                                        </button>
                                    </form>
                                </div>

                                {/* Library Inventory Table */}
                                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <h3 className="font-extrabold text-base text-slate-900">
                                            Library Books Inventory ({libraryBooks.length})
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={libraryCategoryFilter}
                                                onChange={(e) => setLibraryCategoryFilter(e.target.value)}
                                                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                                            >
                                                <option value="All">All Categories</option>
                                                <option value="Computer Science">Computer Science</option>
                                                <option value="Electronics">Electronics</option>
                                                <option value="Electrical">Electrical</option>
                                                <option value="Networking">Networking</option>
                                                <option value="AI & ML">AI & ML</option>
                                            </select>
                                            <div className="relative w-44">
                                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    placeholder="Search title/author..."
                                                    value={librarySearch}
                                                    onChange={(e) => setLibrarySearch(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="py-3 px-4">Title & Author</th>
                                                    <th className="py-3 px-3">Category</th>
                                                    <th className="py-3 px-3">Stock Copies</th>
                                                    <th className="py-3 px-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {libraryBooks.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="py-10 text-center text-slate-400">
                                                            No books found in Central Library catalog.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    libraryBooks
                                                        .filter((b) => {
                                                            const matchCat = libraryCategoryFilter === "All" || b.category === libraryCategoryFilter;
                                                            const matchSearch =
                                                                !librarySearch ||
                                                                b.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
                                                                b.author.toLowerCase().includes(librarySearch.toLowerCase());
                                                            return matchCat && matchSearch;
                                                        })
                                                        .map((b) => (
                                                            <tr key={b.id} className="hover:bg-slate-50/70 transition">
                                                                <td className="py-3 px-4">
                                                                    <div className="font-bold text-slate-800">{b.title}</div>
                                                                    <div className="text-[11px] text-slate-400">{b.author} • ISBN: {b.isbn || "N/A"}</div>
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                                                                        {b.category}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <button
                                                                            onClick={() => handleAdjustCopies(b.id, -1)}
                                                                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                                                                            title="Decrease copy"
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span className="font-extrabold text-blue-700 px-1">{b.copies}</span>
                                                                        <button
                                                                            onClick={() => handleAdjustCopies(b.id, 1)}
                                                                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                                                                            title="Increase copy"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 text-right">
                                                                    <button
                                                                        onClick={() => handleDeleteBook(b.id)}
                                                                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                                                        title="Remove Book"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Live Student Borrowed Books Monitor */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-amber-600" />
                                        <span>Currently Issued Books to Students ({borrowedStudentBooks.length})</span>
                                    </h3>
                                    <span className="text-xs text-slate-400">Live synchronized with student portals</span>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="py-3 px-4">BOOK TITLE</th>
                                                <th className="py-3 px-3">AUTHOR</th>
                                                <th className="py-3 px-3">ISSUE DATE</th>
                                                <th className="py-3 px-3">RETURN DUE DATE</th>
                                                <th className="py-3 px-4 text-right">STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {borrowedStudentBooks.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="py-8 text-center text-slate-400">
                                                        No books are currently checked out by students. All books are on shelves.
                                                    </td>
                                                </tr>
                                            ) : (
                                                borrowedStudentBooks.map((sb, idx) => (
                                                    <tr key={sb.id || idx} className="hover:bg-slate-50/70 transition">
                                                        <td className="py-3 px-4 font-bold text-slate-800">{sb.title}</td>
                                                        <td className="py-3 px-3 text-slate-500">{sb.author}</td>
                                                        <td className="py-3 px-3 text-slate-600">{sb.issueDate}</td>
                                                        <td className="py-3 px-3 font-semibold text-amber-700">{sb.dueDate}</td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                                Issued
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= VIEW: DYNAMIC SETTINGS & BACKUP ================= */}
                    {activeTab === "settings" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        System Settings & Controls
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Configure university profile, admission toggles, fees, and database backups
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleExportBackup}
                                        className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                                    >
                                        <Download className="w-4 h-4 text-blue-400" />
                                        <span>Download Backup (JSON)</span>
                                    </button>
                                </div>
                            </div>

                            {settingsSaved && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>Settings updated and saved successfully!</span>
                                </div>
                            )}

                            <form onSubmit={handleSaveSettings} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* 1. University Profile */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                                        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-blue-600" />
                                            University Profile
                                        </h3>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Institution Name</label>
                                            <input
                                                type="text"
                                                value={settings.universityName}
                                                onChange={(e) => setSettings({ ...settings, universityName: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Session</label>
                                                <input
                                                    type="text"
                                                    value={settings.session}
                                                    onChange={(e) => setSettings({ ...settings, session: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semester</label>
                                                <input
                                                    type="text"
                                                    value={settings.currentSemester}
                                                    onChange={(e) => setSettings({ ...settings, currentSemester: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Support Email</label>
                                                <input
                                                    type="email"
                                                    value={settings.supportEmail}
                                                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Help Desk Phone</label>
                                            <input
                                                type="text"
                                                value={settings.hotline}
                                                onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* 2. Admission & Verification Rules */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                                        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-emerald-600" />
                                            Admission & Registration Rules
                                        </h3>

                                        <div className="space-y-3 pt-2">
                                            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">Student Admissions Open</p>
                                                    <p className="text-[11px] text-slate-400">Allow new students to register online</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.allowStudentReg}
                                                    onChange={(e) => setSettings({ ...settings, allowStudentReg: e.target.checked })}
                                                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">Faculty Registration Open</p>
                                                    <p className="text-[11px] text-slate-400">Allow teachers to submit application</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.allowTeacherReg}
                                                    onChange={(e) => setSettings({ ...settings, allowTeacherReg: e.target.checked })}
                                                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">Admin Verification Shield</p>
                                                    <p className="text-[11px] text-slate-400">Hold applicants in pending state until manual review</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.manualVerification}
                                                    onChange={(e) => setSettings({ ...settings, manualVerification: e.target.checked })}
                                                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* 3. Financial & Fee Controls */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                                        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-purple-600" />
                                            Financial & Tuition Fees (BDT ৳)
                                        </h3>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                                Standard Semester Tuition Fee (৳)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">৳</span>
                                                <input
                                                    type="number"
                                                    value={settings.semesterFee}
                                                    onChange={(e) => setSettings({ ...settings, semesterFee: e.target.value })}
                                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-1">This will be the base amount charged via SSLCommerz</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                                SSLCommerz Gateway Mode
                                            </label>
                                            <select
                                                value={settings.gatewayMode}
                                                onChange={(e) => setSettings({ ...settings, gatewayMode: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                            >
                                                <option value="sandbox">Sandbox Test Mode (Safe for demo & tests)</option>
                                                <option value="live">Live Production Mode (Real bKash/Nagad transactions)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* 4. Database & Export Overview */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                                        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                            System Storage Status
                                        </h3>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                                <p className="text-xl font-extrabold text-slate-900">{users.length}</p>
                                                <p className="text-[11px] font-semibold text-slate-500">Total Accounts</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                                <p className="text-xl font-extrabold text-slate-900">{courses.length}</p>
                                                <p className="text-[11px] font-semibold text-slate-500">Academic Courses</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                                <p className="text-xl font-extrabold text-slate-900">{transactions.length}</p>
                                                <p className="text-[11px] font-semibold text-slate-500">Paid Fees</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                                <p className="text-xl font-extrabold text-slate-900">{notices.length}</p>
                                                <p className="text-[11px] font-semibold text-slate-500">Notices Posted</p>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-slate-400">
                                            All records are backed up in real-time. Use the top button to download the JSON archive anytime.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Save All Configuration Settings</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    {/* Institutional Admin Dashboard Footer */}
                    <footer className="mt-8 pt-6 pb-2 border-t border-slate-200/80 text-center text-xs text-slate-400 space-y-1">
                        <p className="font-semibold text-slate-600">
                            Imperial College of Engineering (ICE) • Central Administrative Control Architecture
                        </p>
                        <p className="text-[11px] text-slate-400">
                            Campus: Upper Jessore Road, Khulna - 9000, Bangladesh • IT Support: admin@ice.edu.bd • System Status: Operational
                        </p>
                    </footer>
                </main>
            </div>

            {/* ================= OFFICIAL PAYMENT MONEY RECEIPT MODAL ================= */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col">
                        {/* Modal Action Bar (Hidden when printing) */}
                        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                Official Tuition Fee Money Voucher
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintReceipt}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print / Download PDF</span>
                                </button>
                                <button
                                    onClick={() => setSelectedReceipt(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Printable Voucher Paper */}
                        <div id="printable-receipt" className="p-8 sm:p-10 space-y-6 bg-white text-slate-800">
                            {/* University Header */}
                            <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-900 text-white font-black text-xl mb-1 shadow-sm">
                                    ICE
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                                    {settings.universityName || "Imperial College of Engineering"}
                                </h2>
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                                    Office of the Comptroller & Accounts Division • Official Fee Receipt
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    Campus Hotline: {settings.hotline} • Email: {settings.supportEmail}
                                </p>
                            </div>

                            {/* Receipt Meta & Paid Badge */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <div>
                                    <p className="text-[11px] text-slate-500 font-medium">Receipt No / Trx ID:</p>
                                    <p className="text-sm font-mono font-bold text-slate-900">{selectedReceipt.trxId || `#TRX-${Date.now()}`}</p>
                                    <p className="text-[11px] text-slate-500 mt-1">Payment Method: <span className="font-bold text-slate-800 capitalize">{selectedReceipt.method || "SSLCommerz (bKash/Nagad/Card)"}</span></p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-[11px] text-slate-500 font-medium">Date & Time:</p>
                                    <p className="text-xs font-bold text-slate-900">{selectedReceipt.date || "Just now"}</p>
                                    <div className="mt-1">
                                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[11px] rounded-lg uppercase tracking-wider">
                                            ✓ VERIFIED & PAID
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Student Academic Information Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-slate-200 rounded-2xl">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Student Name</p>
                                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedReceipt.studentName || selectedReceipt.fullName || "Enrolled Student"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Student ID / Roll</p>
                                    <p className="text-xs font-mono font-bold text-blue-700 mt-0.5">{selectedReceipt.studentId || selectedReceipt.roll || "2024-ICE-001"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
                                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedReceipt.department || selectedReceipt.dept || "CSE"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Session / Term</p>
                                    <p className="text-xs font-bold text-slate-900 mt-0.5">{settings.session} ({settings.currentSemester})</p>
                                </div>
                            </div>

                            {/* Fee Itemization Table */}
                            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                                    <tr>
                                        <th className="py-2.5 px-4">SL</th>
                                        <th className="py-2.5 px-4">Description of Fee</th>
                                        <th className="py-2.5 px-4 text-right">Amount (BDT)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="py-3 px-4 font-bold text-slate-500">01</td>
                                        <td className="py-3 px-4 font-semibold text-slate-800">
                                            Semester Tuition Fee, Academic Registration & Lab Access ({settings.currentSemester})
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                                            ৳{Number(selectedReceipt.amount || 25000).toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr className="bg-slate-50/80 font-bold">
                                        <td colSpan="2" className="py-3 px-4 text-right uppercase text-[11px] text-slate-600">Total Paid Amount:</td>
                                        <td className="py-3 px-4 text-right text-sm font-extrabold text-emerald-700">
                                            ৳{Number(selectedReceipt.amount || 25000).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Signatures & Seal */}
                            <div className="pt-8 flex items-end justify-between text-xs text-slate-500">
                                <div className="space-y-1">
                                    <div className="w-32 border-b border-slate-300"></div>
                                    <p className="text-[10px] text-slate-400">Student Signature</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="inline-block border border-dashed border-emerald-500 text-emerald-700 px-3 py-1 text-[10px] font-black rounded mb-2 uppercase">
                                        System Generated • No Seal Required
                                    </div>
                                    <div className="w-40 border-b border-slate-300 ml-auto"></div>
                                    <p className="text-[10px] font-bold text-slate-700">Comptroller of Accounts, ICE</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= PENDING REQUESTS MODAL ================= */}
            {showPendingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Shield className="w-5 h-5 text-blue-600" />
                                <h3 className="font-extrabold text-base text-slate-800">Pending Approvals ({pendingUsers.length})</h3>
                            </div>
                            <button onClick={() => setShowPendingModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">{renderTable(pendingUsers, true)}</div>
                        <div className="p-3 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setShowPendingModal(false)} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default AdminDashboard;