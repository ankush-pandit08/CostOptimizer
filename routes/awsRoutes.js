const router = require('express').Router();
const auth = require('../middleware/auth');
const AWSService = require('../services/awsService');
const User = require('../models/User');

// Get all AWS data for the authenticated user
router.get('/data', auth, async (req, res) => {
    try {
        // Get user's API key
        const user = await User.findById(req.user.userId);
        if (!user || !user.apiKey) {
            return res.status(400).json({
                success: false,
                message: 'AWS API key not configured'
            });
        }

        // Parse API key (assuming it's in format: accessKeyId:secretAccessKey:region)
        const apiKeyParts = user.apiKey.split(':');
        if (apiKeyParts.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Invalid API key format. Expected: accessKeyId:secretAccessKey:region'
            });
        }

        const accessKeyId = apiKeyParts[0];
        const secretAccessKey = apiKeyParts[1];
        const region = apiKeyParts[2] || 'us-east-1';

        // Initialize AWS service
        const awsService = new AWSService(accessKeyId, secretAccessKey, region);

        // Fetch all AWS data
        const awsData = await awsService.getAllAWSData();

        res.json({
            success: true,
            data: awsData
        });

    } catch (error) {
        console.error('AWS data fetch error:', error);
        
        // Handle specific AWS errors
        if (error.code === 'UnauthorizedOperation' || error.code === 'AccessDenied') {
            return res.status(401).json({
                success: false,
                message: 'AWS access denied. Please check your API credentials.'
            });
        }
        
        if (error.code === 'InvalidAccessKeyId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid AWS access key ID.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch AWS data. Please try again.'
        });
    }
});

// Get specific AWS service data
router.get('/service/:service', auth, async (req, res) => {
    try {
        const { service } = req.params;
        const user = await User.findById(req.user.userId);
        
        if (!user || !user.apiKey) {
            return res.status(400).json({
                success: false,
                message: 'AWS API key not configured'
            });
        }

        const apiKeyParts = user.apiKey.split(':');
        if (apiKeyParts.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Invalid API key format'
            });
        }

        const accessKeyId = apiKeyParts[0];
        const secretAccessKey = apiKeyParts[1];
        const region = apiKeyParts[2] || 'us-east-1';

        const awsService = new AWSService(accessKeyId, secretAccessKey, region);

        let data;
        switch (service) {
            case 'ec2':
                data = await awsService.getEC2Instances();
                break;
            case 's3':
                data = await awsService.getS3Buckets();
                break;
            case 'rds':
                data = await awsService.getRDSInstances();
                break;
            case 'lambda':
                data = await awsService.getLambdaFunctions();
                break;
            case 'cloudfront':
                data = await awsService.getCloudFrontDistributions();
                break;
            case 'costs':
                data = await awsService.getCostData();
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid service specified'
                });
        }

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error(`AWS ${req.params.service} fetch error:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to fetch ${req.params.service} data`
        });
    }
});

// Test AWS credentials
router.post('/test-credentials', auth, async (req, res) => {
    try {
        const { apiKey } = req.body;
        
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'API key is required'
            });
        }

        const apiKeyParts = apiKey.split(':');
        if (apiKeyParts.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Invalid API key format. Expected: accessKeyId:secretAccessKey:region'
            });
        }

        const accessKeyId = apiKeyParts[0];
        const secretAccessKey = apiKeyParts[1];
        const region = apiKeyParts[2] || 'us-east-1';

        const awsService = new AWSService(accessKeyId, secretAccessKey, region);

        // Test by trying to list S3 buckets (lightweight operation)
        await awsService.getS3Buckets();

        res.json({
            success: true,
            message: 'AWS credentials are valid'
        });

    } catch (error) {
        console.error('AWS credentials test error:', error);
        
        if (error.code === 'UnauthorizedOperation' || error.code === 'AccessDenied') {
            return res.status(401).json({
                success: false,
                message: 'AWS access denied. Please check your credentials.'
            });
        }
        
        if (error.code === 'InvalidAccessKeyId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid AWS access key ID.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to test AWS credentials'
        });
    }
});

module.exports = router;
