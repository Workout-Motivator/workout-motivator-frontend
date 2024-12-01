# Workout Motivator Frontend

A React TypeScript application for fitness tracking and partner accountability. This web application helps users stay motivated in their fitness journey by connecting them with workout partners and providing real-time communication.

## Features

- User Authentication with Firebase
- Real-time Chat with Workout Partners
- Workout Planning and Tracking
- Partner Matching System
- Responsive Material-UI Design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account and project setup

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd workout-motivator/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the frontend directory with your Firebase configuration:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # React components
├── context/            # React context providers
├── firebase/           # Firebase configuration
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx            # Main application component
```

## Available Scripts

- `npm start`: Run the development server
- `npm build`: Build the production application
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Technologies

- React 18
- TypeScript
- Firebase (Authentication, Firestore)
- Material-UI
- React Router
- Context API for state management

## Development Guidelines

1. Follow the TypeScript type system
2. Use functional components with hooks
3. Implement error boundaries for error handling
4. Write meaningful commit messages
5. Format code using Prettier before committing

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Set up Firestore database
4. Configure security rules
5. Add web app to your project
6. Copy configuration to `.env` file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[MIT License](LICENSE)
