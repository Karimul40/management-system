const Course = require("../models/Course");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const Payment = require("../models/Payment");
const LibraryBook = require("../models/LibraryBook");
const AlumniJob = require("../models/AlumniJob");
const Notice = require("../models/Notice");
const User = require("../models/User");

// ==========================================
// 1. COURSES CONTROLLERS
// ==========================================
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({}).sort({ createdAt: -1 });
        res.json({ success: true, count: courses.length, courses });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const createCourse = async (req, res) => {
    try {
        const { code, name, credits, department, instructor, semester, schedule, room } = req.body;
        const exists = await Course.findOne({ code: code.toUpperCase() });
        if (exists) {
            return res.status(400).json({ success: false, message: `Course code ${code} already exists.` });
        }
        const course = await Course.create({
            code: code.toUpperCase(),
            name,
            credits: Number(credits) || 3.0,
            department: department || "CSE",
            instructor: instructor || "Unassigned",
            semester: semester || "1/1",
            schedule: schedule || "Sun, Tue (10:00 AM - 11:30 AM)",
            room: room || "Room 402",
        });
        res.status(201).json({ success: true, course });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Course removed" });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ==========================================
// 2. ATTENDANCE CONTROLLERS
// ==========================================
const getAttendance = async (req, res) => {
    try {
        const { courseCode, date } = req.query;
        let filter = {};
        if (courseCode) filter.courseCode = courseCode.toUpperCase();
        if (date) filter.date = date;
        const records = await Attendance.find(filter).sort({ date: -1 });
        res.json({ success: true, records });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const saveAttendance = async (req, res) => {
    try {
        const { courseCode, date, records, recordedBy } = req.body;
        if (!courseCode || !date || !records) {
            return res.status(400).json({ success: false, message: "Missing courseCode, date, or records" });
        }

        const existing = await Attendance.findOne({ courseCode: courseCode.toUpperCase(), date });
        if (existing) {
            existing.records = records;
            existing.recordedBy = recordedBy || existing.recordedBy;
            await existing.save();
            return res.json({ success: true, message: "Attendance updated successfully", attendance: existing });
        }

        const attendance = await Attendance.create({
            courseCode: courseCode.toUpperCase(),
            date,
            records,
            recordedBy: recordedBy || "Faculty",
        });
        res.status(201).json({ success: true, message: "Attendance saved", attendance });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ==========================================
// 3. RESULTS CONTROLLERS
// ==========================================
const getResults = async (req, res) => {
    try {
        const { studentId, semester, courseCode } = req.query;
        let filter = {};
        if (studentId) filter.studentId = studentId;
        if (semester) filter.semester = semester;
        if (courseCode) filter.courseCode = courseCode.toUpperCase();

        const results = await Result.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: results.length, results });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const createResultsBatch = async (req, res) => {
    try {
        const { results } = req.body; // array of results
        if (!Array.isArray(results) || results.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide an array of result objects." });
        }
        const created = await Result.insertMany(results);
        res.status(201).json({ success: true, count: created.length, results: created });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ==========================================
// 4. CENTRAL LIBRARY CONTROLLERS
// ==========================================
const getBooks = async (req, res) => {
    try {
        const books = await LibraryBook.find({}).sort({ createdAt: -1 });
        res.json({ success: true, count: books.length, books });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const addBook = async (req, res) => {
    try {
        const { title, author, category, isbn, copies } = req.body;
        const book = await LibraryBook.create({
            title,
            author,
            category: category || "Computer Science",
            isbn: isbn || "",
            copies: Number(copies) || 5,
        });
        res.status(201).json({ success: true, book });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const updateBookStock = async (req, res) => {
    try {
        const { delta } = req.body; // +1 or -1
        const book = await LibraryBook.findById(req.params.id);
        if (!book) return res.status(404).json({ success: false, message: "Book not found" });

        book.copies = Math.max(0, book.copies + Number(delta));
        await book.save();
        res.json({ success: true, book });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ==========================================
// 5. PAYMENTS & FEES CONTROLLERS
// ==========================================
const getPayments = async (req, res) => {
    try {
        const { studentId } = req.query;
        let filter = {};
        if (studentId) filter.studentId = studentId;
        const payments = await Payment.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: payments.length, payments });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const createPayment = async (req, res) => {
    try {
        const {
            studentId,
            studentName,
            department,
            session,
            amount,
            method,
            trxId,
            feeCategory,
            semester,
            academicYear,
            dueRemaining,
            remarks,
        } = req.body;

        const payment = await Payment.create({
            trxId: trxId || `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            studentId,
            studentName,
            department: department || "ICE",
            session: session || "2024-2025",
            amount: Number(amount) || 0,
            feeCategory: feeCategory || "Semester Tuition Fee",
            semester: semester || "1/1",
            academicYear: academicYear || new Date().getFullYear().toString(),
            dueRemaining: dueRemaining !== undefined ? Number(dueRemaining) : 0,
            remarks: remarks || "",
            method: method || "bKash",
            status: "Completed",
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        });
        res.status(201).json({ success: true, payment });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ==========================================
// 6. NOTICES CONTROLLERS
// ==========================================
const getNotices = async (req, res) => {
    try {
        const { audience } = req.query;
        let filter = {};
        if (audience && audience !== "All") {
            filter.$or = [{ audience: "All" }, { audience }];
        }
        const notices = await Notice.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: notices.length, notices });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const createNotice = async (req, res) => {
    try {
        const { title, category, audience, content, author } = req.body;
        const notice = await Notice.create({
            title,
            category: category || "Academic",
            audience: audience || "All",
            content,
            author: author || "Registrar Office",
        });
        res.status(201).json({ success: true, notice });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ==========================================
// 7. ALUMNI JOBS CONTROLLERS
// ==========================================
const getAlumniJobs = async (req, res) => {
    try {
        const jobs = await AlumniJob.find({}).sort({ createdAt: -1 });
        res.json({ success: true, count: jobs.length, jobs });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const createAlumniJob = async (req, res) => {
    try {
        const { title, company, location, salary, type, postedBy, postedByEmail, link } = req.body;
        const job = await AlumniJob.create({
            title,
            company,
            location: location || "Dhaka (Hybrid)",
            salary: salary || "Competitive",
            type: type || "Full-Time",
            postedBy: postedBy || "Alumni Member",
            postedByEmail: postedByEmail || "",
            link: link || "",
        });
        res.status(201).json({ success: true, job });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ==========================================
// 8. AI ACADEMIC ASSISTANT (English & Role-Protected)
// ==========================================
const handleAIAssistant = async (req, res) => {
    try {
        const { message, studentContext, clientMaterials, clientPayments, clientBooks } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Please provide a query." });
        }

        const query = message.trim();
        const q = query.toLowerCase();

        // 1. LIVE DATA EXTRACTION FROM DATABASE
        const students = await User.find({ role: "student" }).select("fullName studentId department session semester status").lean();
        const teachers = await User.find({ role: "teacher" }).select("fullName facultyId department designation").lean();
        const courses = await Course.find({}).lean();
        const notices = await Notice.find({}).sort({ createdAt: -1 }).limit(5).lean();
        const books = await LibraryBook.find({}).select("title author category copies").lean();

        // Current User Context & Role
        const userRole = (studentContext?.role || "guest").toLowerCase();
        const isAdmin = userRole === "admin";
        const myStudentId = studentContext?.studentId || "";
        const myResults = myStudentId ? await Result.find({ studentId: myStudentId }).lean() : [];

        // Combine Client-Side Local & Backend Materials
        const allUploadedMaterials = [
            ...(Array.isArray(clientMaterials) ? clientMaterials : []),
        ];
        courses.forEach(c => {
            if (Array.isArray(c.materials)) {
                c.materials.forEach(m => {
                    allUploadedMaterials.push({
                        courseCode: c.code,
                        title: m.title || "Lecture Notes",
                        type: m.type || "PDF",
                        link: m.url || "#",
                        date: "Recent Term",
                    });
                });
            }
        });

        // 2. PRIVACY & SECURITY FIREWALL
        // Rule A: Never reveal other people's money/payment balances
        const isAskingOthersMoney =
            (q.includes("payment") || q.includes("fee") || q.includes("money") || q.includes("taka") || q.includes("due") || q.includes("balance") || q.includes("paid")) &&
            (
                q.includes("other") ||
                q.includes("another") ||
                q.includes("everyone") ||
                q.includes("who paid") ||
                q.includes("how much did") ||
                /how much.*(money|fee|paid)/.test(q) ||
                /did.*pay/.test(q) ||
                q.includes("list of payment") ||
                q.includes("payment list") ||
                q.includes("all payment") ||
                q.includes("all transaction") ||
                q.includes("kar koto") ||
                q.includes("tk poisha") ||
                q.includes("taka poisha")
            ) &&
            !q.includes("my fee") &&
            !q.includes("my due") &&
            !q.includes("my payment") &&
            !q.includes("amr fee") &&
            !q.includes("amr bokea") &&
            !q.includes("amr taka");

        if (isAskingOthersMoney) {
            return res.json({
                success: true,
                reply: `🔒 **Privacy & Financial Security Notice:**\n\nIn accordance with university data protection policies, **personal financial records, payment amounts, and tuition fee statuses of individual students cannot be disclosed via AI**.\n\n💡 However, if you would like step-by-step instructions on **how to pay your own semester tuition fee online via bKash, Nagad, or Card**, please let me know!`,
                source: "security-guard",
            });
        }

        // Rule B: Never reveal another student's exam results
        const isAskingOthersResult =
            (q.includes("result") || q.includes("grade") || q.includes("cgpa") || q.includes("marks")) &&
            (q.includes("other") || q.includes("another") || (/\b(ice|cse|eee)-\d{4}-\d{3}\b/i.test(q) && myStudentId && !q.includes(myStudentId.toLowerCase())));

        if (isAskingOthersResult) {
            return res.json({
                success: true,
                reply: `🔒 **Academic Confidentiality Notice:**\n\nOfficial examination results and transcripts are strictly confidential. Students are only permitted to query their own verified academic grades (\`${myStudentId || "your registered ID"}\`). Other students' records cannot be viewed.`,
                source: "security-guard",
            });
        }

        // Rule C: Passwords & Private Credentials
        if (q.includes("password") || q.includes("credential") || q.includes("phone number") || q.includes("mobile number")) {
            return res.json({
                success: true,
                reply: `🔒 **Security Protocol:** Passwords, credentials, and personal telephone contacts cannot be shared by the assistant. If you forgot your password, please use the password recovery option on the login portal.`,
                source: "security-guard",
            });
        }

        // 3. DYNAMIC ACADEMIC QUERY ENGINE
        let reply = "";

        // Query Type 1: Student's Personal Fee Dues & Balance (Live Real-Time Financial Ledger)
        const isMyDueQuery =
            q.includes("my fee") ||
            q.includes("my due") ||
            q.includes("my balance") ||
            q.includes("how much do i owe") ||
            q.includes("have i paid") ||
            q.includes("amr fee") ||
            q.includes("amr bokea") ||
            q.includes("bokea koto") ||
            q.includes("taka baki") ||
            q.includes("fee status") ||
            (q.includes("due") && (q.includes("i") || q.includes("me") || q.includes("my") || q.includes("amr")));

        if (isMyDueQuery) {
            const studentPayments = Array.isArray(clientPayments) ? clientPayments : [];
            const tuitionPayments = studentPayments.filter(p => p.feeCategory === "Semester Tuition Fee" || !p.feeCategory);
            const totalTuitionPaid = tuitionPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
            const lifetimePaid = studentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
            const targetFee = 25000;
            const remainingDue = Math.max(0, targetFee - totalTuitionPaid);

            if (remainingDue === 0) {
                reply = `🎉 **Semester Tuition Status: 100% Cleared (No Dues)**\n\n- **Student:** ${studentContext?.name || "Student"} (\`${myStudentId || "2024-ICE-001"}\`)\n- **Semester Target Fee:** ৳${targetFee.toLocaleString()}\n- **Tuition Amount Paid:** ৳${totalTuitionPaid.toLocaleString()}\n- **Outstanding Balance:** **৳0 (Cleared ✓)**\n- **Verified Receipts:** ${studentPayments.length} voucher(s) on file\n\n✅ You have fully cleared your semester tuition fee for the current academic session. You can view and print your official Money Receipts anytime from the Student Dashboard.`;
            } else {
                reply = `💳 **Personal Tuition Fee & Dues Status:**\n\n- **Student:** ${studentContext?.name || "Student"} (\`${myStudentId || "2024-ICE-001"}\`)\n- **Semester Target Fee:** ৳${targetFee.toLocaleString()}\n- **Amount Paid So Far:** ৳${totalTuitionPaid.toLocaleString()}\n- ⚠️ **Outstanding Remaining Due: ৳${remainingDue.toLocaleString()}**\n\n💡 You can pay the remaining **৳${remainingDue.toLocaleString()}** anytime in installments or clear it in full via bKash, Nagad, or Card.\n\n👉 [💳 Pay Due ৳${remainingDue.toLocaleString()} Online Now](/payments)`;
            }
        }

        // Query Type 2: Subject PDFs, Course Syllabi & Lecture Materials Uploaded by Teachers
        else if (
            q.includes("pdf") ||
            q.includes("note") ||
            q.includes("material") ||
            q.includes("slide") ||
            q.includes("handout") ||
            q.includes("lecture") ||
            q.includes("sheet") ||
            q.includes("boi") ||
            q.includes("নোট") ||
            q.includes("পিডিএফ") ||
            q.includes("cse-3101") ||
            q.includes("cse-3103") ||
            q.includes("ice-3105") ||
            q.includes("eee-2201") ||
            q.includes("gen-2101") ||
            q.includes("dsp")
        ) {
            // Find specific course code if mentioned
            let targetCourseCode = "";
            const matchedCode = q.match(/\b(cse|ice|eee|gen|math)-?\d{4}\b/i);
            if (matchedCode) {
                targetCourseCode = matchedCode[0].toUpperCase().replace("-", "-");
                if (!targetCourseCode.includes("-")) {
                    targetCourseCode = targetCourseCode.slice(0, 3) + "-" + targetCourseCode.slice(3);
                }
            } else if (q.includes("dsp") || q.includes("signal")) {
                targetCourseCode = "ICE-3105";
            } else if (q.includes("architecture")) {
                targetCourseCode = "CSE-3101";
            } else if (q.includes("algorithm")) {
                targetCourseCode = "CSE-3103";
            } else if (q.includes("circuit") || q.includes("analog")) {
                targetCourseCode = "EEE-2201";
            } else if (q.includes("ethics") || q.includes("communication")) {
                targetCourseCode = "GEN-2101";
            }

            if (targetCourseCode) {
                // Find materials for this course
                const matchingMaterials = allUploadedMaterials.filter(
                    (m) => (m.courseCode || "").toUpperCase() === targetCourseCode.toUpperCase()
                );
                const courseObj = courses.find((c) => c.code.toUpperCase() === targetCourseCode.toUpperCase());
                const courseTitle = courseObj ? courseObj.name : targetCourseCode;
                const instructor = courseObj ? courseObj.instructor : "Assigned Faculty";

                if (matchingMaterials.length > 0) {
                    const materialList = matchingMaterials
                        .map(
                            (m, idx) =>
                                `**${idx + 1}. 📄 ${m.title}**\n   - Format: \`${m.type || "PDF"}\` • Date: ${m.date || "Recent"}\n   - 👉 [📥 Download / Open Material](${m.link || "#"})`
                        )
                        .join("\n\n");

                    reply = `📚 **Lecture Materials & PDFs for \`${targetCourseCode}\`:**\n\n**Course:** ${courseTitle}\n**Faculty Instructor:** ${instructor}\n\n${materialList}\n\n💡 Click any link above to open or download the PDF study material directly!`;
                } else {
                    reply = `ℹ️ **Lecture Materials & PDFs for \`${targetCourseCode}\` (${courseTitle}):**\n\n**Instructor:** ${instructor}\n\nCurrently, the course instructor has **not yet uploaded lecture PDFs or slides** for this course section.\n\n💡 As soon as the teacher publishes lecture notes or slides in the Faculty Portal, you will be able to retrieve and download them directly from here!`;
                }
            } else {
                // General PDF Query: Show all available materials
                if (allUploadedMaterials.length > 0) {
                    const materialList = allUploadedMaterials
                        .slice(0, 6)
                        .map(
                            (m, idx) =>
                                `- 📄 **[${m.courseCode}]** ${m.title} (\`${m.type || "PDF"}\`) 👉 [📥 Download](${m.link || "#"})`
                        )
                        .join("\n");

                    reply = `📂 **Available Course Materials & Lecture PDFs Uploaded by Faculty:**\n\n${materialList}\n\n💡 To view materials for a specific course, ask me: *"Give me the PDFs for CSE-3101"* or *"Show ICE-3105 lecture slides"*.`;
                } else {
                    const courseList = courses
                        .map((c) => `- **${c.code}:** ${c.name} (Instructor: ${c.instructor})`)
                        .join("\n");

                    reply = `📂 **Course Lecture Notes & PDF Library:**\n\nCourse instructors publish lecture slides, handouts, and problem sheets for the following courses:\n\n${courseList}\n\n💡 Ask me about any specific course code (e.g. *"Give me CSE-3101 notes"*) to check for available PDFs!`;
                }
            }
        }

        // Query Type 3: Exam Question & Quiz Generator (For Teachers or Student Prep)
        else if (q.includes("generate question") || q.includes("create question") || q.includes("quiz") || q.includes("exam question") || q.includes("question paper")) {
            reply = `📝 **Generated University Examination Question Sample (Bloom's Taxonomy):**\n\n**Course:** CSE-3101 (Computer Architecture & Organization)\n**Marks:** 20 Marks • **Time:** 45 Minutes\n\n**Part A: Analytical & Descriptive Questions (15 Marks)**\n1. *(5 Marks)* Explain the concept of instruction pipelining. Describe the three major types of pipeline hazards (Structural, Data, and Control) and how forwarding resolves data hazards.\n2. *(5 Marks)* Differentiate between Von Neumann architecture and Harvard architecture with appropriate block diagrams.\n3. *(5 Marks)* A computer system has a 32-bit byte-addressable memory and a 64 KB direct-mapped cache with 16-byte cache lines. Calculate the number of bits in the Tag, Index, and Offset fields.\n\n**Part B: Multiple Choice Assessment (5 Marks)**\n1. Which register holds the address of the next instruction to be fetched?  \n   *Answer:* Program Counter (PC)\n2. What is the primary advantage of RISC over CISC architecture?  \n   *Answer:* Single-cycle execution and streamlined instruction set.`;
        }

        // Query Type 4: Personal Borrowed Library Books Tracker
        else if (q.includes("my book") || q.includes("borrowed") || q.includes("return date") || q.includes("due date") || q.includes("amr boi")) {
            const studentBooks = Array.isArray(clientBooks) ? clientBooks : [];
            if (studentBooks.length > 0) {
                const bookList = studentBooks
                    .map(
                        (b, idx) =>
                            `**${idx + 1}. 📖 ${b.title}**\n   - Author: *${b.author}*\n   - Issued: ${b.issueDate || "Active"} | ⚠️ **Return Due Date: ${b.dueDate || "14 days"}**`
                    )
                    .join("\n\n");

                reply = `📚 **Your Currently Borrowed Central Library Books (${studentBooks.length}):**\n\n${bookList}\n\n💡 **Renewal Policy:** You can renew books for an additional 21 days from the **"Library"** tab on your dashboard before the due date.`;
            } else {
                reply = `📚 **Central Library Loan Status:**\n\nYou currently have **0 active book loans** on your student account.\n\n- **Borrowing Limit:** Up to **3 engineering books** simultaneously.\n- **Loan Duration:** **14 calendar days** (online renewal available).\n\n💡 Visit the **"Central Library"** tab on your portal to browse and borrow books online!`;
            }
        }

        // Query Type 5: Student List / Student Directory (ADMIN ONLY)
        else if (
            q.includes("student list") ||
            q.includes("list of students") ||
            q.includes("all students") ||
            q.includes("student directory") ||
            q.includes("show students") ||
            (q.includes("student") && (q.includes("list") || q.includes("directory") || q.includes("roster") || q.includes("table")))
        ) {
            if (!isAdmin) {
                return res.json({
                    success: true,
                    reply: `🔒 **Access Restricted:**\n\nThe registered student directory is confidential and can only be accessed by authorized university **Administrators**.\n\nAs an enrolled student, you can view your personal profile, enrolled courses, and exam grades in your student portal dashboard.`,
                    source: "security-guard",
                });
            }

            const studentRows = students.map((s, idx) => `| ${idx + 1} | ${s.fullName} | \`${s.studentId || "N/A"}\` | ${s.department || "ICE"} | ${s.session || "2024-2025"} | \`${s.status || "approved"}\` |`).join("\n");
            reply = `👥 **Imperial College of Engineering (ICE) Registered Student Directory (Total: ${students.length}):**\n\n| SL | Student Name | Student ID | Department | Session | Status |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${studentRows}`;
        }

        // Query Type 6: Attendance Policy & 75% Rule
        else if (q.includes("attendance") || q.includes("absent") || q.includes("present") || q.includes("75%") || q.includes("collegiate") || q.includes("dis-collegiate")) {
            reply = `📋 **University Attendance Regulations & Minimum Requirements:**\n\n- **Mandatory Attendance:** A minimum of **75%** attendance in both theoretical lectures and practical laboratory sessions is required to be categorized as a regular collegiate student.\n- **Non-Collegiate Status (65% – 74%):** Students with 65% to 74% attendance must pay a prescribed non-collegiate university fine and obtain formal approval from the Academic Committee to sit for final semester examinations.\n- **Dis-Collegiate Status (< 60%):** Students with attendance falling below 60% are declared dis-collegiate and are strictly disqualified from sitting for examinations; the course must be retaken in the subsequent academic session.`;
        }

        // Query Type 7: Personal Semester Exam Result (e.g. 1/1, 2/1, 3/1, CGPA)
        else if (q.includes("result") || q.includes("grade") || q.includes("cgpa") || q.includes("gpa") || q.includes("mark") || q.includes("transcript") || q.includes("রেজাল্ট") || /(\d\/\d)/.test(q)) {
            if (!myStudentId) {
                reply = `⚠️ Please sign in to your **Student Account** to view your academic transcript and exam grades. Once logged in, ask me (e.g. *"Show my 1/1 semester results"*), and I will retrieve your official transcript.`;
            } else if (myResults.length === 0) {
                reply = `📊 Student: **${studentContext?.name || "Student"}** (ID: \`${myStudentId}\`)\n\nNo published exam results are currently on file for your ID. Grades will be posted here as soon as they are approved by the Controller of Examinations.`;
            } else {
                let targetResults = myResults;
                const semMatch = q.match(/(\d\/\d)/);
                if (semMatch) {
                    const requestedSem = semMatch[1];
                    const filtered = myResults.filter(r => r.semester === requestedSem);
                    if (filtered.length > 0) {
                        targetResults = filtered;
                    } else {
                        const availableSemesters = [...new Set(myResults.map(r => r.semester))].sort();
                        return res.json({
                            success: true,
                            reply: `📊 **Semester Results Query — Student: ${studentContext?.name || "Student"} (\`${myStudentId}\`):**\n\nNo published exam records were found for Semester **${requestedSem}**.\n\nYour available published semesters on file are: **${availableSemesters.join(", ") || "None"}**.\n\nType *"Show my ${availableSemesters[0]} results"* to view those grades, or contact the Controller of Examinations if you believe a record is missing.`,
                            source: "dynamic-database-engine",
                        });
                    }
                }

                const resultRows = targetResults.map((r, idx) => `| ${idx + 1} | \`${r.courseCode}\` | ${r.subjectTitle} | ${r.semester} | ${r.credits} | ${r.marks} | **${r.grade}** | **${Number(r.gradePoint).toFixed(2)}** | ${r.remarks || "Passed"} |`).join("\n");

                const totalCredits = targetResults.reduce((sum, r) => sum + (r.credits || 3), 0);
                const totalPoints = targetResults.reduce((sum, r) => sum + ((r.gradePoint || 0) * (r.credits || 3)), 0);
                const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "4.00";

                const isSingleSem = semMatch ? `Semester ${semMatch[1]}` : "Cumulative All Semesters";
                reply = `🎓 **Official Academic Transcript [${isSingleSem}] — Student: ${studentContext?.name || "Student"} (\`${myStudentId}\`):**\n\n| SL | Code | Subject Title | Semester | Credits | Marks | Grade | Point | Status |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n${resultRows}\n\n🏆 **${semMatch ? "Semester GPA" : "Cumulative CGPA"}: ${gpa} / 4.00**\n\n*Verified and authenticated by the Office of the Controller of Examinations.*`;
            }
        }

        // Query Type 8: Teacher / Faculty List & Directory
        else if (q.includes("teacher") || q.includes("faculty") || q.includes("instructor") || q.includes("professor") || q.includes("sir") || q.includes("শিক্ষক")) {
            const teacherRows = teachers.map((t, idx) => `| ${idx + 1} | ${t.fullName} | \`${t.facultyId || "FAC-ICE-01"}\` | ${t.department || "ICE"} | ${t.designation || "Assistant Professor"} |`).join("\n");
            reply = `👨‍🏫 **Imperial College of Engineering Faculty Directory (Total: ${teachers.length}):**\n\n| SL | Faculty Member | Faculty ID | Department | Designation |\n| :--- | :--- | :--- | :--- | :--- |\n${teacherRows}\n\n- **Engr. Lipo Sarkar** is currently leading **ICE-311 (Digital Signal Processing)** and **ICE-313 (Optical Fiber Communication)**.`;
        }

        // Query Type 9: How to Pay Fees / Payment Gateway Guide
        else if (q.includes("payment") || q.includes("pay") || q.includes("fee") || q.includes("bkash") || q.includes("nagad") || q.includes("card") || q.includes("tuition") || q.includes("receipt") || q.includes("voucher")) {
            reply = `💳 **Official Tuition Fee Payment Guide:**\n\nYou can pay your semester tuition fees online in 4 simple and secure steps:\n\n1. **Navigate to Payment Portal:** Go to the **"Fee Payments"** tab on your Student Dashboard, or visit **\`/payments\`**.\n2. **Choose Payment Gateway:** Select **bKash**, **Nagad**, or **Credit/Debit Card (Visa/Mastercard)**.\n3. **Authenticate via OTP & PIN:** Enter your 11-digit mobile wallet number, verify with the 6-digit OTP code sent to your phone, and enter your secure PIN.\n4. **Instant Official Money Receipt:** Upon successful payment, an official **Digital Money Voucher** with a university stamp is generated. You can view, print, or download it as a PDF immediately!\n\n💰 **Current Semester Target:** ৳25,000 (Spring 2026) with zero gateway surcharge.`;
        }

        // Query Type 10: Examination Schedule & Routine
        else if (q.includes("routine") || q.includes("exam") || q.includes("schedule") || q.includes("date") || q.includes("examination") || q.includes("porikkha") || q.includes("পরীক্ষা") || q.includes("রুটিন")) {
            reply = `📅 **Spring 2026 Official Final Examination Routine:**\n\n| Date | Time | Course Code | Subject Title | Room / Hall |\n| :--- | :--- | :--- | :--- | :--- |\n| Dec 05, 2026 | 10:00 AM - 01:00 PM | \`CSE-3101\` | Computer Architecture | Exam Hall 1 |\n| Dec 08, 2026 | 10:00 AM - 01:00 PM | \`CSE-3103\` | Design & Analysis of Algorithms | Exam Hall 2 |\n| Dec 12, 2026 | 02:00 PM - 05:00 PM | \`GEN-2101\` | Technical Communication & Ethics | Exam Hall 1 |\n| Dec 16, 2026 | 10:00 AM - 01:00 PM | \`ICE-3105\` | Communication Systems & Telephony | Room 501 |\n\n⚠️ **Important Requirements:**\n- A minimum of **75% lecture attendance** is required to sit for examinations.\n- Semester tuition fees must be cleared prior to receiving your final Admit Card.\n\n👉 [🎫 View Examination Admit Card](/dashboard/student)`;
        }

        // Query Type 11: Central Library Rules & Books
        else if (q.includes("library") || q.includes("book") || q.includes("borrow") || q.includes("catalog")) {
            const bookRows = books.slice(0, 4).map((b, idx) => `| ${idx + 1} | ${b.title} | ${b.author} | ${b.category} | ${b.copies} copies |`).join("\n");
            reply = `📚 **ICE Central Library Policies & Book Catalog:**\n\n- **Borrowing Limit:** Undergraduate students can borrow up to **3 books** simultaneously.\n- **Borrowing Duration:** **14 calendar days**, renewable online once if not reserved by another borrower.\n- **Available Catalog Sample:**\n\n| SL | Book Title | Author | Category | Stock |\n| :--- | :--- | :--- | :--- | :--- |\n${bookRows}\n\n💡 You can search and reserve books directly via the **"Library"** tab on your portal.`;
        }

        // Query Type 12: General Assistance / Contact
        else if (q.includes("help") || q.includes("contact") || q.includes("office") || q.includes("support") || q.includes("email") || q.includes("phone")) {
            reply = `🏛️ **Imperial College of Engineering (ICE) Support Desk:**\n\n- **Registrar Office:** registrar@ice.edu.bd\n- **Campus Hotline:** +880 1700-123456\n- **Controller of Examinations:** exams@ice.edu.bd\n- **Office Hours:** Sunday – Thursday (9:00 AM – 4:30 PM)\n- **Campus Address:** ICE Academic Building, Dhaka, Bangladesh.`;
        }

        // Query Type 13: Friendly Greetings
        else if (q === "hi" || q === "hello" || q === "hey" || q.startsWith("hi ") || q.startsWith("hello ") || q.startsWith("hey ") || q.includes("good morning") || q.includes("good afternoon")) {
            reply = `Hello! 👋 I am your **ICE AI Academic Assistant**.\n\nHow can I assist you today? You can ask me about:\n- 📄 **Course Lecture Notes & Teacher PDFs:** *"Give me CSE-3101 PDFs"*\n- 💳 **My Fee Dues & Balance:** *"What is my remaining due?"*\n- 📅 **Examination Routine & Schedule:** *"When is my next exam?"*\n- 🎓 **Semester Exam Results & CGPA:** *"Show my 1/1 results"*\n- 📚 **My Borrowed Books & Return Dates:** *"What books do I have?"*\n- 📋 **Attendance Regulations:** *"What is the 75% attendance rule?"*\n\nWhat would you like to know?`;
        }

        // Query Type 14: Dynamic English Fallback
        else {
            reply = `I am the official **AI Academic Assistant** for Imperial College of Engineering (ICE)! 🎓\n\nI can assist you with:\n- 📄 **Course PDFs & Lecture Notes:** Ask *"Give me CSE-3101 PDFs"*\n- 💳 **Personal Fee Status & Dues:** Ask *"What is my fee status?"*\n- 📅 **Examination Routines & Schedules:** Ask *"When are the final exams?"*\n- 🎓 **Semester Results & CGPA:** Ask *"Show my 1/1 exam results"*\n- 📚 **Library Books & Return Dates:** Ask *"What books do I have borrowed?"*\n- 📋 **Attendance Regulations:** Ask *"What is the 75% attendance rule?"*\n\nPlease feel free to type your question above!`;
        }

        res.json({ success: true, reply, source: "dynamic-database-engine" });
    } catch (e) {
        console.error("AI Assistant Error:", e);
        res.status(500).json({ success: false, message: e.message });
    }
};

module.exports = {
    getCourses,
    createCourse,
    deleteCourse,
    getAttendance,
    saveAttendance,
    getResults,
    createResultsBatch,
    getBooks,
    addBook,
    updateBookStock,
    getPayments,
    createPayment,
    getNotices,
    createNotice,
    getAlumniJobs,
    createAlumniJob,
    handleAIAssistant,
};
