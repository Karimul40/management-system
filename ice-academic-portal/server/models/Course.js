const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Course code is required"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, "Course name is required"],
            trim: true,
        },
        credits: {
            type: Number,
            default: 3.0,
        },
        department: {
            type: String,
            default: "CSE",
        },
        instructor: {
            type: String,
            default: "Unassigned",
        },
        semester: {
            type: String,
            default: "1/1",
        },
        schedule: {
            type: String,
            default: "Sun, Tue (10:00 AM - 11:30 AM)",
        },
        room: {
            type: String,
            default: "Room 402",
        },
        materials: [
            {
                title: { type: String, default: "Lecture Notes" },
                type: { type: String, default: "PDF" },
                url: { type: String, default: "#" },
                uploadedBy: { type: String, default: "Faculty" },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Course", courseSchema);
