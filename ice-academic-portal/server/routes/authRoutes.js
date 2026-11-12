const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    getAllUsers,
    updateUserStatus,
    firebaseAuthLogin,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/firebase-login", firebaseAuthLogin);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);

module.exports = router;
