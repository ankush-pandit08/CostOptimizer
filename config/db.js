const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/costoptimizer';

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
