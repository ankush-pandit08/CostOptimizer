const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://ankushpandit2043_db_user:1nqfdrVDwkwTYdLB@cluster0.xxxxx.mongodb.net/myDatabase?retryWrites=true&w=majority';

mongoose
    .connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message || err);
        // Do not crash the app; allow it to start without DB for development
    });

module.exports = mongoose;
