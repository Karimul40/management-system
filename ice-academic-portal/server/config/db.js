const mongoose = require("mongoose");
const dns = require("dns");

// Set Google Public DNS to avoid Windows querySrv ECONNREFUSED issues
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
    console.warn("Could not set custom DNS servers", e);
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`✓ MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`✗ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
