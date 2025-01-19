import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FirebaseAppProvider, FirestoreProvider, useFirebaseApp, AuthProvider } from "reactfire";

import React from "react";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

type ProviderProps = {
  children: React.ReactNode;
};

export function FirebaseProviders({ children }: ProviderProps) {
  console.log(firebaseConfig);
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Wrappers>{children}</Wrappers>
    </FirebaseAppProvider>
  );
}

function Wrappers({ children }: ProviderProps) {
  const app = useFirebaseApp();
  const firestoreInstance = getFirestore(app);
  const auth = getAuth(app);

  return (
    <AuthProvider sdk={auth}>
      <FirestoreProvider sdk={firestoreInstance}>{children}</FirestoreProvider>
    </AuthProvider>
  );
}
