const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["admin", "teacher", "student", "alumni"],
            default: "student",
            required: true,
        },
        studentId: {
            type: String,
            trim: true,
            default: "",
        },
        facultyId: {
            type: String,
            trim: true,
            default: "",
        },
        alumniId: {
            type: String,
            trim: true,
            default: "",
        },
        department: {
            type: String,
            default: "CSE",
        },
        session: {
            type: String,
            default: "2024-2025",
        },
        semester: {
            type: String,
            default: "1/1",
        },
        standing: {
            type: String,
            default: "1st Year",
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        phone: {
            type: String,
            default: "",
        },
        bloodGroup: {
            type: String,
            default: "N/A",
        },
        designation: {
            type: String,
            default: "",
        },
        enrolledCourses: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
