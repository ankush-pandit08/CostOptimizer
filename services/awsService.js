const AWS = require('aws-sdk');

class AWSService {
    constructor(accessKeyId, secretAccessKey, region = 'us-east-1') {
        this.awsConfig = {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            region: region
        };
        
        // Initialize AWS services
        this.ec2 = new AWS.EC2(this.awsConfig);
        this.s3 = new AWS.S3(this.awsConfig);
        this.rds = new AWS.RDS(this.awsConfig);
        this.lambda = new AWS.Lambda(this.awsConfig);
        this.cloudfront = new AWS.CloudFront(this.awsConfig);
        this.ce = new AWS.CostExplorer(this.awsConfig);
    }

    // Get EC2 instances
    async getEC2Instances() {
        try {
            const data = await this.ec2.describeInstances().promise();
            const instances = [];
            
            data.Reservations.forEach(reservation => {
                reservation.Instances.forEach(instance => {
                    instances.push({
                        id: instance.InstanceId,
                        type: instance.InstanceType,
                        state: instance.State.Name,
                        launchTime: instance.LaunchTime,
                        publicIp: instance.PublicIpAddress || 'N/A',
                        privateIp: instance.PrivateIpAddress || 'N/A',
                        tags: instance.Tags || []
                    });
                });
            });
            
            return instances;
        } catch (error) {
            console.error('Error fetching EC2 instances:', error);
            throw error;
        }
    }

    // Get S3 buckets
    async getS3Buckets() {
        try {
            const data = await this.s3.listBuckets().promise();
            const buckets = [];
            
            for (const bucket of data.Buckets) {
                try {
                    const location = await this.s3.getBucketLocation({ Bucket: bucket.Name }).promise();
                    buckets.push({
                        name: bucket.Name,
                        creationDate: bucket.CreationDate,
                        region: location.LocationConstraint || 'us-east-1'
                    });
                } catch (err) {
                    buckets.push({
                        name: bucket.Name,
                        creationDate: bucket.CreationDate,
                        region: 'Unknown'
                    });
                }
            }
            
            return buckets;
        } catch (error) {
            console.error('Error fetching S3 buckets:', error);
            throw error;
        }
    }

    // Get RDS instances
    async getRDSInstances() {
        try {
            const data = await this.rds.describeDBInstances().promise();
            return data.DBInstances.map(instance => ({
                id: instance.DBInstanceIdentifier,
                engine: instance.Engine,
                status: instance.DBInstanceStatus,
                size: instance.DBInstanceClass,
                storage: instance.AllocatedStorage,
                endpoint: instance.Endpoint?.Address || 'N/A',
                port: instance.Endpoint?.Port || 'N/A'
            }));
        } catch (error) {
            console.error('Error fetching RDS instances:', error);
            throw error;
        }
    }

    // Get Lambda functions
    async getLambdaFunctions() {
        try {
            const data = await this.lambda.listFunctions().promise();
            return data.Functions.map(func => ({
                name: func.FunctionName,
                runtime: func.Runtime,
                memorySize: func.MemorySize,
                timeout: func.Timeout,
                lastModified: func.LastModified,
                codeSize: func.CodeSize
            }));
        } catch (error) {
            console.error('Error fetching Lambda functions:', error);
            throw error;
        }
    }

    // Get CloudFront distributions
    async getCloudFrontDistributions() {
        try {
            const data = await this.cloudfront.listDistributions().promise();
            return data.DistributionList.Items.map(dist => ({
                id: dist.Id,
                domainName: dist.DomainName,
                status: dist.Status,
                enabled: dist.Enabled,
                lastModifiedTime: dist.LastModifiedTime
            }));
        } catch (error) {
            console.error('Error fetching CloudFront distributions:', error);
            throw error;
        }
    }

    // Get cost data for the last 30 days
    async getCostData() {
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
            //startDate.setDate(startDate.getDate() - 30);

            const params = {
                TimePeriod: {
                    Start: startDate.toISOString().split('T')[0],
                    End: endDate.toISOString().split('T')[0]
                },
                Granularity: 'MONTHLY',
                Metrics: ['UnblendedCost'],
                GroupBy: [
                    {
                        Type: 'DIMENSION',
                        Key: 'SERVICE'
                    }
                ]
            };

            const data = await this.ce.getCostAndUsage(params).promise();
            
            const costs = {};
            data.ResultsByTime.forEach(result => {
                result.Groups.forEach(group => {
                    const service = group.Keys[0];
                    const cost = parseFloat(group.Metrics.UnblendedCost.Amount);
                    costs[service] = (costs[service] || 0) + cost;
                });
            });

            return costs;
        } catch (error) {
            console.error('Error fetching cost data:', error);
            throw error;
        }
    }

    // Get comprehensive AWS data
    async getAllAWSData() {
        try {
            const [
                ec2Instances,
                s3Buckets,
                rdsInstances,
                lambdaFunctions,
                cloudfrontDistributions,
                costData
            ] = await Promise.all([
                this.getEC2Instances(),
                this.getS3Buckets(),
                this.getRDSInstances(),
                this.getLambdaFunctions(),
                this.getCloudFrontDistributions(),
                this.getCostData()
            ]);

            return {
                ec2: {
                    instances: ec2Instances,
                    count: ec2Instances.length,
                    running: ec2Instances.filter(i => i.state === 'running').length,
                    stopped: ec2Instances.filter(i => i.state === 'stopped').length
                },
                s3: {
                    buckets: s3Buckets,
                    count: s3Buckets.length
                },
                rds: {
                    instances: rdsInstances,
                    count: rdsInstances.length,
                    running: rdsInstances.filter(i => i.status === 'available').length
                },
                lambda: {
                    functions: lambdaFunctions,
                    count: lambdaFunctions.length
                },
                cloudfront: {
                    distributions: cloudfrontDistributions,
                    count: cloudfrontDistributions.length,
                    enabled: cloudfrontDistributions.filter(d => d.enabled).length
                },
                costs: costData,
                summary: {
                    totalServices: 5,
                    totalResources: ec2Instances.length + s3Buckets.length + rdsInstances.length + lambdaFunctions.length + cloudfrontDistributions.length,
                    totalCost: Object.values(costData).reduce((sum, cost) => sum + cost, 0)
                }
            };
        } catch (error) {
            console.error('Error fetching all AWS data:', error);
            throw error;
        }
    }
}

module.exports = AWSService;
