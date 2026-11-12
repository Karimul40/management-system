const express = require("express");
const router = express.Router();
const {
    getCourses,
    createCourse,
    deleteCourse,
    getAttendance,
    saveAttendance,
    getResults,
    createResultsBatch,
    getBooks,
    addBook,
    updateBookStock,
    getPayments,
    createPayment,
    getNotices,
    createNotice,
    getAlumniJobs,
    createAlumniJob,
    handleAIAssistant,
} = require("../controllers/academicController");

// Courses
router.get("/courses", getCourses);
router.post("/courses", createCourse);
router.delete("/courses/:id", deleteCourse);

// Attendance
router.get("/attendance", getAttendance);
router.post("/attendance", saveAttendance);

// Results
router.get("/results", getResults);
router.post("/results/batch", createResultsBatch);

// Library
router.get("/library", getBooks);
router.post("/library", addBook);
router.patch("/library/:id/stock", updateBookStock);

// Payments
router.get("/payments", getPayments);
router.post("/payments", createPayment);

// Notices
router.get("/notices", getNotices);
router.post("/notices", createNotice);

// Alumni Jobs
router.get("/jobs", getAlumniJobs);
router.post("/jobs", createAlumniJob);

// AI Academic Assistant
router.post("/ai-assistant", handleAIAssistant);

module.exports = router;
