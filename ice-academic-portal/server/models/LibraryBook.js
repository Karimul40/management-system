const mongoose = require("mongoose");

const libraryBookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Book title is required"],
            trim: true,
        },
        author: {
            type: String,
            required: [true, "Author name is required"],
            trim: true,
        },
        category: {
            type: String,
            default: "Computer Science",
        },
        isbn: {
            type: String,
            default: "",
        },
        copies: {
            type: Number,
            default: 5,
            min: 0,
        },
        issuedCopies: [
            {
                studentId: String,
                studentName: String,
                issueDate: String,
                dueDate: String,
                status: {
                    type: String,
                    default: "Issued",
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("LibraryBook", libraryBookSchema);
