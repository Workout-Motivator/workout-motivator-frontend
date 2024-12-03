FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Add build-time variables
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_AUTH_DOMAIN
ARG REACT_APP_FIREBASE_PROJECT_ID
ARG REACT_APP_FIREBASE_STORAGE_BUCKET
ARG REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ARG REACT_APP_FIREBASE_APP_ID
ARG REACT_APP_FIREBASE_MEASUREMENT_ID
ARG REACT_APP_BACKEND_URL

# Create Firebase config file
RUN echo "import { initializeApp } from 'firebase/app';" > src/firebase.ts && \
    echo "import { getAuth, GoogleAuthProvider } from 'firebase/auth';" >> src/firebase.ts && \
    echo "import { getFirestore } from 'firebase/firestore';" >> src/firebase.ts && \
    echo "" >> src/firebase.ts && \
    echo "const firebaseConfig = {" >> src/firebase.ts && \
    echo "  apiKey: '${REACT_APP_FIREBASE_API_KEY}'," >> src/firebase.ts && \
    echo "  authDomain: '${REACT_APP_FIREBASE_AUTH_DOMAIN}'," >> src/firebase.ts && \
    echo "  projectId: '${REACT_APP_FIREBASE_PROJECT_ID}'," >> src/firebase.ts && \
    echo "  storageBucket: '${REACT_APP_FIREBASE_STORAGE_BUCKET}'," >> src/firebase.ts && \
    echo "  messagingSenderId: '${REACT_APP_FIREBASE_MESSAGING_SENDER_ID}'," >> src/firebase.ts && \
    echo "  appId: '${REACT_APP_FIREBASE_APP_ID}'," >> src/firebase.ts && \
    echo "  measurementId: '${REACT_APP_FIREBASE_MEASUREMENT_ID}'" >> src/firebase.ts && \
    echo "};" >> src/firebase.ts && \
    echo "" >> src/firebase.ts && \
    echo "const app = initializeApp(firebaseConfig);" >> src/firebase.ts && \
    echo "export const auth = getAuth(app);" >> src/firebase.ts && \
    echo "export const db = getFirestore(app);" >> src/firebase.ts && \
    echo "export const googleProvider = new GoogleAuthProvider();" >> src/firebase.ts

# Set environment variables
ENV REACT_APP_FIREBASE_API_KEY=$REACT_APP_FIREBASE_API_KEY
ENV REACT_APP_FIREBASE_AUTH_DOMAIN=$REACT_APP_FIREBASE_AUTH_DOMAIN
ENV REACT_APP_FIREBASE_PROJECT_ID=$REACT_APP_FIREBASE_PROJECT_ID
ENV REACT_APP_FIREBASE_STORAGE_BUCKET=$REACT_APP_FIREBASE_STORAGE_BUCKET
ENV REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ENV REACT_APP_FIREBASE_APP_ID=$REACT_APP_FIREBASE_APP_ID
ENV REACT_APP_FIREBASE_MEASUREMENT_ID=$REACT_APP_FIREBASE_MEASUREMENT_ID
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]