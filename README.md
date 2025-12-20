# TalkBridge (Backend)

## Project Goal
TalkBridge is a web platform designed to help users find native speakers of foreign languages for communication practice. The platform allows users to choose suitable language partners based on selected criteria (language, proficiency level, rating, country, etc.) and communicate with them in real time.

## Core Idea
The platform combines features of a social network and a language partner matching service.

Users can:
* create a personal profile with languages, proficiency levels, and interests;
* browse other users' profiles;
* search and filter users by language, level, rating, and country;
* view ratings and reviews of other users;
* communicate in real time using a chat system powered by WebSockets.

## Main Features

### 1. User Registration & Authentication
* user sign-up and login;
* profile editing;
* authentication using OAuth2 / JWT.

### 2. User Feed
* browsing a feed of available users;
* filtering and searching by language, level, rating, country, etc.;
* displaying short user information, ratings, and reviews.

### 3. Rating & Review System
* users can leave a rating and short review after communication;
* calculation of an average user rating.

### 4. Real-Time Chat
* real-time messaging using WebSocket;
* online/offline user status;
* chat history stored in the database.

### 5. Admin Panel (Optional)
* user management;
* moderation of profiles and reviews.

## Tech Stack
* **Backend:** NestJS
* **Frontend:** React
* **Database:** PostgreSQL
* **Authentication:** OAuth2 / JWT
* **Real-time communication:** WebSocket

## Repositories
* **Backend:** [git@github.com:petriv-viktoriia/TalkBridge.git](https://github.com/petriv-viktoriia/TalkBridge)
* **Frontend:** [git@github.com:petriv-viktoriia/frontend.git](https://github.com/petriv-viktoriia/frontend)

## Getting Started (Backend)

### Prerequisites
Make sure you have installed:
* Node.js (v18+ recommended)
* npm
* PostgreSQL

### Installation
Clone the repository:
```bash
git clone git@github.com:petriv-viktoriia/TalkBridge.git
cd TalkBridge
```

Install dependencies:
```bash
npm install
```

### Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=talkbridge
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
JWT_SECRET=your-jwt-secret
PORT=3000
```

Adjust values according to your local or production environment.

### Running the Application
Start the development server:
```bash
npm run start:dev
```

Start the production build:
```bash
npm run build
npm run start:prod
```

The API will be available at:
```
http://localhost:3000
```

### WebSocket
The WebSocket server is used for real-time chat functionality and user online status updates.
