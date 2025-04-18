# ZenCure
AI-Powered Naturopathic WebApp 

## Project Overview

ZenCure is a multiplatform naturopathic application that allows users to:
- Enter symptoms and receive curated naturopathic remedies linked to reputable sources
- Rate remedies (1-5 stars), leave detailed reviews, and comment on others' reviews
- Register, log in, and maintain personal profiles with health information

## Tech Stack

### Backend
- **Node.js** with **Express** for the API server
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** for data storage and modeling
- **JWT** for authentication

### Frontend (Planned)
- **React Native** with **Expo** for cross-platform mobile development
- **TypeScript** for type safety
- **Tailwind CSS** for styling via tailwind-rn

## Project Structure

```
/zen-cure
  /server                   <- Node/Express API
    /src
      /controllers          <- Request handlers
      /middleware           <- Auth and other middleware
      /models               <- Mongoose schemas
      /routes               <- API route definitions
      /services             <- Business logic (future)
      index.ts              <- Server entry point
    .env                    <- Environment variables
    package.json            <- NPM dependencies
    tsconfig.json           <- TypeScript configuration
  /front                    <- React Native app (to be implemented)
```

## Data Models

### User
- Profile information (name, email)
- Hashed password
- Role (user, moderator, admin)
- Health profile data (allergies, conditions, preferences)
- Linked reviews and comments

### Remedy
- Name, description
- Categories and symptoms with relevance scores
- Warnings
- Source references
- Rating information
- Verification status

### Source
- Title, URL
- Credibility score (1-10)
- Publication metadata (date, authors, publisher)
- Peer-review status

### Review
- User and remedy references
- Rating (1-5)
- Effectiveness, side effects, and ease-of-use ratings
- Status for moderation (pending, approved, flagged)

### Comment
- User and review references
- Content and helpful count
- Status for moderation

## Core Functionality

### Authentication
- User registration and login with JWT
- Role-based access control
- Profile management

### Remedy System
- Listing remedies with pagination
- Detailed remedy information
- Searching by keywords/symptoms
- Advanced query algorithm with relevance ranking based on:
  - Symptom matching
  - Source credibility
  - Recency of information
  - User ratings

## Key API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Remedies
- `GET /api/remedies` - List remedies with pagination
- `GET /api/remedies/:id` - Get remedy details
- `POST /api/remedies/search` - Basic search by keywords
- `POST /api/remedies/query` - Advanced search with relevance ranking

## Implementation Details

### Remedy Querying Algorithm
The core algorithm for matching symptoms to remedies is implemented in the `queryRemedies` controller function. It:

1. Finds remedies matching the input symptoms
2. Calculates a relevance score based on:
   - Base rating score (0-50 points)
   - Symptom relevance (0-10 points per matching symptom)
   - Source credibility (0-20 points)
   - Recency boost (0-10 points for newer remedies)
3. Returns results sorted by total relevance score

### Security Measures
- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Role-based access control for administrative functions
- Request validation for all input data

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB running locally or MongoDB Atlas account

### Backend Setup
1. Clone the repository
2. Navigate to the server directory:
   ```
   cd zen-cure/server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/zencure
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## Planned Future Features
- React Native frontend implementation
- AI-powered symptom analysis
- Personalized recommendations based on user health profiles
- Offline mode
- Multi-language support

## Project Roadmap
1. ✅ Complete backend API implementation
2. ⬜ Develop React Native frontend with Expo
3. ⬜ Implement advanced recommendation algorithms
4. ⬜ Add content moderation system
5. ⬜ Deploy to production
