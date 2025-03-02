const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    }
    catch(e){
        console.error(`MongoDB Error: ${e.message}`)
    }
}

module.exports = connectDB