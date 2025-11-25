@echo off
echo Building Healthcare Management System...
npm run build

echo.
echo Build complete! 
echo.
echo To deploy to S3, run these AWS CLI commands:
echo.
echo 1. Create bucket (replace 'your-healthcare-app-bucket' with your desired name):
echo    aws s3 mb s3://your-healthcare-app-bucket --region us-east-1
echo.
echo 2. Enable static website hosting:
echo    aws s3 website s3://your-healthcare-app-bucket --index-document index.html --error-document index.html
echo.
echo 3. Apply bucket policy:
echo    aws s3api put-bucket-policy --bucket your-healthcare-app-bucket --policy file://deploy-s3.json
echo.
echo 4. Upload files:
echo    aws s3 sync build/ s3://your-healthcare-app-bucket --delete
echo.
echo Your app will be available at: http://your-healthcare-app-bucket.s3-website-us-east-1.amazonaws.com
pause