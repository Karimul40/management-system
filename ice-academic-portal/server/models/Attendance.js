const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        courseCode: {
            type: String,
            required: true,
            uppercase: true,
        },
        date: {
            type: String,
            required: true, // YYYY-MM-DD
        },
        records: [
            {
                studentId: {
                    type: String,
                    required: true,
                },
                studentName: {
                    type: String,
                    default: "Student",
                },
                department: {
                    type: String,
                    default: "Engineering",
                },
                status: {
                    type: String,
                    enum: ["present", "absent", "late"],
                    default: "present",
                },
            },
        ],
        recordedBy: {
            type: String,
            default: "Faculty",
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate attendance entry for same course and date
attendanceSchema.index({ courseCode: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
