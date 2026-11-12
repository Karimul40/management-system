const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Notice title is required"],
            trim: true,
        },
        category: {
            type: String,
            enum: ["Academic", "Exam", "Administrative", "Event", "General"],
            default: "Academic",
        },
        audience: {
            type: String,
            enum: ["All", "Students", "Teachers", "Alumni"],
            default: "All",
        },
        content: {
            type: String,
            required: [true, "Notice content is required"],
        },
        author: {
            type: String,
            default: "Registrar Office",
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

module.exports = mongoose.model("Notice", noticeSchema);
