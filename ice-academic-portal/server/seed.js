require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const User = require("./models/User");
const Course = require("./models/Course");
const Attendance = require("./models/Attendance");
const Result = require("./models/Result");
const LibraryBook = require("./models/LibraryBook");
const Payment = require("./models/Payment");
const Notice = require("./models/Notice");
const AlumniJob = require("./models/AlumniJob");

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log("🌱 Seeding MongoDB Atlas Database with Initial Data...\n");

        // 1. SEED USERS
        const demoUsers = [
            {
                fullName: "System Administrator",
                email: "admin@ice.edu.bd",
                password: "admin123",
                role: "admin",
                department: "Administration",
                status: "approved",
                phone: "+880 1711-000000",
            },
            {
                fullName: "Engr. Lipo Sarkar",
                email: "lipo@ice.edu.bd",
                password: "teacher123",
                role: "teacher",
                facultyId: "FAC-ICE-01",
                department: "ICE",
                status: "approved",
                phone: "+880 1712-345678",
            },
            {
                fullName: "Sadia Sultana",
                email: "sadia@ice.edu.bd",
                password: "student123",
                role: "student",
                studentId: "ICE-2024-001",
                department: "ICE",
                session: "2024-2025",
                semester: "3/1",
                status: "approved",
                phone: "+880 1819-998877",
            },
            {
                fullName: "Engr. Tanvir Ahmed",
                email: "alumni@ice.edu.bd",
                password: "alumni123",
                role: "alumni",
                alumniId: "ALUM-2020-04",
                department: "ICE",
                session: "2019-2020",
                status: "approved",
                phone: "+880 1912-112233",
            },
        ];

        for (const u of demoUsers) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                await User.create(u);
                console.log(`  ✓ Created user: ${u.email} (${u.role})`);
            } else {
                console.log(`  - User already exists: ${u.email}`);
            }
        }

        // 2. SEED COURSES
        const courses = [
            {
                code: "ICE-311",
                name: "Digital Signal Processing",
                credits: 3.0,
                department: "ICE",
                instructor: "Engr. Lipo Sarkar",
                semester: "3/1",
                schedule: "Sun, Tue (10:00 AM - 11:30 AM)",
                room: "Room 402",
            },
            {
                code: "ICE-312",
                name: "Digital Signal Processing Sessional",
                credits: 1.5,
                department: "ICE",
                instructor: "Engr. Lipo Sarkar",
                semester: "3/1",
                schedule: "Mon (02:00 PM - 05:00 PM)",
                room: "DSP Hardware Lab 2",
            },
            {
                code: "ICE-313",
                name: "Optical Fiber Communication",
                credits: 3.0,
                department: "ICE",
                instructor: "Engr. Lipo Sarkar",
                semester: "3/1",
                schedule: "Wed, Thu (11:30 AM - 01:00 PM)",
                room: "Room 405",
            },
            {
                code: "CSE-201",
                name: "Data Structures & Algorithms",
                credits: 3.0,
                department: "CSE",
                instructor: "Dr. Rafiqul Islam",
                semester: "2/1",
                schedule: "Sun, Wed (09:00 AM - 10:30 AM)",
                room: "Lab 301",
            },
            {
                code: "EEE-101",
                name: "Basic Electrical Technology",
                credits: 3.0,
                department: "EEE",
                instructor: "Prof. Anisur Rahman",
                semester: "1/1",
                schedule: "Mon, Wed (11:00 AM - 12:30 PM)",
                room: "Room 201",
            },
        ];

        for (const c of courses) {
            const exists = await Course.findOne({ code: c.code });
            if (!exists) {
                await Course.create(c);
                console.log(`  ✓ Created course: ${c.code} - ${c.name}`);
            } else {
                console.log(`  - Course already exists: ${c.code}`);
            }
        }

        // 3. SEED LIBRARY BOOKS
        const books = [
            {
                title: "Digital Signal Processing: Principles, Algorithms & Applications",
                author: "John G. Proakis, Dimitris G. Manolakis",
                category: "ICE / Telecommunications",
                isbn: "978-0131873742",
                copies: 12,
            },
            {
                title: "Optical Fiber Communications: Principles and Practice",
                author: "Gerd Keiser",
                category: "ICE / Photonics",
                isbn: "978-0073380711",
                copies: 8,
            },
            {
                title: "Data Communications and Networking with TCP/IP",
                author: "Behrouz A. Forouzan",
                category: "Computer Networks / ICE",
                isbn: "978-0073376226",
                copies: 15,
            },
            {
                title: "Introduction to Algorithms (4th Edition)",
                author: "Thomas H. Cormen, Charles E. Leiserson",
                category: "Computer Science",
                isbn: "978-0262046305",
                copies: 10,
            },
        ];

        for (const b of books) {
            const exists = await LibraryBook.findOne({ title: b.title });
            if (!exists) {
                await LibraryBook.create(b);
                console.log(`  ✓ Created library book: ${b.title}`);
            } else {
                console.log(`  - Book already exists: ${b.title}`);
            }
        }

        // 4. SEED NOTICES
        const notices = [
            {
                title: "Semester Final Examination Schedule - Spring 2026",
                category: "Academic",
                audience: "All",
                content: "All undergraduate students are informed that Semester Final Examinations for Spring 2026 will commence from next month. Check the student noticeboard for detailed routine.",
                author: "Office of the Controller of Examinations",
            },
            {
                title: "ICE Department Laboratory Maintenance & Safety Protocol",
                category: "Administrative",
                audience: "Teachers",
                content: "All faculty members and lab instructors in ICE department are requested to verify spectrum analyzers and optical equipment before end of this week.",
                author: "Head of ICE Department",
            },
            {
                title: "Annual Alumni Gala & Networking Dinner 2026",
                category: "Event",
                audience: "Alumni",
                content: "Join us for the 10th Annual ICE Alumni Gala at the Grand Ballroom. Connect with industry leaders, faculty, and fellow graduates.",
                author: "Alumni Relations Association",
            },
        ];

        for (const n of notices) {
            const exists = await Notice.findOne({ title: n.title });
            if (!exists) {
                await Notice.create(n);
                console.log(`  ✓ Created notice: ${n.title}`);
            } else {
                console.log(`  - Notice already exists: ${n.title}`);
            }
        }

        // 5. SEED ALUMNI JOBS
        const jobs = [
            {
                title: "Junior Telecommunications Engineer",
                company: "Banglalink Digital Communications",
                location: "Dhaka (Gulshan)",
                salary: "45,000 - 55,000 BDT",
                type: "Full-Time",
                postedBy: "Engr. Tanvir Ahmed",
                postedByEmail: "alumni@ice.edu.bd",
                link: "https://banglalink.bd/careers",
            },
            {
                title: "Frontend React/Next.js Engineer",
                company: "Brain Station 23 Ltd.",
                location: "Dhaka (Hybrid)",
                salary: "60,000 - 80,000 BDT",
                type: "Full-Time",
                postedBy: "Engr. Tanvir Ahmed",
                postedByEmail: "alumni@ice.edu.bd",
                link: "https://brainstation-23.com/careers",
            },
            {
                title: "Optical Network Operations Trainee",
                company: "Grameenphone Ltd.",
                location: "Dhaka (Bashundhara R/A)",
                salary: "40,000 - 50,000 BDT",
                type: "Full-Time",
                postedBy: "ICE Alumni Network",
                postedByEmail: "alumni@ice.edu.bd",
                link: "https://grameenphone.com/about/careers",
            },
        ];

        for (const j of jobs) {
            const exists = await AlumniJob.findOne({ title: j.title });
            if (!exists) {
                await AlumniJob.create(j);
                console.log(`  ✓ Created job opening: ${j.title}`);
            } else {
                console.log(`  - Job already exists: ${j.title}`);
            }
        }

        // 6. SEED INITIAL RESULTS (For Sadia Sultana)
        const results = [
            {
                studentId: "ICE-2024-001",
                studentName: "Sadia Sultana",
                courseCode: "ICE-311",
                subjectTitle: "Digital Signal Processing",
                semester: "3/1",
                credits: 3.0,
                marks: 88,
                grade: "A+",
                gradePoint: 4.0,
                remarks: "Outstanding Performance",
            },
            {
                studentId: "ICE-2024-001",
                studentName: "Sadia Sultana",
                courseCode: "ICE-312",
                subjectTitle: "Digital Signal Processing Sessional",
                semester: "3/1",
                credits: 1.5,
                marks: 85,
                grade: "A+",
                gradePoint: 4.0,
                remarks: "Excellent Lab Skills",
            },
        ];

        for (const r of results) {
            const exists = await Result.findOne({ studentId: r.studentId, courseCode: r.courseCode });
            if (!exists) {
                await Result.create(r);
                console.log(`  ✓ Created result for ${r.studentId} - ${r.courseCode}`);
            } else {
                console.log(`  - Result already exists: ${r.studentId} ${r.courseCode}`);
            }
        }

        // 7. SEED INITIAL PAYMENT (For Sadia Sultana)
        const samplePayment = {
            trxId: "TXN-ICE-202602-001",
            studentId: "ICE-2024-001",
            studentName: "Sadia Sultana",
            department: "ICE",
            session: "2024-2025",
            amount: 25000,
            method: "bKash",
            status: "Completed",
            date: "Feb 10, 2026",
        };
        const payExists = await Payment.findOne({ trxId: samplePayment.trxId });
        if (!payExists) {
            await Payment.create(samplePayment);
            console.log(`  ✓ Created sample tuition payment for ${samplePayment.studentId}`);
        } else {
            console.log(`  - Payment already exists: ${samplePayment.trxId}`);
        }

        console.log("\n🎉 Database Seeding Completed Successfully! All collections are now populated.");
        process.exit(0);
    } catch (err) {
        console.error("✗ Seeding Error:", err);
        process.exit(1);
    }
};

seedDatabase();
