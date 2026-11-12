"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import PaymentGatewayModal from "@/components/PaymentGatewayModal";
import {
    LayoutDashboard,
    GraduationCap,
    CreditCard,
    BookOpen,
    Users,
    Search,
    Bell,
    LogOut,
    ArrowRight,
    Calendar,
    Star,
    Download,
    CheckCircle2,
    Clock,
    Menu,
    X,
    ChevronRight,
    Sparkles,
    Shield,
    Printer,
    FileText,
    Check,
    Award,
    AlertCircle,
    QrCode,
    Phone,
    Mail,
    MapPin,
    RefreshCw,
    FileCheck,
    BookMarked,
    Send,
} from "lucide-react";

// ============================================================
// DEFAULT STARTER DATA (FALLBACK IF LOCALSTORAGE IS EMPTY)
// ============================================================
const DEFAULT_COURSES = [
    { id: "c1", code: "CSE-3101", name: "Computer Architecture & Organization", credits: 3.0, department: "CSE", instructor: "Dr. Tariqul Islam", semester: "5th Semester", schedule: "Sun, Tue (10:00 AM - 11:30 AM)", room: "Room 402" },
    { id: "c2", code: "CSE-3103", name: "Design & Analysis of Algorithms", credits: 3.0, department: "CSE", instructor: "Prof. Farhana Haque", semester: "5th Semester", schedule: "Mon, Wed (11:30 AM - 01:00 PM)", room: "Lab 3" },
    { id: "c3", code: "ICE-3105", name: "Communication Systems & Telephony", credits: 3.0, department: "ICE", instructor: "Engr. Zahirul Alam", semester: "5th Semester", schedule: "Sun, Wed (02:00 PM - 03:30 PM)", room: "Room 501" },
    { id: "c4", code: "EEE-2201", name: "Signals and Systems", credits: 3.0, department: "EEE", instructor: "Dr. Kamal Hossain", semester: "4th Semester", schedule: "Tue, Thu (09:00 AM - 10:30 AM)", room: "Room 304" },
    { id: "c5", code: "GEN-2101", name: "Technical Communication & Ethics", credits: 2.0, department: "General", instructor: "Ms. Nusrat Jahan", semester: "All Semesters", schedule: "Thu (11:00 AM - 01:00 PM)", room: "Auditorium" },
];

const DEFAULT_LIBRARY_BOOKS = [
    { id: "b1", title: "Modern Digital Electronics", author: "R. P. Jain", category: "Electronics", copies: 8, isbn: "978-0070669116" },
    { id: "b2", title: "Introduction to Algorithms (CLRS)", author: "Cormen, Leiserson, Rivest, Stein", category: "Computer Science", copies: 5, isbn: "978-0262033848" },
    { id: "b3", title: "Data Communications and Networking", author: "Behrouz A. Forouzan", category: "Networking", copies: 6, isbn: "978-0073376226" },
    { id: "b4", title: "Engineering Circuit Analysis", author: "William H. Hayt", category: "Electrical", copies: 4, isbn: "978-0073529578" },
    { id: "b5", title: "Database System Concepts", author: "Silberschatz, Korth, Sudarshan", category: "Databases", copies: 7, isbn: "978-0073523323" },
    { id: "b6", title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell, Peter Norvig", category: "AI & ML", copies: 3, isbn: "978-0136042594" },
];

const EXAM_ROUTINE = [
    { date: "Dec 05, 2026", time: "10:00 AM - 01:00 PM", code: "CSE-3101", course: "Computer Architecture", room: "Exam Hall 1", invigilator: "Dr. Tariqul Islam" },
    { date: "Dec 08, 2026", time: "10:00 AM - 01:00 PM", code: "CSE-3103", course: "Design & Analysis of Algorithms", room: "Exam Hall 2", invigilator: "Prof. Farhana Haque" },
    { date: "Dec 12, 2026", time: "02:00 PM - 05:00 PM", code: "GEN-2101", course: "Technical Communication & Ethics", room: "Exam Hall 1", invigilator: "Ms. Nusrat Jahan" },
    { date: "Dec 16, 2026", time: "10:00 AM - 01:00 PM", code: "ICE-3105", course: "Communication Systems", room: "Room 402", invigilator: "Engr. Zahirul Alam" },
];

const DEFAULT_ACADEMIC_RESULTS = [
    { code: "CSE-2201", name: "Object Oriented Programming (Java)", credits: 3.0, grade: "A+", gradePoint: 4.00, semester: "4th Semester" },
    { code: "CSE-2202", name: "Data Structures & Algorithms Lab", credits: 1.5, grade: "A+", gradePoint: 4.00, semester: "4th Semester" },
    { code: "EEE-2201", name: "Analog Electronic Circuits", credits: 3.0, grade: "A", gradePoint: 3.75, semester: "4th Semester" },
    { code: "MATH-2203", name: "Linear Algebra & Vector Analysis", credits: 3.0, grade: "A-", gradePoint: 3.50, semester: "4th Semester" },
    { code: "GEN-2205", name: "Bangladesh Studies & History", credits: 2.0, grade: "A+", gradePoint: 4.00, semester: "4th Semester" },
];

// ============================================================
// STUDENT DASHBOARD COMPONENT
// ============================================================
const StudentDashboard = () => {
    const router = useRouter();

    // UI & Navigation States
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, academics, exams, payments, library, notices, alumni
    const [showPayModal, setShowPayModal] = useState(false);
    const [payCategory, setPayCategory] = useState("Semester Tuition Fee");
    const [payModalAmount, setPayModalAmount] = useState(25000);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [showIdCardModal, setShowIdCardModal] = useState(false);
    const [showAdmitCardModal, setShowAdmitCardModal] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Selected Course Modal
    const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);

    // Alumni Mentorship & Jobs
    const [mentorshipModalAlumni, setMentorshipModalAlumni] = useState(null);
    const [mentorshipMsg, setMentorshipMsg] = useState("");
    const [mentorshipSuccess, setMentorshipSuccess] = useState(false);
    const [alumniJobs, setAlumniJobs] = useState([]);

    // Payment Form States (SSLCommerz Simulation)
    const [paymentMethod, setPaymentMethod] = useState("bKash");
    const [paymentPhone, setPaymentPhone] = useState("");
    const [paymentPin, setPaymentPin] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Library State
    const [libraryCatalog, setLibraryCatalog] = useState(DEFAULT_LIBRARY_BOOKS);
    const [librarySearch, setLibrarySearch] = useState("");
    const [borrowedBooks, setBorrowedBooks] = useState([
        { id: "b1", title: "Modern Digital Electronics", author: "R. P. Jain", issueDate: "Nov 01, 2026", dueDate: "Nov 28, 2026", status: "Issued" },
    ]);
    const [libraryNotice, setLibraryNotice] = useState("");

    // Dynamic Data States (from localStorage)
    const [currentUser, setCurrentUser] = useState(null);
    const [examRoutines, setExamRoutines] = useState([]);
    const [results, setResults] = useState([]);
    const [settings, setSettings] = useState({
        universityName: "Imperial College of Engineering (ICE)",
        currentSemester: "Fall 2026",
        session: "2024-2025",
        semesterFee: "25000",
        hotline: "+880 1700-123456",
        supportEmail: "registrar@ice.edu.bd",
    });
    const [payments, setPayments] = useState([]);
    const [notices, setNotices] = useState([]);
    const [courses, setCourses] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // Notice Search & Filter
    const [noticeFilter, setNoticeFilter] = useState("All");

    // Course Enrollment States
    const [enrollments, setEnrollments] = useState({});
    const [enrollSuccessMsg, setEnrollSuccessMsg] = useState("");

    // Load data from localStorage on mount
    useEffect(() => {
        try {
            // 1. Load Current Logged In Student
            const storedUser = JSON.parse(localStorage.getItem("portal_current_user") || "null");
            const storedUsers = JSON.parse(localStorage.getItem("portal_users") || "[]");
            setAllUsers(storedUsers);

            if (storedUser) {
                setCurrentUser(storedUser);
            } else {
                const firstStudent = storedUsers.find((u) => u.role === "student" && u.status === "approved") || {
                    fullName: "Tanvir Ahmed",
                    name: "Tanvir Ahmed",
                    studentId: "2024-ICE-042",
                    department: "ICE",
                    session: "2024-2025",
                    standing: "1st Year",
                    email: "tanvir.student@ice.edu.bd",
                    bloodGroup: "B+",
                };
                setCurrentUser(firstStudent);
            }

            // 2. Load Portal Settings (Tuition Fee & Semester)
            const storedSettings = JSON.parse(localStorage.getItem("portal_settings") || "null");
            if (storedSettings) setSettings(storedSettings);

            // 3. Load Payments
            const storedPayments = JSON.parse(localStorage.getItem("portal_payments") || "[]");
            setPayments(storedPayments);

            // 4. Load Notices
            const storedNotices = JSON.parse(localStorage.getItem("portal_notices") || "[]");
            setNotices(storedNotices);

            // 5. Load Courses
            const storedCourses = JSON.parse(localStorage.getItem("portal_courses") || "[]");
            if (storedCourses.length > 0) {
                setCourses(storedCourses);
            } else {
                setCourses(DEFAULT_COURSES);
            }

            // 5b. Load Exam Routines from Admin
            const storedExams = JSON.parse(localStorage.getItem("portal_exam_routines") || "null");
            if (storedExams && storedExams.length > 0) {
                setExamRoutines(storedExams);
            } else {
                setExamRoutines(EXAM_ROUTINE);
            }

            // 5c. Load Roll-wise Results from Admin
            const storedResults = JSON.parse(localStorage.getItem("portal_results") || "[]");
            setResults(storedResults);

            // 6. Load Central Library Catalog from Admin
            const storedCatalog = JSON.parse(localStorage.getItem("portal_library_books") || "null");
            if (storedCatalog && storedCatalog.length > 0) {
                setLibraryCatalog(storedCatalog);
            } else {
                setLibraryCatalog(DEFAULT_LIBRARY_BOOKS);
            }

            // 7. Load Student Library Borrowed Books
            const storedBooks = JSON.parse(localStorage.getItem("portal_student_books") || "null");
            if (storedBooks) {
                setBorrowedBooks(storedBooks);
            }

            // 8. Load Course Enrollments
            const storedEnrollments = JSON.parse(localStorage.getItem("portal_student_enrollments") || "{}");
            setEnrollments(storedEnrollments);

            // 9. Load Alumni Jobs
            const storedJobs = JSON.parse(localStorage.getItem("portal_alumni_jobs") || "[]");
            setAlumniJobs(storedJobs);
        } catch (err) {
            console.error("Error loading student portal data:", err);
        }

        // Live Sync with MongoDB Atlas via Express API
        const syncStudentData = async () => {
            try {
                // 1. Courses
                const cRes = await apiRequest("/academic/courses");
                if (cRes && cRes.success && cRes.courses && cRes.courses.length > 0) {
                    setCourses(cRes.courses);
                    localStorage.setItem("portal_courses", JSON.stringify(cRes.courses));
                }

                // 2. Results
                const rRes = await apiRequest("/academic/results");
                if (rRes && rRes.success && rRes.results && rRes.results.length > 0) {
                    setResults(rRes.results);
                    localStorage.setItem("portal_results", JSON.stringify(rRes.results));
                }

                // 3. Central Library
                const bRes = await apiRequest("/academic/library");
                if (bRes && bRes.success && bRes.books && bRes.books.length > 0) {
                    setLibraryCatalog(bRes.books);
                    localStorage.setItem("portal_library_books", JSON.stringify(bRes.books));
                }

                // 4. Payments
                const pRes = await apiRequest("/academic/payments");
                if (pRes && pRes.success && pRes.payments && pRes.payments.length > 0) {
                    setPayments(pRes.payments);
                    localStorage.setItem("portal_payments", JSON.stringify(pRes.payments));
                }

                // 5. Notices
                const nRes = await apiRequest("/academic/notices");
                if (nRes && nRes.success && nRes.notices && nRes.notices.length > 0) {
                    setNotices(nRes.notices);
                    localStorage.setItem("portal_notices", JSON.stringify(nRes.notices));
                }

                // 6. Alumni Jobs
                const jRes = await apiRequest("/academic/jobs");
                if (jRes && jRes.success && jRes.jobs && jRes.jobs.length > 0) {
                    setAlumniJobs(jRes.jobs);
                    localStorage.setItem("portal_alumni_jobs", JSON.stringify(jRes.jobs));
                }
            } catch (err) {
                console.warn("Student sync fallback to local:", err.message);
            }
        };

        syncStudentData();
    }, []);

    // Filter payments for this specific student
    const myPayments = payments.filter(
        (p) =>
            (currentUser?.studentId && p.studentId === currentUser.studentId) ||
            p.studentName?.toLowerCase() === (currentUser?.fullName || currentUser?.name)?.toLowerCase()
    );

    // 1. Current 6-Month Semester Fee Cycle Tracking
    const semesterFeeTarget = Number(settings.semesterFee || 25000);
    const currentSemesterName = settings.currentSemester || currentUser?.semester || "Spring 2026";

    // Current Semester Tuition Payments
    const currentSemTuitionPayments = myPayments.filter(
        (p) =>
            (p.feeCategory === "Semester Tuition Fee" || !p.feeCategory) &&
            (!p.semester || p.semester === currentSemesterName || p.semester === currentUser?.semester)
    );
    const currentSemTuitionPaid = currentSemTuitionPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const currentSemDue = Math.max(0, semesterFeeTarget - currentSemTuitionPaid);
    const isFeeFullyPaid = currentSemDue === 0 && currentSemTuitionPaid >= semesterFeeTarget;
    const isPartialPaid = currentSemTuitionPaid > 0 && currentSemDue > 0;
    const latestPayment = myPayments.length > 0 ? myPayments[0] : null;

    // 2. Yearly Total Paid (Current Year e.g. 2026)
    const currentYear = new Date().getFullYear().toString();
    const yearlyTotalPaid = myPayments
        .filter((p) => {
            const y = p.academicYear || (p.date ? new Date(p.date).getFullYear().toString() : currentYear);
            return y === currentYear;
        })
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // 3. 4-Year Degree Lifetime Total Paid
    const lifetimeTotalPaid = myPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // 4. Categorized Breakdown
    const feeCategoryBreakdown = {
        tuition: myPayments.filter((p) => p.feeCategory === "Semester Tuition Fee" || !p.feeCategory).reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        monthly: myPayments.filter((p) => p.feeCategory === "Monthly Fee").reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        midExam: myPayments.filter((p) => p.feeCategory === "Mid-Term Exam Fee").reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        finalExam: myPayments.filter((p) => p.feeCategory === "Semester Final Exam Fee").reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        labLibrary: myPayments.filter((p) => p.feeCategory === "Lab & Library Fee" || p.feeCategory?.includes("Lab")).reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        other: myPayments.filter((p) => p.feeCategory === "Other University Fee" || p.feeCategory?.includes("Other")).reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    };

    // Filter courses relevant to student:
    // 1. Explicitly enrolled courses (via portal_student_enrollments)
    // 2. Department matching or GENERAL / ALL
    // 3. Smart Fallback: If no courses match this department yet, include all offered campus courses so student is never stuck at 0!
    const myStudentId = currentUser?.studentId || currentUser?.id;
    const myEnrolledCodes = (myStudentId && enrollments[myStudentId]) || [];

    const deptCourses = courses.filter((c) => {
        const dept = currentUser?.department?.toUpperCase() || "ICE";
        const cDept = c.department?.toUpperCase();
        return !cDept || cDept === dept || cDept === "GENERAL" || cDept === "ALL";
    });

    const explicitlyEnrolledCourses = courses.filter((c) =>
        myEnrolledCodes.includes(c.code) || myEnrolledCodes.includes(c.id)
    );

    // Merge explicitly enrolled + department courses
    const combinedCourses = [
        ...explicitlyEnrolledCourses,
        ...deptCourses.filter((dc) => !explicitlyEnrolledCourses.some((ec) => ec.code === dc.code || ec.id === dc.id)),
    ];

    // Fallback: If combinedCourses is empty and there are courses in portal_courses, show all courses
    const myCourses = combinedCourses.length > 0 ? combinedCourses : courses;

    const totalCredits = myCourses.reduce((sum, c) => sum + (Number(c.credits) || 3), 0);

    // Toggle Course Enrollment Handler
    const handleToggleEnrollCourse = (courseCode) => {
        if (!myStudentId) return;
        const currentList = enrollments[myStudentId] || [];
        const isEnrolled = currentList.includes(courseCode);
        const updatedList = isEnrolled
            ? currentList.filter((c) => c !== courseCode)
            : [...currentList, courseCode];

        const updatedAll = {
            ...enrollments,
            [myStudentId]: updatedList,
        };
        setEnrollments(updatedAll);
        localStorage.setItem("portal_student_enrollments", JSON.stringify(updatedAll));
        setEnrollSuccessMsg(
            isEnrolled
                ? `Course ${courseCode} dropped successfully.`
                : `✓ Successfully registered & enrolled in ${courseCode}!`
        );
        setTimeout(() => setEnrollSuccessMsg(""), 3500);
    };

    // Filter notices targeted for All or Students
    const studentNotices = notices.filter(
        (n) => n.audience === "All" || n.audience === "Students" || !n.audience
    );

    const filteredNotices = studentNotices.filter((n) => {
        if (noticeFilter === "All") return true;
        return n.category?.toLowerCase() === noticeFilter.toLowerCase();
    });

    // Approved Alumni from same institution
    const alumniList = allUsers.filter(
        (u) => (u.role === "alumni" || u.session?.includes("Pass") || u.status === "graduated") && u.status !== "rejected"
    );

    // Dynamic Results for this specific student roll (No fake data!)
    const myResults = results.filter((r) => {
        const myId = currentUser?.studentId?.toLowerCase();
        const myName = (currentUser?.fullName || currentUser?.name)?.toLowerCase();
        return (
            (myId && r.studentId?.toLowerCase() === myId) ||
            (myName && r.studentName?.toLowerCase() === myName)
        );
    });

    // Dynamic CGPA & SGPA calculation from published results:
    const totalGradePoints = myResults.length > 0
        ? myResults.reduce((acc, curr) => acc + (Number(curr.gradePoint) || 0) * (Number(curr.credits) || 3), 0)
        : 0;
    const totalResultCredits = myResults.length > 0
        ? myResults.reduce((acc, curr) => acc + (Number(curr.credits) || 3), 0)
        : 0;
    const currentSGPA = totalResultCredits > 0
        ? (totalGradePoints / totalResultCredits).toFixed(2)
        : null;

    // Handle Fee Payment Submission (Simulating SSLCommerz Gateway)
    const handlePayFee = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        setTimeout(() => {
            const newTrx = {
                trxId: `TXN-SSL-${Date.now().toString().slice(-6)}`,
                studentName: currentUser?.fullName || currentUser?.name || "Student",
                studentId: currentUser?.studentId || "2024-ICE-001",
                department: currentUser?.department || "ICE",
                session: currentUser?.session || settings.session,
                amount: semesterFeeAmount,
                method: `${paymentMethod} (SSLCommerz)`,
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                status: "Paid",
            };

            const updatedPayments = [...payments, newTrx];
            setPayments(updatedPayments);
            localStorage.setItem("portal_payments", JSON.stringify(updatedPayments));

            // Sync with MongoDB Atlas
            try {
                apiRequest("/academic/payments", "POST", newTrx).catch(console.warn);
            } catch (err) {
                console.warn("Payment sync error:", err);
            }

            setIsProcessing(false);
            setShowPayModal(false);
            setPaymentSuccess(true);
            setSelectedReceipt(newTrx); // Open Money Receipt right away!
            setTimeout(() => setPaymentSuccess(false), 5000);
        }, 1200);
    };

    // Handle Borrow Book
    const handleBorrowBook = (book) => {
        if (borrowedBooks.some((b) => b.id === book.id)) {
            setLibraryNotice(`You have already borrowed "${book.title}".`);
            setTimeout(() => setLibraryNotice(""), 3500);
            return;
        }

        const newBorrow = {
            id: book.id,
            title: book.title,
            author: book.author,
            issueDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: "Issued",
        };

        const updated = [...borrowedBooks, newBorrow];
        setBorrowedBooks(updated);
        localStorage.setItem("portal_student_books", JSON.stringify(updated));

        // Decrement copies in catalog
        const updatedCatalog = libraryCatalog.map((b) => {
            if (b.id === book.id) {
                return { ...b, copies: Math.max(0, (Number(b.copies) || 1) - 1) };
            }
            return b;
        });
        setLibraryCatalog(updatedCatalog);
        localStorage.setItem("portal_library_books", JSON.stringify(updatedCatalog));

        setLibraryNotice(`Book "${book.title}" successfully issued! Return due date is in 14 days.`);
        setTimeout(() => setLibraryNotice(""), 4000);
    };

    // Handle Return Book
    const handleReturnBook = (bookId) => {
        const bookToReturn = borrowedBooks.find((b) => b.id === bookId);
        const updated = borrowedBooks.filter((b) => b.id !== bookId);
        setBorrowedBooks(updated);
        localStorage.setItem("portal_student_books", JSON.stringify(updated));

        // Increment copies in catalog
        const updatedCatalog = libraryCatalog.map((b) => {
            if (b.id === bookId) {
                return { ...b, copies: (Number(b.copies) || 0) + 1 };
            }
            return b;
        });
        setLibraryCatalog(updatedCatalog);
        localStorage.setItem("portal_library_books", JSON.stringify(updatedCatalog));

        setLibraryNotice(`✓ Book "${bookToReturn?.title || 'Book'}" has been successfully returned to Central Library. Thank you!`);
        setTimeout(() => setLibraryNotice(""), 4500);
    };

    // Handle Renew Book
    const handleRenewBook = (bookId) => {
        const updated = borrowedBooks.map((b) => {
            if (b.id === bookId) {
                return {
                    ...b,
                    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                };
            }
            return b;
        });
        setBorrowedBooks(updated);
        localStorage.setItem("portal_student_books", JSON.stringify(updated));
        setLibraryNotice("Book loan renewed for an additional 21 days.");
        setTimeout(() => setLibraryNotice(""), 3500);
    };

    // Handle Mentorship Send
    const handleSendMentorship = (e) => {
        e.preventDefault();
        if (!mentorshipMsg.trim() || !mentorshipModalAlumni) return;

        const newRequest = {
            id: `MR-${Date.now()}`,
            studentId: currentUser?.studentId || "Student",
            studentName: currentUser?.fullName || currentUser?.name || "Student",
            studentEmail: currentUser?.email || "student@ice.edu.bd",
            studentDept: currentUser?.department || "ICE",
            alumniId: mentorshipModalAlumni.id,
            alumniName: mentorshipModalAlumni.fullName || mentorshipModalAlumni.name,
            alumniEmail: mentorshipModalAlumni.email,
            message: mentorshipMsg,
            status: "pending",
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };

        const existing = JSON.parse(localStorage.getItem("portal_mentorship_requests") || "[]");
        const updated = [newRequest, ...existing];
        localStorage.setItem("portal_mentorship_requests", JSON.stringify(updated));

        setMentorshipSuccess(true);
        setTimeout(() => {
            setMentorshipSuccess(false);
            setMentorshipModalAlumni(null);
            setMentorshipMsg("");
        }, 2200);
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleLogout = () => {
        localStorage.removeItem("portal_current_user");
        router.push("/login");
    };

    // Navigation Items
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "academics", label: "My Courses", icon: GraduationCap, count: myCourses.length },
        { id: "exams", label: "Exams & Results", icon: Award },
        { id: "payments", label: "Fee Payments", icon: CreditCard, badge: isFeeFullyPaid ? "Paid" : isPartialPaid ? "Partial" : "Due" },
        { id: "library", label: "Central Library", icon: BookOpen, count: borrowedBooks.length },
        { id: "notices", label: "Notice Board", icon: Bell, count: studentNotices.length },
        { id: "alumni", label: "Alumni Network", icon: Users },
    ];

    return (
        <div className="w-full min-h-screen bg-[#F5F6FC] flex justify-center items-center">
            <div className="w-full max-w-[1920px] h-screen max-h-[960px] bg-[#F5F6FC] flex font-sans antialiased text-slate-800 overflow-hidden relative shadow-sm">
                {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                />
            )}

            {/* ===================== SIDEBAR ===================== */}
            <aside
                className={`fixed lg:sticky top-0 h-full z-50 w-64 shrink-0 bg-gradient-to-b from-[#1E1B4B] via-[#312E81] to-[#1E1B4B] text-white flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div>
                    {/* Header */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center shadow-inner">
                                <GraduationCap className="w-5 h-5 text-indigo-300" />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-base tracking-wider leading-tight">ICE PORTAL</h2>
                                <p className="text-[10px] text-indigo-200/70 uppercase tracking-widest font-semibold">Student Control Panel</p>
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
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                                            : "text-indigo-100/80 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-indigo-300/70"}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                            item.badge === "Paid" ? "bg-emerald-400 text-slate-900" : "bg-amber-400 text-slate-900"
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                    {item.count !== undefined && !item.badge && (
                                        <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Real Student Profile Card (Dynamic with ID Card Quick Trigger) */}
                <div className="p-4 border-t border-white/10 m-3 bg-white/5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-md shrink-0">
                            {(currentUser?.fullName || currentUser?.name || "ST").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-white truncate">{currentUser?.fullName || currentUser?.name || "Student"}</h4>
                            <p className="text-[10px] text-indigo-200/80 truncate">ID: {currentUser?.studentId || "2024-ICE-001"}</p>
                            <p className="text-[9px] text-amber-300/90 font-semibold truncate">{currentUser?.session || "Session: 2024-2025"}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowIdCardModal(true)}
                        className="w-full py-1.5 bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/30 text-indigo-100 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <QrCode className="w-3 h-3 text-indigo-300" />
                        <span>View Digital ID Card</span>
                    </button>
                </div>
            </aside>

            {/* ===================== MAIN CONTENT ===================== */}
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
                                    placeholder="Search courses, library books, exam routines..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <button
                                onClick={() => setActiveTab("notices")}
                                className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                title="University Notices"
                            >
                                <Bell className="w-4 h-4" />
                                {studentNotices.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
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
                <div className="bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#1E1B4B] text-white text-xs font-medium py-2 px-4 sm:px-8 border-b border-indigo-900/40 overflow-hidden shadow-xs">
                    <div className="w-full flex items-center">
                        <div className="flex items-center gap-1.5 bg-rose-600 text-white font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider shrink-0 z-10 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            <span>Notice</span>
                        </div>

                        <div className="overflow-hidden whitespace-nowrap w-full ml-4 relative">
                            <div className="inline-block animate-marquee hover:[animation-play-state:paused] cursor-pointer">
                                {studentNotices.length > 0 ? (
                                    studentNotices.map((n, idx) => (
                                        <span key={n._id || n.id || `noticespan-${idx}`} className="mx-6 inline-flex items-center gap-2 text-indigo-100 hover:text-white">
                                            <span className="text-amber-400 font-bold">[{n.category}]</span>
                                            <span className="font-semibold text-white">{n.title}:</span>
                                            <span className="text-indigo-200">{n.content.slice(0, 90)}...</span>
                                            <span className="text-indigo-400 text-[10px]">({n.date})</span>
                                            <span className="text-indigo-600 font-black ml-4">•</span>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-indigo-200">
                                        📢 Welcome to Imperial College of Engineering • Official Student Portal • Semester tuition payment & exam routine active.
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

                {/* ================= DASHBOARD MAIN BODY ================= */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
                    {/* Welcome Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <span>Welcome, {currentUser?.fullName || currentUser?.name || "Student"}!</span>
                                <span className="text-2xl">👋</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                {currentUser?.department || "ICE"} Department • Session {currentUser?.session || "2024-2025"} ({currentUser?.standing || "1st Year"}) • ID: {currentUser?.studentId || "N/A"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowIdCardModal(true)}
                                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Digital ID Card</span>
                            </button>
                            <span className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl shadow-2xs">
                                Term: {settings.currentSemester}
                            </span>
                        </div>
                    </div>

                    {paymentSuccess && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>Congratulations! Your semester fee payment was successful via SSLCommerz.</span>
                            </div>
                            {latestPayment && (
                                <button
                                    onClick={() => setSelectedReceipt(latestPayment)}
                                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-bold cursor-pointer"
                                >
                                    View Receipt
                                </button>
                            )}
                        </div>
                    )}

                    {/* ================= TAB 1: MAIN DASHBOARD VIEW ================= */}
                    {activeTab === "dashboard" && (
                        <>
                            {/* 2 HERO BANNERS (PAY FEES & ROUTINE) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* 1. Pay Fees Banner (Real BDT ৳ & Dynamic Partial / Category Tracking) */}
                                <div className={`rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[175px] ${
                                    isFeeFullyPaid
                                        ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 shadow-emerald-600/25"
                                        : "bg-gradient-to-r from-[#3B4BE8] via-[#485FE9] to-[#604AEB] shadow-indigo-600/25"
                                }`}>
                                    <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                                                {isFeeFullyPaid
                                                    ? "Semester Fee Cleared ✓"
                                                    : isPartialPaid
                                                    ? `Partial Paid • ৳${currentSemTuitionPaid.toLocaleString()} / ৳${semesterFeeTarget.toLocaleString()}`
                                                    : "Semester Dues Pending"}
                                            </span>
                                            <span className="text-xs font-semibold text-white/90 flex items-center gap-1">
                                                <Shield className="w-3.5 h-3.5" /> SSLCommerz Verified
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black mt-3 tracking-tight">
                                            {isFeeFullyPaid
                                                ? `Tuition Fee Paid (৳${currentSemTuitionPaid.toLocaleString()})`
                                                : isPartialPaid
                                                ? `৳${currentSemDue.toLocaleString()} Due for ${currentSemesterName}`
                                                : "Pay Fees Online"}
                                        </h3>
                                        <p className="text-xs text-white/90 mt-1">
                                            {isFeeFullyPaid
                                                ? `Semester tuition is fully cleared for ${currentSemesterName}. Official receipts available.`
                                                : isPartialPaid
                                                ? `Partial payment recorded. You can pay the remaining ৳${currentSemDue.toLocaleString()} anytime in installments.`
                                                : "Pay partial amount (e.g. ৳13,000) or clear full fee with instant official receipt."}
                                        </p>
                                    </div>

                                    <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <span className="text-[10px] text-white/80 block uppercase font-bold">
                                                {isFeeFullyPaid ? "Total Paid This Semester" : "Remaining Due Amount"}
                                            </span>
                                            <span className="text-2xl font-black">
                                                ৳{isFeeFullyPaid ? currentSemTuitionPaid.toLocaleString() : currentSemDue.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {latestPayment && (
                                                <button
                                                    onClick={() => setSelectedReceipt(latestPayment)}
                                                    className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl backdrop-blur-md transition cursor-pointer flex items-center gap-1.5 active:scale-95 border border-white/20"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                    <span>Receipt</span>
                                                </button>
                                            )}
                                            {!isFeeFullyPaid ? (
                                                <button
                                                    onClick={() => {
                                                        setPayCategory("Semester Tuition Fee");
                                                        setPayModalAmount(currentSemDue);
                                                        setShowPayModal(true);
                                                    }}
                                                    className="px-5 py-2.5 bg-white text-indigo-700 font-extrabold text-xs rounded-xl shadow-md hover:bg-blue-50 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                                                >
                                                    <span>Pay Due ৳{currentSemDue.toLocaleString()}</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setPayCategory("Monthly Fee");
                                                        setPayModalAmount(4200);
                                                        setShowPayModal(true);
                                                    }}
                                                    className="px-5 py-2.5 bg-white text-emerald-800 font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                                                >
                                                    <span>+ Pay Other Fee</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Class Routine & Exams Banner */}
                                <div className="bg-gradient-to-r from-[#0D9488] via-[#14B8A6] to-[#06B6D4] rounded-3xl p-6 text-white shadow-xl shadow-teal-600/25 relative overflow-hidden flex flex-col justify-between min-h-[175px]">
                                    <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                                                Academic Schedule
                                            </span>
                                            <span className="text-xs font-semibold text-teal-100 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" /> Next: 10:00 AM
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black mt-3 tracking-tight">Examinations & Routine</h3>
                                        <p className="text-xs text-teal-100/90 mt-1">Official Final Routine Published & Admit Card Ready</p>
                                    </div>

                                    <div className="relative z-10 pt-4 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-teal-200 block uppercase font-bold">Upcoming</span>
                                            <span className="text-sm font-extrabold">Final Exam Dec 05</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowAdmitCardModal(true)}
                                                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs rounded-xl transition cursor-pointer backdrop-blur-sm"
                                            >
                                                Admit Card
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("exams")}
                                                className="px-4 py-2.5 bg-white text-teal-800 font-extrabold text-xs rounded-xl shadow-md hover:bg-teal-50 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                                            >
                                                <span>Results & Schedule</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4 SUMMARY STAT CARDS */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Enrolled Courses</span>
                                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 mt-2">{myCourses.length}</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{totalCredits} Total Credit Hours</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Current CGPA</span>
                                        <Award className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 mt-2">
                                        {currentSGPA ? (
                                            <>{currentSGPA} <span className="text-xs font-normal text-slate-400">/ 4.00</span></>
                                        ) : (
                                            <span className="text-sm font-semibold text-slate-400">Pending Exam</span>
                                        )}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        {currentSGPA ? `Cleared ${totalResultCredits} Credits` : "No results published yet"}
                                    </p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Class Attendance</span>
                                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 mt-2">92%</h4>
                                    <p className="text-[11px] text-teal-600 font-bold mt-0.5">Eligible for Final Exam</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Library Books</span>
                                        <BookOpen className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 mt-2">{borrowedBooks.length} Active</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">No overdue fines</p>
                                </div>
                            </div>

                            {/* ================= ENROLLED COURSES SECTION ================= */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                                        My Enrolled Courses ({myCourses.length})
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab("academics")}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                    >
                                        View Curriculum ➔
                                    </button>
                                </div>

                                {myCourses.length === 0 ? (
                                    <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-center text-slate-400 space-y-3">
                                        <GraduationCap className="w-10 h-10 mx-auto opacity-40 text-indigo-600" />
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">No courses enrolled yet</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Explore offered university courses and enroll in your semester subjects.</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("academics")}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                                        >
                                            Browse & Enroll in Courses ➔
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {myCourses.slice(0, 4).map((c, idx) => (
                                            <div
                                                key={c._id || c.id || c.code || `topcourse-${idx}`}
                                                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition"
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                                                            {c.code}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                            {c.credits} Cr
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">{c.room || "Room 402"}</span>
                                                    </div>
                                                    <h3 className="font-extrabold text-base text-slate-800 leading-tight">
                                                        {c.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        Instructor: <strong className="text-indigo-700">{c.instructor}</strong>
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => setSelectedCourseDetail(c)}
                                                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 text-xs font-bold transition cursor-pointer"
                                                    title="View Course Details"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ================= UPCOMING EXAMINATIONS ROUTINE ================= */}
                            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-indigo-600" />
                                            <h3 className="font-extrabold text-base text-slate-900">
                                                Semester Final Examination Routine — {settings.currentSemester || "Spring 2026"}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Verified routine approved by Controller of Examinations. Hall allocations and invigilation assigned.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowAdmitCardModal(true)}
                                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Download Admit Card</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("exams")}
                                            className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
                                        >
                                            Full Schedule ➔
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="py-3 px-5">Date & Time</th>
                                                <th className="py-3 px-4">Course Code & Title</th>
                                                <th className="py-3 px-4">Exam Hall</th>
                                                <th className="py-3 px-4">Chief Invigilator</th>
                                                <th className="py-3 px-5 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(examRoutines.length > 0 ? examRoutines : EXAM_ROUTINE).slice(0, 4).map((ex, idx) => (
                                                <tr key={`dash-exam-${ex.code || idx}-${idx}`} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3.5 px-5">
                                                        <div className="font-extrabold text-slate-900">{ex.date}</div>
                                                        <div className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{ex.time}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-slate-800">{ex.course}</div>
                                                        <div className="font-mono text-indigo-700 font-bold text-[11px]">{ex.code}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-bold text-slate-700">
                                                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium">
                                                            {ex.room || "Exam Hall 1"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-600">
                                                        {ex.invigilator || "Department Faculty"}
                                                    </td>
                                                    <td className="py-3.5 px-5 text-right">
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                            <span>Admit Ready</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ================= CENTRAL LIBRARY QUICK SUMMARY ================= */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-indigo-600" />
                                            <span>Central Library Lending Status</span>
                                        </h3>
                                        <p className="text-xs text-slate-400">Book lending, reservations & digital journals</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500">
                                            Borrowed: <strong className="text-slate-800 font-extrabold">{borrowedBooks.length} Book(s)</strong>
                                        </span>
                                        <button
                                            onClick={() => setActiveTab("library")}
                                            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition cursor-pointer"
                                        >
                                            Browse Catalog ➔
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 divide-y divide-slate-100">
                                    {borrowedBooks.map((b, idx) => (
                                        <div key={b._id || b.id || b.isbn || `borrowbox-${idx}`} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="text-xs text-slate-600 space-y-0.5">
                                                <div className="font-bold text-slate-800">&quot;{b.title}&quot; — <span className="font-normal text-slate-500">{b.author}</span></div>
                                                <div className="text-[11px] text-amber-600 font-medium">Return Due Date: {b.dueDate}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleRenewBook(b.id)}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 w-fit"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                    <span>Renew</span>
                                                </button>
                                                <button
                                                    onClick={() => handleReturnBook(b.id)}
                                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 w-fit"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    <span>Return Book</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ================= RECENT NOTICES & CIRCULARS ================= */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <h3 className="font-extrabold text-base text-slate-900">
                                                Official Campus Announcements & Circulars
                                            </h3>
                                            <p className="text-xs text-slate-400">Departmental circulars, academic notices and institutional events</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab("notices")}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer self-start sm:self-auto"
                                    >
                                        View All Notices ({studentNotices.length}) ➔
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {studentNotices.slice(0, 3).map((notice, idx) => (
                                        <div
                                            key={notice._id || notice.id || `dashnot-${idx}`}
                                            className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between gap-3"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                                                        {notice.category}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {notice.date}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                                                    {notice.title}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                    {notice.content}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab("notices")}
                                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start cursor-pointer"
                                            >
                                                <span>Read Circular</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ================= QUICK ACADEMIC SERVICES GRID ================= */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <button
                                    onClick={() => setActiveTab("academics")}
                                    className="p-5 bg-white border border-slate-200/80 rounded-2xl text-left hover:border-indigo-500 hover:shadow-md transition cursor-pointer space-y-2"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <BookMarked className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900">Curriculum & Syllabus</h4>
                                    <p className="text-[11px] text-slate-400">Download theory & lab modules</p>
                                </button>

                                <button
                                    onClick={() => setShowAdmitCardModal(true)}
                                    className="p-5 bg-white border border-slate-200/80 rounded-2xl text-left hover:border-indigo-500 hover:shadow-md transition cursor-pointer space-y-2"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                        <FileCheck className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900">Official Admit Card</h4>
                                    <p className="text-[11px] text-slate-400">Exam entry permit with QR code</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab("library")}
                                    className="p-5 bg-white border border-slate-200/80 rounded-2xl text-left hover:border-indigo-500 hover:shadow-md transition cursor-pointer space-y-2"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900">E-Library Catalog</h4>
                                    <p className="text-[11px] text-slate-400">Browse {libraryCatalog.length} engineering books</p>
                                </button>

                                <button
                                    onClick={() => {
                                        setPayCategory("Semester Tuition Fee");
                                        setPayModalAmount(currentSemDue || 25000);
                                        setShowPayModal(true);
                                    }}
                                    className="p-5 bg-white border border-slate-200/80 rounded-2xl text-left hover:border-indigo-500 hover:shadow-md transition cursor-pointer space-y-2"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900">Tuition & Fees</h4>
                                    <p className="text-[11px] text-slate-400">Instant SSLCommerz clearance</p>
                                </button>
                            </div>
                        </>
                    )}

                    {/* ================= TAB 2: ACADEMICS / ALL COURSES ================= */}
                    {activeTab === "academics" && (
                        <div className="space-y-6">
                            {enrollSuccessMsg && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{enrollSuccessMsg}</span>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Academic Curriculum & Syllabus
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Registered Courses, Class Routine & Assigned Faculty for {currentUser?.department || "Engineering"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200 text-xs w-fit">
                                        {myCourses.length} Enrolled Courses ({totalCredits} Credits)
                                    </span>
                                </div>
                            </div>

                            {/* Enrolled Courses Table */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                                        My Active Registered Curriculum
                                    </h3>
                                    <span className="text-xs text-slate-500">Department: <strong>{currentUser?.department || "All"}</strong></span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="py-3 px-4">Course Code</th>
                                                <th className="py-3 px-3">Title</th>
                                                <th className="py-3 px-3">Semester</th>
                                                <th className="py-3 px-3">Credits</th>
                                                <th className="py-3 px-3">Schedule & Room</th>
                                                <th className="py-3 px-3">Faculty Instructor</th>
                                                <th className="py-3 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {myCourses.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="py-12 text-center text-slate-400">
                                                        No courses assigned yet. Courses added by Admin will appear here.
                                                    </td>
                                                </tr>
                                            ) : (
                                                myCourses.map((c, idx) => {
                                                    const isExplicit = myEnrolledCodes.includes(c.code) || myEnrolledCodes.includes(c.id);
                                                    return (
                                                        <tr key={c._id || c.id || c.code || `mycourse-${idx}`} className="hover:bg-slate-50/70 transition">
                                                            <td className="py-3 px-4 font-mono font-bold text-indigo-600">{c.code}</td>
                                                            <td className="py-3 px-3 font-semibold text-slate-800">{c.name}</td>
                                                            <td className="py-3 px-3 text-slate-600">{c.semester || "1/1"}</td>
                                                            <td className="py-3 px-3 font-bold text-slate-700">{c.credits} Cr</td>
                                                            <td className="py-3 px-3 text-slate-600">{c.schedule || "Sun, Tue 10:00 AM"} • {c.room || "Room 402"}</td>
                                                            <td className="py-3 px-3">
                                                                <span className="font-semibold text-emerald-700">👨‍🏫 {c.instructor}</span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                                                                <button
                                                                    onClick={() => setSelectedCourseDetail(c)}
                                                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition cursor-pointer"
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleEnrollCourse(c.code)}
                                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                                        isExplicit
                                                                            ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                                                                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                                    }`}
                                                                >
                                                                    {isExplicit ? "Drop Course" : "Registered ✓"}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* All Offered Campus Courses for Registration */}
                            {courses.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                                                All University Offered Courses (Semester Course Registration)
                                            </h3>
                                            <p className="text-[11px] text-slate-400">Enroll or add cross-departmental & open elective engineering modules</p>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-lg">
                                            {courses.length} Available Subjects
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="py-3 px-4">Code</th>
                                                    <th className="py-3 px-3">Subject Name</th>
                                                    <th className="py-3 px-3">Department</th>
                                                    <th className="py-3 px-3">Semester</th>
                                                    <th className="py-3 px-3">Credits</th>
                                                    <th className="py-3 px-3">Faculty Instructor</th>
                                                    <th className="py-3 px-4 text-right">Registration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {courses.map((c, idx) => {
                                                    const isEnrolled = myEnrolledCodes.includes(c.code) || myEnrolledCodes.includes(c.id);
                                                    return (
                                                        <tr key={c._id || c.id || c.code || `allcourse-${idx}`} className="hover:bg-slate-50/70 transition">
                                                            <td className="py-3 px-4 font-mono font-bold text-indigo-700">{c.code}</td>
                                                            <td className="py-3 px-3 font-semibold text-slate-800">{c.name}</td>
                                                            <td className="py-3 px-3 font-bold text-slate-600">{c.department || "General"}</td>
                                                            <td className="py-3 px-3 text-slate-600">{c.semester || "1/1"}</td>
                                                            <td className="py-3 px-3 font-bold text-slate-700">{c.credits} Cr</td>
                                                            <td className="py-3 px-3 text-emerald-700 font-semibold">{c.instructor}</td>
                                                            <td className="py-3 px-4 text-right">
                                                                <button
                                                                    onClick={() => handleToggleEnrollCourse(c.code)}
                                                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
                                                                        isEnrolled
                                                                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                                                                    }`}
                                                                >
                                                                    {isEnrolled ? "✓ Enrolled" : "+ Enroll Course"}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ================= TAB 3: EXAMS & RESULTS ================= */}
                    {activeTab === "exams" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Exams, Schedules & Academic Results
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Semester Final Exam Routine, Marks Breakdown & Official Marksheet
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAdmitCardModal(true)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer w-fit"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Download Admit Card</span>
                                </button>
                            </div>

                            {/* Semester Final Examination Schedule */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-indigo-600" />
                                        <span>Semester Final Examination Routine ({settings.currentSemester})</span>
                                    </h3>
                                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                                        Starts Dec 05, 2026
                                    </span>
                                </div>
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-white text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4">Exam Date</th>
                                            <th className="py-3 px-3">Time</th>
                                            <th className="py-3 px-3">Course Code</th>
                                            <th className="py-3 px-3">Subject Title</th>
                                            <th className="py-3 px-3">Room / Hall</th>
                                            <th className="py-3 px-3">Invigilator</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {examRoutines.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-10 text-center text-slate-400">
                                                    No semester final examination routine published yet. Waiting for Exam Controller.
                                                </td>
                                            </tr>
                                        ) : (
                                            examRoutines.map((ex, idx) => (
                                                <tr key={ex._id || ex.id || ex.code || `routine-${idx}`} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3 px-4 font-bold text-slate-800">{ex.date}</td>
                                                    <td className="py-3 px-3 font-mono text-slate-600">{ex.time}</td>
                                                    <td className="py-3 px-3 font-mono font-bold text-indigo-600">{ex.code}</td>
                                                    <td className="py-3 px-3 font-semibold text-slate-800">{ex.name || ex.course}</td>
                                                    <td className="py-3 px-3 text-slate-700 font-medium">{ex.room}</td>
                                                    <td className="py-3 px-3 text-slate-500">{ex.invigilator}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Semester Result & Grades Transcript */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-amber-500" />
                                            <span>Previous Semester Academic Transcript (Grade Sheet)</span>
                                        </h3>
                                        <p className="text-[11px] text-slate-500">Official CGPA: {currentSGPA} (Completed Credits: {totalResultCredits})</p>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl">
                                        Passed with Honors
                                    </span>
                                </div>
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-white text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4">Course Code</th>
                                            <th className="py-3 px-3">Course Title</th>
                                            <th className="py-3 px-3">Semester</th>
                                            <th className="py-3 px-3">Credits</th>
                                            <th className="py-3 px-3">Marks</th>
                                            <th className="py-3 px-3">Letter Grade</th>
                                            <th className="py-3 px-3">Grade Point</th>
                                            <th className="py-3 px-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {myResults.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="py-12 text-center text-slate-400">
                                                    <Award className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-500" />
                                                    <p className="font-bold text-sm text-slate-700">No examination results published for Roll: {currentUser?.studentId || "Your ID"} yet.</p>
                                                    <p className="text-xs text-slate-400 mt-1">Official semester results will appear here once published by the Admin / Exam Controller.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            myResults.map((res, idx) => (
                                                <tr key={res._id || res.id || res.courseCode || res.code || `res-${idx}`} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{res.courseCode || res.code}</td>
                                                    <td className="py-3 px-3 font-semibold text-slate-800">{res.subjectTitle || res.name}</td>
                                                    <td className="py-3 px-3 font-bold text-indigo-700">{res.semester || "1/1"}</td>
                                                    <td className="py-3 px-3 font-bold text-slate-700">{res.credits} Cr</td>
                                                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{res.marks ?? "-"}</td>
                                                    <td className="py-3 px-3 font-black text-slate-900">
                                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                                                            {res.grade}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 font-mono font-bold text-emerald-600">{Number(res.gradePoint).toFixed(2)}</td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                            Cleared
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

                    {/* ================= TAB 4: FEE PAYMENTS & SLIPS ================= */}
                    {activeTab === "payments" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Tuition Fee Payments & Multi-Year Accounts
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Complete 4-Year Academic Ledger, Fee Categories, Yearly Totals & Digital Money Vouchers
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setPayCategory("Semester Tuition Fee");
                                            setPayModalAmount(currentSemDue > 0 ? currentSemDue : 25000);
                                            setShowPayModal(true);
                                        }}
                                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        <span>+ Make a Payment (Pay Fee)</span>
                                    </button>
                                </div>
                            </div>

                            {/* 4 Financial Metric Cards (Semester, Yearly, 4-Year Lifetime, Total Slips) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Current Semester ({currentSemesterName})
                                    </span>
                                    <h3 className="text-2xl font-black text-indigo-700">
                                        ৳{currentSemTuitionPaid.toLocaleString()}
                                    </h3>
                                    <p className="text-[11px] font-medium text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                                        <span>Target: ৳{semesterFeeTarget.toLocaleString()}</span>
                                        <span className={`font-bold ${currentSemDue > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                                            {currentSemDue > 0 ? `Due: ৳${currentSemDue.toLocaleString()}` : "Cleared ✓"}
                                        </span>
                                    </p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Yearly Total Paid ({currentYear})
                                    </span>
                                    <h3 className="text-2xl font-black text-emerald-600">
                                        ৳{yearlyTotalPaid.toLocaleString()}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                        Annual Total for Calendar Year {currentYear}
                                    </p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        4-Year Degree Cumulative Paid
                                    </span>
                                    <h3 className="text-2xl font-black text-blue-700">
                                        ৳{lifetimeTotalPaid.toLocaleString()}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                        All Semesters Lifetime Academic Total
                                    </p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Verified Vouchers
                                    </span>
                                    <h3 className="text-2xl font-black text-slate-800">
                                        {myPayments.length}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                        Official Downloadable Money Receipts
                                    </p>
                                </div>
                            </div>

                            {/* Categorized Financial Breakdown */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                    <span>📊 Fee Category Financial Breakdown:</span>
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                                        <p className="text-[10px] font-bold text-indigo-700 uppercase">🎓 Semester Tuition</p>
                                        <p className="text-base font-black text-indigo-950 mt-0.5">৳{feeCategoryBreakdown.tuition.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                                        <p className="text-[10px] font-bold text-blue-700 uppercase">📅 Monthly Fees</p>
                                        <p className="text-base font-black text-blue-950 mt-0.5">৳{feeCategoryBreakdown.monthly.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                                        <p className="text-[10px] font-bold text-amber-700 uppercase">📝 Mid-Term Exam</p>
                                        <p className="text-base font-black text-amber-950 mt-0.5">৳{feeCategoryBreakdown.midExam.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                                        <p className="text-[10px] font-bold text-teal-700 uppercase">📑 Final Exam</p>
                                        <p className="text-base font-black text-teal-950 mt-0.5">৳{feeCategoryBreakdown.finalExam.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                                        <p className="text-[10px] font-bold text-purple-700 uppercase">🔬 Lab & Library</p>
                                        <p className="text-base font-black text-purple-950 mt-0.5">৳{feeCategoryBreakdown.labLibrary.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                                        <p className="text-[10px] font-bold text-slate-700 uppercase">💼 Other Fees</p>
                                        <p className="text-base font-black text-slate-900 mt-0.5">৳{feeCategoryBreakdown.other.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* My Payments History Table */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                                        All Transaction Slips & Vouchers ({myPayments.length})
                                    </h4>
                                    <span className="text-[11px] text-slate-500">Auto-synced with Accounting Division</span>
                                </div>
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4">Transaction ID</th>
                                            <th className="py-3 px-3">Date</th>
                                            <th className="py-3 px-3">Fee Category</th>
                                            <th className="py-3 px-3">Semester</th>
                                            <th className="py-3 px-3">Method</th>
                                            <th className="py-3 px-3">Amount</th>
                                            <th className="py-3 px-3">Due Left</th>
                                            <th className="py-3 px-4 text-right">Official Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {myPayments.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="py-12 text-center text-slate-400">
                                                    No payments completed yet. Click &quot;+ Make a Payment&quot; to pay online.
                                                </td>
                                            </tr>
                                        ) : (
                                            myPayments.map((p, idx) => (
                                                <tr key={p.trxId || p._id || p.id || `pay-${idx}`} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{p.trxId}</td>
                                                    <td className="py-3 px-3 text-slate-600">{p.date}</td>
                                                    <td className="py-3 px-3 font-bold text-slate-800">
                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
                                                            {p.feeCategory || "Semester Tuition Fee"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 font-semibold text-slate-700">{p.semester || "1/1"}</td>
                                                    <td className="py-3 px-3 capitalize font-medium text-slate-700">{p.method}</td>
                                                    <td className="py-3 px-3 font-bold text-emerald-600">৳{Number(p.amount).toLocaleString()}</td>
                                                    <td className="py-3 px-3 font-bold text-slate-600">
                                                        {Number(p.dueRemaining || 0) > 0 ? (
                                                            <span className="text-amber-600">৳{Number(p.dueRemaining).toLocaleString()}</span>
                                                        ) : (
                                                            <span className="text-emerald-600">৳0 (Cleared)</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            onClick={() => setSelectedReceipt(p)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition cursor-pointer"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                            <span>Download Slip</span>
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

                    {/* ================= TAB 5: CENTRAL LIBRARY ================= */}
                    {activeTab === "library" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Central Campus Library
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Search textbooks, reserve reading materials & manage your issued books
                                    </p>
                                </div>
                                <div className="relative w-full sm:w-72">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search book title or author..."
                                        value={librarySearch}
                                        onChange={(e) => setLibrarySearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {libraryNotice && (
                                <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-xl animate-in fade-in flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>{libraryNotice}</span>
                                </div>
                            )}

                            {/* Active Loans */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                    <BookMarked className="w-4 h-4 text-indigo-600" />
                                    <span>My Currently Borrowed Books ({borrowedBooks.length})</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {borrowedBooks.map((b, idx) => (
                                        <div key={b._id || b.id || b.isbn || `bbook-${idx}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-xs text-slate-800">{b.title}</h4>
                                                <p className="text-[11px] text-slate-500">{b.author}</p>
                                                <div className="flex items-center gap-3 mt-2 text-[10px]">
                                                    <span className="text-slate-400">Issued: {b.issueDate}</span>
                                                    <span className="font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">Due: {b.dueDate}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleRenewBook(b.id)}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                    <span>Renew</span>
                                                </button>
                                                <button
                                                    onClick={() => handleReturnBook(b.id)}
                                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    <span>Return Book</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Book Catalogue Table */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                                <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
                                    Available Engineering & Science Books
                                </div>
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-white text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4">Book Title</th>
                                            <th className="py-3 px-3">Author(s)</th>
                                            <th className="py-3 px-3">Category</th>
                                            <th className="py-3 px-3">ISBN</th>
                                            <th className="py-3 px-3">Available Copies</th>
                                            <th className="py-3 px-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {libraryCatalog
                                            .filter(
                                                (b) =>
                                                    b.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
                                                    b.author.toLowerCase().includes(librarySearch.toLowerCase()) ||
                                                    b.category.toLowerCase().includes(librarySearch.toLowerCase())
                                            )
                                            .map((book, idx) => (
                                                <tr key={book._id || book.id || book.isbn || `catbook-${idx}`} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3 px-4 font-bold text-slate-800">{book.title}</td>
                                                    <td className="py-3 px-3 text-slate-600">{book.author}</td>
                                                    <td className="py-3 px-3">
                                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                                            {book.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{book.isbn}</td>
                                                    <td className="py-3 px-3">
                                                        <span className="font-bold text-emerald-600">{book.copies} Copies</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            onClick={() => handleBorrowBook(book)}
                                                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition cursor-pointer"
                                                        >
                                                            Borrow Book
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 6: NOTICE BOARD ================= */}
                    {activeTab === "notices" && (
                        <div className="space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Campus Notice Board
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Official notices, exam circulars & announcements published by the Registrar
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {["All", "Exam", "Academic", "Fee", "Holiday"].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setNoticeFilter(cat)}
                                            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                noticeFilter === cat
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredNotices.length === 0 ? (
                                    <div className="bg-white p-12 text-center text-slate-400 rounded-3xl border border-slate-200">
                                        <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-600" />
                                        <p className="font-bold text-sm text-slate-700">No notices in this category</p>
                                        <p className="text-xs text-slate-400 mt-1">Check back later for university updates.</p>
                                    </div>
                                ) : (
                                    filteredNotices.map((n, idx) => (
                                        <div key={n._id || n.id || `fnotice-${idx}`} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                                                        {n.category || "General"}
                                                    </span>
                                                    <span className="text-xs text-slate-400">• {n.date}</span>
                                                </div>
                                                <span className="text-[11px] text-slate-400">Audience: <strong>{n.audience || "All"}</strong></span>
                                            </div>
                                            <h3 className="font-extrabold text-base text-slate-900">{n.title}</h3>
                                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{n.content}</p>
                                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                                <span>Issued By: <strong>{n.author || "Office of the Registrar"}</strong></span>
                                                <span className="text-indigo-600 font-bold">Imperial College of Engineering</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 7: ALUMNI NETWORK & MENTORSHIP ================= */}
                    {activeTab === "alumni" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-1 cursor-pointer"
                                    >
                                        ← Back to Dashboard
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Alumni Mentorship & Career Network
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Connect with graduated engineers, explore job referrals, and request 1-on-1 industry mentorship
                                    </p>
                                </div>
                                <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200 text-xs w-fit">
                                    {alumniList.length} Registered Alumni • {alumniJobs.length} Job Referrals
                                </span>
                            </div>

                            {/* Section 1: Jobs & Internships Posted by Alumni */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                            <Award className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-sm text-slate-900">Alumni Job & Internship Referrals</h3>
                                            <p className="text-[11px] text-slate-400">Exclusive opportunities posted by ICE graduates for current students</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                        {alumniJobs.length} Open Positions
                                    </span>
                                </div>

                                {alumniJobs.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <p className="font-bold text-xs text-slate-600">No job openings posted at this moment</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">When alumni post openings from their companies, they will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {alumniJobs.map((job, idx) => (
                                            <div
                                                key={job._id || job.id || `job-${idx}`}
                                                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-indigo-200 hover:shadow-md transition flex flex-col justify-between gap-3"
                                            >
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md uppercase">
                                                            {job.type || "Full-Time"}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {job.date || "Recent"}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-sm text-slate-900">{job.title}</h4>
                                                    <div className="text-xs text-slate-500 space-y-0.5">
                                                        <div>🏢 <strong>{job.company}</strong> • 📍 {job.location || "Remote"}</div>
                                                        <div className="text-emerald-700 font-bold">💰 {job.salary || "Competitive"}</div>
                                                        <div className="text-[11px] text-slate-400">Referred by: {job.postedBy}</div>
                                                    </div>
                                                </div>

                                                <a
                                                    href={job.link || "#"}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition text-center inline-block cursor-pointer"
                                                >
                                                    Apply / View Referral ➔
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Mentorship Network */}
                            <div>
                                <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-indigo-600" />
                                    <span>Verified Alumni Mentors</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {alumniList.length === 0 ? (
                                        <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-3xl border border-slate-200">
                                            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-600" />
                                            <p className="font-bold text-sm text-slate-700">No alumni records yet</p>
                                            <p className="text-xs text-slate-400 mt-1">Graduated students who register as Alumni will appear here.</p>
                                        </div>
                                    ) : (
                                        alumniList.map((al, idx) => (
                                            <div key={al._id || al.id || al.email || `alumni-${idx}`} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                                                        {(al.fullName || al.name || "AL").slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-slate-900">{al.fullName || al.name}</h4>
                                                        <p className="text-xs text-indigo-600 font-semibold">{al.department || "Engineering"} • {al.session || "Alumni"}</p>
                                                        <p className="text-[10px] text-slate-400">{al.email}</p>
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                                                    <div><strong>Status:</strong> <span className="text-emerald-700 font-bold">Graduated / Alumni</span></div>
                                                    <div><strong>Available for:</strong> Resume Review, Tech Guidance</div>
                                                </div>

                                                <button
                                                    onClick={() => setMentorshipModalAlumni(al)}
                                                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 hover:border-transparent transition cursor-pointer flex items-center justify-center gap-1.5"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                    <span>Request Mentorship</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Institutional Dashboard Footer */}
                    <footer className="mt-8 pt-6 pb-2 border-t border-slate-200/80 text-center text-xs text-slate-400 space-y-1">
                        <p className="font-semibold text-slate-600">
                            Imperial College of Engineering (ICE) • Integrated Academic Information System
                        </p>
                        <p className="text-[11px] text-slate-400">
                            Campus: Upper Jessore Road, Khulna - 9000, Bangladesh • Student Support: helpdesk@ice.edu.bd • System Status: Operational
                        </p>
                    </footer>
                </main>
            </div>

            {/* ================= COURSE DETAILS MODAL ================= */}
            {selectedCourseDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                    {selectedCourseDetail.code}
                                </span>
                                <h3 className="font-extrabold text-lg text-slate-900 mt-1">{selectedCourseDetail.name}</h3>
                            </div>
                            <button onClick={() => setSelectedCourseDetail(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-slate-700">
                            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                                <div><strong>Credits:</strong> {selectedCourseDetail.credits} Cr</div>
                                <div><strong>Department:</strong> {selectedCourseDetail.department || "General"}</div>
                                <div><strong>Semester:</strong> {selectedCourseDetail.semester}</div>
                                <div><strong>Faculty:</strong> {selectedCourseDetail.instructor}</div>
                                <div><strong>Schedule:</strong> {selectedCourseDetail.schedule || "Regular Class Routine"}</div>
                                <div><strong>Room:</strong> {selectedCourseDetail.room || "Room 402"}</div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 mb-1">Course Description & Syllabus Highlights</h4>
                                <p className="text-slate-500 text-[11px] leading-relaxed">
                                    Comprehensive engineering curriculum covering foundational theoretical models, laboratory implementations, system architecture analysis, and final capstone project design.
                                </p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setSelectedCourseDetail(null)}
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= ALUMNI MENTORSHIP MODAL ================= */}
            {mentorshipModalAlumni && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-extrabold text-sm text-slate-900">Request Mentorship Guidance</h3>
                                <p className="text-[10px] text-slate-400">Connecting with {mentorshipModalAlumni.fullName || mentorshipModalAlumni.name}</p>
                            </div>
                            <button onClick={() => setMentorshipModalAlumni(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {mentorshipSuccess ? (
                            <div className="p-4 bg-emerald-50 text-emerald-800 text-center rounded-2xl space-y-2">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                                <h4 className="font-extrabold text-sm">Mentorship Request Sent!</h4>
                                <p className="text-xs">The alumni mentor has been notified. They will contact you at {currentUser?.email}.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendMentorship} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Topic / Career Query</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Hi senior, I am a junior student in ICE/CSE. I would love some guidance on internship prep and industry projects..."
                                        value={mentorshipMsg}
                                        onChange={(e) => setMentorshipMsg(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send Mentorship Request</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ================= PRINTABLE DIGITAL STUDENT ID CARD MODAL ================= */}
            {showIdCardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <QrCode className="w-4 h-4 text-indigo-600" />
                                Student Digital Identity Card
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintReceipt}
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                                >
                                    Print
                                </button>
                                <button onClick={() => setShowIdCardModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* ID Card Graphic View */}
                        <div id="printable-idcard" className="p-6 bg-gradient-to-b from-[#1E1B4B] via-[#312E81] to-[#1E1B4B] text-white rounded-2xl m-4 border-2 border-indigo-400/40 shadow-xl space-y-4 text-center">
                            <div className="border-b border-indigo-400/30 pb-3">
                                <h3 className="font-black text-sm tracking-wider uppercase">IMPERIAL COLLEGE OF ENGINEERING</h3>
                                <p className="text-[9px] text-indigo-200 tracking-widest uppercase">Student Identity Card</p>
                            </div>

                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-400 mx-auto flex items-center justify-center text-xl font-black text-white shadow-lg border-2 border-white/30">
                                {(currentUser?.fullName || currentUser?.name || "ST").slice(0, 2).toUpperCase()}
                            </div>

                            <div className="space-y-0.5">
                                <h2 className="text-base font-black text-white">{currentUser?.fullName || currentUser?.name || "Student"}</h2>
                                <p className="text-xs font-mono font-bold text-amber-300">ID: {currentUser?.studentId || "2024-ICE-042"}</p>
                            </div>

                            <div className="p-3 bg-white/10 rounded-xl text-left text-[10px] space-y-1 backdrop-blur-xs">
                                <div><strong className="text-indigo-200">Department:</strong> {currentUser?.department || "ICE"}</div>
                                <div><strong className="text-indigo-200">Session:</strong> {currentUser?.session || "2024-2025"} ({currentUser?.standing || "1st Year"})</div>
                                <div><strong className="text-indigo-200">Blood Group:</strong> {currentUser?.bloodGroup || "B+"}</div>
                                <div><strong className="text-indigo-200">Validity:</strong> Dec 2028</div>
                            </div>

                            <div className="pt-2 border-t border-indigo-400/30 flex items-center justify-between text-[8px] text-indigo-200">
                                <span>Registrar Authorized</span>
                                <span className="font-mono">ICE-SECURE-ID</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= PRINTABLE EXAM ADMIT CARD MODAL ================= */}
            {showAdmitCardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <FileCheck className="w-4 h-4 text-emerald-600" />
                                Official Semester Examination Admit Card
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintReceipt}
                                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                                >
                                    Print / Download PDF
                                </button>
                                <button onClick={() => setShowAdmitCardModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div id="printable-admit-card" className="p-8 space-y-6 bg-white text-slate-800">
                            <div className="text-center border-b-2 border-slate-900 pb-4">
                                <h2 className="text-lg font-black uppercase text-slate-900">IMPERIAL COLLEGE OF ENGINEERING</h2>
                                <p className="text-xs font-bold text-slate-600 uppercase">Office of the Controller of Examinations</p>
                                <p className="text-[11px] font-extrabold text-indigo-700 uppercase mt-1">SEMESTER FINAL EXAMINATION ADMIT CARD • {settings.currentSemester}</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Candidate Name</p><p className="font-bold text-slate-900">{currentUser?.fullName || currentUser?.name || "Student"}</p></div>
                                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Roll / Student ID</p><p className="font-mono font-bold text-indigo-700">{currentUser?.studentId || "2024-ICE-042"}</p></div>
                                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Department</p><p className="font-bold text-slate-900">{currentUser?.department || "ICE"}</p></div>
                                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Session</p><p className="font-bold text-slate-900">{currentUser?.session || "2024-2025"}</p></div>
                            </div>

                            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                                    <tr>
                                        <th className="py-2.5 px-3">SL</th>
                                        <th className="py-2.5 px-3">Course Code & Title</th>
                                        <th className="py-2.5 px-3">Exam Date</th>
                                        <th className="py-2.5 px-3 text-right">Invigilator Sign</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {examRoutines.map((ex, idx) => (
                                        <tr key={ex._id || ex.id || ex.code || `exroutine-${idx}`}>
                                            <td className="py-2 px-3 font-bold text-slate-400">0{idx + 1}</td>
                                            <td className="py-2 px-3 font-semibold text-slate-800">{ex.code} - {ex.name || ex.course}</td>
                                            <td className="py-2 px-3 text-slate-600">{ex.date}</td>
                                            <td className="py-2 px-3 text-right text-slate-300">__________</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="pt-6 flex items-end justify-between text-xs text-slate-500">
                                <div>
                                    <div className="w-32 border-b border-slate-300"></div>
                                    <p className="text-[10px] text-slate-400 mt-1">Student Signature</p>
                                </div>
                                <div className="text-right">
                                    <div className="w-40 border-b border-slate-300 ml-auto"></div>
                                    <p className="text-[10px] font-bold text-slate-700 mt-1">Controller of Examinations, ICE</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= INTERACTIVE PAYMENT GATEWAY MODAL (bKash / Nagad / Card) ================= */}
            <PaymentGatewayModal
                isOpen={showPayModal}
                onClose={() => setShowPayModal(false)}
                amount={payModalAmount || currentSemDue || 25000}
                semester={settings.currentSemester}
                studentInfo={currentUser}
                defaultCategory={payCategory || "Semester Tuition Fee"}
                onPaymentSuccess={(newTrx) => {
                    const updated = [newTrx, ...payments];
                    setPayments(updated);
                    localStorage.setItem("portal_payments", JSON.stringify(updated));

                    // Save to MongoDB Atlas via Express API
                    try {
                        apiRequest("/academic/payments", "POST", newTrx).catch(console.warn);
                    } catch (err) {
                        console.warn("Payment sync error:", err);
                    }

                    setShowPayModal(false);
                    setPaymentSuccess(true);
                    setSelectedReceipt(newTrx); // Open Money Receipt Voucher immediately!
                    setTimeout(() => setPaymentSuccess(false), 5000);
                }}
            />

            {/* ================= OFFICIAL PAYMENT MONEY RECEIPT MODAL ================= */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col">
                        {/* Action Bar (Hidden when printing) */}
                        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                Official Tuition Fee Money Voucher • Student Copy
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintReceipt}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print / Download PDF</span>
                                </button>
                                <button
                                    onClick={() => setSelectedReceipt(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Printable Voucher Paper */}
                        <div id="printable-receipt" className="p-8 sm:p-10 space-y-6 bg-white text-slate-800">
                            {/* University Header */}
                            <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-900 text-white font-black text-xl mb-1 shadow-sm">
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
                                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedReceipt.studentName || currentUser?.fullName || "Student"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Student ID / Roll</p>
                                    <p className="text-xs font-mono font-bold text-indigo-700 mt-0.5">{selectedReceipt.studentId || currentUser?.studentId || "2024-ICE-001"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
                                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedReceipt.department || currentUser?.department || "ICE"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Session / Term</p>
                                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedReceipt.session || currentUser?.session || settings.session} ({selectedReceipt.semester || settings.currentSemester})</p>
                                </div>
                            </div>

                            {/* Fee Itemization Table */}
                            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                                    <tr>
                                        <th className="py-2.5 px-4">SL</th>
                                        <th className="py-2.5 px-4">Fee Category & Description</th>
                                        <th className="py-2.5 px-4 text-right">Amount (BDT)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="py-3 px-4 font-bold text-slate-500">01</td>
                                        <td className="py-3 px-4 font-semibold text-slate-800">
                                            {selectedReceipt.feeCategory || "Semester Tuition Fee"} • Term: {selectedReceipt.semester || settings.currentSemester}
                                            {selectedReceipt.remarks && (
                                                <span className="block text-[11px] text-slate-500 font-normal">
                                                    Note: {selectedReceipt.remarks}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                                            ৳{Number(selectedReceipt.amount || 25000).toLocaleString()}
                                        </td>
                                    </tr>
                                    {selectedReceipt.dueRemaining !== undefined && Number(selectedReceipt.dueRemaining) > 0 && (
                                        <tr className="bg-amber-50/70 text-amber-800 text-[11px]">
                                            <td colSpan="2" className="py-2.5 px-4 font-bold text-right">
                                                Remaining Balance Due for this Term:
                                            </td>
                                            <td className="py-2.5 px-4 text-right font-black text-amber-900">
                                                ৳{Number(selectedReceipt.dueRemaining).toLocaleString()}
                                            </td>
                                        </tr>
                                    )}
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
            </div>
        </div>
    );
};

export default StudentDashboard;
