# ZenCure

![ZenCure](https://via.placeholder.com/800x200?text=ZenCure:+AI-Powered+Naturopathic+Solutions)

## Overview

ZenCure is a naturopathic application that helps users discover evidence-based natural remedies for various health concerns. The platform allows users to search for remedies based on symptoms, read scientifically-backed information about natural treatments, and share their experiences through reviews and comments.

### Key Features

- **Evidence-Based Remedies**: All remedies are linked to scientific sources with credibility ratings
- **Advanced Symptom Matching**: Intelligent algorithm that ranks remedies based on relevance to symptoms
- **User Reviews & Ratings**: Community feedback system with moderation
- **Personalized Profiles**: Save health information for tailored recommendations

## 🔧 Tech Stack

### Backend
- **Node.js** with **Express** for API server
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** for data storage
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend
- **React Native** with **Expo** for cross-platform mobile development
- **TypeScript** for type safety
- **Tailwind CSS** via NativeWind for styling
- **React Navigation** for screen navigation
- **Zustand** for state management
- **Axios** for API communication

## 📁 Project Structure

```
/zen-cure
  /server                   <- Node/Express API
    /src
      /controllers          <- Request handlers
      /middleware           <- Auth and other middleware
      /models               <- Mongoose schemas
      /routes               <- API route definitions
      /scripts              <- Utility scripts (seeding, admin creation)
      index.ts              <- Server entry point
    .env                    <- Environment variables
    package.json            <- NPM dependencies
    tsconfig.json           <- TypeScript configuration
  /front                    <- React Native app
    /src
      /api                  <- API client functions
      /components           <- Reusable UI components
      /navigation           <- Navigation configuration
      /screens              <- App screens
      /store                <- State management
      /types                <- TypeScript type definitions
    App.tsx                 <- App entry point
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (local instance or Atlas account)
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

1. Clone the repository
   ```
   git clone https://github.com/your-username/zen-cure.git
   cd zen-cure
   ```

2. Set up environment variables
   ```
   cd server
   cp .env.example .env
   ```

3. Edit the `.env` file with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/zencure
   JWT_SECRET=your_secure_secret_key
   NODE_ENV=development
   ```

4. Install dependencies
   ```
   npm install
   ```

5. Create an admin user
   ```
   npm run create-admin
   ```

6. Seed the database with initial remedies
   ```
   npm run seed
   ```

7. Start the development server
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```
   cd ../front
   ```

2. Create a `.env` file for API configuration
   ```
   API_URL=http://localhost:5000/api
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Start the Expo development server
   ```
   npm start
   ```

5. Use Expo Go app on your device to scan the QR code, or run in a simulator/emulator

## 📱 App Workflow

1. **User Registration/Login**: Create an account or sign in
2. **Health Profile**: Add allergies, conditions, and preferences
3. **Search for Remedies**: Enter symptoms to find relevant natural treatments
4. **Explore Remedy Details**: View scientific information, ratings, and reviews
5. **Leave Reviews**: Share your experience with specific remedies
6. **Engage with Community**: Comment on reviews from other users

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Remedies
- `GET /api/remedies` - List remedies with pagination
- `GET /api/remedies/:id` - Get remedy details
- `POST /api/remedies/search` - Basic search by keywords
- `POST /api/remedies/query` - Advanced search with relevance ranking

### Reviews
- `GET /api/reviews/remedy/:remedyId` - Get reviews for a remedy
- `POST /api/reviews/remedy/:remedyId` - Create a new review
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review
- `POST /api/reviews/:id/helpful` - Mark review as helpful

### Comments
- `GET /api/comments/review/:reviewId` - Get comments for a review
- `POST /api/comments/review/:reviewId` - Add a comment to a review
- `PUT /api/comments/:id` - Update a comment
- `DELETE /api/comments/:id` - Delete a comment
- `POST /api/comments/:id/helpful` - Mark comment as helpful

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/role` - Update user role (admin only)
- `POST /api/admin/remedies` - Create new remedy (admin only)
- `POST /api/admin/sources` - Create new source (admin only)
- `GET /api/admin/symptoms` - Get unique symptoms (admin only)

## 🔍 Core Algorithm

The heart of ZenCure is its remedy querying algorithm, which calculates relevance scores based on:

1. **Symptom Matching**: How well the remedy addresses the queried symptoms
2. **Source Credibility**: Quality of scientific evidence supporting the remedy
3. **User Ratings**: Community feedback on effectiveness
4. **Recency**: Prioritizes newer and updated information

```typescript
// Simplified version of the algorithm
const scoredRemedies = matchingRemedies.map(remedy => {
  // Base score from average rating (0-50 points)
  let relevanceScore = remedy.avgRating * 10;
  
  // Add points for matching symptoms (0-10 points per symptom)
  remedy.symptoms.forEach(symptom => {
    if (keywords.includes(symptom.name)) {
      relevanceScore += symptom.relevanceScore / 10;
    }
  });
  
  // Add points for source credibility (0-20 points)
  const avgCredibility = getAverageCredibility(remedy.sourceIds);
  relevanceScore += avgCredibility * 2;
  
  // Add points for recency (0-10 points)
  const ageInDays = calculateAgeInDays(remedy.createdAt);
  const recencyScore = Math.max(0, 10 - (ageInDays / 30));
  relevanceScore += recencyScore;
  
  return {
    ...remedy,
    calculatedRelevanceScore: relevanceScore
  };
});
```

## 🌟 Roadmap & Areas for Improvement

### Immediate Enhancements
- Add unit and integration tests for backend and frontend
- Implement CI/CD pipeline with GitHub Actions
- Enhance error handling and validation
- Optimize MongoDB queries with proper indexing

### Feature Roadmap
- **Advanced Search Filters**: Filter by categories, verified status
- **Remedy Interaction Checker**: Alert users to potential interactions
- **Localization**: Support for multiple languages
- **Offline Mode**: Cache essential data for offline use
- **Push Notifications**: Alert users about review responses and remedy updates
- **Visual Symptom Mapper**: Interactive body map for symptom selection
- **AI Recommendations**: Personalized remedy suggestions based on profile

### Technical Improvements
- Implement GraphQL for more efficient data fetching
- Integrate a LargeLanguageModel for the tokenization of natural language
- Enhance security with rate limiting
- Implement WebSockets for real-time comment updates

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Health information is provided for educational purposes only
- Always consult healthcare professionals before trying natural remedies
- Scientific sources are evaluated but not independently verified by ZenCure

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
