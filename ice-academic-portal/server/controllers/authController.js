const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "ice_portal_super_secret_jwt_key_2026", {
        expiresIn: "30d",
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            role,
            studentId,
            facultyId,
            alumniId,
            department,
            session,
            semester,
            phone,
            bloodGroup,
        } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide full name, email, and password.",
            });
        }

        // Check if user already exists in MongoDB
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "An account already exists with this email address. Please login.",
            });
        }

        // Admin accounts auto-approved; students/teachers/alumni pending approval
        const status = role === "admin" ? "approved" : "pending";

        const user = await User.create({
            fullName,
            email: email.toLowerCase(),
            password,
            role: role || "student",
            studentId: studentId || "",
            facultyId: facultyId || "",
            alumniId: alumniId || "",
            department: department || "CSE",
            session: session || "2024-2025",
            semester: semester || "1/1",
            phone: phone || "",
            bloodGroup: bloodGroup || "N/A",
            status,
        });

        res.status(201).json({
            success: true,
            message: status === "approved"
                ? "Registration successful! You can now log in."
                : "Registration submitted successfully! Your account is pending administrative verification.",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status,
                department: user.department,
                studentId: user.studentId,
                facultyId: user.facultyId,
                session: user.session,
                semester: user.semester,
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error during registration",
        });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password.",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "No account found with this email. Please check your credentials or register.",
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password. Please try again.",
            });
        }

        // Check role match
        if (role && user.role !== role) {
            return res.status(403).json({
                success: false,
                message: `This account is registered as '${user.role.toUpperCase()}', not '${role.toUpperCase()}'. Please select the correct portal.`,
            });
        }

        // Check account approval status
        if (user.status === "rejected") {
            return res.status(403).json({
                success: false,
                message: "Your account registration was declined by the university authority.",
            });
        }

        if (user.status === "pending") {
            return res.status(403).json({
                success: false,
                message: "Your account is currently pending administrative verification. Please wait for registrar approval.",
            });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status,
                department: user.department,
                studentId: user.studentId,
                facultyId: user.facultyId,
                alumniId: user.alumniId,
                session: user.session,
                semester: user.semester,
                standing: user.standing,
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error during login",
        });
    }
};

// @desc    Get all users (for Admin Dashboard)
// @route   GET /api/auth/users
// @access  Public/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        const mappedUsers = users.map(u => ({
            ...u.toObject(),
            id: u._id.toString(),
            _id: u._id.toString(),
        }));
        res.json({ success: true, count: mappedUsers.length, users: mappedUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user status (Approve / Reject)
// @route   PATCH /api/auth/users/:id/status
// @access  Public/Admin
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const idParam = req.params.id;

        if (!idParam || idParam === "undefined" || idParam === "null") {
            return res.status(400).json({ success: false, message: "Valid user ID is required" });
        }

        let query = {};
        if (mongoose.Types.ObjectId.isValid(idParam)) {
            query = { _id: idParam };
        } else {
            query = {
                $or: [
                    { email: idParam.toLowerCase() },
                    { studentId: idParam },
                    { facultyId: idParam },
                    { alumniId: idParam }
                ]
            };
        }

        const user = await User.findOne(query);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.status = status;
        await user.save();

        const userObj = {
            ...user.toObject(),
            id: user._id.toString(),
            _id: user._id.toString(),
        };
        delete userObj.password;

        res.json({ success: true, message: `User status updated to ${status}`, user: userObj });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Auth user with Firebase (Google Sign-In or Firebase Auth)
// @route   POST /api/auth/firebase-login
// @access  Public
const firebaseAuthLogin = async (req, res) => {
    try {
        const { email, fullName, photoUrl, role, uid } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required for Firebase auth" });
        }

        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Auto-provision user in MongoDB Atlas
            // Verified Google accounts are pre-approved
            const userRole = role || "student";
            user = await User.create({
                fullName: fullName || "ICE User",
                email: email.toLowerCase(),
                password: `firebase_auth_${Date.now()}_${Math.random()}`,
                role: userRole,
                department: "ICE",
                session: "2024-2025",
                semester: "1/1",
                studentId: userRole === "student" ? `ICE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}` : "",
                facultyId: userRole === "teacher" ? `FAC-ICE-${Math.floor(10 + Math.random() * 90)}` : "",
                alumniId: userRole === "alumni" ? `ALUM-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}` : "",
                status: "approved",
                photoUrl: photoUrl || "",
            });
        }

        // If user is deactivated/rejected by admin
        if (user.status === "rejected") {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated by administration.",
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: "Firebase authentication successful!",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status,
                department: user.department,
                studentId: user.studentId,
                facultyId: user.facultyId,
                alumniId: user.alumniId,
                session: user.session,
                semester: user.semester,
                photoUrl: user.photoUrl,
            },
            token,
        });
    } catch (error) {
        console.error("Firebase Login Error:", error);
        res.status(500).json({ success: false, message: error.message || "Firebase Auth failed" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    updateUserStatus,
    firebaseAuthLogin,
};
