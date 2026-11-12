const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: [true, "Student roll/ID is required"],
            trim: true,
        },
        studentName: {
            type: String,
            default: "Student",
        },
        courseCode: {
            type: String,
            required: true,
            uppercase: true,
        },
        subjectTitle: {
            type: String,
            required: true,
        },
        semester: {
            type: String,
            default: "1/1",
        },
        credits: {
            type: Number,
            default: 3.0,
        },
        marks: {
            type: Number,
            required: true,
        },
        grade: {
            type: String,
            required: true, // A+, A, A-, B+, B, B-, C+, C, D, F
        },
        gradePoint: {
            type: Number,
            required: true, // 4.00, 3.75, etc.
        },
        remarks: {
            type: String,
            default: "Passed",
        },
        publishedDate: {
            type: String,
            default: () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Result", resultSchema);
