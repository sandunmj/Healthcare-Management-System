# Deploy Healthcare Management System to S3

## Prerequisites
- AWS CLI installed and configured
- An AWS account with S3 permissions

## Deployment Steps

### 1. Create S3 Bucket
```bash
aws s3 mb s3://your-healthcare-app-bucket --region us-east-1
```

### 2. Enable Static Website Hosting
```bash
aws s3 website s3://your-healthcare-app-bucket --index-document index.html --error-document index.html
```

### 3. Apply Bucket Policy
```bash
aws s3api put-bucket-policy --bucket your-healthcare-app-bucket --policy file://deploy-s3.json
```

### 4. Upload Build Files
```bash
aws s3 sync build/ s3://your-healthcare-app-bucket --delete
```

### 5. Access Your Application
Your app will be available at:
`http://your-healthcare-app-bucket.s3-website-us-east-1.amazonaws.com`

## Important Notes

### API Configuration
Update your API endpoints in the components to use your production backend URL instead of `http://localhost:8081`.

### CORS Configuration
Ensure your backend API has CORS configured to allow requests from your S3 website domain.

### Environment Variables
Consider using environment variables for different deployment environments:
- Development: `http://localhost:8081`
- Production: `https://your-api-domain.com`

### Security Considerations
- The current setup makes your S3 bucket publicly readable
- Consider using CloudFront for better performance and security
- Implement proper authentication and authorization
- Use HTTPS for production (requires CloudFront or custom domain)