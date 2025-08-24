const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Validation helper
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePassword = (password) => {
    return password.length >= 6;
};

// Register route with validation
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, apiKey } = req.body;

        // Validation
        if (!name || !email || !password || !apiKey) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid email address' 
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists' 
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            apiKey
        });

        await user.save();
        
        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        
        res.status(201).json({ 
            success: true, 
            message: 'Account created successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    }
});

// Login route with validation
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid email address' 
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update API key
router.put('/update-api-key', auth, async (req, res) => {
    try {
        const { apiKey } = req.body;

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'API key is required'
            });
        }

        // Validate API key format
        const apiKeyParts = apiKey.split(':');
        if (apiKeyParts.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Invalid API key format. Expected: accessKeyId:secretAccessKey:region'
            });
        }

        // Update user's API key
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { apiKey: apiKey },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'API key updated successfully',
            data: user
        });
    } catch (error) {
        console.error('API key update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update API key'
        });
    }
});

module.exports = router;
