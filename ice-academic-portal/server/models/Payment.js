const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        trxId: {
            type: String,
            required: true,
            unique: true,
        },
        studentId: {
            type: String,
            required: true,
        },
        studentName: {
            type: String,
            required: true,
        },
        department: {
            type: String,
            default: "ICE",
        },
        session: {
            type: String,
            default: "2024-2025",
        },
        amount: {
            type: Number,
            required: true,
        },
        feeCategory: {
            type: String,
            default: "Semester Tuition Fee",
        },
        semester: {
            type: String,
            default: "1/1",
        },
        academicYear: {
            type: String,
            default: () => new Date().getFullYear().toString(),
        },
        dueRemaining: {
            type: Number,
            default: 0,
        },
        remarks: {
            type: String,
            default: "",
        },
        method: {
            type: String,
            default: "bKash",
        },
        status: {
            type: String,
            enum: ["Completed", "Pending", "Failed"],
            default: "Completed",
        },
        date: {
            type: String,
            default: () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
