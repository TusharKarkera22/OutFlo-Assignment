# OUTFLO

A full-stack application built with Next.js (frontend) and Express/TypeScript (backend).

## Project Structure

```
OUTFLO/
├── backend/          # Express TypeScript API server
│   ├── src/
│   │   ├── routes/   # API route definitions
│   │   ├── models/   # Data models
│   │   └── index.ts  # Main server entry point
│   ├── .env          # Backend environment variables
│   ├── package.json  # Backend dependencies
│   └── tsconfig.json # TypeScript configuration
│
└── frontend/         # Next.js application
    ├── .next/        # Next.js build directory
    ├── app/          # Next.js app directory
    ├── public/       # Static assets
    ├── .env          # Frontend environment variables
    ├── package.json  # Frontend dependencies
    └── tsconfig.json # TypeScript configuration
```

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB account and database
- Google Gemini API key

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_SCRAPED_URI=your_scraped_data_mongodb_uri
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000 # Adjust port if your backend uses a different one
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Technology Stack

### Backend
- Express.js
- TypeScript
- MongoDB (database)
- Google Gemini API (for AI features)

### Frontend
- Next.js 15.3.1 (with Turbopack)
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion (animations)
- React Hot Toast (notifications)

## API Routes

The backend provides several API endpoints:
- `/api/campaigns` - Campaign management
- `/api/personalizedmessage` - Message handling
- `/api/leads` - Data scraping functionality

## Scraping 

The scraping is done in the `main.py` file.
You need to have cookies.json file in the root directory to run the scraping.

## Environment Variables

### Backend Environment Variables
- `MONGODB_URI`: Connection string for your main MongoDB database
- `GEMINI_API_KEY`: API key for Google Gemini AI services
- `MONGODB_SCRAPED_URI`: Connection string for scraped data MongoDB database

### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL`: URL where the backend API is hosted

## Development Workflow

1. Start both backend and frontend development servers
2. Make changes to the codebase
3. The servers will automatically reload when changes are detected

## Deployment

For production deployment:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the frontend production server:
   ```bash
   npm start
   ```

3. For the backend, consider using a process manager like PM2:
   ```bash
   cd backend
   npm run build
   pm2 start dist/index.js
   ```

## License

[Your License Information]

## Contact

[Your Contact Information]
