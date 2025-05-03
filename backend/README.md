# Outflo Backend

This is the backend service for the Outflo campaign management system, built with Node.js, Express, TypeScript, and MongoDB.

## Prerequisites

- Node.js (v14 or later)
- MongoDB (local or cloud)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/outflo
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
```

3. Start the development server:
```bash
npm run dev
```

The server will run on http://localhost:5000.

## API Endpoints

### Campaigns

- `GET /api/campaigns` - Fetch all active/inactive campaigns
- `GET /api/campaigns/:id` - Fetch a campaign by ID
- `POST /api/campaigns` - Create a new campaign
- `PUT /api/campaigns/:id` - Update a campaign
- `DELETE /api/campaigns/:id` - Soft delete a campaign

### Personalized Message

- `POST /api/personalizedmessage` - Generate a personalized message using Gemini API

## Project Structure

```
backend/
├── src/
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   └── index.ts        # Main application file
├── .env               # Environment variables
├── package.json       # Project dependencies
└── tsconfig.json      # TypeScript configuration
```

## Development

- Use `npm run dev` for development with hot reloading
- Use `npm run build` to compile TypeScript to JavaScript
- Use `npm start` to run the production build 