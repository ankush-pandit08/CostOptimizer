require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const { connectDB } = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/aws', require('./routes/awsRoutes'));

// Serve home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});


app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'documentation.html'));
});

app.get('/guides', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'documentation.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'documentation.html'));
});

// Serve app
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signin.html'));
});

// Serve signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
