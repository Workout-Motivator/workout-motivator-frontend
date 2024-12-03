# Workout Motivator Frontend

A React TypeScript application for fitness tracking and partner accountability. This web application helps users stay motivated in their fitness journey by connecting them with workout partners and providing real-time communication.

## Features

- User Authentication with Firebase
- Real-time Chat with Workout Partners
  - Persistent chat history
  - Automatic chat partner selection
  - Real-time message updates
- Exercise Management
  - Categorized exercise browser
  - Advanced search and filtering
  - Pagination support
  - Exercise difficulty levels
- Partner Management
  - Partner request system
  - Partner status tracking
  - Direct chat access
- Responsive Material-UI Design
  - Mobile-first approach
  - Dark theme support
  - Modern UI components

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account and project setup
- Docker (for containerization)
- Azure subscription (for deployment)

## Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd workout-motivator-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Copy `src/firebase.template.ts` to `src/firebase.ts` and configure your Firebase settings:
```bash
cp src/firebase.template.ts src/firebase.ts
```

4. Create a `.env` file with your Firebase configuration:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

5. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Production Deployment

The application is deployed to Azure Kubernetes Service (AKS) using GitHub Actions for CI/CD.

### Prerequisites for Deployment

1. Azure Resources:
   - Azure Kubernetes Service (AKS) cluster
   - Azure Container Registry (ACR)
   - Service Principal with appropriate permissions

2. GitHub Repository Secrets:
   ```
   AZURE_CREDENTIALS
   AZURE_CONTAINER_REGISTRY_SERVER
   AZURE_CONTAINER_REGISTRY_USERNAME
   AZURE_CONTAINER_REGISTRY_PASSWORD
   REACT_APP_FIREBASE_API_KEY
   REACT_APP_FIREBASE_AUTH_DOMAIN
   REACT_APP_FIREBASE_PROJECT_ID
   REACT_APP_FIREBASE_STORAGE_BUCKET
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID
   REACT_APP_FIREBASE_APP_ID
   REACT_APP_FIREBASE_MEASUREMENT_ID
   ```

### Deployment Process

1. Push to main branch triggers automatic deployment
2. GitHub Actions workflow:
   - Builds Docker image
   - Pushes to Azure Container Registry
   - Deploys to AKS
   - Creates necessary Kubernetes secrets

### Manual Deployment

1. Build Docker image:
```bash
docker build -t your-acr.azurecr.io/workout-motivator-frontend:latest .
```

2. Push to ACR:
```bash
docker push your-acr.azurecr.io/workout-motivator-frontend:latest
```

3. Apply Kubernetes configurations:
```bash
kubectl apply -f kubernetes/deployment.yml
kubectl apply -f kubernetes/service.yml
```

## Project Structure

```
├── src/                # Source code
│   ├── components/     # React components
│   ├── context/       # React context providers
│   ├── firebase/      # Firebase configuration
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── kubernetes/        # Kubernetes configuration files
├── .github/          # GitHub Actions workflows
└── Dockerfile        # Multi-stage Docker build
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
- Docker
- Azure Kubernetes Service
- GitHub Actions
- Nginx (production server)

## Development Guidelines

1. Follow TypeScript type system
2. Use functional components with hooks
3. Implement error boundaries
4. Write meaningful commit messages
5. Format code using Prettier
6. Test locally before pushing

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Google Sign-in)
3. Set up Firestore database
4. Configure security rules
5. Add authorized domains in Firebase Console
6. Copy configuration to environment variables

## Troubleshooting

### Common Issues

1. Firebase Authentication Domain:
   - Add your application's domain/IP to Firebase Console -> Authentication -> Settings -> Authorized domains

2. Deployment Issues:
   - Verify GitHub secrets are correctly set
   - Check pod logs: `kubectl logs -n workout-motivator <pod-name>`
   - Verify ACR credentials: `kubectl get secret acr-secret -n workout-motivator`
