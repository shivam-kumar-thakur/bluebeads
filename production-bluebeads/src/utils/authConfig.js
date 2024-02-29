// Import the Firebase Admin SDK
import admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.cert({

      })
});

// Export the initialized Firebase Admin SDK instance
export { admin };
