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
- End-to-End Testing
  - Automated UI tests with Playwright
  - CI/CD integration
  - Firebase Emulator support

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

## Testing

### End-to-End Tests

The project uses Playwright for end-to-end testing. Tests are automatically run in CI/CD, but you can also run them locally:

1. Install Playwright browsers:
```bash
npx playwright install
```

2. Run tests:
```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/authCreateAccount.spec.ts
```

3. View test reports:
```bash
npx playwright show-report
```

### Test Environment

- Tests use Firebase Emulator for authentication
- The test environment is configured to run in isolation
- CI/CD automatically sets up the test environment

### Writing Tests

Tests are located in the `tests` directory. Follow these guidelines:
- Use data-testid attributes for reliable element selection
- Handle asynchronous operations properly
- Write tests that are independent and idempotent

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
   - Builds the application
   - Runs tests (including E2E tests)
   - Creates Docker container
   - Pushes to ACR
   - Deploys to AKS

### Monitoring Deployments

1. GitHub Actions:
   - Check workflow status in Actions tab
   - View test reports in artifacts
   - Monitor deployment steps

2. Deployment Issues:
   - Verify GitHub secrets are correctly set
   - Check pod logs: `kubectl logs -n workout-motivator <pod-name>`
   - Verify ACR credentials: `kubectl get secret acr-secret -n workout-motivator`

## Available Scripts

- `npm start` - Start development server
- `npm run start:testenv` - Start with Firebase Emulator support
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

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
