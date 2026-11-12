const mongoose = require("mongoose");

const alumniJobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
        },
        company: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
        },
        location: {
            type: String,
            default: "Dhaka (Hybrid)",
        },
        salary: {
            type: String,
            default: "Competitive",
        },
        type: {
            type: String,
            enum: ["Full-Time", "Internship", "Part-Time", "Contract"],
            default: "Full-Time",
        },
        postedBy: {
            type: String,
            default: "Alumni Member",
        },
        postedByEmail: {
            type: String,
            default: "",
        },
        link: {
            type: String,
            default: "",
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

module.exports = mongoose.model("AlumniJob", alumniJobSchema);
