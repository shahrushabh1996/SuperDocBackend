# SuperDoc Backend - Serverless

This is a serverless backend application built with Express.js, MongoDB, and AWS Lambda.

## Prerequisites

- Node.js (v18.x or later)
- MongoDB (local or cloud instance)
- AWS CLI configured with proper credentials
- Serverless Framework

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration values.

## Local Development

### Using Serverless Offline (Recommended for Lambda testing)
This simulates AWS Lambda and API Gateway locally:
```bash
npm run serverless:dev
```
The API will be available at `http://localhost:3000`

### Using Express directly
For traditional Express development:
```bash
npm run start
# or with nodemon
npm run dev
```

## API Testing with Postman

### Local Testing
Base URL: `http://localhost:3000`

### Available Endpoints

#### Brand Endpoints
- `GET /brand` - Get all brands
- `GET /brand/:id` - Get brand by ID
- `POST /brand` - Create new brand
- `PUT /brand/:id` - Update brand
- `DELETE /brand/:id` - Delete brand

### Postman Configuration
1. Create a new environment in Postman
2. Add variable: `base_url` = `http://localhost:3000`
3. Use `{{base_url}}/brand` in your requests

## Deployment

### Deploy to AWS
```bash
npm run serverless:deploy
```

### Deploy to specific stage
```bash
npm run serverless:deploy -- --stage production
```

### View logs
```bash
npm run serverless:logs
```

### Remove from AWS
```bash
npm run serverless:remove
```

## Architecture

- **handler.js**: Lambda handler wrapper for Express app
- **index.js**: Express application (works for both local and serverless)
- **serverless.yml**: Serverless Framework configuration
- **routes.js**: API routes
- **brand/**: Brand module with MVC structure

## Environment Variables

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## AWS Services Used

- AWS Lambda: Serverless compute
- API Gateway: HTTP API management
- CloudFormation: Infrastructure as Code

## Notes

- The application maintains MongoDB connection pooling for better Lambda performance
- CORS is enabled for all origins (configure for production)
- Swagger documentation available at `/api-docs`