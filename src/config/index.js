const mongoose = require('mongoose');

const { Schema } = mongoose;
const startServer = async ( MONGOURL) => {
    try {
        await mongoose.connect(MONGOURL);
        console.log("Database is connected successfully.");

    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1); // Exit the process with failure code
    }
};
module.exports = { startServer, Schema, mongoose }