# Configuration Guide

This document explains how to configure the WordWise application for different environments.

## Frontend Configuration

The frontend uses environment variables to configure the API URL. These variables are prefixed with `VITE_` to be accessible in the browser.

### Environment Variables

- `VITE_API_URL`: The base URL for the backend API

### Setup for Different Environments

#### Local Development
Create a `.env.local` file in the `frontend/` directory:
```
VITE_API_URL=http://localhost:8000
```

#### Production Deployment
Set the environment variable in your deployment platform:
```
VITE_API_URL=https://your-api-domain.com
```

#### Staging
```
VITE_API_URL=https://staging-api.your-domain.com
```

## Backend Configuration

The backend uses environment variables for CORS configuration.

### Environment Variables

- `CORS_ORIGINS`: Comma-separated list of allowed origins for CORS

### Setup for Different Environments

#### Local Development
Create a `.env` file in the `backend/` directory:
```
CORS_ORIGINS=http://localhost:3000
```

#### Production Deployment
```
CORS_ORIGINS=https://your-frontend-domain.com
```

#### Multiple Origins
```
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com,https://staging.your-domain.com
```

## Default Values

If no environment variables are set:
- Frontend will default to `http://localhost:8000` for the API URL
- Backend will default to `http://localhost:3000` for CORS origins

This ensures the application works out of the box in development while being configurable for deployment. 